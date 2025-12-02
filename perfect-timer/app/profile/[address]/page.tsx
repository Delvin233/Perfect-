"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRankForLevel, getRankColor } from "@/lib/ranks";

interface PlayerData {
  address: string;
  score: number;
  level: number;
  timestamp: number;
  totalAttempts?: number;
  stagesCompleted?: number;
  perfectHits?: number;
  totalHits?: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerData();
  }, [address]);

  const fetchPlayerData = async () => {
    try {
      const response = await fetch(`/api/scores?address=${address}`);
      const data = await response.json();
      if (data.scores && data.scores.length > 0) {
        setPlayer(data.scores[0]);
      }
    } catch (error) {
      console.error("Failed to fetch player data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">Player not found</p>
          <button onClick={() => router.back()} className="btn btn-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const rank = getRankForLevel(player.level);
  const accuracy =
    player.perfectHits && player.totalHits && player.totalHits > 0
      ? Math.round((player.perfectHits / player.totalHits) * 100)
      : 0;
  const stage = Math.ceil(player.level / 10);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Leaderboard
      </button>

      {/* Player Header */}
      <div className="card mb-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{rank.emoji}</div>
          <h1 className={`text-3xl font-bold mb-2 ${getRankColor(rank.tier)}`}>
            {rank.name}
          </h1>
          <p className="text-gray-400 font-mono">
            {player.address.slice(0, 10)}...{player.address.slice(-10)}
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <p className="text-3xl font-bold text-orange-500 mb-1">
              {player.score.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Score</p>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <p className="text-3xl font-bold text-cyan-500 mb-1">
              {player.level}
            </p>
            <p className="text-sm text-gray-400">Highest Level</p>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <p className="text-3xl font-bold text-purple-500 mb-1">{stage}</p>
            <p className="text-sm text-gray-400">Stage Reached</p>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <p className="text-3xl font-bold text-green-500 mb-1">
              {accuracy}%
            </p>
            <p className="text-sm text-gray-400">Perfect Accuracy</p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-red-500">🎮 Game Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Attempts</span>
              <span className="font-bold">{player.totalAttempts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stages Completed</span>
              <span className="font-bold">{player.stagesCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Perfect Hits</span>
              <span className="font-bold">{player.perfectHits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Hits</span>
              <span className="font-bold">{player.totalHits || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-cyan-500">
            📊 Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Rank Tier</span>
              <span className="font-bold">{rank.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Stage</span>
              <span className="font-bold">
                {stage === 1
                  ? "⚡ Learning"
                  : stage === 2
                    ? "🔥 Master"
                    : "💀 Extreme"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Played</span>
              <span className="font-bold">
                {new Date(player.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Score/Attempt</span>
              <span className="font-bold">
                {player.totalAttempts
                  ? Math.round(
                      player.score / player.totalAttempts,
                    ).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">🏆 Stage Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold">Stage 1: Learning</span>
                <span className="text-sm text-gray-400">
                  {player.level >= 10
                    ? "✓ Complete"
                    : `${Math.min(player.level, 10)}/10`}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{
                    width: `${Math.min((player.level / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold">
                  Stage 2: Master Mode
                </span>
                <span className="text-sm text-gray-400">
                  {player.level >= 20
                    ? "✓ Complete"
                    : player.level >= 11
                      ? `${player.level - 10}/10`
                      : "Locked"}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${player.level >= 11 ? Math.min(((player.level - 10) / 10) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">💀</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold">
                  Stage 3: Extreme Mode
                </span>
                <span className="text-sm text-gray-400">
                  {player.level >= 30
                    ? "✓ Complete"
                    : player.level >= 21
                      ? `${player.level - 20}/10`
                      : "Locked"}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${player.level >= 21 ? Math.min(((player.level - 20) / 10) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
