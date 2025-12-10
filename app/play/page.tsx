"use client";

import { useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import TimerGame from "../components/TimerGame";
import BackButton from "../components/BackButton";

export default function PlayPage() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleScoreUpdate = async (
    score: number,
    level: number,
    perfectHits?: number,
    totalHits?: number,
  ) => {
    if (!address) return;

    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, score, level, perfectHits, totalHits }),
      });
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              Connect to Play
            </h1>
            <p
              className="mb-6 sm:mb-8 text-sm sm:text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Connect your wallet to start playing
            </p>
            <button
              onClick={() => open()}
              className="btn btn-primary text-lg sm:text-xl active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="max-w-2xl mx-auto">
        <BackButton
          label=" EXIT GAME"
          onClick={() => setIsPlaying(false)}
          className="mb-3 sm:mb-4"
        />
        <TimerGame onScoreUpdate={handleScoreUpdate} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-4">
        <BackButton to="/" />
      </div>
      <div className="text-center mb-6 sm:mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          HOW TO PLAY
        </h1>
      </div>

      <div className="card mb-6 sm:mb-8 p-4 sm:p-6">
        <ul className="space-y-3 sm:space-y-4">
          <li className="flex items-start gap-2 sm:gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              1
            </span>
            <p
              className="text-sm sm:text-base pt-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Watch the timer count up from 0.000s
            </p>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              2
            </span>
            <p
              className="text-sm sm:text-base pt-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Stop it exactly at the target time (e.g., 5.000s)
            </p>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              3
            </span>
            <p
              className="text-sm sm:text-base pt-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Each level has a tighter tolerance window
            </p>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              4
            </span>
            <p
              className="text-sm sm:text-base pt-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Miss the window and you start over
            </p>
          </li>
        </ul>
      </div>

      <button
        onClick={() => setIsPlaying(true)}
        className="w-full btn btn-primary text-xl sm:text-2xl py-5 sm:py-6 active:scale-95"
      >
        START GAME
      </button>
    </div>
  );
}
