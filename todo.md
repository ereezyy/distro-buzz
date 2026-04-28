# Distro Buzz TODO

## Rebrand
- [x] Rebrand project name from Maestro to Distro Buzz in all files
- [x] Update VITE_APP_TITLE to Distro Buzz (user must update in Settings > Secrets)
- [x] Rename GitHub repo to distro-buzz (done: ereezyy/distro-buzz)

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
- [x] Polling-based live status updates (10-15s refetchInterval on Dashboard, JobLogs, Admin, Analytics, TrackLibrary, PlatformRegistry)

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
- [x] Distribution analytics page with health score, platform performance, and coverage metrics
- [x] Admin distribution control panel with queue stats, platform health, job management
- [x] Aggregator integration settings UI (frontend only, backend persistence deferred)

## Infrastructure
- [x] Docker compose file created (in GitHub repo at /tmp/maestro)
- [x] Polling-based real-time status on all 6 dashboard views
- [x] Platform health check system
- [x] Seed platform registry with 14 platforms on startup

## Tests
- [x] Distribution engine unit tests (11 tests passing)
- [x] Auth logout test (1 test passing)
- [x] SoundCloud monitor tests (4 tests passing)
- [x] API router unit tests with mocked DB (17 tests passing)


## PHASE 2: LUXURY BRAND UPGRADE

### Custom JWT Auth
- [ ] Remove Manus OAuth integration
- [ ] Implement JWT-based authentication (email/password)
- [ ] Create auth service with sign up, login, forgot password
- [ ] Add password hashing (bcrypt) and JWT token generation
- [ ] Build auth modal/page UI
- [ ] Add auth state management to frontend
- [ ] Implement protected routes and API endpoints

### Immersive Landing Page
- [ ] Create particle/wave background animation (audio visualizer style)
- [ ] Implement smooth scroll animations and parallax effects
- [ ] Design hero section with animated gradient text
- [ ] Add pulsing CTA buttons
- [ ] Build social proof section with testimonials
- [ ] Create feature showcase with animations
- [ ] Add luxury brand styling and typography
- [ ] Implement smooth transitions between sections

### Social Platform Adapters
- [ ] TikTok adapter (API integration)
- [ ] Facebook adapter (API integration)
- [ ] Threads adapter (API integration)
- [ ] Instagram adapter (API integration)
- [ ] Snapchat adapter (API integration)
- [ ] X.com (Twitter) adapter (API integration)
- [ ] Reddit adapter (API integration)
- [ ] Telegram adapter (API integration)
- [ ] Update platform registry with 8 new platforms

### Pricing Page
- [ ] Design pricing cards for 3 tiers (Starter, Pro, Label)
- [ ] Implement feature comparison table
- [ ] Add pricing toggle (monthly/annual)
- [ ] Create CTA buttons with Stripe integration stubs
- [ ] Build FAQ section
- [ ] Add testimonials/case studies

### Ad Placement System
- [ ] Create ad placement database tables
- [ ] Build business dashboard for ad purchases
- [ ] Implement ad rendering system (banner, featured artist, sponsored)
- [ ] Create admin panel for ad management
- [ ] Add non-intrusive ad placement throughout platform
- [ ] Track ad impressions and clicks

### API Documentation
- [ ] Create API docs page with endpoint reference
- [ ] Add authentication guide
- [ ] Include code examples (JavaScript, Python, cURL)
- [ ] Document all tRPC procedures
- [ ] Add rate limiting documentation
- [ ] Create webhook documentation

### Artist Onboarding Wizard
- [ ] Build step-by-step wizard UI
- [ ] Step 1: Connect SoundCloud
- [ ] Step 2: Choose platforms to distribute to
- [ ] Step 3: Set distribution preferences
- [ ] Step 4: Review and confirm
- [ ] Add progress indicators and tooltips
- [ ] Implement completion tracking

### Mobile Responsiveness
- [ ] Audit all pages for mobile compatibility
- [ ] Implement hamburger menu for navigation
- [ ] Make all buttons touch-friendly
- [ ] Test on iOS and Android
- [ ] Optimize images for mobile
- [ ] Ensure forms are mobile-optimized
- [ ] Test performance on 3G/4G

### Testing & Deployment
- [ ] Write tests for JWT auth
- [ ] Write tests for new adapters
- [ ] Integration tests for pricing system
- [ ] E2E tests for onboarding flow
- [ ] Performance testing and optimization
- [ ] Security audit
- [ ] Final checkpoint and GitHub push
