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
          <p className="text-xl text-gray-400 mb-8">
            Stop the timer at the perfect moment to progress through levels
          </p>

          <button
            onClick={() => open()}
            className="btn btn-primary text-xl mb-12"
          >
            Sign In
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="card">
              <LuClock1 className="text-4xl mb-2 text-red-500" />
              <h3 className="text-lg font-bold mb-2">Precision Timing</h3>
              <p className="text-sm text-gray-400">
                Test your reflexes with millisecond accuracy
              </p>
            </div>

            <div className="card">
              <SiProgress className="text-4xl mb-2 text-cyan-500" />
              <h3 className="text-lg font-bold mb-2">Progressive Levels</h3>
              <p className="text-sm text-gray-400">
                Each level gets harder with tighter timing windows
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
