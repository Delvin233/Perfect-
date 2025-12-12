"use client";

import { useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useSubmitScore } from "@/hooks/useContract";
import TimerGame from "../components/TimerGame";
import BackButton from "../components/BackButton";

export default function PlayPage() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [isPlaying, setIsPlaying] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // Use smart contract hook for score submission
  const {
    submitScore,
    loading: submitting,
    error: submitError,
  } = useSubmitScore();

  const handleScoreUpdate = async (
    score: number,
    level: number,
    perfectHits?: number,
    totalHits?: number,
  ) => {
    if (!address) return;

    // Always save to database (fast and reliable)
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          score,
          level,
          perfectHits,
          totalHits,
        }),
      });
      setSubmissionStatus("✅ Score saved to database");
    } catch (error) {
      console.error("Failed to save to database:", error);
      setSubmissionStatus("❌ Failed to save score");
    }

    // Clear status after 3 seconds
    setTimeout(() => setSubmissionStatus(null), 3000);
  };

  // Manual blockchain submission
  const handleBlockchainSubmit = async () => {
    if (!address) return;

    // Get the latest score from database or game state
    // For now, we'll need to pass the current game data
    // This would ideally get the user's highest score from database
    try {
      setSubmissionStatus("Submitting to blockchain...");

      // TODO: Get actual user's best score from database
      // For now, this is a placeholder - we'd need to fetch user's best score
      const response = await fetch(`/api/scores?address=${address}`);
      const data = await response.json();

      if (!data.scores || data.scores.length === 0) {
        setSubmissionStatus("❌ No scores to submit");
        setTimeout(() => setSubmissionStatus(null), 3000);
        return;
      }

      const bestScore = data.scores[0]; // Assuming API returns sorted by score
      const longestStreak = bestScore.perfectHits || 0;

      const hash = await submitScore(
        bestScore.score,
        bestScore.level,
        bestScore.perfectHits || 0,
        bestScore.totalHits || 0,
        longestStreak,
        0, // continuesUsed
      );

      setSubmissionStatus(`✅ Blockchain: ${hash.slice(0, 10)}...`);
    } catch (error) {
      console.error("Failed to submit to blockchain:", error);
      setSubmissionStatus(
        `❌ Blockchain failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Clear status after 5 seconds
    setTimeout(() => setSubmissionStatus(null), 5000);
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

        {/* Submission Status */}
        {(submissionStatus || submitting) && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2">
              {submitting && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              <p className="text-sm text-blue-400">
                {submissionStatus || "Submitting to blockchain..."}
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              Blockchain submission failed: {submitError}
            </p>
          </div>
        )}

        {/* Manual Blockchain Submission */}
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-400 font-medium">
                🔗 Submit to Blockchain
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submit your best score to the blockchain for permanent storage &
                global leaderboard
              </p>
              <p className="text-xs text-blue-300 mt-1">
                💡 Requires wallet signature & small gas fee
              </p>
            </div>
            <button
              onClick={handleBlockchainSubmit}
              disabled={submitting}
              className="btn btn-secondary text-sm px-4 py-2 disabled:opacity-50 ml-3"
            >
              {submitting ? "Submitting..." : "Submit Best Score"}
            </button>
          </div>
        </div>

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
