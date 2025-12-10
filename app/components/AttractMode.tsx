"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKit } from "@reown/appkit/react";
import EnhancedMenuBackground from "./EnhancedMenuBackground";

interface Score {
  address: string;
  score: number;
  level: number;
}

interface AttractModeProps {
  onExit: () => void;
  leaderboardScores?: Score[];
}

export default function AttractMode({
  onExit,
  leaderboardScores = [],
}: AttractModeProps) {
  const { open } = useAppKit();
  const [logoScale, setLogoScale] = useState(1);
  const [ctaPulse, setCtaPulse] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollingScores, setScrollingScores] = useState<Score[]>([]);

  // Enhanced entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Logo pulse animation
  useEffect(() => {
    const logoInterval = setInterval(() => {
      setLogoScale((prev) => (prev === 1 ? 1.05 : 1));
    }, 2000);

    return () => clearInterval(logoInterval);
  }, []);

  // CTA pulse animation
  useEffect(() => {
    const ctaInterval = setInterval(() => {
      setCtaPulse((prev) => !prev);
    }, 1000);

    return () => clearInterval(ctaInterval);
  }, []);

  // Demo mode timer (30 seconds)
  useEffect(() => {
    const demoTimer = setTimeout(() => {
      setShowDemo(true);
    }, 30000);

    return () => clearTimeout(demoTimer);
  }, []);

  // Prepare scrolling scores
  useEffect(() => {
    if (leaderboardScores.length > 0) {
      // Duplicate scores for continuous scrolling
      const duplicatedScores = [...leaderboardScores, ...leaderboardScores];
      setScrollingScores(duplicatedScores);
    }
  }, [leaderboardScores]);

  // Handle any interaction to exit attract mode
  const handleInteraction = useCallback(() => {
    onExit();
    open(); // Open wallet connection
  }, [onExit, open]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      handleInteraction();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleInteraction]);

  // Demo mode - show leaderboard showcase
  if (showDemo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center cursor-pointer"
        onClick={handleInteraction}
      >
        <EnhancedMenuBackground
          particleCount={80}
          enableParallax={true}
          intensity="high"
        />

        <div className="text-center max-w-4xl px-4 relative z-10">
          {/* Demo mode header */}
          <h1
            className="text-4xl sm:text-6xl font-bold mb-8 animate-pulse"
            style={{
              color: "var(--color-primary)",
              textShadow: "0 0 30px rgba(245, 245, 240, 0.5)",
            }}
          >
            LEADERBOARD SHOWCASE
          </h1>

          {/* Top scores display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {leaderboardScores.slice(0, 6).map((score, index) => (
              <div
                key={index}
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  #{index + 1}
                </div>
                <div className="text-lg font-semibold mb-1">
                  {score.score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Level {score.level}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {score.address.slice(0, 6)}...{score.address.slice(-4)}
                </div>
              </div>
            ))}
          </div>

          {/* Return to attract mode */}
          <p
            className="text-lg animate-pulse"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Press any key to start your journey to the top!
          </p>
        </div>
      </div>
    );
  }

  // Main attract mode
  return (
    <div
      className="min-h-screen flex items-center justify-center cursor-pointer relative overflow-hidden"
      onClick={handleInteraction}
    >
      <EnhancedMenuBackground
        particleCount={100}
        enableParallax={true}
        intensity="high"
      />

      <div className="text-center max-w-4xl px-4 relative z-10">
        {/* Main logo with glow and pulse */}
        <h1
          className={`text-6xl sm:text-8xl md:text-9xl font-bold mb-6 transition-all duration-300 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            color: "var(--color-primary)",
            textShadow: "0 0 40px rgba(245, 245, 240, 0.6)",
            transform: `scale(${logoScale})`,
          }}
        >
          PERFECT?
        </h1>

        {/* Tagline */}
        <p
          className={`text-xl sm:text-2xl md:text-3xl mb-12 transition-all duration-500 delay-300 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            color: "var(--color-secondary)",
            textShadow: "0 0 20px rgba(212, 197, 185, 0.4)",
          }}
        >
          Stop Time. Prove Perfection.
        </p>

        {/* High score ticker */}
        {scrollingScores.length > 0 && (
          <div
            className={`mb-8 h-16 overflow-hidden transition-all duration-700 delay-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="animate-scroll-up space-y-2">
              {scrollingScores.map((score, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center gap-4 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span className="text-orange-500 font-bold">
                    {score.score.toLocaleString()}
                  </span>
                  <span>Level {score.level}</span>
                  <span className="text-gray-500">
                    {score.address.slice(0, 6)}...{score.address.slice(-4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to action */}
        <div
          className={`transition-all duration-700 delay-700 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p
            className={`text-lg sm:text-xl font-semibold mb-4 transition-opacity duration-300 ${
              ctaPulse ? "opacity-100" : "opacity-70"
            }`}
            style={{ color: "var(--color-primary)" }}
          >
            PRESS ANY KEY TO START
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            or click anywhere to connect your wallet
          </p>
        </div>

        {/* Game preview stats */}
        <div
          className={`mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto transition-all duration-700 delay-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-500 mb-1">3</div>
            <div className="text-xs text-gray-400">STAGES</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">30</div>
            <div className="text-xs text-gray-400">LEVELS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500 mb-1">1</div>
            <div className="text-xs text-gray-400">LIFE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
