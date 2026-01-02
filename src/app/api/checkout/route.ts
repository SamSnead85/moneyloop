import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, PlanType } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { plan, successUrl, cancelUrl } = body;

        // Validate plan
        if (!plan || !Object.keys(PLANS).includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        const selectedPlan = PLANS[plan as PlanType];

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `MoneyLoop ${selectedPlan.name}`,
                            description: `${selectedPlan.name} plan - ${selectedPlan.features.slice(0, 3).join(', ')}`,
                        },
                        unit_amount: selectedPlan.price,
                        recurring: {
                            interval: selectedPlan.interval,
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${request.nextUrl.origin}/dashboard?checkout=success`,
            cancel_url: cancelUrl || `${request.nextUrl.origin}/?checkout=cancelled`,
            metadata: {
                plan: plan,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
