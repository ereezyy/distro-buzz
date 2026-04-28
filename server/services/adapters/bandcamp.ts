import axios from "axios";
import type {
  PlatformAdapter,
  DistributionResult,
  PlatformHealth,
} from "../distributionEngine";
import type { DistributionJob } from "../../../drizzle/schema";
import logger from "../../utils/logger";

/**
 * Bandcamp Platform Adapter
 *
 * Bandcamp does not have a public upload API. Distribution strategy:
 *   1. If artist has Bandcamp credentials stored, use the internal API
 *      (reverse-engineered from the web app) to create a release
 *   2. If no credentials, queue for manual upload or aggregator fallback
 *
 * This adapter demonstrates the "workaround" integration method —
 * platforms without APIs get automation through browser-level interaction
 * or aggregator passthrough.
 */
export class BandcampAdapter implements PlatformAdapter {
  id = "bandcamp";
  name = "Bandcamp";

  async distribute(
    job: DistributionJob,
    track: any,
    artist: any
  ): Promise<DistributionResult> {
    try {
      logger.info(`[Bandcamp] Starting distribution for track: ${track.title}`);

      // Check if artist has Bandcamp credentials
      const bandcampConfig = (artist.distributionPreferences as any)?.bandcamp;

      if (!bandcampConfig?.sessionCookie) {
        return {
          success: false,
          error:
            "Bandcamp requires manual authentication — connect your Bandcamp account in settings",
          details: {
            action: "manual_auth_required",
            instructions:
              "Log into Bandcamp and provide your session cookie, or use an aggregator like DistroKid",
          },
        };
      }

      // Attempt to create release via Bandcamp's internal API
      const result = await this.createRelease(track, artist, bandcampConfig);
      return result;
    } catch (error: any) {
      logger.error(`[Bandcamp] Distribution error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async healthCheck(): Promise<PlatformHealth> {
    try {
      const start = Date.now();
      const response = await axios.get("https://bandcamp.com", {
        timeout: 5000,
        validateStatus: () => true,
      });

      const latencyMs = Date.now() - start;

      if (response.status === 200) {
        return { status: "healthy", latencyMs };
      } else {
        return {
          status: "degraded",
          latencyMs,
          message: `HTTP ${response.status}`,
        };
      }
    } catch (error: any) {
      return { status: "down", message: error.message };
    }
  }

  /**
   * Create a release on Bandcamp via internal API
   */
  private async createRelease(
    track: any,
    artist: any,
    config: any
  ): Promise<DistributionResult> {
    try {
      // Bandcamp's internal API for creating tracks
      // This is reverse-engineered and may break — that's why we have retry + fallback
      const response = await axios.post(
        `https://${config.subdomain}.bandcamp.com/api/track/1/create`,
        {
          title: track.title,
          about: track.description || "",
          tags: track.genre ? [track.genre] : [],
          release_date: track.releaseDate
            ? new Date(track.releaseDate).toISOString().split("T")[0]
            : undefined,
        },
        {
          headers: {
            Cookie: config.sessionCookie,
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (compatible; DistroBuzz/1.0; +https://distrobuzz.com)",
          },
          timeout: 30000,
        }
      );

      if (response.data?.track_id) {
        // Upload audio file
        if (track.audioUrl) {
          await this.uploadAudio(
            config.subdomain,
            response.data.track_id,
            track.audioUrl,
            config.sessionCookie
          );
        }

        return {
          success: true,
          platformTrackId: response.data.track_id.toString(),
          platformUrl: `https://${config.subdomain}.bandcamp.com/track/${this.slugify(track.title)}`,
          details: {
            bandcampTrackId: response.data.track_id,
            subdomain: config.subdomain,
          },
        };
      }

      return {
        success: false,
        error: "Bandcamp API returned unexpected response",
        details: { response: response.data },
      };
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          error: "Bandcamp session expired — re-authenticate in settings",
        };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload audio file to a Bandcamp track
   */
  private async uploadAudio(
    subdomain: string,
    trackId: number,
    audioUrl: string,
    sessionCookie: string
  ): Promise<void> {
    try {
      // Download audio
      const audioResponse = await axios.get(audioUrl, {
        responseType: "arraybuffer",
        timeout: 120000,
      });

      // Upload to Bandcamp
      const formData = new FormData();
      formData.append("file", new Blob([audioResponse.data]), "track.mp3");
      formData.append("track_id", trackId.toString());

      await axios.post(
        `https://${subdomain}.bandcamp.com/api/track/1/upload`,
        formData,
        {
          headers: {
            Cookie: sessionCookie,
          },
          timeout: 120000,
        }
      );

      logger.info(`[Bandcamp] Audio uploaded for track ${trackId}`);
    } catch (error: any) {
      logger.error(`[Bandcamp] Audio upload failed: ${error.message}`);
      // Non-fatal — track was created, audio can be uploaded manually
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

export const bandcampAdapter = new BandcampAdapter();
