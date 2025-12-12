"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getNameConfig } from "@/lib/nameConfig";

export interface UseBatchAddressDisplayReturn {
  displayNames: Map<string, string>;
  sources: Map<string, "ens" | "basename" | "wallet">;
  isLoading: boolean;
}

/**
 * Hook for resolving multiple addresses efficiently
 * Optimized for leaderboards and lists with many addresses
 */
export function useBatchAddressDisplay(
  addresses: string[],
): UseBatchAddressDisplayReturn {
  // Get user configuration
  const config = getNameConfig();

  // Memoize unique addresses to avoid unnecessary re-queries
  const uniqueAddresses = useMemo(() => {
    const unique = Array.from(new Set(addresses.filter(Boolean)));
    return unique;
  }, [addresses]);

  const { data, isLoading } = useQuery({
    queryKey: ["batch-address-display", uniqueAddresses, config],
    queryFn: async () => {
      if (uniqueAddresses.length === 0) {
        return { results: {} };
      }

      // Use batch API for efficiency with configuration
      const response = await fetch("/api/batch-resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addresses: uniqueAddresses,
          ensEnabled: config.ensEnabled && config.nameResolutionEnabled,
          baseNamesEnabled:
            config.baseNamesEnabled && config.nameResolutionEnabled,
        }),
      });

      if (!response.ok) {
        // Fallback to individual truncated addresses on API error
        const fallbackResults: Record<
          string,
          { name: string; source: "wallet" }
        > = {};
        uniqueAddresses.forEach((address) => {
          fallbackResults[address.toLowerCase()] = {
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            source: "wallet",
          };
        });
        return { results: fallbackResults };
      }

      const data = await response.json();
      return data;
    },
    enabled: uniqueAddresses.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Process results into Maps for easy lookup
  const displayNames = useMemo(() => {
    const names = new Map<string, string>();

    if (data?.results) {
      Object.entries(data.results).forEach(([address, result]) => {
        const typedResult = result as { name: string | null; source: string };
        names.set(
          address,
          typedResult.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
        );
      });
    }

    // Add fallbacks for any missing addresses
    uniqueAddresses.forEach((address) => {
      const key = address.toLowerCase();
      if (!names.has(key)) {
        names.set(key, `${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    });

    return names;
  }, [data?.results, uniqueAddresses]);

  const sources = useMemo(() => {
    const sourcesMap = new Map<string, "ens" | "basename" | "wallet">();

    if (data?.results) {
      Object.entries(data.results).forEach(([address, result]) => {
        const typedResult = result as { source: "ens" | "basename" | "wallet" };
        sourcesMap.set(address, typedResult.source || "wallet");
      });
    }

    // Add fallbacks for any missing addresses
    uniqueAddresses.forEach((address) => {
      const key = address.toLowerCase();
      if (!sourcesMap.has(key)) {
        sourcesMap.set(key, "wallet");
      }
    });

    return sourcesMap;
  }, [data?.results, uniqueAddresses]);

  return {
    displayNames,
    sources,
    isLoading,
  };
}

/**
 * Helper hook for getting a single address from batch results
 * Useful when you have batch data but need individual access
 */
export function useAddressFromBatch(
  address: string | null | undefined,
  batchResult: UseBatchAddressDisplayReturn,
): UseAddressDisplayReturn {
  const displayName = useMemo(() => {
    if (!address) return "Unknown";

    const key = address.toLowerCase();
    return (
      batchResult.displayNames.get(key) ||
      `${address.slice(0, 6)}...${address.slice(-4)}`
    );
  }, [address, batchResult.displayNames]);

  const source = useMemo(() => {
    if (!address) return "wallet" as const;

    const key = address.toLowerCase();
    return batchResult.sources.get(key) || "wallet";
  }, [address, batchResult.sources]);

  return {
    displayName,
    source,
    isLoading: batchResult.isLoading,
  };
}

// Re-export the interface for convenience
export interface UseAddressDisplayReturn {
  displayName: string;
  source: "ens" | "basename" | "wallet";
  isLoading: boolean;
}
