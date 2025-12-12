/**
 * Offline Mode Detection and Handling for Perfect?
 *
 * Provides utilities for detecting offline state and gracefully
 * handling name resolution when network is unavailable.
 */

export interface OfflineConfig {
  enableOfflineMode: boolean;
  offlineCacheDuration: number; // How long to use cached data when offline (ms)
  fallbackToTruncated: boolean; // Whether to show truncated addresses when offline
}

export const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  enableOfflineMode: true,
  offlineCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  fallbackToTruncated: true,
};

/**
 * Offline state manager
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private listeners: Set<(online: boolean) => void> = new Set();
  private config: OfflineConfig;

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config };
    this.setupEventListeners();
    this.isOnline = navigator.onLine;
  }

  static getInstance(config?: Partial<OfflineConfig>): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager(config);
    }
    return OfflineManager.instance;
  }

  /**
   * Set up browser event listeners for online/offline detection
   */
  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Additional connectivity check using fetch
    this.startConnectivityCheck();
  }

  /**
   * Periodic connectivity check using a lightweight request
   */
  private startConnectivityCheck(): void {
    setInterval(async () => {
      if (!navigator.onLine) {
        this.isOnline = false;
        return;
      }

      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        });

        const wasOnline = this.isOnline;
        this.isOnline = response.ok;

        if (wasOnline !== this.isOnline) {
          this.notifyListeners(this.isOnline);
        }
      } catch {
        const wasOnline = this.isOnline;
        this.isOnline = false;

        if (wasOnline !== this.isOnline) {
          this.notifyListeners(this.isOnline);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Notify all listeners of connectivity changes
   */
  private notifyListeners(online: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(online);
      } catch (error) {
        console.warn("Error in offline listener:", error);
      }
    });
  }

  /**
   * Add a listener for connectivity changes
   */
  addListener(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if currently online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get offline configuration
   */
  getConfig(): OfflineConfig {
    return { ...this.config };
  }

  /**
   * Update offline configuration
   */
  updateConfig(newConfig: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * React hook for offline state
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [offlineManager] = React.useState(() => OfflineManager.getInstance());

  React.useEffect(() => {
    setIsOnline(offlineManager.getOnlineStatus());

    const unsubscribe = offlineManager.addListener(setIsOnline);
    return unsubscribe;
  }, [offlineManager]);

  return {
    isOnline,
    isOffline: !isOnline,
    config: offlineManager.getConfig(),
  };
}

/**
 * Offline-aware cache utility
 */
export class OfflineCache {
  private static readonly OFFLINE_CACHE_KEY = "perfect-offline-name-cache";

  /**
   * Store data for offline use
   */
  static store(key: string, data: unknown, ttl?: number): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getCache();
      const expiresAt = ttl
        ? Date.now() + ttl
        : Date.now() + DEFAULT_OFFLINE_CONFIG.offlineCacheDuration;

      cache[key] = {
        data,
        timestamp: Date.now(),
        expiresAt,
      };

      localStorage.setItem(this.OFFLINE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to store offline cache:", error);
    }
  }

  /**
   * Retrieve data from offline cache
   */
  static retrieve<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const cache = this.getCache();
      const entry = cache[key];

      if (!entry) return null;

      // Check if entry has expired
      if (Date.now() > entry.expiresAt) {
        delete cache[key];
        localStorage.setItem(this.OFFLINE_CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.warn("Failed to retrieve from offline cache:", error);
      return null;
    }
  }

  /**
   * Clear expired entries from cache
   */
  static cleanup(): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getCache();
      const now = Date.now();
      let hasChanges = false;

      for (const [key, entry] of Object.entries(cache)) {
        if (now > entry.expiresAt) {
          delete cache[key];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(this.OFFLINE_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.warn("Failed to cleanup offline cache:", error);
    }
  }

  /**
   * Get the entire cache object
   */
  private static getCache(): Record<
    string,
    { data: unknown; timestamp: number; expiresAt: number }
  > {
    try {
      const cached = localStorage.getItem(this.OFFLINE_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn("Failed to parse offline cache:", error);
      return {};
    }
  }

  /**
   * Clear all offline cache
   */
  static clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.OFFLINE_CACHE_KEY);
    } catch (error) {
      console.warn("Failed to clear offline cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    entries: number;
    totalSize: number;
    oldestEntry: number | null;
  } {
    const cache = this.getCache();
    const entries = Object.keys(cache).length;

    let totalSize = 0;
    let oldestEntry: number | null = null;

    for (const entry of Object.values(cache)) {
      totalSize += JSON.stringify(entry).length;
      if (oldestEntry === null || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
    }

    return { entries, totalSize, oldestEntry };
  }
}

/**
 * User-friendly error messages for offline scenarios
 */
export const OFFLINE_MESSAGES = {
  NO_CONNECTION:
    "You're currently offline. Showing cached names when available.",
  PARTIAL_DATA:
    "Limited connectivity detected. Some names may not be up to date.",
  CACHE_EXPIRED:
    "Offline cache has expired. Connect to the internet to refresh names.",
  FALLBACK_MODE: "Using simplified address display due to connectivity issues.",
} as const;

/**
 * Utility to get appropriate error message based on offline state
 */
export function getOfflineMessage(
  isOnline: boolean,
  hasCachedData: boolean,
  cacheExpired: boolean,
): string | null {
  if (isOnline) return null;

  if (cacheExpired) {
    return OFFLINE_MESSAGES.CACHE_EXPIRED;
  }

  if (hasCachedData) {
    return OFFLINE_MESSAGES.NO_CONNECTION;
  }

  return OFFLINE_MESSAGES.FALLBACK_MODE;
}
