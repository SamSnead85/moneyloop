import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

// Pricing plan configurations
export const PLANS = {
    personal: {
        name: 'Personal',
        price: 900, // $9.00 in cents
        priceId: process.env.STRIPE_PERSONAL_PRICE_ID, // Set this after creating products in Stripe
        interval: 'month' as const,
        features: [
            'Unlimited account connections',
            'Real-time dashboard',
            'AI spending insights',
            'Subscription tracking',
            'Monthly forecasting',
        ],
    },
    professional: {
        name: 'Professional',
        price: 2900, // $29.00 in cents
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Everything in Personal',
            'Business & personal views',
            'Tax-relevant categorization',
            'Burn rate & runway tracking',
            'Vendor expense management',
            'Priority support',
        ],
    },
    business: {
        name: 'Business',
        price: 7900, // $79.00 in cents
        priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
        interval: 'month' as const,
        features: [
            'Everything in Professional',
            'Multi-user access',
            'Advanced forecasting',
            'Custom integrations',
            'API access',
            'Dedicated success manager',
        ],
    },
} as const;

export type PlanType = keyof typeof PLANS;
