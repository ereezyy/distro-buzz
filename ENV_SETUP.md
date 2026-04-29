# Distro Buzz - Complete Environment Setup Guide

This document provides comprehensive setup instructions for all required environment variables and API credentials.

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in credentials from each service below
3. Test each integration before deploying

## Core Services (Required)

### Database

```
DATABASE_URL=mysql://user:password@localhost:3306/distro_buzz
```

**Setup:**
- Create MySQL database
- Copy connection string

### Authentication

```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
VITE_APP_ID=your-manus-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
```

### Manus Built-in Services

```
BUILT_IN_FORGE_API_URL=https://api.manus.im/v1
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/v1
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_ANALYTICS_ENDPOINT=https://api.manus.im/v1/analytics
VITE_ANALYTICS_WEBSITE_ID=your_analytics_website_id
```

---

## Revenue Integration (Stripe)

### Stripe Payment Processing

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_STARTER_MONTHLY=price_starter_monthly_id
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id
STRIPE_PRICE_LABEL_MONTHLY=price_label_monthly_id
```

**Setup Instructions:**

1. Go to https://stripe.com and create an account
2. Navigate to Dashboard → API Keys
3. Copy your Secret Key (starts with `sk_test_` or `sk_live_`)
4. Copy your Publishable Key (starts with `pk_test_` or `pk_live_`)
5. Create products and prices in Stripe Dashboard:
   - Starter Plan: $199/month
   - Professional Plan: $449/month
   - Label Plan: $799/month
6. Copy each price ID (format: `price_xxxxx`)
7. Set up webhook endpoint:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Subscribe to: `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret

---

## AI Agent Integration

### Groq AI (Gig Discovery, Contract Analysis, Outreach)

```
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
```

**Setup:**

1. Go to https://console.groq.com
2. Sign up for free account
3. Navigate to API Keys
4. Create new API key
5. Copy the key

**Use Cases:**
- Gig discovery AI ranking
- Contract review and analysis
- Outreach email generation
- Task planning and automation

### Grok AI (xAI) - Chat Interface

```
XAI_API_KEY=your_xai_grok_api_key_here
XAI_MODEL=grok-4
```

**Setup:**

1. Go to https://x.ai
2. Create account
3. Navigate to API settings
4. Generate API key
5. Copy the key

**Use Cases:**
- Real-time chat with AI agent
- Conversational task management
- Quick advice and recommendations

---

## Voice Outreach (Twilio + Deepgram)

### Twilio Phone Calls

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/webhooks/twilio
```

**Setup:**

1. Go to https://www.twilio.com
2. Create account and verify phone number
3. Navigate to Account → API Keys and Tokens
4. Copy Account SID and Auth Token
5. Buy a phone number:
   - Go to Phone Numbers → Manage Numbers
   - Buy a number (US or international)
   - Copy the number (format: +1XXXXXXXXXX)
6. Set up webhooks:
   - Go to Phone Numbers → Active Numbers
   - Select your number
   - Set Voice webhook URL to: `https://your-domain.com/api/webhooks/twilio`
   - Set webhook method to POST

### Deepgram Speech-to-Text & Text-to-Speech

```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_MODEL_STT=nova-2
DEEPGRAM_MODEL_TTS=aura-asteria-en
```

**Setup:**

1. Go to https://deepgram.com
2. Create free account
3. Navigate to Settings → API Keys
4. Create new API key
5. Copy the key

**Models:**
- STT: `nova-2` (latest, most accurate)
- TTS: `aura-asteria-en` (natural-sounding female voice)

---

## Merch Automation (Printful)

### Printful Print-on-Demand

```
PRINTFUL_API_KEY=your_printful_api_key_here
PRINTFUL_WEBHOOK_URL=https://your-domain.com/api/webhooks/printful
PRINTFUL_STORE_ID=your_printful_store_id
```

**Setup:**

1. Go to https://www.printful.com
2. Create account
3. Create a store (name it after your artist)
4. Navigate to Account → API
5. Enable API access
6. Copy API key
7. Get Store ID:
   - Go to Dashboard
   - Store ID is in the URL: `printful.com/dashboard/store/[STORE_ID]`
8. Set up webhook:
   - Go to Account → Webhooks
   - Add webhook: `https://your-domain.com/api/webhooks/printful`
   - Subscribe to: `order:created`, `order:updated`, `order:shipped`

**Supported Products:**
- T-shirts
- Hoodies
- Sweatshirts
- Stickers
- Posters
- Phone cases
- Hats
- Mugs

---

## Gig Discovery Sources

### Bandsintown

```
BANDSINTOWN_APP_ID=your_bandsintown_app_id
```

**Setup:**
1. Go to https://www.bandsintown.com/api
2. Request API access
3. Get your App ID

