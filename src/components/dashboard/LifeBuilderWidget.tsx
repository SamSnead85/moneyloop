'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { LifeBuilder, LifeBuilderState } from '@/components/onboarding/LifeBuilder';
import { createClient } from '@/lib/supabase/client';

interface LifeBuilderWidgetProps {
    onCategoryClick?: (category: keyof LifeBuilderState) => void;
}

// Map database category names to LifeBuilder state keys
const categoryMap: Record<string, keyof LifeBuilderState> = {
    'Housing': 'housing',
    'Rent': 'housing',
    'Mortgage': 'housing',
    'Transportation': 'car',
    'Car Payment': 'car',
    'Auto': 'car',
    'Utilities': 'utilities',
    'Electric': 'utilities',
    'Gas & Electric': 'utilities',
    'Insurance': 'insurance',
    'Car Insurance': 'insurance',
    'Auto Insurance': 'insurance',
    'Phone': 'phone',
    'Cell Phone': 'phone',
    'Mobile': 'phone',
    'Groceries': 'groceries',
    'Food': 'groceries',
    'Dining': 'groceries',
    'Gas': 'gas',
    'Fuel': 'gas',
    'Shopping': 'shopping',
    'Clothing': 'shopping',
    'Personal': 'shopping',
};

export function LifeBuilderWidget({ onCategoryClick }: LifeBuilderWidgetProps) {
    const [lifeState, setLifeState] = useState<Partial<LifeBuilderState>>({});
    const [warnings, setWarnings] = useState<Partial<Record<keyof LifeBuilderState, boolean>>>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchFinancialData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch income
                const { data: incomeData } = await supabase
                    .from('income_sources')
                    .select('amount, frequency')
                    .eq('user_id', user.id);

                // Calculate monthly income
                let monthlyIncome = 0;
                if (incomeData) {
                    incomeData.forEach(source => {
                        const amount = source.amount || 0;
                        switch (source.frequency) {
                            case 'weekly': monthlyIncome += amount * 4.33; break;
                            case 'biweekly': monthlyIncome += amount * 2.17; break;
                            case 'monthly': monthlyIncome += amount; break;
                            case 'annually': monthlyIncome += amount / 12; break;
                            default: monthlyIncome += amount;
                        }
                    });
                }

                // Fetch bills/expenses
                const { data: billsData } = await supabase
                    .from('bills')
                    .select('amount, category, due_date, status')
                    .eq('user_id', user.id);

                // Aggregate by category and check for overdue
                const state: Partial<LifeBuilderState> = { income: monthlyIncome };
                const warningState: Partial<Record<keyof LifeBuilderState, boolean>> = {};

                if (billsData) {
                    billsData.forEach(bill => {
                        const key = categoryMap[bill.category];
                        if (key) {
                            state[key] = (state[key] || 0) + (bill.amount || 0);

                            // Check if overdue
                            if (bill.status === 'overdue' ||
                                (bill.due_date && new Date(bill.due_date) < new Date() && bill.status !== 'paid')) {
                                warningState[key] = true;
                            }
                        }
                    });
                }

                // Fetch subscriptions
                const { data: subsData } = await supabase
                    .from('subscriptions')
                    .select('amount, category')
                    .eq('user_id', user.id)
                    .eq('status', 'active');

                if (subsData) {
                    subsData.forEach(sub => {
                        const key = categoryMap[sub.category];
                        if (key) {
                            state[key] = (state[key] || 0) + (sub.amount || 0);
                        }
                    });
                }

                setLifeState(state);
                setWarnings(warningState);
            } catch (error) {
                console.error('Error fetching financial data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFinancialData();
    }, [supabase]);

    // Check overall health
    const hasWarnings = Object.values(warnings).some(Boolean);
    const filledCategories = Object.values(lifeState).filter(v => (v ?? 0) > 0).length;
    const healthScore = Math.round((filledCategories / 9) * 100);

    if (loading) {
        return (
            <div className="bg-white/[0.02] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                    <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${hasWarnings ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}
                    >
                        {hasWarnings ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium">Your Financial Life</h3>
                        <p className="text-xs text-slate-500">
                            {hasWarnings
                                ? 'Some bills need attention'
                                : filledCategories > 5
                                    ? 'Looking healthy!'
                                    : 'Add more expenses to complete your picture'}
                        </p>
                    </div>
                </div>
                <Link
                    href="/onboarding"
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    Edit <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* LifeBuilder Visual */}
            <div className="p-4">
                <LifeBuilder
                    state={lifeState}
                    warnings={warnings}
                    onElementClick={onCategoryClick}
                    compact={true}
                />
            </div>

            {/* Quick Stats */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                    <p className="text-lg font-mono font-bold text-emerald-400">
                        ${Math.round(lifeState.income || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">Monthly Income</p>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                    <p className="text-lg font-mono font-bold text-slate-300">
                        {filledCategories}/8
                    </p>
                    <p className="text-[10px] text-slate-500">Categories</p>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                    <p className={`text-lg font-mono font-bold ${hasWarnings ? 'text-red-400' : 'text-emerald-400'}`}>
                        {hasWarnings ? '⚠️' : '✓'}
                    </p>
                    <p className="text-[10px] text-slate-500">{hasWarnings ? 'Needs Attention' : 'All Good'}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default LifeBuilderWidget;
