# Perfect? Quick Reference

## 🚀 Environment Variables (Production)

```bash
# Required
NEXT_PUBLIC_URL=https://your-domain.com
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Base App (Farcaster App with Base features)
NEXT_PUBLIC_BASE_OWNER_ADDRESS=your_base_address

# Farcaster Mini App (Add in Vercel after signing)
NEXT_PUBLIC_FARCASTER_HEADER=signed_header
NEXT_PUBLIC_FARCASTER_PAYLOAD=signed_payload
NEXT_PUBLIC_FARCASTER_SIGNATURE=signed_signature

# Enhanced Features (Recommended)
NEYNAR_API_KEY=your_neynar_api_key
```

## 📱 Key URLs

- **Manifest**: `https://your-domain.com/.well-known/farcaster.json`
- **Base Build Preview**: https://base.dev/preview
- **Farcaster Preview**: https://farcaster.xyz/~/developers/mini-apps/preview
- **Account Association**: https://base.dev/preview?tab=account
- **Neynar API**: https://neynar.com

## 🔧 Quick Commands

```bash
# Deploy to Vercel
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_URL
vercel env add NEYNAR_API_KEY
# ... add all others

# Test locally
npm run dev
```

## 🎯 Testing Checklist

- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] App loads in Farcaster client
- [ ] App loads in Base App
- [ ] User profile displays correctly
- [ ] Share functionality works
- [ ] Leaderboard shows Farcaster names
- [ ] Webhook receives events
- [ ] Graceful web fallback

## 🐛 Common Issues

### Manifest Not Found

- Check file exists and is publicly accessible
- Verify Vercel deployment includes the route

### Account Association Invalid

- Ensure domain matches exactly (including subdomains)
- Re-sign if domain changes
- Check environment variables are set correctly

### Farcaster Names Not Showing

- Verify `NEYNAR_API_KEY` is set
- Check API key has proper permissions
- Look for errors in browser console

### Mini App Not Loading

- Ensure `sdk.actions.ready()` is called
- Check all images are accessible
- Verify proper JSON formatting in metadata

## 📊 Key Components

- **FarcasterProvider**: SDK context management
- **FarcasterActions**: Share, add app, navigation
- **FarcasterProfile**: User profile display
- **FarcasterNameBadge**: FC username badges
- **FarcasterDebugPanel**: Development debugging

## 🎮 Game Mechanics

- **Stage 1**: 5.000s target, ±50ms → ±10ms tolerance
- **Stage 2**: Random targets, ±8ms tolerance
- **Stage 3**: Random targets, ±5ms tolerance
- **Scoring**: `1000 × level × (1 + accuracy/100)`
- **Philosophy**: One mistake = game over

## 🔗 Important Links

- [Full Deployment Guide](./DEPLOYMENT_GUIDE_MINIAPP.md)
- [Technical Implementation](./FARCASTER_INTEGRATION.md)
- [Complete Feature List](./MINIAPP_IMPLEMENTATION_SUMMARY.md)
- [Latest Changes](./COMMIT_SUMMARY.md)
