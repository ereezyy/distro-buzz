import { describe, expect, it, vi } from "vitest";

// Mock the db module before importing adapters
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  createOrUpdatePlatform: vi.fn().mockResolvedValue(null),
}));

// Mock the logger (default export)
vi.mock("./utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Social Platform Adapters", () => {
  it("should import socialPlatforms module", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    expect(mod).toBeDefined();
  });

  it("should export seedSocialPlatforms function", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    expect(typeof mod.seedSocialPlatforms).toBe("function");
  });

  it("should export getSocialAdapter function", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    expect(typeof mod.getSocialAdapter).toBe("function");
  });

  it("should export all 8 social platform adapters as objects", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const adapters = [
      mod.tiktokAdapter,
      mod.facebookAdapter,
      mod.threadsAdapter,
      mod.instagramAdapter,
      mod.snapchatAdapter,
      mod.xAdapter,
      mod.redditAdapter,
      mod.telegramAdapter,
    ];
    expect(adapters.length).toBe(8);
    for (const adapter of adapters) {
      expect(adapter).toBeDefined();
      expect(typeof adapter.postTrack).toBe("function");
      expect(typeof adapter.getStatus).toBe("function");
      expect(adapter.name).toBeDefined();
      expect(adapter.apiEndpoint).toBeDefined();
      expect(typeof adapter.requiresAuth).toBe("boolean");
    }
  });

  it("should export socialPlatformAdapters map with all 8 platforms", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const map = mod.socialPlatformAdapters;
    expect(Object.keys(map).length).toBe(8);
    expect(map.tiktok).toBeDefined();
    expect(map.facebook).toBeDefined();
    expect(map.threads).toBeDefined();
    expect(map.instagram).toBeDefined();
    expect(map.snapchat).toBeDefined();
    expect(map.x).toBeDefined();
    expect(map.reddit).toBeDefined();
    expect(map.telegram).toBeDefined();
  });

  it("should return adapter from getSocialAdapter for valid platform", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const adapter = mod.getSocialAdapter("tiktok");
    expect(adapter).not.toBeNull();
    expect(adapter?.name).toBe("TikTok");
  });

  it("should return null from getSocialAdapter for unknown platform", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const adapter = mod.getSocialAdapter("nonexistent_platform");
    expect(adapter).toBeNull();
  });

  it("should have postTrack method that returns expected shape", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const adapter = mod.tiktokAdapter;
    const result = await adapter.postTrack(
      {
        title: "Test Song",
        artist: "Test Artist",
        description: "A test track",
        audioUrl: "https://example.com/audio.mp3",
        coverArtUrl: "https://example.com/art.jpg",
      },
      { accessToken: "test-token" }
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("postId");
  });

  it("should have getStatus method that returns expected shape", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const adapter = mod.facebookAdapter;
    const result = await adapter.getStatus("test-post-id", {
      accessToken: "test-token",
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("status");
  });

  it("should call seedSocialPlatforms and invoke createOrUpdatePlatform 8 times", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    const mockCreate = vi.fn().mockResolvedValue(null);
    await mod.seedSocialPlatforms(mockCreate);
    expect(mockCreate).toHaveBeenCalledTimes(8);
  });

  it("each adapter should handle errors gracefully in postTrack", async () => {
    const mod = await import("./services/adapters/socialPlatforms");
    // All adapters are stubs that return success — verify they don't throw
    const allAdapters = [
      mod.tiktokAdapter,
      mod.facebookAdapter,
      mod.threadsAdapter,
      mod.instagramAdapter,
      mod.snapchatAdapter,
      mod.xAdapter,
      mod.redditAdapter,
      mod.telegramAdapter,
    ];
    for (const adapter of allAdapters) {
      const result = await adapter.postTrack(
        {
          title: "Test",
          artist: "Test",
          description: "Test",
          audioUrl: "https://example.com/audio.mp3",
        },
        {}
      );
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    }
  });
});

describe("Adapter Index", () => {
  it("should import adapters index module", async () => {
    const mod = await import("./services/adapters/index");
    expect(mod).toBeDefined();
  });

  it("should export registerAllAdapters function", async () => {
    const mod = await import("./services/adapters/index");
    expect(typeof mod.registerAllAdapters).toBe("function");
  });

  it("should export seedPlatformRegistry function", async () => {
    const mod = await import("./services/adapters/index");
    expect(typeof mod.seedPlatformRegistry).toBe("function");
  });
});
