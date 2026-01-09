'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    Loader2,
    AlertCircle,
    RefreshCw,
    WifiOff,
} from 'lucide-react';
import { Surface, Text } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== LOADING STATES =====

interface LoadingStateProps {
    message?: string;
    variant?: 'spinner' | 'skeleton' | 'pulse';
    className?: string;
}

export function LoadingState({
    message = 'Loading...',
    variant = 'spinner',
    className
}: LoadingStateProps) {
    if (variant === 'skeleton') {
        return (
            <div className={cn('space-y-4', className)}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 bg-[var(--surface-elevated-2)] rounded w-3/4 mb-2" />
                        <div className="h-4 bg-[var(--surface-elevated-2)] rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"
                />
                <Text variant="body-sm" color="tertiary">{message}</Text>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col items-center justify-center py-12', className)}>
            <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
            <Text variant="body-sm" color="tertiary">{message}</Text>
        </div>
    );
}

// ===== ERROR STATE =====

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message,
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <Surface elevation={1} className={cn('p-8 text-center', className)}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--accent-danger-subtle)] flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[var(--accent-danger)]" />
            </div>
            <Text variant="heading-sm" className="mb-2">{title}</Text>
            <Text variant="body-sm" color="tertiary" className="mb-6">{message}</Text>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 mx-auto rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </Surface>
    );
}

// ===== OFFLINE STATE =====

interface OfflineStateProps {
    message?: string;
    className?: string;
}

export function OfflineState({
    message = 'You appear to be offline. Some features may be unavailable.',
    className
}: OfflineStateProps) {
    return (
        <div className={cn(
            'flex items-center gap-3 p-4 rounded-xl bg-[var(--accent-warning-subtle)] border border-[var(--accent-warning)]/20',
            className
        )}>
            <WifiOff className="w-5 h-5 text-[var(--accent-warning)]" />
            <Text variant="body-sm">{message}</Text>
        </div>
    );
}

// ===== PAGE WRAPPER =====

interface PageWrapperProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    className?: string;
}

export function PageWrapper({
    title,
    subtitle,
    actions,
    children,
    loading,
    error,
    onRetry,
    className,
}: PageWrapperProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Text variant="heading-lg">{title}</Text>
                    {subtitle && (
                        <Text variant="body-sm" color="tertiary">{subtitle}</Text>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {/* Content */}
            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={onRetry} />
            ) : (
                children
            )}
        </div>
    );
}

// ===== SECTION DIVIDER =====

interface SectionDividerProps {
    title?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionDivider({ title, action, className }: SectionDividerProps) {
    return (
        <div className={cn('flex items-center gap-4 my-8', className)}>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            {title && (
                <Text variant="caption" color="tertiary" className="uppercase tracking-wider">
                    {title}
                </Text>
            )}
            {action}
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
    );
}

// ===== STATUS INDICATOR =====

interface StatusIndicatorProps {
    status: 'online' | 'offline' | 'syncing' | 'error';
    label?: string;
    className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
    const colors = {
        online: 'bg-[var(--accent-success)]',
        offline: 'bg-[var(--text-quaternary)]',
        syncing: 'bg-[var(--accent-warning)]',
        error: 'bg-[var(--accent-danger)]',
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <motion.div
                animate={status === 'syncing' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className={cn('w-2 h-2 rounded-full', colors[status])}
            />
            {label && <Text variant="caption" color="tertiary">{label}</Text>}
        </div>
    );
}

export default PageWrapper;
