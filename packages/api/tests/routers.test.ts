import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getArtistByUserId: vi.fn(),
  createArtist: vi.fn(),
  updateArtist: vi.fn(),
  getTracksByArtistId: vi.fn(),
  getTrackById: vi.fn(),
  createTrack: vi.fn(),
  getDistributionJobsByTrackId: vi.fn(),
  getDistributionJobsByStatus: vi.fn(),
  getDistributionJobById: vi.fn(),
  createDistributionJob: vi.fn(),
  updateDistributionJob: vi.fn(),
  getDistributionLogsByJobId: vi.fn(),
  getPlatformRegistry: vi.fn(),
  getPlatformById: vi.fn(),
}));

import * as db from "./db";

const mockDb = vi.mocked(db);

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Artists Router", () => {
  it("artists.me returns null when no artist profile exists", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getArtistByUserId.mockResolvedValue(undefined);

    const result = await caller.artists.me();
    expect(result).toBeUndefined();
    expect(mockDb.getArtistByUserId).toHaveBeenCalledWith(1);
  });

  it("artists.me returns artist when profile exists", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockArtist = {
      id: "artist-1",
      userId: 1,
      name: "Test Artist",
      email: "test@example.com",
    };
    mockDb.getArtistByUserId.mockResolvedValue(mockArtist as any);

    const result = await caller.artists.me();
    expect(result).toEqual(mockArtist);
  });

  it("artists.create creates a new artist profile", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockArtist = {
      id: "artist-new",
      userId: 1,
      name: "New Artist",
    };
    mockDb.createArtist.mockResolvedValue(mockArtist as any);

    const result = await caller.artists.create({
      name: "New Artist",
      soundcloudUsername: "newartist",
      bio: "A fresh new artist",
    });

    expect(result).toEqual(mockArtist);
    expect(mockDb.createArtist).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Artist",
        soundcloudUsername: "newartist",
        bio: "A fresh new artist",
      })
    );
  });
});

describe("Tracks Router", () => {
  it("tracks.list returns empty when no artist profile", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getArtistByUserId.mockResolvedValue(undefined);

    const result = await caller.tracks.list({ page: 1, limit: 20 });
    expect(result).toEqual({ tracks: [], total: 0 });
  });

  it("tracks.list returns tracks for authenticated artist", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getArtistByUserId.mockResolvedValue({ id: "artist-1" } as any);
    mockDb.getTracksByArtistId.mockResolvedValue([
      { id: "track-1", title: "Song A" },
      { id: "track-2", title: "Song B" },
    ] as any);

    const result = await caller.tracks.list({ page: 1, limit: 20 });
    expect(result.tracks).toHaveLength(2);
    expect(result.page).toBe(1);
  });

  it("tracks.get returns a specific track", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockTrack = { id: "track-1", title: "Test Song" };
    mockDb.getTrackById.mockResolvedValue(mockTrack as any);

    const result = await caller.tracks.get({ id: "track-1" });
    expect(result).toEqual(mockTrack);
  });
});

describe("Jobs Router", () => {
  it("jobs.list returns jobs filtered by trackId", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockJobs = [
      { id: "job-1", trackId: "track-1", platformId: "spotify", status: "queued" },
      { id: "job-2", trackId: "track-1", platformId: "youtube", status: "processing" },
    ];
    mockDb.getDistributionJobsByTrackId.mockResolvedValue(mockJobs as any);

    const result = await caller.jobs.list({ trackId: "track-1" });
    expect(result.jobs).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("jobs.list returns jobs filtered by status", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockJobs = [
      { id: "job-1", status: "failed" },
    ];
    mockDb.getDistributionJobsByStatus.mockResolvedValue(mockJobs as any);

    const result = await caller.jobs.list({ status: "failed" });
    expect(result.jobs).toHaveLength(1);
  });

  it("jobs.retry requeues a failed job", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getDistributionJobById.mockResolvedValue({
      id: "job-1",
      status: "failed",
    } as any);
    mockDb.updateDistributionJob.mockResolvedValue({
      id: "job-1",
      status: "retrying",
    } as any);

    const result = await caller.jobs.retry({ id: "job-1" });
    expect(result.success).toBe(true);
    expect(mockDb.updateDistributionJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({ status: "retrying" })
    );
  });

  it("jobs.cancel marks a job as failed with cancel message", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getDistributionJobById.mockResolvedValue({
      id: "job-1",
      status: "queued",
    } as any);
    mockDb.updateDistributionJob.mockResolvedValue({
      id: "job-1",
      status: "failed",
      errorMessage: "Cancelled by user",
    } as any);

    const result = await caller.jobs.cancel({ id: "job-1" });
    expect(result.success).toBe(true);
    expect(mockDb.updateDistributionJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        status: "failed",
        errorMessage: "Cancelled by user",
      })
    );
  });

  it("jobs.retry throws when job not found", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    mockDb.getDistributionJobById.mockResolvedValue(undefined);

    await expect(caller.jobs.retry({ id: "nonexistent" })).rejects.toThrow("Job not found");
  });
});

describe("Platforms Router", () => {
  it("platforms.list returns all platforms", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockPlatforms = [
      { id: "spotify", name: "Spotify", healthStatus: "healthy" },
      { id: "youtube", name: "YouTube", healthStatus: "healthy" },
    ];
    mockDb.getPlatformRegistry.mockResolvedValue(mockPlatforms as any);

    const result = await caller.platforms.list();
    expect(result.platforms).toHaveLength(2);
  });

  it("platforms.health returns health status for all platforms", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const mockPlatforms = [
      { id: "spotify", healthStatus: "healthy", lastHealthCheck: new Date() },
      { id: "youtube", healthStatus: "degraded", lastHealthCheck: new Date() },
    ];
    mockDb.getPlatformRegistry.mockResolvedValue(mockPlatforms as any);

    const result = await caller.platforms.health();
    expect(result.platforms.spotify.status).toBe("healthy");
    expect(result.platforms.youtube.status).toBe("degraded");
    expect(result.timestamp).toBeDefined();
  });
});

describe("Admin Router", () => {
  it("admin.stats throws for non-admin users", async () => {
    const ctx = createMockContext("user"); // regular user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.stats()).rejects.toThrow("Forbidden");
  });

  it("admin.stats returns system stats for admin users", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    mockDb.getPlatformRegistry.mockResolvedValue([
      { id: "spotify", healthStatus: "healthy" },
      { id: "youtube", healthStatus: "degraded" },
    ] as any);
    mockDb.getDistributionJobsByStatus.mockResolvedValue([]);

    const result = await caller.admin.stats();
    expect(result.platforms.total).toBe(2);
    expect(result.platforms.healthy).toBe(1);
    expect(result.platforms.degraded).toBe(1);
    expect(result.queue).toBeDefined();
  });

  it("admin.triggerJob requeues a job for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    mockDb.updateDistributionJob.mockResolvedValue({
      id: "job-1",
      status: "queued",
    } as any);

    const result = await caller.admin.triggerJob({ id: "job-1" });
    expect(result.success).toBe(true);
  });

  it("admin.pauseJob pauses a job for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    mockDb.updateDistributionJob.mockResolvedValue({
      id: "job-1",
      status: "failed",
      errorMessage: "Paused by admin",
    } as any);

    const result = await caller.admin.pauseJob({ id: "job-1" });
    expect(result.success).toBe(true);
  });
});
