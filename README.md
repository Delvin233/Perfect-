# Perfect? 🎯

A precision timing arcade game built for Base and Celo networks. Stop the timer at the exact moment to progress through increasingly difficult stages and climb the global leaderboard.

## 🎮 Game Features

### Core Gameplay

- **Arcade-Style Progression**: One mistake = Game Over, no continues
- **3-Stage System**: Learning → Master Mode → Extreme Mode
- **Progressive Difficulty**: Each level tightens tolerance (50ms → 5ms)
- **Real-time Leaderboard**: Global rankings with ENS/Base name resolution
- **Rank System**: Novice → Perfect (10 ranks based on level reached)

### Web3 Integration

- **Multi-Chain Support**: Base and Celo networks
- **ENS/Base Names**: Automatic wallet address resolution
- **On-Chain Leaderboard**: Immutable score tracking
- **WalletConnect Integration**: Seamless wallet connectivity
- **Base Mini App**: Optimized for Base ecosystem

### UI/UX Features

- **8 Visual Themes**: From classic arcade to neon cyberpunk
- **PC Arcade Experience**: Consistent interface across all devices
- **Name Resolution**: Display ENS and Base names instead of addresses
- **Responsive Design**: Optimized for desktop and mobile
- **Clean Interface**: Removed distracting animations for focused gameplay

## 🛠 Tech Stack

### Frontend

- **Next.js 14** + TypeScript
- **Tailwind CSS** for styling
- **Reown AppKit** (WalletConnect v2) for wallet connectivity
- **Wagmi + Viem** for Web3 interactions
- **OnchainKit** for Base network integration

### Backend & Database

- **Turso** (SQLite) for leaderboard storage
- **Vercel** for deployment and API routes

### Blockchain

- **Base** (Ethereum L2) - Primary network
- **Celo** - Secondary network for mobile-first users
- **Hardhat** for smart contract development
- **Solidity 0.8.24** for contract code

### Additional Features

- **ENS Resolution** via Alchemy API
- **Base Names** resolution
- **WebSocket RPC** for faster name resolution
- **Progressive Web App** capabilities

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (or update `.env`):

```bash
# Required: Reown Project ID (get from https://cloud.reown.com)
NEXT_PUBLIC_REOWN_PROJECT_ID="your_project_id_here"

# Required: Turso Database (get from https://turso.tech)
TURSO_DATABASE_URL="your_database_url"
TURSO_AUTH_TOKEN="your_auth_token"

# Optional: Enhanced name resolution (get from https://alchemy.com)
ALCHEMY_API_KEY="your_alchemy_key"
NEXT_PUBLIC_ALCHEMY_API_KEY="your_alchemy_key"  # For client-side WebSocket

# Optional: OnchainKit for Base features (get from https://portal.cdp.coinbase.com/)
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_key_here"

# Optional: Smart contract integration (after deployment)
NEXT_PUBLIC_LEADERBOARD_CONTRACT="0x..."

# Optional: For contract deployment only (KEEP SECRET!)
PRIVATE_KEY="your_private_key_here"

# Optional: Your app URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

**Minimum Required**: Only `NEXT_PUBLIC_REOWN_PROJECT_ID`, `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN` are required to run the app.

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

## 🎯 How to Play

### Basic Gameplay

1. **Connect Wallet**: Use any supported wallet (MetaMask, Coinbase, etc.)
2. **Choose Network**: Base (recommended) or Celo
3. **Start Game**: Click "PROVE PERFECTION" from the main menu
4. **Stop the Timer**: Hit STOP as close to the target time as possible
5. **Progress**: Success advances to next level, failure = Game Over

### Stage System

- **Stage 1 (Levels 1-10)**: Learn the 5.000s rhythm (50ms → 10ms tolerance)
- **Stage 2 (Levels 11-20)**: Master Mode with random target times (±8ms tolerance)
- **Stage 3 (Levels 21-30)**: Extreme Mode with new random times (±5ms tolerance)

### Scoring

- **Base Points**: 1000 × level × (1 + accuracy/100)
- **Perfect Hits**: ±10ms from target for maximum points
- **Rank System**: Novice → Apprentice → Skilled → Expert → Master → Elite → Champion → Legend → Mythic → Perfect

### Arcade Rules

- **One Run Only**: No saves, no continues - pure skill test
- **Global Leaderboard**: Compete with players worldwide
- **Name Resolution**: Your ENS/Base name appears on leaderboard

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
│   │   ├── TimerGame.tsx              # Main game logic
│   │   ├── EnhancedMainMenu.tsx       # Arcade-style main menu
│   │   ├── AttractMode.tsx            # Idle screen animation
│   │   ├── LoadingScreen.tsx          # Loading with tips
│   │   ├── AddressDisplay.tsx         # ENS/Base name resolution
│   │   └── ThemeSelector.tsx          # Visual theme selection
│   ├── config/
│   │   └── wagmi.ts                   # Multi-chain AppKit config
│   ├── api/
│   │   ├── scores/route.ts            # Leaderboard API
│   │   ├── resolve-name/route.ts      # Name resolution API
│   │   └── batch-resolve/route.ts     # Batch name resolution
│   ├── hooks/
│   │   ├── useAddressDisplay.ts       # Name resolution hooks
│   │   └── useWebSocketNameResolver.ts # WebSocket name resolution
│   ├── lib/
│   │   ├── turso.ts                   # Database client
│   │   ├── nameResolver.ts            # ENS/Base name resolution
│   │   ├── nameCache.ts               # Caching system
│   │   ├── themes.ts                  # Visual theme system
│   │   └── ranks.ts                   # Player ranking system
│   ├── leaderboard/page.tsx           # Global rankings
│   ├── profile/[address]/page.tsx     # Player profiles
│   ├── settings/page.tsx              # User preferences
│   └── play/page.tsx                  # Game interface
├── contracts/
│   └── PerfectLeaderboard.sol         # Smart contract (future)
└── scripts/
    └── deploy.ts                      # Contract deployment
```

