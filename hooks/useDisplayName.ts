"use client";

import { useQuery } from "@tanstack/react-query";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

export interface UseDisplayNameReturn {
  displayName: string;
  hasEns: boolean;
  ensType: "mainnet" | "basename" | null;
  fullAddress: string | undefined;
  isLoading: boolean;
}

/**
 * Primary hook for resolving the current user's display name
 * Integrates with wagmi for ENS and uses API for Base names
 */
export function useDisplayName(
  address: string | undefined,
): UseDisplayNameReturn {
  // Get ENS name using wagmi (fastest, cached by wagmi)
  const { data: mainnetEns, isLoading: ensLoading } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id,
  });

  // Get Base name and other resolution via API
  const { data: apiData, isLoading: apiLoading } = useQuery({
    queryKey: ["resolve-name", address],
    queryFn: async () => {
      if (!address) return { name: null, source: null };

      const response = await fetch(`/api/resolve-name?address=${address}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        name: data.name || null,
        source: data.source || null,
        cached: data.cached || false,
      };
    },
    enabled: !!address,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Determine display name with priority: ENS > API result > truncated address
  const getDisplayName = (): string => {
    if (!address) return "";

    // Priority 1: Mainnet ENS (from wagmi)
    if (mainnetEns) {
      return mainnetEns;
    }

    // Priority 2: API result (Base name or fallback)
    if (apiData?.name) {
      return apiData.name;
    }

    // Priority 3: Truncated address fallback
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Determine ENS type
  const getEnsType = (): "mainnet" | "basename" | null => {
    if (mainnetEns) return "mainnet";
    if (apiData?.source === "basename") return "basename";
    return null;
  };

  // Check if we have any resolved name (not just truncated address)
  const hasResolvedName =
    mainnetEns || (apiData?.source && apiData.source !== "wallet");

  return {
    displayName: getDisplayName(),
    hasEns: hasResolvedName,
    ensType: getEnsType(),
    fullAddress: address,
    isLoading: ensLoading || apiLoading,
  };
}
