import { distributionEngine } from "../distributionEngine";
import { youtubeAdapter } from "./youtube";
import { bandcampAdapter } from "./bandcamp";
import {
  allAggregatorAdapters,
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
} from "./aggregatorStubs";
import * as db from "../../db";
import logger from "../../utils/logger";

/**
 * Register all platform adapters with the distribution engine
 */
export function registerAllAdapters(): void {
  // Direct adapters
  distributionEngine.registerAdapter(youtubeAdapter);
  distributionEngine.registerAdapter(bandcampAdapter);

  // Aggregator-backed adapters
  for (const adapter of allAggregatorAdapters) {
    distributionEngine.registerAdapter(adapter);
  }

  logger.info(
    `[Adapters] Registered ${distributionEngine.getAdapters().length} platform adapters`
  );
}

/**
 * Seed the platform registry database with all supported platforms
 */
export async function seedPlatformRegistry(): Promise<void> {
  const platforms = [
    {
      id: "youtube",
      name: "YouTube",
      category: "social" as const,
      integrationMethod: "direct_api" as const,
      apiEndpoint: "https://www.googleapis.com/youtube/v3",
      apiDocsUrl: "https://developers.google.com/youtube/v3",
      priority: 90,
      estimatedTimeToLive: "1-4 hours",
    },
    {
      id: "bandcamp",
      name: "Bandcamp",
      category: "niche" as const,
      integrationMethod: "manual" as const,
      apiDocsUrl: "https://bandcamp.com",
      priority: 70,
      estimatedTimeToLive: "Immediate",
    },
    {
      id: "spotify",
      name: "Spotify",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      apiDocsUrl: "https://developer.spotify.com",
      priority: 100,
      estimatedTimeToLive: "3-5 business days",
    },
    {
      id: "apple_music",
      name: "Apple Music",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      apiDocsUrl: "https://developer.apple.com/musickit/",
      priority: 95,
      estimatedTimeToLive: "3-7 business days",
    },
    {
      id: "amazon_music",
      name: "Amazon Music",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      priority: 85,
      estimatedTimeToLive: "3-5 business days",
    },
    {
      id: "tidal",
      name: "Tidal",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      priority: 80,
      estimatedTimeToLive: "3-5 business days",
    },
    {
      id: "deezer",
      name: "Deezer",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      priority: 75,
      estimatedTimeToLive: "3-5 business days",
    },
    {
      id: "youtube_music",
      name: "YouTube Music",
      category: "streaming" as const,
      integrationMethod: "aggregator" as const,
      priority: 88,
      estimatedTimeToLive: "3-5 business days",
    },
    {
      id: "tiktok",
      name: "TikTok",
      category: "social" as const,
      integrationMethod: "direct_api" as const,
      priority: 85,
      estimatedTimeToLive: "Immediate",
    },
    {
      id: "instagram",
      name: "Instagram Reels",
      category: "social" as const,
      integrationMethod: "direct_api" as const,
      priority: 82,
      estimatedTimeToLive: "Immediate",
    },
    {
      id: "beatport",
      name: "Beatport",
      category: "niche" as const,
      integrationMethod: "aggregator" as const,
      priority: 60,
      estimatedTimeToLive: "5-10 business days",
    },
    {
      id: "traxsource",
      name: "Traxsource",
      category: "niche" as const,
      integrationMethod: "aggregator" as const,
      priority: 55,
      estimatedTimeToLive: "5-10 business days",
    },
    {
      id: "audiomack",
      name: "Audiomack",
      category: "social" as const,
      integrationMethod: "direct_api" as const,
      apiDocsUrl: "https://audiomack.com/developers",
      priority: 65,
      estimatedTimeToLive: "Immediate",
    },
    {
      id: "patreon",
      name: "Patreon",
      category: "niche" as const,
      integrationMethod: "direct_api" as const,
      apiDocsUrl: "https://docs.patreon.com",
      priority: 50,
      estimatedTimeToLive: "Immediate",
    },
  ];

  for (const platform of platforms) {
    await db.createOrUpdatePlatform({
      id: platform.id,
      name: platform.name,
      category: platform.category,
      integrationMethod: platform.integrationMethod,
      apiEndpoint: platform.apiEndpoint,
      apiDocsUrl: platform.apiDocsUrl,
      priority: platform.priority,
      estimatedTimeToLive: platform.estimatedTimeToLive,
      enabled: true,
      healthStatus: "unknown",
    });
  }

  logger.info(`[Adapters] Seeded ${platforms.length} platforms into registry`);
}

export {
  youtubeAdapter,
  bandcampAdapter,
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
};
