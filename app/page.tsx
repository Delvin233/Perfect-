"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { getRankForLevel } from "@/lib/ranks";
import { useFarcaster } from "./context/FarcasterProvider";
import EnhancedMainMenu from "./components/EnhancedMainMenu";
import EnhancedLoadingScreen from "./components/EnhancedLoadingScreen";
import AttractMode from "./components/AttractMode";
import FarcasterActions from "./components/FarcasterActions";
import FarcasterProfile from "./components/FarcasterProfile";

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
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isInMiniApp, isReady: farcasterReady } = useFarcaster();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAttractMode, setShowAttractMode] = useState(true);

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
    // If in Farcaster Mini App, skip attract mode and go straight to game
    if (isInMiniApp && farcasterReady) {
      setShowAttractMode(false);
      if (address) {
        setShowLoading(true);
        fetchUserStats();
      } else {
        // In Mini App but no wallet connected - show menu anyway
        setLoading(false);
        setShowMenu(true);
      }
    } else if (address) {
      setShowAttractMode(false);
      setShowLoading(true);
      fetchUserStats();
    } else {
      setLoading(false);
      setShowMenu(false);
      setShowAttractMode(true);
    }
  }, [address, fetchUserStats, isInMiniApp, farcasterReady]);

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

  // Fallback to attract mode if user doesn't connect
  useEffect(() => {
    if (!isConnected && !showAttractMode && !showLoading) {
      // If user is not connected and not on attract mode, return to attract mode after delay
      const timeoutId = setTimeout(() => {
        setShowAttractMode(true);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, showAttractMode, showLoading]);

  // Show loading screen when connecting
  if (showLoading && !loading) {
    return <EnhancedLoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show main menu when connected and loaded
  if (isConnected && showMenu && stats) {
    return (
      <>
        <FarcasterProfile />
        <EnhancedMainMenu userStats={stats} onDisconnect={handleDisconnect} />
      </>
    );
  }

  // Show main menu for Farcaster users without wallet connection
  if (isInMiniApp && showMenu && !isConnected) {
    return (
      <>
        <FarcasterProfile />
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              PERFECT?
            </h1>
            <p
              className="text-lg sm:text-xl"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Precision Timing Game
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="card text-center p-6">
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "var(--color-primary)" }}
              >
                🎯 Play Now
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Start playing immediately in Farcaster
              </p>
              <a href="/play" className="btn btn-primary w-full">
                Start Game
              </a>
            </div>

            <div className="card text-center p-6">
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "var(--color-secondary)" }}
              >
                🏆 Leaderboard
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                See top players worldwide
              </p>
              <a href="/leaderboard" className="btn btn-secondary w-full">
                View Rankings
              </a>
            </div>
          </div>

          <div className="card p-6 text-center">
            <h3 className="text-lg font-bold mb-2">
              💡 Connect Wallet for More
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Connect your wallet to save scores and compete on the global
              leaderboard
            </p>
            <button onClick={() => open()} className="btn btn-outline">
              Connect Wallet
            </button>
          </div>

          <FarcasterActions />
        </div>
      </>
    );
  }

  // Show attract mode when not connected
  if (!isConnected && showAttractMode) {
    return <AttractMode onExit={handleAttractModeExit} />;
  }

  // Show blank page when waiting for wallet connection
  if (!isConnected && !showAttractMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent mb-4"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          ></div>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Connecting wallet...
          </p>
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
