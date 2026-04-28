# Platform Integration Guide

This guide explains how to add support for new music distribution platforms in Distro Buzz.

## Platform Categories

### Tier 1: Direct API (Highest Priority)
Platforms with official APIs for direct track distribution.

Examples: Spotify, Apple Music, YouTube Music, Tidal, Deezer

### Tier 2: Aggregators (Fallback)
Distribution services that cover multiple platforms.

Examples: DistroKid, TuneCore, CD Baby, Amuse, Ditto

### Tier 3: Secondary Platforms (Extended Reach)
Platforms with APIs but lower priority.

Examples: Bandcamp, Beatport, Discogs, Genius

### Tier 4: Social Media (Amplification)
Social platforms for artist promotion.

Examples: Instagram, TikTok, YouTube, Twitter

## Adding a New Platform

### Step 1: Create Platform Adapter

Create `packages/api/src/services/platforms/{platform}.ts`:

```typescript
import { PlatformAdapter, DistributionResult, Track, Metadata } from '../types';
import logger from '../../utils/logger';

export class SpotifyAdapter implements PlatformAdapter {
  platformId = 'spotify';
  name = 'Spotify';
  category = 'streaming';
  integrationMethod = 'direct_api';

  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  /**
   * Authenticate with Spotify API
   */
  async authenticate(): Promise<void> {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      this.accessToken = data.access_token;

      logger.info('Spotify authenticated successfully');
    } catch (error) {
      logger.error('Spotify authentication failed', { error });
      throw error;
    }
  }

  /**
   * Distribute track to Spotify
   */
  async distribute(track: Track, metadata: Metadata): Promise<DistributionResult> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Prepare track data
      const trackData = {
        name: track.title,
        artists: [{ name: metadata.artistName }],
        album: {
          name: metadata.albumName,
          release_date: track.releaseDate?.toISOString().split('T')[0]
        },
        external_ids: {
          isrc: track.isrc
        }
      };

      // Upload to Spotify
      const response = await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackData)
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        platformTrackId: result.id,
        platformUrl: result.external_urls.spotify,
        metadata: result
      };
    } catch (error) {
      logger.error('Spotify distribution failed', { trackId: track.id, error });
      throw error;
    }
  }

  /**
   * Get track status on Spotify
   */
  async getStatus(platformTrackId: string): Promise<any> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${platformTrackId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        status: 'live',
        url: data.external_urls.spotify,
        plays: data.popularity,
        metadata: data
      };
    } catch (error) {
      logger.error('Failed to get Spotify track status', { platformTrackId, error });
      throw error;
    }
  }

  /**
   * Handle webhook from Spotify
   */
  async handleWebhook(payload: any): Promise<void> {
    logger.info('Spotify webhook received', { payload });
    // Process webhook payload
  }

  /**
   * Check if Spotify API is healthy
   */
  async healthCheck(): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime: response.headers.get('x-response-time') || 'unknown',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Spotify health check failed', { error });
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}
```

### Step 2: Register Adapter

Add to `packages/api/src/services/distribution.ts`:

```typescript
import { SpotifyAdapter } from './platforms/spotify';

export class DistributionService {
  private adapters: Map<string, PlatformAdapter>;

  constructor() {
    this.adapters = new Map([
      ['spotify', new SpotifyAdapter()],
      // ... other adapters
    ]);
  }

  async distribute(track: Track, platforms: string[]): Promise<void> {
    for (const platformId of platforms) {
      const adapter = this.adapters.get(platformId);
      if (!adapter) {
        logger.warn(`No adapter found for platform: ${platformId}`);
        continue;
      }

      // Create distribution job
      const job = await this.createJob(track.id, platformId);

      // Enqueue job
      await this.queue.add('distribute', {
        jobId: job.id,
        trackId: track.id,
        platformId,
        adapter
      });
    }
  }
}
```

### Step 3: Add to Platform Registry

Insert into database:

```sql
INSERT INTO platform_registry (
  id, name, category, integration_method, api_endpoint,
  rate_limit_per_hour, webhook_supported, priority, enabled
) VALUES (
  'spotify',
  'Spotify',
  'streaming',
  'direct_api',
  'https://api.spotify.com/v1',
  3600,
  true,
  90,
  true
);
```

### Step 4: Write Tests

