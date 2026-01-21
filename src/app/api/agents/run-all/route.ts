/**
 * Run All Agents API - POST /api/agents/run-all
 * 
 * Triggers execution of all agents with user's complete financial data.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAllAgents } from '@/lib/agents';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch all financial data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            { data: bills },
            { data: subscriptions },
            { data: transactions },
            { data: profile },
        ] = await Promise.all([
            supabase.from('bills').select('*').eq('user_id', user.id).eq('is_active', true),
            supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('is_active', true),
            supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString()),
            supabase.from('profiles').select('monthly_income').eq('id', user.id).single(),
        ]);

        // Transform bills
        const formattedBills = (bills || []).map(b => ({
            id: b.id,
            name: b.name,
            vendor: b.vendor || b.name,
            amount: b.amount,
            category: b.category || 'other',
            frequency: b.frequency || 'monthly',
            dueDate: b.due_date,
            autoPayEnabled: b.auto_pay,
        }));

        // Transform subscriptions
        const formattedSubscriptions = (subscriptions || []).map(s => ({
            id: s.id,
            name: s.name,
            amount: s.amount,
            frequency: s.frequency || 'monthly',
            lastUsed: s.last_used,
            signupDate: s.created_at,
            freeTrialEnd: s.trial_ends_at,
            isActive: true,
            autoRenew: s.auto_renew ?? true,
        }));

        // Transform transactions and calculate category spending
        const formattedTransactions = (transactions || []).map(t => ({
            id: t.id,
            name: t.name,
            amount: t.amount,
            category: t.category || 'uncategorized',
            date: new Date(t.date),
            merchant: t.merchant_name,
        }));

        const categoryTotals: Record<string, { amount: number; count: number }> = {};
        for (const tx of (transactions || [])) {
            const cat = tx.category || 'uncategorized';
            if (!categoryTotals[cat]) categoryTotals[cat] = { amount: 0, count: 0 };
            categoryTotals[cat].amount += Math.abs(tx.amount);
            categoryTotals[cat].count++;
        }

        const monthlyIncome = profile?.monthly_income ||
            (transactions || []).filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

        const categorySpending = Object.entries(categoryTotals).map(([cat, data]) => ({
            category: cat,
            amount: data.amount,
            transactionCount: data.count,
            percentOfIncome: monthlyIncome > 0 ? (data.amount / monthlyIncome) * 100 : 0,
        }));

        // Run all agents
        const result = await runAllAgents({
            bills: formattedBills,
            subscriptions: formattedSubscriptions,
            transactions: formattedTransactions,
            categorySpending,
            monthlyIncome,
        });

        return NextResponse.json({
            success: true,
            taskIds: result.taskIds,
        });
    } catch (error) {
        console.error('Error running all agents:', error);
        return NextResponse.json(
            { error: 'Failed to run agents' },
            { status: 500 }
        );
    }
}
