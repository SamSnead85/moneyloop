'use client';

/**
 * Advanced Dashboard Widgets
 * 
 * Rich, customizable dashboard widgets for financial data visualization.
 * Supports drag-and-drop layouts, themes, and real-time updates.
 * 
 * Super-Sprint 11: Phases 1001-1025
 */

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    CreditCard,
    PiggyBank,
    Target,
    Activity,
    AlertTriangle,
    ChevronRight,
    MoreVertical,
    RefreshCw,
    Maximize2,
    Settings,
    Eye,
    EyeOff,
} from 'lucide-react';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';
export type WidgetType =
    | 'net_worth'
    | 'cash_flow'
    | 'spending'
    | 'budget_health'
    | 'goals_progress'
    | 'accounts_summary'
    | 'upcoming_bills'
    | 'recent_transactions'
    | 'savings_rate'
    | 'ai_insights'
    | 'alerts';

interface BaseWidgetProps {
    id: string;
    title: string;
    size: WidgetSize;
    isLoading?: boolean;
    error?: string;
    lastUpdated?: Date;
    onRefresh?: () => void;
    onExpand?: () => void;
    onSettings?: () => void;
    children: ReactNode;
}

export function WidgetContainer({
    id,
    title,
    size,
    isLoading,
    error,
    lastUpdated,
    onRefresh,
    onExpand,
    onSettings,
    children,
}: BaseWidgetProps) {
    const [showMenu, setShowMenu] = useState(false);

    const sizeClasses = {
        small: 'col-span-1',
        medium: 'col-span-1 md:col-span-2',
        large: 'col-span-1 md:col-span-2 lg:col-span-3',
        full: 'col-span-full',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${sizeClasses[size]} bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
                <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
                <div className="flex items-center gap-1">
                    {isLoading && (
                        <RefreshCw className="w-4 h-4 text-[var(--text-tertiary)] animate-spin" />
                    )}
                    {lastUpdated && !isLoading && (
                        <span className="text-xs text-[var(--text-tertiary)] mr-2">
                            {formatTimeAgo(lastUpdated)}
                        </span>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-1 w-36 bg-[var(--surface-base)] border border-[var(--border-primary)] rounded-lg shadow-lg z-10 py-1"
                                >
                                    {onRefresh && (
                                        <button
                                            onClick={() => { onRefresh(); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Refresh
                                        </button>
                                    )}
                                    {onExpand && (
                                        <button
                                            onClick={() => { onExpand(); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                            Expand
                                        </button>
                                    )}
                                    {onSettings && (
                                        <button
                                            onClick={() => { onSettings(); setShowMenu(false); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {error ? (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                ) : (
                    children
                )}
            </div>
        </motion.div>
    );
}

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Net Worth Widget
interface NetWorthWidgetProps {
    currentNetWorth: number;
    previousNetWorth: number;
    breakdown: { label: string; value: number; color: string }[];
}

export function NetWorthWidget({ currentNetWorth, previousNetWorth, breakdown }: NetWorthWidgetProps) {
    const change = currentNetWorth - previousNetWorth;
    const changePercent = previousNetWorth !== 0 ? (change / Math.abs(previousNetWorth)) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-3xl font-bold text-[var(--text-primary)]">
                        ${currentNetWorth.toLocaleString()}
                    </span>
                    <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                            {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                        </span>
                        <span className="text-sm text-[var(--text-tertiary)]">this month</span>
                    </div>
                </div>
            </div>

            {/* Mini bar chart */}
            <div className="flex gap-1 h-16">
                {breakdown.map((item, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-lg relative overflow-hidden"
                        style={{ backgroundColor: item.color + '20' }}
                    >
                        <div
                            className="absolute bottom-0 w-full rounded-lg transition-all"
                            style={{
                                backgroundColor: item.color,
                                height: `${Math.min(100, Math.max(10, (item.value / currentNetWorth) * 100))}%`
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                {breakdown.map((item, i) => (
                    <span key={i}>{item.label}</span>
                ))}
            </div>
        </div>
    );
}

// Spending Widget
interface SpendingWidgetProps {
    totalSpent: number;
    budget: number;
    topCategories: { name: string; amount: number; percent: number }[];
}

export function SpendingWidget({ totalSpent, budget, topCategories }: SpendingWidgetProps) {
    const percentUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
    const remaining = budget - totalSpent;

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                        ${totalSpent.toLocaleString()}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)] ml-2">
                        of ${budget.toLocaleString()}
                    </span>
                </div>
                <span className={`text-sm font-medium ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `$${Math.abs(remaining).toLocaleString()} over`}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${percentUsed > 100 ? 'bg-red-400' : percentUsed > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
            </div>

            {/* Top categories */}
            <div className="space-y-2">
                {topCategories.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">{cat.name}</span>
                        <span className="font-medium text-[var(--text-primary)]">${cat.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Goals Progress Widget
interface GoalsWidgetProps {
    goals: { name: string; current: number; target: number; color: string }[];
}

export function GoalsWidget({ goals }: GoalsWidgetProps) {
    return (
        <div className="space-y-3">
            {goals.slice(0, 4).map((goal, i) => {
                const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                return (
                    <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">{goal.name}</span>
                            <span className="text-[var(--text-primary)]">
                                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-1.5 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, progress)}%`, backgroundColor: goal.color }}
                            />
                        </div>
                    </div>
                );
            })}
            {goals.length === 0 && (
                <div className="text-center py-4 text-[var(--text-tertiary)]">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No goals set yet</p>
                </div>
            )}
        </div>
    );
}

// Upcoming Bills Widget
interface BillsWidgetProps {
    bills: { name: string; amount: number; dueDate: Date; isPaid: boolean; isOverdue: boolean }[];
}

export function UpcomingBillsWidget({ bills }: BillsWidgetProps) {
    const sortedBills = [...bills].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const upcomingTotal = sortedBills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-tertiary)]">Due this month</span>
                <span className="font-medium text-[var(--text-primary)]">${upcomingTotal.toLocaleString()}</span>
            </div>

            {sortedBills.slice(0, 5).map((bill, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bill.isPaid ? 'bg-emerald-400' : bill.isOverdue ? 'bg-red-400' : 'bg-amber-400'
                            }`} />
                        <span className="text-sm text-[var(--text-secondary)]">{bill.name}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-[var(--text-primary)]">${bill.amount}</span>
                        <span className="text-xs text-[var(--text-tertiary)] ml-2">
                            {bill.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Metric Card (mini widget)
interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, change, icon, trend }: MetricCardProps) {
    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-red-400',
        neutral: 'text-[var(--text-tertiary)]',
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
        <div className="p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-primary)]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
                {icon && <span className="text-[var(--text-tertiary)]">{icon}</span>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                </span>
                {change !== undefined && trend && (
                    <div className={`flex items-center gap-0.5 ${trendColors[trend]}`}>
                        <TrendIcon className="w-3 h-3" />
                        <span className="text-xs">{change > 0 ? '+' : ''}{change}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// AI Insights Widget
interface AIInsightsWidgetProps {
    insights: { text: string; type: 'tip' | 'alert' | 'info'; priority: 'high' | 'medium' | 'low' }[];
}

export function AIInsightsWidget({ insights }: AIInsightsWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (insights.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((i) => (i + 1) % insights.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [insights.length]);

    if (insights.length === 0) {
        return (
            <div className="text-center py-4 text-[var(--text-tertiary)]">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insights available</p>
            </div>
        );
    }

    const current = insights[currentIndex];
    const typeStyles = {
        tip: 'bg-emerald-400/10 border-emerald-400/20',
        alert: 'bg-amber-400/10 border-amber-400/20',
        info: 'bg-blue-400/10 border-blue-400/20',
    };

    return (
        <div className="space-y-3">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border ${typeStyles[current.type]}`}
                >
                    <p className="text-sm text-[var(--text-primary)]">{current.text}</p>
                </motion.div>
            </AnimatePresence>

            {insights.length > 1 && (
                <div className="flex justify-center gap-1">
                    {insights.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-tertiary)]'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default {
    WidgetContainer,
    NetWorthWidget,
    SpendingWidget,
    GoalsWidget,
    UpcomingBillsWidget,
    MetricCard,
    AIInsightsWidget,
};
