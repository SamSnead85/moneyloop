import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing to get raw body for webhook signature verification
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature || !webhookSecret) {
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

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Checkout completed:', session.id);
                // TODO: Provision user access, update database, send welcome email
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription created:', subscription.id);
                // TODO: Update user subscription status in database
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription updated:', subscription.id);
                // TODO: Handle plan changes, upgrades/downgrades
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription cancelled:', subscription.id);
                // TODO: Revoke access, update database
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('Payment succeeded:', invoice.id);
                // TODO: Update billing records
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('Payment failed:', invoice.id);
                // TODO: Send payment failure notification
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
