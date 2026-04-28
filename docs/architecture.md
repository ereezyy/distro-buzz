# Distro Buzz: AI-Powered Omnipresent Music Distribution System

**Architecture & System Design Document**

---

## Executive Summary

**Distro Buzz** is an open-source, self-hosted music distribution platform that transforms independent musicians into global superstars by automating the distribution of their music to every platform on Earth. One track upload triggers a cascade of intelligent distribution agents that simultaneously push audio, metadata, and promotional content across 50+ platforms, aggregators, and social networks.

The system is built on principles of **resilience**, **transparency**, and **artist empowerment**. Every distribution action is logged, monitored, and retryable. Failures trigger automatic fallback chains. Real-time dashboards give artists complete visibility into where their music lives and how it's performing.

---

## 1. System Philosophy & Core Principles

### 1.1 Artist-First Design
- Artists own their data and distribution decisions
- No vendor lock-in; export everything anytime
- Transparent pricing (free tier + optional paid features)
- Privacy-first: artist data never sold or shared

### 1.2 Omnipresence Strategy
**Goal**: One track, infinite reach. The system treats music distribution as a graph problem—maximize nodes (platforms) and edges (connections) to ensure saturation.

**Core Logic**:
1. Primary APIs (direct platform integrations): Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer
2. Aggregator fallbacks (DistroKid, TuneCore, CD Baby, Amuse, Ditto, ONErpm, RouteNote, DistroScale)
3. Secondary platforms (Bandcamp, SoundCloud, Audiomatch, Beatport, Traxsource, Juno, Discogs, Genius)
4. Social amplification (Instagram, TikTok, YouTube, Twitch, Twitter/X, Patreon, Substack)
5. Emerging/niche platforms (Audius, Catalog, Royal, Zora, Foundation)

### 1.3 Resilience & Retry Philosophy
- Every distribution job has exponential backoff retry logic (3 attempts minimum, 7 days max)
- Platform API failures trigger automatic aggregator fallback
- Aggregator failures trigger manual workaround queue (email to platform, API request, etc.)
- Failed jobs never silently disappear; they surface in the dashboard with clear remediation paths

### 1.4 Real-Time Transparency
- Every action logged with timestamp, status, error details, and retry count
- Live webhooks from platforms push status updates instantly (not just polling)
- Dashboard updates in real-time as distribution progresses
- Artists get email/SMS/push notifications at key milestones

---

## 2. Tech Stack & Justification

### 2.1 Backend
- **Node.js + TypeScript**: Type safety, async-first, massive ecosystem for music APIs
- **Express.js**: Lightweight, battle-tested, perfect for microservices
- **PostgreSQL**: ACID transactions critical for job queue integrity; JSON support for flexible metadata
- **Redis**: Job queue (Bull), caching, real-time pub/sub for WebSocket updates
- **Bull Queue**: Distributed job processing with retry logic, persistence, and monitoring

### 2.2 Frontend
- **React 19 + Tailwind CSS 4**: Modern, performant, dark mode native
- **tRPC**: End-to-end type safety between frontend and backend
- **Recharts**: Real-time data visualization for distribution analytics
- **WebSocket (Socket.io)**: Live dashboard updates as jobs progress
- **Dark Cyberpunk/Neon Theme**: High contrast, glowing accents, emphasizes real-time data flow

### 2.3 Infrastructure
- **Docker Compose**: Local dev, easy deployment
- **GitHub Actions**: CI/CD for testing and deployment
- **S3-compatible storage**: Audio files, metadata, logs
- **Sentry**: Error tracking and performance monitoring

### 2.4 External Integrations
- **SoundCloud API**: Monitor artist profiles for new releases
- **Spotify Web API**: Direct distribution + metadata sync
- **Apple Music API**: Direct distribution (via aggregator or direct)
- **YouTube API**: Video upload + music video generation
- **WaveForge API**: Audio-reactive music video generation
- **DistroKid/TuneCore/CD Baby APIs**: Aggregator fallbacks
- **Twilio**: SMS notifications for critical events
- **SendGrid**: Email notifications and artist communications

