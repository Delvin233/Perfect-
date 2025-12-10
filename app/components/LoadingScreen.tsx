"use client";

import { useEffect, useState } from "react";
import { getRandomTip } from "@/lib/menuTips";

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
  maxDuration?: number;
}

export default function LoadingScreen({
  onComplete,
  minDuration = 1500,
  maxDuration = 5000,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(getRandomTip());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const duration = Math.min(maxDuration, minDuration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        // Fade out
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500); // Wait for fade out
        }, 200);
      }
    }, 16); // ~60fps

    // Tip rotation every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => getRandomTip(prev.index));
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [minDuration, maxDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-md w-full px-6 text-center space-y-8">
        {/* Logo */}
        <h1
          className="text-5xl sm:text-6xl font-bold animate-pulse"
          style={{ color: "var(--color-primary)" }}
        >
          PERFECT?
        </h1>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-bg-tertiary)" }}
          >
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                background: "var(--color-primary)",
              }}
            />
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading... {Math.floor(progress)}%
          </p>
        </div>

        {/* Tip display */}
        <div
          className="min-h-[60px] flex items-center justify-center px-4 py-3 rounded-lg"
          style={{ background: "var(--color-card-bg)" }}
        >
          <p
            key={currentTip.index}
            className="text-sm sm:text-base animate-fade-in"
            style={{ color: "var(--color-text-secondary)" }}
          >
            💡 {currentTip.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
