"use client";

import React from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { getRankForLevel, getRankColor } from "@/lib/ranks";
import { useProgressiveBatchAddressDisplay } from "@/hooks/useMobileOptimization";
import { useHybridLeaderboard } from "@/hooks/useHybridLeaderboard";
import BackButton from "../components/BackButton";
import NameBadge from "../components/NameBadge";
import NetworkIndicator from "../components/NetworkIndicator";

// Interface moved to useHybridLeaderboard hook

export default function LeaderboardPage() {
  const { address } = useAppKitAccount();

  // Use hybrid leaderboard (blockchain + database)
  const { leaderboard, loading, error, dataSource, refetch } =
    useHybridLeaderboard(50);

  // Extract addresses for batch name resolution with mobile optimization
  const addresses = leaderboard.map((score) => score.address);
  const {
    displayNames,
    sources,
    isLoading: namesLoading,
    loadMore,
    hasMore,
    loadedCount,
    totalCount,
  } = useProgressiveBatchAddressDisplay(addresses);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-4">
        <BackButton to="/" />
      </div>
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[var(--color-primary)]">
          🏆 LEADERBOARD
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-2">
          Top players worldwide
        </p>
        <NetworkIndicator />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Loading leaderboard from blockchain...
          </p>
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={refetch} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : namesLoading && leaderboard.length > 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Resolving player names...
          </p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--color-text-secondary)] mb-4">
            No scores yet on this network. Be the first to play!
          </p>
          <a href="/play" className="btn btn-primary inline-block">
            Play Now
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((score) => {
            const isCurrentUser =
              address && score.address.toLowerCase() === address.toLowerCase();
            const rank = score.rank;
            const medal =
              rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

            return (
              <a
                href={`/profile/${score.address}`}
                key={`${score.address}-${score.rank}`}
                className={`card flex items-center justify-between cursor-pointer transition-colors active:scale-[0.98] p-3 sm:p-6 ${
                  isCurrentUser ? "border-[var(--color-primary)]" : ""
                } ${score.level >= 21 ? "border-red-500/50 bg-red-500/5" : ""} ${score.stage >= 3 ? "border-purple-500/50 bg-purple-500/5" : ""}`}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl font-bold text-[var(--color-text-secondary)] w-8 sm:w-12 flex-shrink-0">
                    {medal || `#${rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <p
                        className="font-bold truncate text-sm sm:text-base"
                        title={score.address} // Show full address on hover
                      >
                        {displayNames.get(score.address.toLowerCase()) ||
                          `${score.address.slice(0, 6)}...${score.address.slice(-4)}`}
                      </p>
                      {/* Show name source badge using reusable component */}
                      <NameBadge
                        source={
                          sources.get(score.address.toLowerCase()) || "wallet"
                        }
                      />
                      {isCurrentUser && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded flex-shrink-0">
                          You
                        </span>
                      )}
                      {/* Stage indicators */}
                      {score.stage && score.stage >= 2 && (
                        <span className="text-[10px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          MASTER
                        </span>
                      )}
                      {score.stage && score.stage >= 3 && (
                        <span className="text-[10px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded">
                          EXTREME
                        </span>
                      )}
                      {/* Data source indicator */}
                      {score.source === "blockchain" && (
                        <span className="text-[10px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                          ⛓️
                        </span>
                      )}
                      {score.source === "merged" && (
                        <span className="text-[10px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">
                          🔗
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
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
                      <span className="text-gray-500">
                        • Level {score.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg sm:text-2xl font-bold text-[var(--color-primary)]">
                    {score.score.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                    → View details
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="mt-8 text-center space-y-4">
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="btn btn-secondary"
                disabled={namesLoading}
              >
                {namesLoading
                  ? "Loading names..."
                  : `Load More Names (${loadedCount}/${totalCount})`}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Loading names progressively for better performance
              </p>
            </div>
          )}
          <button
            onClick={refetch}
            className="btn btn-secondary"
            disabled={loading}
          >
            🔄 Refresh Leaderboard
          </button>
          <p className="text-xs text-gray-500">
            {dataSource === "hybrid" &&
              "🔗 Hybrid: Blockchain + Database backup"}
            {dataSource === "blockchain" && "⛓️ Data from smart contract"}
            {dataSource === "database" && "💾 Data from backup database"}
          </p>
        </div>
      )}
    </div>
  );
}
