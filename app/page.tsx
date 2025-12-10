"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { LuClock1 } from "react-icons/lu";
import { SiProgress } from "react-icons/si";
import { FaRankingStar } from "react-icons/fa6";
import { getRankForLevel } from "@/lib/ranks";
import MainMenu from "./components/MainMenu";
import LoadingScreen from "./components/LoadingScreen";

interface UserStats {
  address: string;
  totalGames: number;
  highestLevel: number;
  bestScore: number;
  averageScore: number;
  highScore: number;
  rank: string;
  perfectHits: number;
  totalHits: number;
}

interface ScoreData {
  level: number;
  score: number;
}

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const { open, disconnect } = useAppKit();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchUserStats = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/scores?address=${address}`);
      const data = await response.json();

      const scores: ScoreData[] = data.scores || [];
      const totalGames = scores.length;
      const highestLevel = Math.max(...scores.map((s) => s.level), 0);
      const bestScore = Math.max(...scores.map((s) => s.score), 0);
      const averageScore =
        totalGames > 0
          ? Math.round(
              scores.reduce((sum: number, s) => sum + s.score, 0) / totalGames,
            )
          : 0;

      const rank = getRankForLevel(highestLevel);

      setStats({
        address,
        totalGames,
        highestLevel,
        bestScore,
        averageScore,
        highScore: bestScore,
        rank: rank.name,
        perfectHits: 0, // TODO: Track this in database
        totalHits: 0, // TODO: Track this in database
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      setShowLoading(true);
      fetchUserStats();
    } else {
      setLoading(false);
      setShowMenu(false);
    }
  }, [address, fetchUserStats]);

  // Show menu after loading completes
  useEffect(() => {
    if (!loading && isConnected && !showMenu) {
      // Loading screen will call this after its duration
      setShowMenu(true);
    }
  }, [loading, isConnected, showMenu]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowMenu(true);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
    setStats(null);
  };

  // Show loading screen when connecting
  if (showLoading && !loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show main menu when connected and loaded
  if (isConnected && showMenu && stats) {
    return <MainMenu userStats={stats} onDisconnect={handleDisconnect} />;
  }

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl animate-fade-in px-4">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            PERFECT?
          </h1>
          <p
            className="text-base sm:text-xl mb-4 px-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Stop the timer at the perfect moment to progress through levels
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
            <span className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold">
              ⚡ 3 Stages
            </span>
            <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
              🔥 30 Levels
            </span>
            <span className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-semibold">
              💀 One Life
            </span>
          </div>

          <button
            onClick={() => open()}
            className="btn btn-primary text-lg sm:text-xl mb-8 sm:mb-12 active:scale-95"
          >
            Sign In
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left mb-6 sm:mb-8">
            <div className="card p-4 sm:p-6">
              <LuClock1 className="text-3xl sm:text-4xl mb-2 text-red-500" />
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Precision Timing</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Test your reflexes with millisecond accuracy
              </p>
            </div>

            <div className="card p-4 sm:p-6">
              <SiProgress className="text-3xl sm:text-4xl mb-2 text-cyan-500" />
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Progressive Difficulty</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Each stage gets harder with tighter timing windows
              </p>
            </div>

            <div className="card p-4 sm:p-6">
              <FaRankingStar className="text-3xl sm:text-4xl mb-2 text-orange-500" />
              <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Global Leaderboard</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Compete with players worldwide for the top spot
              </p>
            </div>
          </div>

          {/* Difficulty Progression */}
          <div className="card max-w-2xl mx-auto p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">
              How Hard Is It?
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <span className="text-xl sm:text-2xl flex-shrink-0">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-cyan-400 text-sm sm:text-base">Stage 1: Learning</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Levels 1-10 • Target: 5.000s • Tolerance: 50ms → 10ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-xl sm:text-2xl flex-shrink-0">🔥</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-purple-400 text-sm sm:text-base">
                    Stage 2: Master Mode
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Levels 11-20 • Random targets • Tolerance: ±8ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <span className="text-xl sm:text-2xl flex-shrink-0">💀</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-red-400 text-sm sm:text-base">
                    Stage 3: Extreme Mode
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Levels 21-30 • New random targets • Tolerance: ±5ms
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
              One mistake = Start over from Level 1
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          YOUR STATS
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          ></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="card text-center p-4 sm:p-6">
            <p
              className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              {stats?.totalGames || 0}
            </p>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Total Games
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <p
              className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2"
              style={{ color: "var(--color-secondary)" }}
            >
              {stats?.highestLevel || 0}
            </p>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Highest Level
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <p
              className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2"
              style={{ color: "var(--color-accent)" }}
            >
              {stats?.bestScore || 0}
            </p>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Best Score
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <p
              className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              {stats?.averageScore || 0}
            </p>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Avg Score
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
