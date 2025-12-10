"use client";

import { useEffect, useState } from "react";
import { getRandomTip } from "@/lib/menuTips";

interface EnhancedLoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
  maxDuration?: number;
}

export default function EnhancedLoadingScreen({
  onComplete,
  minDuration = 1500,
  maxDuration = 5000,
}: EnhancedLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(getRandomTip());
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(1);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = Math.min(maxDuration, minDuration);

    // Enhanced progress animation with easing
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = elapsed / duration;

      // Ease-out animation for smoother progress
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      const newProgress = Math.min(easedProgress * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        // Enhanced fade out with scale
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500);
        }, 200);
      }
    }, 16);

    // Enhanced tip rotation with fade effect
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => getRandomTip(prev.index));
    }, 3000);

    // Logo pulse animation
    const logoInterval = setInterval(() => {
      setLogoScale((prev) => (prev === 1 ? 1.05 : 1));
    }, 1000);

    // Floating particles animation
    const particleInterval = setInterval(() => {
      setParticles((prev) => {
        const newParticles = [...prev];

        // Add new particle occasionally
        if (Math.random() < 0.3 && newParticles.length < 10) {
          newParticles.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: 100,
          });
        }

        // Update existing particles
        return newParticles
          .map((particle) => ({
            ...particle,
            y: particle.y - 2,
          }))
          .filter((particle) => particle.y > -10);
      });
    }, 200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      clearInterval(logoInterval);
      clearInterval(particleInterval);
    };
  }, [minDuration, maxDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background:
          "linear-gradient(135deg, var(--color-background) 0%, var(--color-background-secondary) 100%)",
      }}
    >
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: "var(--color-primary)",
            transform: `translateY(${particle.y}px)`,
            transition: "transform 0.2s linear",
          }}
        />
      ))}

      <div className="max-w-md w-full px-6 text-center space-y-8 relative">
        {/* Enhanced logo with pulse */}
        <h1
          className="text-5xl sm:text-6xl font-bold transition-transform duration-300"
          style={{
            color: "var(--color-primary)",
            transform: `scale(${logoScale})`,
            textShadow: "0 0 20px rgba(245, 245, 240, 0.3)",
          }}
        >
          PERFECT?
        </h1>

        {/* Enhanced loading spinner with glow */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: "var(--color-primary)",
                borderTopColor: "transparent",
                filter: "drop-shadow(0 0 10px var(--color-primary))",
              }}
            />
            {/* Inner spinning ring */}
            <div
              className="absolute inset-2 border-2 border-b-transparent rounded-full animate-spin"
              style={{
                borderColor:
                  "transparent transparent var(--color-secondary) transparent",
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
          </div>
        </div>

        {/* Enhanced progress bar with glow */}
        <div className="space-y-2">
          <div
            className="h-3 rounded-full overflow-hidden relative"
            style={{
              background: "var(--color-bg-tertiary)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {/* Progress fill with animated gradient */}
            <div
              className="h-full transition-all duration-100 ease-linear relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, 
                  var(--color-primary) 0%, 
                  var(--color-secondary) 50%, 
                  var(--color-primary) 100%)`,
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite",
                boxShadow: "0 0 10px var(--color-primary)",
              }}
            />

            {/* Animated shine effect */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                transform: `translateX(${progress * 2 - 100}%)`,
                transition: "transform 0.1s linear",
              }}
            />
          </div>

          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Loading... {Math.floor(progress)}%
          </p>
        </div>

        {/* Enhanced tip display with fade animation */}
        <div
          className="min-h-[60px] flex items-center justify-center px-4 py-3 rounded-lg relative overflow-hidden"
          style={{
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-card-border)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {/* Animated border glow */}
          <div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{
              background:
                "linear-gradient(45deg, var(--color-primary), var(--color-secondary), var(--color-primary))",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 3s ease infinite",
            }}
          />

          <p
            key={currentTip.index}
            className="text-sm sm:text-base animate-fade-in relative z-10 font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            💡 {currentTip.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
