# Quick Start Checklist ✅

Get your game running in 5 minutes!

## 1. Get Your API Keys (5 min)

### Reown Project ID (Required for WalletConnect)
1. Visit: https://cloud.reown.com
2. Sign up/Login
3. Click "Create Project"
4. Copy your Project ID
5. Add to `.env`: `NEXT_PUBLIC_REOWN_PROJECT_ID="your_id_here"`

### OnchainKit API Key (Optional but recommended)
1. Visit: https://portal.cdp.coinbase.com/
2. Sign up/Login
3. Create a project
4. Copy API key
5. Add to `.env`: `NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_key_here"`

## 2. Run Locally (1 min)

```bash
npm install
npm run dev
```

Open http://localhost:3000 - Your game is live! 🎮

## 3. Deploy Contract (Optional - for leaderboard)

### Get Test ETH
- Sepolia ETH: https://sepoliafaucet.com/
- Bridge to Base Sepolia: https://bridge.base.org/

### Deploy
```bash
# Add your private key to .env
PRIVATE_KEY="your_private_key_here"

# Deploy to testnet
npm run deploy:sepolia

# Copy the contract address to .env
NEXT_PUBLIC_LEADERBOARD_CONTRACT="0x..."
```

## 4. Test the Game

1. Open http://localhost:3000
2. Click "Connect Wallet" (top right)
3. Connect your wallet
4. Click "Start Game"
5. Stop the timer as close to the target as possible!
6. Try to beat your high score

## 5. Deploy to Production (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy

# Add environment variables in Vercel dashboard
```

## That's it! 🎉

You now have a fully functional web3 timing game!

## Next Steps

- Customize the game in `app/components/TimerGame.tsx`
- Add the Leaderboard component to show top players
- Deploy your contract to Base mainnet
- Share with friends and compete!

## Need Help?

Check out:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `HACKATHON.md` - Hackathon submission info

## Common Issues

**"Missing Reown Project ID"**
→ Make sure you added it to `.env` file

**Wallet won't connect**
→ Try refreshing the page or switching networks

**Game not loading**
→ Check browser console for errors (F12)

---

Happy gaming! 🎮⏱️
