import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  artists,
  tracks,
  distributionJobs,
  distributionLogs,
  platformRegistry,
  aggregatorAccounts,
  musicVideoJobs,
  socialMediaPosts,
  distributionAnalytics,
  Artist,
  Track,
  DistributionJob,
  DistributionLog,
  Platform,
  AggregatorAccount,
  MusicVideoJob,
  SocialMediaPost,
  DistributionAnalytic,
  InsertArtist,
  InsertTrack,
  InsertDistributionJob,
  InsertDistributionLog,
  InsertPlatform,
  InsertAggregatorAccount,
  InsertMusicVideoJob,
  InsertSocialMediaPost,
  InsertDistributionAnalytic,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ARTIST QUERIES
// ============================================================================

export async function createArtist(data: InsertArtist): Promise<Artist | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(artists).values(data);
    return db
      .select()
      .from(artists)
      .where(eq(artists.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create artist:", error);
    throw error;
  }
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(artists)
    .where(eq(artists.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getArtistByUserId(userId: number): Promise<Artist | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(artists)
    .where(eq(artists.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateArtist(
  id: string,
  data: Partial<InsertArtist>
): Promise<Artist | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(artists).set(data).where(eq(artists.id, id));
    return getArtistById(id);
  } catch (error) {
    console.error("[DB] Failed to update artist:", error);
    throw error;
  }
}

// ============================================================================
// TRACK QUERIES
// ============================================================================

export async function createTrack(data: InsertTrack): Promise<Track | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(tracks).values(data);
    return db
      .select()
      .from(tracks)
      .where(eq(tracks.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create track:", error);
    throw error;
  }
}

export async function getTrackById(id: string): Promise<Track | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTracksByArtistId(
  artistId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Track[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tracks)
    .where(eq(tracks.artistId, artistId))
    .orderBy(desc(tracks.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateTrack(
  id: string,
  data: Partial<InsertTrack>
): Promise<Track | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(tracks).set(data).where(eq(tracks.id, id));
    return getTrackById(id);
  } catch (error) {
    console.error("[DB] Failed to update track:", error);
    throw error;
  }
}

// ============================================================================
// DISTRIBUTION JOB QUERIES
// ============================================================================

export async function createDistributionJob(
  data: InsertDistributionJob
): Promise<DistributionJob | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(distributionJobs).values(data);
    return db
      .select()
      .from(distributionJobs)
      .where(eq(distributionJobs.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create distribution job:", error);
    throw error;
  }
}

export async function getDistributionJobById(
  id: string
): Promise<DistributionJob | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(distributionJobs)
    .where(eq(distributionJobs.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDistributionJobsByTrackId(
  trackId: string
): Promise<DistributionJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(distributionJobs)
    .where(eq(distributionJobs.trackId, trackId));
}

export async function getDistributionJobsByStatus(
  status: string,
  limit: number = 100
): Promise<DistributionJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(distributionJobs)
    .where(sql`status = ${status}`)
    .orderBy(desc(distributionJobs.createdAt))
    .limit(limit);
}

export async function updateDistributionJob(
  id: string,
  data: Partial<InsertDistributionJob>
): Promise<DistributionJob | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(distributionJobs).set(data).where(eq(distributionJobs.id, id));
    return getDistributionJobById(id);
  } catch (error) {
    console.error("[DB] Failed to update distribution job:", error);
    throw error;
  }
}

// ============================================================================
// DISTRIBUTION LOG QUERIES
// ============================================================================

export async function createDistributionLog(
  data: InsertDistributionLog
): Promise<DistributionLog | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(distributionLogs).values(data);
    return db
      .select()
      .from(distributionLogs)
      .where(eq(distributionLogs.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create distribution log:", error);
    throw error;
  }
}

export async function getDistributionLogsByJobId(
  jobId: string,
  limit: number = 100
): Promise<DistributionLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(distributionLogs)
    .where(eq(distributionLogs.jobId, jobId))
    .orderBy(desc(distributionLogs.timestamp))
    .limit(limit);
}

// ============================================================================
// PLATFORM REGISTRY QUERIES
// ============================================================================

export async function getPlatformRegistry(): Promise<Platform[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(platformRegistry)
    .where(eq(platformRegistry.enabled, true));
}

export async function getPlatformById(id: string): Promise<Platform | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(platformRegistry)
    .where(eq(platformRegistry.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdatePlatform(
  data: InsertPlatform
): Promise<Platform | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(platformRegistry).values(data).onDuplicateKeyUpdate({
      set: data,
    });
    return getPlatformById(data.id);
  } catch (error) {
    console.error("[DB] Failed to create/update platform:", error);
    throw error;
  }
}

// ============================================================================
// AGGREGATOR ACCOUNT QUERIES
// ============================================================================

export async function createAggregatorAccount(
  data: InsertAggregatorAccount
): Promise<AggregatorAccount | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(aggregatorAccounts).values(data);
    return db
      .select()
      .from(aggregatorAccounts)
      .where(eq(aggregatorAccounts.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create aggregator account:", error);
    throw error;
  }
}

export async function getAggregatorAccountsByArtistId(
  artistId: string
): Promise<AggregatorAccount[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(aggregatorAccounts)
    .where(eq(aggregatorAccounts.artistId, artistId));
}

// ============================================================================
// MUSIC VIDEO JOB QUERIES
// ============================================================================

export async function createMusicVideoJob(
  data: InsertMusicVideoJob
): Promise<MusicVideoJob | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(musicVideoJobs).values(data);
    return db
      .select()
      .from(musicVideoJobs)
      .where(eq(musicVideoJobs.id, data.id))
      .limit(1)
      .then((r) => r[0] || null);
  } catch (error) {
    console.error("[DB] Failed to create music video job:", error);
    throw error;
  }
}

export async function getMusicVideoJobsByTrackId(
  trackId: string
): Promise<MusicVideoJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(musicVideoJobs)
    .where(eq(musicVideoJobs.trackId, trackId));
}
