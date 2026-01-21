/**
 * Performance Monitoring System
 * 
 * Lightweight Real User Monitoring (RUM) and performance tracking.
 * Captures Core Web Vitals, API latencies, and error rates.
 * 
 * Super-Sprint 10: Phases 901-950
 */

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 's' | 'bytes' | 'count' | 'ratio';
    timestamp: Date;
    tags?: Record<string, string>;
}

export interface CoreWebVitals {
    LCP: number | null; // Largest Contentful Paint
    FID: number | null; // First Input Delay
    CLS: number | null; // Cumulative Layout Shift
    TTFB: number | null; // Time to First Byte
    FCP: number | null; // First Contentful Paint
    INP: number | null; // Interaction to Next Paint
}

export interface APIMetrics {
    endpoint: string;
    method: string;
    statusCode: number;
    latency: number;
    timestamp: Date;
    success: boolean;
}

export interface ErrorEvent {
    id: string;
    type: 'runtime' | 'network' | 'api' | 'unhandled';
    message: string;
    stack?: string;
    url?: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
}

export interface PerformanceSummary {
    period: { start: Date; end: Date };
    webVitals: {
        LCP: { p50: number; p75: number; p95: number; rating: 'good' | 'needs_improvement' | 'poor' };
        FID: { p50: number; p75: number; p95: number; rating: 'good' | 'needs_improvement' | 'poor' };
        CLS: { p50: number; p75: number; p95: number; rating: 'good' | 'needs_improvement' | 'poor' };
    };
    apiPerformance: {
        avgLatency: number;
        p95Latency: number;
        errorRate: number;
        slowestEndpoints: { endpoint: string; avgLatency: number }[];
    };
    errorSummary: {
        totalErrors: number;
        uniqueErrors: number;
        topErrors: { message: string; count: number }[];
    };
}

// In-memory stores (production would use external monitoring service)
const metrics: PerformanceMetric[] = [];
const apiMetrics: APIMetrics[] = [];
const errors: ErrorEvent[] = [];
const MAX_STORED = 1000;

// Web Vitals thresholds (from web.dev)
const VITALS_THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    FCP: { good: 1800, poor: 3000 },
    INP: { good: 200, poor: 500 },
};

/**
 * Track a generic performance metric
 */
export function trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    metrics.push({
        ...metric,
        timestamp: new Date(),
    });

    if (metrics.length > MAX_STORED) {
        metrics.shift();
    }
}

/**
 * Track Core Web Vital
 */
export function trackWebVital(
    name: keyof CoreWebVitals,
    value: number,
    tags?: Record<string, string>
): void {
    trackMetric({
        name: `web_vital_${name}`,
        value,
        unit: name === 'CLS' ? 'ratio' : 'ms',
        tags: {
            ...tags,
            rating: getVitalRating(name, value),
        },
    });
}

/**
 * Get rating for a web vital value
 */
function getVitalRating(name: keyof CoreWebVitals, value: number): string {
    const thresholds = VITALS_THRESHOLDS[name];
    if (!thresholds) return 'unknown';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs_improvement';
    return 'poor';
}

/**
 * Track API call performance
 */
export function trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    latency: number
): void {
    apiMetrics.push({
        endpoint,
        method,
        statusCode,
        latency,
        timestamp: new Date(),
        success: statusCode >= 200 && statusCode < 400,
    });

    if (apiMetrics.length > MAX_STORED) {
        apiMetrics.shift();
    }
}

/**
 * Track error event
 */
