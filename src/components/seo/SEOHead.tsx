'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';
import Script from 'next/script';

/**
 * SEO Head Component
 * Provides page-specific meta tags and structured data
 */

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
    canonicalPath?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
}

const BASE_URL = 'https://moneyloop.ai';

export function SEOHead({
    title,
    description,
    keywords = [],
    ogImage,
    noIndex = false,
    canonicalPath,
    breadcrumbs,
}: SEOHeadProps) {
    const pathname = usePathname();
    const currentUrl = canonicalPath || `${BASE_URL}${pathname}`;

    const breadcrumbSchema = breadcrumbs ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    } : null;

    return (
        <>
            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />

            {/* Additional meta tags */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Keywords meta tag */}
            {keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}

            {/* Breadcrumb structured data */}
            {breadcrumbSchema && (
                <Script
                    id="breadcrumb-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
        </>
    );
}

/**
 * SEOWrapper - Provides SEO context to child components
 */
export function SEOWrapper({
    children,
    pageName,
}: {
    children: React.ReactNode;
    pageName?: string;
}) {
    const pathname = usePathname();

    // Generate breadcrumbs from pathname
    const breadcrumbs = [];
    const pathParts = pathname.split('/').filter(Boolean);

    breadcrumbs.push({ name: 'Home', url: BASE_URL });

    let currentPath = '';
    for (const part of pathParts) {
        currentPath += `/${part}`;
        const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({ name, url: `${BASE_URL}${currentPath}` });
    }

    return (
        <>
            <SEOHead breadcrumbs={breadcrumbs} />
            {children}
        </>
    );
}

/**
 * LocalBusinessSchema - For showing in local search results
 */
export function LocalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialService',
        name: 'MoneyLoop',
        description: 'Personal finance and wealth tracking platform',
        url: BASE_URL,
        priceRange: 'Free - $79/month',
        telephone: '',
        address: {
            '@type': 'VirtualLocation',
            name: 'Online',
        },
    };

    return (
        <Script
            id="local-business-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * HowToSchema - For feature explanation pages
 */
export function HowToSchema({
    name,
    description,
    steps,
}: {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string }>;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
        })),
    };

    return (
        <Script
            id="howto-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * VideoObjectSchema - For any video content
 */
export function VideoSchema({
    name,
    description,
    thumbnailUrl,
    duration,
    uploadDate,
}: {
    name: string;
    description: string;
    thumbnailUrl: string;
    duration: string;
    uploadDate: string;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl,
        duration,
        uploadDate,
        publisher: {
            '@type': 'Organization',
            name: 'MoneyLoop',
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/logo.png`,
            },
        },
    };

    return (
        <Script
            id="video-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export default SEOHead;
