import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

// Pricing plan configurations
// Production-ready pricing with savings guarantee
export const PLANS = {
    premium: {
        name: 'Premium',
        price: 3900, // $39.00 in cents
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Unlimited account connections',
            'Real-time wealth dashboard',
            'AI-powered savings finder',
            'Subscription optimizer',
            'Investment analytics',
            'Tax insights',
            'Priority support',
        ],
    },
    // Keep 'professional' key for API backwards compatibility
    professional: {
        name: 'Premium',
        price: 3900, // $39.00 in cents
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Unlimited account connections',
            'Real-time wealth dashboard',
            'AI-powered savings finder',
            'Subscription optimizer',
            'Investment analytics',
            'Tax insights',
            'Priority support',
        ],
    },
    family: {
        name: 'Family',
        price: 7900, // $79.00 in cents
        priceId: process.env.STRIPE_FAMILY_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Everything in Premium',
            'Up to 5 family members',
            'Shared wealth dashboards',
            'Family financial goals',
            'Estate planning tools',
            'Dedicated success manager',
        ],
    },
    // Keep 'business' key for API backwards compatibility
    business: {
        name: 'Family',
        price: 7900, // $79.00 in cents
        priceId: process.env.STRIPE_FAMILY_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Everything in Premium',
            'Up to 5 family members',
            'Shared wealth dashboards',
            'Family financial goals',
            'Estate planning tools',
            'Dedicated success manager',
        ],
    },
} as const;

export type PlanType = keyof typeof PLANS;
