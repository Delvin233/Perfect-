# Arcade Menu System - Design Specification

## Overview

Perfect? will feature a full arcade-style menu system inspired by AAA PC games (Borderlands, Halo, Call of Duty). This creates an immersive experience from the moment users connect their wallet through gameplay.

## Menu Structure

```
OPENING SCREEN (Attract Mode)
    ↓ [Press Any Key / Connect Wallet]
LOADING SCREEN (with tips)
    ↓
MAIN MENU
    ├── PROVE PERFECTION (Play)
    ├── LEADERBOARD (Rankings)
    ├── PROFILE (Stats & Future NFTs)
    ├── SETTINGS (Themes & Options)
    ├── MARKETPLACE (Future - NFT Trading)
    └── DISCONNECT
```

---

## 1. Opening Screen (Attract Mode)

### Purpose
Idle screen that plays when no user is connected. Shows off the game and entices players to join.

### Visual Elements
- **Animated Background**: Floating timer digits, particles, ambient effects
- **Game Logo**: "PERFECT?" - Large, centered, pulsing/glowing
- **Tagline**: "Stop Time. Prove Perfection."
- **High Score Ticker**: Scrolling recent high scores from leaderboard
- **Call to Action**: "PRESS ANY KEY TO START" or "CONNECT WALLET"
- **Demo Mode**: After 30 seconds, show auto-play demo or leaderboard showcase

### Animation Rules
- Logo fades in with glow effect (2s)
- Particles drift across screen continuously
- High scores scroll from bottom to top
- CTA text pulses (1s interval)
- Background has subtle parallax effect on mouse move

### Technical Requirements
- Auto-start after 30s idle on any page
- Keyboard/mouse input exits attract mode
- Loops indefinitely until interaction
- Preload game assets during attract mode

---

## 2. Loading Screen

### When to Show
- After wallet connection (first time)
- When clicking "PROVE PERFECTION" to start game
- Between major state transitions

### Visual Elements
- **Background**: Themed artwork or animated scene
- **Logo**: Game logo at top
- **Progress Bar**: Animated loading bar (even if fake)
- **Loading Spinner**: Rotating element
- **Tips Display**: Rotating gameplay tips (changes every 3s)
- **Percentage**: "Loading... 47%"

### Gameplay Tips (Rotating)
```
- "Stage 1: Master the 5.000s rhythm"
- "Perfect hits (±10ms) give bonus points"
- "Stage 2 introduces random target times"
- "Stage 3 tolerance: Only ±5ms. Good luck."
- "One mistake = Game Over. No continues."
- "Combo multipliers reward consistency"
- "Your rank increases with each level"
- "The green zone is your friend"
- "Watch the progress bar, not just the numbers"
- "Breathe. Focus. Click."
```

