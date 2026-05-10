# Distro Buzz

> **AI-Powered Music Distribution & Talent Management Platform**

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.13-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## Overview

**Distro Buzz** is a next-generation platform for independent musicians and artists. It combines **AI-powered talent management**, **multi-platform music distribution**, **legal protection**, **merch automation**, and **gig discovery** into a single, premium SaaS experience.

### Key Features

🎵 **Music Distribution**
- Distribute to 50+ platforms (Spotify, Apple Music, YouTube Music, TikTok, etc.)
- Real-time distribution tracking and analytics
- Automatic metadata management and ISRC generation

🤖 **AI Talent Agent**
- Conversational AI for outreach, negotiation, and booking
- Groq + Grok inference for intelligent recommendations
- Automated email and proposal generation

🎤 **Gig Discovery & Booking**
- AI-curated opportunities from 8+ sources
- Venue listings, casting calls, brand partnerships
- Smart rate negotiation and calendar management

⚖️ **Legal Protection**
- DMCA takedown automation
- Copyright registration assistance
- Contract generation and review with AI

🎨 **Merch Automation**
- Print-on-demand integration (Printful)
- Auto-generated designs from artist branding
- Profit tracking and fulfillment management

💰 **Stripe Checkout**
- A la carte feature selection
- Subscription management
- Professional invoicing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
│  Landing | Dashboard | Agent | Gigs | Legal | Media | Merch│
│              Dark Theme • Cyan/Blue/Green Neon              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    tRPC API Layer
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  Backend (Express + tRPC)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services                                             │  │
│  │ • AIAgentService (Groq/Grok)                         │  │
│  │ • StripeCheckoutService                              │  │
│  │ • VoiceOutreachService (Twilio/Deepgram)             │  │
│  │ • GigSyndicateService (8-source scraping)            │  │
│  │ • MerchAutomationService (Printful)                  │  │
│  │ • DistributionEngine (SoundCloud, aggregators)       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼──┐        ┌────▼────┐    ┌────▼────┐
    │MySQL │        │  S3     │    │ External│
    │ TiDB │        │ Storage │    │  APIs   │
    └──────┘        └─────────┘    └─────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Tailwind 4, TypeScript | UI/UX with premium SaaS aesthetic |
| **Backend** | Express 4, tRPC 11, TypeScript | Type-safe API layer |
| **Database** | MySQL/TiDB, Drizzle ORM | Persistent data storage |
| **Auth** | JWT (custom), bcrypt | Secure authentication |
| **AI** | Groq, Grok (xAI) | Inference and chat |
| **Voice** | Twilio, Deepgram | Phone calls and transcription |
| **Payments** | Stripe | Checkout and subscriptions |
| **Storage** | S3 | File storage and CDN |
| **Merch** | Printful API | Print-on-demand fulfillment |
| **Testing** | Vitest | Unit and integration tests |

---

## Quick Start

### Prerequisites

