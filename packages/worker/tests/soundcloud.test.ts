import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SoundCloudMonitor } from "./services/soundcloudMonitor";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock DB module
vi.mock("./db", () => ({
  getDb: vi.fn(),
  createTrack: vi.fn(),
  createDistributionJob: vi.fn(),
}));

// Mock drizzle schema
vi.mock("../drizzle/schema", () => ({
  artists: { soundcloudUserId: "soundcloudUserId" },
  tracks: { soundcloudTrackId: "soundcloudTrackId" },
}));

import axios from "axios";
import * as db from "./db";

const mockAxiosGet = vi.mocked(axios.get);
const mockGetDb = vi.mocked(db.getDb);
const mockCreateTrack = vi.mocked(db.createTrack);
const mockCreateDistributionJob = vi.mocked(db.createDistributionJob);

describe("SoundCloudMonitor", () => {
  let monitor: SoundCloudMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new SoundCloudMonitor();
  });

  afterEach(() => {
    monitor.stop();
  });

  // === Lifecycle Tests ===

  it("initializes without errors", () => {
    expect(monitor).toBeDefined();
  });

  it("starts and stops cleanly", async () => {
    // Mock DB to return no artists so poll completes quickly
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    await monitor.start(999999999);
    monitor.stop();
    // No crash = success
    expect(true).toBe(true);
  });

  it("stop is idempotent — calling multiple times does not throw", () => {
    monitor.stop();
    monitor.stop();
    monitor.stop();
    expect(true).toBe(true);
  });

  // === Polling Behavior ===

  it("polls connected artists from database during poll cycle", async () => {
    const mockArtists = [
      {
        id: "artist-1",
        name: "Test Artist",
        soundcloudUserId: "sc-user-123",
        distributionPreferences: { platforms: ["spotify"], autoPublish: true },
      },
    ];

    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(mockArtists),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    // Mock SoundCloud API returns empty tracks
    mockAxiosGet.mockResolvedValue({ data: { collection: [] } });

    await monitor.start(999999999);

    // Verify DB was queried for artists with SoundCloud configured
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();

    monitor.stop();
  });

  it("skips polling when no artists have SoundCloud configured", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]), // No connected artists
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    await monitor.start(999999999);

    // SoundCloud API should NOT have been called
    expect(mockAxiosGet).not.toHaveBeenCalled();

    monitor.stop();
  });

  it("handles database unavailability gracefully", async () => {
    mockGetDb.mockResolvedValue(null);

    // Should not throw
    await monitor.start(999999999);
    monitor.stop();
    expect(true).toBe(true);
  });

  // === New Track Detection ===

  it("detects new SoundCloud tracks and creates them in DB", async () => {
    const mockArtists = [
      {
        id: "artist-1",
        name: "Test Artist",
        soundcloudUserId: "sc-user-123",
        distributionPreferences: { platforms: ["spotify", "youtube"], autoPublish: true },
      },
    ];

    const scTracks = [
      {
        id: 999001,
        title: "Brand New Song",
        description: "A fresh track",
        duration: 180000,
        created_at: "2026-01-15T12:00:00Z",
        artwork_url: "https://i1.sndcdn.com/artworks-123.jpg",
        permalink_url: "https://soundcloud.com/test/brand-new-song",
        stream_url: "https://api-v2.soundcloud.com/tracks/999001/stream",
        user: { id: 12345, username: "test" },
      },
    ];

    // The monitor calls getDb() multiple times:
    // 1. poll() calls getDb() -> queries artists
    // 2. processTrack() calls getDb() -> checks if track exists
    // We need the mock to handle the chained .select().from().where() pattern
    // and return different results depending on the call sequence.
    let whereCallCount = 0;
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => {
        whereCallCount++;
        if (whereCallCount === 1) {
          // First where: poll() querying artists with SoundCloud
          return Promise.resolve(mockArtists);
        }
        // Second where: processTrack() checking if track exists
        // Returns a chainable object with .limit()
        return {
          limit: vi.fn().mockResolvedValue([]), // empty = track is new
        };
      }),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    // Mock SoundCloud API returns one track
    mockAxiosGet.mockResolvedValue({ data: { collection: scTracks } });

    // Mock track creation
    mockCreateTrack.mockResolvedValue({
      id: "track-uuid-1",
      title: "Brand New Song",
      artistId: "artist-1",
    } as any);

    // Mock job creation
    mockCreateDistributionJob.mockResolvedValue({ id: "job-1" } as any);

    await monitor.start(999999999);

    // Verify SoundCloud API was called for the artist
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("sc-user-123/tracks"),
      expect.any(Object)
    );

    // Verify track was created in DB
    expect(mockCreateTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        artistId: "artist-1",
        soundcloudTrackId: "999001",
        title: "Brand New Song",
      })
    );

    // Verify distribution jobs were created for each target platform
    expect(mockCreateDistributionJob).toHaveBeenCalledTimes(2); // spotify + youtube
    expect(mockCreateDistributionJob).toHaveBeenCalledWith(
      expect.objectContaining({
        trackId: "track-uuid-1",
        platformId: "spotify",
        status: "queued",
      })
    );
    expect(mockCreateDistributionJob).toHaveBeenCalledWith(
      expect.objectContaining({
        trackId: "track-uuid-1",
        platformId: "youtube",
        status: "queued",
      })
    );

    monitor.stop();
  });

  it("skips tracks that already exist in the database", async () => {
    const mockArtists = [
      {
        id: "artist-1",
        name: "Test Artist",
        soundcloudUserId: "sc-user-123",
        distributionPreferences: { platforms: ["spotify"], autoPublish: true },
      },
    ];

    const scTracks = [
      {
        id: 999001,
        title: "Already Tracked Song",
        description: "",
        duration: 120000,
        created_at: "2026-01-10T12:00:00Z",
        artwork_url: "",
        permalink_url: "https://soundcloud.com/test/already-tracked",
        user: { id: 12345, username: "test" },
      },
    ];

    const existingTrack = [{ id: "existing-track-id", soundcloudTrackId: "999001" }];

    let whereCallCount = 0;
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => {
        whereCallCount++;
        if (whereCallCount === 1) {
          return Promise.resolve(mockArtists);
        }
        // Track exists in DB
        return {
          limit: vi.fn().mockResolvedValue(existingTrack),
        };
      }),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    mockAxiosGet.mockResolvedValue({ data: { collection: scTracks } });

    await monitor.start(999999999);

    // Track should NOT be created because it already exists
    expect(mockCreateTrack).not.toHaveBeenCalled();
    expect(mockCreateDistributionJob).not.toHaveBeenCalled();

    monitor.stop();
  });

  // === SoundCloud API Error Handling ===

  it("handles SoundCloud API 401 errors gracefully", async () => {
    const mockArtists = [
      {
        id: "artist-1",
        name: "Test Artist",
        soundcloudUserId: "sc-user-123",
        distributionPreferences: {},
      },
    ];

    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(mockArtists),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    mockAxiosGet.mockRejectedValue({
      response: { status: 401 },
      message: "Unauthorized",
    });

    // Should not throw
    await monitor.start(999999999);
    expect(mockCreateTrack).not.toHaveBeenCalled();
    monitor.stop();
  });

  it("handles SoundCloud API network errors gracefully", async () => {
    const mockArtists = [
      {
        id: "artist-1",
        name: "Test Artist",
        soundcloudUserId: "sc-user-123",
        distributionPreferences: {},
      },
    ];

    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(mockArtists),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    mockAxiosGet.mockRejectedValue(new Error("ECONNREFUSED"));

    // Should not throw
    await monitor.start(999999999);
    expect(mockCreateTrack).not.toHaveBeenCalled();
    monitor.stop();
  });

  // === resolveUser ===

  it("resolveUser returns user data on success", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        id: 12345,
        username: "test-artist",
        avatar_url: "https://i1.sndcdn.com/avatars-123.jpg",
        permalink_url: "https://soundcloud.com/test-artist",
      },
    });

    const result = await monitor.resolveUser("test-artist");
    expect(result).not.toBeNull();
    expect(result?.username).toBe("test-artist");
    expect(result?.id).toBe(12345);
  });

  it("resolveUser returns null on API error", async () => {
    mockAxiosGet.mockRejectedValue(new Error("Not found"));

    const result = await monitor.resolveUser("nonexistent-user");
    expect(result).toBeNull();
  });

  // === Configurable Polling Interval ===

  it("accepts custom polling interval", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockGetDb.mockResolvedValue(mockDb as any);

    const customInterval = 30000; // 30 seconds
    await monitor.start(customInterval);

    // The monitor accepted the interval without error
    // Internal state is private, but we can verify it started
    monitor.stop();
    expect(true).toBe(true);
  });
});
