/**
 * Simple in-memory caching layer with TTL support
 *
 * This cache helps reduce N+1 queries by storing frequently accessed data
 * like widget configurations and merchant profiles.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
  hits: number
  misses: number
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.miss(key)
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.miss(key)
      return null
    }

    entry.hits++
    return entry.value
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (uses default if not provided)
   */
  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
      hits: 0,
      misses: 0,
    })
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    let deleted = 0
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalHits = 0
    let totalMisses = 0

    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      totalMisses += entry.misses
    }

    const total = totalHits + totalMisses

    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: total > 0 ? totalHits / total : 0,
      size: this.cache.size,
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let deleted = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  private miss(key: string): void {
    // Track miss for stats
    const entry = this.cache.get(key)
    if (entry) {
      entry.misses++
    }
  }
}

/**
 * Pre-configured cache instances for different use cases
 */

// Widget config cache - 5 minute TTL, high hit rate expected
export const widgetConfigCache = new Cache<any>(5 * 60 * 1000)

// Merchant profile cache - 10 minute TTL
export const merchantProfileCache = new Cache<any>(10 * 60 * 1000)

// Product rules cache - 10 minute TTL
export const productRulesCache = new Cache<any>(10 * 60 * 1000)

// Product details cache - 2 minute TTL (changes more frequently)
export const productDetailsCache = new Cache<any>(2 * 60 * 1000)

/**
 * Cleanup task - run periodically to remove expired entries
 */
let cleanupInterval: NodeJS.Timeout | null = null

export function startCacheCleanup(intervalMs: number = 60 * 1000): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  cleanupInterval = setInterval(() => {
    const widgetCleaned = widgetConfigCache.cleanup()
    const merchantCleaned = merchantProfileCache.cleanup()
    const rulesCleaned = productRulesCache.cleanup()
    const productsCleaned = productDetailsCache.cleanup()

    const total = widgetCleaned + merchantCleaned + rulesCleaned + productsCleaned
    if (total > 0) {
      console.log(`[cache] Cleaned up ${total} expired entries`)
    }
  }, intervalMs)
}

export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

/**
 * Get all cache statistics
 */
export function getAllCacheStats(): Record<string, CacheStats> {
  return {
    widgetConfig: widgetConfigCache.getStats(),
    merchantProfile: merchantProfileCache.getStats(),
    productRules: productRulesCache.getStats(),
    productDetails: productDetailsCache.getStats(),
  }
}
