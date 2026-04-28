import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import * as db from "./db";

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
});

export type AppRouter = typeof appRouter;
