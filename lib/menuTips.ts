// Loading screen tips for Perfect?

export const MENU_TIPS = [
  "Stage 1: Master the 5.000s rhythm",
  "Perfect hits (±10ms) give bonus points",
  "Stage 2 introduces random target times",
  "Stage 3 tolerance: Only ±5ms. Good luck.",
  "One mistake = Game Over. No continues.",
  "Combo multipliers reward consistency",
  "Your rank increases with each level",
  "The green zone is your friend",
  "Watch the progress bar, not just the numbers",
  "Breathe. Focus. Click.",
];

export function getRandomTip(excludeIndex?: number): {
  tip: string;
  index: number;
} {
  let index = Math.floor(Math.random() * MENU_TIPS.length);

  // Avoid showing the same tip twice in a row
  if (excludeIndex !== undefined && index === excludeIndex) {
    index = (index + 1) % MENU_TIPS.length;
  }

  return {
    tip: MENU_TIPS[index],
    index,
  };
}
