'use client';

import { useEffect, useState } from 'react';

/**
 * Performance and Core Web Vitals Monitoring
 * Tracks LCP, FID, CLS for SEO ranking factors
 */

interface WebVitalsMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
};

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
};

/**
 * Web Vitals Reporter Hook
 * Reports Core Web Vitals to analytics
 */
export function useWebVitals(onReport?: (metric: WebVitalsMetric) => void) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const reportVital = (name: string, value: number, delta: number) => {
            const metric: WebVitalsMetric = {
                name,
                value,
                rating: getRating(name, value),
                delta,
            };
            onReport?.(metric);

            // Log to console in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Web Vitals] ${name}: ${value.toFixed(2)} (${metric.rating})`);
            }
        };

        // Web Vitals reporting using Performance API fallback
        // Note: For full web-vitals support, install: npm install web-vitals
        try {
            // Check if PerformanceObserver is available
            if ('PerformanceObserver' in window) {
                // LCP Observer
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
                    if (lastEntry) {
                        reportVital('LCP', lastEntry.startTime, lastEntry.startTime);
                    }
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

                // CLS Observer
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
                        clsValue += entry.value;
                        reportVital('CLS', clsValue, entry.value);
                    }
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });

                // FCP from Navigation Timing
                const paintEntries = performance.getEntriesByType('paint');
                const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
                if (fcp) {
                    reportVital('FCP', fcp.startTime, fcp.startTime);
                }
            }
        } catch {
            // Performance observation not available
        }
    }, [onReport]);
}

/**
 * Preload Critical Resources
 * Improves LCP by preloading above-the-fold resources
 */
export function PreloadCriticalResources() {
    return (
        <>
            {/* Preload critical fonts */}
            <link
                rel="preload"
                href="/fonts/inter-var.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />

            {/* Preconnect to critical origins */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* DNS prefetch for third-party services */}
            <link rel="dns-prefetch" href="https://plaid.com" />
            <link rel="dns-prefetch" href="https://api.stripe.com" />
        </>
    );
}

/**
 * Lazy Image Loading with Native Support
 */
export function LazyImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
}: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={() => setLoaded(true)}
        />
    );
}

/**
 * Skip Link for Accessibility (also helps SEO)
 */
export function SkipToMainContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:shadow-lg"
        >
            Skip to main content
        </a>
    );
}

/**
 * Accessibility Labels Component
 */
export function A11yLabel({
    children,
    htmlFor,
    required = false,
}: {
    children: React.ReactNode;
    htmlFor: string;
    required?: boolean;
}) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
            {children}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(required)</span>}
        </label>
    );
}

/**
 * Screen Reader Only Text
 */
export function SrOnly({ children }: { children: React.ReactNode }) {
    return <span className="sr-only">{children}</span>;
}

/**
 * Focus Trap for Modals (Accessibility)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [containerRef]);
}

/**
 * ARIA Live Region for Announcements
 */
export function LiveRegion({
    message,
    priority = 'polite',
}: {
    message: string;
    priority?: 'polite' | 'assertive';
}) {
    return (
        <div
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
}

export default {
    useWebVitals,
    PreloadCriticalResources,
    LazyImage,
    SkipToMainContent,
    A11yLabel,
    SrOnly,
    useFocusTrap,
    LiveRegion,
};