---

## 3. Data Model & Schema

### 3.1 Core Entities

```sql
-- Artists (users who own tracks)
CREATE TABLE artists (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  soundcloud_username VARCHAR(255),
  soundcloud_access_token TEXT,
  soundcloud_user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  distribution_preferences JSONB, -- { platforms: [...], auto_publish: true, ... }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tracks (individual songs/releases)
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id),
  soundcloud_track_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url TEXT, -- S3 path
  audio_file_key TEXT, -- S3 key for retrieval
  duration_ms INTEGER,
  genre VARCHAR(100),
  mood JSONB, -- { energy: 0.8, valence: 0.6, ... } from AI analysis
  isrc VARCHAR(20), -- International Standard Recording Code
  release_date DATE,
  artwork_url TEXT, -- S3 path
  artwork_file_key TEXT,
  metadata JSONB, -- { lyrics, credits, production_notes, ... }
  distribution_config JSONB, -- { platforms: [...], price_tier: 'free', ... }
  distribution_status JSONB, -- { overall: 'in_progress', platforms: {...} }
  distribution_coverage_score DECIMAL(3,2), -- 0.0-1.0 (7/9 platforms = 0.78)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Distribution Jobs (one per track per platform)
CREATE TABLE distribution_jobs (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES tracks(id),
  platform_id VARCHAR(100) NOT NULL, -- 'spotify', 'apple_music', 'youtube', etc.
  aggregator_id VARCHAR(100), -- 'distrokid', 'tunecore', null if direct API
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, live, failed, retrying, fallback
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 7,
  error_message TEXT,
  error_details JSONB,
  platform_track_id VARCHAR(255), -- Spotify URI, Apple Music ID, etc.
  platform_url TEXT,
  platform_response JSONB, -- Full API response for debugging
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Distribution Job Logs (audit trail for every action)
CREATE TABLE distribution_logs (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES distribution_jobs(id),
  action VARCHAR(100), -- 'api_call', 'retry', 'fallback_triggered', 'manual_intervention', etc.
  status VARCHAR(50), -- 'success', 'failure', 'pending'
  message TEXT,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Platform API Registry (catalog of all supported platforms)
CREATE TABLE platform_registry (
  id VARCHAR(100) PRIMARY KEY, -- 'spotify', 'apple_music', 'youtube', etc.
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'streaming', 'social', 'aggregator', 'niche'
  integration_method VARCHAR(50), -- 'direct_api', 'aggregator', 'manual'
  api_endpoint TEXT,
  api_docs_url TEXT,
  credentials_required JSONB, -- { client_id, client_secret, ... }
  rate_limit_per_hour INTEGER,
  webhook_supported BOOLEAN DEFAULT FALSE,
  webhook_endpoint TEXT,
  health_status VARCHAR(50) DEFAULT 'unknown', -- 'healthy', 'degraded', 'down'
  last_health_check TIMESTAMP,
  estimated_time_to_live INTERVAL, -- How long until track appears live
  priority INTEGER DEFAULT 50, -- 1-100, higher = try first
  enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Aggregator Accounts (DistroKid, TuneCore, etc. credentials)
CREATE TABLE aggregator_accounts (
  id UUID PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id),
  aggregator_id VARCHAR(100) NOT NULL, -- 'distrokid', 'tunecore', 'cd_baby'
  account_name VARCHAR(255),
  api_key TEXT ENCRYPTED,
  api_secret TEXT ENCRYPTED,
  account_status VARCHAR(50), -- 'active', 'inactive', 'error'
  last_sync TIMESTAMP,
  sync_error TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Music Video Jobs (WaveForge integration)
CREATE TABLE music_video_jobs (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES tracks(id),
  platform_id VARCHAR(100), -- 'youtube', 'tiktok', 'instagram'
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, ready, uploaded, failed
  waveforge_job_id VARCHAR(255),
  video_url TEXT, -- S3 path
  video_file_key TEXT,
  youtube_video_id VARCHAR(255),
  tiktok_video_id VARCHAR(255),
  instagram_video_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social Media Posts (auto-posting to artist's profiles)
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES tracks(id),
  platform_id VARCHAR(100), -- 'instagram', 'tiktok', 'twitter', 'patreon'
  status VARCHAR(50) DEFAULT 'queued', -- queued, posted, failed, retrying
  post_content TEXT,
  media_urls TEXT[], -- Array of S3 URLs
  platform_post_id VARCHAR(255),
  platform_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Distribution Analytics (aggregated metrics)
CREATE TABLE distribution_analytics (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES tracks(id),
  platform_id VARCHAR(100),
  date DATE,
  platforms_live INTEGER,
  total_platforms INTEGER,
  health_score DECIMAL(3,2), -- 0.0-1.0
  failure_rate DECIMAL(3,2),
  avg_time_to_live_hours DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Relationships & Constraints
- Artists → Tracks (1:many)
- Tracks → Distribution Jobs (1:many, one per platform)
- Distribution Jobs → Distribution Logs (1:many)
- Artists → Aggregator Accounts (1:many)
- Tracks → Music Video Jobs (1:many)
- Tracks → Social Media Posts (1:many)

---

## 4. Microservice Architecture

### 4.1 Core Services

#### **Distribution Engine Service** (Primary)
- Accepts new tracks from the API
- Validates audio + metadata
- Creates distribution job queue
- Orchestrates platform-specific distribution logic
- Handles retries and fallbacks
- Publishes WebSocket events for real-time dashboard

**Key Responsibilities**:
- Parse audio file (duration, bitrate, format)
- Generate/optimize metadata (ISRC, genre, mood detection via AI)
- Create job records for each platform
- Enqueue jobs in Redis Bull
- Monitor job progress and update status

#### **SoundCloud Monitor Service** (Polling)
- Continuously polls connected artist SoundCloud profiles
- Detects new releases (every 5-15 minutes)
- Downloads audio + metadata
- Triggers distribution pipeline automatically
- Handles SoundCloud API rate limits gracefully

**Key Responsibilities**:
- Fetch artist's latest tracks from SoundCloud API
- Compare against `tracks` table to detect new releases
- Download audio and artwork to S3
- Create track record with metadata
- Enqueue distribution job

#### **Platform Adapter Service** (Modular)
- Abstracts platform-specific API logic
- One adapter per platform (Spotify, Apple Music, YouTube, etc.)
- Handles authentication, rate limits, error handling
- Implements retry logic with exponential backoff
- Triggers aggregator fallback on failure

**Adapter Pattern**:
```typescript
interface PlatformAdapter {
  platformId: string;
  authenticate(): Promise<void>;
  distribute(track: Track, metadata: Metadata): Promise<DistributionResult>;
  getStatus(platformTrackId: string): Promise<TrackStatus>;
  handleWebhook(payload: any): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
}
```

#### **Aggregator Fallback Service**
- Attempts distribution via DistroKid, TuneCore, CD Baby, etc.
- Triggered when direct API fails
- Manages aggregator credentials securely
- Tracks which aggregator succeeded for future reference
- Implements aggregator-specific retry logic

#### **Video Generation Service** (WaveForge)
- Accepts track audio + artwork
- Calls WaveForge API to generate audio-reactive music video
- Uploads video to YouTube, TikTok, Instagram
- Handles video encoding and platform-specific formats
- Manages WaveForge job queue and polling

#### **Social Media Automation Service**
- Auto-posts to artist's social profiles
- Generates platform-specific content (captions, hashtags, formatting)
- Handles image/video uploads
- Implements rate limiting per platform
- Tracks post performance metrics

#### **Analytics & Monitoring Service**
- Aggregates distribution metrics
- Calculates coverage scores and health indicators
- Generates real-time charts and reports
- Tracks platform failure rates and performance trends
- Exposes metrics to dashboard

#### **Webhook Receiver Service**
- Listens for platform webhooks (Spotify, Apple Music, YouTube, etc.)
- Updates job status in real-time (no polling delay)
- Triggers notifications to artist
- Logs webhook events for audit trail

### 4.2 Service Deployment
- Each service runs as a separate Node.js process
- Coordinated via Redis pub/sub for inter-service communication
- Bull queues for job distribution
- Docker containers for easy scaling
- PM2 for process management in production

---

## 5. Distribution Pipeline & Workflow

### 5.1 Happy Path: Track → Omnipresence

```
1. Artist uploads track via UI or SoundCloud monitor detects new release
   ↓
