# Balatro-Inspired Features

This document outlines roguelike and deck-building mechanics inspired by Balatro that could transform Perfect? into a deeper strategic experience.

## Core Balatro Philosophy

- **Build Variety** - Multiple viable strategies
- **Risk/Reward** - Meaningful choices with tradeoffs
- **Progression** - Unlockables and meta-progression
- **Replayability** - Every run feels different
- **Synergies** - Mechanics that combo together
- **"Just One More Run"** - Addictive loop

## Feature Categories

### 1. Modifiers/Jokers System

**Concept:**
Players select modifiers before or during a run that change gameplay mechanics. Like Balatro's Jokers, these create unique builds and strategies.

**Modifier Examples:**

#### Precision Modifiers

- **"Perfectionist"** - Tolerance -5ms, but perfect hits give 3x points
- **"Generous"** - Tolerance +10ms, but max score capped at 50% normal
- **"Steady Hand"** - Tolerance +3ms for first 5 levels, then -3ms after
- **"All or Nothing"** - Only perfect hits count, close = fail

#### Time Modifiers

- **"Time Dilation"** - Visual timer runs 20% slower (easier to read)
- **"Speedster"** - Timer runs 1.5x speed, but 2x points
- **"Frozen Moment"** - Can pause timer once per level for 0.5s
- **"Chaos Clock"** - Timer speed randomly varies ±30%

#### Score Modifiers

- **"Multiplier Madness"** - Start with 2x multiplier, lose 0.5x on each close hit
- **"Combo King"** - Combo bonuses doubled
- **"High Roller"** - Score multiplied by current level number
- **"Minimalist"** - Flat 10,000 points per level, no accuracy bonus

#### Risk/Reward Modifiers

- **"Glass Cannon"** - 5x points but one miss = game over (no lives)
- **"Second Chance"** - Start with 5 lives but score halved
- **"Pressure Cooker"** - 10 second time limit per level, +50% points
- **"Blind Run"** - Timer hidden, must count mentally, 4x points

**Implementation:**

```typescript
interface Modifier {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  effects: {
    toleranceModifier?: number;
    scoreMultiplier?: number;
    visualSpeed?: number;
    lives?: number;
  };
}

// Select up to 3 modifiers before run
const [activeModifiers, setActiveModifiers] = useState<Modifier[]>([]);
```

**Code Location:** New `lib/modifiers.ts` + `components/ModifierSelector.tsx`

---

### 2. Ante/Blind System (Boss Levels)

**Concept:**
Every 10 levels (end of each stage) is a "Boss Level" with special challenge mechanics. Like Balatro's Blinds.

**Boss Level Examples:**

#### Stage 1 Boss (Level 10)

- **"The Blur"** - Timer display flickers/blurs
- **"The Deceiver"** - Target time shown is wrong (±0.5s)
- **"The Speedster"** - Timer runs at 2x speed

#### Stage 2 Boss (Level 20)

- **"The Invisible"** - Timer completely hidden
- **"The Chaos"** - Target time changes every second
- **"The Perfectionist"** - Only perfect hits allowed (close = fail)

#### Stage 3 Boss (Level 30)

- **"The Combo Breaker"** - Lose all combo on any non-perfect hit
- **"The Time Thief"** - Timer randomly jumps forward/backward
- **"The Final Test"** - All previous boss mechanics combined

**Rewards:**

- Beat boss = Bonus points (5,000 × stage number)
- Choose 1 of 3 random modifiers to add
- Unlock new modifier for future runs

**Implementation:**

```typescript
const getBossLevel = (level: number) => {
  if (level % 10 === 0) {
    const bossId = Math.floor(level / 10);
    return BOSS_LEVELS[bossId];
  }
  return null;
};
```

**Code Location:** New `lib/bosses.ts` + update `TimerGame.tsx`

---

### 3. Shop System (Between Stages)

**Concept:**
After completing each stage, enter a shop to spend accumulated points on power-ups or modifiers.

**Shop Items:**

#### Consumables (One-Time Use)

- **Extra Life** - 10,000 points - Gain +1 life
- **Tolerance Boost** - 5,000 points - +5ms tolerance for next stage
- **Score Doubler** - 8,000 points - 2x points for next 3 levels
- **Time Freeze** - 6,000 points - Pause timer once in next stage

#### Permanent Upgrades (For Current Run)

- **Steady Aim** - 15,000 points - +2ms tolerance permanently
- **Combo Master** - 12,000 points - Combos build 50% faster
- **Visual Aid** - 8,000 points - Danger zone indicator appears
- **Lucky Charm** - 20,000 points - First miss doesn't count

#### Modifiers (Add to Build)

- **Random Modifier** - 5,000 points - Get random modifier
- **Rare Modifier** - 15,000 points - Choose from 3 rare modifiers
- **Reroll** - 2,000 points - Refresh shop items

**Risk/Reward:**

