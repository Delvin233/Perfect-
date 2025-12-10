"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { getRankForLevel } from "@/lib/ranks";
import EnhancedMainMenu from "./components/EnhancedMainMenu";
import EnhancedLoadingScreen from "./components/EnhancedLoadingScreen";
import AttractMode from "./components/AttractMode";

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

interface Score {
  address: string;
  score: number;
  level: number;
}

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [leaderboardScores, setLeaderboardScores] = useState<Score[]>([]);
  const [showAttractMode, setShowAttractMode] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/scores");
      const data = await response.json();
      setLeaderboardScores(data.scores || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

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

  // Fetch leaderboard on component mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (address) {
      setShowAttractMode(false);
      setShowLoading(true);
      fetchUserStats();
    } else {
      setLoading(false);
      setShowMenu(false);
      setShowAttractMode(true);
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

  const handleAttractModeExit = () => {
    setShowAttractMode(false);
    // The wallet connection will be handled by the AttractMode component
  };

  // Show loading screen when connecting
  if (showLoading && !loading) {
    return <EnhancedLoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show main menu when connected and loaded
  if (isConnected && showMenu && stats) {
    return (
      <EnhancedMainMenu userStats={stats} onDisconnect={handleDisconnect} />
    );
  }

  // Show attract mode when not connected
  if (!isConnected && showAttractMode) {
    return (
      <AttractMode
        onExit={handleAttractModeExit}
        leaderboardScores={leaderboardScores}
      />
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
