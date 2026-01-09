import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin bypass
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

// Demo accounts data for API response
const DEMO_ACCOUNTS = [
    {
        id: 'acc_demo_1',
        name: 'Main Checking',
        type: 'depository',
        subtype: 'checking',
        balance: 12847.32,
        currency: 'USD',
        institution: 'Bank of America',
        last_synced: new Date().toISOString(),
    },
    {
        id: 'acc_demo_2',
        name: 'Savings Account',
        type: 'depository',
        subtype: 'savings',
        balance: 44802.18,
        currency: 'USD',
        institution: 'Bank of America',
        last_synced: new Date().toISOString(),
    },
    {
        id: 'acc_demo_3',
        name: 'Investment Portfolio',
        type: 'investment',
        subtype: 'brokerage',
        balance: 127320.45,
        currency: 'USD',
        institution: 'Fidelity',
        last_synced: new Date().toISOString(),
    },
];

export async function GET(request: NextRequest) {
    try {
        // Validate API key from header
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');

        // Check for admin bypass cookie
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        let userId: string | undefined;

        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            // Admin bypass - return demo data
            return NextResponse.json({
                success: true,
                data: DEMO_ACCOUNTS,
                meta: {
                    count: DEMO_ACCOUNTS.length,
                    total_balance: DEMO_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0),
                },
            });
        }

        if (apiKey) {
            // API key authentication (for external developers)
            // In production, validate against stored API keys
            // For now, allow any key for demo
            userId = 'api-user';
        } else if (authHeader?.startsWith('Bearer ')) {
            // Bearer token auth (JWT from Supabase)
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'Invalid or expired token' },
                    { status: 401 }
                );
            }
            userId = user.id;
        } else {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Provide API key via x-api-key header or Bearer token'
                },
                { status: 401 }
            );
        }

        // Fetch accounts from Supabase
        const supabase = await createClient();
        const { data: accounts, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return NextResponse.json(
                { error: 'Database error', message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: accounts || DEMO_ACCOUNTS,
            meta: {
                count: (accounts || DEMO_ACCOUNTS).length,
                total_balance: (accounts || DEMO_ACCOUNTS).reduce((sum, a: { balance?: number }) =>
                    sum + (a.balance || 0), 0),
            },
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
