/**
 * Developer API Layer
 * 
 * RESTful API endpoints, API key management,
 * rate limiting, and webhook delivery.
 * 
 * Super-Sprint 26: Phases 2501-2550
 */

export interface APIKey {
    id: string;
    userId: string;
    name: string;
    keyHash: string; // Hashed key
    keyPrefix: string; // First 8 chars for display
    permissions: APIPermission[];
    rateLimit: {
        requestsPerMinute: number;
        requestsPerDay: number;
    };
    status: 'active' | 'revoked' | 'expired';
    lastUsedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    ipWhitelist?: string[];
}

export type APIPermission =
    | 'read:accounts'
    | 'read:transactions'
    | 'read:budgets'
    | 'read:goals'
    | 'write:transactions'
    | 'write:budgets'
    | 'write:goals'
    | 'read:reports'
    | 'admin';

export interface RateLimitInfo {
    remaining: number;
    limit: number;
    resetAt: Date;
    isLimited: boolean;
}

export interface APIRequest {
    id: string;
    apiKeyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number;
    ip: string;
    userAgent?: string;
    timestamp: Date;
    error?: string;
}

export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    permission: APIPermission;
    description: string;
    parameters?: { name: string; type: string; required: boolean; description: string }[];
    responses: { status: number; description: string }[];
}

// In-memory stores
const apiKeys: Map<string, APIKey> = new Map();
const requestLogs: APIRequest[] = [];
const rateLimitCounters: Map<string, { minute: number; day: number; resetMinute: Date; resetDay: Date }> = new Map();

// API Endpoints catalog
export const API_ENDPOINTS: APIEndpoint[] = [
    {
        path: '/api/v1/accounts',
        method: 'GET',
        permission: 'read:accounts',
        description: 'List all connected accounts',
        responses: [
            { status: 200, description: 'List of accounts' },
            { status: 401, description: 'Unauthorized' },
        ],
    },
    {
        path: '/api/v1/accounts/:id',
        method: 'GET',
        permission: 'read:accounts',
        description: 'Get account details',
        parameters: [{ name: 'id', type: 'string', required: true, description: 'Account ID' }],
        responses: [
            { status: 200, description: 'Account details' },
            { status: 404, description: 'Account not found' },
        ],
    },
    {
        path: '/api/v1/transactions',
        method: 'GET',
        permission: 'read:transactions',
        description: 'List transactions with filters',
        parameters: [
            { name: 'account_id', type: 'string', required: false, description: 'Filter by account' },
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'start_date', type: 'date', required: false, description: 'Start date (YYYY-MM-DD)' },
            { name: 'end_date', type: 'date', required: false, description: 'End date (YYYY-MM-DD)' },
            { name: 'limit', type: 'number', required: false, description: 'Max results (default 100)' },
            { name: 'offset', type: 'number', required: false, description: 'Offset for pagination' },
        ],
        responses: [
            { status: 200, description: 'List of transactions' },
        ],
    },
    {
        path: '/api/v1/transactions',
        method: 'POST',
        permission: 'write:transactions',
        description: 'Create a manual transaction',
        parameters: [
            { name: 'account_id', type: 'string', required: true, description: 'Account ID' },
            { name: 'amount', type: 'number', required: true, description: 'Transaction amount' },
            { name: 'description', type: 'string', required: true, description: 'Transaction description' },
            { name: 'category', type: 'string', required: false, description: 'Category ID' },
            { name: 'date', type: 'date', required: false, description: 'Transaction date' },
        ],
        responses: [
            { status: 201, description: 'Transaction created' },
            { status: 400, description: 'Invalid request' },
        ],
    },
    {
        path: '/api/v1/budgets',
        method: 'GET',
        permission: 'read:budgets',
        description: 'List all budgets',
        responses: [{ status: 200, description: 'List of budgets' }],
    },
    {
        path: '/api/v1/goals',
        method: 'GET',
        permission: 'read:goals',
        description: 'List all savings goals',
        responses: [{ status: 200, description: 'List of goals' }],
    },
    {
        path: '/api/v1/goals/:id/contribute',
        method: 'POST',
        permission: 'write:goals',
        description: 'Add contribution to a goal',
        parameters: [
            { name: 'amount', type: 'number', required: true, description: 'Contribution amount' },
        ],
        responses: [
            { status: 200, description: 'Goal updated' },
            { status: 404, description: 'Goal not found' },
        ],
    },
    {
        path: '/api/v1/reports/spending',
        method: 'GET',
        permission: 'read:reports',
        description: 'Get spending report',
        parameters: [
            { name: 'period', type: 'string', required: false, description: 'month, quarter, year' },
        ],
        responses: [{ status: 200, description: 'Spending report' }],
    },
];

