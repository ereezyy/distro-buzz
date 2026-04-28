import axios from "axios";
import type {
  PlatformAdapter,
  DistributionResult,
  PlatformHealth,
} from "../distributionEngine";
import type { DistributionJob } from "../../../drizzle/schema";
import logger from "../../utils/logger";

const WAVEFORGE_API_BASE = process.env.WAVEFORGE_API_URL || "https://api.waveforge.net";
const WAVEFORGE_API_KEY = process.env.WAVEFORGE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

/**
 * YouTube Platform Adapter
 *
 * Pipeline:
 *   1. Send audio to WaveForge API to generate audio-reactive music video
 *   2. Wait for video generation to complete
 *   3. Upload generated video to YouTube via YouTube Data API
 *   4. Set metadata (title, description, tags, thumbnail)
 *
 * Requires:
 *   - WAVEFORGE_API_KEY: API key for waveforge.net
 *   - YOUTUBE_API_KEY: YouTube Data API key
 *   - YouTube OAuth tokens for the artist's channel
 */
export class YouTubeAdapter implements PlatformAdapter {
  id = "youtube";
  name = "YouTube";

  async distribute(
    job: DistributionJob,
    track: any,
    artist: any
  ): Promise<DistributionResult> {
    try {
      logger.info(`[YouTube] Starting distribution for track: ${track.title}`);

      // Step 1: Generate music video via WaveForge
      const videoResult = await this.generateVideo(track);
      if (!videoResult.success) {
        return {
          success: false,
          error: `WaveForge video generation failed: ${videoResult.error}`,
        };
      }

      logger.info(`[YouTube] Video generated: ${videoResult.videoUrl}`);

      // Step 2: Upload to YouTube
      const uploadResult = await this.uploadToYouTube(track, artist, videoResult.videoUrl!);
      if (!uploadResult.success) {
        return {
          success: false,
          error: `YouTube upload failed: ${uploadResult.error}`,
        };
      }

      return {
        success: true,
        platformTrackId: uploadResult.videoId,
        platformUrl: `https://www.youtube.com/watch?v=${uploadResult.videoId}`,
        details: {
          waveforgeJobId: videoResult.jobId,
          youtubeVideoId: uploadResult.videoId,
        },
      };
    } catch (error: any) {
      logger.error(`[YouTube] Distribution error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async healthCheck(): Promise<PlatformHealth> {
    try {
      const start = Date.now();

      // Check WaveForge API
      const wfResponse = await axios.get(`${WAVEFORGE_API_BASE}/health`, {
        timeout: 5000,
        validateStatus: () => true,
      });

      // Check YouTube API
      const ytResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: { part: "id", chart: "mostPopular", maxResults: 1, key: YOUTUBE_API_KEY },
        timeout: 5000,
        validateStatus: () => true,
      });

      const latencyMs = Date.now() - start;
      const wfOk = wfResponse.status < 500;
      const ytOk = ytResponse.status < 500;

      if (wfOk && ytOk) {
        return { status: "healthy", latencyMs };
      } else if (wfOk || ytOk) {
        return {
          status: "degraded",
          latencyMs,
          message: `WaveForge: ${wfOk ? "OK" : "DOWN"}, YouTube: ${ytOk ? "OK" : "DOWN"}`,
        };
      } else {
        return { status: "down", latencyMs, message: "Both APIs unreachable" };
      }
    } catch (error: any) {
      return { status: "down", message: error.message };
    }
  }

  /**
   * Generate audio-reactive music video via WaveForge API
   */
  private async generateVideo(
    track: any
  ): Promise<{ success: boolean; videoUrl?: string; jobId?: string; error?: string }> {
    try {
      if (!WAVEFORGE_API_KEY) {
        return { success: false, error: "WAVEFORGE_API_KEY not configured" };
      }

      // Submit video generation job
      const response = await axios.post(
        `${WAVEFORGE_API_BASE}/v1/videos/generate`,
        {
          audio_url: track.audioUrl,
          title: track.title,
          artwork_url: track.artworkUrl,
          style: "reactive", // audio-reactive visualization
          duration_ms: track.durationMs,
        },
        {
          headers: {
            Authorization: `Bearer ${WAVEFORGE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const jobId = response.data?.job_id;
      if (!jobId) {
        return { success: false, error: "No job ID returned from WaveForge" };
      }

      // Poll for completion (max 10 minutes)
      const videoUrl = await this.pollWaveForgeJob(jobId);
      if (!videoUrl) {
        return { success: false, error: "WaveForge job timed out or failed", jobId };
      }

      return { success: true, videoUrl, jobId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Poll WaveForge for job completion
   */
  private async pollWaveForgeJob(jobId: string): Promise<string | null> {
    const maxAttempts = 60; // 10 minutes at 10s intervals
    const pollInterval = 10000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      try {
        const response = await axios.get(
          `${WAVEFORGE_API_BASE}/v1/videos/status/${jobId}`,
          {
            headers: { Authorization: `Bearer ${WAVEFORGE_API_KEY}` },
            timeout: 10000,
          }
        );

        const status = response.data?.status;
        if (status === "completed") {
          return response.data?.video_url || null;
        } else if (status === "failed") {
          logger.error(`[YouTube] WaveForge job ${jobId} failed: ${response.data?.error}`);
          return null;
        }

        logger.debug(`[YouTube] WaveForge job ${jobId} status: ${status}`);
      } catch (error: any) {
        logger.warn(`[YouTube] WaveForge poll error: ${error.message}`);
      }
    }

    return null; // Timed out
  }

  /**
   * Upload video to YouTube
   */
  private async uploadToYouTube(
    track: any,
    artist: any,
    videoUrl: string
  ): Promise<{ success: boolean; videoId?: string; error?: string }> {
    try {
      if (!YOUTUBE_API_KEY) {
        return { success: false, error: "YOUTUBE_API_KEY not configured" };
      }

      // In a real implementation, this would:
      // 1. Download the video from WaveForge
      // 2. Use YouTube Data API v3 resumable upload
      // 3. Set snippet (title, description, tags, category)
      // 4. Set status (public/unlisted/private)
      //
      // For now, we log the intent and return a placeholder
      // This requires OAuth2 tokens for the artist's YouTube channel

      logger.info(`[YouTube] Would upload video for "${track.title}" by ${artist.name}`);
      logger.info(`[YouTube] Video source: ${videoUrl}`);

      // TODO: Implement actual YouTube upload when OAuth tokens are available
      // This is the integration point — the adapter pattern means we can
      // swap in the real implementation without changing the engine

      return {
        success: false,
        error: "YouTube upload requires OAuth2 tokens — connect your YouTube channel in settings",
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const youtubeAdapter = new YouTubeAdapter();
