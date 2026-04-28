# Distro Buzz TODO

## Rebrand
- [x] Rebrand project name from Maestro to Distro Buzz in all files
- [ ] Update VITE_APP_TITLE to Distro Buzz
- [ ] Rename GitHub repo to distro-buzz

## Database & Schema
- [x] Create core database tables (artists, tracks, distributionJobs, distributionLogs, platformRegistry, aggregatorAccounts, musicVideoJobs, socialMediaPosts, distributionAnalytics)
- [x] Apply database migrations
- [x] Create database query helpers for all entities

## Core API Server
- [x] Express + tRPC setup with feature routers
- [x] Artist CRUD endpoints
- [x] Track management endpoints
- [x] Distribution job endpoints (create, status, retry, cancel)
- [x] Platform registry endpoints
- [x] Distribution log endpoints

## SoundCloud Monitor
- [x] SoundCloud profile polling service
- [x] Auto-detect new releases
- [x] Auto-create distribution jobs on new track detection
- [x] Configurable polling interval

## Distribution Engine
- [x] In-process priority queue (no external BullMQ dependency)
- [x] Distribution job processor with retry logic
- [x] Exponential backoff for retries with jitter
- [x] Fallback chain (direct API -> aggregator -> manual queue)
- [ ] WebSocket real-time status updates

## Platform Adapters
- [x] YouTube adapter (WaveForge API + YouTube Data API)
- [x] Bandcamp adapter (internal API automation)
- [x] Spotify stub adapter (via aggregator)
- [x] Apple Music stub adapter (via aggregator)
- [x] Amazon Music stub adapter (via aggregator)
- [x] Tidal stub adapter (via aggregator)
- [x] Deezer stub adapter (via aggregator)
- [x] YouTube Music stub adapter (via aggregator)
- [x] TikTok stub adapter
- [x] Instagram Reels stub adapter
- [x] Beatport stub adapter
- [x] Traxsource stub adapter
- [x] Audiomack stub adapter
- [x] Patreon stub adapter

## Frontend
- [x] Dark cyberpunk/neon UI theme with neon glow effects
- [x] Distribution status board with real-time badges
- [x] Artist onboarding and SoundCloud connect flow
- [x] Track library with distribution coverage scores
- [x] Distribution job logs viewer with retry actions
- [x] Platform API registry dashboard
- [ ] Distribution analytics charts
- [ ] Admin distribution control panel
- [ ] Aggregator integration settings

## Infrastructure
- [ ] Docker compose for local dev
- [ ] WebSocket for real-time status updates
- [x] Platform health check system
- [x] Seed platform registry with 14 platforms on startup

## Tests
- [x] Distribution engine unit tests (11 tests passing)
- [x] Auth logout test (1 test passing)
- [x] SoundCloud monitor tests (4 tests passing)
- [ ] API router integration tests
