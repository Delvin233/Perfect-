// Theme system for Perfect?
// Default theme: delvin233's default (Soft Minimal)

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    cardBg: string;
    cardBorder: string;
    success: string;
    error: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "minimal",
    name: "Pure Minimal",
    description: "",
    colors: {
      primary: "#FFFFFF",
      secondary: "#E5E5E5",
      accent: "#999999",
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      text: "#FFFFFF",
      textSecondary: "#999999",
      cardBg: "rgba(255, 255, 255, 0.05)",
      cardBorder: "#333333",
      success: "#FFFFFF",
      error: "#FFFFFF",
    },
  },
  {
    id: "classic",
    name: "Classic Arcade",
    description: "",
    colors: {
      primary: "#FFD700",
      secondary: "#FF8C00",
      accent: "#FF4500",
      background: "#0a0a0a",
      backgroundSecondary: "#1a1410",
      text: "#FFF8DC",
      textSecondary: "#FFD700",
      cardBg: "rgba(255, 215, 0, 0.1)",
      cardBorder: "#FF8C00",
      success: "#FFD700",
      error: "#FF4500",
    },
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "",
    colors: {
      primary: "#FF1493",
      secondary: "#00BFFF",
      accent: "#FFFF00",
      background: "#1a0033",
      backgroundSecondary: "#2a0044",
      text: "#FFFFFF",
      textSecondary: "#FF1493",
      cardBg: "rgba(255, 20, 147, 0.1)",
      cardBorder: "#FF1493",
      success: "#00BFFF",
      error: "#FF1493",
    },
  },
  {
    id: "retro",
    name: "Retro Console",
    description: "",
    colors: {
      primary: "#E52521",
      secondary: "#0066CC",
      accent: "#00FF00",
      background: "#2b2b2b",
      backgroundSecondary: "#3b3b3b",
      text: "#FFFFFF",
      textSecondary: "#E52521",
      cardBg: "rgba(229, 37, 33, 0.1)",
      cardBorder: "#E52521",
      success: "#00FF00",
      error: "#E52521",
    },
  },
  {
    id: "sunset",
    name: "Sunset Drive",
    description: "",
    colors: {
      primary: "#FF006E",
      secondary: "#FF6B35",
      accent: "#FFB627",
      background: "#0F1419",
      backgroundSecondary: "#1F2429",
      text: "#F8F8F8",
      textSecondary: "#FF006E",
      cardBg: "rgba(255, 0, 110, 0.1)",
      cardBorder: "#FF006E",
      success: "#FFB627",
      error: "#FF006E",
    },
  },
  {
    id: "candy",
    name: "Candy Land",
    description: "",
    colors: {
      primary: "#FF69B4",
      secondary: "#87CEEB",
      accent: "#98FF98",
      background: "#2D1B3D",
      backgroundSecondary: "#3D2B4D",
      text: "#FFFACD",
      textSecondary: "#FF69B4",
      cardBg: "rgba(255, 105, 180, 0.1)",
      cardBorder: "#FF69B4",
      success: "#98FF98",
      error: "#FF69B4",
    },
  },
  {
    id: "vector",
    name: "Vector Display",
    description: "",
    colors: {
      primary: "#00FF41",
      secondary: "#00FFFF",
      accent: "#FFFFFF",
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      text: "#00FF41",
      textSecondary: "#00FFFF",
      cardBg: "rgba(0, 255, 65, 0.1)",
      cardBorder: "#00FF41",
      success: "#00FF41",
      error: "#FF0000",
    },
  },
  {
    id: "delvin233",
    name: "delvin233's default",
    description: "",
    colors: {
      primary: "#F5F5F0",
      secondary: "#D4C5B9",
      accent: "#A89F91",
      background: "#1C1C1E",
      backgroundSecondary: "#2C2C2E",
      text: "#FAF9F6",
      textSecondary: "#D4C5B9",
      cardBg: "rgba(212, 197, 185, 0.1)",
      cardBorder: "#A89F91",
      success: "#10b981",
      error: "#ef4444",
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty(
    "--color-background-secondary",
    theme.colors.backgroundSecondary,
  );
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-text-secondary", theme.colors.textSecondary);
  root.style.setProperty("--color-card-bg", theme.colors.cardBg);
  root.style.setProperty("--color-card-border", theme.colors.cardBorder);
  root.style.setProperty("--color-success", theme.colors.success);
  root.style.setProperty("--color-error", theme.colors.error);
}
