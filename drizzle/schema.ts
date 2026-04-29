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
    userId: int("userId"),
    soundcloudUsername: varchar("soundcloudUsername", { length: 255 }),
    soundcloudAccessToken: text("soundcloudAccessToken"),
    soundcloudUserId: varchar("soundcloudUserId", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: text("passwordHash"),
    avatarUrl: text("avatarUrl"),
    bio: text("bio"),
    websiteUrl: text("websiteUrl"),
    verified: boolean("verified").default(false),
    distributionPreferences: json("distributionPreferences"), // { platforms: [...], autoPublish: true }
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("artists_email_idx").on(table.email),
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

/**
 * Ad Placements (non-intrusive ad spots throughout the platform)
 */
export const adPlacements = mysqlTable(
  "adPlacements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    advertiserId: varchar("advertiserId", { length: 36 }).notNull(), // artist or business ID
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    linkUrl: text("linkUrl"),
    position: mysqlEnum("position", [
      "homepage_banner",
      "featured_artist",
      "sponsored_recommendation",
      "sidebar_banner",
      "feed_inline",
    ]).notNull(),
    status: mysqlEnum("status", ["draft", "active", "paused", "expired", "rejected"])
      .default("draft")
      .notNull(),
    budgetCents: int("budgetCents").default(0), // total budget in cents
    spentCents: int("spentCents").default(0), // total spent in cents
    cpcCents: int("cpcCents").default(10), // cost per click in cents
    impressions: int("impressions").default(0),
    clicks: int("clicks").default(0),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    advertiserIdIdx: index("adPlacements_advertiserId_idx").on(table.advertiserId),
    statusIdx: index("adPlacements_status_idx").on(table.status),
    positionIdx: index("adPlacements_position_idx").on(table.position),
  })
);

export type AdPlacement = typeof adPlacements.$inferSelect;
export type InsertAdPlacement = typeof adPlacements.$inferInsert;

/**
 * Ad Events (impression and click tracking)
 */
export const adEvents = mysqlTable(
  "adEvents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    adId: varchar("adId", { length: 36 }).notNull(),
    eventType: mysqlEnum("eventType", ["impression", "click"]).notNull(),
    ipHash: varchar("ipHash", { length: 64 }), // hashed IP for dedup
    userAgent: text("userAgent"),
    referrer: text("referrer"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    adIdIdx: index("adEvents_adId_idx").on(table.adId),
    eventTypeIdx: index("adEvents_eventType_idx").on(table.eventType),
  })
);

export type AdEvent = typeof adEvents.$inferSelect;
export type InsertAdEvent = typeof adEvents.$inferInsert;


/**
 * AI Talent Agents (one per user, manages gigs, outreach, legal)
 */
export const aiAgents = mysqlTable(
  "aiAgents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull().unique(),
    talentType: mysqlEnum("talentType", [
      "musician",
      "model",
      "visual_artist",
      "performer",
      "influencer",
      "voice_actor",
      "photographer",
      "dj",
    ]).notNull(),
    personality: text("personality"), // AI personality description
    status: mysqlEnum("status", ["active", "paused", "inactive"]).default("active").notNull(),
    lastActivityAt: timestamp("lastActivityAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("aiAgents_userId_idx").on(table.userId),
    talentTypeIdx: index("aiAgents_talentType_idx").on(table.talentType),
  })
);

export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertAiAgent = typeof aiAgents.$inferInsert;

/**
 * Gigs (booking opportunities discovered and managed by AI agent)
 */
