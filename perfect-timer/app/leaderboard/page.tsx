"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { getRankForLevel, getRankColor } from "@/lib/ranks";

interface Score {
  address: string;
  score: number;
  level: number;
  timestamp: number;
  totalAttempts?: number;
  stagesCompleted?: number;
  perfectHits?: number;
  totalHits?: number;
}

export default function LeaderboardPage() {
  const { address } = useAppKitAccount();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch("/api/scores");
      const data = await response.json();
      setScores(data.scores || []);
    } catch (error) {
      console.error("Failed to fetch scores:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[var(--color-primary)]">
          🏆 LEADERBOARD
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Top players worldwide
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Loading scores...
          </p>
        </div>
      ) : scores.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--color-text-secondary)] mb-4">
            No scores yet. Be the first to play!
          </p>
          <a href="/play" className="btn btn-primary inline-block">
            Play Now
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {scores.map((score, index) => {
            const isCurrentUser =
              address && score.address.toLowerCase() === address.toLowerCase();
            const rank = index + 1;
            const medal =
              rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

            return (
              <a
                href={`/profile/${score.address}`}
                key={`${score.address}-${score.timestamp}`}
                className={`card flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                  isCurrentUser ? "border-[var(--color-primary)]" : ""
                } ${score.level >= 21 ? "border-red-500/50 bg-red-500/5" : ""}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-2xl font-bold text-[var(--color-text-secondary)] w-12 flex-shrink-0">
                    {medal || `#${rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold truncate">
                        {score.address.slice(0, 6)}...{score.address.slice(-4)}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs">
                        {getRankForLevel(score.level).emoji}
                      </span>
                      <span
                        className={getRankColor(
                          getRankForLevel(score.level).tier,
                        )}
                      >
                        {getRankForLevel(score.level).name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-[var(--color-primary)]">
                    {score.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">→ View details</p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && scores.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={fetchScores} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}