2. Distribution Engine validates audio + metadata
   ↓
3. AI analyzes mood, energy, genre (optional enhancement)
   ↓
4. System creates distribution jobs for all enabled platforms
   ↓
5. Jobs enqueued in Redis Bull (priority: direct APIs first, aggregators second, social last)
   ↓
6. Platform Adapters process jobs in parallel (concurrency: 5-10 per platform)
   ↓
7. Direct API Distribution (Spotify, Apple Music, YouTube, etc.)
   ├─ Success → Job marked 'live', platform URL saved, artist notified
   └─ Failure → Retry with exponential backoff (1min, 5min, 15min, 1hr, 4hr, 12hr, 24hr)
   ↓
8. After 3 failed direct attempts → Trigger Aggregator Fallback
   ├─ Try DistroKid → Success → Job marked 'live_via_aggregator'
   ├─ Try TuneCore → Success → Job marked 'live_via_aggregator'
   ├─ Try CD Baby → Success → Job marked 'live_via_aggregator'
   └─ All failed → Manual intervention queue (email to platform, API request, etc.)
   ↓
9. Video Generation (parallel with distribution)
   ├─ WaveForge generates audio-reactive video
   ├─ Upload to YouTube, TikTok, Instagram
   └─ Link video to track record
   ↓
10. Social Media Automation (final stage)
    ├─ Auto-post to artist's Instagram, TikTok, Twitter
    ├─ Include platform links, artwork, captions
    └─ Schedule posts for optimal engagement times
    ↓
