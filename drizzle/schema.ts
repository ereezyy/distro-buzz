import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  bigint,
  boolean,
  index,
  foreignKey,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Artists (musicians using Distro Buzz)
 */
export const artists = mysqlTable(
  "artists",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    soundcloudUsername: varchar("soundcloudUsername", { length: 255 }),
    soundcloudAccessToken: text("soundcloudAccessToken"),
    soundcloudUserId: varchar("soundcloudUserId", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    avatarUrl: text("avatarUrl"),
    bio: text("bio"),
    websiteUrl: text("websiteUrl"),
    verified: boolean("verified").default(false),
    distributionPreferences: json("distributionPreferences"), // { platforms: [...], autoPublish: true }
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("artists_userId_idx").on(table.userId),
    soundcloudUserIdIdx: index("artists_soundcloudUserId_idx").on(table.soundcloudUserId),
  })
);

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

/**
 * Tracks (individual songs/releases)
 */
export const tracks = mysqlTable(
  "tracks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    artistId: varchar("artistId", { length: 36 }).notNull(),
    soundcloudTrackId: varchar("soundcloudTrackId", { length: 255 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    audioUrl: text("audioUrl"), // S3 path
    audioFileKey: text("audioFileKey"), // S3 key
    durationMs: int("durationMs"),
    genre: varchar("genre", { length: 100 }),
    mood: json("mood"), // { energy: 0.8, valence: 0.6, ... }
    isrc: varchar("isrc", { length: 20 }),
    releaseDate: timestamp("releaseDate"),
    artworkUrl: text("artworkUrl"), // S3 path
    artworkFileKey: text("artworkFileKey"), // S3 key
    metadata: json("metadata"), // { lyrics, credits, productionNotes, ... }
    distributionConfig: json("distributionConfig"), // { platforms: [...], priceTier: 'free', ... }
    distributionStatus: json("distributionStatus"), // { overall: 'in_progress', platforms: {...} }
    distributionCoverageScore: decimal("distributionCoverageScore", { precision: 3, scale: 2 }), // 0.0-1.0
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    artistIdIdx: index("tracks_artistId_idx").on(table.artistId),
    soundcloudTrackIdIdx: index("tracks_soundcloudTrackId_idx").on(table.soundcloudTrackId),
  })
);

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

/**
 * Distribution Jobs (one per track per platform)
 */
export const distributionJobs = mysqlTable(
  "distributionJobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    trackId: varchar("trackId", { length: 36 }).notNull(),
    platformId: varchar("platformId", { length: 100 }).notNull(),
    aggregatorId: varchar("aggregatorId", { length: 100 }),
    status: mysqlEnum("status", [
      "queued",
      "processing",
      "live",
      "failed",
      "retrying",
      "fallback",
    ])
      .default("queued")
      .notNull(),
    retryCount: int("retryCount").default(0),
    maxRetries: int("maxRetries").default(7),
    errorMessage: text("errorMessage"),
    errorDetails: json("errorDetails"),
    platformTrackId: varchar("platformTrackId", { length: 255 }),
    platformUrl: text("platformUrl"),
    platformResponse: json("platformResponse"),
    scheduledAt: timestamp("scheduledAt"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    nextRetryAt: timestamp("nextRetryAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("distributionJobs_trackId_idx").on(table.trackId),
    platformIdIdx: index("distributionJobs_platformId_idx").on(table.platformId),
    statusIdx: index("distributionJobs_status_idx").on(table.status),
  })
);

export type DistributionJob = typeof distributionJobs.$inferSelect;
export type InsertDistributionJob = typeof distributionJobs.$inferInsert;

/**
 * Distribution Logs (audit trail for every action)
 */
export const distributionLogs = mysqlTable(
  "distributionLogs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    jobId: varchar("jobId", { length: 36 }).notNull(),
    action: varchar("action", { length: 100 }),
    status: mysqlEnum("status", ["success", "failure", "pending"]),
    message: text("message"),
    details: json("details"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("distributionLogs_jobId_idx").on(table.jobId),
  })
);

export type DistributionLog = typeof distributionLogs.$inferSelect;
export type InsertDistributionLog = typeof distributionLogs.$inferInsert;

/**
 * Platform Registry (catalog of all supported platforms)
 */
