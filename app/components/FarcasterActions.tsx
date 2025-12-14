"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcaster } from "../context/FarcasterProvider";

interface FarcasterActionsProps {
  score?: number;
  level?: number;
}

export default function FarcasterActions({
  score,
  level,
}: FarcasterActionsProps) {
  const { isInMiniApp, isReady, user } = useFarcaster();
  const [isSharing, setIsSharing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [globalStats, setGlobalStats] = useState<{
    totalPlayers: number;
    highestScore: number;
    highestLevel: number;
  } | null>(null);

  // Fetch global stats for sharing
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/farcaster?action=stats");
        const data = await response.json();
        if (data.success) {
          setGlobalStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch global stats:", error);
      }
    };

    if (isInMiniApp && isReady) {
      fetchStats();
    }
  }, [isInMiniApp, isReady]);

  const handleShareScore = async () => {
    if (!isInMiniApp || !isReady) return;

    setIsSharing(true);
    try {
      let text = "";

      if (score && level) {
        // Game over - share final score
        const stage = Math.ceil(level / 10);
        const stageText =
          stage === 1
            ? "Learning"
            : stage === 2
              ? "Master Mode"
              : "EXTREME Mode";

        text =
          `Just scored ${score.toLocaleString()} points in Perfect? 🎯\n\n` +
          `Reached Level ${level} (${stageText})\n` +
          `Can you beat my precision timing?\n\n` +
          `#PerfectTiming #Farcaster`;
      } else {
        // General share
        text =
          `Playing Perfect? - the ultimate precision timing game! 🎯\n\n` +
          `Stop the timer at EXACTLY the right moment.\n` +
          `One mistake = Game Over. Pure skill required.\n\n` +
          (globalStats
            ? `${globalStats.totalPlayers} players competing!\n`
            : "") +
          `Can you achieve perfection?\n\n` +
          `#PerfectTiming #Farcaster`;
      }

      const embeds = [process.env.NEXT_PUBLIC_URL || "http://localhost:3000"];

      const result = await sdk.actions.composeCast({
        text,
        embeds: embeds as [string],
      });

      // Log the share for analytics
      if (user?.fid && score && level) {
        await fetch("/api/farcaster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "share_score",
            fid: user.fid,
            score,
            level,
          }),
        });
      }

      console.log("Score shared successfully:", result);
    } catch (error) {
      console.error("Failed to share score:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddMiniApp = async () => {
    if (!isInMiniApp || !isReady) return;

    setIsAdding(true);
    try {
      await sdk.actions.addMiniApp();
    } catch (error) {
      console.error("Failed to add mini app:", error);
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("InvalidDomainManifestJson")) {
          console.warn(
            "Domain manifest issue - this is expected in development",
          );
        }
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewLeaderboard = async () => {
    if (!isInMiniApp || !isReady) return;

    try {
      // Navigate to leaderboard within the Mini App
      window.location.href = "/leaderboard";
    } catch (error) {
      console.error("Failed to navigate to leaderboard:", error);
    }
  };

  // Don't render if not in Mini App
  if (!isInMiniApp || !isReady) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Share Score Button */}
      <button
        onClick={handleShareScore}
        disabled={isSharing}
        className="w-full btn btn-secondary flex items-center justify-center gap-2"
      >
        {isSharing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
            Sharing...
          </>
        ) : (
          <>📢 {score ? "Share Score" : "Share Game"}</>
        )}
      </button>

      {/* Action buttons row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddMiniApp}
          disabled={isAdding}
          className="btn btn-outline flex items-center justify-center gap-2 text-sm"
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
              Adding...
            </>
          ) : (
            <>➕ Add App</>
          )}
        </button>

        <button
          onClick={handleViewLeaderboard}
          className="btn btn-outline flex items-center justify-center gap-2 text-sm"
        >
          🏆 Rankings
        </button>
      </div>

      {/* Global stats display */}
      {globalStats && (
        <div className="card p-3 text-center">
          <p className="text-xs text-gray-400 mb-2">Global Stats</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="font-bold text-blue-400">
                {globalStats.totalPlayers}
              </p>
              <p className="text-gray-500">Players</p>
            </div>
            <div>
              <p className="font-bold text-green-400">
                {globalStats.highestScore?.toLocaleString()}
              </p>
              <p className="text-gray-500">High Score</p>
            </div>
            <div>
              <p className="font-bold text-purple-400">
                {globalStats.highestLevel}
              </p>
              <p className="text-gray-500">Max Level</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
