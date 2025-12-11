# Arcade Menu System - Implementation Spec

## Overview

Transform Perfect? into a full arcade experience with an immersive menu system inspired by AAA PC games (Borderlands, Halo, Call of Duty). This spec covers the implementation of attract mode, loading screens, and a keyboard-navigable main menu.

## Reference Documents

- **Design Spec**: `.kiro/steering/arcade-menu-system.md`
- **Game Mechanics**: `.kiro/steering/game-mechanics.md`
- **Current Implementation**: `app/page.tsx`, `app/components/TimerGame.tsx`

---

## User Stories

### Epic 1: Attract Mode (Opening Screen)

**As a visitor**, I want to see an engaging attract mode when I arrive at the site, so I'm enticed to connect my wallet and play.

#### Story 1.1: Basic Attract Mode

- **Given** I visit the site without a connected wallet
- **When** the page loads
- **Then** I see an animated attract mode screen with:
  - Large "PERFECT?" logo (pulsing/glowing)
  - Tagline: "Stop Time. Prove Perfection."
  - Animated background with floating timer digits
  - "PRESS ANY KEY TO START" or "CONNECT WALLET" call-to-action
  - High score ticker scrolling recent leaderboard entries

#### Story 1.2: Attract Mode Interactions

- **Given** I'm viewing the attract mode
- **When** I press any key, click, or tap
- **Then** the attract mode transitions to wallet connection prompt
- **And** the transition is smooth (fade out 0.5s)

#### Story 1.3: Demo Mode

- **Given** I'm viewing the attract mode for 30+ seconds
- **When** no interaction occurs
- **Then** the screen shows either:
  - Auto-play demo of the game, OR
  - Expanded leaderboard showcase
- **And** any interaction returns to main attract mode

**Acceptance Criteria:**

- [x] Logo fades in with glow effect (2s animation)
- [x] Particles drift continuously across screen
- [x] High scores scroll from bottom to top
- [x] CTA text pulses every 1 second
- [x] Background has subtle parallax on mouse move
- [x] Keyboard/mouse/touch input exits attract mode
- [ ] Demo mode triggers after 30s idle
- [x] All animations run at 60fps

---

### Epic 2: Loading Screen

**As a player**, I want to see an engaging loading screen with helpful tips, so I'm prepared for gameplay and entertained during transitions.

#### Story 2.1: Loading Screen Display

- **Given** I click "PROVE PERFECTION" or connect my wallet
- **When** the game is loading
- **Then** I see a loading screen with:
  - Game logo at top
  - Animated progress bar
  - Rotating spinner
  - Gameplay tip (changes every 3s)
  - Loading percentage

#### Story 2.2: Loading Screen Timing

- **Given** the loading screen is displayed
- **When** assets are loaded
- **Then** the screen displays for minimum 1.5 seconds
- **And** maximum 5 seconds
- **And** transitions smoothly to next screen (fade 0.5s)

#### Story 2.3: Tip Rotation

- **Given** the loading screen is visible
- **When** 3 seconds pass
- **Then** the current tip fades out
- **And** a new random tip fades in
- **And** tips don't repeat until all have been shown

**Gameplay Tips to Display:**

1. "Stage 1: Master the 5.000s rhythm"
2. "Perfect hits (±10ms) give bonus points"
3. "Stage 2 introduces random target times"
4. "Stage 3 tolerance: Only ±5ms. Good luck."
5. "One mistake = Game Over. No continues."
6. "Combo multipliers reward consistency"
7. "Your rank increases with each level"
8. "The green zone is your friend"
9. "Watch the progress bar, not just the numbers"
10. "Breathe. Focus. Stop Time!"

**Acceptance Criteria:**

- [x] Loading screen shows for 1.5-5 seconds
- [x] Progress bar animates smoothly (even if fake)
- [x] Tips rotate every 3 seconds
- [x] All 10 tips are included
- [x] Fade in (0.3s) and fade out (0.5s) transitions
- [x] Loading percentage updates smoothly
- [x] Spinner rotates continuously

---

### Epic 3: Main Menu

