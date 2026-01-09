/**
 * MoneyLoop SEO Library
 * Comprehensive SEO utilities for personal finance keywords and search ranking
 */

// ===== KEYWORDS DATABASE =====
// Targeting personal finance, budgeting, money management, wealth tracking

export const SEO_KEYWORDS = {
    primary: [
        'personal finance app',
        'money management app',
        'budget tracker',
        'expense tracker',
        'net worth tracker',
        'wealth management app',
        'financial planning app',
        'investment tracker',
        'savings tracker',
    ],
    secondary: [
        'best budgeting app 2026',
        'free budget app',
        'track spending app',
        'money tracker app',
        'financial dashboard',
        'personal finance software',
        'budget planner',
        'expense manager',
        'bill tracker app',
        'subscription tracker',
    ],
    longTail: [
        'how to track net worth',
        'best app to track investments',
        'free net worth tracker',
        'track all bank accounts in one place',
        'personal finance dashboard',
        'budget tracking software',
        'money management for couples',
        'track spending across multiple accounts',
        'real time net worth tracker',
        'automated expense categorization',
        'link bank accounts for budgeting',
        'track gold and silver investments',
        'healthcare expense tracker',
        'HSA spending tracker',
        'subscription spending analysis',
    ],
    competitors: [
        'mint alternative',
        'ynab alternative',
        'personal capital alternative',
        'quicken alternative',
        'copilot money alternative',
        'monarch money alternative',
        'simplifi alternative',
    ],
    features: [
        'automatic bank sync',
        'investment portfolio tracker',
        'bill payment reminders',
        'spending insights',
        'financial goal tracker',
        'debt payoff tracker',
        'savings goal tracker',
        'net worth calculator',
        'budget vs actual tracking',
        'cash flow analysis',
    ],
};

// ===== PAGE-SPECIFIC METADATA =====

export interface PageSEO {
    title: string;
    description: string;
    keywords: string[];
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
}

export const PAGE_SEO: Record<string, PageSEO> = {
    home: {
        title: 'MoneyLoop - #1 Personal Finance & Budget Tracker App',
        description: 'Track your entire financial life in one place. Connect bank accounts, investments, real estate, and discover hidden savings. Free net worth tracker with AI insights.',
        keywords: [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.competitors.slice(0, 3)],
        ogTitle: 'MoneyLoop - Your Complete Wealth Picture',
        ogDescription: 'The only app you need to track all your money. Bank accounts, investments, real estate, gold - everything in one dashboard.',
    },
    dashboard: {
        title: 'Dashboard - Your Financial Command Center',
        description: 'View your complete financial snapshot. Net worth, spending trends, budget status, and AI-powered insights all in one place.',
        keywords: ['financial dashboard', 'money dashboard', 'net worth dashboard', 'budget dashboard'],
    },
    transactions: {
        title: 'Transactions - Track Every Expense Automatically',
        description: 'Automatic expense categorization, smart search, and spending analysis. Never lose track of where your money goes.',
        keywords: ['expense tracker', 'transaction tracker', 'spending tracker', 'automatic expense categorization'],
    },
    budgets: {
        title: 'Budgets - Smart Budget Planning & Tracking',
        description: 'Create budgets that work. Use our proven templates or customize your own. Stay on track with real-time alerts.',
        keywords: ['budget tracker', 'budget planner', 'budget templates', '50/30/20 budget'],
    },
    goals: {
        title: 'Goals - Achieve Your Financial Dreams',
        description: 'Set savings goals and track progress. Whether it\'s an emergency fund, vacation, or home down payment - we help you get there.',
        keywords: ['savings goals', 'financial goals', 'money goals', 'savings tracker'],
    },
    investments: {
        title: 'Investments - Portfolio Tracker & Analysis',
        description: 'Track stocks, ETFs, mutual funds, and retirement accounts. Real-time prices, performance charts, and allocation insights.',
        keywords: ['investment tracker', 'portfolio tracker', 'stock tracker', 'retirement account tracker'],
    },
    bills: {
        title: 'Bills - Never Miss a Payment',
        description: 'Track all your bills in one place. Get reminders, see upcoming payments, and manage subscriptions automatically.',
        keywords: ['bill tracker', 'bill reminder app', 'subscription tracker', 'payment tracker'],
    },
    accounts: {
        title: 'Accounts - All Your Money in One View',
        description: 'Connect all your bank accounts, credit cards, and financial accounts. Secure, automatic sync with real-time balances.',
        keywords: ['bank account tracker', 'account aggregation', 'link bank accounts', 'financial account tracker'],
    },
    insights: {
        title: 'Insights - AI-Powered Financial Intelligence',
        description: 'Discover savings opportunities with AI. Get personalized recommendations to optimize your finances.',
        keywords: ['financial insights', 'money insights', 'spending insights', 'AI financial advisor'],
    },
    reports: {
        title: 'Reports - Financial Analysis & Exports',
        description: 'Generate detailed financial reports. Monthly summaries, spending analysis, and exportable data for tax time.',
        keywords: ['financial reports', 'expense report', 'spending report', 'net worth report'],
    },
    settings: {
        title: 'Settings - Customize Your Experience',
        description: 'Personalize MoneyLoop to fit your needs. Manage accounts, notifications, security, and preferences.',
        keywords: ['account settings', 'app settings'],
    },
    auth: {
        title: 'Sign In - Access Your Financial Dashboard',
        description: 'Securely sign in to MoneyLoop. Your data is protected with bank-level encryption.',
        keywords: ['sign in', 'login', 'secure login'],
    },
    onboarding: {
        title: 'Get Started - Set Up Your Financial Dashboard',
        description: 'Set up your MoneyLoop account in minutes. Connect accounts and start tracking your wealth today.',
        keywords: ['get started', 'setup', 'onboarding'],
    },
    privacy: {
        title: 'Privacy Policy - Your Data Security',
        description: 'Learn how MoneyLoop protects your financial data with bank-level security and read-only access.',
        keywords: ['privacy policy', 'data security', 'financial data protection'],
    },
    terms: {
        title: 'Terms of Service',
        description: 'MoneyLoop terms of service and user agreement.',
        keywords: ['terms of service', 'user agreement'],
    },
};

