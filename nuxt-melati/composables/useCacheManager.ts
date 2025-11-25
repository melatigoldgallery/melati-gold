/**
 * Composable untuk Cache Management
 * Implementasi caching dengan localStorage + memory cache
 * Cache strategy: Cache-First dengan TTL (Time To Live)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  useMemoryCache?: boolean; // Use memory cache for faster access
  useLocalStorage?: boolean; // Persist to localStorage
}

// Memory cache (runtime only, faster)
const memoryCache = new Map<string, CacheEntry<any>>();

export const useCacheManager = () => {
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate unique cache key
   */
  const generateKey = (prefix: string, params?: Record<string, any>): string => {
    if (!params) return prefix;
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  };

  /**
   * Check if cache is valid (not expired)
   */
  const isValid = <T>(entry: CacheEntry<T> | null): boolean => {
    if (!entry) return false;
    const now = Date.now();
    return now - entry.timestamp < entry.expiresIn;
  };

  /**
   * Get from memory cache
   */
  const getFromMemory = <T>(key: string): T | null => {
    const entry = memoryCache.get(key);
    if (entry && isValid(entry)) {
      return entry.data as T;
    }
    // Remove expired entry
    if (entry) memoryCache.delete(key);
    return null;
  };

  /**
   * Get from localStorage
   */
  const getFromLocalStorage = <T>(key: string): T | null => {
    if (!process.client) return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      if (isValid(entry)) {
        return entry.data;
      }
      // Remove expired entry
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  };

  /**
   * Set to memory cache
   */
  const setToMemory = <T>(key: string, data: T, ttl: number): void => {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  };

  /**
   * Set to localStorage
   */
  const setToLocalStorage = <T>(key: string, data: T, ttl: number): void => {
    if (!process.client) return;
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: ttl,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  /**
   * Get cached data
   */
  const get = <T>(key: string, options: CacheOptions = {}): T | null => {
    const { useMemoryCache = true, useLocalStorage = true } = options;

    // Try memory cache first (fastest)
    if (useMemoryCache) {
      const memoryData = getFromMemory<T>(key);
      if (memoryData !== null) {
        return memoryData;
      }
    }

    // Try localStorage
    if (useLocalStorage) {
      const localData = getFromLocalStorage<T>(key);
      if (localData !== null) {
        // Populate memory cache for next access
        if (useMemoryCache) {
          setToMemory(key, localData, options.ttl || DEFAULT_TTL);
        }
        return localData;
      }
    }

    return null;
  };

  /**
   * Set cached data
   */
  const set = <T>(key: string, data: T, options: CacheOptions = {}): void => {
    const {
      ttl = DEFAULT_TTL,
      useMemoryCache = true,
      useLocalStorage = true,
    } = options;

    if (useMemoryCache) {
      setToMemory(key, data, ttl);
    }

    if (useLocalStorage) {
      setToLocalStorage(key, data, ttl);
    }
  };

  /**
   * Remove specific cache entry
   */
  const remove = (key: string): void => {
    memoryCache.delete(key);
    if (process.client) {
      localStorage.removeItem(key);
    }
  };

  /**
   * Clear all cache with specific prefix
   */
  const clearPrefix = (prefix: string): void => {
    // Clear memory cache
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }

    // Clear localStorage
    if (process.client) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Clear all cache
   */
  const clearAll = (): void => {
    memoryCache.clear();
    if (process.client) {
      localStorage.clear();
    }
  };

  /**
   * Get cache stats
   */
  const getStats = () => {
    const memorySize = memoryCache.size;
    const localStorageSize = process.client ? Object.keys(localStorage).length : 0;

    return {
      memory: {
        entries: memorySize,
        keys: Array.from(memoryCache.keys()),
      },
      localStorage: {
        entries: localStorageSize,
      },
    };
  };

  /**
   * Wrapper untuk fetch dengan cache
   * Cache-First strategy: Cek cache dulu, kalau tidak ada baru fetch
   */
  const fetchWithCache = async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    // Try cache first
    const cached = get<T>(key, options);
    if (cached !== null) {
      return cached;
    }
    const data = await fetchFn();

    // Store in cache
    set(key, data, options);

    return data;
  };

  return {
    generateKey,
    get,
    set,
    remove,
    clearPrefix,
    clearAll,
    getStats,
    fetchWithCache,
  };
};
