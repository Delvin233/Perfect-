# Arcade Features - Future Enhancements

This document outlines classic arcade game features that could be added to Perfect? to enhance the retro gaming experience.

## Core Arcade Traits Already Implemented

✅ **One-Run Philosophy** - No saves, no continues, pure skill
✅ **Progressive Difficulty** - Each level gets harder
✅ **High Score Leaderboard** - Competitive ranking
✅ **Instant Feedback** - Clear success/fail states

## Potential Arcade Features to Add

### 1. Lives System

**Implementation:**

- Start each run with 3 lives (hearts/tokens)
- Lose one life on each miss
- Game over when all lives depleted
- Visual display of remaining lives

**Variations:**

- **Classic**: 3 lives, no way to gain more
- **1-UP System**: Earn extra life every 5 perfect hits
- **Stage Bonus**: +1 life when completing a stage

**Code Location:** `TimerGame.tsx` - Add `lives` state

```typescript
const [lives, setLives] = useState(3);

// On fail:
if (lives > 1) {
  setLives(lives - 1);
  // Allow retry
} else {
  // Game over
}
```

---

### 2. Combo/Streak Multipliers

**Implementation:**

- Track consecutive successful hits
- Apply multiplier to score calculation
- Reset on miss or "close" (only perfects count)

**Multiplier Tiers:**

- 3 perfects in a row: 1.5x
- 5 perfects: 2x
- 7 perfects: 2.5x
- 10 perfects: 3x

**Visual Feedback:**

- Display current combo count
- Animated multiplier indicator
- Screen effects on milestone combos

**Code Location:** `TimerGame.tsx` - Add combo tracking

```typescript
const [combo, setCombo] = useState(0);
const [multiplier, setMultiplier] = useState(1);

// On perfect:
const newCombo = combo + 1;
const newMultiplier = Math.min(1 + Math.floor(newCombo / 3) * 0.5, 3);
```

---

### 3. High Score Display

**Implementation:**

- Show personal best at top of game screen
- Flash/animate when approaching or beating record
- "NEW RECORD!" celebration on beat

**Display Elements:**

- Current Score vs High Score
- Progress bar showing % of high score
- Visual indicator when in "record territory"

**Code Location:** `TimerGame.tsx` + `play/page.tsx`

```typescript
const [highScore, setHighScore] = useState(0);

// Load from localStorage or API
useEffect(() => {
  const saved = localStorage.getItem("highScore");
  if (saved) setHighScore(parseInt(saved));
}, []);
```

---

### 4. Countdown Timer (Pressure Mode)

**Implementation:**

- Add time limit for each level (e.g., 10 seconds)
- Must hit target before time runs out
- Bonus points for quick completion

**Difficulty Scaling:**

- Stage 1: 10 seconds per level
- Stage 2: 8 seconds per level
- Adds urgency and prevents overthinking

**Code Location:** `TimerGame.tsx` - Add countdown state

---

### 5. Speed Increase

**Implementation:**

- Timer visual speed increases in later levels
- Actual time unchanged, but harder to track visually
- Classic arcade difficulty curve

**Options:**

- Faster number updates
- Animated blur effects
- Progress bar speed changes

---

### 6. Visual Feedback Enhancements

**Screen Effects:**

- **Perfect Hit**: Green flash, screen shake, particles
- **Close Hit**: Yellow pulse
- **Miss**: Red flash, screen shake
- **Combo Milestone**: Rainbow effect, confetti

**Libraries to Consider:**

- `framer-motion` for animations
- `react-confetti` for celebrations
- CSS animations for flashes

**Code Location:** `TimerGame.tsx` + new CSS

---

### 7. Sound Effects & Music

**Essential Sounds:**

- Timer tick (subtle, rhythmic)
- Success chime (satisfying)
- Fail buzzer (harsh)
- Perfect hit (special tone)
- Combo sounds (escalating pitch)
- Background music (speeds up with level)

**Implementation:**

- Use Web Audio API or `howler.js`
- Preload all sounds
- Volume controls in settings

**Sound Files Needed:**

- `tick.mp3` - Timer sound
- `success.mp3` - Hit target
- `perfect.mp3` - Perfect hit
- `fail.mp3` - Miss
- `combo.mp3` - Combo milestone
- `bgm.mp3` - Background music

**Code Location:** New `lib/sounds.ts` + `TimerGame.tsx`

---

### 8. "Insert Coin to Continue" (Web3 Twist)

**Implementation:**

- On game over, offer continue option
- Pay small amount (e.g., 0.001 ETH or Base token)
- Resume from current level with 1 life

**Considerations:**

- Optional feature (can still play free)
- Revenue generation
- Fits Web3/crypto theme
- Could use Base network for low fees

**Smart Contract:**

- Track continues purchased
- Leaderboard could separate "no continue" runs

**Code Location:** New `contracts/ContinueToken.sol` + `TimerGame.tsx`

---

### 9. Leaderboard Initials (Classic Arcade)

**Implementation:**

- Top 10 players enter 3-letter name
- Shows alongside wallet address
- Classic arcade aesthetic

**UI:**

- Retro letter selector (A-Z, 0-9)
- Keyboard navigation
- Stored with score in database

**Database Update:**

```sql
ALTER TABLE leaderboard ADD COLUMN initials TEXT(3);
```

**Code Location:** New `components/InitialsInput.tsx` + API update

---

### 10. Daily Challenges

**Implementation:**

- Special seeded run each day
- Everyone gets same target times
- Separate daily leaderboard
- Resets at midnight UTC

**Features:**

- Daily seed generation
- 24-hour leaderboard
- Rewards for top 3
- Share results on social media

**Database Schema:**

```sql
CREATE TABLE daily_challenges (
  date TEXT PRIMARY KEY,
  seed TEXT NOT NULL,
  leaderboard JSON
);
```

**Code Location:** New `app/daily/page.tsx` + API routes

---

## Priority Recommendations

### Phase 1 (Quick Wins)

1. **High Score Display** - Easy to implement, big impact
2. **Visual Feedback** - Enhances feel immediately
3. **Sound Effects** - Massive arcade vibe boost

### Phase 2 (Gameplay Depth)

4. **Lives System** - Makes game less brutal
5. **Combo Multipliers** - Rewards skill, adds strategy

### Phase 3 (Advanced Features)

6. **Daily Challenges** - Increases engagement
7. **Continue System** - Revenue + Web3 integration
8. **Speed Increase** - Additional difficulty layer

## Implementation Notes

- Keep core gameplay simple and responsive
- Add features as optional modes (don't overwhelm new players)
- Test each feature for balance
- Maintain arcade philosophy: skill-based, no pay-to-win
- Sound should be toggleable (accessibility)

## Balancing Considerations

- Lives system makes game more forgiving but could reduce leaderboard prestige
- Combo multipliers could inflate scores - may need separate leaderboards
- Continue system should be expensive enough to not trivialize difficulty
- Daily challenges should use same core mechanics, just different seeds
