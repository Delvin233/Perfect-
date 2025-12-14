# Perfect? Mini App Deployment Guide

This guide covers deploying Perfect? as a Farcaster Mini App. **Note: Base Apps are Farcaster Apps** - they use the same Mini App infrastructure and SDK, just with additional Base-specific features.

## 🚀 Quick Deployment Checklist

### Prerequisites

- [ ] Domain ready for deployment (e.g., `perfect-timer-game.vercel.app`)
- [ ] Base account with address for `baseBuilder.ownerAddress`
- [ ] Farcaster account (optional, for signing manifest)

### 1. Environment Configuration

Create `.env.local` with these variables:

```bash
# Required - Your deployment URL
NEXT_PUBLIC_URL=https://your-domain.com

# Database (Turso)
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Web3 Integration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key

# Base App Integration (Base Apps are Farcaster Apps)
NEXT_PUBLIC_BASE_OWNER_ADDRESS=your_base_account_address

# Farcaster Mini App - Account Association (REQUIRED for production)
NEXT_PUBLIC_FARCASTER_HEADER=your_signed_header
NEXT_PUBLIC_FARCASTER_PAYLOAD=your_signed_payload
NEXT_PUBLIC_FARCASTER_SIGNATURE=your_signed_signature

# Neynar API for enhanced Farcaster features (RECOMMENDED)
NEYNAR_API_KEY=your_neynar_api_key

# Optional - Farcaster Developer Info
NEXT_PUBLIC_FARCASTER_DEVELOPER_FID=your_farcaster_fid

# Optional - Name Resolution
ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

### 2. Update Manifest URLs

Update `public/.well-known/farcaster.json` with your domain:

```json
{
  "accountAssociation": {
    "header": "",
    "payload": "",
    "signature": ""
  },
  "baseBuilder": {
    "ownerAddress": "YOUR_BASE_ACCOUNT_ADDRESS"
  },
  "miniapp": {
    "version": "1",
    "name": "Perfect?",
    "subtitle": "Stop the timer at the perfect moment",
    "description": "A precision timing game where you stop the timer at exact moments to progress through levels. Compete on the on-chain leaderboard!",
    "iconUrl": "https://YOUR-DOMAIN.com/icon.png",
    "splashImageUrl": "https://YOUR-DOMAIN.com/splash.png",
    "splashBackgroundColor": "#0052ff",
    "homeUrl": "https://YOUR-DOMAIN.com",
    "webhookUrl": "https://YOUR-DOMAIN.com/api/webhook",
    "primaryCategory": "game",
    "tags": ["game", "timing", "leaderboard", "web3", "arcade", "precision"],
    "heroImageUrl": "https://YOUR-DOMAIN.com/hero.png",
    "tagline": "Can you stop time perfectly?",
    "ogTitle": "Perfect? - Precision Timing Game",
    "ogDescription": "Stop the timer at the perfect moment and climb the leaderboard",
    "ogImageUrl": "https://YOUR-DOMAIN.com/hero.png",
    "noindex": true
  }
}
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_URL
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
# ... add all other env vars
```

### 4. Setup Neynar API (Recommended)

For enhanced Farcaster features like user profile resolution in leaderboards:

1. Go to [Neynar Developer Portal](https://neynar.com/)
2. Create an account and get your API key
3. Add `NEYNAR_API_KEY` to your environment variables
4. This enables Farcaster username/profile display in leaderboards

### 5. Sign Account Association

#### For Base App (Recommended)

1. Go to [Base Build](https://base.dev/preview?tab=account)
2. Enter your domain (e.g., `perfect-timer-game.vercel.app`)
3. Click "Submit" then "Verify"
4. Sign with your Base account
5. Copy the generated `accountAssociation` fields
6. Add them as environment variables in Vercel:
   - `NEXT_PUBLIC_FARCASTER_HEADER`
   - `NEXT_PUBLIC_FARCASTER_PAYLOAD`
   - `NEXT_PUBLIC_FARCASTER_SIGNATURE`

#### For Farcaster (Alternative)

1. Go to [Farcaster Developer Tools](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Enter your domain
3. Sign with your Farcaster account
4. Copy the `accountAssociation` fields and add them as environment variables

### 5. Test Your Deployment

#### Base Build Preview Tool

1. Go to [Base Build Preview](https://base.dev/preview)
2. Enter your domain
3. Test the embed and launch functionality
4. Check the "Account association" tab
5. Verify metadata in the "Metadata" tab

#### Farcaster Preview Tool

1. Go to [Farcaster Preview](https://farcaster.xyz/~/developers/mini-apps/preview)
2. Enter your app URL
3. Test the Mini App functionality

### 6. Publish Your App

#### Base App

1. Open Base App
2. Create a post with your app URL
3. The app will appear as a rich embed
4. Users can launch and add your Mini App

#### Farcaster

1. Share your app URL in a Farcaster cast
2. The Mini App embed will appear
3. Users can launch directly from the feed

## 🔧 Advanced Configuration

### Custom Domain Setup

If using a custom domain:

1. Configure DNS settings
2. Update `NEXT_PUBLIC_URL` environment variable
3. Update all URLs in the manifest
4. Re-sign the account association

### Webhook Configuration

The webhook endpoint (`/api/webhook`) handles:

- Mini App installation events
- User interaction analytics
- Notification click tracking

Test webhook with:

```bash
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {"message": "hello"}}'
```

### Database Setup

Perfect? uses Turso (SQLite) for the leaderboard:

1. Create account at [turso.tech](https://turso.tech)
2. Create database: `turso db create perfect-timer`
3. Get connection details: `turso db show perfect-timer`
4. Create auth token: `turso db tokens create perfect-timer`

The app will automatically create the required tables.

## 🎯 Platform-Specific Features

### Base App Features

- ✅ Smart wallet integration
- ✅ Base Names resolution
- ✅ OnchainKit components
- ✅ Base network transactions
- ✅ Builder rewards eligibility

### Farcaster Features

- ✅ Farcaster profile integration
- ✅ Cast composition and sharing
- ✅ Quick Auth authentication
- ✅ Social context awareness
- ✅ Frame-style embeds

### Shared Features

- ✅ Wallet connection (Reown AppKit)
- ✅ Multi-chain support (Base, Celo)
- ✅ Leaderboard system
- ✅ Score sharing
- ✅ Responsive design

## 🐛 Troubleshooting

### Common Issues

#### Manifest Not Found (404)

- Check file exists at `/.well-known/farcaster.json`
- Verify URL is accessible publicly
- Check Vercel deployment includes the file

#### Account Association Invalid

- Ensure domain in signature matches hosting domain exactly
- Include subdomains (www, app, etc.) if used
- Re-sign if domain changes

#### Mini App Not Loading

- Check `sdk.actions.ready()` is called
- Verify all assets (images) are accessible
- Check browser console for errors

#### Embed Not Showing

- Verify `fc:miniapp` metadata in HTML
- Check image URLs are valid and accessible
- Ensure proper JSON formatting

### Debug Tools

#### Development Debug Panel

In development mode, use the debug panel (bottom-right corner) to check:

- Mini App detection
- SDK initialization
- User context
- Authentication status

#### Browser Console

Check for errors related to:

- SDK initialization
- Network requests
- Image loading
- Authentication

#### Network Tab

Verify these requests succeed:

- `/.well-known/farcaster.json` (200)
- `/hero.png` (200)
- `/icon.png` (200)
- `/splash.png` (200)

## 📊 Analytics & Monitoring

### Built-in Analytics

- Vercel Analytics (page views, performance)
- Webhook events (user interactions)
- Database queries (score submissions)

### Custom Tracking

Add custom events in:

- `FarcasterActions.tsx` (sharing events)
- `TimerGame.tsx` (gameplay events)
- `api/scores/route.ts` (score events)

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Manifest signed and deployed
- [ ] Images optimized and accessible
- [ ] Database connected and working
- [ ] Webhook endpoint responding
- [ ] Both preview tools working
- [ ] Mobile testing completed

### Launch Strategy

1. **Soft Launch**: Share with friends for testing
2. **Community Launch**: Post in relevant Discord/Telegram groups
3. **Social Launch**: Share on Twitter/Farcaster with hashtags
4. **Platform Launch**: Submit to Base App and Farcaster directories

### Post-Launch Monitoring

- Monitor webhook logs for errors
- Check database performance
- Track user engagement metrics
- Gather user feedback
- Monitor app performance

---

Perfect? is now ready to launch as a Mini App on both Base App and Farcaster! 🎯✨

For support, check the troubleshooting section or refer to:

- [Base App Documentation](https://docs.base.org/mini-apps)
- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/developers/miniapps)
