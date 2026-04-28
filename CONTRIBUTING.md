# Contributing to Distro Buzz

Thank you for your interest in contributing to Distro Buzz! We're excited to have you join our mission to empower independent musicians.

This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the issue list to ensure the problem hasn't already been reported.

**When creating a bug report, include:**
- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Screenshots or error messages (if applicable)
- Your environment (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Before proposing a feature, check if it's already been suggested.

**When suggesting a feature, include:**
- A clear, descriptive title
- A detailed description of the feature
- Use cases and benefits
- Possible implementation approach (optional)
- Examples of similar features in other projects (optional)

### Submitting Pull Requests

1. **Fork the repository** and create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, focused commits
   ```bash
   git commit -m "Add feature: clear description of what you did"
   ```

3. **Write tests** for your changes
   - Add unit tests in `packages/*/tests/`
   - Ensure all tests pass: `pnpm test`

4. **Follow code style guidelines**
   - Run formatter: `pnpm format`
   - Run linter: `pnpm lint`
   - Ensure TypeScript compiles: `pnpm check`

5. **Update documentation**
   - Update README if needed
   - Add/update relevant docs in `docs/`
   - Include inline code comments for complex logic

6. **Push to your fork** and open a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Describe your PR** with:
   - What problem does this solve?
   - How does it solve it?
   - Any breaking changes?
   - Related issues (use `Closes #123`)

---

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm (install with `npm install -g pnpm`)
- Git

### Local Development Environment

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/distro-buzz.git
cd distro-buzz

# 2. Install dependencies
pnpm install

# 3. Start services
docker-compose up -d

# 4. Run migrations
pnpm run db:migrate

# 5. Start development server
pnpm run dev

# 6. In another terminal, start workers
pnpm run worker
```

### Available Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm worker           # Start job queue worker
pnpm db:migrate       # Run database migrations
pnpm db:generate      # Generate new migrations

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm format           # Format code with Prettier
pnpm lint             # Run ESLint
pnpm check            # Type check with TypeScript

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Docker
docker-compose up     # Start all services
docker-compose down   # Stop all services
docker-compose logs   # View service logs
```

---

## Project Structure

```
distro-buzz/
├── packages/
│   ├── api/           # Express API server
│   ├── worker/        # Job queue worker
│   ├── web/           # React frontend
│   └── shared/        # Shared types and constants
├── docs/              # Documentation
├── docker-compose.yml # Local dev environment
└── ...
```

### Key Files

- **API Routes**: `packages/api/src/routes/`
- **Services**: `packages/api/src/services/`
- **Platform Adapters**: `packages/api/src/services/platforms/`
- **Database Models**: `packages/api/src/models/`
- **Frontend Pages**: `packages/web/src/pages/`
- **Frontend Components**: `packages/web/src/components/`

---

## Coding Guidelines

### TypeScript

- Use strict mode (`"strict": true` in tsconfig.json)
- Avoid `any` type; use proper typing
- Export types from modules
- Use interfaces for object shapes

```typescript
// ✅ Good
interface DistributionJob {
  id: string;
  trackId: string;
  platformId: string;
  status: 'queued' | 'processing' | 'live' | 'failed';
}

export async function createDistributionJob(job: DistributionJob): Promise<void> {
  // ...
}

// ❌ Avoid
export async function createDistributionJob(job: any): Promise<any> {
  // ...
}
```

### Code Style

- Use 2-space indentation
- Use semicolons
- Use single quotes for strings (unless template literals)
- Use `const` by default, `let` when needed, avoid `var`
- Use arrow functions for callbacks

```typescript
// ✅ Good
const processJob = async (jobId: string): Promise<void> => {
  const job = await getJob(jobId);
  await distribute(job);
};

// ❌ Avoid
var processJob = function(jobId) {
  let job = getJob(jobId);
  distribute(job);
};
```

### Comments

- Write clear, concise comments
- Explain *why*, not *what*
- Use JSDoc for public functions

```typescript
// ✅ Good
/**
 * Distributes a track to all enabled platforms.
 * Retries failed platforms with exponential backoff.
 *
 * @param track - The track to distribute
 * @param platforms - List of platform IDs to target
 * @returns Promise that resolves when all jobs are queued
 */
export async function distributeTrack(track: Track, platforms: string[]): Promise<void> {
  // Implementation...
}

// ❌ Avoid
// This function distributes a track
function distributeTrack(track, platforms) {
  // ...
}
```

### Testing

- Write tests for all new features
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
// ✅ Good
describe('distributeTrack', () => {
  it('should create distribution jobs for all enabled platforms', async () => {
    // Arrange
    const track = createMockTrack();
    const platforms = ['spotify', 'apple_music'];

    // Act
    await distributeTrack(track, platforms);

    // Assert
    const jobs = await getDistributionJobs(track.id);
    expect(jobs).toHaveLength(2);
    expect(jobs.map(j => j.platformId)).toEqual(platforms);
  });
});
```

### Error Handling

- Use custom error classes
- Provide helpful error messages
- Log errors with context

```typescript
// ✅ Good
class DistributionError extends Error {
  constructor(
    public platformId: string,
    public jobId: string,
    message: string
  ) {
    super(message);
    this.name = 'DistributionError';
  }
}

try {
  await distributeToSpotify(track);
} catch (error) {
  logger.error('Spotify distribution failed', {
    jobId: job.id,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw new DistributionError(job.platformId, job.id, 'Spotify API failed');
}
```

---

## Adding a New Platform

To add support for a new distribution platform:

### 1. Create Platform Adapter

Create `packages/api/src/services/platforms/{platform}.ts`:

```typescript
import { PlatformAdapter, DistributionResult, Track } from '../types';

export class SpotifyAdapter implements PlatformAdapter {
  platformId = 'spotify';
  name = 'Spotify';

  async authenticate(): Promise<void> {
    // Authenticate with platform API
  }

  async distribute(track: Track, metadata: any): Promise<DistributionResult> {
    // Distribute track to platform
    // Return { success, platformTrackId, platformUrl, metadata }
  }

  async getStatus(platformTrackId: string): Promise<any> {
    // Get current status of track on platform
  }

  async handleWebhook(payload: any): Promise<void> {
    // Handle webhook updates from platform
  }

  async healthCheck(): Promise<any> {
    // Check if platform API is healthy
  }
}
```

### 2. Register Platform

Add to `packages/api/src/services/distribution.ts`:

```typescript
import { SpotifyAdapter } from './platforms/spotify';

const adapters = [
  new SpotifyAdapter(),
  // ... other adapters
];
```

### 3. Add to Registry

Insert into `platform_registry` table:

```sql
INSERT INTO platform_registry (
  id, name, category, integration_method, api_endpoint,
  rate_limit_per_hour, webhook_supported, priority, enabled
) VALUES (
  'spotify', 'Spotify', 'streaming', 'direct_api',
  'https://api.spotify.com/v1', 3600, true, 90, true
);
```

### 4. Write Tests

Create `packages/api/tests/platforms/spotify.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpotifyAdapter } from '../../src/services/platforms/spotify';

describe('SpotifyAdapter', () => {
  let adapter: SpotifyAdapter;

  beforeEach(() => {
    adapter = new SpotifyAdapter();
  });

  it('should successfully distribute a track', async () => {
    // Test implementation
  });

  it('should handle API errors gracefully', async () => {
    // Test error handling
  });
});
```

### 5. Update Documentation

Add to `docs/PLATFORM_INTEGRATION.md`:

```markdown
## Spotify

**Integration Method**: Direct API  
**Rate Limit**: 3,600 requests/hour  
**Webhook Support**: Yes  
**Time to Live**: 24-48 hours

### Setup

1. Create Spotify Developer Application
2. Get Client ID and Client Secret
3. Set environment variables:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### API Documentation

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Upload Endpoint](https://developer.spotify.com/documentation/web-api/reference/upload-track)
```

---

## Commit Message Guidelines

Use clear, descriptive commit messages following this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build, dependencies, tooling changes

### Examples

```
feat(distribution): add Spotify direct API integration

Implement SpotifyAdapter for direct track distribution.
Includes authentication, upload, and webhook handling.

Closes #123
```

```
fix(worker): handle job timeout gracefully

Add timeout handling to prevent stuck jobs.
Implement exponential backoff for retries.
```

---

## Pull Request Process

1. **Ensure tests pass**: `pnpm test`
2. **Ensure code is formatted**: `pnpm format`
3. **Ensure no linting errors**: `pnpm lint`
4. **Ensure TypeScript compiles**: `pnpm check`
5. **Update documentation** if needed
6. **Request review** from maintainers
7. **Address feedback** and push updates
8. **Merge** once approved

---

## Review Process

### What Reviewers Look For

- **Correctness**: Does the code work as intended?
- **Testing**: Are there adequate tests?
- **Documentation**: Is it well-documented?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security issues?
- **Style**: Does it follow project guidelines?

### Responding to Reviews

- Respond to all comments
- Make requested changes or explain why you disagree
- Push new commits (don't force-push)
- Re-request review when ready

---

## Getting Help

- **GitHub Issues**: Ask questions in issue discussions
- **GitHub Discussions**: Start a discussion for broader topics
- **Discord**: Join our community (coming soon)
- **Email**: Reach out to maintainers

---

## Recognition

Contributors are recognized in:
- README.md (for significant contributions)
- GitHub contributors page
- Release notes (for features/fixes)

---

## Questions?

Don't hesitate to ask! We're here to help. Open an issue or start a discussion.

---

**Thank you for contributing to Distro Buzz! Together, we're building the future of music distribution.**