- Spend points now for easier run, but lower final score
- Save points for leaderboard, but harder gameplay
- Strategic decision-making

**Implementation:**

```typescript
interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: "consumable" | "permanent" | "modifier";
  effect: () => void;
}

// Show shop between stages
const [showShop, setShowShop] = useState(false);
const [shopItems, setShopItems] = useState<ShopItem[]>([]);
```

**Code Location:** New `components/Shop.tsx` + `lib/shop.ts`

---

### 4. Unlockable Decks/Modes

**Concept:**
Start with "Standard Deck" (current gameplay). Unlock new decks by achieving milestones. Each deck has unique starting conditions.

**Deck Examples:**

#### Standard Deck (Default)

- Normal gameplay
- 3 lives
- No modifiers

#### Precision Deck

- Unlock: Reach Level 15
- Start with -5ms tolerance
- 2x score multiplier
- 5 lives

#### Chaos Deck

- Unlock: Complete 10 runs
- Random modifier applied each level
- 1.5x score multiplier
- 4 lives

#### Speed Run Deck

- Unlock: Beat Stage 1 in under 2 minutes
- 5 second time limit per level
- 3x score multiplier
- 1 life

#### Zen Deck

- Unlock: Get 10 perfect hits in a row
- No time pressure
- +10ms tolerance
- 0.5x score multiplier
- Separate leaderboard

#### Hardcore Deck

- Unlock: Reach Level 20
- -10ms tolerance
- No lives (one miss = game over)
- 5x score multiplier
- Elite leaderboard

**Implementation:**

```typescript
interface Deck {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  startingLives: number;
  toleranceModifier: number;
  scoreMultiplier: number;
  specialRules?: string[];
}

const [selectedDeck, setSelectedDeck] = useState<Deck>(STANDARD_DECK);
```

**Code Location:** New `lib/decks.ts` + `components/DeckSelector.tsx`

---

### 5. Planet Cards / Permanent Upgrades

**Concept:**
Earn "Planet Cards" (permanent account-wide upgrades) by achieving milestones. These persist across all runs.

**Planet Card Examples:**

#### Tier 1 (Easy to Unlock)

- **Mercury** - +1ms base tolerance (Cost: Reach Level 5)
- **Venus** - Start with 4 lives instead of 3 (Cost: Complete 5 runs)
- **Earth** - +10% score bonus (Cost: Reach Level 10)

#### Tier 2 (Medium Difficulty)

- **Mars** - Unlock combo system (Cost: Reach Level 15)
- **Jupiter** - +1 shop reroll per stage (Cost: Spend 50k in shops)
- **Saturn** - Unlock modifier slots (Cost: Beat 3 bosses)

#### Tier 3 (Hard to Unlock)

- **Uranus** - Start each run with random rare modifier (Cost: Reach Level 25)
- **Neptune** - Unlock daily challenge mode (Cost: Complete 50 runs)
- **Pluto** - Secret unlock (Cost: ???)

**Progression System:**

- Earn "Stardust" currency from runs
- Spend Stardust to unlock Planet Cards
- Creates meta-progression loop
- Encourages continued play

**Implementation:**

```typescript
interface PlanetCard {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  cost: number;
  effect: string;
  unlocked: boolean;
}

// Store in database per user
const [planetCards, setPlanetCards] = useState<PlanetCard[]>([]);
```

**Database Schema:**

```sql
CREATE TABLE player_progression (
  address TEXT PRIMARY KEY,
  unlocked_decks JSON,
  planet_cards JSON,
  stardust INTEGER,
  total_runs INTEGER,
  achievements JSON
);
```

**Code Location:** New `app/progression/page.tsx` + API routes

---

### 6. Seed System & Daily Challenges

**Concept:**
Seeded runs where everyone gets the same random elements. Perfect for competition.

**Features:**

#### Daily Challenge

- New seed every 24 hours
- Everyone plays same modifiers/bosses
- Separate daily leaderboard
- Rewards for top 10

#### Custom Seeds

- Share seeds with friends
- Compete on same conditions
- "Seed of the Week" community challenges

#### Seed Components:

- Boss order
- Shop items
- Random modifier pools
- Target times for Stage 2+

**Implementation:**

```typescript
interface Seed {
  id: string;
  date: string;
  randomSeed: number;
  bosses: string[];
  modifierPool: string[];
}

// Generate deterministic run from seed
const generateRun = (seed: Seed) => {
  const rng = seedrandom(seed.randomSeed);
  // Use rng for all random elements
};
```

**Code Location:** New `app/daily/page.tsx` + `lib/seeding.ts`

---

### 7. Achievements & Challenges

**Concept:**
In-game achievements that unlock rewards and provide goals.

**Achievement Categories:**

#### Skill Achievements

