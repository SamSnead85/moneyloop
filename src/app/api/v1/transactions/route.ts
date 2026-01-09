import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin bypass
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

// Demo transactions data
const DEMO_TRANSACTIONS = [
    { id: 'txn_1', date: '2026-01-08', name: 'Whole Foods Market', amount: -156.32, category: 'Groceries' },
    { id: 'txn_2', date: '2026-01-07', name: 'Amazon.com', amount: -89.99, category: 'Shopping' },
    { id: 'txn_3', date: '2026-01-07', name: 'Starbucks', amount: -7.45, category: 'Food & Drink' },
    { id: 'txn_4', date: '2026-01-06', name: 'ACME Corp - Payroll', amount: 4230.00, category: 'Income' },
    { id: 'txn_5', date: '2026-01-06', name: 'Netflix', amount: -22.99, category: 'Entertainment' },
    { id: 'txn_6', date: '2026-01-05', name: 'Shell Gas Station', amount: -48.50, category: 'Transportation' },
    { id: 'txn_7', date: '2026-01-04', name: 'Uber Trip', amount: -24.80, category: 'Transportation' },
    { id: 'txn_8', date: '2026-01-03', name: 'Apple.com', amount: -2.99, category: 'Subscriptions' },
    { id: 'txn_9', date: '2026-01-02', name: 'Target', amount: -123.45, category: 'Shopping' },
    { id: 'txn_10', date: '2026-01-01', name: 'Rent Payment', amount: -2200.00, category: 'Housing' },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const category = searchParams.get('category');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        // Validate API key from header
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');

        // Check for admin bypass cookie
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        let userId: string | undefined;

        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            // Admin bypass - return filtered demo data
            let transactions = [...DEMO_TRANSACTIONS];

            if (category) {
                transactions = transactions.filter(t =>
                    t.category.toLowerCase() === category.toLowerCase()
                );
            }
            if (startDate) {
                transactions = transactions.filter(t => t.date >= startDate);
            }
            if (endDate) {
                transactions = transactions.filter(t => t.date <= endDate);
            }

            return NextResponse.json({
                success: true,
                data: transactions.slice(offset, offset + limit),
                meta: {
                    total: transactions.length,
                    limit,
                    offset,
                    has_more: offset + limit < transactions.length,
                },
            });
        }

        if (apiKey) {
            userId = 'api-user';
        } else if (authHeader?.startsWith('Bearer ')) {
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

        // Fetch transactions from Supabase
        const supabase = await createClient();
        let query = supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (category) {
            query = query.eq('category', category);
        }
        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }

        const { data: transactions, error, count } = await query;

        if (error) {
            return NextResponse.json(
                { error: 'Database error', message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: transactions || DEMO_TRANSACTIONS,
            meta: {
                total: count || DEMO_TRANSACTIONS.length,
                limit,
                offset,
                has_more: (count || DEMO_TRANSACTIONS.length) > offset + limit,
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
