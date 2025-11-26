"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

interface Score {
  address: string;
  score: number;
  level: number;
  timestamp: number;
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
      const response = await fetch('/api/scores');
      const data = await response.json();
      setScores(data.scores || []);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
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
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading scores...</p>
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
            const isCurrentUser = address && score.address.toLowerCase() === address.toLowerCase();
            const rank = index + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

            return (
              <div
                key={`${score.address}-${score.timestamp}`}
                className={`card flex items-center justify-between ${
                  isCurrentUser ? "border-[var(--color-primary)]" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-[var(--color-text-secondary)] w-12">
                    {medal || `#${rank}`}
                  </span>
                  <div>
                    <p className="font-bold">
                      {score.address.slice(0, 6)}...{score.address.slice(-4)}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-[var(--color-primary)]">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Level {score.level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--color-primary)]">
                    {score.score}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && scores.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={fetchScores}
            className="btn btn-secondary"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}