export function trackError(
    type: ErrorEvent['type'],
    message: string,
    options?: {
        stack?: string;
        url?: string;
        context?: Record<string, unknown>;
        userId?: string;
        sessionId?: string;
    }
): void {
    const event: ErrorEvent = {
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        message,
        timestamp: new Date(),
        ...options,
    };

    errors.push(event);

    if (errors.length > MAX_STORED) {
        errors.shift();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${type}] ${message}`, options?.context);
    }
}

/**
 * Create a timing helper
 */
export function startTiming(): () => number {
    const start = performance.now();
    return () => Math.round(performance.now() - start);
}

/**
 * Wrap an async function with automatic timing
 */
export function withTiming<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const end = startTiming();

    return fn()
        .then(result => {
            trackMetric({ name, value: end(), unit: 'ms' });
            return result;
        })
        .catch(error => {
            trackMetric({ name, value: end(), unit: 'ms', tags: { error: 'true' } });
            throw error;
        });
}

/**
 * Calculate percentile from array of numbers
 */
function percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] || 0;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(
    periodMs: number = 24 * 60 * 60 * 1000
): PerformanceSummary {
    const cutoff = new Date(Date.now() - periodMs);

    // Filter to period
    const periodMetrics = metrics.filter(m => m.timestamp >= cutoff);
    const periodAPI = apiMetrics.filter(m => m.timestamp >= cutoff);
    const periodErrors = errors.filter(e => e.timestamp >= cutoff);

    // Calculate Web Vitals summaries
    const vitalNames = ['LCP', 'FID', 'CLS'] as const;
    const webVitals: PerformanceSummary['webVitals'] = {} as PerformanceSummary['webVitals'];

    for (const vital of vitalNames) {
        const values = periodMetrics
            .filter(m => m.name === `web_vital_${vital}`)
            .map(m => m.value);

        if (values.length === 0) {
            webVitals[vital] = { p50: 0, p75: 0, p95: 0, rating: 'good' };
        } else {
            const p75 = percentile(values, 75);
            webVitals[vital] = {
                p50: percentile(values, 50),
                p75,
                p95: percentile(values, 95),
                rating: getVitalRating(vital, p75) as 'good' | 'needs_improvement' | 'poor',
            };
        }
    }

    // Calculate API performance
    const latencies = periodAPI.map(a => a.latency);
    const errorCount = periodAPI.filter(a => !a.success).length;

    const endpointLatencies: Map<string, number[]> = new Map();
    for (const api of periodAPI) {
        const current = endpointLatencies.get(api.endpoint) || [];
        current.push(api.latency);
        endpointLatencies.set(api.endpoint, current);
    }

    const slowestEndpoints = Array.from(endpointLatencies.entries())
        .map(([endpoint, l]) => ({
            endpoint,
            avgLatency: l.reduce((a, b) => a + b, 0) / l.length,
        }))
        .sort((a, b) => b.avgLatency - a.avgLatency)
        .slice(0, 5);

    // Calculate error summary
    const errorMessages: Map<string, number> = new Map();
    for (const err of periodErrors) {
        errorMessages.set(err.message, (errorMessages.get(err.message) || 0) + 1);
    }

    const topErrors = Array.from(errorMessages.entries())
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        period: { start: cutoff, end: new Date() },
        webVitals,
        apiPerformance: {
            avgLatency: latencies.length > 0
                ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
                : 0,
            p95Latency: percentile(latencies, 95),
            errorRate: periodAPI.length > 0 ? (errorCount / periodAPI.length) * 100 : 0,
            slowestEndpoints,
        },
        errorSummary: {
            totalErrors: periodErrors.length,
            uniqueErrors: errorMessages.size,
            topErrors,
        },
    };
}

/**
 * Initialize browser performance observers
 */
export function initializePerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe LCP
    try {
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
                trackWebVital('LCP', lastEntry.startTime);
            }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
        console.warn('LCP observer not supported');
    }

    // Observe FID
    try {
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if ('processingStart' in entry) {
                    const e = entry as PerformanceEventTiming;
                    trackWebVital('FID', e.processingStart - e.startTime);
                }
            }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
        console.warn('FID observer not supported');
    }

    // Observe CLS
    try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if ('hadRecentInput' in entry && !(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
                    clsValue += (entry as unknown as { value: number }).value;
                }
            }
            trackWebVital('CLS', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
        console.warn('CLS observer not supported');
    }
}

/**
 * Clear all stored metrics
 */
export function clearMetrics(): void {
    metrics.length = 0;
    apiMetrics.length = 0;
    errors.length = 0;
}

export default {
    trackMetric,
    trackWebVital,
    trackAPICall,
    trackError,
    startTiming,
    withTiming,
    getPerformanceSummary,
    initializePerformanceObservers,
    clearMetrics,
};