11. Real-time Dashboard Updates
    ├─ WebSocket pushes status to artist's browser
    ├─ Distribution coverage score updates (7/9 platforms live = 78%)
    └─ Artist receives email/SMS notification: "Your track is live on 7 platforms!"
```

### 5.2 Failure Handling & Fallback Chain

```
Direct API Fails (e.g., Spotify rate limit exceeded)
   ↓
Exponential Backoff Retry (1min → 5min → 15min → 1hr → 4hr → 12hr → 24hr)
   ↓
After 3 attempts, still failing?
   ↓
Trigger Aggregator Fallback
   ├─ Check which aggregators artist has linked
   ├─ Try each in priority order (DistroKid → TuneCore → CD Baby → Amuse → Ditto)
   └─ If aggregator succeeds, mark job 'live_via_aggregator'
   ↓
All aggregators failed or not linked?
   ↓
Manual Intervention Queue
   ├─ Email platform's business team requesting API access
   ├─ Create support ticket in system
   ├─ Alert artist: "Spotify distribution failed. Manual intervention in progress."
   └─ Retry manual workaround weekly until resolved
```

### 5.3 Job Queue Architecture

**Redis Bull Queue Structure**:
```
distro-buzz:queue:distribution
  ├─ High Priority (direct APIs): Spotify, Apple Music, YouTube Music
  ├─ Medium Priority (aggregators): DistroKid, TuneCore
  ├─ Low Priority (social): Instagram, TikTok, Twitter
  └─ Concurrency: 5-10 workers per priority tier

distro-buzz:queue:video_generation
  ├─ WaveForge jobs
  └─ Concurrency: 2-3 workers (resource-intensive)

distro-buzz:queue:social_media
  ├─ Instagram, TikTok, Twitter posts
  └─ Concurrency: 5 workers

distro-buzz:queue:soundcloud_monitor
  ├─ Polling jobs (one per artist)
  └─ Concurrency: 1 worker (rate limit sensitive)
