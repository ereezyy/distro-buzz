import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import * as db from "./db";
import * as authService from "./services/authService";

// ============================================================================
// ARTISTS ROUTER
// ============================================================================

const artistsRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const artist = await db.getArtistByUserId(ctx.user.id);
    return artist;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        soundcloudUsername: z.string().optional(),
        bio: z.string().optional(),
        websiteUrl: z.string().optional(),
        distributionPreferences: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const artist = await db.createArtist({
        id: uuidv4(),
        userId: ctx.user.id,
        name: input.name,
        email: ctx.user.email || "",
        soundcloudUsername: input.soundcloudUsername,
        bio: input.bio,
        websiteUrl: input.websiteUrl,
        distributionPreferences: input.distributionPreferences,
      });

      return artist;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        bio: z.string().optional(),
        websiteUrl: z.string().optional(),
        soundcloudUsername: z.string().optional(),
        soundcloudAccessToken: z.string().optional(),
        distributionPreferences: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const artist = await db.updateArtist(input.id, {
        name: input.name,
        bio: input.bio,
        websiteUrl: input.websiteUrl,
        soundcloudUsername: input.soundcloudUsername,
        soundcloudAccessToken: input.soundcloudAccessToken,
        distributionPreferences: input.distributionPreferences,
      });

      return artist;
    }),
});

// ============================================================================
// TRACKS ROUTER
// ============================================================================

const tracksRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const artist = await db.getArtistByUserId(ctx.user.id);
      if (!artist) return { tracks: [], total: 0 };

      const offset = (input.page - 1) * input.limit;
      const tracks = await db.getTracksByArtistId(artist.id, input.limit, offset);

      return {
        tracks,
        page: input.page,
        limit: input.limit,
        total: tracks.length,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.getTrackById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        genre: z.string().optional(),
        releaseDate: z.date().optional(),
        audioFileKey: z.string(),
        artworkFileKey: z.string().optional(),
        platforms: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const artist = await db.getArtistByUserId(ctx.user.id);
      if (!artist) throw new Error("Artist profile not found");

      const track = await db.createTrack({
        id: uuidv4(),
        artistId: artist.id,
        title: input.title,
        description: input.description,
        genre: input.genre,
        releaseDate: input.releaseDate,
        audioFileKey: input.audioFileKey,
        artworkFileKey: input.artworkFileKey,
        distributionConfig: {
          platforms: input.platforms || [],
          autoPublish: true,
        },
        distributionStatus: {
          overall: "queued",
          platforms: {},
        },
      });

      return track;
    }),

  distribute: protectedProcedure
    .input(
      z.object({
        trackId: z.string(),
        platforms: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const track = await db.getTrackById(input.trackId);
      if (!track) throw new Error("Track not found");

      const artist = await db.getArtistByUserId(ctx.user.id);
      if (!artist || artist.id !== track.artistId) {
        throw new Error("Unauthorized");
      }

      const platforms = input.platforms || (track.distributionConfig as any)?.platforms || [];
      const jobIds: string[] = [];

      for (const platformId of platforms) {
        const job = await db.createDistributionJob({
          id: uuidv4(),
          trackId: track.id,
          platformId,
          status: "queued",
          retryCount: 0,
          maxRetries: 7,
        });

        if (job) {
          jobIds.push(job.id);
        }
      }

      return {
        trackId: track.id,
        jobIds,
        message: `Distribution queued for ${jobIds.length} platform(s)`,
      };
    }),
});

// ============================================================================
// DISTRIBUTION JOBS ROUTER
// ============================================================================

const jobsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        trackId: z.string().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      let jobs: any[] = [];

      if (input.trackId) {
        jobs = await db.getDistributionJobsByTrackId(input.trackId);
      } else if (input.status) {
        jobs = await db.getDistributionJobsByStatus(input.status, input.limit);
      }

      return {
        jobs,
        total: jobs.length,
        page: input.page,
        limit: input.limit,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.getDistributionJobById(input.id);
    }),

  retry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const job = await db.getDistributionJobById(input.id);
      if (!job) throw new Error("Job not found");

      const updated = await db.updateDistributionJob(input.id, {
        status: "retrying",
        nextRetryAt: new Date(Date.now() + 60000), // Retry in 1 minute
      });

      return {
        success: !!updated,
        job: updated,
      };
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const job = await db.getDistributionJobById(input.id);
      if (!job) throw new Error("Job not found");

      const updated = await db.updateDistributionJob(input.id, {
        status: "failed",
        errorMessage: "Cancelled by user",
      });

      return {
        success: !!updated,
        job: updated,
      };
    }),
});

// ============================================================================
// DISTRIBUTION LOGS ROUTER
// ============================================================================

const logsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      const logs = await db.getDistributionLogsByJobId(input.jobId, input.limit);
      return {
        logs,
        total: logs.length,
      };
    }),
});

// ============================================================================
// PLATFORMS ROUTER
// ============================================================================