/**
 * Generate API key
 */
export function generateAPIKey(
    userId: string,
    params: {
        name: string;
        permissions: APIPermission[];
        rateLimit?: { requestsPerMinute: number; requestsPerDay: number };
        expiresIn?: number; // days
        ipWhitelist?: string[];
    }
): { key: string; apiKey: APIKey } {
    // Generate random key
    const keyBytes = new Array(32).fill(0).map(() =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const key = `ml_${keyBytes}`;

    const id = `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const apiKey: APIKey = {
        id,
        userId,
        name: params.name,
        keyHash: hashKey(key),
        keyPrefix: key.substring(0, 11),
        permissions: params.permissions,
        rateLimit: params.rateLimit || { requestsPerMinute: 60, requestsPerDay: 10000 },
        status: 'active',
        createdAt: new Date(),
        expiresAt: params.expiresIn
            ? new Date(Date.now() + params.expiresIn * 24 * 60 * 60 * 1000)
            : undefined,
        ipWhitelist: params.ipWhitelist,
    };

    apiKeys.set(id, apiKey);

    return { key, apiKey };
}

/**
 * Hash API key for storage
 */
function hashKey(key: string): string {
    // In production, use crypto.createHash('sha256')
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * Validate API key
 */
export function validateAPIKey(key: string): {
    valid: boolean;
    apiKey?: APIKey;
    error?: string;
} {
    const keyHash = hashKey(key);

    for (const apiKey of apiKeys.values()) {
        if (apiKey.keyHash === keyHash) {
            if (apiKey.status !== 'active') {
                return { valid: false, error: 'API key is revoked or expired' };
            }

            if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                apiKey.status = 'expired';
                return { valid: false, error: 'API key has expired' };
            }

            apiKey.lastUsedAt = new Date();
            return { valid: true, apiKey };
        }
    }

    return { valid: false, error: 'Invalid API key' };
}

/**
 * Check rate limit
 */
export function checkRateLimit(
    apiKeyId: string,
    limits: { requestsPerMinute: number; requestsPerDay: number }
): RateLimitInfo {
    const now = new Date();
    let counter = rateLimitCounters.get(apiKeyId);

    if (!counter) {
        counter = {
            minute: 0,
            day: 0,
            resetMinute: new Date(now.getTime() + 60000),
            resetDay: new Date(now.getTime() + 86400000),
        };
        rateLimitCounters.set(apiKeyId, counter);
    }

    // Reset minute counter if needed
    if (now >= counter.resetMinute) {
        counter.minute = 0;
        counter.resetMinute = new Date(now.getTime() + 60000);
    }

    // Reset day counter if needed
    if (now >= counter.resetDay) {
        counter.day = 0;
        counter.resetDay = new Date(now.getTime() + 86400000);
    }

    const isLimited = counter.minute >= limits.requestsPerMinute ||
        counter.day >= limits.requestsPerDay;

    if (!isLimited) {
        counter.minute++;
        counter.day++;
    }

    return {
        remaining: Math.min(
            limits.requestsPerMinute - counter.minute,
            limits.requestsPerDay - counter.day
        ),
        limit: limits.requestsPerMinute,
        resetAt: counter.resetMinute,
        isLimited,
    };
}

/**
 * Check permission
 */
export function checkPermission(
    apiKey: APIKey,
    requiredPermission: APIPermission
): boolean {
    if (apiKey.permissions.includes('admin')) return true;
    return apiKey.permissions.includes(requiredPermission);
}

/**
 * Log API request
 */
export function logAPIRequest(params: Omit<APIRequest, 'id'>): APIRequest {
    const request: APIRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...params,
    };

    requestLogs.unshift(request);

    // Keep only last 10000 requests
    if (requestLogs.length > 10000) {
        requestLogs.pop();
    }

    return request;
}

/**
 * Get API key stats
 */
export function getAPIKeyStats(apiKeyId: string, days: number = 30): {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    endpointBreakdown: { endpoint: string; count: number }[];
    errorBreakdown: { error: string; count: number }[];
} {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const keyRequests = requestLogs.filter(r =>
        r.apiKeyId === apiKeyId && r.timestamp >= cutoff
    );

    const successful = keyRequests.filter(r => r.statusCode >= 200 && r.statusCode < 400);
    const totalLatency = keyRequests.reduce((s, r) => s + r.latencyMs, 0);

    const endpointCounts: Map<string, number> = new Map();
    const errorCounts: Map<string, number> = new Map();

    for (const req of keyRequests) {
        endpointCounts.set(req.endpoint, (endpointCounts.get(req.endpoint) || 0) + 1);
        if (req.error) {
            errorCounts.set(req.error, (errorCounts.get(req.error) || 0) + 1);
        }
    }

    return {
        totalRequests: keyRequests.length,
        successRate: keyRequests.length > 0 ? (successful.length / keyRequests.length) * 100 : 0,
        avgLatency: keyRequests.length > 0 ? totalLatency / keyRequests.length : 0,
        endpointBreakdown: Array.from(endpointCounts.entries())
            .map(([endpoint, count]) => ({ endpoint, count }))
            .sort((a, b) => b.count - a.count),
        errorBreakdown: Array.from(errorCounts.entries())
            .map(([error, count]) => ({ error, count }))
            .sort((a, b) => b.count - a.count),
    };
}

/**
 * Get user API keys
 */
export function getUserAPIKeys(userId: string): APIKey[] {
    return Array.from(apiKeys.values())
        .filter(k => k.userId === userId)
        .map(k => ({ ...k, keyHash: '***' })); // Hide hash
}

/**
 * Revoke API key
 */
export function revokeAPIKey(keyId: string): boolean {
    const key = apiKeys.get(keyId);
    if (!key) return false;

    key.status = 'revoked';
    return true;
}

/**
 * Generate API documentation
 */
export function generateOpenAPISpec(): Record<string, unknown> {
    const paths: Record<string, unknown> = {};

    for (const endpoint of API_ENDPOINTS) {
        const pathKey = endpoint.path.replace(/:(\w+)/g, '{$1}');

        if (!paths[pathKey]) {
            paths[pathKey] = {};
        }

        (paths[pathKey] as Record<string, unknown>)[endpoint.method.toLowerCase()] = {
            summary: endpoint.description,
            security: [{ apiKey: [] }],
            parameters: endpoint.parameters?.map(p => ({
                name: p.name,
                in: endpoint.path.includes(`:${p.name}`) ? 'path' : 'query',
                required: p.required,
                schema: { type: p.type },
                description: p.description,
            })),
            responses: Object.fromEntries(
                endpoint.responses.map(r => [r.status.toString(), { description: r.description }])
            ),
        };
    }

    return {
        openapi: '3.0.0',
        info: {
            title: 'MoneyLoop API',
            version: '1.0.0',
            description: 'Financial management API for MoneyLoop',
        },
        servers: [{ url: 'https://api.moneyloop.ai/v1' }],
        paths,
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    name: 'X-API-Key',
                    in: 'header',
                },
            },
        },
    };
}

export default {
    generateAPIKey,
    validateAPIKey,
    checkRateLimit,
    checkPermission,
    logAPIRequest,
    getAPIKeyStats,
    getUserAPIKeys,
    revokeAPIKey,
    generateOpenAPISpec,
    API_ENDPOINTS,
};
