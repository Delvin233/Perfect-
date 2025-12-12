/**
 * WebSocket Name Resolution Hooks
 *
 * Uses WebSocket RPC calls to Alchemy for faster name resolution
 * Falls back to HTTP API when WebSocket is unavailable
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWebSocketRPC, isWebSocketRPCAvailable } from "@/lib/webSocketRPC";
import { getNameConfig } from "@/lib/nameConfig";

/**
 * Hook for WebSocket RPC connection management
 */
export function useWebSocketConnection() {
  const [mainnetStatus, setMainnetStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    available: false,
  });
  const [baseStatus, setBaseStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    available: false,
  });

  useEffect(() => {
    if (!isWebSocketRPCAvailable()) {
      return;
    }

    const mainnetClient = getWebSocketRPC("mainnet");
    const baseClient = getWebSocketRPC("base");

    if (!mainnetClient || !baseClient) {
      return;
    }

    // Set up event listeners
    const updateMainnetStatus = () => {
      const status = mainnetClient.getStatus();
      setMainnetStatus({
        connected: status.connected,
        reconnectAttempts: status.reconnectAttempts,
        available: true,
      });
    };

    const updateBaseStatus = () => {
      const status = baseClient.getStatus();
      setBaseStatus({
        connected: status.connected,
        reconnectAttempts: status.reconnectAttempts,
        available: true,
      });
    };

    mainnetClient.on("connected", updateMainnetStatus);
    mainnetClient.on("disconnected", updateMainnetStatus);
    mainnetClient.on("error", updateMainnetStatus);

    baseClient.on("connected", updateBaseStatus);
    baseClient.on("disconnected", updateBaseStatus);
    baseClient.on("error", updateBaseStatus);

    // Initial connection attempts
    mainnetClient.connect().catch(console.warn);
    baseClient.connect().catch(console.warn);

    // Update status periodically
    const interval = setInterval(() => {
      updateMainnetStatus();
      updateBaseStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
      mainnetClient.disconnect();
      baseClient.disconnect();
    };
  }, []);

  const reconnect = useCallback(() => {
    if (!isWebSocketRPCAvailable()) return;

    const mainnetClient = getWebSocketRPC("mainnet");
    const baseClient = getWebSocketRPC("base");

    mainnetClient?.connect().catch(console.warn);
    baseClient?.connect().catch(console.warn);
  }, []);

  return {
    mainnet: mainnetStatus,
    base: baseStatus,
    reconnect,
    available: isWebSocketRPCAvailable(),
  };
}

/**
 * Hook for single address name resolution with WebSocket RPC
 */
export function useWebSocketAddressDisplay(address: string | null | undefined) {
  const config = getNameConfig();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ws-address-display", address, config],
    queryFn: async () => {
      if (!address) {
        return {
          name: "Unknown",
          source: "wallet" as const,
        };
      }

      // If name resolution is disabled, return truncated address
      if (!config.nameResolutionEnabled) {
        return {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: "wallet" as const,
        };
      }

      // Try WebSocket RPC first if available
      if (isWebSocketRPCAvailable()) {
        try {
          // Try ENS via WebSocket (mainnet)
          if (config.ensEnabled) {
            const mainnetClient = getWebSocketRPC("mainnet");
            if (mainnetClient) {
              const ensName = await mainnetClient.resolveENS(address);
              if (ensName) {
                return {
                  name: ensName,
                  source: "ens" as const,
                };
              }
            }
          }

          // Try Base names via WebSocket
          if (config.baseNamesEnabled) {
            const baseClient = getWebSocketRPC("base");
            if (baseClient) {
              // For now, Base name resolution via WebSocket is not implemented
              // Fall through to HTTP API
            }
          }
        } catch (error) {
          console.warn(
            "WebSocket name resolution failed, falling back to HTTP:",
            error,
          );
        }
      }

      // Fallback to HTTP API
      const params = new URLSearchParams({
        address,
        ensEnabled: config.ensEnabled.toString(),
        baseNamesEnabled: config.baseNamesEnabled.toString(),
      });

      try {
        const response = await fetch(`/api/resolve-name?${params}`);
        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();
        return {
          name: data.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: data.source || "wallet",
        };
      } catch (error) {
        console.warn("Name resolution failed:", error);
        return {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: "wallet" as const,
        };
      }
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    displayName:
      data?.name ||
      (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown"),
    source: data?.source || "wallet",
    isLoading,
    error,
    wsAvailable: isWebSocketRPCAvailable(),
  };
}

/**
 * Hook for batch address resolution with WebSocket RPC
 */
export function useWebSocketBatchAddressDisplay(addresses: string[]) {
  const config = getNameConfig();

  // Memoize unique addresses
  const uniqueAddresses = useState(() => {
    return Array.from(new Set(addresses.filter(Boolean)));
  })[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ["ws-batch-address-display", uniqueAddresses, config],
    queryFn: async () => {
      if (uniqueAddresses.length === 0) {
        return { results: {} };
      }

      // For batch resolution, use HTTP API for now
      // WebSocket batch resolution can be added later if needed
      try {
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
          throw new Error("Batch API request failed");
        }

        const data = await response.json();
        return { results: data.results || {} };
      } catch (error) {
        console.warn("Batch name resolution failed:", error);

        // Fallback to truncated addresses
        const fallbackResults: Record<
          string,
          { name: string; source: string }
        > = {};
        uniqueAddresses.forEach((address) => {
          fallbackResults[address.toLowerCase()] = {
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            source: "wallet",
          };
        });

        return { results: fallbackResults };
      }
    },
    enabled: uniqueAddresses.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Process results into Maps for easy lookup
  const displayNames = useState(() => new Map<string, string>())[0];
  const sources = useState(() => new Map<string, string>())[0];

  useEffect(() => {
    displayNames.clear();
    sources.clear();

    if (data?.results) {
      Object.entries(data.results).forEach(([address, result]) => {
        const typedResult = result as { name: string; source: string };
        displayNames.set(
          address,
          typedResult.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
        );
        sources.set(address, typedResult.source);
      });
    }

    // Add fallbacks for missing addresses
    uniqueAddresses.forEach((address) => {
      const key = address.toLowerCase();
      if (!displayNames.has(key)) {
        displayNames.set(key, `${address.slice(0, 6)}...${address.slice(-4)}`);
        sources.set(key, "wallet");
      }
    });
  }, [data, uniqueAddresses, displayNames, sources]);

  return {
    displayNames,
    sources: sources as Map<string, "ens" | "basename" | "wallet">,
    isLoading,
    error,
    wsAvailable: isWebSocketRPCAvailable(),
  };
}
