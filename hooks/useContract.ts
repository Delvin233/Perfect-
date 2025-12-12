import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import {
  PERFECT_LEADERBOARD_ABI,
  getContractAddress,
  getNetworkFromChainId,
  formatPlayerStats,
  formatLeaderboardData,
} from "@/lib/contracts";

// Hook for reading player statistics
export function usePlayerStats(playerAddress?: string) {
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!playerAddress || !publicClient) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const network = getNetworkFromChainId(chainId);
        const contractAddress = getContractAddress(network);

        const result = await publicClient.readContract({
          address: contractAddress,
          abi: PERFECT_LEADERBOARD_ABI,
          functionName: "getPlayerStats",
          args: [playerAddress as `0x${string}`],
        });

        setStats(formatPlayerStats(result));
      } catch (err) {
        console.error("Error fetching player stats:", err);
        setError("Failed to fetch player statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerAddress, chainId, publicClient]);

  return { stats, loading, error, refetch: () => {} };
}

// Hook for reading leaderboard data
export function useLeaderboard(count: number = 10) {
  const [leaderboard, setLeaderboard] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const network = getNetworkFromChainId(chainId);
        const contractAddress = getContractAddress(network);

        const result = await publicClient.readContract({
          address: contractAddress,
          abi: PERFECT_LEADERBOARD_ABI,
          functionName: "getTopPlayers",
          args: [BigInt(count)],
        });

        setLeaderboard(formatLeaderboardData(result));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [count, chainId, publicClient]);

  const refetch = async () => {
    if (!publicClient) return;

    setLoading(true);
    try {
      const network = getNetworkFromChainId(chainId);
      const contractAddress = getContractAddress(network);

      const result = await publicClient.readContract({
        address: contractAddress,
        abi: PERFECT_LEADERBOARD_ABI,
        functionName: "getTopPlayers",
        args: [BigInt(count)],
      });

      setLeaderboard(formatLeaderboardData(result));
    } catch (err) {
      console.error("Error refetching leaderboard:", err);
      setError("Failed to refresh leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return { leaderboard, loading, error, refetch };
}

// Hook for submitting scores
export function useSubmitScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const submitScore = async (
    score: number,
    level: number,
    perfectHits: number,
    totalHits: number,
    longestStreak: number,
    continuesUsed: number = 0,
  ) => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      const network = getNetworkFromChainId(chainId);
      const contractAddress = getContractAddress(network);

      // Get submission fee (if enabled)
      // For now, we'll submit without fee - fees can be enabled later
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: PERFECT_LEADERBOARD_ABI,
        functionName: "submitScore",
        args: [
          BigInt(score), // uint128 requires bigint
          level, // uint16 can be number
          perfectHits, // uint16 can be number
          totalHits, // uint16 can be number
          longestStreak, // uint16 can be number
          continuesUsed, // uint8 can be number
        ],
        value: BigInt(0), // No fee for now
      });

      return hash;
    } catch (err) {
      console.error("Error submitting score:", err);
      setError("Failed to submit score");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitScore, loading, error };
}

// Hook for purchasing continues
export function usePurchaseContinue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const purchaseContinue = async (currentLevel: number) => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      const network = getNetworkFromChainId(chainId);
      const contractAddress = getContractAddress(network);

      // Continue fee: 0.001 ETH on Base, 0.0001 ETH on Celo
      const continueFee =
        network === "celo" ? "100000000000000" : "1000000000000000"; // Wei

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: PERFECT_LEADERBOARD_ABI,
        functionName: "purchaseContinue",
        args: [currentLevel],
        value: BigInt(continueFee),
      });

      return hash;
    } catch (err) {
      console.error("Error purchasing continue:", err);
      setError("Failed to purchase continue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { purchaseContinue, loading, error };
}

// Hook for getting game statistics
export function useGameStats() {
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const network = getNetworkFromChainId(chainId);
        const contractAddress = getContractAddress(network);

        const result = await publicClient.readContract({
          address: contractAddress,
          abi: PERFECT_LEADERBOARD_ABI,
          functionName: "getGameStats",
          args: [],
        });

        setStats({
          totalPlayers: Number(result[0]),
          totalGames: Number(result[1]),
          stage1Completors: Number(result[2]),
          stage2Completors: Number(result[3]),
          stage3Completors: Number(result[4]),
          totalRevenue: result[5].toString(),
          network: result[6],
          chainId: Number(result[7]),
        });
      } catch (err) {
        console.error("Error fetching game stats:", err);
        setError("Failed to fetch game statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [chainId, publicClient]);

  return { stats, loading, error };
}
