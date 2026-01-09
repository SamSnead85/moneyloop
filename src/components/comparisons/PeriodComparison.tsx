'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowLeftRight,
    Calendar,
    ChevronDown,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface PeriodData {
    label: string;
    income: number;
    expenses: number;
    savings: number;
    categories: Record<string, number>;
}

interface PeriodComparisonProps {
    currentPeriod: PeriodData;
    previousPeriod: PeriodData;
    periodType: 'month' | 'quarter' | 'year';
    onPeriodChange?: (type: 'month' | 'quarter' | 'year') => void;
    className?: string;
}

// ===== COMPONENT =====

export function PeriodComparison({
    currentPeriod,
    previousPeriod,
    periodType,
    onPeriodChange,
    className,
}: PeriodComparisonProps) {
    const [showAllCategories, setShowAllCategories] = useState(false);

    const getChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const incomeChange = getChange(currentPeriod.income, previousPeriod.income);
    const expenseChange = getChange(currentPeriod.expenses, previousPeriod.expenses);
    const savingsChange = getChange(currentPeriod.savings, previousPeriod.savings);

    // Category comparisons
    const categoryComparisons = useMemo(() => {
        const allCategories = new Set([
            ...Object.keys(currentPeriod.categories),
            ...Object.keys(previousPeriod.categories),
        ]);

        return Array.from(allCategories).map(cat => ({
            name: cat,
            current: currentPeriod.categories[cat] || 0,
            previous: previousPeriod.categories[cat] || 0,
            change: getChange(currentPeriod.categories[cat] || 0, previousPeriod.categories[cat] || 0),
        })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    }, [currentPeriod, previousPeriod]);

    const displayedCategories = showAllCategories
        ? categoryComparisons
        : categoryComparisons.slice(0, 5);

    const ChangeIndicator = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
        const isPositive = inverted ? value < 0 : value > 0;
        const isNeutral = Math.abs(value) < 1;

        return (
            <div className={cn(
                'flex items-center gap-1',
                isNeutral
                    ? 'text-[var(--text-tertiary)]'
                    : isPositive
                        ? 'text-[var(--accent-success)]'
                        : 'text-[var(--accent-danger)]'
            )}>
                {isNeutral ? (
                    <Minus className="w-4 h-4" />
                ) : isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                ) : (
                    <TrendingDown className="w-4 h-4" />
                )}
                <Text variant="mono-sm">
                    {value > 0 ? '+' : ''}{value.toFixed(1)}%
                </Text>
            </div>
        );
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ArrowLeftRight className="w-6 h-6 text-[var(--accent-primary)]" />
                        <div>
                            <Text variant="heading-lg">Period Comparison</Text>
                            <Text variant="body-sm" color="tertiary">
                                {currentPeriod.label} vs {previousPeriod.label}
                            </Text>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(['month', 'quarter', 'year'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => onPeriodChange?.(type)}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                                    periodType === type
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Comparison */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Income */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary" className="mb-3">Income</Text>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{currentPeriod.label}</Text>
                                <Text variant="mono-md" className="text-[var(--accent-success)]">
                                    {formatCurrency(currentPeriod.income)}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{previousPeriod.label}</Text>
                                <Text variant="mono-sm" color="tertiary">
                                    {formatCurrency(previousPeriod.income)}
                                </Text>
                            </div>
                            <Divider />
                            <ChangeIndicator value={incomeChange} />
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary" className="mb-3">Expenses</Text>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{currentPeriod.label}</Text>
                                <Text variant="mono-md" className="text-[var(--accent-danger)]">
                                    {formatCurrency(currentPeriod.expenses)}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{previousPeriod.label}</Text>
                                <Text variant="mono-sm" color="tertiary">
                                    {formatCurrency(previousPeriod.expenses)}
                                </Text>
                            </div>
                            <Divider />
                            <ChangeIndicator value={expenseChange} inverted />
                        </div>
                    </div>

                    {/* Savings */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary" className="mb-3">Savings</Text>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{currentPeriod.label}</Text>
                                <Text variant="mono-md" className={cn(
                                    currentPeriod.savings >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                                )}>
                                    {formatCurrency(currentPeriod.savings)}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text variant="caption" color="tertiary">{previousPeriod.label}</Text>
                                <Text variant="mono-sm" color="tertiary">
                                    {formatCurrency(previousPeriod.savings)}
                                </Text>
                            </div>
                            <Divider />
                            <ChangeIndicator value={savingsChange} />
                        </div>
                    </div>
                </div>
            </Surface>

            {/* Category Comparison */}
            <Surface elevation={1} className="p-6">
                <Text variant="heading-md" className="mb-4">Spending by Category</Text>

                <div className="space-y-4">
                    {displayedCategories.map(cat => {
                        const maxValue = Math.max(cat.current, cat.previous);

                        return (
                            <div key={cat.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <Text variant="body-sm">{cat.name}</Text>
                                    <ChangeIndicator value={cat.change} inverted />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <Text variant="caption" color="tertiary">{currentPeriod.label}</Text>
                                            <Text variant="mono-sm">{formatCurrency(cat.current)}</Text>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--surface-elevated-2)] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.current / maxValue) * 100}%` }}
                                                className="h-full rounded-full bg-[var(--accent-primary)]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <Text variant="caption" color="tertiary">{previousPeriod.label}</Text>
                                            <Text variant="mono-sm" color="tertiary">{formatCurrency(cat.previous)}</Text>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--surface-elevated-2)] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.previous / maxValue) * 100}%` }}
                                                className="h-full rounded-full bg-[var(--text-tertiary)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {categoryComparisons.length > 5 && (
                    <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="flex items-center gap-1 mt-4 text-sm text-[var(--accent-primary)] hover:underline"
                    >
                        {showAllCategories ? 'Show less' : `Show ${categoryComparisons.length - 5} more`}
                        <ChevronDown className={cn('w-4 h-4 transition-transform', showAllCategories && 'rotate-180')} />
                    </button>
                )}
            </Surface>
        </div>
    );
}

export default PeriodComparison;
