/**
 * Rate Limiter Middleware
 * 
 * Token bucket algorithm for API rate limiting.
 */

interface RateLimitConfig {
    requests: number;  // Max requests
    windowMs: number;  // Time window in ms
    keyPrefix?: string;
}

interface RateLimitEntry {
    tokens: number;
    lastRefill: number;
}

// In-memory store (use Redis in production)
const store: Map<string, RateLimitEntry> = new Map();

/**
 * Create rate limiter
 */
export function createRateLimiter(config: RateLimitConfig) {
    const { requests, windowMs, keyPrefix = 'rl' } = config;
    const refillRate = requests / (windowMs / 1000); // tokens per second

    return {
        /**
         * Check if request is allowed
         */
        check(key: string): { allowed: boolean; remaining: number; resetAt: Date } {
            const fullKey = `${keyPrefix}:${key}`;
            const now = Date.now();

            let entry = store.get(fullKey);

            if (!entry) {
                entry = { tokens: requests, lastRefill: now };
                store.set(fullKey, entry);
            }

            // Refill tokens based on time passed
            const timePassed = (now - entry.lastRefill) / 1000;
            const refill = Math.floor(timePassed * refillRate);

            if (refill > 0) {
                entry.tokens = Math.min(requests, entry.tokens + refill);
                entry.lastRefill = now;
            }

            // Check if allowed
            const allowed = entry.tokens > 0;

            if (allowed) {
                entry.tokens--;
            }

            const resetAt = new Date(now + ((requests - entry.tokens) / refillRate) * 1000);

            return {
                allowed,
                remaining: Math.max(0, entry.tokens),
                resetAt,
            };
        },

        /**
         * Get rate limit headers
         */
        getHeaders(result: { remaining: number; resetAt: Date }): Record<string, string> {
            return {
                'X-RateLimit-Limit': requests.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
            };
        },

        /**
         * Clear rate limit for key
         */
        clear(key: string): void {
            store.delete(`${keyPrefix}:${key}`);
        },

        /**
         * Clear all rate limits
         */
        clearAll(): void {
            for (const key of store.keys()) {
                if (key.startsWith(keyPrefix)) {
                    store.delete(key);
                }
            }
        },
    };
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter({
    requests: 100,
    windowMs: 60 * 1000, // 100 req/min
    keyPrefix: 'api',
});

export const authRateLimiter = createRateLimiter({
    requests: 10,
    windowMs: 60 * 1000, // 10 req/min
    keyPrefix: 'auth',
});

export const aiRateLimiter = createRateLimiter({
    requests: 20,
    windowMs: 60 * 1000, // 20 req/min
    keyPrefix: 'ai',
});

export const exportRateLimiter = createRateLimiter({
    requests: 5,
    windowMs: 60 * 1000, // 5 req/min
    keyPrefix: 'export',
});

/**
 * Rate limit middleware helper
 */
export function withRateLimit(
    limiter: ReturnType<typeof createRateLimiter>,
    getKey: (request: Request) => string
) {
    return async (request: Request) => {
        const key = getKey(request);
        const result = limiter.check(key);

        if (!result.allowed) {
            return new Response(
                JSON.stringify({ error: 'Too many requests', retryAfter: result.resetAt.toISOString() }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        ...limiter.getHeaders(result),
                    },
                }
            );
        }

        return null; // Continue to handler
    };
}

export default {
    createRateLimiter,
    apiRateLimiter,
    authRateLimiter,
    aiRateLimiter,
    exportRateLimiter,
    withRateLimit,
};
