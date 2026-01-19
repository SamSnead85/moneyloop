'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Layers,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PiggyBank,
    Building2,
    Home,
    Eye,
    EyeOff,
    ArrowRight,
    Briefcase,
} from 'lucide-react';
import { useHousehold, FinanceContext } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

interface ContextSummary {
    context: FinanceContext | null;
    label: string;
    income: number;
    expenses: number;
    balance: number;
    accountCount: number;
    transactionCount: number;
}

interface UnifiedDashboardProps {
    accounts?: Array<{
        id: string;
        context_id: string | null;
        balance: number;
        type: string;
    }>;
    transactions?: Array<{
        id: string;
        context_id: string | null;
        amount: number;
        date: string;
    }>;
}

export function UnifiedDashboard({ accounts = [], transactions = [] }: UnifiedDashboardProps) {
    const { contexts, currentContext, setCurrentContext } = useHousehold();
    const [showDetails, setShowDetails] = useState(true);

    // Calculate summaries for each context
    const contextSummaries = useMemo<ContextSummary[]>(() => {
        const summaries: ContextSummary[] = [];

        // Add "All" context
        const allIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const allExpenses = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const allBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

        summaries.push({
            context: null,
            label: 'All Finances',
            income: allIncome,
            expenses: allExpenses,
            balance: allBalance,
            accountCount: accounts.length,
            transactionCount: transactions.length,
        });

        // Add each context
        contexts.forEach(ctx => {
            const ctxAccounts = accounts.filter(a => a.context_id === ctx.id);
            const ctxTransactions = transactions.filter(t => t.context_id === ctx.id);

            const income = ctxTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);
            const expenses = ctxTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const balance = ctxAccounts.reduce((sum, a) => sum + a.balance, 0);

            summaries.push({
                context: ctx,
                label: ctx.name,
                income,
                expenses,
                balance,
                accountCount: ctxAccounts.length,
                transactionCount: ctxTransactions.length,
            });
        });

        return summaries;
    }, [contexts, accounts, transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getContextIcon = (ctx: FinanceContext | null) => {
        if (!ctx) return Layers;
        switch (ctx.type) {
            case 'personal': return Home;
            case 'business': return Briefcase;
            case 'investment': return TrendingUp;
            default: return Building2;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-100">Unified Financial View</h2>
                    <p className="text-sm text-zinc-500">
                        See all your finances at a glance, separated by context
                    </p>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-400"
                >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {/* Combined Total */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900 border border-zinc-700/50"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-400">Total Net Worth</p>
                        <p className="text-3xl font-bold font-mono text-zinc-100">
                            {formatCurrency(contextSummaries[0]?.balance || 0)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700/50">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Income</span>
                        </div>
                        <p className="text-xl font-mono text-zinc-200">
                            {formatCurrency(contextSummaries[0]?.income || 0)}
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-red-400 mb-1">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm">Expenses</span>
                        </div>
                        <p className="text-xl font-mono text-zinc-200">
                            {formatCurrency(contextSummaries[0]?.expenses || 0)}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Context Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contextSummaries.slice(1).map((summary, index) => {
                    const Icon = getContextIcon(summary.context);
                    const isSelected = currentContext?.id === summary.context?.id;

                    return (
                        <motion.div
                            key={summary.context?.id || 'all'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setCurrentContext(summary.context)}
                            className={cn(
                                'p-5 rounded-xl border cursor-pointer transition-all',
                                'bg-zinc-900/60 hover:bg-zinc-800/60',
                                isSelected
                                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                                    : 'border-zinc-800 hover:border-zinc-700'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: `${summary.context?.color || '#34d399'}20` }}
                                    >
                                        <Icon
                                            className="w-5 h-5"
                                            style={{ color: summary.context?.color || '#34d399' }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-200">{summary.label}</p>
                                        {summary.context?.tax_separate && (
                                            <span className="text-xs text-orange-400">Tax Separate</span>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-600" />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Balance</p>
                                    <p className="text-xl font-mono font-semibold text-zinc-100">
                                        {formatCurrency(summary.balance)}
                                    </p>
                                </div>

                                {showDetails && (
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                                        <div>
                                            <p className="text-xs text-zinc-500">Income</p>
                                            <p className="text-sm font-mono text-emerald-400">
                                                +{formatCurrency(summary.income)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Expenses</p>
                                            <p className="text-sm font-mono text-red-400">
                                                -{formatCurrency(summary.expenses)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <span>{summary.accountCount} accounts</span>
                                    <span>{summary.transactionCount} transactions</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Tax Preparation Notice */}
            {contexts.some(c => c.tax_separate) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
                >
                    <div className="flex items-center gap-3">
                        <PiggyBank className="w-5 h-5 text-orange-400" />
                        <div>
                            <p className="font-medium text-orange-400">Tax Preparation Ready</p>
                            <p className="text-sm text-zinc-400">
                                Your business and personal finances are separated for easy tax preparation.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default UnifiedDashboard;
