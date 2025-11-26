import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",
        secondary: "#06b6d4",
        accent: "#f97316",
        success: "#22c55e",
        error: "#dc2626",
        warning: "#f59e0b",
        info: "#06b6d4",
      },
      fontFamily: {
        mono: ["var(--font-3270)", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
