# Maestro Architecture Documentation

This document provides a comprehensive overview of Maestro's system architecture, design decisions, and implementation details.

## Quick Links

- **[Full Architecture Document](../../../architecture.md)** — Complete system design with all details
- **[API Reference](./API.md)** — REST API endpoints and tRPC procedures
- **[Platform Integration Guide](./PLATFORM_INTEGRATION.md)** — How to add new platforms
- **[Deployment Guide](./DEPLOYMENT.md)** — Production deployment instructions
- **[Security Guide](./SECURITY.md)** — Security best practices and guidelines

## Architecture Overview

Maestro is built as a distributed system with the following core components:

### Services

1. **API Server** (`packages/api`)
   - Express.js REST API
   - tRPC procedures for type-safe client-server communication
   - OAuth authentication and session management
   - Database models and query helpers

2. **Job Queue Worker** (`packages/worker`)
   - Redis Bull job processing
   - Platform-specific distribution logic
   - Retry and fallback orchestration
   - Webhook handling

3. **Frontend** (`packages/web`)
   - React 19 with TypeScript
   - Real-time WebSocket updates
   - Dark cyberpunk/neon UI theme
   - Distribution dashboard and analytics

4. **Shared Types** (`packages/shared`)
   - TypeScript type definitions
   - Constants and enums
   - Utility functions

### Data Flow

```
Artist uploads track
    ↓
API validates and stores track metadata
    ↓
Distribution Engine creates jobs for each platform
    ↓
Jobs enqueued in Redis Bull (priority-based)
    ↓
Workers process jobs in parallel
    ├─ Direct API Distribution
    ├─ Aggregator Fallback
    ├─ Video Generation
    └─ Social Media Automation
    ↓
WebSocket updates sent to dashboard
    ↓
Artist receives notifications
```

## Database Schema

### Core Tables

- **artists** — User profiles and SoundCloud connections
- **tracks** — Audio files and metadata
- **distribution_jobs** — Per-platform distribution status
- **distribution_logs** — Audit trail of all actions
- **platform_registry** — Catalog of supported platforms
- **aggregator_accounts** — Linked aggregator credentials
- **music_video_jobs** — WaveForge video generation
- **social_media_posts** — Auto-posted content

See `packages/api/src/models/schema.ts` for full schema.

## Key Design Decisions

### 1. Microservices Architecture
- **Why**: Scalability, independent deployment, fault isolation
- **How**: Separate API server and job workers communicating via Redis

### 2. Job Queue Pattern
- **Why**: Reliable, distributed job processing with retries
- **How**: Redis Bull for job persistence and worker coordination

### 3. Platform Adapters
- **Why**: Easy to add new platforms without modifying core logic
- **How**: Adapter pattern with common interface

### 4. Real-Time Updates
- **Why**: Artists need live visibility into distribution status
- **How**: WebSocket (Socket.io) for push updates from workers

### 5. Fallback Chains
- **Why**: Maximize distribution success rate
- **How**: Direct API → Aggregator → Manual intervention

## Deployment

### Local Development

```bash
docker-compose up
pnpm dev
```

### Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker Kubernetes deployment
- Environment configuration
- Database migrations
- Monitoring and alerting

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## Support

- **Issues**: [GitHub Issues](https://github.com/ereezyy/maestro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ereezyy/maestro/discussions)
- **Documentation**: [docs/](.)
