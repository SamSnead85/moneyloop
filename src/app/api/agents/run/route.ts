/**
 * Agent Run API - POST /api/agents/run
 * 
 * Triggers execution of a specific agent with user's financial data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queueAgentTask, AgentType } from '@/lib/agents';

export async function POST(request: NextRequest) {
    try {
        const { agentType } = await request.json() as { agentType: AgentType };

        if (!agentType) {
            return NextResponse.json(
                { error: 'agentType is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user's financial data based on agent type
        let metadata: Record<string, unknown> = { userId: user.id };

        switch (agentType) {
            case 'bill_negotiator': {
                // Fetch bills
                const { data: bills } = await supabase
                    .from('bills')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true);

                metadata.bills = (bills || []).map(b => ({
                    id: b.id,
                    name: b.name,
                    vendor: b.vendor || b.name,
                    amount: b.amount,
                    category: b.category || 'other',
                    frequency: b.frequency || 'monthly',
                    dueDate: b.due_date,
                    autoPayEnabled: b.auto_pay,
                }));
                break;
            }
            case 'subscription_optimizer': {
                // Fetch subscriptions
                const { data: subscriptions } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true);

                metadata.subscriptions = (subscriptions || []).map(s => ({
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
                break;
            }
            case 'savings_finder': {
                // Fetch transactions and calculate category spending
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('date', thirtyDaysAgo.toISOString())
                    .order('date', { ascending: false });

                metadata.transactions = (transactions || []).map(t => ({
                    id: t.id,
                    name: t.name,
                    amount: t.amount,
                    category: t.category || 'uncategorized',
                    date: new Date(t.date),
                    merchant: t.merchant_name,
                }));

                // Calculate category spending
                const categoryTotals: Record<string, { amount: number; count: number }> = {};
                for (const tx of (transactions || [])) {
                    const cat = tx.category || 'uncategorized';
                    if (!categoryTotals[cat]) categoryTotals[cat] = { amount: 0, count: 0 };
                    categoryTotals[cat].amount += Math.abs(tx.amount);
                    categoryTotals[cat].count++;
                }

                // Get monthly income from profile or calculate from deposits
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('monthly_income')
                    .eq('id', user.id)
                    .single();

                const monthlyIncome = profile?.monthly_income ||
                    (transactions || [])
                        .filter(t => t.amount > 0)
                        .reduce((sum, t) => sum + t.amount, 0);

                metadata.categorySpending = Object.entries(categoryTotals).map(([cat, data]) => ({
                    category: cat,
                    amount: data.amount,
                    transactionCount: data.count,
                    percentOfIncome: monthlyIncome > 0 ? (data.amount / monthlyIncome) * 100 : 0,
                }));
                metadata.monthlyIncome = monthlyIncome;
                break;
            }
            case 'budget_analyzer': {
                // Fetch budgets
                const { data: budgets } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('user_id', user.id);

                metadata.budgets = budgets || [];
                break;
            }
        }

        // Queue the agent task
        const task = queueAgentTask(agentType, 'high', metadata);

        return NextResponse.json({
            success: true,
            taskId: task.id,
            status: task.status,
        });
    } catch (error) {
        console.error('Error running agent:', error);
        return NextResponse.json(
            { error: 'Failed to run agent' },
            { status: 500 }
        );
    }
}
