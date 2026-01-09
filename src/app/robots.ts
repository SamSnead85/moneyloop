import { MetadataRoute } from 'next';

/**
 * Enhanced robots.txt for MoneyLoop
 * Optimized for search engine crawling while protecting private routes
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    // API routes - never crawl
                    '/api/',
                    // Auth callback - technical route
                    '/auth/callback',
                    // Private user data
                    '/dashboard/settings',
                    // Development/system files
                    '/_next/',
                    '/static/',
                ],
            },
            {
                // Google-specific rules for optimal crawling
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/auth/callback'],
            },
            {
                // Bing-specific rules
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/auth/callback'],
            },
        ],
        sitemap: 'https://moneyloop.ai/sitemap.xml',
        host: 'https://moneyloop.ai',
    };
}