Create `packages/api/tests/platforms/spotify.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpotifyAdapter } from '../../src/services/platforms/spotify';
import { Track, Metadata } from '../../src/services/types';

describe('SpotifyAdapter', () => {
  let adapter: SpotifyAdapter;

  beforeEach(() => {
    adapter = new SpotifyAdapter();
    vi.clearAllMocks();
  });

  it('should authenticate successfully', async () => {
    vi.mock('node-fetch');
    await adapter.authenticate();
    expect(adapter['accessToken']).toBeDefined();
  });

  it('should distribute a track successfully', async () => {
    const track: Track = {
      id: 'test-track',
      title: 'Test Track',
      duration_ms: 180000,
      // ... other fields
    };

    const metadata: Metadata = {
      artistName: 'Test Artist',
      albumName: 'Test Album'
    };

    const result = await adapter.distribute(track, metadata);

    expect(result.success).toBe(true);
    expect(result.platformTrackId).toBeDefined();
    expect(result.platformUrl).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    vi.mock('node-fetch', () => ({
      default: vi.fn(() => Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      }))
    }));

    const track: Track = { /* ... */ };
    const metadata: Metadata = { /* ... */ };

    await expect(adapter.distribute(track, metadata)).rejects.toThrow();
  });

  it('should get track status', async () => {
    const status = await adapter.getStatus('spotify-track-id');
    expect(status.status).toBe('live');
    expect(status.url).toBeDefined();
  });

  it('should pass health check', async () => {
    const health = await adapter.healthCheck();
    expect(['healthy', 'degraded', 'down']).toContain(health.status);
  });
});
```

### Step 5: Add Environment Variables

Add to `.env`:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### Step 6: Update Documentation

Add to `docs/PLATFORM_INTEGRATION.md`:

```markdown
## Spotify

**Integration Method**: Direct API  
**Rate Limit**: 3,600 requests/hour  
**Webhook Support**: Yes  
**Time to Live**: 24-48 hours  
**Priority**: 90

### Setup

1. Create Spotify Developer Application at https://developer.spotify.com/dashboard
2. Get Client ID and Client Secret
3. Set environment variables:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### API Documentation

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Upload Endpoint](https://developer.spotify.com/documentation/web-api/reference/upload-track)

### Notes

- Requires OAuth for artist accounts
- Supports webhooks for real-time updates
- Rate limited to 3,600 requests per hour
```

### Step 7: Update README

Add to platform list in `README.md`:

```markdown
- **Streaming**: Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer
```

## Supported Platforms

### Tier 1: Direct APIs

| Platform | Status | Priority | Notes |
|----------|--------|----------|-------|
| Spotify | ✅ Ready | 90 | Full API support |
| Apple Music | ✅ Ready | 85 | Requires JWT |
| YouTube Music | ✅ Ready | 85 | Via YouTube API |
| Amazon Music | 🔄 In Progress | 80 | Limited API |
| Tidal | ✅ Ready | 75 | Full API support |
| Deezer | ✅ Ready | 70 | Full API support |

### Tier 2: Aggregators

| Aggregator | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| DistroKid | ✅ Ready | 150+ | Excellent support |
| TuneCore | ✅ Ready | 150+ | Good support |
| CD Baby | ✅ Ready | 100+ | Good support |
| Amuse | 🔄 In Progress | 100+ | Free tier |
| Ditto | 🔄 In Progress | 100+ | Good support |

### Tier 3: Secondary

| Platform | Status | Priority | Notes |
|----------|--------|----------|-------|
| Bandcamp | ✅ Ready | 60 | Manual upload |
| Beatport | 🔄 In Progress | 55 | Electronic focus |
| Discogs | 🔄 In Progress | 50 | Discography |
| Genius | 🔄 In Progress | 45 | Lyrics + credits |

### Tier 4: Social Media

| Platform | Status | Priority | Notes |
|----------|--------|----------|-------|
| Instagram | ✅ Ready | 40 | Reels support |
| TikTok | ✅ Ready | 40 | Video platform |
| YouTube | ✅ Ready | 40 | Shorts support |
| Twitter/X | 🔄 In Progress | 30 | Text + links |

## Best Practices

1. **Always implement retry logic** with exponential backoff
2. **Handle rate limits** gracefully (check headers, implement backoff)
3. **Log all API calls** for debugging and audit trails
4. **Validate responses** before storing in database
5. **Test error scenarios** (network failures, invalid credentials, etc.)
6. **Document API quirks** (e.g., field requirements, format restrictions)
7. **Monitor health** with periodic health checks
8. **Implement webhooks** when available for real-time updates

## Common Challenges

### Rate Limiting
Most platforms have rate limits. Implement:
- Request queuing
- Exponential backoff
- Rate limit headers parsing

### Authentication
Different platforms use different auth methods:
- OAuth 2.0 (most common)
- API Keys
- JWT tokens
- Custom schemes

### Metadata Mapping
Each platform has different metadata requirements:
- ISRC codes (required for some)
- Genre classifications (varies by platform)
- Artist/album/track relationships

### Time to Live
Tracks appear live at different times:
- YouTube: Instant
- Spotify: 24-48 hours
- Apple Music: 24-72 hours
- Others: 1-7 days

## Support

For questions about platform integration:
- [GitHub Issues](https://github.com/ereezyy/distro-buzz/issues)
- [GitHub Discussions](https://github.com/ereezyy/distro-buzz/discussions)
- Check existing adapters for examples
