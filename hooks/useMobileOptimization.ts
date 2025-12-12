/**
 * Mobile Performance Optimization Hook for Perfect?
 *
 * Provides mobile-specific optimizations for name resolution
 * including reduced batch sizes and progressive loading.
 */

import { useState, useEffect, useMemo } from "react";
import { useBatchAddressDisplay } from "./useBatchAddressDisplay";

interface MobileOptimizationConfig {
  maxBatchSize: number;
  progressiveLoadingThreshold: number;
  connectionQuality: "slow" | "fast" | "unknown";
}

/**
 * Detect connection quality and device capabilities
 */
function useConnectionQuality(): "slow" | "fast" | "unknown" {
  const [quality, setQuality] = useState<"slow" | "fast" | "unknown">(
    "unknown",
  );

  useEffect(() => {
    // Check if we're on mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Check connection if available
    interface NavigatorWithConnection extends Navigator {
      connection?: { effectiveType: string; downlink: number };
      mozConnection?: { effectiveType: string; downlink: number };
      webkitConnection?: { effectiveType: string; downlink: number };
    }

    const nav = navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;

      // Determine quality based on connection info
      if (effectiveType === "4g" && downlink > 2) {
        setQuality("fast");
      } else if (
        effectiveType === "3g" ||
        effectiveType === "2g" ||
        downlink < 1
      ) {
        setQuality("slow");
      } else {
        setQuality(isMobile ? "slow" : "fast");
      }
    } else {
      // Fallback: assume mobile is slower
      setQuality(isMobile ? "slow" : "fast");
    }
  }, []);

  return quality;
}

/**
 * Get mobile optimization configuration
 */
function useMobileConfig(): MobileOptimizationConfig {
  const connectionQuality = useConnectionQuality();

  return useMemo(() => {
    switch (connectionQuality) {
      case "slow":
        return {
          maxBatchSize: 10, // Smaller batches for slow connections
          progressiveLoadingThreshold: 5,
          connectionQuality,
        };
      case "fast":
        return {
          maxBatchSize: 50, // Full batches for fast connections
          progressiveLoadingThreshold: 20,
          connectionQuality,
        };
      default:
        return {
          maxBatchSize: 25, // Conservative default
          progressiveLoadingThreshold: 10,
          connectionQuality,
        };
    }
  }, [connectionQuality]);
}

/**
 * Progressive batch address display hook
 * Loads addresses in chunks for better mobile performance
 */
export function useProgressiveBatchAddressDisplay(addresses: string[]) {
  const config = useMobileConfig();
  const [loadedCount, setLoadedCount] = useState(
    config.progressiveLoadingThreshold,
  );

  // Determine how many addresses to load initially
  const addressesToLoad = useMemo(() => {
    if (addresses.length <= config.progressiveLoadingThreshold) {
      return addresses;
    }
    return addresses.slice(0, loadedCount);
  }, [addresses, loadedCount, config.progressiveLoadingThreshold]);

  // Use the regular batch hook with limited addresses
  const batchResult = useBatchAddressDisplay(addressesToLoad);

  // Function to load more addresses
  const loadMore = () => {
    const nextCount = Math.min(
      loadedCount + config.progressiveLoadingThreshold,
      addresses.length,
    );
    setLoadedCount(nextCount);
  };

  // Check if there are more addresses to load
  const hasMore = loadedCount < addresses.length;

  // Auto-load more when scrolling near the end (for leaderboards)
  const shouldAutoLoad = !batchResult.isLoading && hasMore;

  return {
    ...batchResult,
    loadMore,
    hasMore,
    shouldAutoLoad,
    loadedCount,
    totalCount: addresses.length,
    config,
  };
}

/**
 * Optimized batch hook that automatically adjusts batch size based on device
 */
export function useOptimizedBatchAddressDisplay(addresses: string[]) {
  const config = useMobileConfig();

  // Split addresses into smaller batches if needed
  const batches = useMemo(() => {
    if (addresses.length <= config.maxBatchSize) {
      return [addresses];
    }

    const chunks: string[][] = [];
    for (let i = 0; i < addresses.length; i += config.maxBatchSize) {
      chunks.push(addresses.slice(i, i + config.maxBatchSize));
    }
    return chunks;
  }, [addresses, config.maxBatchSize]);

  // For now, just use the first batch (could be extended to load multiple batches)
  const firstBatch = batches[0] || [];
  const batchResult = useBatchAddressDisplay(firstBatch);

  return {
    ...batchResult,
    totalBatches: batches.length,
    currentBatch: 1,
    config,
  };
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      // Check if performance.memory is available (Chrome)
      const memory = (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const percentage = (used / total) * 100;

        setMemoryInfo({
          used: Math.round(used / 1024 / 1024), // MB
          total: Math.round(total / 1024 / 1024), // MB
          percentage: Math.round(percentage),
        });
      }
    };

    // Update immediately
    updateMemoryInfo();

    // Update every 30 seconds
    const interval = setInterval(updateMemoryInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Performance monitoring hook for name resolution
 */
export function useNameResolutionPerformance() {
  const [metrics, setMetrics] = useState({
    averageResponseTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    failedRequests: 0,
  });

  const recordRequest = (
    responseTime: number,
    fromCache: boolean,
    failed: boolean = false,
  ) => {
    setMetrics((prev) => {
      const newTotal = prev.totalRequests + 1;
      const newFailed = prev.failedRequests + (failed ? 1 : 0);
      const _newCacheHits = fromCache ? 1 : 0;

      // Calculate running average
      const newAverage =
        (prev.averageResponseTime * prev.totalRequests + responseTime) /
        newTotal;

      // Calculate cache hit rate (simplified)
      const newCacheHitRate = fromCache
        ? (prev.cacheHitRate * prev.totalRequests + 100) / newTotal
        : (prev.cacheHitRate * prev.totalRequests) / newTotal;

      return {
        averageResponseTime: Math.round(newAverage),
        cacheHitRate: Math.round(newCacheHitRate),
        totalRequests: newTotal,
        failedRequests: newFailed,
      };
    });
  };

  return {
    metrics,
    recordRequest,
  };
}
