/**
 * Performance Optimization & Caching Layer
 * 
 * Query optimization, data caching, and lazy loading utilities.
 * Improves dashboard performance and reduces API calls.
 * 
 * Super-Sprint 20: Phases 1901-1950
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
    createdAt: number;
    accessCount: number;
    lastAccessedAt: number;
}

interface CacheConfig {
    maxSize: number;
    defaultTTL: number; // milliseconds
    cleanupInterval: number;
}

/**
 * In-memory cache with LRU eviction
 */
class MemoryCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private config: CacheConfig;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize || 1000,
            defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
            cleanupInterval: config.cleanupInterval || 60 * 1000, // 1 minute
        };

        this.startCleanup();
    }

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check expiration
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Update access stats
        entry.accessCount++;
        entry.lastAccessedAt = Date.now();

        return entry.data as T;
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        // Evict if at capacity
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU();
        }

        const now = Date.now();
        this.cache.set(key, {
            data,
            expiresAt: now + (ttl || this.config.defaultTTL),
            createdAt: now,
            accessCount: 0,
            lastAccessedAt: now,
        });
    }

    /**
     * Delete item from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all items matching prefix
     */
    invalidatePrefix(prefix: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        oldestEntry: number | null;
    } {
        let totalAccess = 0;
        let oldestEntry: number | null = null;

        for (const entry of this.cache.values()) {
            totalAccess += entry.accessCount;
            if (oldestEntry === null || entry.createdAt < oldestEntry) {
                oldestEntry = entry.createdAt;
            }
        }

        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            hitRate: totalAccess > 0 ? totalAccess / (totalAccess + this.cache.size) : 0,
            oldestEntry,
        };
    }

    /**
     * Evict least recently used entry
     */
    private evictLRU(): void {
        let lruKey: string | null = null;
        let lruTime = Infinity;

        for (const [key, entry] of this.cache) {
            if (entry.lastAccessedAt < lruTime) {
                lruTime = entry.lastAccessedAt;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
        }
    }

    /**
     * Start cleanup timer
     */
    private startCleanup(): void {
        if (typeof setInterval !== 'undefined') {
            this.cleanupTimer = setInterval(() => {
                const now = Date.now();
                for (const [key, entry] of this.cache) {
                    if (now > entry.expiresAt) {
                        this.cache.delete(key);
                    }
                }
            }, this.config.cleanupInterval);
        }
    }

    /**
     * Stop cleanup timer
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cache.clear();
    }
}

// Global cache instance
const cache = new MemoryCache();

/**
 * Cache decorator for functions
 */
export function cached<T>(
    keyFn: (...args: unknown[]) => string,
    ttl?: number
) {
    return function (
        _target: unknown,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]): Promise<T> {
            const key = keyFn(...args);
            const cachedValue = cache.get<T>(key);

            if (cachedValue !== null) {
                return cachedValue;
            }

            const result = await originalMethod.apply(this, args);
            cache.set(key, result, ttl);
            return result;
        };

        return descriptor;
    };
}

/**
 * Manual cache wrapper for async functions
 */
export async function withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
): Promise<T> {
    const cachedValue = cache.get<T>(key);
    if (cachedValue !== null) {
        return cachedValue;
    }

    const result = await fn();
    cache.set(key, result, ttl);
    return result;
}

/**
 * Batch data loader to prevent N+1 queries
 */
export class DataLoader<K, V> {
    private batch: Map<K, { resolve: (value: V) => void; reject: (error: Error) => void }[]> = new Map();
    private batchFn: (keys: K[]) => Promise<Map<K, V>>;
    private timer: NodeJS.Timeout | null = null;
    private batchDelay: number;

    constructor(
        batchFn: (keys: K[]) => Promise<Map<K, V>>,
        options?: { batchDelay?: number }
    ) {
        this.batchFn = batchFn;
        this.batchDelay = options?.batchDelay || 10;
    }

    /**
     * Load a single item
     */
    async load(key: K): Promise<V> {
        return new Promise((resolve, reject) => {
            if (!this.batch.has(key)) {
                this.batch.set(key, []);
            }
            this.batch.get(key)!.push({ resolve, reject });

            if (!this.timer) {
                this.timer = setTimeout(() => this.executeBatch(), this.batchDelay);
            }
        });
    }

    /**
     * Load multiple items
     */
    async loadMany(keys: K[]): Promise<V[]> {
        return Promise.all(keys.map(k => this.load(k)));
    }

    /**
     * Execute the batch query
     */
    private async executeBatch(): Promise<void> {
        this.timer = null;
        const batch = new Map(this.batch);
        this.batch.clear();

        const keys = Array.from(batch.keys());

        try {
            const results = await this.batchFn(keys);

            for (const [key, callbacks] of batch) {
                const value = results.get(key);
                if (value !== undefined) {
                    callbacks.forEach(cb => cb.resolve(value));
                } else {
                    callbacks.forEach(cb => cb.reject(new Error(`No value for key: ${key}`)));
                }
            }
        } catch (error) {
            for (const callbacks of batch.values()) {
                callbacks.forEach(cb => cb.reject(error as Error));
            }
        }
    }
}

/**
 * Lazy loading utility
 */
export function lazyLoad<T>(
    loadFn: () => Promise<T>
): () => Promise<T> {
    let loaded = false;
    let value: T | null = null;
    let promise: Promise<T> | null = null;

    return async () => {
        if (loaded) return value!;
        if (promise) return promise;

        promise = loadFn().then(result => {
            value = result;
            loaded = true;
            return result;
        });

        return promise;
    };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            fn(...args);
        }
    };
}

/**
 * Paginated query helper
 */
export interface PaginatedResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export function paginate<T>(
    items: T[],
    page: number,
    pageSize: number
): PaginatedResult<T> {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = items.slice(startIndex, startIndex + pageSize);

    return {
        data,
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
): T {
    const memo = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
        const key = keyFn ? keyFn(...args) : JSON.stringify(args);

        if (memo.has(key)) {
            return memo.get(key)!;
        }

        const result = fn(...args) as ReturnType<T>;
        memo.set(key, result);
        return result;
    }) as T;
}

/**
 * Get cache instance
 */
export function getCache(): MemoryCache {
    return cache;
}

/**
 * Invalidate cache for user
 */
export function invalidateUserCache(userId: string): number {
    return cache.invalidatePrefix(`user:${userId}`);
}

/**
 * Create cache key
 */
export function createCacheKey(...parts: (string | number)[]): string {
    return parts.join(':');
}

export default {
    MemoryCache,
    DataLoader,
    cached,
    withCache,
    lazyLoad,
    debounce,
    throttle,
    paginate,
    memoize,
    getCache,
    invalidateUserCache,
    createCacheKey,
};