**As a player**, I want a keyboard-navigable main menu with clear options, so I can easily access all game features.

#### Story 3.1: Menu Layout

- **Given** I've connected my wallet and loading is complete
- **When** the main menu appears
- **Then** I see:
  - Game logo and wallet address at top
  - Left-aligned vertical menu with 6 items
  - Stats panel on right (desktop) or below (mobile)
  - Animated background
  - Description text for selected item
  - Keyboard controls hint at bottom

#### Story 3.2: Menu Items

The menu displays these items in order:

1. **PROVE PERFECTION** - "Test your precision. One mistake = Game Over."
2. **LEADERBOARD** - "View top players worldwide. Ranks explained."
3. **PROFILE** - "Your stats, achievements, and NFT collection"
4. **SETTINGS** - "Customize theme, sound, and preferences"
5. **MARKETPLACE** - "Trade Perfection NFTs. Stats transfer to buyer." [COMING SOON badge]
6. **DISCONNECT** - "Sign out of your wallet"

#### Story 3.3: Keyboard Navigation

- **Given** I'm on the main menu
- **When** I press ↑/↓ arrow keys
- **Then** the selection moves up/down
- **And** the selected item glows and shows arrow indicator
- **And** the description updates
- **When** I press Enter or Space
- **Then** the selected action executes
- **When** I press 1-6 number keys
- **Then** the corresponding menu item is selected instantly
- **When** I press Escape
- **Then** I return to previous screen or show disconnect confirmation

#### Story 3.4: Mouse/Touch Navigation

- **Given** I'm on the main menu
- **When** I hover over a menu item
- **Then** it highlights and shows description
- **And** a subtle tick sound plays (if sound enabled)
- **When** I click a menu item
- **Then** the action executes
- **And** a click sound plays (if sound enabled)

#### Story 3.5: Stats Panel

- **Given** I'm viewing the main menu
- **Then** the stats panel displays:
  - High Score (largest, most prominent)
  - Best Level ("Level X" with stage indicator)
  - Rank (name + emoji from ranks.ts)
  - Total Games (number of attempts)
  - Perfect Hits (X/Y ratio)
  - Stages Completed (0-3 badges)

#### Story 3.6: Menu Animations

- **Given** the main menu loads
- **Then** elements appear in this sequence:
  1. Background fades in (0.5s)
  2. Logo appears with glow (0.3s delay)
  3. Menu items stagger in (0.1s delay each):
     - Fade from opacity 0 → 1
     - Slide from left (-20px → 0)
  4. Stats panel slides in from right (0.5s delay)
  5. Description fades in (0.8s delay)
  6. Controls fade in (1s delay)

#### Story 3.7: Selection Animation

- **Given** I select a different menu item
- **Then** the animation shows:
  - Selector arrow appears instantly
  - Item text color changes to primary (0.2s)
  - Item transforms: translateX(10px) (0.2s)
  - Glow effect on text (0.3s)
  - Description updates with fade (0.2s)

#### Story 3.8: Transition Out

- **Given** I select a menu item
- **Then** the transition shows:
  1. Selected item pulses (0.2s)
  2. All items fade out (0.3s)
  3. Background dims (0.3s)
  4. Loading screen or target page fades in (0.5s)

**Acceptance Criteria:**

- [x] All 6 menu items display correctly
- [x] Keyboard navigation works (↑↓, Enter, Esc, 1-6)
- [x] Mouse hover highlights items
- [x] Touch tap works on mobile
- [x] Stats panel shows real user data
- [x] Rank emoji and name from ranks.ts
- [x] Staggered entrance animation (50-100ms delays)
- [x] Selection animations smooth (0.2s transitions)
- [x] Description updates on selection change
- [x] Marketplace shows "COMING SOON" badge
- [x] All animations run at 60fps
- [x] Responsive layout (desktop/tablet/mobile)

---

### Epic 4: Animated Background

**As a player**, I want a dynamic animated background, so the menu feels alive and engaging.

#### Story 4.1: Particle System

- **Given** I'm viewing any menu screen
- **Then** I see floating particles:
  - Timer digits (0-9)
  - Drifting upward slowly
  - Various sizes and opacities
  - Continuous loop (20s cycle)

