# Quick Setup Guide

## Step 1: Get API Keys

### Coinbase Developer Platform (OnchainKit)
1. Go to https://portal.cdp.coinbase.com/
2. Create an account or sign in
3. Create a new project
4. Copy your API key
5. Add to `.env`: `NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_key"`

### Reown (WalletConnect)
1. Go to https://cloud.reown.com
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Add to `.env`: `NEXT_PUBLIC_REOWN_PROJECT_ID="your_project_id"`

## Step 2: Get Test ETH

For Base Sepolia testnet:
1. Get Sepolia ETH from https://sepoliafaucet.com/
2. Bridge to Base Sepolia at https://bridge.base.org/

## Step 3: Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia (testnet)
npm run deploy:sepolia

# Copy the contract address and add to .env
# NEXT_PUBLIC_LEADERBOARD_CONTRACT="0x..."
```

## Step 4: Run the App

```bash
npm run dev
```

Visit http://localhost:3000 and start playing!

## Step 5: Deploy to Production

### Deploy Contract to Base Mainnet
```bash
npm run deploy:base
```

### Deploy App to Vercel
```bash
npm install -g vercel
vercel deploy
```

Add all environment variables in Vercel dashboard.

## Troubleshooting

### "Missing Reown Project ID"
- Make sure `NEXT_PUBLIC_REOWN_PROJECT_ID` is set in `.env`

### "Contract not deployed"
- Run the deployment script first
- Make sure you have test ETH in your wallet
- Check that `PRIVATE_KEY` is set in `.env`

### Wallet won't connect
- Make sure you're on the correct network (Base or Base Sepolia)
- Try refreshing the page
- Check browser console for errors

## Next Steps

1. Customize the game mechanics in `app/components/TimerGame.tsx`
2. Add more features (NFT rewards, tournaments, etc.)
3. Improve the UI/UX
4. Add social sharing features
5. Create a proper leaderboard UI component
6. Add sound effects and animations

## Hackathon Submission Checklist

### Base Hackathon
- [ ] Contract deployed on Base
- [ ] App registered as Base Mini App
- [ ] GitHub repo is public
- [ ] README has clear instructions
- [ ] Demo video/screenshots

### WalletConnect Hackathon
- [ ] Reown AppKit integrated
- [ ] Multiple wallet support working
- [ ] GitHub repo is public
- [ ] Documentation complete
- [ ] Demo video/screenshots
