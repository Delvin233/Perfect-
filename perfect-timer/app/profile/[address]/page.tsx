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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          ></div>
          <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
            Loading player data...
          </p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="card text-center py-12">
          <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Player not found
          </p>
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
        className="mb-4 transition-colors"
        style={{ color: "var(--color-text-secondary)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--color-text)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--color-text-secondary)")
        }
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
          <p
            className="font-mono"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {player.address.slice(0, 10)}...{player.address.slice(-10)}
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="text-center p-4 rounded-lg"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--color-primary)" }}
            >
              {player.score.toLocaleString()}
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Total Score
            </p>
          </div>
          <div
            className="text-center p-4 rounded-lg"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--color-secondary)" }}
            >
              {player.level}
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Highest Level
            </p>
          </div>
          <div
            className="text-center p-4 rounded-lg"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--color-accent)" }}
            >
              {stage}
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Stage Reached
            </p>
          </div>
          <div
            className="text-center p-4 rounded-lg"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--color-primary)" }}
            >
              {accuracy}%
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Perfect Accuracy
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            🎮 Game Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Total Attempts
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {player.totalAttempts || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Stages Completed
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {player.stagesCompleted || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Perfect Hits
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {player.perfectHits || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Total Hits
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {player.totalHits || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: "var(--color-secondary)" }}
          >
            📊 Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Rank Tier
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {rank.tier}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Current Stage
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {stage === 1
                  ? "⚡ Learning"
                  : stage === 2
                    ? "🔥 Master"
                    : "💀 Extreme"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Last Played
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {new Date(player.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Avg Score/Attempt
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--color-text)" }}
              >
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
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          🏆 Stage Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Stage 1: Learning
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {player.level >= 10
                    ? "✓ Complete"
                    : `${Math.min(player.level, 10)}/10`}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-card-bg)" }}
              >
                <div
                  className="h-full"
                  style={{
                    backgroundColor: "var(--color-stage-1)",
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
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Stage 2: Master Mode
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {player.level >= 20
                    ? "✓ Complete"
                    : player.level >= 11
                      ? `${player.level - 10}/10`
                      : "Locked"}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-card-bg)" }}
              >
                <div
                  className="h-full"
                  style={{
                    backgroundColor: "var(--color-stage-2)",
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
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Stage 3: Extreme Mode
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {player.level >= 30
                    ? "✓ Complete"
                    : player.level >= 21
                      ? `${player.level - 20}/10`
                      : "Locked"}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--color-card-bg)" }}
              >
                <div
                  className="h-full"
                  style={{
                    backgroundColor: "var(--color-stage-3)",
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
