# Perfect?

A precision timing game built for Base and WalletConnect hackathons. Stop the timer at the exact moment to progress through levels and climb the leaderboard.

## Features

- Addictive timer-based gameplay with progressive difficulty
- On-chain leaderboard on Base network
- WalletConnect/Reown AppKit integration for seamless wallet connectivity
- Base Mini App compatible
- Smart contract score tracking and verification

## Tech Stack

- Next.js 15 + TypeScript
- OnchainKit (Base)
- Reown AppKit (WalletConnect)
- Wagmi + Viem
- Hardhat (Smart Contracts)
- Solidity 0.8.24

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (or update `.env`):

```bash
# OnchainKit API Key (get from https://portal.cdp.coinbase.com/)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_key_here"

# Reown Project ID (get from https://cloud.reown.com)
NEXT_PUBLIC_REOWN_PROJECT_ID="your_project_id_here"

# Your deployed contract address (after deployment)
NEXT_PUBLIC_LEADERBOARD_CONTRACT="0x..."

# For deployment only (KEEP SECRET!)
PRIVATE_KEY="your_private_key_here"

# Your app URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 3. Deploy Smart Contract

Deploy to Base Sepolia (testnet):

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Deploy to Base Mainnet:

```bash
npx hardhat run scripts/deploy.ts --network base
```

Copy the deployed contract address to your `.env` file as `NEXT_PUBLIC_LEADERBOARD_CONTRACT`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

## How to Play

1. Connect your wallet
2. Click "Start Game"
3. Stop the timer as close to the target time as possible
4. Within 100ms = Success! Progress to next level
5. Each level gets harder with shorter target times
6. Submit your high score to the on-chain leaderboard

## Hackathon Requirements

### Base Hackathon ✅
- ✅ Deployed as Base Mini App
- ✅ Smart contracts deployed on Base (generates fees)
- ✅ Public GitHub repository
- ✅ Uses OnchainKit

### WalletConnect Hackathon ✅
- ✅ Integrates Reown AppKit SDK
- ✅ Smart contracts deployed (generates fees)
- ✅ Public GitHub repository
- ✅ Wallet connectivity features

## Smart Contracts

### PerfectLeaderboard.sol

Stores player scores on-chain with the following features:
- Submit scores (only updates if new score is higher)
- Get player scores
- Get top N players
- Track total players

## Development

### Project Structure

```
Perfect?/
├── app/
│   ├── components/
│   │   ├── TimerGame.tsx          # Main game component
│   │   └── TimerGame.module.css   # Game styles
│   ├── config/
│   │   └── wagmi.ts               # Reown AppKit config
│   ├── page.tsx                   # Main page
│   └── rootProvider.tsx           # Providers setup
├── contracts/
│   └── PerfectLeaderboard.sol     # Leaderboard contract
├── scripts/
│   └── deploy.ts                  # Deployment script
└── hardhat.config.ts              # Hardhat configuration
```

### Testing Locally

1. Start the dev server: `npm run dev`
2. Connect your wallet (use Base Sepolia for testing)
3. Play the game and test score submission

## Deployment

### Deploy to Vercel

```bash
vercel deploy
```

Make sure to add all environment variables in Vercel dashboard.

### Register as Base Mini App

Follow the [Base Mini App documentation](https://docs.base.org/mini-apps) to register your app.

## Contributing

This project is open source! Contributions welcome.

## License

MIT

## Links

- [OnchainKit Docs](https://docs.base.org/onchainkit)
- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [Base Docs](https://docs.base.org)
- [Hardhat Docs](https://hardhat.org/docs)