#### Story 4.2: Parallax Effect

- **Given** I'm on desktop with a mouse
- **When** I move my mouse
- **Then** the background shifts subtly
- **And** the parallax effect is smooth (0.1s ease-out)

#### Story 4.3: Gradient Animation

- **Given** I'm viewing the background
- **Then** the gradient colors shift subtly
- **And** the animation loops every 10 seconds

**Acceptance Criteria:**

- [x] Particles drift upward continuously
- [x] Particle count optimized for mobile (fewer particles)
- [x] Parallax works on mouse move (desktop only)
- [x] Gradient shifts smoothly
- [x] Background never static
- [x] Performance: 60fps maintained
- [x] GPU-accelerated (CSS transforms)

---

### Epic 5: Sound System

**As a player**, I want audio feedback for menu interactions, so the experience feels polished and responsive.

#### Story 5.1: Menu Sounds

- **Given** sound is enabled in settings
- **When** I hover over a menu item
- **Then** a subtle tick/beep plays (50ms)
- **When** I select a menu item
- **Then** a satisfying click/confirm sound plays (200ms)
- **When** I press back/cancel
- **Then** a lower-pitched beep plays
- **When** an error occurs
- **Then** a buzz/negative sound plays

#### Story 5.2: Sound Controls

- **Given** I'm in settings
- **Then** I can:
  - Toggle sound effects on/off
  - Adjust volume (0-100%)
  - Toggle background music on/off
  - Adjust music volume separately

#### Story 5.3: Sound Management

- **Given** sounds are enabled
- **Then** the system:
  - Preloads all sounds during attract mode
  - Prevents sound spam on rapid hover
  - Respects global mute setting
  - Uses small file sizes (<50kb each)

**Acceptance Criteria:**

- [ ] Hover sound plays on menu item hover
- [ ] Select sound plays on menu item click
- [ ] Back sound plays on Escape press
- [ ] Error sound plays on invalid action
- [ ] Volume controls work in settings
- [ ] Global mute toggle works
- [ ] Sounds preloaded (no delay)
- [ ] No sound overlap/spam
- [ ] File sizes optimized (<50kb)
- [ ] Format: MP3 or OGG

---

## Technical Implementation

### File Structure

```
app/
├── components/
│   ├── AttractMode.tsx          # Opening screen with animations
│   ├── LoadingScreen.tsx        # Loading with tips rotation
│   ├── MainMenu.tsx             # Main menu with keyboard nav
│   ├── MenuBackground.tsx       # Animated background particles
│   ├── StatsPanel.tsx           # User stats display
│   └── MenuItem.tsx             # Individual menu item component
├── hooks/
│   ├── useKeyboardNav.ts        # Keyboard navigation logic
│   ├── useMenuSounds.ts         # Sound effect management
│   └── useMenuAnimation.ts      # Animation utilities
lib/
├── sounds.ts                     # Sound loading and playback
├── menuTips.ts                   # Loading screen tips array
└── menuAnimations.ts             # Animation helper functions
public/
└── sounds/
    ├── hover.mp3                 # Menu hover sound
    ├── select.mp3                # Menu select sound
    ├── back.mp3                  # Back/cancel sound
    └── error.mp3                 # Error sound
```

### State Management

```typescript
// Menu state
interface MenuState {
  selectedIndex: number;
  isTransitioning: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

// User stats (from API)
interface UserStats {
  address: string;
  highScore: number;
  highestLevel: number;
  rank: string;
  totalGames: number;
  perfectHits: number;
  totalHits: number;
  stagesCompleted: number;
}

// Menu item definition
interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
  badge?: string; // e.g., "COMING SOON"
}
```

### Component APIs

#### AttractMode Component

```typescript
interface AttractModeProps {
  onExit: () => void;
  leaderboardScores: Score[];
}
```

#### LoadingScreen Component

```typescript
interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number; // default: 1500ms
  maxDuration?: number; // default: 5000ms
}
```

#### MainMenu Component

