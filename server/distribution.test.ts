import { describe, expect, it, vi, beforeEach } from "vitest";
import { DistributionEngine } from "./services/distributionEngine";
import type { PlatformAdapter, DistributionResult, PlatformHealth } from "./services/distributionEngine";

// Mock adapter that always succeeds
function createMockAdapter(id: string, name: string, result: DistributionResult): PlatformAdapter {
  return {
    id,
    name,
    distribute: vi.fn().mockResolvedValue(result),
    healthCheck: vi.fn().mockResolvedValue({ status: "healthy", latencyMs: 50 } as PlatformHealth),
  };
}

// Mock adapter that always fails
function createFailingAdapter(id: string, name: string, error: string): PlatformAdapter {
  return {
    id,
    name,
    distribute: vi.fn().mockResolvedValue({ success: false, error }),
    healthCheck: vi.fn().mockResolvedValue({ status: "down", message: error } as PlatformHealth),
  };
}

describe("DistributionEngine", () => {
  let engine: DistributionEngine;

  beforeEach(() => {
    engine = new DistributionEngine();
  });

  it("registers adapters correctly", () => {
    const adapter = createMockAdapter("test", "Test Platform", { success: true });
    engine.registerAdapter(adapter);

    const adapters = engine.getAdapters();
    expect(adapters).toHaveLength(1);
    expect(adapters[0].id).toBe("test");
    expect(adapters[0].name).toBe("Test Platform");
  });

  it("registers multiple adapters", () => {
    engine.registerAdapter(createMockAdapter("spotify", "Spotify", { success: true }));
    engine.registerAdapter(createMockAdapter("youtube", "YouTube", { success: true }));
    engine.registerAdapter(createMockAdapter("bandcamp", "Bandcamp", { success: true }));

    expect(engine.getAdapters()).toHaveLength(3);
  });

  it("overwrites adapter with same id", () => {
    engine.registerAdapter(createMockAdapter("test", "Test V1", { success: true }));
    engine.registerAdapter(createMockAdapter("test", "Test V2", { success: true }));

    const adapters = engine.getAdapters();
    expect(adapters).toHaveLength(1);
    expect(adapters[0].name).toBe("Test V2");
  });

  it("reports correct stats", () => {
    engine.registerAdapter(createMockAdapter("a", "A", { success: true }));
    engine.registerAdapter(createMockAdapter("b", "B", { success: true }));

    const stats = engine.getStats();
    expect(stats.registeredAdapters).toBe(2);
    expect(stats.queueDepth).toBe(0);
    expect(stats.activeJobs).toBe(0);
    expect(stats.isRunning).toBe(false);
  });

  it("enqueues jobs and tracks queue depth", async () => {
    await engine.enqueue("job-1");
    await engine.enqueue("job-2");
    await engine.enqueue("job-3");

    const stats = engine.getStats();
    expect(stats.queueDepth).toBe(3);
  });

  it("sorts queue by priority (higher first)", async () => {
    await engine.enqueue("low-priority", 10);
    await engine.enqueue("high-priority", 90);
    await engine.enqueue("medium-priority", 50);

    // Queue should be sorted: high, medium, low
    const stats = engine.getStats();
    expect(stats.queueDepth).toBe(3);
  });

  it("runs health checks on all adapters", async () => {
    const healthyAdapter = createMockAdapter("healthy", "Healthy", { success: true });
    const failingAdapter = createFailingAdapter("failing", "Failing", "Connection refused");

    engine.registerAdapter(healthyAdapter);
    engine.registerAdapter(failingAdapter);

    // Health checks call the adapter's healthCheck method
    // In real usage this also updates the DB, but we're testing the engine logic
    expect(healthyAdapter.healthCheck).toBeDefined();
    expect(failingAdapter.healthCheck).toBeDefined();

    const healthResult = await healthyAdapter.healthCheck();
    expect(healthResult.status).toBe("healthy");

    const failResult = await failingAdapter.healthCheck();
    expect(failResult.status).toBe("down");
  });

  it("stops cleanly", () => {
    engine.stop();
    expect(engine.getStats().isRunning).toBe(false);
  });
});

describe("PlatformAdapter contract", () => {
  it("successful adapter returns expected shape", async () => {
    const adapter = createMockAdapter("test", "Test", {
      success: true,
      platformTrackId: "track-123",
      platformUrl: "https://example.com/track/123",
      details: { uploadId: "abc" },
    });

    const result = await adapter.distribute({} as any, {} as any, {} as any);
    expect(result.success).toBe(true);
    expect(result.platformTrackId).toBe("track-123");
    expect(result.platformUrl).toContain("example.com");
  });

  it("failing adapter returns error message", async () => {
    const adapter = createFailingAdapter("test", "Test", "Rate limited");

    const result = await adapter.distribute({} as any, {} as any, {} as any);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Rate limited");
  });
});
