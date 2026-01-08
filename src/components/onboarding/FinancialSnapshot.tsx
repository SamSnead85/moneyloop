'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Surface, Text, Progress, MoneyAmount } from '@/components/primitives';
import { TrendingUp, TrendingDown, Minus, PiggyBank, CreditCard, Target } from 'lucide-react';

interface FinancialSnapshotProps {
    income?: number;
    expenses?: number;
    savings?: number;
    categories?: Array<{
        name: string;
        amount: number;
        color: string;
    }>;
    compact?: boolean;
}

export function FinancialSnapshot({
    income = 0,
    expenses = 0,
    savings = 0,
    categories = [],
    compact = false,
}: FinancialSnapshotProps) {
    const totalExpenses = expenses || categories.reduce((sum, c) => sum + c.amount, 0);
    const netCashflow = income - totalExpenses;
    const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;

    // Calculate category percentages
    const maxCategoryAmount = Math.max(...categories.map(c => c.amount), 1);

    const metrics = useMemo(() => [
        {
            label: 'Monthly Income',
            value: income,
            icon: TrendingUp,
            color: 'var(--accent-primary)',
        },
        {
            label: 'Monthly Expenses',
            value: totalExpenses,
            icon: CreditCard,
            color: 'var(--accent-danger)',
        },
        {
            label: 'Net Cashflow',
            value: netCashflow,
            icon: netCashflow >= 0 ? TrendingUp : TrendingDown,
            color: netCashflow >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
        },
    ], [income, totalExpenses, netCashflow]);

    if (compact) {
        return (
            <Surface elevation={1} className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <Text variant="body-sm" color="tertiary">Financial Overview</Text>
                    <Text variant="mono-sm" color={netCashflow >= 0 ? 'accent' : 'danger'}>
                        {netCashflow >= 0 ? '+' : ''}{netCashflow.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                    </Text>
                </div>

                {/* Compact bar visualization */}
                <div className="h-2 rounded-full bg-[var(--surface-elevated-2)] overflow-hidden flex">
                    {income > 0 && (
                        <motion.div
                            className="h-full bg-[var(--accent-primary)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100 - (totalExpenses / income) * 100, 100)}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                    {totalExpenses > 0 && (
                        <motion.div
                            className="h-full bg-[var(--accent-danger)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalExpenses / (income || totalExpenses)) * 100, 100)}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        />
                    )}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                        <span className="text-[var(--text-tertiary)]">Savings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-danger)]" />
                        <span className="text-[var(--text-tertiary)]">Expenses</span>
                    </div>
                </div>
            </Surface>
        );
    }

    return (
        <Surface elevation={1} className="p-6">
            <Text variant="heading-sm" className="mb-6">Financial Snapshot</Text>

            {/* Main Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center"
                    >
                        <div
                            className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: `color-mix(in srgb, ${metric.color} 15%, transparent)` }}
                        >
                            <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                        </div>
                        <Text variant="mono-md" style={{ color: metric.color }}>
                            {metric.value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0
                            })}
                        </Text>
                        <Text variant="body-sm" color="tertiary">{metric.label}</Text>
                    </motion.div>
                ))}
            </div>

            {/* Savings Rate Ring */}
            <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background ring */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="var(--surface-elevated-2)"
                            strokeWidth="8"
                        />
                        {/* Progress ring */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={savingsRate >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{
                                strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(Math.abs(savingsRate) / 100, 1))
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Text variant="mono-lg" color={savingsRate >= 0 ? 'accent' : 'danger'}>
                            {Math.round(Math.abs(savingsRate))}%
                        </Text>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="w-4 h-4 text-[var(--text-tertiary)]" />
                        <Text variant="body-md" color="secondary">Savings Rate</Text>
                    </div>
                    <Text variant="body-sm" color="tertiary">
                        {savingsRate >= 20
                            ? "You're on track for financial independence."
                            : savingsRate >= 10
                                ? "A solid savings rate. Consider increasing gradually."
                                : savingsRate > 0
                                    ? "Room for improvement. Let's find ways to save more."
                                    : "Spending exceeds income. Let's review your budget."
                        }
                    </Text>
                </div>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
                <div>
                    <Text variant="body-sm" color="tertiary" className="mb-4">
                        Expense Breakdown
                    </Text>
                    <div className="space-y-3">
                        {categories.slice(0, 5).map((category, i) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: category.color }}
                                />
                                <Text variant="body-sm" className="flex-1 truncate">
                                    {category.name}
                                </Text>
                                <Text variant="mono-sm" color="secondary">
                                    {category.amount.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        maximumFractionDigits: 0
                                    })}
                                </Text>
                                <div className="w-24">
                                    <Progress
                                        value={category.amount}
                                        max={maxCategoryAmount}
                                        size="sm"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {categories.length === 0 && income === 0 && (
                <div className="text-center py-8 opacity-50">
                    <Target className="w-8 h-8 mx-auto mb-3 text-[var(--text-quaternary)]" />
                    <Text variant="body-sm" color="tertiary">
                        Enter your income and expenses to see your financial snapshot
                    </Text>
                </div>
            )}
        </Surface>
    );
}

export default FinancialSnapshot;
