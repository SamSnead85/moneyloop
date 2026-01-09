import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin bypass
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

// Webhook event types
type WebhookEventType =
    | 'transaction.created'
    | 'transaction.updated'
    | 'budget.exceeded'
    | 'goal.reached'
    | 'bill.due'
    | 'account.synced';

interface WebhookConfig {
    id: string;
    url: string;
    events: WebhookEventType[];
    secret: string;
    active: boolean;
    createdAt: string;
}

// Demo webhooks
const DEMO_WEBHOOKS: WebhookConfig[] = [
    {
        id: 'whk_1',
        url: 'https://example.com/webhooks/moneyloop',
        events: ['transaction.created', 'budget.exceeded'],
        secret: 'whsec_xxxxxxxxxxxxx',
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
    },
];

// GET - List webhooks
export async function GET(request: NextRequest) {
    try {
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            return NextResponse.json({
                success: true,
                data: DEMO_WEBHOOKS.map(w => ({
                    ...w,
                    secret: w.secret.slice(0, 10) + '***', // Mask secret
                })),
            });
        }

        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // In production, fetch from database
        return NextResponse.json({
            success: true,
            data: [],
        });
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create webhook
export async function POST(request: NextRequest) {
    try {
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        if (!adminBypassCookie?.value) {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        const body = await request.json();
        const { url, events } = body;

        if (!url || !events || !Array.isArray(events)) {
            return NextResponse.json(
                { error: 'Missing required fields: url, events' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Generate webhook secret
        const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`;

        const webhook: WebhookConfig = {
            id: `whk_${crypto.randomUUID().slice(0, 8)}`,
            url,
            events,
            secret,
            active: true,
            createdAt: new Date().toISOString(),
        };

        // In production, save to database

        return NextResponse.json({
            success: true,
            data: webhook,
            message: 'Webhook created successfully. Save the secret - it won\'t be shown again.',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove webhook
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const webhookId = searchParams.get('id');

        if (!webhookId) {
            return NextResponse.json(
                { error: 'Missing webhook ID' },
                { status: 400 }
            );
        }

        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        if (!adminBypassCookie?.value) {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        // In production, delete from database

        return NextResponse.json({
            success: true,
            message: 'Webhook deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
