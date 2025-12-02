# Perfect? - Game Mechanics & Design

## Project Overview

Perfect? is a precision timing game built for Base and WalletConnect hackathons. Players stop a timer at exact moments to progress through stages and levels.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: Reown AppKit (WalletConnect), OnchainKit (Base), Wagmi, Viem
- **Database**: Turso (SQLite) for leaderboard
- **Smart Contracts**: Solidity 0.8.24, Hardhat (for future on-chain integration)
- **Styling**: Tailwind CSS, CSS Modules
- **Deployment**: Vercel

## Game Mechanics

### Stage System

The game is divided into stages, each with 10 levels:

#### Stage 1: Learning Phase (Levels 1-10)

- **Target Time**: Always 5.000 seconds
- **Tolerance**: Progressively tighter
  - Level 1: ±50ms (4.950s - 5.050s)
  - Level 2: ±45ms (4.955s - 5.045s)
  - Level 3: ±40ms (4.960s - 5.040s)
  - ...
  - Level 9: ±10ms (4.990s - 5.010s)
  - Level 10: ±10ms (minimum tolerance)
- **Goal**: Master the rhythm of 5.000s timing

#### Stage 2: Master Mode (Levels 11-20)

- **Target Times**: Varied across 10 levels
  - Level 11: 3.5s
  - Level 12: 4.2s
  - Level 13: 6.8s
  - Level 14: 2.9s
  - Level 15: 5.5s
  - Level 16: 7.3s
  - Level 17: 4.8s
  - Level 18: 3.2s
  - Level 19: 6.1s
  - Level 20: 8.0s
- **Tolerance**: Fixed at ±8ms (tighter than Stage 1 final levels!)
- **Goal**: Prove adaptability to any timing with extreme precision
- **Visual**: Purple "MASTER MODE" badge displayed

#### Stage 3: Extreme Mode (Levels 21-30)

- **Target Times**: New varied times across 10 levels
  - Level 21: 4.7s
  - Level 22: 2.3s
  - Level 23: 7.5s
  - Level 24: 3.8s
  - Level 25: 6.2s
  - Level 26: 5.1s
  - Level 27: 8.5s
  - Level 28: 2.7s
  - Level 29: 4.1s
  - Level 30: 9.0s
- **Tolerance**: Fixed at ±5ms (pixel-perfect precision!)
- **Goal**: Only the truly perfect survive
- **Visual**: Red "EXTREME MODE" badge displayed

### Scoring System

Points are calculated based on level and accuracy:

```javascript
points = 1000 × level × (1 + accuracy/100)
```

**Examples**:

- Level 1, 99% accuracy: ~1,990 points
- Level 5, 95% accuracy: ~9,750 points
- Level 10, 100% accuracy: ~20,000 points
- Level 15, 98% accuracy: ~29,700 points

### Result Types

- **🎯 PERFECT**: Within ±10ms of target (essentially exact)
- **✓ CLOSE**: Within tolerance but not perfect
- **💀 GAME OVER**: Outside tolerance → **Arcade style: Start over from Level 1**

### Arcade-Style Progression

**No saved progress. No retries. One continuous run.**

- Miss once = Game Over → Back to Level 1
- Score resets to 0
- Must complete all levels in one streak
- Leaderboard scores prove true mastery, not persistence

### Stage Completion

When completing Stage 1 (beating Level 10):

- 3-second celebration screen appears
- Shows "STAGE 1 COMPLETE! 🎉"
- Automatically transitions to Stage 2
- Player continues with accumulated score

## Database Schema (Turso)

```sql
CREATE TABLE leaderboard (
  address TEXT PRIMARY KEY,      -- Wallet address
  score INTEGER NOT NULL,        -- Highest score achieved
  level INTEGER NOT NULL,        -- Highest level reached
  timestamp INTEGER NOT NULL     -- Unix timestamp
);

CREATE INDEX idx_score ON leaderboard(score DESC);
```

**Update Logic**:

- Only updates if new score is higher than existing
- Stores highest level reached
- One entry per wallet address

## API Endpoints

### GET /api/scores

- **Query Params**: `?address=0x...` (optional)
- **Returns**:
  - With address: User-specific scores
  - Without address: Top 10 leaderboard
- **Format**: `{ scores: [...] }`

### POST /api/scores

- **Body**: `{ address, score, level }`
- **Action**: Inserts or updates player score
- **Returns**: `{ success: true }`

## Environment Variables

```bash
# Reown AppKit (WalletConnect)
NEXT_PUBLIC_REOWN_PROJECT_ID=""

# Turso Database
TURSO_DATABASE_URL=""
TURSO_AUTH_TOKEN=""

# OnchainKit (Base)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=""

# Smart Contract (future)
NEXT_PUBLIC_LEADERBOARD_CONTRACT=""

# Deployment
NEXT_PUBLIC_URL=""
PRIVATE_KEY=""  # For contract deployment only
```

## File Structure

```
app/
├── components/
│   ├── TimerGame.tsx          # Main game logic
│   ├── Header.tsx             # Navigation header
│   └── BottomNavigation.tsx   # Mobile nav
├── config/
│   └── wagmi.ts               # Reown AppKit config
├── context/
│   └── index.tsx              # Web3 providers
├── api/
│   └── scores/
│       └── route.ts           # Leaderboard API
├── play/
│   └── page.tsx               # Game page
├── leaderboard/
│   └── page.tsx               # Leaderboard page
├── page.tsx                   # Home/stats page
└── layout.tsx                 # Root layout

lib/
└── turso.ts                   # Database client

contracts/
└── PerfectLeaderboard.sol     # Smart contract (not yet deployed)
```

## Future Enhancements

### Smart Contract Integration

- Deploy `PerfectLeaderboard.sol` to Base
- Replace Turso API with direct contract calls
- Use wagmi hooks for on-chain interactions
- Add transaction confirmations

### Additional Stages

- Stage 3+: Could add more mechanics (moving targets, combo multipliers, etc.)

### Features

- NFT rewards for achievements
- Tournament mode
- Social features (challenge friends)
- Sound effects and animations
- Mobile app version

## Development Guidelines

### When Adding New Stages

1. Update `stage2Targets` array pattern in `TimerGame.tsx`
2. Add stage-specific tolerance logic in `getTolerance()`
3. Update stage completion screen logic in `nextLevel()`
4. Add visual indicators for new stage

### When Modifying Scoring

- Update formula in `stopTimer()` function
- Consider balance between difficulty and reward
- Test edge cases (perfect scores, failures)

### Arcade Philosophy

- **No continues**: Failure resets to Level 1
- **No retries**: Can't practice the same level repeatedly
- **Pure skill**: High scores require completing many levels in one run
- **Leaderboard integrity**: Top players are genuinely skilled, not just persistent

### When Changing Database Schema

- Update `lib/turso.ts` initialization
- Update API route type mappings
- Update frontend interfaces
- Test migration path for existing data

## Hackathon Requirements

### Base Hackathon ✅

- Deployed as Base Mini App
- Smart contracts ready for Base deployment
- Uses OnchainKit
- Public GitHub repository

### WalletConnect Hackathon ✅

- Integrates Reown AppKit SDK
- Multi-wallet support
- Public GitHub repository
- Smart contracts generate fees (when deployed)