// ===== STRUCTURED DATA SCHEMAS =====

export const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MoneyLoop',
    url: 'https://moneyloop.ai',
    logo: 'https://moneyloop.ai/logo.png',
    description: 'Personal finance and wealth tracking platform',
    foundingDate: '2025',
    sameAs: [
        'https://twitter.com/moneyloopai',
        'https://linkedin.com/company/moneyloop',
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@moneyloop.ai',
    },
});

export const getSoftwareApplicationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MoneyLoop',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android',
    description: 'All-in-one personal finance app to track net worth, budgets, investments, and discover savings opportunities.',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier with premium upgrades available',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '15000',
        bestRating: '5',
        worstRating: '1',
    },
    featureList: [
        'Net worth tracking',
        'Automatic bank sync',
        'Investment portfolio tracking',
        'Budget planning and tracking',
        'Bill reminders and management',
        'Subscription tracking',
        'AI-powered insights',
        'Spending categorization',
        'Financial goal tracking',
        'Real estate value tracking',
        'Healthcare expense tracking',
        'Tax optimization',
    ],
    screenshot: 'https://moneyloop.ai/screenshots/dashboard.png',
});

export const getFAQSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Is MoneyLoop free to use?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! MoneyLoop offers a free tier that includes 3 connected accounts, basic net worth tracking, and monthly insights. Premium features are available for $39/month.',
            },
        },
        {
            '@type': 'Question',
            name: 'Is my financial data secure with MoneyLoop?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Absolutely. MoneyLoop uses 256-bit bank-level encryption, read-only access to your accounts (we can never move money), and is SOC 2 Type II certified.',
            },
        },
        {
            '@type': 'Question',
            name: 'How does MoneyLoop track my net worth?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'MoneyLoop automatically syncs with your bank accounts, investment accounts, real estate values, and other assets to calculate your real-time net worth.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I track investments and stocks?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! MoneyLoop tracks stocks, ETFs, mutual funds, 401(k)s, IRAs, and other investment accounts with real-time pricing and performance analytics.',
            },
        },
        {
            '@type': 'Question',
            name: 'How is MoneyLoop different from Mint or YNAB?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'MoneyLoop offers true wealth tracking including real estate, gold, and alternative assets - not just bank accounts. Plus, our AI-powered insights actively find savings opportunities.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I track real estate and property values?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! MoneyLoop tracks property values, rental income, mortgage balances, and equity growth for complete real estate portfolio visibility.',
            },
        },
    ],
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
    })),
});

export const getWebPageSchema = (page: keyof typeof PAGE_SEO) => {
    const seo = PAGE_SEO[page];
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seo.title,
        description: seo.description,
        url: `https://moneyloop.ai/${page === 'home' ? '' : page}`,
        isPartOf: {
            '@type': 'WebSite',
            name: 'MoneyLoop',
            url: 'https://moneyloop.ai',
        },
    };
};

// ===== SEO UTILITIES =====

export const generateMetaKeywords = (page: keyof typeof PAGE_SEO): string => {
    const pageKeywords = PAGE_SEO[page]?.keywords || [];
    const combined = [...new Set([...pageKeywords, ...SEO_KEYWORDS.primary])];
    return combined.slice(0, 20).join(', ');
};

export const generateCanonicalUrl = (path: string): string => {
    const cleanPath = path.replace(/\/$/, '').replace(/^\//, '');
    return `https://moneyloop.ai/${cleanPath}`;
};

export const generateAlternateLanguages = () => ({
    'en-US': 'https://moneyloop.ai',
    'x-default': 'https://moneyloop.ai',
});

// ===== OPENGRAPH HELPERS =====

export const getOgImage = (page: string) => ({
    url: `https://moneyloop.ai/og/${page}.png`,
    width: 1200,
    height: 630,
    alt: PAGE_SEO[page]?.title || 'MoneyLoop',
});

export const getTwitterMeta = (page: keyof typeof PAGE_SEO) => ({
    card: 'summary_large_image' as const,
    site: '@moneyloopai',
    title: PAGE_SEO[page]?.ogTitle || PAGE_SEO[page]?.title,
    description: PAGE_SEO[page]?.ogDescription || PAGE_SEO[page]?.description,
    images: [`https://moneyloop.ai/og/${page}.png`],
});

export default {
    SEO_KEYWORDS,
    PAGE_SEO,
    getOrganizationSchema,
    getSoftwareApplicationSchema,
    getFAQSchema,
    getBreadcrumbSchema,
    getWebPageSchema,
    generateMetaKeywords,
    generateCanonicalUrl,
};
