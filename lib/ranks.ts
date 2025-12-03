// Rank system for Perfect? game
// Emojis are placeholders - replace with custom badge graphics

export interface Rank {
  level: number;
  name: string;
  tier: string;
  emoji: string; // TODO: Replace with custom badge graphics
}

export const RANKS: Rank[] = [
  // Beginner Tier (Levels 1-5)
  { level: 1, name: "Novice", tier: "Beginner", emoji: "🥉" },
  { level: 2, name: "Novice", tier: "Beginner", emoji: "🥉" },
  { level: 3, name: "Apprentice", tier: "Beginner", emoji: "🥈" },
  { level: 4, name: "Apprentice", tier: "Beginner", emoji: "🥈" },
  { level: 5, name: "Adept", tier: "Beginner", emoji: "🥇" },

  // Intermediate Tier (Levels 6-10)
  { level: 6, name: "Skilled", tier: "Intermediate", emoji: "⚔️" },
  { level: 7, name: "Skilled", tier: "Intermediate", emoji: "⚔️" },
  { level: 8, name: "Expert", tier: "Intermediate", emoji: "🎯" },
  { level: 9, name: "Expert", tier: "Intermediate", emoji: "🎯" },
  { level: 10, name: "Master", tier: "Intermediate", emoji: "🛡️" },

  // Advanced Tier (Levels 11-15) - Stage 2
  { level: 11, name: "Champion", tier: "Advanced", emoji: "🔥" },
  { level: 12, name: "Champion", tier: "Advanced", emoji: "🔥" },
  { level: 13, name: "Legend", tier: "Advanced", emoji: "💪" },
  { level: 14, name: "Legend", tier: "Advanced", emoji: "💪" },
  { level: 15, name: "Mythic", tier: "Advanced", emoji: "👑" },

  // Elite Tier (Levels 16-20)
  { level: 16, name: "Immortal", tier: "Elite", emoji: "⚡" },
  { level: 17, name: "Immortal", tier: "Elite", emoji: "⚡" },
  { level: 18, name: "Divine", tier: "Elite", emoji: "💥" },
  { level: 19, name: "Divine", tier: "Elite", emoji: "💥" },
  { level: 20, name: "Celestial", tier: "Elite", emoji: "🌟" },

  // Ascended Tier (Levels 21-25) - Stage 3
  { level: 21, name: "Transcendent", tier: "Ascended", emoji: "🌪️" },
  { level: 22, name: "Transcendent", tier: "Ascended", emoji: "🌪️" },
  { level: 23, name: "Eternal", tier: "Ascended", emoji: "⚡" },
  { level: 24, name: "Eternal", tier: "Ascended", emoji: "⚡" },
  { level: 25, name: "Absolute", tier: "Ascended", emoji: "👹" },

  // Perfect Tier (Levels 26-30)
  { level: 26, name: "Flawless", tier: "Perfect", emoji: "🐉" },
  { level: 27, name: "Flawless", tier: "Perfect", emoji: "🐉" },
  { level: 28, name: "Immaculate", tier: "Perfect", emoji: "👿" },
  { level: 29, name: "Immaculate", tier: "Perfect", emoji: "👿" },
  { level: 30, name: "PERFECT", tier: "Perfect", emoji: "💀" },
];

export function getRankForLevel(level: number): Rank {
  // Clamp level to valid range
  const clampedLevel = Math.max(1, Math.min(30, level));
  return RANKS[clampedLevel - 1];
}

export function getRankColor(tier: string): string {
  switch (tier) {
    case "Beginner":
      return "text-gray-400";
    case "Intermediate":
      return "text-cyan-400";
    case "Advanced":
      return "text-purple-400";
    case "Elite":
      return "text-orange-400";
    case "Ascended":
      return "text-red-400";
    case "Perfect":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

export function getRankBgColor(tier: string): string {
  switch (tier) {
    case "Beginner":
      return "bg-gray-500/20";
    case "Intermediate":
      return "bg-cyan-500/20";
    case "Advanced":
      return "bg-purple-500/20";
    case "Elite":
      return "bg-orange-500/20";
    case "Ascended":
      return "bg-red-500/20";
    case "Perfect":
      return "bg-yellow-500/20";
    default:
      return "bg-gray-500/20";
  }
}
