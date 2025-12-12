import { useState, useEffect, useCallback } from "react";
import { useLeaderboard } from "./useContract";

interface LeaderboardEntry {
  address: string;
  score: number;
  level: number;
  stage?: number;
  rank: number;
  source: "blockchain" | "database" | "merged";
}

interface BlockchainEntry {
  address: string;
  score: number;
  level: number;
  stage: number;
  rank: number;
}

interface DatabaseEntry {
  address: string;
  score: number;
  level: number;
}

export function useHybridLeaderboard(count: number = 50) {
  const [hybridLeaderboard, setHybridLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<
    "blockchain" | "database" | "hybrid"
  >("hybrid");

  // Get blockchain data
  const {
    leaderboard: blockchainData,
    loading: blockchainLoading,
    error: blockchainError,
    refetch: refetchBlockchain,
  } = useLeaderboard(count);

  // Fetch database data
  const fetchDatabaseData = async () => {
    try {
      const response = await fetch("/api/scores");
      const data = await response.json();
      return data.scores || [];
    } catch (error) {
      console.error("Failed to fetch database scores:", error);
      return [];
    }
  };

  const mergeLeaderboards = (
    blockchainScores: BlockchainEntry[],
    databaseScores: DatabaseEntry[],
  ) => {
    // Create a map to track the highest score per address
    const scoreMap = new Map<string, LeaderboardEntry>();

    // Add blockchain scores (primary source)
    blockchainScores.forEach((entry, index) => {
      scoreMap.set(entry.address.toLowerCase(), {
        address: entry.address,
        score: entry.score,
        level: entry.level,
        stage: entry.stage,
        rank: index + 1,
        source: "blockchain",
      });
    });

    // Add database scores (only if not in blockchain or if higher score)
    databaseScores.forEach((entry) => {
      const existing = scoreMap.get(entry.address.toLowerCase());
      if (!existing || entry.score > existing.score) {
        scoreMap.set(entry.address.toLowerCase(), {
          address: entry.address,
          score: entry.score,
          level: entry.level,
          stage: Math.ceil(entry.level / 10),
          rank: 0, // Will be recalculated
          source: existing ? "merged" : "database",
        });
      }
    });

    // Convert to array and sort by score
    const merged = Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return merged;
  };

  const fetchHybridData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch database data
      const databaseData = await fetchDatabaseData();

      // Use blockchain data if available, otherwise database only
      if (blockchainData.length > 0) {
        const merged = mergeLeaderboards(
          blockchainData as BlockchainEntry[],
          databaseData as DatabaseEntry[],
        );
        setHybridLeaderboard(merged);
        setDataSource("hybrid");
      } else if (databaseData.length > 0) {
        // Format database data to match our interface
        const formatted = (databaseData as DatabaseEntry[])
          .slice(0, count)
          .map((entry, index: number) => ({
            address: entry.address,
            score: entry.score,
            level: entry.level,
            stage: Math.ceil(entry.level / 10),
            rank: index + 1,
            source: "database" as const,
          }));
        setHybridLeaderboard(formatted);
        setDataSource("database");
      } else {
        setHybridLeaderboard([]);
        setDataSource("hybrid");
      }
    } catch (err) {
      console.error("Error fetching hybrid leaderboard:", err);
      setError("Failed to fetch leaderboard data");
    } finally {
      setLoading(false);
    }
  }, [blockchainData, count]);

  // Fetch data when blockchain data changes or on mount
  useEffect(() => {
    fetchHybridData();
  }, [fetchHybridData]);

  const refetch = async () => {
    await Promise.all([refetchBlockchain(), fetchHybridData()]);
  };

  return {
    leaderboard: hybridLeaderboard,
    loading: loading || blockchainLoading,
    error: error || blockchainError,
    dataSource,
    refetch,
  };
}
