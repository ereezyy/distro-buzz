import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import logger from "../utils/logger";
import type { DistributionJob } from "../../drizzle/schema";

// ============================================================================
// TYPES
// ============================================================================

export interface PlatformAdapter {
  id: string;
  name: string;
  /** Attempt to distribute a track to this platform */
  distribute(job: DistributionJob, track: any, artist: any): Promise<DistributionResult>;
  /** Check if this adapter is healthy / reachable */
  healthCheck(): Promise<PlatformHealth>;
}

export interface DistributionResult {
  success: boolean;
  platformTrackId?: string;
  platformUrl?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface PlatformHealth {
  status: "healthy" | "degraded" | "down";
  latencyMs?: number;
  message?: string;
}

// ============================================================================
// JOB QUEUE (in-process, no external dependency)
// ============================================================================

interface QueuedJob {
  jobId: string;
  priority: number;
  scheduledAt: number;
}

/**
 * Distribution Engine
 *
 * Processes distribution jobs with retry logic, exponential backoff,
 * and a fallback chain (direct API -> aggregator -> manual queue).
 *
 * Uses an in-process priority queue. For production scale, swap this
 * for BullMQ/Redis, but this works for single-instance deployments.
 */
export class DistributionEngine {
  private adapters: Map<string, PlatformAdapter> = new Map();
  private queue: QueuedJob[] = [];
  private isProcessing = false;
  private processingTimer: ReturnType<typeof setTimeout> | null = null;
  private concurrency = 3;
  private activeJobs = 0;

  // Exponential backoff config
  private baseRetryDelayMs = 30_000; // 30 seconds
  private maxRetryDelayMs = 3_600_000; // 1 hour

  /**
   * Register a platform adapter
   */
  registerAdapter(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.id, adapter);
    logger.info(`[Distribution Engine] Registered adapter: ${adapter.name} (${adapter.id})`);
  }

  /**
   * Get all registered adapters
   */
  getAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Start the engine — begins processing queued jobs
   */
  async start(): Promise<void> {
    logger.info("[Distribution Engine] Starting...");
    this.isProcessing = true;

    // Load any queued/retrying jobs from DB
    await this.loadPendingJobs();

    // Start processing loop
    this.processLoop();
  }

  /**
   * Stop the engine gracefully
   */
  stop(): void {
    this.isProcessing = false;
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    logger.info("[Distribution Engine] Stopped");
  }