```

---

## 6. Platform Integration Strategy

### 6.1 Direct API Platforms (Tier 1 - Highest Priority)

| Platform | API | Auth | Rate Limit | TTL | Webhook |
|----------|-----|------|-----------|-----|---------|
| **Spotify** | Web API | OAuth 2.0 | 429/min | 24-48h | Yes |
| **Apple Music** | Music API | JWT | 10k/day | 24-72h | No (polling) |
| **Amazon Music** | Music Catalog API | OAuth 2.0 | 100/sec | 24-48h | No |
| **YouTube Music** | YouTube API | OAuth 2.0 | 10k/day | Instant | Yes |
| **Tidal** | Web API | OAuth 2.0 | 100/sec | 24h | Yes |
| **Deezer** | API | OAuth 2.0 | 50/sec | 24h | No |
| **YouTube** | YouTube API | OAuth 2.0 | 10k/day | Instant | Yes |
| **Bandcamp** | No official API | Manual | N/A | Manual | No |
| **SoundCloud** | Web API | OAuth 2.0 | 100/sec | Instant | Yes |

### 6.2 Aggregator Platforms (Tier 2 - Fallback)

| Aggregator | Platforms Covered | API Quality | Cost | Setup |
|------------|-------------------|-------------|------|-------|
| **DistroKid** | 150+ | Excellent | $0-50/yr | Easy |
| **TuneCore** | 150+ | Good | $0-50/yr | Easy |
| **CD Baby** | 100+ | Good | $0-50/yr | Easy |
| **Amuse** | 100+ | Good | Free | Easy |
| **Ditto Music** | 100+ | Good | $0-50/yr | Easy |
| **ONErpm** | 100+ | Good | Free | Medium |
| **RouteNote** | 100+ | Good | Free | Easy |
| **DistroScale** | 50+ | Fair | Free | Medium |

**Strategy**: Link 2-3 aggregators per artist as automatic fallback. If direct API fails, try aggregators in priority order.

### 6.3 Secondary Platforms (Tier 3 - Extended Reach)

| Platform | Integration | TTL | Notes |
|----------|-------------|-----|-------|
| **Beatport** | API | 24h | Electronic music focus |
| **Traxsource** | API | 24h | Deep house/tech focus |
| **Juno Download** | API | 24h | Vinyl/digital sales |
| **Discogs** | API | 24h | Discography + marketplace |
| **Genius** | API | 24h | Lyrics + credits |
| **Audiomatch** | API | 24h | Sync licensing |
| **Audius** | API | Instant | Decentralized platform |
| **Catalog** | API | 24h | NFT marketplace |
| **Royal** | API | 24h | Ownership/royalty splits |

### 6.4 Social Media Platforms (Tier 4 - Amplification)

| Platform | Integration | Format | Auto-Post |
|----------|-------------|--------|-----------|
| **Instagram** | Graph API | Image + Reel | Yes |
| **TikTok** | API | Video (15-60s) | Yes |
| **YouTube** | YouTube API | Video + Shorts | Yes |
| **Twitter/X** | API v2 | Text + Link | Yes |
| **Twitch** | API | Clip + Description | Yes |
| **Patreon** | API | Post + Audio | Yes |
| **Substack** | API | Newsletter | Yes |

---

## 7. AI & Metadata Enhancement

### 7.1 Mood & Energy Detection
- Use Spotify's audio analysis API or open-source models (essentia.js)
- Extract: energy, valence, danceability, acousticness, instrumentalness
- Store in `tracks.mood` JSONB field
- Use for smart playlist recommendations and social media tagging

### 7.2 Automatic Genre Classification
- Train model on Spotify/Genius genre data
- Classify track into primary + secondary genres
- Fallback: Manual artist input
- Use for platform-specific categorization

### 7.3 Lyrics & Credits Extraction
- Scrape SoundCloud description for credits
- Query Genius API for official lyrics
- Store in `tracks.metadata.lyrics` and `tracks.metadata.credits`
- Display in dashboard and share with platforms

### 7.4 ISRC & Metadata Generation
- Generate ISRC codes (International Standard Recording Code) if missing
- Format: CC-XXX-YY-NNNNN (country-label-year-sequence)
- Store in `tracks.isrc`
- Required for Spotify, Apple Music, and royalty tracking

---

## 8. Real-Time Dashboard & Monitoring

### 8.1 Distribution Status Board

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Distro Buzz Distribution Dashboard                              │
├─────────────────────────────────────────────────────────────┤
│ Artist: [Dropdown] | Coverage: 7/9 (78%) | Health: 95%     │
├─────────────────────────────────────────────────────────────┤
│ Track: "Neon Dreams" (Released: 2 hours ago)                │
├─────────────────────────────────────────────────────────────┤
│ Platform Status (Real-time):                                │
│ ✅ Spotify      [LIVE]      2h ago                          │
│ ✅ Apple Music  [LIVE]      1h 45m ago                      │
│ ✅ YouTube      [LIVE]      1h 30m ago                      │
│ ⏳ Amazon Music [PROCESSING] Retry in 2m (Attempt 2/7)     │
│ ⏳ Tidal        [QUEUED]    Waiting...                      │
│ ⚠️  Deezer      [RETRYING]  Failed 1x, next retry in 5m    │
│ ❌ Bandcamp    [FAILED]    Manual intervention needed      │
│ ⏳ YouTube Music [QUEUED]   Waiting...                      │
│ 🔄 TikTok      [VIDEO_GEN] Generating music video...       │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Real-time status badges (queued, processing, live, failed, retrying)
- Timestamps for each platform
- Retry count and next retry time
- Click to view detailed logs for each platform
- Quick-action buttons: "Retry Now", "View Logs", "Manual Intervention"

### 8.2 Distribution Analytics

**Charts**:
1. **Coverage Over Time**: Line chart showing platforms live per track over days/weeks
2. **Platform Failure Rate**: Bar chart showing which platforms fail most often
3. **Time to Live Distribution**: Histogram showing average time from upload to live per platform
4. **Artist Distribution Health Score**: Gauge showing overall system health (0-100%)
5. **Queue Depth**: Real-time graph of pending jobs in queue

### 8.3 WebSocket Real-Time Updates

**Events**:
```typescript
// Client subscribes to track distribution updates
socket.on('distribution:job:status', (data) => {
  // { trackId, jobId, platformId, status, timestamp, message }
  // Update dashboard badge in real-time
});

