'use client';

import { motion } from 'framer-motion';

// Base skeleton with shimmer
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
    );
}

// Skeleton for dashboard stat cards
export function StatCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-start justify-between mb-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-12 h-4" />
            </div>
            <Skeleton className="w-20 h-3 mb-2" />
            <Skeleton className="w-24 h-7" />
            <Skeleton className="w-32 h-3 mt-2" />
        </div>
    );
}

// Skeleton for chart areas
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
    return (
        <div className={`${height} flex items-end gap-2 px-4 pb-4`}>
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="flex-1 bg-white/[0.04] rounded-t-lg"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
            ))}
        </div>
    );
}

// Skeleton for transaction list items
export function TransactionSkeleton() {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                </div>
            </div>
            <div className="text-right">
                <Skeleton className="w-20 h-4 mb-1" />
                <Skeleton className="w-12 h-3" />
            </div>
        </div>
    );
}

// Skeleton for goal cards
export function GoalSkeleton() {
    return (
        <div className="p-3 rounded-xl bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton className="w-8 h-3" />
            </div>
        </div>
    );
}

// Skeleton for income stream items
export function IncomeStreamSkeleton() {
    return (
        <div className="flex items-center justify-between p-2.5">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                    <Skeleton className="w-20 h-4 mb-1" />
                    <Skeleton className="w-12 h-3" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-4 h-4" />
            </div>
        </div>
    );
}

// Full dashboard loading skeleton
export function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Net Worth Chart Skeleton */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="w-32 h-6 mb-2" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <Skeleton className="w-24 h-8 rounded-lg" />
                </div>
                <div className="text-center mb-4">
                    <Skeleton className="w-40 h-10 mx-auto mb-2" />
                    <Skeleton className="w-24 h-4 mx-auto" />
                </div>
                <ChartSkeleton height="h-48" />
            </div>

            {/* Asset Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <StatCardSkeleton />
                    </motion.div>
                ))}
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Cash Flow Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Skeleton className="w-24 h-5 mb-1" />
                            <Skeleton className="w-32 h-3" />
                        </div>
                        <Skeleton className="w-28 h-8 rounded-lg" />
                    </div>
                    <ChartSkeleton />
                </div>

                {/* Spending Breakdown */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="mb-6">
                        <Skeleton className="w-24 h-5 mb-1" />
                        <Skeleton className="w-20 h-3" />
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="w-20 h-3 mb-1" />
                                    <Skeleton className="w-full h-2 rounded-full" />
                                </div>
                                <Skeleton className="w-16 h-4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Goals, Insights, Income Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Goals */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-5">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-12 h-4" />
                    </div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <GoalSkeleton key={i} />
                        ))}
                    </div>
                </div>

                {/* Insights */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Skeleton className="w-28 h-5 mb-5" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 rounded-xl bg-white/[0.02]">
                                <Skeleton className="w-32 h-4 mb-1" />
                                <Skeleton className="w-full h-3" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Income */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-5">
                        <Skeleton className="w-20 h-5" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <IncomeStreamSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-5">
                    <Skeleton className="w-32 h-5" />
                    <Skeleton className="w-16 h-4" />
                </div>
                <div className="grid lg:grid-cols-2 gap-x-8">
                    {[...Array(6)].map((_, i) => (
                        <TransactionSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Empty state component
export function EmptyState({
    title,
    description,
    action,
    icon: Icon
}: {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
    icon?: React.ElementType;
}) {
    return (
        <motion.div
            className="text-center py-12 px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-slate-500" />
                </div>
            )}
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}

// Error state component
export function ErrorState({
    message,
    onRetry
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <motion.div
            className="text-center py-12 px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm font-medium transition-colors"
                >
                    Try Again
                </button>
            )}
        </motion.div>
    );
}
