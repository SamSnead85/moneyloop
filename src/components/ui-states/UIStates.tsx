'use client';

/**
 * UI State Components
 * 
 * Skeleton loaders, empty states, and error states
 * for consistent loading experiences.
 */

import { motion } from 'framer-motion';
import {
    FileQuestion,
    SearchX,
    WifiOff,
    AlertCircle,
    Plus,
    RefreshCw,
    ArrowRight,
    Inbox,
    Target,
    Wallet,
    Receipt,
    PiggyBank,
} from 'lucide-react';

// ============ SKELETON LOADERS ============

interface SkeletonProps {
    className?: string;
    animate?: boolean;
    style?: React.CSSProperties;
}

export function Skeleton({ className = '', animate = true, style }: SkeletonProps) {
    return (
        <div
            className={`bg-[var(--surface-tertiary)] rounded ${animate ? 'animate-pulse' : ''} ${className}`}
            style={style}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-primary)] ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 p-3 bg-[var(--surface-secondary)] rounded-lg">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-3">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonChart({ className = '' }: { className?: string }) {
    return (
        <div className={`p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-primary)] ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex items-end gap-2 h-40">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t"
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonChart />
                <SkeletonChart />
            </div>
            <SkeletonTable rows={5} cols={5} />
        </div>
    );
}

// ============ EMPTY STATES ============

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick: () => void };
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    className = '',
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
        >
            {icon && (
                <div className="w-16 h-16 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
                    {description}
                </p>
            )}
            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-4 h-4" />
                            {action.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {secondaryAction.label}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

// Pre-built empty states
export function EmptyTransactions({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={<Receipt className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="No transactions yet"
            description="Connect a bank account or add transactions manually to see your spending."
            action={onAdd ? { label: 'Add Transaction', onClick: onAdd } : undefined}
        />
    );
}

export function EmptyBudgets({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={<Wallet className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="No budgets set"
            description="Create budgets to track your spending and reach your financial goals."
            action={onAdd ? { label: 'Create Budget', onClick: onAdd } : undefined}
        />
    );
}

export function EmptyGoals({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={<Target className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="No savings goals"
            description="Set up goals to save for what matters most to you."
            action={onAdd ? { label: 'Create Goal', onClick: onAdd } : undefined}
        />
    );
}

export function EmptySearch({ query }: { query: string }) {
    return (
        <EmptyState
            icon={<SearchX className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
        />
    );
}

export function EmptyInbox() {
    return (
        <EmptyState
            icon={<Inbox className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="All caught up!"
            description="You have no pending notifications or actions."
        />
    );
}

// ============ ERROR STATES ============

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'We encountered an error loading this content.',
    onRetry,
    className = '',
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
        >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
                {description}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </motion.div>
    );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
    return (
        <EmptyState
            icon={<WifiOff className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="You're offline"
            description="Check your internet connection and try again."
            action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
        />
    );
}

export function NotFoundState() {
    return (
        <EmptyState
            icon={<FileQuestion className="w-8 h-8 text-[var(--text-tertiary)]" />}
            title="Page not found"
            description="The page you're looking for doesn't exist or has been moved."
            secondaryAction={{
                label: 'Go to Dashboard',
                onClick: () => (window.location.href = '/dashboard'),
            }}
        />
    );
}

// ============ LOADING STATES ============

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="absolute inset-0 bg-[var(--surface-base)]/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" className="text-[var(--accent-primary)]" />
                <span className="text-sm text-[var(--text-secondary)]">{message}</span>
            </div>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--surface-tertiary)]" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                </div>
                <span className="text-sm text-[var(--text-tertiary)]">Loading...</span>
            </div>
        </div>
    );
}

export default {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonChart,
    SkeletonDashboard,
    EmptyState,
    EmptyTransactions,
    EmptyBudgets,
    EmptyGoals,
    EmptySearch,
    EmptyInbox,
    ErrorState,
    OfflineState,
    NotFoundState,
    LoadingSpinner,
    LoadingOverlay,
    PageLoader,
};
