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
- [x] Implement JWT-based authentication (email/password)
- [x] Create auth service with sign up, login, forgot password
- [x] Add password hashing (bcrypt) and JWT token generation
- [x] Build Login + Signup page UI
- [x] Wire authService into tRPC customAuth router
- [ ] Remove Manus OAuth integration (kept as fallback)

### Immersive Landing Page
- [x] Create particle/wave background animation (audio visualizer style)
- [x] Implement smooth scroll animations and parallax effects
- [x] Design hero section with animated gradient text
- [x] Add pulsing CTA buttons
- [x] Build social proof section with testimonials
- [x] Create feature showcase with animations
- [x] Add luxury brand styling and typography
- [x] Implement smooth transitions between sections

### Social Platform Adapters
- [x] TikTok adapter (scaffolded — needs API credentials for live posting)
- [x] Facebook adapter (scaffolded — needs API credentials for live posting)
- [x] Threads adapter (scaffolded — needs API credentials for live posting)
- [x] Instagram adapter (scaffolded — needs API credentials for live posting)
- [x] Snapchat adapter (scaffolded — needs API credentials for live posting)
- [x] X.com adapter (scaffolded — needs API credentials for live posting)
- [x] Reddit adapter (scaffolded — needs API credentials for live posting)
- [x] Telegram adapter (scaffolded — needs API credentials for live posting)
- [x] Seed 8 social platforms into platform registry on startup

### Pricing Page
- [x] Design pricing cards for 3 tiers ($9.99 Starter, $24.99 Pro, $99.99 Label)
- [x] Pricing section embedded in landing page
- [x] Implement feature comparison table (standalone /pricing page with 18 features)
- [x] Add pricing toggle (monthly/annual with 20% savings)
- [x] Create CTA buttons with Stripe stubs (toast notification, redirect to signup)

### Ad Placement System
- [x] Build business dashboard for ad purchases (/ad-dashboard)
- [x] Ad dashboard UI with overview, placements, create tabs
- [x] Weekly performance chart with demo data
- [x] Create ad placement database tables (adPlacements + adEvents, migration applied)
- [x] Wire ads tRPC router to backend (list, create, updateStatus, trackEvent, stats)
- [ ] Render actual ads throughout platform pages (deferred — needs active ad content)

### API Documentation
- [x] Create API docs page with endpoint reference (/api-docs)
- [x] Add authentication guide
- [x] Include code examples (JavaScript, Python, cURL)
- [x] Add rate limiting documentation
- [x] Document all 19 tRPC procedures in reference table
- [x] Create webhook documentation (7 events, payload format, signature verification)
- [x] Error codes reference table (9 HTTP status codes)

### Artist Onboarding Wizard
- [x] Build step-by-step wizard UI (/onboarding)
- [x] Step 1: Connect SoundCloud
- [x] Step 2: Choose platforms to distribute to
- [x] Step 3: Set distribution preferences
- [x] Step 4: Review and confirm
- [x] Add progress indicators and step navigation

### Mobile Responsiveness
- [x] Add mobile-first responsive CSS utilities
- [x] Touch-friendly button sizing (44px targets)
- [x] Responsive sidebar with hamburger toggle
- [x] Full desktop audit across all 14 pages (all render correctly)
- [ ] Test on iOS and Android (requires physical devices)

### Testing & Deployment
- [x] 41 tests passing (distribution engine, SoundCloud monitor, API routers, auth)
- [x] Write tests for JWT auth (14 tests passing)
- [x] Write tests for social platform adapters (14 tests passing)
- [x] Final checkpoint and GitHub push (version 2a2d0450, pushed to ereezyy/distro-buzz)

## SITE AUDIT & FIX
- [x] Fix 404 on homepage / root route (space in path string)
- [x] Add missing routes: /login, /signup, /api-docs, /ad-dashboard, /onboarding
- [x] Create Login + Signup pages using JWT authService
- [x] Wire authService into tRPC customAuth router (signup/login/refresh)
- [x] Register 8 social platform adapters in adapters/index.ts
- [x] Seed 8 social platforms into platform registry on startup
- [x] Consolidate to OnboardingWizard as /onboarding
- [x] Fix LandingPage nav links to correct routes
- [x] Verify all 14 pages render correctly (full browser audit)
- [x] Verify server starts (22 platforms seeded; 1 pre-existing TS error in framework file storageProxy.ts)
- [x] Add API Docs and Ad Dashboard to sidebar navigation