export const platformRegistry = mysqlTable(
  "platformRegistry",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: mysqlEnum("category", ["streaming", "social", "aggregator", "niche"]),
    integrationMethod: mysqlEnum("integrationMethod", ["direct_api", "aggregator", "manual"]),
    apiEndpoint: text("apiEndpoint"),
    apiDocsUrl: text("apiDocsUrl"),
    credentialsRequired: json("credentialsRequired"),
    rateLimitPerHour: int("rateLimitPerHour"),
    webhookSupported: boolean("webhookSupported").default(false),
    webhookEndpoint: text("webhookEndpoint"),
    healthStatus: mysqlEnum("healthStatus", ["unknown", "healthy", "degraded", "down"])
      .default("unknown")
      .notNull(),
    lastHealthCheck: timestamp("lastHealthCheck"),
    estimatedTimeToLive: varchar("estimatedTimeToLive", { length: 50 }),
    priority: int("priority").default(50),
    enabled: boolean("enabled").default(true),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("platformRegistry_category_idx").on(table.category),
  })
);

export type Platform = typeof platformRegistry.$inferSelect;
export type InsertPlatform = typeof platformRegistry.$inferInsert;

/**
 * Aggregator Accounts (DistroKid, TuneCore, CD Baby credentials)
 */
export const aggregatorAccounts = mysqlTable(
  "aggregatorAccounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    artistId: varchar("artistId", { length: 36 }).notNull(),
    aggregatorId: varchar("aggregatorId", { length: 100 }).notNull(),
    accountName: varchar("accountName", { length: 255 }),
    apiKey: text("apiKey"), // ENCRYPTED
    apiSecret: text("apiSecret"), // ENCRYPTED
    accountStatus: mysqlEnum("accountStatus", ["active", "inactive", "error"]),
    lastSync: timestamp("lastSync"),
    syncError: text("syncError"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    artistIdIdx: index("aggregatorAccounts_artistId_idx").on(table.artistId),
  })
);

export type AggregatorAccount = typeof aggregatorAccounts.$inferSelect;
export type InsertAggregatorAccount = typeof aggregatorAccounts.$inferInsert;

/**
 * Music Video Jobs (WaveForge integration)
 */
export const musicVideoJobs = mysqlTable(
  "musicVideoJobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    trackId: varchar("trackId", { length: 36 }).notNull(),
    platformId: varchar("platformId", { length: 100 }),
    status: mysqlEnum("status", ["queued", "processing", "ready", "uploaded", "failed"])
      .default("queued")
      .notNull(),
    waveforgeJobId: varchar("waveforgeJobId", { length: 255 }),
    videoUrl: text("videoUrl"), // S3 path
    videoFileKey: text("videoFileKey"), // S3 key
    youtubeVideoId: varchar("youtubeVideoId", { length: 255 }),
    tiktokVideoId: varchar("tiktokVideoId", { length: 255 }),
    instagramVideoId: varchar("instagramVideoId", { length: 255 }),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("musicVideoJobs_trackId_idx").on(table.trackId),
    statusIdx: index("musicVideoJobs_status_idx").on(table.status),
  })
);

export type MusicVideoJob = typeof musicVideoJobs.$inferSelect;
export type InsertMusicVideoJob = typeof musicVideoJobs.$inferInsert;

/**
 * Social Media Posts (auto-posting to artist profiles)
 */
export const socialMediaPosts = mysqlTable(
  "socialMediaPosts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    trackId: varchar("trackId", { length: 36 }).notNull(),
    platformId: varchar("platformId", { length: 100 }),
    status: mysqlEnum("status", ["queued", "posted", "failed", "retrying"])
      .default("queued")
      .notNull(),
    postContent: text("postContent"),
    mediaUrls: json("mediaUrls"), // Array of S3 URLs
    platformPostId: varchar("platformPostId", { length: 255 }),
    platformUrl: text("platformUrl"),
    errorMessage: text("errorMessage"),
    retryCount: int("retryCount").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("socialMediaPosts_trackId_idx").on(table.trackId),
    statusIdx: index("socialMediaPosts_status_idx").on(table.status),
  })
);

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

/**
 * Distribution Analytics (aggregated metrics)
 */
export const distributionAnalytics = mysqlTable(
  "distributionAnalytics",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    trackId: varchar("trackId", { length: 36 }).notNull(),
    platformId: varchar("platformId", { length: 100 }),
    date: timestamp("date").notNull(),
    platformsLive: int("platformsLive"),
    totalPlatforms: int("totalPlatforms"),
    healthScore: decimal("healthScore", { precision: 3, scale: 2 }),
    failureRate: decimal("failureRate", { precision: 3, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("distributionAnalytics_trackId_idx").on(table.trackId),
    dateIdx: index("distributionAnalytics_date_idx").on(table.date),
  })
);

export type DistributionAnalytic = typeof distributionAnalytics.$inferSelect;
export type InsertDistributionAnalytic = typeof distributionAnalytics.$inferInsert;