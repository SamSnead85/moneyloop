import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    estimateCreditScore,
    calculateAvalanchePayoff,
    calculateSnowballPayoff,
    compareStrategies,
    calculateCreditUtilization,
    getDebtFreedomDate,
    type Debt,
} from '@/lib/credit/credit-manager';

/**
 * Credit Management API Routes
 * 
 * Endpoints for credit score, debt payoff strategies,
 * and credit utilization.
 */

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'score':
                // In production, would fetch real data
                const mockCreditData = {
                    creditUtilization: 0.25,
                    paymentHistory: 0.97,
                    accountAge: 48,
                    accountCount: 4,
                    hardInquiries: 1,
                    derogatoriesCount: 0,
                };
                const score = estimateCreditScore(mockCreditData);
                return NextResponse.json({ score });

            case 'utilization':
                const accountsParam = searchParams.get('accounts');
                const accounts = accountsParam ? JSON.parse(accountsParam) : [];
                const utilization = calculateCreditUtilization(accounts);
                return NextResponse.json({ utilization });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: score, utilization' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Credit API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch credit data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, debts, monthlyBudget, method } = body;

        if (!debts || !Array.isArray(debts)) {
            return NextResponse.json(
                { error: 'Debts array is required' },
                { status: 400 }
            );
        }

        const parsedDebts: Debt[] = debts.map((d: Record<string, unknown>) => ({
            id: d.id as string || `debt_${Date.now()}`,
            name: d.name as string,
            type: d.type as Debt['type'] || 'other',
            balance: d.balance as number,
            creditLimit: d.creditLimit as number | undefined,
            interestRate: d.interestRate as number,
            minimumPayment: d.minimumPayment as number,
            dueDate: d.dueDate as number || 1,
            lender: d.lender as string || 'Unknown',
        }));

        switch (action) {
            case 'payoff-avalanche':
                const avalanche = calculateAvalanchePayoff(parsedDebts, monthlyBudget);
                return NextResponse.json({ strategy: avalanche });

            case 'payoff-snowball':
                const snowball = calculateSnowballPayoff(parsedDebts, monthlyBudget);
                return NextResponse.json({ strategy: snowball });

            case 'compare':
                const comparison = compareStrategies(parsedDebts, monthlyBudget);
                return NextResponse.json({ comparison });

            case 'freedom-date':
                const freedomMethod = method || 'avalanche';
                const freedom = getDebtFreedomDate(parsedDebts, monthlyBudget, freedomMethod);
                return NextResponse.json({
                    freedomDate: freedom.date.toISOString(),
                    strategy: freedom.strategy,
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: payoff-avalanche, payoff-snowball, compare, freedom-date' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Credit API error:', error);
        return NextResponse.json(
            { error: 'Failed to process credit request' },
            { status: 500 }
        );
    }
}