```typescript
interface MainMenuProps {
  userStats: UserStats;
  onNavigate: (route: string) => void;
  onDisconnect: () => void;
}
```

#### MenuBackground Component

```typescript
interface MenuBackgroundProps {
  particleCount?: number; // default: 50 (desktop), 20 (mobile)
  enableParallax?: boolean; // default: true (desktop only)
}
```

#### StatsPanel Component

```typescript
interface StatsPanelProps {
  stats: UserStats;
  compact?: boolean; // for mobile
}
```

### Performance Requirements

- **Load Time**: Menu loads in < 2 seconds
- **Input Response**: < 100ms from input to visual feedback
- **Frame Rate**: 60fps on all devices
- **Animation Smoothness**: No jank or stuttering
- **Sound Latency**: < 50ms from trigger to playback
- **Mobile Optimization**: Reduced particle count, simplified animations

### Responsive Breakpoints

- **Desktop (1024px+)**: Full layout with stats panel on right
- **Tablet (768px - 1023px)**: Stats panel below menu
- **Mobile (< 768px)**: Single column, compact stats, touch-optimized

---

## Implementation Phases

### Phase 1: Foundation (MVP)

**Goal**: Basic menu system working

1. Create `MenuBackground.tsx` with basic particle system
2. Create `LoadingScreen.tsx` with tips rotation
3. Create `MainMenu.tsx` with static menu items
4. Create `StatsPanel.tsx` with user stats display
5. Implement basic keyboard navigation
6. Add responsive layouts

**Deliverables**:

- [x] All components created
- [x] Keyboard navigation works
- [x] Stats display real data
- [x] Responsive on all devices

### Phase 2: Animations & Polish

**Goal**: Smooth, engaging animations

1. Implement staggered entrance animations
2. Add selection animations
3. Add transition out animations
4. Enhance particle system (parallax, gradients)
5. Optimize performance (GPU acceleration)

**Deliverables**:

- [x] All animations implemented
- [x] 60fps maintained
- [x] Smooth transitions
- [x] Parallax effect works

### Phase 3: Attract Mode & Sound

**Goal**: Full arcade experience

1. Create `AttractMode.tsx` with demo mode
2. Implement sound system (`lib/sounds.ts`)
3. Add menu sounds (hover, select, back, error)
4. Create settings page for sound controls
5. Add background music (optional)

**Deliverables**:

- [ ] Attract mode functional
- [ ] All sounds working
- [ ] Sound settings page
- [ ] Volume controls

### Phase 4: Advanced Features

**Goal**: Extra polish and features

1. Add marketplace "coming soon" page
2. Implement demo mode in attract screen
3. Add achievement badges to stats panel
4. Create custom rank badge graphics
5. Add more particle effects

**Deliverables**:

- [ ] Marketplace placeholder
- [ ] Demo mode working
- [ ] Achievement system
- [ ] Custom graphics

---

## Testing Checklist

### Functional Testing

- [x] Attract mode displays on page load (no wallet)
- [x] Any key/click exits attract mode
- [ ] Demo mode triggers after 30s idle
- [x] Loading screen shows for 1.5-5s
- [x] Tips rotate every 3 seconds
- [x] Main menu displays after loading
- [x] All 6 menu items visible
- [x] Keyboard navigation works (↑↓, Enter, Esc, 1-6)
- [x] Mouse hover highlights items
- [x] Touch tap works on mobile
- [x] Stats panel shows correct data
- [x] Rank matches level (from ranks.ts)
- [x] Menu item actions execute correctly
- [x] Disconnect shows confirmation
- [x] Marketplace shows "COMING SOON"

### Animation Testing

- [x] Logo fades in smoothly
- [x] Particles drift continuously
- [x] Menu items stagger in (0.1s delays)
- [x] Selection animation smooth (0.2s)
- [x] Transition out smooth (0.3s)
- [x] No animation jank or stuttering
- [ ] 60fps maintained throughout
- [ ] Parallax works on mouse move

### Sound Testing

