"use client";

import { useState, useEffect } from "react";
import { THEMES, applyTheme, getTheme } from "@/lib/themes";

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("delvin233");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const saved = localStorage.getItem("theme");
    if (saved) {
      setCurrentTheme(saved);
      applyTheme(getTheme(saved));
    }
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(getTheme(themeId));
    localStorage.setItem("theme", themeId);
    setIsOpen(false);
  };

  const theme = getTheme(currentTheme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.cardBorder,
          border: "1px solid",
        }}
      >
        <span className="text-xl sm:text-2xl">🎨</span>
        <span className="hidden sm:inline text-sm">{theme.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 rounded-xl border z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto"
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.cardBorder,
            }}
          >
            <div className="p-3 sm:p-4">
              <h3
                className="text-base sm:text-lg font-bold mb-2 sm:mb-3"
                style={{ color: theme.colors.text }}
              >
                Choose Theme
              </h3>
              <div className="space-y-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      currentTheme === t.id ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor: t.colors.cardBg,
                      borderColor: t.colors.cardBorder,
                      border: "1px solid",
                      ...(currentTheme === t.id && {
                        boxShadow: `0 0 0 2px ${t.colors.primary}`,
                      }),
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-bold text-sm sm:text-base"
                        style={{ color: t.colors.text }}
                      >
                        {t.name}
                      </span>
                      {currentTheme === t.id && <span className="text-sm sm:text-base">✓</span>}
                    </div>
                    <p
                      className="text-[10px] sm:text-xs"
                      style={{ color: t.colors.textSecondary }}
                    >
                      {t.description}
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                        style={{ backgroundColor: t.colors.secondary }}
                      />
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                        style={{ backgroundColor: t.colors.accent }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
