/**
 * Name Preloader Hook for Perfect?
 *
 * Provides intelligent preloading of address names to improve performance
 * and reduce loading states for users.
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useNamePreloader() {
  const queryClient = useQueryClient();

  /**
   * Preload a single address name
   */
  const preloadAddress = useCallback(
    async (address: string) => {
      if (!address) return;

      // Check if already cached
      const existingData = queryClient.getQueryData([
        "address-display",
        address,
      ]);
      if (existingData) return;

      // Prefetch the data
      await queryClient.prefetchQuery({
        queryKey: ["address-display", address],
        queryFn: async () => {
          const response = await fetch(`/api/resolve-name?address=${address}`);
          if (!response.ok) {
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      });
    },
    [queryClient],
  );

  /**
   * Preload multiple addresses using batch API
   */
  const preloadAddresses = useCallback(
    async (addresses: string[]) => {
      if (addresses.length === 0) return;

      // Filter out addresses that are already cached
      const uncachedAddresses = addresses.filter((address) => {
        const existingData = queryClient.getQueryData([
          "address-display",
          address,
        ]);
        return !existingData;
      });

      if (uncachedAddresses.length === 0) return;

      // Use batch API for efficiency
      try {
        const response = await fetch("/api/batch-resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: uncachedAddresses,
          }),
        });

        if (!response.ok) return;

        const data = await response.json();

        // Cache individual results
        Object.entries(data.results || {}).forEach(([address, result]) => {
          const typedResult = result as { name: string | null; source: string };
          queryClient.setQueryData(["address-display", address], {
            name:
              typedResult.name ||
              `${address.slice(0, 6)}...${address.slice(-4)}`,
            source: typedResult.source || "wallet",
          });
        });
      } catch (error) {
        console.warn("Failed to preload addresses:", error);
      }
    },
    [queryClient],
  );

  /**
   * Preload leaderboard addresses (common use case)
   */
  const preloadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/scores");
      const data = await response.json();
      const addresses = (data.scores || []).map(
        (score: { address: string }) => score.address,
      );

      if (addresses.length > 0) {
        await preloadAddresses(addresses);
      }
    } catch (error) {
      console.warn("Failed to preload leaderboard addresses:", error);
    }
  }, [preloadAddresses]);

  /**
   * Smart preloading based on user navigation patterns
   */
  const smartPreload = useCallback(
    async (currentPage: string) => {
      switch (currentPage) {
        case "/":
          // On home page, preload leaderboard addresses
          await preloadLeaderboard();
          break;

        case "/leaderboard":
          // Already handled by the leaderboard component
          break;

        case "/play":
          // Could preload user's own address for post-game display
          break;

        default:
          break;
      }
    },
    [preloadLeaderboard],
  );

  return {
    preloadAddress,
    preloadAddresses,
    preloadLeaderboard,
    smartPreload,
  };
}

/**
 * Hook for request deduplication
 * Prevents multiple identical requests from being made simultaneously
 */
export function useRequestDeduplication() {
  const queryClient = useQueryClient();

  const deduplicateRequest = useCallback(
    async (
      queryKey: string[],
      queryFn: () => Promise<unknown>,
      options: {
        staleTime?: number;
        gcTime?: number;
      } = {},
    ) => {
      // Check if request is already in flight
      const queryState = queryClient.getQueryState(queryKey);
      if (queryState?.fetchStatus === "fetching") {
        // Wait for existing request to complete
        return queryClient.getQueryData(queryKey);
      }

      // Check if we have fresh cached data
      const cachedData = queryClient.getQueryData(queryKey);
      if (cachedData && queryState?.dataUpdatedAt) {
        const age = Date.now() - queryState.dataUpdatedAt;
        const staleTime = options.staleTime || 5 * 60 * 1000; // 5 minutes default

        if (age < staleTime) {
          return cachedData;
        }
      }

      // Execute the request
      return queryClient.fetchQuery({
        queryKey,
        queryFn,
        staleTime: options.staleTime || 5 * 60 * 1000,
        gcTime: options.gcTime || 10 * 60 * 1000,
      });
    },
    [queryClient],
  );

  return { deduplicateRequest };
}
