'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Edit2,
    Trash2,
    Calendar,
    Target,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface BudgetCategory {
    id: string;
    name: string;
    icon?: string;
    color: string;
    budgeted: number;
    spent: number;
    rollover?: number;
}

export interface Budget {
    id: string;
    name: string;
    period: 'monthly' | 'weekly' | 'yearly';
    startDate: string;
    income: number;
    categories: BudgetCategory[];
}

interface BudgetDashboardProps {
    budget: Budget;
    onEditBudget?: (budget: Budget) => void;
    onEditCategory?: (category: BudgetCategory) => void;
    onAddCategory?: () => void;
}

// ===== COMPONENT =====

export function BudgetDashboard({
    budget,
    onEditBudget,
    onEditCategory,
    onAddCategory,
}: BudgetDashboardProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'name' | 'spent' | 'remaining'>('spent');

    // Calculate totals
    const totals = useMemo(() => {
        const totalBudgeted = budget.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
        const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
        const totalRemaining = totalBudgeted - totalSpent;
        const percentUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
        const unassigned = budget.income - totalBudgeted;

        return { totalBudgeted, totalSpent, totalRemaining, percentUsed, unassigned };
    }, [budget]);

    // Sort categories
    const sortedCategories = useMemo(() => {
        return [...budget.categories].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'spent':
                    return b.spent - a.spent;
                case 'remaining':
                    return (b.budgeted - b.spent) - (a.budgeted - a.spent);
                default:
                    return 0;
            }
        });
    }, [budget.categories, sortBy]);

    // Get status for a category
    const getCategoryStatus = (cat: BudgetCategory) => {
        const percentUsed = cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0;
        if (percentUsed >= 100) return 'over';
        if (percentUsed >= 80) return 'warning';
        return 'ok';
    };

    // Toggle category expansion
    const toggleCategory = (id: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Get current period label
    const periodLabel = budget.period === 'monthly'
        ? new Date(budget.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : budget.period === 'weekly'
            ? 'This Week'
            : new Date(budget.startDate).getFullYear().toString();

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Text variant="heading-lg">{budget.name}</Text>
                            <Badge variant="info">{periodLabel}</Badge>
                        </div>
                        <Text variant="body-sm" color="tertiary">
                            Income: {formatCurrency(budget.income)}
                        </Text>
                    </div>
                    <button
                        onClick={() => onEditBudget?.(budget)}
                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                        <Edit2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                </div>

                {/* Main Progress */}
                <div className="mb-6">
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <Text variant="body-sm" color="tertiary">Spent</Text>
                            <Text variant="heading-lg" className="font-mono">
                                {formatCurrency(totals.totalSpent)}
                            </Text>
                        </div>
                        <div className="text-right">
                            <Text variant="body-sm" color="tertiary">of {formatCurrency(totals.totalBudgeted)}</Text>
                            <Text
                                variant="heading-md"
                                color={totals.totalRemaining >= 0 ? 'accent' : 'danger'}
                                className="font-mono"
                            >
                                {totals.totalRemaining >= 0 ? '' : '-'}
                                {formatCurrency(Math.abs(totals.totalRemaining))} left
                            </Text>
                        </div>
                    </div>
                    <Progress
                        value={Math.min(totals.percentUsed, 100)}
                        variant={totals.percentUsed >= 100 ? 'danger' : totals.percentUsed >= 80 ? 'warning' : 'success'}
                        size="lg"
                    />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Categories</Text>
                        <Text variant="heading-md" className="font-mono">{budget.categories.length}</Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">On Track</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                            {budget.categories.filter((c) => getCategoryStatus(c) === 'ok').length}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Unassigned</Text>
                        <Text
                            variant="heading-md"
                            className="font-mono"
                            color={totals.unassigned >= 0 ? 'primary' : 'danger'}
                        >
                            {formatCurrency(totals.unassigned)}
                        </Text>
                    </div>
                </div>
            </Surface>

            {/* Category List */}
            <Surface elevation={1} className="p-0 overflow-hidden">
                {/* List Header */}
                <div className="px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <Text variant="body-sm" color="tertiary">
                        {budget.categories.length} categories
                    </Text>
                    <div className="flex items-center gap-2">
                        <Text variant="body-sm" color="tertiary">Sort by:</Text>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)] text-sm"
                        >
                            <option value="spent">Spent</option>
                            <option value="remaining">Remaining</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>

                {/* Categories */}
                <div className="divide-y divide-[var(--border-subtle)]">
                    {sortedCategories.map((category) => {
                        const status = getCategoryStatus(category);
                        const percentUsed = category.budgeted > 0
                            ? (category.spent / category.budgeted) * 100
                            : 0;
                        const remaining = category.budgeted - category.spent;
                        const isExpanded = expandedCategories.has(category.id);

                        return (
                            <div key={category.id}>
                                <div
                                    className="flex items-center gap-4 p-4 hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    {/* Expand Arrow */}
                                    <button className="shrink-0">
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                                        )}
                                    </button>

                                    {/* Category Color Dot */}
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />

                                    {/* Name & Progress */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <Text variant="body-md">{category.name}</Text>
                                            <div className="flex items-center gap-2">
                                                {status === 'over' && (
                                                    <AlertTriangle className="w-4 h-4 text-[var(--accent-danger)]" />
                                                )}
                                                {status === 'warning' && (
                                                    <AlertTriangle className="w-4 h-4 text-[var(--accent-warning)]" />
                                                )}
                                                <Text variant="mono-sm" color={remaining >= 0 ? 'secondary' : 'danger'}>
                                                    {formatCurrency(remaining)} left
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <Progress
                                                    value={Math.min(percentUsed, 100)}
                                                    variant={status === 'over' ? 'danger' : status === 'warning' ? 'warning' : 'success'}
                                                    size="sm"
                                                />
                                            </div>
                                            <Text variant="body-sm" color="tertiary">
                                                {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                                            </Text>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pl-14">
                                                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Text variant="body-sm" color="tertiary">Daily average</Text>
                                                        <Text variant="mono-sm">
                                                            {formatCurrency(category.spent / 30)}/day
                                                        </Text>
                                                    </div>
                                                    {category.rollover !== undefined && category.rollover !== 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <Text variant="body-sm" color="tertiary">Rollover</Text>
                                                            <Text
                                                                variant="mono-sm"
                                                                color={category.rollover >= 0 ? 'accent' : 'danger'}
                                                            >
                                                                {category.rollover >= 0 ? '+' : ''}
                                                                {formatCurrency(category.rollover)}
                                                            </Text>
                                                        </div>
                                                    )}
                                                    <Divider />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditCategory?.(category);
                                                        }}
                                                        className="w-full py-2 text-sm text-[var(--accent-primary)] hover:underline"
                                                    >
                                                        Edit budget
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Add Category */}
                <button
                    onClick={onAddCategory}
                    className="w-full flex items-center justify-center gap-2 p-4 text-[var(--accent-primary)] hover:bg-[var(--surface-elevated)] transition-colors border-t border-[var(--border-subtle)]"
                >
                    <Plus className="w-5 h-5" />
                    Add Budget Category
                </button>
            </Surface>
        </div>
    );
}

export default BudgetDashboard;