### Songkick

```
SONGKICK_API_KEY=your_songkick_api_key
```

**Setup:**
1. Go to https://www.songkick.com/developer
2. Create app
3. Copy API key

### Ticketmaster

```
TICKETMASTER_API_KEY=your_ticketmaster_api_key
```

**Setup:**
1. Go to https://developer.ticketmaster.com
2. Create account
3. Register application
4. Copy API key

### Eventbrite

```
EVENTBRITE_API_TOKEN=your_eventbrite_api_token
```

**Setup:**
1. Go to https://www.eventbrite.com/platform/api
2. Create account
3. Generate personal token
4. Copy token

### Upwork

```
UPWORK_CLIENT_ID=your_upwork_client_id
UPWORK_CLIENT_SECRET=your_upwork_client_secret
```

**Setup:**
1. Go to https://www.upwork.com/ab/account-security/api
2. Create application
3. Copy Client ID and Secret

### Thumbtack

```
THUMBTACK_API_KEY=your_thumbtack_api_key
```

**Setup:**
1. Go to https://www.thumbtack.com/api
2. Request API access
3. Copy API key

### Fiverr

```
FIVERR_API_KEY=your_fiverr_api_key
```

**Setup:**
1. Go to https://developers.fiverr.com
2. Create app
3. Copy API key

---

## Social Media Distribution

### YouTube

```
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_youtube_channel_id
```

**Setup:**
1. Go to https://console.cloud.google.com
2. Create project
3. Enable YouTube Data API v3
4. Create API key
5. Get Channel ID from your YouTube channel

### Spotify

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

**Setup:**
1. Go to https://developer.spotify.com/dashboard
2. Create app
3. Copy Client ID and Secret

### TikTok

```
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
```

**Setup:**
1. Go to https://developers.tiktok.com
2. Create app
3. Generate access token

### Instagram

```
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
```

**Setup:**
1. Go to https://developers.facebook.com
2. Create app
3. Set up Instagram Graph API
4. Generate access token

### Twitter/X

```
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
```

**Setup:**
1. Go to https://developer.twitter.com
2. Create app
3. Copy API Key and Secret

### Reddit

```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

**Setup:**
1. Go to https://www.reddit.com/prefs/apps
2. Create app
3. Copy Client ID and Secret

---

## Legal & Compliance

### DMCA & Copyright

```
DMCA_AGENT_EMAIL=dmca-notices@your-domain.com
COPYRIGHT_OFFICE_API_KEY=your_copyright_office_api_key
LEGAL_TEMPLATE_STORAGE_PATH=/storage/legal-templates
```

---

## Application Settings

```
VITE_APP_TITLE=Distro Buzz
VITE_APP_LOGO=https://your-cdn.com/logo.png
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

---

## Feature Flags

```
FEATURE_VOICE_OUTREACH=true
FEATURE_GIG_DISCOVERY=true
FEATURE_MERCH_AUTOMATION=true
FEATURE_LEGAL_PROTECTION=true
FEATURE_AI_AGENT=true
FEATURE_STRIPE_CHECKOUT=true
```

---

## Testing Credentials

For development/testing, use these test credentials:

**Stripe Test Mode:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Twilio Test:**
- Use test credentials from Twilio Console
- No actual calls will be made

---

## Deployment Checklist

- [ ] All required secrets set in platform's secrets manager
- [ ] Database connection verified
- [ ] Stripe webhook configured and tested
- [ ] Twilio webhook configured and tested
- [ ] Printful webhook configured and tested
- [ ] All API keys are for production (not test)
- [ ] NODE_ENV=production
- [ ] Webhook URLs point to production domain
- [ ] SSL certificate installed
- [ ] Rate limiting configured
- [ ] Error logging enabled

---

## Troubleshooting

### "API key not found" error
- Verify env variable name matches exactly (case-sensitive)
- Check that .env file is in project root
- Restart server after changing .env

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check firewall/security group rules
- Verify webhook secret in platform settings
- Check server logs for incoming requests

### Payment processing fails
- Verify STRIPE_SECRET_KEY is correct (not PUBLISHABLE_KEY)
- Check Stripe account is in correct mode (test vs live)
- Verify webhook secret matches Stripe dashboard

### Voice calls not working
- Verify TWILIO_FROM_NUMBER is correct format (+1XXXXXXXXXX)
- Check Twilio account has credits/payment method
- Verify webhook URL is publicly accessible

---

## Support

For issues with specific services:
- Stripe: https://support.stripe.com
- Twilio: https://www.twilio.com/help
- Deepgram: https://support.deepgram.com
- Printful: https://help.printful.com
- Groq: https://console.groq.com/docs
- xAI: https://x.ai/support
