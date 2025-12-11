"use client";

import { useQuery } from "@tanstack/react-query";

export interface UseAddressDisplayReturn {
  displayName: string;
  source: "ens" | "basename" | "wallet";
  isLoading: boolean;
}

/**
 * Hook for resolving any address (not just current user)
 * Optimized for leaderboards, profiles, and match history
 */
export function useAddressDisplay(
  address: string | null | undefined,
): UseAddressDisplayReturn {
  const { data, isLoading } = useQuery({
    queryKey: ["address-display", address],
    queryFn: async () => {
      if (!address) {
        return {
          name: "Unknown",
          source: "wallet" as const,
        };
      }

      const response = await fetch(`/api/resolve-name?address=${address}`);
      if (!response.ok) {
        // Fallback to truncated address on API error
        return {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: "wallet" as const,
        };
      }

      const data = await response.json();
      return {
        name: data.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
        source: data.source || "wallet",
      };
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes (longer for non-current user)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Less aggressive retry for non-critical addresses
  });

  // Handle null/undefined addresses
  if (!address) {
    return {
      displayName: "Unknown",
      source: "wallet",
      isLoading: false,
    };
  }

  return {
    displayName: data?.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
    source: data?.source || "wallet",
    isLoading,
  };
}
