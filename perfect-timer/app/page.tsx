"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { LuClock1 } from "react-icons/lu";
import { SiProgress } from "react-icons/si";
import { FaRankingStar } from "react-icons/fa6";

interface UserStats {
  totalGames: number;
  highestLevel: number;
  bestScore: number;
  averageScore: number;
}

interface ScoreData {
  level: number;
  score: number;
}

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

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

      setStats({ totalGames, highestLevel, bestScore, averageScore });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchUserStats();
    } else {
      setLoading(false);
    }
  }, [address, fetchUserStats]);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl animate-fade-in px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-red-500">
            PERFECT?
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Stop the timer at the perfect moment to progress through levels
          </p>
          <div className="flex items-center justify-center gap-4 mb-8 text-sm">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold">
              ⚡ 3 Stages
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
              🔥 30 Levels
            </span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-semibold">
              💀 One Life
            </span>
          </div>

          <button
            onClick={() => open()}
            className="btn btn-primary text-xl mb-12"
          >
            Sign In
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
            <div className="card">
              <LuClock1 className="text-4xl mb-2 text-red-500" />
              <h3 className="text-lg font-bold mb-2">Precision Timing</h3>
              <p className="text-sm text-gray-400">
                Test your reflexes with millisecond accuracy
              </p>
            </div>

            <div className="card">
              <SiProgress className="text-4xl mb-2 text-cyan-500" />
              <h3 className="text-lg font-bold mb-2">Progressive Difficulty</h3>
              <p className="text-sm text-gray-400">
                Each stage gets harder with tighter timing windows
              </p>
            </div>

            <div className="card">
              <FaRankingStar className="text-4xl mb-2 text-orange-500" />
              <h3 className="text-lg font-bold mb-2">Global Leaderboard</h3>
              <p className="text-sm text-gray-400">
                Compete with players worldwide for the top spot
              </p>
            </div>
          </div>

          {/* Difficulty Progression */}
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">
              How Hard Is It?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <p className="font-bold text-cyan-400">Stage 1: Learning</p>
                  <p className="text-xs text-gray-400">
                    Levels 1-10 • Target: 5.000s • Tolerance: 50ms → 10ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-2xl">🔥</span>
                <div className="flex-1">
                  <p className="font-bold text-purple-400">
                    Stage 2: Master Mode
                  </p>
                  <p className="text-xs text-gray-400">
                    Levels 11-20 • Random targets • Tolerance: ±8ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <span className="text-2xl">💀</span>
                <div className="flex-1">
                  <p className="font-bold text-red-400">
                    Stage 3: Extreme Mode
                  </p>
                  <p className="text-xs text-gray-400">
                    Levels 21-30 • New random targets • Tolerance: ±5ms
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              One mistake = Start over from Level 1
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-red-500">YOUR STATS</h1>
        {address && (
          <p className="text-gray-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-4xl font-bold text-red-500 mb-2">
              {stats?.totalGames || 0}
            </p>
            <p className="text-sm text-gray-400">Total Games</p>
          </div>

          <div className="card text-center">
            <p className="text-4xl font-bold text-cyan-500 mb-2">
              {stats?.highestLevel || 0}
            </p>
            <p className="text-sm text-gray-400">Highest Level</p>
          </div>

          <div className="card text-center">
            <p className="text-4xl font-bold text-orange-500 mb-2">
              {stats?.bestScore || 0}
            </p>
            <p className="text-sm text-gray-400">Best Score</p>
          </div>

          <div className="card text-center">
            <p className="text-4xl font-bold text-green-500 mb-2">
              {stats?.averageScore || 0}
            </p>
            <p className="text-sm text-gray-400">Avg Score</p>
          </div>
        </div>
      )}
    </div>
  );
}