const platformsRouter = router({
  list: publicProcedure.query(async () => {
    const platforms = await db.getPlatformRegistry();
    return { platforms };
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.getPlatformById(input.id);
    }),

  health: publicProcedure.query(async () => {
    const platforms = await db.getPlatformRegistry();
    const health = platforms.reduce(
      (acc, p) => {
        acc[p.id] = {
          status: p.healthStatus,
          lastCheck: p.lastHealthCheck,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    return {
      platforms: health,
      timestamp: new Date(),
    };
  }),
});

// ============================================================================
// ANALYTICS ROUTER
// ============================================================================

const analyticsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");

    const artist = await db.getArtistByUserId(ctx.user.id);
    if (!artist) return { totalTracks: 0, totalJobs: 0, platformCoverage: {}, recentActivity: [] };

    const allTracks = await db.getTracksByArtistId(artist.id, 1000, 0);
    const platforms = await db.getPlatformRegistry();

    // Count jobs by status across all tracks
    let totalJobs = 0;
    let liveJobs = 0;
    let failedJobs = 0;
    let processingJobs = 0;
    const platformCoverage: Record<string, { live: number; total: number }> = {};

    for (const track of allTracks) {
      const jobs = await db.getDistributionJobsByTrackId(track.id);
      totalJobs += jobs.length;

      for (const job of jobs) {
        if (job.status === "live" || (job.status as string) === "success") liveJobs++;
        else if (job.status === "failed") failedJobs++;
        else processingJobs++;

        if (!platformCoverage[job.platformId]) {
          platformCoverage[job.platformId] = { live: 0, total: 0 };
        }
        platformCoverage[job.platformId].total++;
        if (job.status === "live" || (job.status as string) === "success") {
          platformCoverage[job.platformId].live++;
        }
      }
    }

    // Platform failure rates
    const platformStats = Object.entries(platformCoverage).map(([id, stats]) => {
      const platform = platforms.find((p) => p.id === id);
      return {
        platformId: id,
        platformName: platform?.name || id,
        liveCount: stats.live,
        totalCount: stats.total,
        successRate: stats.total > 0 ? Math.round((stats.live / stats.total) * 100) : 0,
      };
    });

    return {
      totalTracks: allTracks.length,
      totalJobs,
      liveJobs,
      failedJobs,
      processingJobs,
      healthScore: totalJobs > 0 ? Math.round((liveJobs / totalJobs) * 100) : 100,
      platformStats,
      totalPlatforms: platforms.length,
    };
  }),
});

// ============================================================================
// ADMIN ROUTER (owner-only)
// ============================================================================

const adminRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");

    const platforms = await db.getPlatformRegistry();
    const queuedJobs = await db.getDistributionJobsByStatus("queued", 500);
    const processingJobs = await db.getDistributionJobsByStatus("processing", 500);
    const failedJobs = await db.getDistributionJobsByStatus("failed", 500);
    const retryingJobs = await db.getDistributionJobsByStatus("retrying", 500);

    const healthyPlatforms = platforms.filter((p) => p.healthStatus === "healthy").length;
    const degradedPlatforms = platforms.filter((p) => p.healthStatus === "degraded").length;
    const downPlatforms = platforms.filter((p) => p.healthStatus === "down").length;

    return {
      queue: {
        queued: queuedJobs.length,
        processing: processingJobs.length,
        failed: failedJobs.length,
        retrying: retryingJobs.length,
        total: queuedJobs.length + processingJobs.length + failedJobs.length + retryingJobs.length,
      },
      platforms: {
        total: platforms.length,
        healthy: healthyPlatforms,
        degraded: degradedPlatforms,
        down: downPlatforms,
      },
      recentFailedJobs: failedJobs.slice(0, 20),
      recentQueuedJobs: queuedJobs.slice(0, 20),
    };
  }),

  allJobs: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");

      if (input.status) {
        const jobs = await db.getDistributionJobsByStatus(input.status, input.limit);
        return { jobs, total: jobs.length };
      }

      // Get all active jobs
      const queued = await db.getDistributionJobsByStatus("queued", input.limit);
      const processing = await db.getDistributionJobsByStatus("processing", input.limit);
      const retrying = await db.getDistributionJobsByStatus("retrying", input.limit);
      const jobs = [...queued, ...processing, ...retrying];

      return { jobs, total: jobs.length };
    }),

  triggerJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");

      const updated = await db.updateDistributionJob(input.id, {
        status: "queued",
        nextRetryAt: new Date(),
      });

      return { success: !!updated, job: updated };
    }),

  pauseJob: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") throw new Error("Forbidden");

      const updated = await db.updateDistributionJob(input.id, {
        status: "failed",
        errorMessage: "Paused by admin",
      });

      return { success: !!updated, job: updated };
    }),
});

// ============================================================================
// CUSTOM AUTH ROUTER (JWT-based email/password)
// ============================================================================

const customAuthRouter = router({
  signup: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      const tokens = await authService.signup(input.email, input.password, input.name);
      return tokens;
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const tokens = await authService.login(input.email, input.password);
      return tokens;
    }),

  refresh: publicProcedure
    .input(z.object({
      refreshToken: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await authService.refreshAccessToken(input.refreshToken);
      return result;
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const result = await authService.requestPasswordReset(input.email);
      return { success: true, message: "If an account exists with that email, a reset link has been sent." };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      await authService.resetPassword(input.token, input.newPassword);
      return { success: true };
    }),
});

// ============================================================================
// AGGREGATORS ROUTER
// ============================================================================

const aggregatorsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getAggregatorAccountsByArtistId(String(ctx.user.id));
  }),

  connect: protectedProcedure
    .input(z.object({
      aggregatorId: z.string(),
      apiKey: z.string().optional(),
      accountName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = uuidv4();
      await db.createAggregatorAccount({
        id,
        artistId: String(ctx.user.id),
        aggregatorId: input.aggregatorId,
        accountName: input.accountName,
        apiKey: input.apiKey,
        accountStatus: "active",
      });
      return { success: true, id };
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  artists: artistsRouter,
  tracks: tracksRouter,
  jobs: jobsRouter,
  logs: logsRouter,
  platforms: platformsRouter,
  analytics: analyticsRouter,
  admin: adminRouter,
  customAuth: customAuthRouter,
  aggregators: aggregatorsRouter,
});

export type AppRouter = typeof appRouter;
