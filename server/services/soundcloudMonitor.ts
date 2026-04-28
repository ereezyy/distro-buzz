import axios from "axios";
import { eq, isNotNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import * as db from "../db";
import { artists, tracks } from "../../drizzle/schema";
import logger from "../utils/logger";

const SOUNDCLOUD_API_BASE = "https://api-v2.soundcloud.com";
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID || "";

interface SoundCloudTrack {
  id: number;
  title: string;
  description: string;
  duration: number;
  created_at: string;
  artwork_url: string;
  permalink_url: string;
  stream_url?: string;
  user: {
    id: number;
    username: string;
  };
}

interface SoundCloudUser {
  id: number;
  username: string;
  avatar_url: string;
  permalink_url: string;
}

/**
 * SoundCloud Monitor Service
 *
 * Polls SoundCloud profiles for new tracks and triggers distribution.
 * This is the entry point for the entire distribution pipeline:
 *   SoundCloud detect -> Track create -> Distribution jobs queued
 */
export class SoundCloudMonitor {
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private pollingIntervalMs: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Start monitoring SoundCloud profiles
   */
  async start(intervalMs: number = 5 * 60 * 1000): Promise<void> {
    this.pollingIntervalMs = intervalMs;
    this.isRunning = true;
    logger.info(`[SoundCloud Monitor] Starting with ${intervalMs / 1000}s interval`);

    // Run immediately, then schedule next
    await this.runPollCycle();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
    logger.info("[SoundCloud Monitor] Stopped");
  }

  /**
   * Run one poll cycle then schedule the next
   */
  private async runPollCycle(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.poll();
    } catch (error) {
      logger.error("[SoundCloud Monitor] Poll cycle error:", error);
    }

    // Schedule next poll
    if (this.isRunning) {
      this.pollingTimer = setTimeout(() => {
        this.runPollCycle();
      }, this.pollingIntervalMs);
    }
  }

  /**
   * Poll all connected artists for new tracks
   */
  private async poll(): Promise<void> {
    logger.info("[SoundCloud Monitor] Polling for new tracks...");

    const database = await getDb();
    if (!database) {
      logger.warn("[SoundCloud Monitor] Database not available");
      return;
    }

    // Get all artists with SoundCloud configured
    const connectedArtists = await database
      .select()
      .from(artists)
      .where(isNotNull(artists.soundcloudUserId));

    if (connectedArtists.length === 0) {
      logger.info("[SoundCloud Monitor] No artists with SoundCloud configured");
      return;
    }

    logger.info(`[SoundCloud Monitor] Checking ${connectedArtists.length} artist(s)`);

    for (const artist of connectedArtists) {
      await this.checkArtistTracks(artist);
    }
  }

  /**
   * Check a specific artist for new tracks on SoundCloud
   */
  private async checkArtistTracks(artist: any): Promise<void> {
    if (!artist.soundcloudUserId) return;

    try {
      logger.info(`[SoundCloud Monitor] Checking artist: ${artist.name}`);

      const scTracks = await this.fetchUserTracks(artist.soundcloudUserId);
      if (!scTracks || scTracks.length === 0) {
        logger.info(`[SoundCloud Monitor] No tracks found for ${artist.name}`);
        return;
      }

      for (const scTrack of scTracks) {
        await this.processTrack(artist, scTrack);
      }
    } catch (error) {
      logger.error(`[SoundCloud Monitor] Error checking artist ${artist.name}:`, error);
    }
  }

  /**
   * Process a single SoundCloud track — create in DB if new, queue distribution
   */
  private async processTrack(artist: any, scTrack: SoundCloudTrack): Promise<void> {
    const database = await getDb();
    if (!database) return;

    try {
      // Check if track already exists
      const existing = await database
        .select()
        .from(tracks)
        .where(eq(tracks.soundcloudTrackId, scTrack.id.toString()))
        .limit(1);

      if (existing.length > 0) {
        return; // Already tracked
      }

      logger.info(`[SoundCloud Monitor] New track detected: "${scTrack.title}"`);

      // Create track in database
      const track = await db.createTrack({
        id: uuidv4(),
        artistId: artist.id,
        soundcloudTrackId: scTrack.id.toString(),
        title: scTrack.title,
        description: scTrack.description || "",
        durationMs: scTrack.duration,
        releaseDate: new Date(scTrack.created_at),
        artworkUrl: scTrack.artwork_url,
        audioUrl: scTrack.stream_url || scTrack.permalink_url,
        distributionConfig: {
          platforms: (artist.distributionPreferences as any)?.platforms || [],
          autoPublish: (artist.distributionPreferences as any)?.autoPublish !== false,
        },
        distributionStatus: {
          overall: "queued",
          platforms: {},
        },
      });

      if (!track) {
        logger.error(`[SoundCloud Monitor] Failed to create track: ${scTrack.title}`);
        return;
      }

      logger.info(`[SoundCloud Monitor] Track created: ${track.id}`);

      // Auto-queue distribution jobs if enabled
      const prefs = artist.distributionPreferences as any;
      if (prefs?.autoPublish !== false) {
        const targetPlatforms: string[] = prefs?.platforms || [];
        let jobCount = 0;

        for (const platformId of targetPlatforms) {
          const job = await db.createDistributionJob({
            id: uuidv4(),
            trackId: track.id,
            platformId,
            status: "queued",
            retryCount: 0,
            maxRetries: 7,
          });

          if (job) jobCount++;
        }

        logger.info(
          `[SoundCloud Monitor] Queued ${jobCount} distribution job(s) for "${scTrack.title}"`
        );
      }
    } catch (error) {
      logger.error(`[SoundCloud Monitor] Error processing track "${scTrack.title}":`, error);
    }
  }

  /**
   * Fetch a user's tracks from SoundCloud API v2
   */
  private async fetchUserTracks(userId: string): Promise<SoundCloudTrack[]> {
    try {
      const response = await axios.get(
        `${SOUNDCLOUD_API_BASE}/users/${userId}/tracks`,
        {
          params: {
            client_id: SOUNDCLOUD_CLIENT_ID,
            limit: 50,
            offset: 0,
          },
          timeout: 15000,
        }
      );

      return response.data?.collection || response.data || [];
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.warn(`[SoundCloud Monitor] Auth failed for user ${userId} — client_id may be invalid`);
      } else {
        logger.error(`[SoundCloud Monitor] Failed to fetch tracks for user ${userId}:`, error.message);
      }
      return [];
    }
  }

  /**
   * Resolve a SoundCloud username to user info
   */
  async resolveUser(username: string): Promise<SoundCloudUser | null> {
    try {
      const response = await axios.get(`${SOUNDCLOUD_API_BASE}/resolve`, {
        params: {
          client_id: SOUNDCLOUD_CLIENT_ID,
          url: `https://soundcloud.com/${username}`,
        },
        timeout: 10000,
      });

      return response.data || null;
    } catch (error: any) {
      logger.error(`[SoundCloud Monitor] Failed to resolve user "${username}":`, error.message);
      return null;
    }
  }
}

// Export singleton
export const soundCloudMonitor = new SoundCloudMonitor();
