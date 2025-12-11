/**
 * Name Resolution Caching System for Perfect?
 *
 * Implements in-memory caching with TTL management and LRU eviction.
 * Optimizes performance by avoiding repeated API calls for name resolution.
 */

import { NameResolution } from "./nameResolver";

// Cache configuration
interface CacheConfig {
  maxSize: number;
  successTtlMs: number;
  failureTtlMs: number;
}

interface CacheEntry {
  resolution: NameResolution;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntryAge: number;
  memoryUsage: number;
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 1000,
  successTtlMs: 3600000, // 1 hour for successful resolutions
  failureTtlMs: 300000, // 5 minutes for failed resolutions
};

/**
 * LRU Cache for name resolutions with TTL management
 */
export class NameCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get cached name resolution
   */
  get(address: string): NameResolution | null {
    const key = address.toLowerCase();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();

    // Check if entry has expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics for LRU
    entry.accessCount++;
    entry.lastAccessed = now;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.stats.hits++;
    return entry.resolution;
  }

  /**
   * Set cached name resolution
   */
  set(resolution: NameResolution): void {
    const key = resolution.address.toLowerCase();
    const now = Date.now();

    // Determine TTL based on resolution success
    const isSuccess =
      resolution.source !== "wallet" ||
      resolution.name !== this.truncateAddress(resolution.address);
    const ttl = isSuccess ? this.config.successTtlMs : this.config.failureTtlMs;

    const entry: CacheEntry = {
      resolution,
      expiresAt: now + ttl,
      accessCount: 1,
      lastAccessed: now,
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  /**
   * Check if address is cached and valid
   */
  has(address: string): boolean {
    return this.get(address) !== null;
  }

  /**
   * Remove entry from cache
   */
  delete(address: string): boolean {
    const key = address.toLowerCase();
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let oldestAge = 0;
    let memoryUsage = 0;

    for (const entry of this.cache.values()) {
      const age = now - entry.resolution.timestamp;
      if (age > oldestAge) {
        oldestAge = age;
      }

      // Rough memory calculation (address + name + metadata)
      memoryUsage +=
        (entry.resolution.address.length +
          (entry.resolution.name?.length || 0)) *
          2 +
        100;
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntryAge: oldestAge,
      memoryUsage,
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get entries that will expire soon (for proactive refresh)
   */
  getExpiringSoon(withinMs: number = 300000): string[] {
    const now = Date.now();
    const threshold = now + withinMs;
    const expiring: string[] = [];

    for (const [, entry] of this.cache.entries()) {
      if (entry.expiresAt <= threshold && entry.expiresAt > now) {
        expiring.push(entry.resolution.address);
      }
    }

    return expiring;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Helper method to truncate address (for comparison)
   */
  private truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Batch get multiple addresses
   */
  getBatch(addresses: string[]): Map<string, NameResolution> {
    const results = new Map<string, NameResolution>();

    for (const address of addresses) {
      const resolution = this.get(address);
      if (resolution) {
        results.set(address.toLowerCase(), resolution);
      }
    }

    return results;
  }

  /**
   * Batch set multiple resolutions
   */
  setBatch(resolutions: NameResolution[]): void {
    for (const resolution of resolutions) {
      this.set(resolution);
    }
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // If max size was reduced, evict entries
    while (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
  }
}

// Global cache instance
let globalCache: NameCache | null = null;

/**
 * Get or create global cache instance
 */
export function getNameCache(): NameCache {
  if (!globalCache) {
    globalCache = new NameCache();
  }
  return globalCache;
}

/**
 * Initialize cache with custom configuration
 */
export function initializeNameCache(config?: Partial<CacheConfig>): NameCache {
  globalCache = new NameCache(config);
  return globalCache;
}

/**
 * Clear global cache
 */
export function clearGlobalCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
}

/**
 * Get global cache statistics
 */
export function getGlobalCacheStats(): CacheStats | null {
  return globalCache?.getStats() || null;
}