export const gigs = mysqlTable(
  "gigs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    agentId: varchar("agentId", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    venue: varchar("venue", { length: 255 }),
    date: timestamp("date"),
    rateCents: int("rateCents"), // rate in cents
    status: mysqlEnum("status", ["discovered", "interested", "negotiating", "booked", "completed", "declined"])
      .default("discovered")
      .notNull(),
    source: varchar("source", { length: 100 }), // job board, casting call, brand, etc.
    aiRecommendationScore: decimal("aiRecommendationScore", { precision: 3, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("gigs_userId_idx").on(table.userId),
    agentIdIdx: index("gigs_agentId_idx").on(table.agentId),
    dateIdx: index("gigs_date_idx").on(table.date),
    statusIdx: index("gigs_status_idx").on(table.status),
  })
);

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = typeof gigs.$inferInsert;

/**
 * Legal Filings (DMCA, copyright, contracts, brand protection)
 */
export const legalFilings = mysqlTable(
  "legalFilings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", [
      "dmca_takedown",
      "copyright_registration",
      "contract",
      "brand_protection",
      "ip_portfolio",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["draft", "filed", "in_progress", "resolved", "expired"])
      .default("draft")
      .notNull(),
    documentUrl: text("documentUrl"),
    filingDate: timestamp("filingDate"),
    resolvedDate: timestamp("resolvedDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("legalFilings_userId_idx").on(table.userId),
    typeIdx: index("legalFilings_type_idx").on(table.type),
    statusIdx: index("legalFilings_status_idx").on(table.status),
  })
);

export type LegalFiling = typeof legalFilings.$inferSelect;
export type InsertLegalFiling = typeof legalFilings.$inferInsert;

/**
 * Contracts (generated and managed by AI agent)
 */
export const contracts = mysqlTable(
  "contracts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    gigId: varchar("gigId", { length: 36 }),
    template: varchar("template", { length: 100 }), // template type (appearance, licensing, etc.)
    customization: text("customization"), // AI customization notes
    documentUrl: text("documentUrl"),
    status: mysqlEnum("status", ["draft", "proposed", "signed", "archived"])
      .default("draft")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("contracts_userId_idx").on(table.userId),
    gigIdIdx: index("contracts_gigId_idx").on(table.gigId),
    statusIdx: index("contracts_status_idx").on(table.status),
  })
);

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Media Assets (press kits, photos, videos, bios)
 */
export const mediaAssets = mysqlTable(
  "mediaAssets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["photo", "video", "bio", "press_kit", "audio", "document"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    url: text("url").notNull(),
    brandCompliance: boolean("brandCompliance").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("mediaAssets_userId_idx").on(table.userId),
    typeIdx: index("mediaAssets_type_idx").on(table.type),
  })
);

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;

/**
 * Subscriptions (AI agent features, a la carte pricing)
 */
export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull().unique(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
    features: json("features").$type<string[]>().default([]), // array of feature names
    status: mysqlEnum("status", ["active", "paused", "canceled", "past_due"])
      .default("active")
      .notNull(),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("subscriptions_userId_idx").on(table.userId),
    stripeCustomerIdIdx: index("subscriptions_stripeCustomerId_idx").on(table.stripeCustomerId),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Outreach Log (AI agent outreach to venues, brands, agencies)
 */
export const outreachLog = mysqlTable(
  "outreachLog",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    agentId: varchar("agentId", { length: 36 }).notNull(),
    targetName: varchar("targetName", { length: 255 }).notNull(),
    targetEmail: varchar("targetEmail", { length: 320 }),
    targetPhone: varchar("targetPhone", { length: 20 }),
    message: text("message"),
    responseReceived: boolean("responseReceived").default(false),
    response: text("response"),
    status: mysqlEnum("status", ["sent", "bounced", "replied", "interested", "declined", "no_response"])
      .default("sent")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("outreachLog_agentId_idx").on(table.agentId),
    statusIdx: index("outreachLog_status_idx").on(table.status),
  })
);

export type OutreachLogEntry = typeof outreachLog.$inferSelect;
export type InsertOutreachLogEntry = typeof outreachLog.$inferInsert;


/**
 * Voice Calls (AI agent phone outreach)
 */
