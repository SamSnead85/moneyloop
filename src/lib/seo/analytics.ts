/**
 * SEO Analytics and Tracking
 * Event tracking for search optimization and conversion metrics
 */

type SEOEventType =
    | 'page_view'
    | 'signup_start'
    | 'signup_complete'
    | 'account_link_start'
    | 'account_link_complete'
    | 'feature_discovery'
    | 'premium_interest'
    | 'checkout_start'
    | 'checkout_complete';

interface SEOEvent {
    type: SEOEventType;
    page: string;
    data?: Record<string, unknown>;
    timestamp: number;
}

/**
 * Track SEO-relevant events
 */
export function trackSEOEvent(type: SEOEventType, data?: Record<string, unknown>) {
    const event: SEOEvent = {
        type,
        page: typeof window !== 'undefined' ? window.location.pathname : '/',
        data,
        timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[SEO Event]', event);
    }

    // Send to analytics (placeholder for GA4, Plausible, etc.)
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
        (window as unknown as { gtag: Function }).gtag('event', type, {
            ...data,
            page_path: event.page,
        });
    }
}

/**
 * Track page views for analytics
 */
export function trackPageView(path: string, title: string) {
    trackSEOEvent('page_view', { path, title });
}

/**
 * Track conversion funnel events
 */
export const ConversionEvents = {
    signupStart: () => trackSEOEvent('signup_start'),
    signupComplete: (method: 'google' | 'email') =>
        trackSEOEvent('signup_complete', { method }),
    accountLinkStart: (provider: string) =>
        trackSEOEvent('account_link_start', { provider }),
    accountLinkComplete: (provider: string, accountCount: number) =>
        trackSEOEvent('account_link_complete', { provider, accountCount }),
    featureDiscovery: (feature: string) =>
        trackSEOEvent('feature_discovery', { feature }),
    premiumInterest: (plan: string) =>
        trackSEOEvent('premium_interest', { plan }),
    checkoutStart: (plan: string, price: number) =>
        trackSEOEvent('checkout_start', { plan, price }),
    checkoutComplete: (plan: string, price: number) =>
        trackSEOEvent('checkout_complete', { plan, price }),
};

/**
 * Generate UTM tracking URLs
 */
export function generateUTMUrl(
    baseUrl: string,
    params: {
        source: string;
        medium: string;
        campaign: string;
        term?: string;
        content?: string;
    }
): string {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);
    if (params.term) url.searchParams.set('utm_term', params.term);
    if (params.content) url.searchParams.set('utm_content', params.content);
    return url.toString();
}

/**
 * Parse UTM parameters from current URL
 */
export function parseUTMParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
        const value = params.get(key);
        if (value) utm[key] = value;
    });

    return utm;
}

/**
 * Track search queries (for internal search)
 */
export function trackSearchQuery(query: string, resultsCount: number) {
    trackSEOEvent('feature_discovery', {
        feature: 'search',
        query,
        resultsCount,
    });
}

export default {
    trackSEOEvent,
    trackPageView,
    ConversionEvents,
    generateUTMUrl,
    parseUTMParams,
    trackSearchQuery,
};
