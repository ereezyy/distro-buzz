import type {
  PlatformAdapter,
  DistributionResult,
  PlatformHealth,
} from "../distributionEngine";
import type { DistributionJob } from "../../../drizzle/schema";
import logger from "../../utils/logger";

/**
 * Creates a stub adapter for platforms that require aggregator distribution.
 *
 * These platforms (Spotify, Apple Music, Amazon Music, Tidal, Deezer, etc.)
 * do not allow direct uploads — they require going through a licensed
 * distributor/aggregator like DistroKid, TuneCore, CD Baby, etc.
 *
 * The stub adapter:
 *   1. Checks if the artist has a linked aggregator account
 *   2. If yes, delegates to the aggregator's API
 *   3. If no, returns a clear error explaining what's needed
 *
 * This is intentional — we're honest about what requires an aggregator
 * rather than pretending we can upload directly.
 */
function createAggregatorStub(config: {
  id: string;
  name: string;
  requiresAggregator: boolean;
  aggregatorNote: string;
  healthUrl: string;
}): PlatformAdapter {
  return {
    id: config.id,
    name: config.name,

    async distribute(
      job: DistributionJob,
      track: any,
      artist: any
    ): Promise<DistributionResult> {
      logger.info(`[${config.name}] Distribution requested for: ${track.title}`);

      if (config.requiresAggregator) {
        // Check if artist has an aggregator linked
        const prefs = artist.distributionPreferences as any;
        const aggregator = prefs?.aggregator;

        if (aggregator?.provider && aggregator?.apiKey) {
          // Delegate to aggregator
          logger.info(
            `[${config.name}] Delegating to aggregator: ${aggregator.provider}`
          );

          // TODO: Implement actual aggregator API calls
          // Each aggregator (DistroKid, TuneCore, CD Baby) has its own API
          // For now, we queue it and mark as pending aggregator processing

          return {
            success: false,
            error: `Aggregator integration for ${aggregator.provider} is pending implementation`,
            details: {
              aggregator: aggregator.provider,
              action: "aggregator_pending",
              platform: config.id,
            },
          };
        }

        return {
          success: false,
          error: config.aggregatorNote,
          details: {
            action: "aggregator_required",
            platform: config.id,
            supportedAggregators: [
              "distrokid",
              "tunecore",
              "cdbaby",
              "amuse",
              "ditto",
              "onerpm",
              "routenote",
            ],
          },
        };
      }

      return {
        success: false,
        error: `${config.name} adapter not yet implemented`,
      };
    },

    async healthCheck(): Promise<PlatformHealth> {
      try {
        const start = Date.now();
        const axios = (await import("axios")).default;
        const response = await axios.get(config.healthUrl, {
          timeout: 5000,
          validateStatus: () => true,
        });

        const latencyMs = Date.now() - start;
        return {
          status: response.status < 500 ? "healthy" : "degraded",
          latencyMs,
        };
      } catch (error: any) {
        return { status: "down", message: error.message };
      }
    },
  };
}

// ============================================================================
// STREAMING PLATFORMS (require aggregator)
// ============================================================================

export const spotifyAdapter = createAggregatorStub({
  id: "spotify",
  name: "Spotify",
  requiresAggregator: true,
  aggregatorNote:
    "Spotify requires distribution through a licensed aggregator (DistroKid, TuneCore, CD Baby, etc.). Link your aggregator account in Settings.",
  healthUrl: "https://open.spotify.com",
});

export const appleMusicAdapter = createAggregatorStub({
  id: "apple_music",
  name: "Apple Music",
  requiresAggregator: true,
  aggregatorNote:
    "Apple Music requires distribution through a licensed aggregator. Link your aggregator account in Settings.",
  healthUrl: "https://music.apple.com",
});

export const amazonMusicAdapter = createAggregatorStub({
  id: "amazon_music",
  name: "Amazon Music",
  requiresAggregator: true,
  aggregatorNote:
    "Amazon Music requires distribution through a licensed aggregator. Link your aggregator account in Settings.",
  healthUrl: "https://music.amazon.com",
});

export const tidalAdapter = createAggregatorStub({
  id: "tidal",
  name: "Tidal",
  requiresAggregator: true,
  aggregatorNote:
    "Tidal requires distribution through a licensed aggregator. Link your aggregator account in Settings.",
  healthUrl: "https://tidal.com",
});

export const deezerAdapter = createAggregatorStub({
  id: "deezer",
  name: "Deezer",
  requiresAggregator: true,
  aggregatorNote:
    "Deezer requires distribution through a licensed aggregator. Link your aggregator account in Settings.",
  healthUrl: "https://www.deezer.com",
});

export const youtubeMusicAdapter = createAggregatorStub({
  id: "youtube_music",
  name: "YouTube Music",
  requiresAggregator: true,
  aggregatorNote:
    "YouTube Music (audio-only) requires distribution through a licensed aggregator. For YouTube video uploads, use the YouTube adapter instead.",
  healthUrl: "https://music.youtube.com",
});

// ============================================================================
// SOCIAL / VIDEO PLATFORMS
// ============================================================================

export const tiktokAdapter = createAggregatorStub({
  id: "tiktok",
  name: "TikTok",
  requiresAggregator: false,
  aggregatorNote: "",
  healthUrl: "https://www.tiktok.com",
});

export const instagramAdapter = createAggregatorStub({
  id: "instagram",
  name: "Instagram Reels",
  requiresAggregator: false,
  aggregatorNote: "",
  healthUrl: "https://www.instagram.com",
});

// ============================================================================
// NICHE / SECONDARY PLATFORMS
// ============================================================================

export const beatportAdapter = createAggregatorStub({
  id: "beatport",
  name: "Beatport",
  requiresAggregator: true,
  aggregatorNote:
    "Beatport requires distribution through a licensed aggregator that supports electronic music distribution.",
  healthUrl: "https://www.beatport.com",
});

export const traxsourceAdapter = createAggregatorStub({
  id: "traxsource",
  name: "Traxsource",
  requiresAggregator: true,
  aggregatorNote:
    "Traxsource requires distribution through a licensed aggregator.",
  healthUrl: "https://www.traxsource.com",
});

export const audiomackAdapter = createAggregatorStub({
  id: "audiomack",
  name: "Audiomack",
  requiresAggregator: false,
  aggregatorNote: "",
  healthUrl: "https://audiomack.com",
});

export const patreonAdapter = createAggregatorStub({
  id: "patreon",
  name: "Patreon",
  requiresAggregator: false,
  aggregatorNote: "",
  healthUrl: "https://www.patreon.com",
});

// ============================================================================
// ALL ADAPTERS EXPORT
// ============================================================================

export const allAggregatorAdapters = [
  spotifyAdapter,
  appleMusicAdapter,
  amazonMusicAdapter,
  tidalAdapter,
  deezerAdapter,
  youtubeMusicAdapter,
  tiktokAdapter,
  instagramAdapter,
  beatportAdapter,
  traxsourceAdapter,
  audiomackAdapter,
  patreonAdapter,
];