export const voiceCalls = mysqlTable(
  "voiceCalls",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    agentId: varchar("agentId", { length: 36 }).notNull(),
    targetName: varchar("targetName", { length: 255 }).notNull(),
    targetPhone: varchar("targetPhone", { length: 20 }).notNull(),
    purpose: varchar("purpose", { length: 100 }), // gig_pitch, negotiation, follow_up
    status: mysqlEnum("status", ["initiated", "ringing", "connected", "completed", "failed", "voicemail"])
      .default("initiated")
      .notNull(),
    durationSeconds: int("durationSeconds"),
    recordingUrl: text("recordingUrl"),
    transcriptUrl: text("transcriptUrl"),
    outcome: varchar("outcome", { length: 100 }), // interested, not_interested, callback_scheduled, etc.
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("voiceCalls_agentId_idx").on(table.agentId),
    statusIdx: index("voiceCalls_status_idx").on(table.status),
    createdAtIdx: index("voiceCalls_createdAt_idx").on(table.createdAt),
  })
);

export type VoiceCall = typeof voiceCalls.$inferSelect;
export type InsertVoiceCall = typeof voiceCalls.$inferInsert;

/**
 * Merch Products (print-on-demand via Printful)
 */
export const merchProducts = mysqlTable(
  "merchProducts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    printfulProductId: varchar("printfulProductId", { length: 100 }),
    type: mysqlEnum("type", ["t_shirt", "hoodie", "sticker", "poster", "phone_case", "mug", "hat"])
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    basePrice: int("basePrice"), // base cost in cents
    retailPrice: int("retailPrice"), // retail price in cents
    profitMargin: decimal("profitMargin", { precision: 3, scale: 2 }), // artist profit %
    status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("merchProducts_userId_idx").on(table.userId),
    typeIdx: index("merchProducts_type_idx").on(table.type),
    statusIdx: index("merchProducts_status_idx").on(table.status),
  })
);

export type MerchProduct = typeof merchProducts.$inferSelect;
export type InsertMerchProduct = typeof merchProducts.$inferInsert;

/**
 * Merch Orders (fulfilled by Printful)
 */
export const merchOrders = mysqlTable(
  "merchOrders",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    productId: varchar("productId", { length: 36 }).notNull(),
    printfulOrderId: varchar("printfulOrderId", { length: 100 }),
    customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
    quantity: int("quantity").notNull(),
    totalPrice: int("totalPrice"), // total in cents
    artistProfit: int("artistProfit"), // artist's cut in cents
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "production",
      "shipped",
      "delivered",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    trackingNumber: varchar("trackingNumber", { length: 100 }),
    shippingDate: timestamp("shippingDate"),
    deliveryDate: timestamp("deliveryDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("merchOrders_userId_idx").on(table.userId),
    productIdIdx: index("merchOrders_productId_idx").on(table.productId),
    statusIdx: index("merchOrders_status_idx").on(table.status),
  })
);

export type MerchOrder = typeof merchOrders.$inferSelect;
export type InsertMerchOrder = typeof merchOrders.$inferInsert;

/**
 * Gig Syndicate Sources (scraped opportunities)
 */
export const gigSources = mysqlTable(
  "gigSources",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    agentId: varchar("agentId", { length: 36 }).notNull(),
    source: varchar("source", { length: 100 }).notNull(), // venue_listings, casting_calls, etc.
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    url: text("url"),
    relevanceScore: decimal("relevanceScore", { precision: 3, scale: 2 }), // 0-1
    status: mysqlEnum("status", ["new", "reviewed", "applied", "rejected"]).default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("gigSources_agentId_idx").on(table.agentId),
    sourceIdx: index("gigSources_source_idx").on(table.source),
    relevanceIdx: index("gigSources_relevanceScore_idx").on(table.relevanceScore),
  })
);

export type GigSource = typeof gigSources.$inferSelect;
export type InsertGigSource = typeof gigSources.$inferInsert;