- **"Perfect Start"** - Get 5 perfect hits in a row
- **"Stage Master"** - Complete Stage 1 without missing
- **"Untouchable"** - Reach Level 20 without losing a life
- **"Perfectionist"** - Get 20 perfect hits in one run

#### Milestone Achievements

- **"First Steps"** - Reach Level 5
- **"Rising Star"** - Reach Level 10
- **"Elite Player"** - Reach Level 15
- **"Legend"** - Reach Level 20

#### Challenge Achievements

- **"Speed Demon"** - Complete Stage 1 in under 90 seconds
- **"Risk Taker"** - Win with Glass Cannon modifier
- **"Minimalist"** - Win without using shop
- **"Collector"** - Unlock all modifiers

#### Secret Achievements

- **"???"** - Hidden unlock conditions
- Rewards rare modifiers or cosmetics

**Rewards:**

- Stardust currency
- Unlock new modifiers/decks
- Cosmetic rewards (timer colors, effects)

**Code Location:** New `lib/achievements.ts` + `components/AchievementToast.tsx`

---

## Synergy Examples

**Build 1: "The Perfectionist"**

- Perfectionist modifier (-5ms tolerance, 3x on perfect)
- Combo Master upgrade (faster combos)
- Precision Deck (2x multiplier)
- Strategy: Only go for perfect hits, massive score potential

**Build 2: "The Tank"**

- Second Chance modifier (5 lives, 0.5x score)
- Extra Life from shop
- Steady Aim upgrade (+2ms tolerance)
- Strategy: Consistent progression, lower risk

**Build 3: "The Gambler"**

- Glass Cannon modifier (5x points, one life)
- Score Doubler consumable
- High Roller modifier (score × level)
- Strategy: High risk, massive reward potential

**Build 4: "The Speedster"**

- Speedster modifier (1.5x timer speed, 2x points)
- Pressure Cooker modifier (time limits, +50% points)
- Speed Run Deck (3x multiplier)
- Strategy: Fast reflexes, huge multipliers

---

## Implementation Priority

### Phase 1: Foundation

1. **Modifier System** - Core mechanic, high replayability
2. **Deck Selection** - Different starting conditions
3. **Basic Shop** - Between-stage upgrades

### Phase 2: Depth

4. **Boss Levels** - Special challenges every 10 levels
5. **Achievements** - Goals and rewards
6. **Planet Cards** - Meta-progression

### Phase 3: Community

7. **Seed System** - Competitive fairness
8. **Daily Challenges** - Regular engagement
9. **Leaderboard Separation** - Per deck/modifier

---

## Balancing Philosophy

**Core Principles:**

- All builds should be viable
- Higher risk = higher reward
- No strictly dominant strategy
- Skill still matters most
- Modifiers enhance, don't replace core gameplay

**Testing Checklist:**

- Can each deck reach Level 20?
- Are shop prices balanced?
- Do modifiers create interesting choices?
- Is progression satisfying but not grindy?
- Does meta-progression respect player time?

---

## Database Schema Updates

```sql
-- Player progression
CREATE TABLE player_progression (
  address TEXT PRIMARY KEY,
  unlocked_decks JSON DEFAULT '["standard"]',
  planet_cards JSON DEFAULT '[]',
  stardust INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  achievements JSON DEFAULT '[]',
  created_at INTEGER NOT NULL
);

-- Run history (for analytics)
CREATE TABLE run_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  modifiers JSON,
  final_score INTEGER,
  final_level INTEGER,
  duration INTEGER,
  seed TEXT,
  timestamp INTEGER NOT NULL
);

-- Daily challenges
CREATE TABLE daily_challenges (
  date TEXT PRIMARY KEY,
  seed TEXT NOT NULL,
  leaderboard JSON DEFAULT '[]'
);
```

---

## UI/UX Considerations

**Pre-Run Screen:**

1. Select Deck
2. View unlocked modifiers
3. See daily challenge
4. Check achievements progress

**During Run:**

- Active modifiers displayed
- Shop appears between stages
- Boss warning before level 10/20/30

**Post-Run:**

- Score breakdown
- Achievements unlocked
- Stardust earned
- Leaderboard position

**Progression Hub:**

- Planet Cards tree
- Achievement list
- Deck collection
- Stats & analytics

---

## Future Expansion Ideas

- **Multiplayer Races** - Real-time competition
- **Tournaments** - Bracket-style competitions
- **Clans/Teams** - Shared progression
- **Cosmetics** - Timer skins, effects, sounds
- **Seasonal Content** - Limited-time modifiers
- **NFT Integration** - Rare modifiers as NFTs
- **Betting System** - Wager on your run (Web3)

---

## References & Inspiration

- **Balatro** - Deck building, synergies, roguelike structure
- **Slay the Spire** - Path choices, risk/reward
- **Hades** - Meta-progression, permanent upgrades
- **The Binding of Isaac** - Item synergies, unlockables
- **Vampire Survivors** - Build variety, "one more run" loop