socket.on('distribution:track:complete', (data) => {
  // { trackId, coverageScore, platformsLive, totalPlatforms }
  // Show celebration animation, update coverage score
});

socket.on('distribution:job:failed', (data) => {
  // { trackId, jobId, platformId, errorMessage, nextRetryAt }
  // Alert artist, highlight failed platform
});
```

---

## 9. Artist Onboarding Flow

### 9.1 Sign-Up & SoundCloud Connect

```
1. Artist visits distrobuzz.app
2. Click "Sign Up" → Create account (email, password)
3. Verify email
4. Onboarding wizard:
   a. "Connect SoundCloud" → OAuth flow → Authorize Distro Buzz to read profile
   b. "Select Platforms" → Checkboxes for Spotify, Apple Music, YouTube, etc.
   c. "Link Aggregators" (optional) → DistroKid, TuneCore, CD Baby API keys
   d. "Configure Preferences" → Auto-publish on new release? Notification settings?
   e. "Review & Confirm" → Summary of setup
5. Dashboard loads with artist's SoundCloud tracks
6. Artist can manually upload or wait for auto-detection
```

### 9.2 Platform Linking UI

**For Direct APIs** (Spotify, Apple Music, YouTube):
- OAuth flow → Artist authorizes Distro Buzz to distribute on their behalf
- Credentials stored encrypted in database
- Refresh tokens managed automatically

**For Aggregators** (DistroKid, TuneCore):
- Artist provides API key + secret
- Distro Buzz tests connection
- Stores encrypted credentials
- Shows account status and last sync time

---

## 10. Admin Control Panel

**Owner-Only Features**:
1. **System Overview**: Total tracks, total jobs, queue depth, system health
2. **Platform Health Dashboard**: Real-time status of all platform APIs
3. **Job Management**: View all active jobs, manually trigger/pause/cancel
4. **Error Monitoring**: Recent errors, failure patterns, alerts
5. **Aggregator Management**: Add/remove aggregators, manage credentials
6. **Artist Management**: View all artists, disable/enable accounts, manual interventions
7. **Analytics**: System-wide metrics, performance trends, cost analysis

---

## 11. Phased Roadmap

### Phase 1: MVP (Weeks 1-4)
- ✅ Core distribution engine (Spotify, Apple Music, YouTube Music)
- ✅ SoundCloud monitor (polling)
- ✅ Distribution status dashboard
- ✅ Artist onboarding (email + password)
- ✅ Basic job queue + retry logic
- ✅ Distribution logs

**Deliverable**: Artists can upload tracks and distribute to 3 major platforms with full visibility.

### Phase 2: Expansion (Weeks 5-8)
- ✅ Aggregator fallback (DistroKid, TuneCore, CD Baby)
- ✅ Additional platforms (Tidal, Deezer, Bandcamp, SoundCloud)
- ✅ Music video generation (WaveForge integration)
- ✅ Social media auto-posting (Instagram, TikTok, Twitter)
- ✅ Webhook support for real-time platform updates
- ✅ Admin control panel

**Deliverable**: Omnipresent distribution across 15+ platforms with video generation and social amplification.

### Phase 3: Intelligence & Autonomy (Weeks 9-12)
- ✅ AI mood/energy detection
- ✅ Automatic ISRC generation
- ✅ Smart retry orchestration
- ✅ Platform advocacy engine (auto-email platforms requesting API access)
- ✅ Merch automation (Printful, Printify integration)
- ✅ Advanced analytics + recommendations
- ✅ Self-evolving platform discovery (detect new platforms, auto-add to registry)

**Deliverable**: Fully autonomous system that learns and improves over time.

### Phase 4: Global Scale (Weeks 13+)
- ✅ Multi-language support
- ✅ Regional platform support (China: NetEase, KuGou; India: Wynk, Gaana)
- ✅ Blockchain integration (NFT drops, royalty splits)
- ✅ Artist community features (collaboration, remixes)
- ✅ Marketplace (buy/sell distribution rights)
- ✅ Enterprise features (label management, bulk distribution)

---

## 12. Cost Analysis

### 12.1 Infrastructure Costs (Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| **Server (VPS)** | $20-50 | 2-4 CPU, 4-8GB RAM |
| **PostgreSQL** | $15-30 | Managed database |
| **Redis** | $10-20 | Managed cache |
| **S3 Storage** | $5-20 | Audio files + metadata |
| **Bandwidth** | $10-30 | Outbound to platforms |
| **Monitoring (Sentry)** | $0-29 | Error tracking |
| **Email (SendGrid)** | $0-20 | Transactional emails |
| **SMS (Twilio)** | $0-10 | Notifications |
| **Total** | **$60-189/month** | Scales with usage |

### 12.2 API Costs (Per Track)

| Service | Cost | Notes |
|---------|------|-------|
| **WaveForge (video gen)** | $0.50-2.00 | Per video generated |
| **Spotify API** | Free | Unlimited |
| **YouTube API** | Free | 10k/day quota |
| **Aggregators** | $0-50/yr | One-time per artist |
| **Total** | **$0.50-2.50 per track** | Varies by features used |

### 12.3 Revenue Model (Optional)

- **Free Tier**: Unlimited distribution to Spotify, Apple Music, YouTube (no video gen, no aggregators)
- **Pro Tier** ($9.99/mo): + Video generation, + Aggregator fallback, + Analytics
- **Enterprise** ($99+/mo): + Merch automation, + API access, + Priority support

**Projected Profitability**: Break-even at 100+ active artists on Pro tier.

---

## 13. Security & Data Protection

### 13.1 Artist Data Protection
- All credentials encrypted at rest (AES-256)
- API keys stored in separate vault
- No plaintext storage of passwords (bcrypt + salt)
- GDPR/CCPA compliant (data export, deletion)

### 13.2 API Security
- Rate limiting per artist (100 requests/min)
- JWT tokens for authentication
- HTTPS/TLS for all communications
- CORS properly configured
- Input validation + sanitization

### 13.3 Audit Trail
- Every action logged with timestamp, user, IP, action type
- Immutable audit log (append-only)
- 90-day retention for compliance

---

## 14. Deployment & DevOps

### 14.1 Local Development
```bash
docker-compose up
# Starts: PostgreSQL, Redis, API server, job workers
```

### 14.2 Production Deployment
- Docker containers on Kubernetes or Docker Swarm
- GitHub Actions CI/CD (test → build → deploy)
- Automated backups (PostgreSQL daily, S3 versioning)
- Monitoring + alerting (Sentry, DataDog)
- Zero-downtime deployments (blue-green)

### 14.3 Scaling Strategy
- Horizontal scaling: Add more worker pods for job processing
- Database: Read replicas for analytics queries
- Cache: Redis cluster for high-concurrency scenarios
- CDN: CloudFlare for static assets + API caching

---

## 15. Failure Modes & Resilience

### 15.1 Platform API Down
- **Detection**: Health check fails 3x in a row
- **Action**: Trigger aggregator fallback immediately
- **Notification**: Alert artist, show "Fallback in progress" badge
- **Recovery**: Retry health check every 5 minutes

### 15.2 Aggregator Failure
- **Detection**: Aggregator API returns error
- **Action**: Try next aggregator in priority order
- **Notification**: Alert artist, escalate to manual intervention
- **Recovery**: Retry aggregator weekly

### 15.3 Job Queue Overflow
- **Detection**: Queue depth > 10,000 jobs
- **Action**: Scale up worker pods, increase concurrency
- **Notification**: Alert ops team
- **Recovery**: Auto-scale based on queue depth

### 15.4 Database Failure
- **Detection**: Connection pool exhausted
- **Action**: Switch to read replica, pause new jobs
- **Notification**: Page on-call engineer
- **Recovery**: Restore from backup, replay logs

---

## 16. Monitoring & Observability

### 16.1 Key Metrics
- **Distribution Success Rate**: % of jobs that reach "live" status
- **Time to Live**: Average time from job creation to platform live
- **Platform Availability**: % uptime for each platform API
- **Queue Depth**: Number of pending jobs
- **Error Rate**: % of jobs that fail
- **Retry Success Rate**: % of retried jobs that succeed

### 16.2 Alerting Thresholds
- Distribution success rate < 80% → Alert
- Platform API down for > 1 hour → Page engineer
- Queue depth > 10,000 → Auto-scale
- Error rate > 5% → Alert
- Database connection pool > 90% → Alert

### 16.3 Dashboards
- **Artist Dashboard**: Personal distribution status + analytics
- **Admin Dashboard**: System health + all active jobs
- **Operations Dashboard**: Queue depth, error rates, platform health
- **Finance Dashboard**: API costs, revenue, profitability

---

## 17. Open Source & Community

### 17.1 Licensing
- **MIT License**: Free for personal and commercial use
- **No vendor lock-in**: Export all data anytime
- **Community contributions**: PRs welcome for new platforms, features

### 17.2 Documentation
- **API Documentation**: OpenAPI/Swagger spec
- **Deployment Guide**: Docker, Kubernetes, VPS
- **Platform Integration Guide**: How to add new platforms
- **Contributing Guide**: Development setup, code style, testing

### 17.3 Community Engagement
- GitHub Issues for bug reports + feature requests
- Discord server for community support
- Monthly releases with changelog
- Showcase of artist success stories

---

## 18. Conclusion

**Distro Buzz** is built on the principle that **every artist deserves global reach**. By automating distribution across 50+ platforms, providing real-time transparency, and implementing intelligent fallback chains, we empower independent musicians to compete with major labels.

The system is designed for **resilience** (failures never silently disappear), **transparency** (every action logged and visible), and **artist empowerment** (no vendor lock-in, full data ownership).

With this architecture, one track upload triggers a cascade of intelligent agents that ensure **omnipresent distribution** — truly plastered like glue all over the world.

---

**Document Version**: 1.0  
**Last Updated**: April 23, 2026  
**Status**: Ready for Implementation
