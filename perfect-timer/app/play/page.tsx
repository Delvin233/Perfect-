"use client";

import { useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import TimerGame from "../components/TimerGame";

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Connect to Play
          </h1>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Connect your wallet to start playing
          </p>
          <button onClick={() => open()} className="btn btn-primary text-xl">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setIsPlaying(false)}
          className="mb-4 transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Back
        </button>
        <TimerGame onScoreUpdate={handleScoreUpdate} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          HOW TO PLAY
        </h1>
      </div>

      <div className="card mb-8">
        <ul className="space-y-4 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              1
            </span>
            <p>Watch the timer count up from 0.000s</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              2
            </span>
            <p>Stop it exactly at the target time (e.g., 5.000s)</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              3
            </span>
            <p>Each level has a tighter tolerance window</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              4
            </span>
            <p>Miss the window and you start over</p>
          </li>
        </ul>
      </div>

      <button
        onClick={() => setIsPlaying(true)}
        className="w-full btn btn-primary text-2xl py-6"
      >
        START GAME
      </button>
    </div>
  );
}