## PHASE 3: AI TALENT AGENT SYSTEM

### Database Schema
- [ ] AI agents table (agentId, userId, talentType, personality, status)
- [ ] Gigs table (gigId, userId, title, venue, date, rate, status)
- [ ] Legal filings table (filingId, userId, type, status, dmcaCount, copyrightCount)
- [ ] Contracts table (contractId, userId, template, customization, status)
- [ ] Media assets table (assetId, userId, type, url, brandCompliance)
- [ ] Subscriptions table (subscriptionId, userId, features, stripeCustomerId, status)
- [ ] Outreach log table (outreachId, agentId, target, message, response, status)

### AI Talent Agent Service
- [x] Groq integration for inference (gig discovery, contract generation, negotiation)
- [x] Grok integration for chat/voice interface
- [x] Agent personality system (8 talent types with specialized workflows)
- [x] Outreach automation (email, message templates, follow-up scheduling)
- [x] Gig discovery engine (scan job boards, casting calls, brand opportunities)
- [x] Schedule management and calendar sync

### Stripe Integration
- [x] Real checkout sessions (not stubs) for all features
- [x] Subscription management (create, update, cancel)
- [x] A la carte feature pricing ($4.99-$49.99)
- [x] Webhook handling for payment events
- [x] Invoice generation and tracking

### AI Agent Dashboard (/agent)
- [x] Chat interface with AI agent
- [x] Task queue (pending outreach, negotiations, bookings)
- [x] Outreach log with response tracking
- [x] Agent personality customization
- [x] Performance metrics and recommendations

### Gig Discovery & Booking (/gigs)
- [x] Gig discovery feed (AI-curated opportunities)
- [x] Booking management (accept, decline, negotiate)
- [x] Calendar view of scheduled appearances
- [x] Rate negotiation assistant
- [x] Gig history and analytics

### Legal Protection Dashboard (/legal)
- [x] DMCA takedown automation and status
- [x] Copyright registration assistant
- [x] Contract generation and management
- [x] Brand protection monitoring dashboard
- [x] IP portfolio view

### Media Management (/media)
- [x] Press kit generation and editor
- [x] Social media content calendar
- [x] Brand consistency monitoring
- [x] Media inquiry handling
- [x] Asset library (photos, videos, bios)

### A La Carte Checkout (/checkout)
- [x] Feature selection interface
- [x] Real Stripe checkout integration
- [x] Subscription tier comparison
- [x] Bundle discount display
- [x] Payment confirmation and receipt

### Testing & Deployment
- [x] Tests for AI agent service
- [x] Tests for Stripe integration
- [x] Tests for gig discovery engine
- [ ] Final checkpoint and GitHub push


### Voice Outreach (Twilio + Deepgram)
- [x] Twilio integration for phone calls
- [x] Deepgram voice synthesis for AI agent voice
- [x] Call logging and recording storage
- [x] Call history and transcript tracking
- [x] Call analytics (duration, outcome, follow-up)

### Gig Discovery Syndicate
- [x] Parallel scraper architecture (async job queue)
- [x] Venue listings scraper
- [x] Casting calls scraper (Backstage, ModelMayhem)
- [x] Brand partnership scraper
- [x] Craigslist gigs scraper
- [x] GigSalad, The Bash, Thumbtack scrapers
- [x] AI ranking engine (relevance scoring)
- [x] Deduplication and conflict resolution

### Merch Automation (Printful)
- [x] Printful API integration
- [x] Design generation from artist branding
- [x] Product creation (t-shirts, hoodies, stickers, posters, phone cases)
- [x] Merch store page (/merch)
- [x] Order fulfillment tracking
- [x] Profit margin calculation and tracking
- [x] Merch analytics dashboard