### Testing Locally

1. Start the dev server: `npm run dev`
2. Connect your wallet (use Base Sepolia for testing)
3. Play the game and test score submission

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add all required env vars in Vercel dashboard
3. **Deploy**:
   ```bash
   vercel deploy
   ```

### Database Setup (Turso)

1. **Create Database**:
   ```bash
   turso db create perfect-leaderboard
   ```
2. **Get Connection Details**:
   ```bash
   turso db show perfect-leaderboard
   ```
3. **Create Auth Token**:
   ```bash
   turso db tokens create perfect-leaderboard
   ```

### Register as Base Mini App

Follow the [Base Mini App documentation](https://docs.base.org/mini-apps) to register your app.

### Multi-Chain Deployment

The app supports both Base and Celo networks:

- **Base**: Primary network for Base ecosystem users
- **Celo**: Secondary network for mobile-first users
- **Automatic Detection**: Users can switch networks in wallet

## Contributing

This project is open source! Contributions welcome.

## License

MIT

## 🎨 Features & Customization

### Visual Themes

- **8 Built-in Themes**: Classic Arcade, Neon Nights, Retro Console, Sunset Drive, Candy Land, Vector Display, Pure Minimal, delvin233's default
- **Theme Persistence**: Saves user preference across sessions
- **Responsive Design**: Optimized for all screen sizes

### Name Resolution

- **ENS Support**: Displays ethereum.eth instead of 0x1234...
- **Base Names**: Shows basename.base.eth for Base users
- **Fallback System**: Graceful degradation if resolution fails
- **Caching**: Efficient caching for better performance
- **WebSocket Optimization**: Faster resolution via direct RPC calls

### Settings & Preferences

- **Gameplay Options**: Toggle screen shake and particle effects
- **Audio Controls**: Volume slider and sound effect toggles
- **Privacy Mode**: Hide resolved names from other players
- **Display Formats**: Choose how names appear on leaderboard

## 🔗 Links & Resources

### Documentation

- [OnchainKit Docs](https://docs.base.org/onchainkit) - Base integration
- [Reown AppKit Docs](https://docs.reown.com/appkit) - Wallet connectivity
- [Base Docs](https://docs.base.org) - Base network
- [Celo Docs](https://docs.celo.org) - Celo network
- [Turso Docs](https://docs.turso.tech) - Database

### Development Tools

- [Hardhat Docs](https://hardhat.org/docs) - Smart contract development
- [Wagmi Docs](https://wagmi.sh) - React hooks for Ethereum
- [Viem Docs](https://viem.sh) - TypeScript interface for Ethereum

### Services Used

- [Alchemy](https://alchemy.com) - ENS/Base name resolution
- [Vercel](https://vercel.com) - Deployment platform
- [Turso](https://turso.tech) - Edge database
