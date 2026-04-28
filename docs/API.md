# Distro Buzz API Reference

Complete API documentation for Distro Buzz's REST and tRPC endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a valid session cookie set by OAuth login.

### Login

```
GET /oauth/login?returnTo=/dashboard
```

Redirects to Manus OAuth provider.

### Callback

```
GET /oauth/callback?code=...&state=...
```

Handled automatically by the system. Sets session cookie.

### Logout

```
POST /api/trpc/auth.logout
```

Clears session cookie.

## tRPC Procedures

Distro Buzz uses tRPC for type-safe client-server communication. All procedures are accessed via `/api/trpc`.

### Authentication

#### `auth.me`

Get current authenticated user.

**Query**
```typescript
const user = await trpc.auth.me.useQuery();
```

**Response**
```typescript
{
  id: string;
  openId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

#### `auth.logout`

Logout current user.

**Mutation**
```typescript
await trpc.auth.logout.useMutation();
```

**Response**
```typescript
{ success: true }
```

### Tracks

#### `tracks.list`

Get all tracks for current artist.

**Query**
```typescript
const { data, isLoading } = trpc.tracks.list.useQuery({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

**Response**
```typescript
{
  tracks: Track[];
  total: number;
  page: number;
  limit: number;
}
```

#### `tracks.get`

Get a specific track by ID.

**Query**
```typescript
const { data } = trpc.tracks.get.useQuery(trackId);
```

**Response**
```typescript
{
  id: string;
  title: string;
  description: string;
  duration_ms: number;
  genre: string;
  release_date: Date;
  distribution_status: {
    overall: 'queued' | 'processing' | 'live' | 'failed';
    platforms: Record<string, PlatformStatus>;
  };
  distribution_coverage_score: number;
}
```

#### `tracks.create`

Create a new track.

**Mutation**
```typescript
await trpc.tracks.create.useMutation({
  title: 'My Track',
  description: 'Track description',
  audioFile: File,
  artworkFile: File,
  genre: 'Electronic',
  releaseDate: new Date(),
  platforms: ['spotify', 'apple_music', 'youtube']
});
```

**Response**
```typescript
{
  id: string;
  title: string;
  // ... full track object
}
```

#### `tracks.distribute`

Trigger distribution for a track.

**Mutation**
```typescript
await trpc.tracks.distribute.useMutation({
  trackId: string;
  platforms: string[]; // Optional, uses default if not provided
});
```

**Response**
```typescript
{
  jobIds: string[];
  message: string;
}
```

### Distribution Jobs

#### `jobs.list`

Get all distribution jobs.

**Query**
```typescript
const { data } = trpc.jobs.list.useQuery({
  trackId?: string;
  platformId?: string;
  status?: 'queued' | 'processing' | 'live' | 'failed' | 'retrying';
  page: 1,
  limit: 50
});
```

**Response**
```typescript
{
  jobs: DistributionJob[];
  total: number;
}
```

#### `jobs.get`

Get a specific job.

**Query**
```typescript
const { data } = trpc.jobs.get.useQuery(jobId);
```

**Response**
```typescript
{
  id: string;
  trackId: string;
  platformId: string;
  status: string;
  retryCount: number;
  errorMessage?: string;
  platformTrackId?: string;
  platformUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `jobs.retry`

Manually retry a failed job.

**Mutation**
```typescript
await trpc.jobs.retry.useMutation(jobId);
```

**Response**
```typescript
{
  success: true;
  message: string;
}
```

#### `jobs.cancel`

Cancel a pending job.

**Mutation**
```typescript
await trpc.jobs.cancel.useMutation(jobId);
```

**Response**
```typescript
{
  success: true;
  message: string;
}
```

### Distribution Logs

#### `logs.list`

Get logs for a specific job.

**Query**
```typescript
const { data } = trpc.logs.list.useQuery({
  jobId: string;
  page: 1;
  limit: 100;
});
```

**Response**
```typescript
{
  logs: DistributionLog[];
  total: number;
}
```

### Platforms

#### `platforms.list`

Get all supported platforms.

**Query**
```typescript
const { data } = trpc.platforms.list.useQuery();
```

**Response**
```typescript
{
  platforms: Platform[];
}
```

**Platform Object**
```typescript
{
  id: string;
  name: string;
  category: 'streaming' | 'social' | 'aggregator' | 'niche';
  integrationMethod: 'direct_api' | 'aggregator' | 'manual';
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: Date;
  estimatedTimeToLive: string; // e.g., "24-48h"
  priority: number;
  enabled: boolean;
}
```

#### `platforms.health`

Get health status of all platforms.

**Query**
```typescript
const { data } = trpc.platforms.health.useQuery();
```

**Response**
```typescript
{
  platforms: Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    responseTime: number;
    errorRate: number;
  }>;
  overallHealth: number; // 0-100
}
```

### Analytics

#### `analytics.distribution`

Get distribution analytics for a track.

**Query**
```typescript
const { data } = trpc.analytics.distribution.useQuery({
  trackId: string;
  days: 30; // Last N days
});
```

**Response**
```typescript
{
  platformsLiveOverTime: Array<{ date: Date; count: number }>;
  platformFailureRates: Record<string, number>;
  averageTimeToLive: number; // in hours
  healthScore: number; // 0-100
  coverageScore: number; // 0-1
}
```

#### `analytics.system`

Get system-wide analytics (admin only).

**Query**
```typescript
const { data } = trpc.analytics.system.useQuery({
  days: 30;
});
```

**Response**
```typescript
{
  totalTracks: number;
  totalJobs: number;
  successRate: number;
  averageTimeToLive: number;
  platformStats: Record<string, {
    successRate: number;
    failureRate: number;
    averageTimeToLive: number;
  }>;
}
```

### Admin

#### `admin.jobs.list`

Get all distribution jobs (admin only).

**Query**
```typescript
const { data } = trpc.admin.jobs.list.useQuery({
  status?: string;
  page: 1;
  limit: 100;
});
```

#### `admin.jobs.cancel`

Cancel a job (admin only).

**Mutation**
```typescript
await trpc.admin.jobs.cancel.useMutation(jobId);
```

#### `admin.platforms.health`

Get detailed platform health (admin only).

**Query**
```typescript
const { data } = trpc.admin.platforms.health.useQuery();
```

#### `admin.system.stats`

Get system statistics (admin only).

**Query**
```typescript
const { data } = trpc.admin.system.stats.useQuery();
```

**Response**
```typescript
{
  queueDepth: number;
  activeWorkers: number;
  totalArtists: number;
  totalTracks: number;
  systemHealth: number; // 0-100
  uptime: number; // in seconds
}
```

## WebSocket Events

Real-time updates via Socket.io.

### Client → Server

```typescript
// Subscribe to track distribution updates
socket.emit('subscribe:distribution', { trackId: string });

// Unsubscribe
socket.emit('unsubscribe:distribution', { trackId: string });
```

### Server → Client

```typescript
// Job status update
socket.on('distribution:job:status', {
  trackId: string;
  jobId: string;
  platformId: string;
  status: string;
  timestamp: Date;
  message: string;
});

// Track distribution complete
socket.on('distribution:track:complete', {
  trackId: string;
  coverageScore: number;
  platformsLive: number;
  totalPlatforms: number;
});

// Job failed
socket.on('distribution:job:failed', {
  trackId: string;
  jobId: string;
  platformId: string;
  errorMessage: string;
  nextRetryAt: Date;
});

// Platform health changed
socket.on('platform:health:changed', {
  platformId: string;
  status: 'healthy' | 'degraded' | 'down';
  timestamp: Date;
});
```

## Error Handling

All endpoints return standard error responses:

```typescript
{
  error: {
    code: string; // 'UNAUTHORIZED', 'NOT_FOUND', 'INTERNAL_SERVER_ERROR', etc.
    message: string;
    details?: Record<string, any>;
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` — User not authenticated
- `FORBIDDEN` — User lacks permission
- `NOT_FOUND` — Resource not found
- `VALIDATION_ERROR` — Invalid input
- `RATE_LIMITED` — Too many requests
- `INTERNAL_SERVER_ERROR` — Server error

## Rate Limiting

- **Per User**: 100 requests/minute
- **Per IP**: 1,000 requests/minute
- **Per Platform API**: Varies by platform

## Pagination

List endpoints support pagination:

```typescript
{
  page: number; // 1-indexed
  limit: number; // 1-100, default 20
  total: number;
  data: T[];
}
```

## Versioning

API is currently at v1. Future versions will be indicated by `/api/v2/`, etc.

## Support

For API issues or questions:
- [GitHub Issues](https://github.com/ereezyy/distro-buzz/issues)
- [GitHub Discussions](https://github.com/ereezyy/distro-buzz/discussions)
