/**
 * Environment Configuration
 * 
 * Validates and exports environment variables with type safety.
 * Provides feature flags and configuration management.
 */

// Environment variable schema
const envSchema = {
    // Required
    NEXT_PUBLIC_SUPABASE_URL: { required: true },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: { required: true },

    // Optional with defaults
    GEMINI_API_KEY: { required: false },
    PLAID_CLIENT_ID: { required: false },
    PLAID_SECRET: { required: false },
    PLAID_ENV: { required: false, default: 'sandbox' },
    STRIPE_SECRET_KEY: { required: false },
    STRIPE_PUBLISHABLE_KEY: { required: false },

    // Feature flags
    ENABLE_AI_FEATURES: { required: false, default: 'true' },
    ENABLE_PLAID: { required: false, default: 'true' },
    ENABLE_PREMIUM: { required: false, default: 'true' },

    // App config
    NEXT_PUBLIC_APP_URL: { required: false, default: 'http://localhost:3000' },
    NODE_ENV: { required: false, default: 'development' },
} as const;

type EnvKey = keyof typeof envSchema;

/**
 * Validate environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
    const missing: string[] = [];
    const warnings: string[] = [];

    for (const [key, config] of Object.entries(envSchema)) {
        const value = process.env[key];

        if (config.required && !value) {
            missing.push(key);
        } else if (!config.required && !value && !('default' in config)) {
            warnings.push(`Optional env var ${key} is not set`);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
        warnings,
    };
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: EnvKey): string {
    const value = process.env[key];
    const config = envSchema[key];

    if (value) return value;
    if ('default' in config) return config.default as string;
    if (config.required) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    return '';
}

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Feature flags
 */
export const features = {
    aiEnabled: getEnv('ENABLE_AI_FEATURES') === 'true',
    plaidEnabled: getEnv('ENABLE_PLAID') === 'true',
    premiumEnabled: getEnv('ENABLE_PREMIUM') === 'true',
};

/**
 * App configuration
 */
export const config = {
    appUrl: getEnv('NEXT_PUBLIC_APP_URL'),
    supabaseUrl: getEnv('NEXT_PUBLIC_SUPABASE_URL'),

    // Limits
    maxTransactionsPerSync: 500,
    maxAccountsPerUser: 20,
    maxBudgetsPerUser: 50,
    maxGoalsPerUser: 20,

    // Cache TTLs (ms)
    cacheTTL: {
        accounts: 5 * 60 * 1000, // 5 minutes
        transactions: 2 * 60 * 1000, // 2 minutes
        budgets: 5 * 60 * 1000,
        healthScore: 10 * 60 * 1000, // 10 minutes
    },

    // Rate limits
    rateLimit: {
        api: { requests: 100, windowMs: 60 * 1000 }, // 100 req/min
        plaid: { requests: 10, windowMs: 60 * 1000 }, // 10 req/min
        ai: { requests: 20, windowMs: 60 * 1000 }, // 20 req/min
    },
};

/**
 * Plaid configuration
 */
export const plaidConfig = {
    clientId: getEnv('PLAID_CLIENT_ID'),
    secret: getEnv('PLAID_SECRET'),
    env: getEnv('PLAID_ENV') as 'sandbox' | 'development' | 'production',
    products: ['transactions', 'auth', 'identity'],
    countryCodes: ['US'],
};

/**
 * Stripe configuration
 */
export const stripeConfig = {
    secretKey: getEnv('STRIPE_SECRET_KEY'),
    publishableKey: getEnv('STRIPE_PUBLISHABLE_KEY'),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

/**
 * AI configuration
 */
export const aiConfig = {
    geminiApiKey: getEnv('GEMINI_API_KEY'),
    model: 'gemini-2.0-flash',
    maxTokens: 2000,
    temperature: 0.7,
};

/**
 * Log configuration on startup (dev only)
 */
export function logConfig(): void {
    if (!isDevelopment) return;

    const validation = validateEnv();

    console.log('\n🔧 MoneyLoop Configuration');
    console.log('========================');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`App URL: ${config.appUrl}`);
    console.log(`\nFeatures:`);
    console.log(`  AI: ${features.aiEnabled ? '✓' : '✗'}`);
    console.log(`  Plaid: ${features.plaidEnabled ? '✓' : '✗'}`);
    console.log(`  Premium: ${features.premiumEnabled ? '✓' : '✗'}`);

    if (validation.missing.length > 0) {
        console.log(`\n⚠️ Missing required env vars: ${validation.missing.join(', ')}`);
    }
    if (validation.warnings.length > 0) {
        console.log(`\n📝 Warnings:`);
        validation.warnings.forEach(w => console.log(`  - ${w}`));
    }
    console.log('');
}

export default {
    validateEnv,
    getEnv,
    isProduction,
    isDevelopment,
    isTest,
    features,
    config,
    plaidConfig,
    stripeConfig,
    aiConfig,
    logConfig,
};