- [ ] Hover sound plays on menu hover
- [ ] Select sound plays on click
- [ ] Back sound plays on Escape
- [ ] Error sound plays on invalid action
- [ ] Volume controls work
- [ ] Mute toggle works
- [ ] No sound spam on rapid hover
- [ ] Sounds preloaded (no delay)

### Responsive Testing

- [x] Desktop layout correct (1024px+)
- [x] Tablet layout correct (768-1023px)
- [x] Mobile layout correct (<768px)
- [x] Stats panel position correct per breakpoint
- [x] Touch targets large enough (44px min)
- [x] Text readable on all devices
- [x] Animations smooth on mobile
- [x] Particle count reduced on mobile

### Performance Testing

- [x] Menu loads in < 2 seconds
- [x] Input response < 100ms
- [x] 60fps on desktop
- [x] 60fps on mobile
- [x] No memory leaks
- [ ] Sounds load quickly
- [x] Images optimized
- [x] GPU acceleration working

### Accessibility Testing

- [x] Keyboard navigation complete
- [x] Focus visible on all elements
- [ ] Screen reader compatible
- [x] Color contrast sufficient
- [x] Text scalable
- [x] No flashing content (seizure risk)
- [x] Touch targets 44px minimum

---

## Success Metrics

A successful implementation will achieve:

1. **Performance**
   - Load time < 2 seconds
   - Input response < 100ms
   - 60fps on all devices

2. **Usability**
   - Fully keyboard navigable
   - Touch-friendly on mobile
   - Clear visual hierarchy
   - Intuitive navigation

3. **Engagement**
   - Attract mode entices new players
   - Loading screen entertains during waits
   - Menu feels polished and professional
   - Animations enhance experience

4. **Polish**
   - Smooth transitions
   - Satisfying sound effects
   - Dynamic background
   - Responsive on all devices

---

## Future Enhancements

### Post-MVP Features

- [ ] Background music tracks
- [ ] More particle effects
- [ ] Custom rank badge graphics
- [ ] Achievement system integration
- [ ] Daily challenge from menu
- [ ] Friend invites
- [ ] Marketplace implementation
- [ ] NFT integration in profile
- [ ] Tournament mode
- [ ] Replay system

### Advanced Polish

- [ ] Screen shake effects
- [ ] More sound variations
- [ ] Animated logo variations
- [ ] Seasonal themes
- [ ] Special event modes
- [ ] Leaderboard animations
- [ ] Profile customization
- [ ] Social features

---

## Notes

- All animations use CSS transforms for GPU acceleration
- Particle count reduced on mobile for performance
- Sound files must be <50kb each
- Loading screen minimum 1.5s prevents flashing
- Keyboard navigation is primary input method (PC gaming standard)
- Stats panel data fetched from existing API
- Rank system uses existing `lib/ranks.ts`
- Theme system uses existing `lib/themes.ts`
- Marketplace is placeholder for future NFT feature
- Demo mode can be simple auto-play or leaderboard showcase

---

## Dependencies

### Existing

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Reown AppKit (wallet)
- Existing API routes (`/api/scores`)
- Existing libraries (`lib/ranks.ts`, `lib/themes.ts`)

### New (to be added)

- `framer-motion` (optional, for advanced animations)
- `howler.js` (optional, for sound management)
- Sound files (hover, select, back, error)
- Particle system library (or custom implementation)

---

## Questions for Review

1. Should we use `framer-motion` for animations or stick with CSS?
2. Should demo mode be auto-play or leaderboard showcase?
3. Should we implement background music in Phase 1 or Phase 3?
4. Should marketplace page be a full placeholder or just a modal?
5. Should we add achievement system now or later?
6. Should we create custom rank badge graphics or use emojis for MVP?
7. Should we implement sound system in Phase 1 or Phase 3?

---

## Approval Checklist

Before implementation begins:

- [ ] User stories reviewed and approved
- [ ] Technical approach validated
- [ ] File structure confirmed
- [ ] Component APIs agreed upon
- [ ] Performance requirements clear
- [ ] Testing checklist complete
- [ ] Success metrics defined
- [ ] Phase 1 scope locked

---

**Status**: Ready for Review
**Created**: 2025-12-08
**Last Updated**: 2025-12-08
