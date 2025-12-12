import { createPublicClient, http } from "viem";
import { base, celo } from "viem/chains";

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  base: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_BASE as `0x${string}`,
  celo: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_CELO as `0x${string}`,
} as const;

// Network configurations
export const NETWORKS = {
  base: {
    chain: base,
    rpcUrl: "https://mainnet.base.org",
    contractAddress: CONTRACT_ADDRESSES.base,
  },
  celo: {
    chain: celo,
    rpcUrl: "https://forno.celo.org",
    contractAddress: CONTRACT_ADDRESSES.celo,
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Contract ABI (essential functions only)
export const PERFECT_LEADERBOARD_ABI = [
  // Read functions
  {
    inputs: [{ name: "_player", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      {
        components: [
          { name: "highScore", type: "uint128" },
          { name: "highestLevel", type: "uint32" },
          { name: "totalGames", type: "uint32" },
          { name: "perfectHits", type: "uint32" },
          { name: "totalHits", type: "uint32" },
          { name: "firstPlayedTimestamp", type: "uint32" },
          { name: "lastPlayedTimestamp", type: "uint32" },
          { name: "longestStreak", type: "uint16" },
          { name: "stagesCompleted", type: "uint8" },
          { name: "achievements", type: "uint8" },
          { name: "isActive", type: "bool" },
        ],
        name: "stats",
        type: "tuple",
      },
      { name: "accuracyPercentage", type: "uint256" },
      { name: "averageScore", type: "uint256" },
      { name: "unlockedAchievements", type: "uint8[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_count", type: "uint256" }],
    name: "getTopPlayers",
    outputs: [
      { name: "addresses", type: "address[]" },
      { name: "scores", type: "uint128[]" },
      { name: "levels", type: "uint16[]" },
      { name: "stages", type: "uint8[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameStats",
    outputs: [
      { name: "totalPlayers", type: "uint32" },
      { name: "totalGames", type: "uint32" },
      { name: "stage1Completors", type: "uint32" },
      { name: "stage2Completors", type: "uint32" },
      { name: "stage3Completors", type: "uint32" },
      { name: "totalRevenueAmount", type: "uint256" },
      { name: "network", type: "string" },
      { name: "networkChainId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_player", type: "address" }],
    name: "getPlayerRank",
    outputs: [{ name: "rank", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "_score", type: "uint128" },
      { name: "_level", type: "uint16" },
      { name: "_perfectHits", type: "uint16" },
      { name: "_totalHits", type: "uint16" },
      { name: "_longestStreak", type: "uint16" },
      { name: "_continuesUsed", type: "uint8" },
    ],
    name: "submitScore",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_currentLevel", type: "uint16" }],
    name: "purchaseContinue",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "player", type: "address" },
      { indexed: false, name: "score", type: "uint128" },
      { indexed: false, name: "level", type: "uint16" },
      { indexed: false, name: "perfectHits", type: "uint16" },
      { indexed: false, name: "totalHits", type: "uint16" },
      { indexed: false, name: "stageReached", type: "uint8" },
      { indexed: false, name: "continuesUsed", type: "uint8" },
    ],
    name: "ScoreSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "player", type: "address" },
      { indexed: false, name: "newScore", type: "uint128" },
      { indexed: false, name: "previousScore", type: "uint128" },
      { indexed: false, name: "level", type: "uint16" },
    ],
    name: "NewHighScore",
    type: "event",
  },
] as const;

// Create public client for reading contract data
export function createContractPublicClient(network: NetworkName) {
  const config = NETWORKS[network];
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

// Get contract address for current network
export function getContractAddress(network: NetworkName): `0x${string}` {
  const address = NETWORKS[network].contractAddress;
  if (!address) {
    throw new Error(`Contract address not found for network: ${network}`);
  }
  return address;
}

// Helper to determine which network to use based on chain ID
export function getNetworkFromChainId(chainId: number): NetworkName {
  switch (chainId) {
    case base.id:
      return "base";
    case celo.id:
      return "celo";
    default:
      return "base"; // Default to Base mainnet
  }
}

// Helper to format contract data
export function formatPlayerStats(stats: unknown) {
  const typedStats = stats as {
    stats: {
      highScore: bigint;
      highestLevel: number;
      totalGames: number;
      perfectHits: number;
      totalHits: number;
      firstPlayedTimestamp: number;
      lastPlayedTimestamp: number;
      longestStreak: number;
      stagesCompleted: number;
      achievements: number;
      isActive: boolean;
    };
    accuracyPercentage: bigint;
    averageScore: bigint;
    unlockedAchievements: number[];
  };

  return {
    highScore: Number(typedStats.stats.highScore),
    highestLevel: Number(typedStats.stats.highestLevel),
    totalGames: Number(typedStats.stats.totalGames),
    perfectHits: Number(typedStats.stats.perfectHits),
    totalHits: Number(typedStats.stats.totalHits),
    firstPlayedTimestamp: Number(typedStats.stats.firstPlayedTimestamp),
    lastPlayedTimestamp: Number(typedStats.stats.lastPlayedTimestamp),
    longestStreak: Number(typedStats.stats.longestStreak),
    stagesCompleted: Number(typedStats.stats.stagesCompleted),
    achievements: Number(typedStats.stats.achievements),
    isActive: typedStats.stats.isActive,
    accuracyPercentage: Number(typedStats.accuracyPercentage),
    averageScore: Number(typedStats.averageScore),
    unlockedAchievements: typedStats.unlockedAchievements.map(Number),
  };
}

export function formatLeaderboardData(data: unknown) {
  // Handle undefined or null data
  if (!data) {
    return [];
  }

  const typedData = data as {
    addresses: string[];
    scores: bigint[];
    levels: number[];
    stages: number[];
  };

  // Handle case where addresses array is undefined
  if (!typedData.addresses || !Array.isArray(typedData.addresses)) {
    return [];
  }

  return typedData.addresses.map((address: string, index: number) => ({
    address,
    score: Number(typedData.scores[index]),
    level: Number(typedData.levels[index]),
    stage: Number(typedData.stages[index]),
    rank: index + 1,
  }));
}
