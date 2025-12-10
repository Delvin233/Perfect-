"use client";

import { getRankForLevel, getRankColor, getRankBgColor } from "@/lib/ranks";

interface UserStats {
  address: string;
  highScore: number;
  highestLevel: number;
  rank: string;
  totalGames: number;
  perfectHits: number;
  totalHits: number;
}

interface StatsPanelProps {
  stats: UserStats | null;
  compact?: boolean;
}

export default function StatsPanel({
  stats,
  compact = false,
}: StatsPanelProps) {
  if (!stats) {
    return (
      <div className={`${compact ? "p-4" : "p-6"} card`}>
        <p className="text-sm text-gray-500 text-center">No stats yet</p>
      </div>
    );
  }

  const rank = getRankForLevel(stats.highestLevel);
  const stage = Math.ceil(stats.highestLevel / 10);
  const perfectRatio =
    stats.totalHits > 0
      ? Math.round((stats.perfectHits / stats.totalHits) * 100)
      : 0;

  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">High Score</span>
          <span className="text-xl font-bold text-orange-500">
            {stats.highScore.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Best Level</span>
          <span
            className="text-lg font-bold"
            style={{ color: "var(--color-secondary)" }}
          >
            Level {stats.highestLevel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Rank</span>
          <div className="flex items-center gap-1">
            <span className="text-lg">{rank.emoji}</span>
            <span className={`text-sm font-bold ${getRankColor(rank.tier)}`}>
              {rank.name}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <h3
        className="text-sm font-bold text-center mb-3"
        style={{ color: "var(--color-primary)" }}
      >
        YOUR STATS
      </h3>

      {/* High Score */}
      <div className="text-center pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">HIGH SCORE</p>
        <p className="text-2xl font-bold text-orange-500">
          {stats.highScore.toLocaleString()}
        </p>
      </div>

      {/* Best Level */}
      <div className="text-center pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">BEST LEVEL</p>
        <p
          className="text-lg font-bold"
          style={{ color: "var(--color-secondary)" }}
        >
          Level {stats.highestLevel}
        </p>
        <p className="text-xs text-gray-500">
          Stage {stage} • {((stats.highestLevel - 1) % 10) + 1}/10
        </p>
      </div>

      {/* Rank */}
      <div className="text-center pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">RANK</p>
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-xl">{rank.emoji}</span>
          <span className={`text-sm font-bold ${getRankColor(rank.tier)}`}>
            {rank.name}
          </span>
        </div>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRankBgColor(rank.tier)} ${getRankColor(rank.tier)}`}
        >
          {rank.tier}
        </span>
      </div>

      {/* Total Games */}
      <div className="text-center pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">TOTAL GAMES</p>
        <p
          className="text-lg font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          {stats.totalGames}
        </p>
      </div>

      {/* Perfect Hits */}
      <div className="text-center pb-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 mb-1">PERFECT HITS</p>
        <p className="text-sm font-bold text-green-500">
          {stats.perfectHits}/{stats.totalHits}
        </p>
        <p className="text-xs text-gray-500">{perfectRatio}% accuracy</p>
      </div>

      {/* Stages Completed */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 mb-1">STAGES COMPLETED</p>
        <div className="flex justify-center gap-1">
          <span
            className={`text-lg ${stage >= 1 ? "opacity-100" : "opacity-30"}`}
          >
            ⚡
          </span>
          <span
            className={`text-lg ${stage >= 2 ? "opacity-100" : "opacity-30"}`}
          >
            🔥
          </span>
          <span
            className={`text-lg ${stage >= 3 ? "opacity-100" : "opacity-30"}`}
          >
            💀
          </span>
        </div>
      </div>
    </div>
  );
}
