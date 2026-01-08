'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface SpendingCategory {
    category: string;
    amount: number;
    budget?: number;
    trend?: number; // Percentage change from last period
}

interface SpendingBreakdownProps {
    data?: SpendingCategory[];
    totalSpending?: number;
}

const categoryIcons: Record<string, string> = {
    'Housing': '🏠',
    'Food & Dining': '🍽️',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Utilities': '💡',
    'Healthcare': '🏥',
    'Insurance': '🛡️',
    'Subscriptions': '📺',
    'Travel': '✈️',
    'Personal': '✨',
    'Other': '📋',
};

const categoryColors: Record<string, { bar: string; bg: string }> = {
    'Housing': { bar: 'bg-blue-500', bg: 'bg-blue-500/10' },
    'Food & Dining': { bar: 'bg-amber-500', bg: 'bg-amber-500/10' },
    'Transportation': { bar: 'bg-purple-500', bg: 'bg-purple-500/10' },
    'Shopping': { bar: 'bg-cyan-500', bg: 'bg-cyan-500/10' },
    'Entertainment': { bar: 'bg-rose-500', bg: 'bg-rose-500/10' },
    'Utilities': { bar: 'bg-yellow-500', bg: 'bg-yellow-500/10' },
    'Healthcare': { bar: 'bg-red-500', bg: 'bg-red-500/10' },
    'Insurance': { bar: 'bg-indigo-500', bg: 'bg-indigo-500/10' },
    'Subscriptions': { bar: 'bg-pink-500', bg: 'bg-pink-500/10' },
    'Travel': { bar: 'bg-teal-500', bg: 'bg-teal-500/10' },
    'Personal': { bar: 'bg-violet-500', bg: 'bg-violet-500/10' },
    'Other': { bar: 'bg-slate-500', bg: 'bg-slate-500/10' },
};

// Sample data
const sampleData: SpendingCategory[] = [
    { category: 'Housing', amount: 2400, budget: 2500, trend: 0 },
    { category: 'Food & Dining', amount: 856, budget: 800, trend: 12 },
    { category: 'Transportation', amount: 420, budget: 500, trend: -8 },
    { category: 'Shopping', amount: 324, budget: 400, trend: 15 },
    { category: 'Entertainment', amount: 156, budget: 200, trend: -5 },
    { category: 'Subscriptions', amount: 89, budget: 100, trend: 0 },
    { category: 'Utilities', amount: 245, budget: 250, trend: 2 },
];

function SpendingRow({
    item,
    maxAmount,
    index
}: {
    item: SpendingCategory;
    maxAmount: number;
    index: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
    const isOverBudget = item.budget && item.amount > item.budget;
    const colors = categoryColors[item.category] || categoryColors['Other'];
    const icon = categoryIcons[item.category] || '📋';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div
                className="flex items-center gap-3 py-2 cursor-pointer group"
                onClick={() => setExpanded(!expanded)}
            >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                    <span className="text-base">{icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{item.category}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">${item.amount.toLocaleString()}</span>
                            {item.trend !== undefined && item.trend !== 0 && (
                                <span className={`text-xs flex items-center ${item.trend > 0 ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                    {item.trend > 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {Math.abs(item.trend)}%
                                </span>
                            )}
                            <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''
                                }`} />
                        </div>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : colors.bar
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="ml-12 pb-3 grid grid-cols-2 gap-2">
                            {item.budget && (
                                <div className="p-2 rounded-lg bg-white/[0.02]">
                                    <p className="text-[10px] text-slate-500">Budget</p>
                                    <p className="text-sm font-mono">${item.budget.toLocaleString()}</p>
                                </div>
                            )}
                            {item.budget && (
                                <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-500/10' : 'bg-emerald-500/10'
                                    }`}>
                                    <p className="text-[10px] text-slate-500">
                                        {isOverBudget ? 'Over Budget' : 'Remaining'}
                                    </p>
                                    <p className={`text-sm font-mono ${isOverBudget ? 'text-red-400' : 'text-emerald-400'
                                        }`}>
                                        {isOverBudget ? '+' : ''}${Math.abs(item.budget - item.amount).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function SpendingBreakdown({
    data,
    totalSpending
}: SpendingBreakdownProps) {
    const spendingData = data || sampleData;

    const { maxAmount, total } = useMemo(() => {
        const max = Math.max(...spendingData.map(d => d.amount));
        const sum = totalSpending || spendingData.reduce((s, d) => s + d.amount, 0);
        return { maxAmount: max, total: sum };
    }, [spendingData, totalSpending]);

    const sortedData = [...spendingData].sort((a, b) => b.amount - a.amount);

    return (
        <div>
            {/* Total */}
            <div className="mb-4 p-3 rounded-xl bg-white/[0.02]">
                <p className="text-xs text-slate-500 mb-1">Total Spending</p>
                <p className="text-2xl font-mono font-bold">${total.toLocaleString()}</p>
            </div>

            {/* Categories */}
            <div className="space-y-1">
                {sortedData.map((item, index) => (
                    <SpendingRow
                        key={item.category}
                        item={item}
                        maxAmount={maxAmount}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}

export default SpendingBreakdown;