- Node.js 22.13+
- pnpm 9+
- MySQL/TiDB database
- Environment variables (see `.env.example`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ereezyy/distro-buzz.git
cd distro-buzz

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Run database migrations
pnpm drizzle-kit generate
# Apply migrations via webdev_execute_sql or your database client

# Start development server
pnpm dev
```

The application will start at `http://localhost:3000`.

### Environment Variables

See `ENV_SETUP.md` for a comprehensive guide to all 40+ required environment variables, including:

- **Stripe**: `STRIPE_SECRET_KEY`
- **AI Services**: `GROQ_API_KEY`, `XAI_API_KEY`
- **Voice**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `DEEPGRAM_API_KEY`
- **Merch**: `PRINTFUL_API_KEY`
- **Database**: `DATABASE_URL`
- **OAuth/Auth**: `JWT_SECRET`, `OAUTH_SERVER_URL` (optional fallback)

---

## Project Structure

```
distro-buzz/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (agent, gigs, legal, media, merch, checkout)
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (theme, auth)
│   │   ├── lib/              # Utilities (tRPC client, hooks)
│   │   └── index.css         # Global styles (Tailwind + CSS variables)
│   └── public/               # Static files (favicon, robots.txt)
├── server/                    # Express backend
│   ├── services/             # Business logic (AI, Stripe, voice, gigs, merch)
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── _core/                # Framework plumbing (auth, context, OAuth)
│   └── adapters/             # Platform integrations (SoundCloud, YouTube, etc.)
├── drizzle/                   # Database schema and migrations
├── shared/                    # Shared types and constants
├── .env.example              # Environment variable template
├── ENV_SETUP.md              # Detailed environment setup guide
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

---

## Features in Detail

### 🎵 Music Distribution

Distro Buzz connects to 50+ music platforms through aggregators and direct APIs:

- **Direct Platforms**: Spotify, Apple Music, YouTube Music, TikTok, Amazon Music
- **Aggregators**: DistroKid, CD Baby, TuneCore, Believe, Symphonic
- **Social**: SoundCloud, Instagram, TikTok, YouTube
- **Real-time Tracking**: View distribution status, streams, and earnings per platform
- **Metadata Management**: Auto-generate ISRC codes, manage artwork, handle localization

### 🤖 AI Talent Agent

The platform's AI agent handles complex tasks on behalf of the artist:

- **Chat Interface**: Conversational AI for strategy, questions, and recommendations
- **Outreach Automation**: Generate professional emails to venues, brands, and boosters
- **Gig Analysis**: Score opportunities by relevance to artist profile
- **Contract Review**: AI-powered legal analysis and negotiation suggestions
- **Task Queue**: Track pending actions, responses, and follow-ups

### 🎤 Gig Discovery

Discover and manage performance opportunities:

- **8-Source Syndicate**: Bandsintown, Songkick, Ticketmaster, Eventbrite, Craigslist, Upwork, Thumbtack, Fiverr
- **AI Ranking**: Relevance scoring based on artist profile, genre, and past performance
- **Calendar View**: Manage schedule and availability
- **Rate Negotiation**: AI-assisted pricing and contract terms
- **Response Tracking**: Log interest, negotiations, and bookings

### ⚖️ Legal Protection

Protect intellectual property and manage contracts:

- **DMCA Automation**: File takedowns for unauthorized use
- **Copyright Registration**: Step-by-step guidance for registration
- **Contract Templates**: Generate and customize performance, distribution, and licensing agreements
- **Brand Monitoring**: Track unauthorized use of artist name/likeness
- **IP Portfolio**: Manage all registrations and filings in one place

### 🎨 Merch Automation

Create and sell branded merchandise:

- **Print-on-Demand**: T-shirts, hoodies, stickers, posters, phone cases
- **Design Generation**: Auto-create designs from artist logo, colors, and branding
- **Merch Store**: Dedicated storefront on the platform
- **Order Fulfillment**: Printful handles production and shipping
- **Profit Tracking**: See margins, revenue, and best-selling products

### 💰 Stripe Checkout

Flexible pricing and payment options:

- **A La Carte Features**: Pay for individual features ($4.99–$49.99)
- **Subscription Plans**: Monthly/annual subscriptions with discounts
- **Professional Invoicing**: Automated receipts and tax handling
- **Subscription Management**: Upgrade, downgrade, or cancel anytime

---

## API Documentation

### tRPC Routers

The backend exposes the following tRPC routers:

**customAuth**
- `login(email, password)` - Authenticate user
- `signup(email, password, name)` - Create account
- `logout()` - Clear session
- `me()` - Get current user

**stripe**
- `createCheckoutSession(features)` - Create Stripe checkout
- `getSubscription()` - Retrieve user subscription
- `cancelSubscription()` - Cancel active subscription

**aiAgent**
- `chat(message)` - Chat with AI agent
- `generateOutreach(gigId)` - Generate outreach email
- `analyzeGig(gigId)` - Score gig opportunity
- `reviewContract(contractText)` - AI contract analysis
- `getHistory()` - Retrieve conversation history
- `clearHistory()` - Clear chat history

**voice**
- `initiateCall(targetPhone)` - Make AI phone call
- `getCallHistory()` - Retrieve call logs
- `getCallAnalytics()` - Call performance metrics

**gigs**
- `discover()` - Scan 8 sources for opportunities
- `getDiscovered()` - List discovered gigs
- `markInterested(gigId)` - Flag promising opportunity
- `getAnalytics()` - Gig discovery metrics

**merch**
- `createProduct(design, productType)` - Add POD product
- `getUserProducts()` - List user's products
- `processOrder(productId, quantity)` - Handle order
- `getUserOrders()` - Order history
- `getAnalytics()` - Merch revenue metrics

See `/api-docs` in the app for interactive API documentation.

---

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Run TypeScript type checking
pnpm tsc --noEmit

# Lint code (ESLint)
pnpm lint

# Format code (Prettier)
pnpm format
```

---

## Deployment

### Prerequisites

- MySQL/TiDB database (production-grade)
- S3 bucket for file storage
- API keys for all external services (Stripe, Groq, Grok, Twilio, Deepgram, Printful)

### Deployment Steps

1. **Set environment variables** on your hosting platform
2. **Run database migrations** to initialize schema
3. **Build the application**: `pnpm build`
4. **Start the server**: `pnpm start`
5. **Configure CDN** for S3 storage URLs
6. **Set up monitoring** and logging

The application is containerizable and can be deployed to any Node.js-compatible platform (Vercel, Railway, Render, AWS, etc.).

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and ensure tests pass: `pnpm test`
4. **Commit with clear messages**: `git commit -m "Add feature: description"`
5. **Push to your fork**: `git push origin feature/your-feature`
6. **Open a Pull Request** with a detailed description

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: All features must have unit tests (Vitest)
- **Formatting**: Prettier for consistent code style
- **Linting**: ESLint for code quality
- **Commits**: Clear, descriptive commit messages

---

## License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Report a bug](https://github.com/ereezyy/distro-buzz/issues)
- **Documentation**: See `ENV_SETUP.md` for environment configuration
- **Email**: [Your contact email]

---

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Collaboration tools for producers/managers
- [ ] Direct artist-to-fan marketplace
- [ ] Blockchain-based royalty tracking
- [ ] Real-time collaboration studio
- [ ] API for third-party integrations

---

## Credits

Built with ❤️ by the Distro Buzz team. Powered by cutting-edge AI, premium SaaS design, and the best music tech stack.

---

**Last Updated**: May 2026 | **Version**: 1.0.0 | **Status**: Production Ready
