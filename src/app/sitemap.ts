import { MetadataRoute } from 'next';

/**
 * Enhanced Sitemap for MoneyLoop
 * Comprehensive sitemap with all public pages, proper priorities, and change frequencies
 * for optimal search engine crawling and indexing
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://moneyloop.ai';
    const currentDate = new Date();

    return [
        // === HOMEPAGE - Highest Priority ===
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },

        // === CORE APP PAGES - High Priority ===
        {
            url: `${baseUrl}/dashboard`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/dashboard/transactions`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/dashboard/budgets`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/accounts`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/goals`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/investments`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/bills`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/subscriptions`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/dashboard/insights`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard/reports`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/dashboard/settings`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.5,
        },

        // === SPECIALTY PAGES - Medium-High Priority ===
        {
            url: `${baseUrl}/dashboard/healthcare`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/dashboard/tax-optimizer`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/dashboard/grocery`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/dashboard/business`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        },

        // === PUBLIC CONTENT PAGES ===
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },

        // === AUTH & ONBOARDING ===
        {
            url: `${baseUrl}/auth`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/onboarding`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
        },

        // === LEGAL PAGES - Lower Priority but Important ===
        {
            url: `${baseUrl}/privacy`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ];
}