  /**
   * Enqueue a distribution job
   */
  async enqueue(jobId: string, priority: number = 50): Promise<void> {
    this.queue.push({
      jobId,
      priority,
      scheduledAt: Date.now(),
    });

    // Sort by priority (higher = first) then by scheduled time
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.scheduledAt - b.scheduledAt;
    });

    logger.debug(`[Distribution Engine] Enqueued job ${jobId} (priority: ${priority})`);
  }

  /**
   * Load pending jobs from database on startup
   */
  private async loadPendingJobs(): Promise<void> {
    const queuedJobs = await db.getDistributionJobsByStatus("queued");
    const retryingJobs = await db.getDistributionJobsByStatus("retrying");

    const allPending = [...queuedJobs, ...retryingJobs];

    for (const job of allPending) {
      // Skip jobs scheduled for later
      if (job.nextRetryAt && new Date(job.nextRetryAt).getTime() > Date.now()) {
        const delay = new Date(job.nextRetryAt).getTime() - Date.now();
        setTimeout(() => this.enqueue(job.id), delay);
        continue;
      }

      await this.enqueue(job.id);
    }

    logger.info(`[Distribution Engine] Loaded ${allPending.length} pending job(s)`);
  }

  /**
   * Main processing loop
   */
  private processLoop(): void {
    if (!this.isProcessing) return;

    // Process jobs up to concurrency limit
    while (this.activeJobs < this.concurrency && this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) break;

      // Only process if scheduled time has passed
      if (next.scheduledAt > Date.now()) {
        this.queue.unshift(next); // Put it back
        break;
      }

      this.activeJobs++;
      this.processJob(next.jobId)
        .catch((error) => {
          logger.error(`[Distribution Engine] Unhandled error processing job ${next.jobId}:`, error);
        })
        .finally(() => {
          this.activeJobs--;
        });
    }

    // Schedule next check
    this.processingTimer = setTimeout(() => this.processLoop(), 2000);
  }

  /**
   * Process a single distribution job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = await db.getDistributionJobById(jobId);
    if (!job) {
      logger.warn(`[Distribution Engine] Job ${jobId} not found`);
      return;
    }

    const track = await db.getTrackById(job.trackId);
    if (!track) {
      logger.error(`[Distribution Engine] Track ${job.trackId} not found for job ${jobId}`);
      await this.failJob(job, "Track not found");
      return;
    }

    const artist = await db.getArtistById(track.artistId);
    if (!artist) {
      logger.error(`[Distribution Engine] Artist not found for track ${track.id}`);
      await this.failJob(job, "Artist not found");
      return;
    }

    // Mark as processing
    await db.updateDistributionJob(jobId, {
      status: "processing",
      startedAt: new Date(),
    });

    await this.logJobEvent(jobId, "processing", "success", "Job processing started");

    // Try direct adapter first
    const adapter = this.adapters.get(job.platformId);
    if (adapter) {
      const result = await this.tryAdapter(adapter, job, track, artist);
      if (result.success) {
        await this.completeJob(job, result);
        return;
      }

      logger.warn(
        `[Distribution Engine] Direct adapter failed for ${job.platformId}: ${result.error}`
      );
      await this.logJobEvent(jobId, "direct_failed", "failure", result.error || "Direct adapter failed");
    } else {
      await this.logJobEvent(jobId, "no_adapter", "pending", `No direct adapter for ${job.platformId}`);
    }

    // Try aggregator fallback
    if (job.aggregatorId) {
      const aggregatorAdapter = this.adapters.get(job.aggregatorId);
      if (aggregatorAdapter) {
        const result = await this.tryAdapter(aggregatorAdapter, job, track, artist);
        if (result.success) {
          await this.completeJob(job, result);
          return;
        }

        await this.logJobEvent(jobId, "aggregator_failed", "failure", result.error || "Aggregator failed");
      }
    }

    // Retry or fail
    const retryCount = (job.retryCount || 0) + 1;
    const maxRetries = job.maxRetries || 7;

    if (retryCount <= maxRetries) {
      const delay = this.calculateBackoff(retryCount);
      const nextRetryAt = new Date(Date.now() + delay);

      await db.updateDistributionJob(jobId, {
        status: "retrying",
        retryCount,
        nextRetryAt,
        errorMessage: `Retry ${retryCount}/${maxRetries} scheduled`,
      });

      await this.logJobEvent(
        jobId,
        "retry_scheduled",
        "pending",
        `Retry ${retryCount}/${maxRetries} in ${Math.round(delay / 1000)}s`
      );

      // Schedule retry
      setTimeout(() => this.enqueue(jobId), delay);
    } else {
      await this.failJob(job, `Exhausted all ${maxRetries} retries`);
    }
  }

  /**
   * Try a specific adapter
   */
  private async tryAdapter(
    adapter: PlatformAdapter,
    job: DistributionJob,
    track: any,
    artist: any
  ): Promise<DistributionResult> {
    try {
      return await adapter.distribute(job, track, artist);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Adapter threw an exception",
      };
    }
  }

  /**
   * Mark a job as completed successfully
   */
  private async completeJob(job: DistributionJob, result: DistributionResult): Promise<void> {
    await db.updateDistributionJob(job.id, {
      status: "live",
      platformTrackId: result.platformTrackId,
      platformUrl: result.platformUrl,
      completedAt: new Date(),
      platformResponse: result.details,
    });

    await this.logJobEvent(job.id, "completed", "success", `Live on ${job.platformId}`);

    logger.info(
      `[Distribution Engine] Job ${job.id} completed — live on ${job.platformId}`
    );
  }

  /**
   * Mark a job as permanently failed
   */
  private async failJob(job: DistributionJob, reason: string): Promise<void> {
    await db.updateDistributionJob(job.id, {
      status: "failed",
      errorMessage: reason,
      completedAt: new Date(),
    });

    await this.logJobEvent(job.id, "failed", "failure", reason);

    logger.error(`[Distribution Engine] Job ${job.id} failed permanently: ${reason}`);
  }

  /**
   * Log a distribution event
   */
  private async logJobEvent(
    jobId: string,
    action: string,
    status: "success" | "failure" | "pending",
    message: string
  ): Promise<void> {
    await db.createDistributionLog({
      id: uuidv4(),
      jobId,
      action,
      status,
      message,
    });
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(retryCount: number): number {
    const delay = this.baseRetryDelayMs * Math.pow(2, retryCount - 1);
    // Add jitter (0-25% of delay)
    const jitter = Math.random() * delay * 0.25;
    return Math.min(delay + jitter, this.maxRetryDelayMs);
  }

  /**
   * Run health checks on all registered adapters
   */
  async runHealthChecks(): Promise<Record<string, PlatformHealth>> {
    const results: Record<string, PlatformHealth> = {};

    for (const [id, adapter] of Array.from(this.adapters.entries())) {
      try {
        results[id] = await adapter.healthCheck();
      } catch (error: any) {
        results[id] = {
          status: "down",
          message: error.message || "Health check failed",
        };
      }

      // Update platform registry
      await db.createOrUpdatePlatform({
        id,
        name: adapter.name,
        healthStatus: results[id].status === "healthy" ? "healthy" : results[id].status === "degraded" ? "degraded" : "down",
        lastHealthCheck: new Date(),
      });
    }

    return results;
  }

  /**
   * Get engine stats
   */
  getStats(): {
    queueDepth: number;
    activeJobs: number;
    registeredAdapters: number;
    isRunning: boolean;
  } {
    return {
      queueDepth: this.queue.length,
      activeJobs: this.activeJobs,
      registeredAdapters: this.adapters.size,
      isRunning: this.isProcessing,
    };
  }
}

// Export singleton
export const distributionEngine = new DistributionEngine();
