/**
 * CacheManager - Smart caching system for API responses
 * Reduces API calls by storing and reusing frequently accessed data
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // Maximum number of cached items
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes default TTL
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    cached.lastAccessed = Date.now();
    return cached.data;
  }

  /**
   * Store data in cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    // Clean up if cache is too large
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup();
    }

    const cacheItem = {
      data,
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now(),
      createdAt: Date.now()
    };

    this.cache.set(key, cacheItem);
  }

  /**
   * Remove expired items and least recently used items
   */
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired items
    entries.forEach(([key, item]) => {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove LRU items
    if (this.cache.size >= this.maxCacheSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const itemsToRemove = sortedEntries.slice(0, Math.floor(this.maxCacheSize * 0.3));
      itemsToRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      totalItems: this.cache.size,
      validItems: entries.filter(item => now <= item.expiresAt).length,
      expiredItems: entries.filter(item => now > item.expiresAt).length,
      oldestItem: entries.length > 0 ? Math.min(...entries.map(item => item.createdAt)) : null,
      newestItem: entries.length > 0 ? Math.max(...entries.map(item => item.createdAt)) : null
    };
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }
}

// Cache instances for different data types
export const recipeCache = new CacheManager();
export const searchCache = new CacheManager();
export const featuredCache = new CacheManager();

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  SEARCH_RESULTS: 15 * 60 * 1000,    // 15 minutes
  RECIPE_DETAILS: 60 * 60 * 1000,    // 1 hour
  FEATURED_RECIPES: 30 * 60 * 1000,  // 30 minutes
  RANDOM_RECIPES: 10 * 60 * 1000,    // 10 minutes
  CATEGORY_RESULTS: 20 * 60 * 1000   // 20 minutes
};

export default CacheManager;