### Technical Rules
- **Minimum Display Time**: 1.5 seconds (prevents flashing)
- **Maximum Display Time**: 5 seconds (don't bore users)
- **Smooth Transitions**: Fade in (0.3s), Fade out (0.5s)
- **Async Loading**: Actually preload game assets if needed
- **Tip Rotation**: Change tip every 3 seconds
- **Progress Simulation**: If no real loading, fake progress smoothly

---

## 3. Main Menu

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  PERFECT?                        [Wallet: 0x1234...]   │
│                                                         │
│  MAIN MENU                      ┌──────────────────┐  │
│                                 │  HIGH SCORE      │  │
│  ▶ PROVE PERFECTION            │  125,450         │  │
│    LEADERBOARD                  │                  │  │
│    PROFILE                      │  BEST LEVEL      │  │
│    SETTINGS                     │  Level 18        │  │
│    MARKETPLACE                  │                  │  │
│    DISCONNECT                   │  RANK            │  │
│                                 │  Legend 💪       │  │
│  [Animated Background]          │                  │  │
│                                 │  TOTAL GAMES     │  │
│                                 │  47              │  │
│                                 └──────────────────┘  │
│                                                         │
│  Test your precision. One mistake = Game Over.         │
│                                                         │
│                    [ENTER] Select  [↑↓] Navigate  [ESC] Back │
└─────────────────────────────────────────────────────────┘
```

### Menu Items

#### 1. PROVE PERFECTION (Primary Action)
- **Label**: "PROVE PERFECTION" (not just "Play")
- **Description**: "Test your precision. One mistake = Game Over."
- **Action**: Navigate to loading screen → game
- **Visual**: Largest, most prominent, glowing effect
- **Icon**: ⏱️ or 🎯

#### 2. LEADERBOARD
- **Label**: "LEADERBOARD"
- **Description**: "View top players worldwide. Ranks explained."
- **Action**: Navigate to leaderboard page
- **Shows**: Rank system explanation (Novice → Perfect)
- **Icon**: 🏆

#### 3. PROFILE
- **Label**: "PROFILE"
- **Description**: "Your stats, achievements, and NFT collection"
- **Action**: Navigate to profile page
- **Future**: NFT showcase, achievement badges
- **Icon**: 👤

#### 4. SETTINGS
- **Label**: "SETTINGS"
- **Description**: "Customize theme, sound, and preferences"
- **Action**: Navigate to settings page
- **Contains**:
  - Theme selector (8 themes)
  - Sound effects toggle
  - Music volume
  - Keyboard shortcuts
  - Accessibility options
- **Icon**: ⚙️

#### 5. MARKETPLACE (Future)
- **Label**: "MARKETPLACE" 
- **Description**: "Trade Perfection NFTs. Stats transfer to buyer."
- **Action**: Navigate to marketplace (coming soon screen)
- **Future Feature**: 
  - List your "Perfection NFT" for sale
  - NFT includes: High score, level reached, rank, total games
  - Buyer receives all stats and achievements
  - Smart contract handles transfer
- **Icon**: 🛒
- **Badge**: "COMING SOON"

#### 6. DISCONNECT
- **Label**: "DISCONNECT"
- **Description**: "Sign out of your wallet"
- **Action**: Disconnect wallet, return to attract mode
- **Confirmation**: "Are you sure? Unsaved progress will be lost."
- **Icon**: 🚪

### Stats Panel (Right Side)

Displays user's current stats:
- **High Score**: Largest number, most prominent
- **Best Level**: "Level X" with stage indicator
- **Rank**: Name + emoji (from ranks.ts)
- **Total Games**: Number of attempts
- **Perfect Hits**: X/Y ratio
- **Stages Completed**: 0-3 badges

### Visual Design Rules

1. **Left-Aligned Vertical Menu**
   - Menu items stack vertically on left
   - Consistent spacing (1rem between items)
   - Text-align: left

2. **Selection Indicator**
   - Yellow/Primary color arrow: "▶"
   - Selected item glows/pulses
   - Smooth transition (0.2s ease)

3. **Animated Background**
   - Particle system (floating timer digits)
   - Slow parallax effect
   - Gradient overlay
   - Never static

4. **Semi-Transparent Overlay**
   - Menu has backdrop-blur
   - Background visible but dimmed
   - Creates depth

5. **Staggered Entrance**
   - Menu items appear one by one
   - 50-100ms delay between each
   - Fade + slide animation

### Keyboard Navigation

#### Primary Controls
- **↑ / ↓**: Navigate menu items
- **Enter**: Select current item
- **Escape**: Go back / Cancel
- **Tab**: Cycle through menu items
- **1-6**: Quick select menu items (1=Prove, 2=Leaderboard, etc.)

#### Accessibility
- **Space**: Alternative to Enter
- **Home**: Jump to first item
- **End**: Jump to last item
- **Focus visible**: Clear outline on keyboard focus

### Mouse/Touch Controls
- **Hover**: Highlights item, updates description
- **Click**: Selects item
- **Hover Sound**: Subtle tick sound
- **Click Sound**: Satisfying click/beep

---

## 4. Animation Specifications

### Menu Entrance (On Load)
```
1. Background fades in (0.5s)
2. Logo appears with glow (0.3s delay)
3. Menu items stagger in (0.1s delay each):
   - Fade from opacity 0 → 1
   - Slide from left (-20px → 0)
4. Stats panel slides in from right (0.5s delay)
5. Description fades in (0.8s delay)
6. Controls fade in (1s delay)
```

### Selection Animation
```
- Selector arrow appears (instant)
- Item text color changes to primary (0.2s)
- Item transforms: translateX(10px) (0.2s)
- Glow effect on text (0.3s)
- Description updates with fade (0.2s)
```

### Transition Out (When Selecting)
```
1. Selected item pulses (0.2s)
2. All items fade out (0.3s)
3. Background dims (0.3s)
4. Loading screen fades in (0.5s)
```

### Background Animations
```
- Particles drift upward (20s loop)
- Gradient shifts subtly (10s loop)
- Parallax on mouse move (0.1s ease-out)
- Glow pulses on logo (2s loop)
```

---

## 5. Sound Design

### Menu Sounds
- **Menu Open**: Whoosh sound
- **Hover**: Subtle tick/beep (50ms)
- **Select**: Satisfying click/confirm (200ms)
- **Back/Cancel**: Lower-pitched beep
- **Error**: Buzz/negative sound
- **Ambient Music**: Looping background track (optional, toggleable)

### Sound Rules
- **Volume**: Adjustable in settings
- **Mute Option**: Global mute toggle
- **Preload**: All sounds loaded during attract mode
- **No Overlap**: Prevent sound spam on rapid hover

### Recommended Sounds
- Use 8-bit/retro sounds for arcade feel
- Or modern UI sounds for polish
- Keep file sizes small (<50kb each)
- Format: MP3 or OGG

---

## 6. Responsive Design

### Desktop (1024px+)
- Full layout as shown above
- Stats panel on right
- Keyboard navigation primary

### Tablet (768px - 1023px)
- Stats panel moves below menu
- Slightly smaller text
- Touch + keyboard support

### Mobile (< 768px)
- Single column layout
- Stats panel collapses to summary
- Touch-optimized (larger tap targets)
- Swipe gestures for navigation
- Bottom nav still visible

---

## 7. Technical Implementation

### File Structure
```
app/
├── components/
│   ├── AttractMode.tsx          # Opening screen
│   ├── LoadingScreen.tsx        # Loading with tips
│   ├── MainMenu.tsx             # Main menu component
│   ├── MenuBackground.tsx       # Animated background
│   └── StatsPanel.tsx           # User stats display
├── hooks/
│   └── useKeyboardNav.ts        # Keyboard navigation hook
lib/
├── sounds.ts                     # Sound management
├── menuTips.ts                   # Loading screen tips
└── menuAnimations.ts             # Animation utilities
```

### State Management
```typescript
// Menu state
interface MenuState {
  selectedIndex: number;
  isTransitioning: boolean;
  userStats: UserStats;
  soundEnabled: boolean;
}

// User stats
interface UserStats {
  address: string;
  highScore: number;
  highestLevel: number;
  rank: string;
  totalGames: number;
  perfectHits: number;
  totalHits: number;
}
```

### Performance Considerations
- Lazy load menu components
- Preload sounds during attract mode
- Use CSS transforms for animations (GPU accelerated)
- Debounce keyboard input (prevent spam)
- Optimize particle count for mobile

---

## 8. Future Enhancements

### Phase 1 (MVP)
- ✅ Attract mode
- ✅ Loading screen with tips
- ✅ Main menu with keyboard nav
- ✅ Stats panel
- ✅ Basic animations

### Phase 2 (Polish)
- 🔲 Sound effects
- 🔲 Background music
- 🔲 Advanced particle effects
- 🔲 Parallax backgrounds
- 🔲 Menu transitions between pages

### Phase 3 (Advanced)
- 🔲 Marketplace implementation
- 🔲 NFT integration in profile
- 🔲 Achievement system
- 🔲 Daily challenges from menu
- 🔲 Friend invites

---

## 9. Marketplace Concept (Future)

### Perfection NFT
When a player achieves a significant milestone, they can mint a "Perfection NFT":

**NFT Contains:**
- High score achieved
- Highest level reached
- Rank attained
- Total games played
- Perfect hit ratio
- Timestamp of achievement
- Unique visual (based on rank/score)

**Trading Mechanics:**
- List NFT for sale on marketplace
- Buyer pays in ETH/Base tokens
- Smart contract transfers NFT + stats
- Buyer's profile inherits all stats from NFT
- Original owner loses those stats
- Creates a market for "proven skill"

**Use Cases:**
- Sell your legendary run
- Buy a head start
- Collect rare achievements
- Flex your purchases
- Trade up for better stats

---

## 10. Keyboard Shortcuts Reference

### Global Shortcuts
- **Escape**: Back/Cancel
- **Enter**: Confirm/Select
- **Space**: Alternative confirm
- **Tab**: Next item
- **Shift+Tab**: Previous item

### Menu Shortcuts
- **↑/↓**: Navigate
- **1-6**: Quick select menu items
- **Home**: First item
- **End**: Last item
- **M**: Toggle music
- **S**: Toggle sound effects

### In-Game Shortcuts
- **Space**: Start/Stop timer
- **R**: Restart level
- **P**: Pause (if implemented)
- **Escape**: Return to menu

---

## Design Philosophy

1. **Immersion First**: Every screen should feel like part of a cohesive game experience
2. **Arcade Authenticity**: Draw from classic arcade cabinets and modern AAA games
3. **Smooth Transitions**: Never jarring, always smooth
4. **Keyboard-First**: Optimize for keyboard navigation (PC gaming standard)
5. **Visual Feedback**: Every action has a visual/audio response
6. **Performance**: Animations should never impact gameplay
7. **Accessibility**: Support keyboard, mouse, touch, and screen readers

---

## References & Inspiration

- **Borderlands**: Menu style, humor, visual flair
- **Halo**: Clean hierarchy, sci-fi aesthetic
- **Call of Duty**: Military precision, stats focus
- **Arcade Cabinets**: Attract mode, high score displays
- **Rocket League**: Menu flow, quick access
- **Valorant**: Modern UI, clean animations

---

## Success Metrics

A successful menu system will:
- ✅ Load in < 2 seconds
- ✅ Respond to input in < 100ms
- ✅ Run at 60fps on all devices
- ✅ Be navigable entirely by keyboard
- ✅ Feel satisfying to interact with
- ✅ Clearly communicate game state
- ✅ Entice new players (attract mode)
- ✅ Reward returning players (stats display)
