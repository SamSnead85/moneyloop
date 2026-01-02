import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable body parsing to get raw body for webhook signature verification
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Lazy-initialize Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        console.warn('Supabase credentials not configured');
        return null;
    }
    return createClient(url, key);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature || !webhookSecret) {
            console.log('Webhook received without signature - running in test mode');
            // Allow test mode without signature verification
            if (process.env.NODE_ENV === 'development') {
                const testEvent = JSON.parse(body);
                return handleEvent(testEvent);
            }
            return NextResponse.json(
                { error: 'Missing signature or webhook secret' },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        return handleEvent(event);
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleEvent(event: Stripe.Event) {
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('Checkout completed:', session.id);

            // Get customer email and plan from session
            const customerEmail = session.customer_email;
            const plan = session.metadata?.plan || 'premium';
            const stripeCustomerId = session.customer as string;

            if (customerEmail) {
                // Update user subscription tier in Supabase
                const supabase = getSupabaseAdmin();
                if (!supabase) {
                    console.warn('Supabase not configured, skipping profile update');
                    break;
                }
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: plan,
                        stripe_customer_id: stripeCustomerId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', customerEmail);

                if (error) {
                    console.error('Error updating profile:', error);
                } else {
                    console.log(`Updated subscription for ${customerEmail} to ${plan}`);
                }
            }
            break;
        }

        case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('Subscription created:', subscription.id);
            await updateSubscriptionStatus(subscription, 'active');
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('Subscription updated:', subscription.id);

            // Map Stripe status to our tier
            let tier = 'premium';
            if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                tier = 'free';
            }

            await updateSubscriptionByCustomerId(subscription.customer as string, tier);
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('Subscription cancelled:', subscription.id);

            // Downgrade to free tier
            await updateSubscriptionByCustomerId(subscription.customer as string, 'free');
            break;
        }

        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Payment succeeded:', invoice.id);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Payment failed:', invoice.id);

            // Could downgrade to free or send notification
            if (invoice.customer) {
                // Keep premium but could implement grace period logic here
                console.log(`Payment failed for customer: ${invoice.customer}`);
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

async function updateSubscriptionStatus(subscription: Stripe.Subscription, status: string) {
    const customerId = subscription.customer as string;
    await updateSubscriptionByCustomerId(customerId, status === 'active' ? 'premium' : 'free');
}

async function updateSubscriptionByCustomerId(customerId: string, tier: string) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.warn('Supabase not configured, skipping subscription update');
        return;
    }
    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_tier: tier,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

    if (error) {
        console.error('Error updating subscription:', error);
    } else {
        console.log(`Updated customer ${customerId} to tier: ${tier}`);
    }
}
