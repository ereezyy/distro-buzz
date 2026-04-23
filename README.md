# 🎵 Maestro: Omnipresent Music Distribution

> **One track. Infinite reach. Everywhere.**
>
> An open-source autonomous music distribution platform that empowers independent musicians by automatically distributing their music to 50+ platforms globally with real-time transparency, intelligent retry logic, and zero vendor lock-in.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D)](https://redis.io/)

---

## 🎯 Mission

**Maestro** disrupts the music industry's exploitation of independent artists. We believe every musician deserves:

- **Global reach** without paying gatekeepers
- **Full transparency** into where their music lives
- **Intelligent automation** that handles the tedious distribution work
- **Complete data ownership** with zero vendor lock-in
- **Resilient distribution** that never silently fails

One artist. One upload. Fifty platforms. Simultaneously.

---

## ⚡ Core Features

### 1. **Omnipresent Distribution Engine**
Automatically distributes tracks to every major platform simultaneously:
- **Streaming**: Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer
- **Direct Platforms**: Bandcamp, SoundCloud, YouTube, Audiomatch, Beatport, Traxsource, Juno, Discogs, Genius
- **Aggregators**: DistroKid, TuneCore, CD Baby, Amuse, Ditto, ONErpm, RouteNote, DistroScale (automatic fallback)
- **Social Media**: Instagram, TikTok, YouTube, Twitter/X, Twitch, Patreon, Substack
- **Emerging**: Audius, Catalog, Royal, Zora, Foundation

### 2. **Real-Time Distribution Dashboard**
Live visibility into every track's distribution status:
- Per-platform status badges (queued, processing, live, failed, retrying)
- Distribution coverage score (e.g., "7/9 platforms live")
- Timestamps and retry counts for each platform
- One-click access to detailed logs and manual interventions
- WebSocket-powered real-time updates

### 3. **SoundCloud Monitor**
Continuously polls connected artist profiles for new releases and automatically triggers distribution—zero manual intervention needed.

### 4. **Platform API Registry**
Catalog of all supported platforms showing:
- Integration method (direct API, aggregator, manual workaround)
- Credentials status and health indicators
- Rate limits and estimated time-to-live
- Live health checks and performance metrics

### 5. **Intelligent Retry & Fallback Orchestration**
Never lose a distribution:
- Exponential backoff retry logic (1min → 5min → 15min → 1hr → 4hr → 12hr → 24hr)
- Automatic aggregator fallback when direct APIs fail
- Manual intervention queue for platforms without APIs
- Full audit trail of every retry attempt

### 6. **Distribution Job Logs**
Complete transparency into every step:
- Per-job logs capturing API calls, retries, fallbacks, and resolutions
- Error messages with full context for debugging
- Timestamps and retry counts
- Export logs for compliance and analysis

### 7. **Artist Track Library**
Paginated view of all artist tracks with:
- Distribution coverage score per track
- Quick-action buttons to redistribute or fix failed platforms
- Search and filter capabilities
- Bulk operations for multiple tracks

### 8. **Music Video Generation** (WaveForge Integration)
Auto-generate audio-reactive music videos:
- Integrates with WaveForge API for video generation
- Automatically uploads to YouTube, TikTok, Instagram
- Handles video encoding and platform-specific formats
- Tracks video generation jobs and status

### 9. **Social Media Automation**
Auto-post to artist's social profiles:
- Platform-specific content generation (captions, hashtags, formatting)
- Image and video uploads
- Rate limiting and scheduling
- Performance tracking

### 10. **Distribution Analytics**
Real-time insights into distribution performance:
- Charts showing platforms live over time
- Platform failure rate analysis
- Time-to-live distribution histograms
- Overall system health score
- Trend analysis and recommendations

### 11. **Artist Onboarding**
Frictionless sign-up and configuration:
- Email/password or OAuth registration
- SoundCloud profile linking (OAuth)
- Platform selection (which platforms to target)
- Aggregator account linking (optional)
- Notification preferences

### 12. **Admin Control Panel**
Owner-only system management:
- System overview (total tracks, jobs, queue depth, health)
- Platform health dashboard with real-time status
- Manual job management (trigger, pause, cancel)
- Error monitoring and failure pattern analysis
- Artist management and manual interventions

---

## 🏗️ Architecture Overview

### Microservices

- **Distribution Engine**: Core orchestration, job creation, status management
- **SoundCloud Monitor**: Polling service for new releases
- **Platform Adapters**: Modular platform-specific distribution logic
- **Aggregator Fallback**: Automatic fallback to DistroKid, TuneCore, etc.
- **Video Generation**: WaveForge integration for music videos
- **Social Media Automation**: Auto-posting to artist profiles
- **Analytics & Monitoring**: Real-time metrics and dashboards
- **Webhook Receiver**: Real-time platform status updates

### Data Flow

```
Artist uploads track
    ↓
Distribution Engine validates audio + metadata
    ↓
AI analyzes mood, energy, genre (optional)
    ↓
Creates distribution jobs for all enabled platforms
    ↓
Jobs enqueued in Redis Bull (priority-based)
    ↓
Platform Adapters process jobs in parallel
    ├─ Direct API Distribution (Spotify, Apple Music, etc.)
    │   ├─ Success → Job marked 'live'
    │   └─ Failure → Exponential backoff retry
    │
    ├─ After 3 failed attempts → Aggregator Fallback
    │   ├─ Try DistroKid → Success → 'live_via_aggregator'
    │   ├─ Try TuneCore → Success → 'live_via_aggregator'
    │   └─ All failed → Manual intervention queue
    │
    ├─ Video Generation (parallel)
    │   └─ WaveForge → YouTube, TikTok, Instagram
    │
    └─ Social Media Automation (final stage)
        └─ Auto-post to artist's profiles
    ↓
Real-time Dashboard Updates
    ↓
Artist receives notification: "Your track is live on 7 platforms!"
```

### Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Backend** | Node.js + TypeScript | Type safety, async-first, massive ecosystem |
| **API Framework** | Express.js | Lightweight, battle-tested, perfect for microservices |
| **Database** | PostgreSQL | ACID transactions, JSON support, reliability |
| **Cache & Queue** | Redis + Bull | Distributed job processing with persistence |
| **Frontend** | React 19 + Tailwind CSS 4 | Modern, performant, dark mode native |
| **Real-time** | WebSocket (Socket.io) | Live dashboard updates as jobs progress |
| **Type Safety** | tRPC | End-to-end type safety between frontend and backend |
| **Visualization** | Recharts | Real-time data visualization |
| **Containerization** | Docker Compose | Local dev, easy deployment |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **pnpm** (`npm install -g pnpm`)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ereezyy/maestro.git
cd maestro

# 2. Install dependencies
pnpm install

# 3. Start services (PostgreSQL, Redis, API server, workers)
docker-compose up -d

# 4. Run database migrations
pnpm run db:migrate

# 5. Start development server
pnpm run dev

# 6. Open browser
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
```

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: maestro
      POSTGRES_PASSWORD: maestro_dev

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:maestro_dev@postgres:5432/maestro
      REDIS_URL: redis://redis:6379

  worker:
    build: .
    command: npm run worker
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:maestro_dev@postgres:5432/maestro
      REDIS_URL: redis://redis:6379
```

---

## 📁 Project Structure

```
maestro/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # Full system design
│   ├── API.md                     # API reference
│   ├── PLATFORM_INTEGRATION.md    # Platform-specific guides
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── CONTRIBUTING.md            # Contribution guidelines
│
├── packages/
│   ├── api/                       # Express API server
│   │   ├── src/
│   │   │   ├── services/          # Business logic
│   │   │   │   ├── distribution.ts
│   │   │   │   ├── soundcloud.ts
│   │   │   │   ├── platforms/     # Platform adapters
│   │   │   │   │   ├── spotify.ts
│   │   │   │   │   ├── apple-music.ts
│   │   │   │   │   ├── youtube.ts
│   │   │   │   │   └── ...
│   │   │   │   ├── aggregators/   # Aggregator integrations
│   │   │   │   │   ├── distrokid.ts
│   │   │   │   │   ├── tunecore.ts
│   │   │   │   │   └── ...
│   │   │   │   ├── video.ts       # WaveForge integration
│   │   │   │   ├── social.ts      # Social media automation
│   │   │   │   └── analytics.ts   # Metrics and insights
│   │   │   ├── routes/            # API endpoints
│   │   │   │   ├── tracks.ts
│   │   │   │   ├── distribution.ts
│   │   │   │   ├── platforms.ts
│   │   │   │   ├── jobs.ts
│   │   │   │   └── admin.ts
│   │   │   ├── middleware/        # Express middleware
│   │   │   ├── models/            # Database models
│   │   │   ├── utils/             # Utilities
│   │   │   └── index.ts           # Server entry point
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── worker/                    # Job queue worker
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   ├── distribution.ts
│   │   │   │   ├── soundcloud.ts
│   │   │   │   ├── video.ts
│   │   │   │   └── social.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── web/                       # React frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Tracks.tsx
│   │   │   │   ├── Platforms.tsx
│   │   │   │   ├── Jobs.tsx
│   │   │   │   ├── Admin.tsx
│   │   │   │   ├── Onboarding.tsx
│   │   │   │   └── ...
│   │   │   ├── components/
│   │   │   │   ├── DistributionBoard.tsx
│   │   │   │   ├── PlatformRegistry.tsx
│   │   │   │   ├── JobLogs.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── useDistribution.ts
│   │   │   │   ├── useJobs.ts
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── socket.ts
│   │   │   │   └── ...
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── shared/                    # Shared types and constants
│       ├── types.ts
│       ├── constants.ts
│       └── package.json
│
├── docker-compose.yml             # Local dev environment
├── Dockerfile                     # Container image
├── .github/
│   └── workflows/
│       ├── test.yml               # Run tests on PR
│       ├── build.yml              # Build Docker image
│       └── deploy.yml             # Deploy to production
├── .gitignore
├── LICENSE                        # MIT License
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md             # Community guidelines
└── package.json                   # Root package.json
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/maestro

# Redis
REDIS_URL=redis://localhost:6379

# Platform APIs
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
APPLE_MUSIC_KEY=your_apple_music_key
YOUTUBE_API_KEY=your_youtube_api_key
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id

# Aggregators
DISTROKID_API_KEY=your_distrokid_api_key
TUNECORE_API_KEY=your_tunecore_api_key
CD_BABY_API_KEY=your_cd_baby_api_key

# WaveForge
WAVEFORGE_API_KEY=your_waveforge_api_key

# Social Media
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TIKTOK_ACCESS_TOKEN=your_tiktok_token
TWITTER_API_KEY=your_twitter_api_key

# Notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_api_key

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

---

## 📊 Roadmap

### Phase 1: MVP (Weeks 1-4)
- [x] Core distribution engine (Spotify, Apple Music, YouTube Music)
- [x] SoundCloud monitor (polling)
- [x] Distribution status dashboard
- [x] Artist onboarding
- [x] Basic job queue + retry logic
- [x] Distribution logs

**Status**: Foundation complete, ready for Phase 2

### Phase 2: Expansion (Weeks 5-8)
- [ ] Aggregator fallback (DistroKid, TuneCore, CD Baby)
- [ ] Additional platforms (Tidal, Deezer, Bandcamp, SoundCloud)
- [ ] Music video generation (WaveForge)
- [ ] Social media auto-posting (Instagram, TikTok, Twitter)
- [ ] Webhook support for real-time updates
- [ ] Admin control panel

### Phase 3: Intelligence (Weeks 9-12)
- [ ] AI mood/energy detection
- [ ] Automatic ISRC generation
- [ ] Smart retry orchestration
- [ ] Platform advocacy engine
- [ ] Merch automation (Printful, Printify)
- [ ] Advanced analytics

### Phase 4: Global Scale (Weeks 13+)
- [ ] Multi-language support
- [ ] Regional platforms (NetEase, KuGou, Wynk, Gaana)
- [ ] Blockchain integration (NFT drops, royalty splits)
- [ ] Artist community features
- [ ] Marketplace for distribution rights
- [ ] Enterprise features (label management)

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is valuable.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** and write tests
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a clear description

### Development Guidelines

- **Code Style**: Use ESLint and Prettier (run `pnpm format`)
- **Testing**: Write tests for all new features (run `pnpm test`)
- **Documentation**: Update docs for API changes
- **Commits**: Use clear, descriptive commit messages
- **PRs**: Link related issues and provide context

### Adding a New Platform

1. Create a new adapter in `packages/api/src/services/platforms/{platform}.ts`
2. Implement the `PlatformAdapter` interface
3. Register the adapter in `packages/api/src/services/distribution.ts`
4. Add platform to `platform_registry` table
5. Write tests in `packages/api/tests/platforms/{platform}.test.ts`
6. Update documentation in `docs/PLATFORM_INTEGRATION.md`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📜 License

Maestro is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

This means you can use, modify, and distribute Maestro freely, even for commercial purposes, as long as you include the license notice.

---

## 🛡️ Security

We take security seriously. If you discover a security vulnerability, please email **security@maestro.local** instead of using the public issue tracker.

### Security Best Practices

- All credentials encrypted at rest (AES-256)
- API keys stored in secure vault
- HTTPS/TLS for all communications
- Rate limiting on all endpoints
- Input validation and sanitization
- GDPR/CCPA compliance

See [SECURITY.md](./docs/SECURITY.md) for more details.

---

## 💬 Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Discord Server**: [Join our community](https://discord.gg/maestro) (coming soon)
- **Twitter**: [@MaestroMusic](https://twitter.com/maestromusic) (coming soon)

---

## 🎓 Learning Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md) — Full system design
- [API Reference](./docs/API.md) — Complete API documentation
- [Platform Integration Guide](./docs/PLATFORM_INTEGRATION.md) — How to add new platforms
- [Deployment Guide](./docs/DEPLOYMENT.md) — Production deployment
- [Contributing Guide](./CONTRIBUTING.md) — How to contribute

---

## 🙏 Acknowledgments

Maestro is built with love for independent musicians. We're inspired by the open-source community and the artists fighting for their freedom.

Special thanks to:
- The Node.js and TypeScript communities
- Open-source contributors worldwide
- Independent musicians everywhere

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **GitHub Issues**: [Report a bug](https://github.com/ereezyy/maestro/issues)
- **GitHub Discussions**: [Ask a question](https://github.com/ereezyy/maestro/discussions)
- **Email**: support@maestro.local (coming soon)

---

## 🚀 Let's Build the Future of Music

**Maestro** is more than a tool—it's a movement. We're giving power back to artists, one track at a time.

If you believe independent musicians deserve better, join us. Contribute code, ideas, or just spread the word.

**Together, we'll make every artist omnipresent.**

---

**Made with ❤️ by the Maestro community**

*One track. Infinite reach. Everywhere.*
