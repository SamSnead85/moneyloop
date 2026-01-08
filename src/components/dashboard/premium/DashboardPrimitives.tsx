'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react';
import { Surface, Text, Skeleton } from '@/components/primitives';

// ===== METRIC CARD =====
// Stripe-style metric display with trend indicator

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        period: string;
    };
    icon?: LucideIcon;
    variant?: 'default' | 'success' | 'danger' | 'warning';
    loading?: boolean;
    className?: string;
}

export function MetricCard({
    label,
    value,
    trend,
    icon: Icon,
    variant = 'default',
    loading = false,
    className = '',
}: MetricCardProps) {
    const variantColors = {
        default: 'var(--text-primary)',
        success: 'var(--accent-primary)',
        danger: 'var(--accent-danger)',
        warning: 'var(--accent-warning)',
    };

    const TrendIcon = trend
        ? trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus
        : null;

    if (loading) {
        return (
            <Surface elevation={1} className={`p-5 ${className}`}>
                <Skeleton variant="text" width="40%" height={14} className="mb-3" />
                <Skeleton variant="text" width="70%" height={32} className="mb-2" />
                <Skeleton variant="text" width="50%" height={14} />
            </Surface>
        );
    }

    return (
        <Surface elevation={1} className={`p-5 ${className}`}>
            <div className="flex items-start justify-between mb-3">
                <Text variant="body-sm" color="tertiary">{label}</Text>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated-2)] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                )}
            </div>

            <Text
                variant="mono-lg"
                className="block mb-1"
                style={{ color: variantColors[variant] }}
            >
                {typeof value === 'number'
                    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                    : value
                }
            </Text>

            {trend && TrendIcon && (
                <div className="flex items-center gap-1.5">
                    <div className={`flex items-center gap-0.5 ${trend.value > 0 ? 'text-[var(--accent-primary)]' :
                            trend.value < 0 ? 'text-[var(--accent-danger)]' :
                                'text-[var(--text-tertiary)]'
                        }`}>
                        <TrendIcon className="w-3 h-3" />
                        <Text variant="body-sm" className="font-medium">
                            {Math.abs(trend.value)}%
                        </Text>
                    </div>
                    <Text variant="body-sm" color="tertiary">
                        {trend.period}
                    </Text>
                </div>
            )}
        </Surface>
    );
}

// ===== BENTO GRID =====
// Flexible grid layout for dashboard widgets

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
    return (
        <div className={`grid gap-4 ${className}`}>
            {children}
        </div>
    );
}

// ===== BENTO CARD =====
// Individual card with span options

interface BentoCardProps {
    children: ReactNode;
    span?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
    className?: string;
}

export function BentoCard({
    children,
    span = 1,
    rowSpan = 1,
    className = ''
}: BentoCardProps) {
    const spanClasses = {
        1: 'col-span-1',
        2: 'col-span-1 md:col-span-2',
        3: 'col-span-1 md:col-span-2 lg:col-span-3',
        4: 'col-span-1 md:col-span-2 lg:col-span-4',
    };

    const rowSpanClasses = {
        1: 'row-span-1',
        2: 'row-span-2',
    };

    return (
        <div className={`${spanClasses[span]} ${rowSpanClasses[rowSpan]} ${className}`}>
            {children}
        </div>
    );
}

// ===== WIDGET CARD =====
// Container for dashboard widgets with header

interface WidgetCardProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    loading?: boolean;
    className?: string;
}

export function WidgetCard({
    title,
    subtitle,
    action,
    children,
    loading = false,
    className = '',
}: WidgetCardProps) {
    return (
        <Surface elevation={1} className={`p-5 h-full flex flex-col ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <Text variant="heading-sm" className="mb-0.5">{title}</Text>
                    {subtitle && (
                        <Text variant="body-sm" color="tertiary">{subtitle}</Text>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-2">
                        {action}
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0">
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton variant="rectangular" height={100} />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                    </div>
                ) : children}
            </div>
        </Surface>
    );
}

// ===== QUICK ACTION BUTTON =====
// For command palette style actions

interface QuickActionProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'primary';
}

export function QuickAction({
    label,
    icon: Icon,
    onClick,
    variant = 'default'
}: QuickActionProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors
                ${variant === 'primary'
                    ? 'bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-subtle)]'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)]'
                }
            `}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </motion.button>
    );
}

// ===== TRANSACTION ROW =====
// Compact transaction display

interface TransactionRowProps {
    merchant: string;
    category: string;
    amount: number;
    date: string;
    type: 'expense' | 'income';
    logo?: string;
}

export function TransactionRow({
    merchant,
    category,
    amount,
    date,
    type,
    logo,
}: TransactionRowProps) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0">
            {/* Logo/Initial */}
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated-2)] flex items-center justify-center shrink-0 overflow-hidden">
                {logo ? (
                    <img src={logo} alt={merchant} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-semibold text-[var(--text-tertiary)]">
                        {merchant.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Text variant="body-md" className="truncate block">{merchant}</Text>
                <Text variant="body-sm" color="tertiary">{category}</Text>
            </div>

            {/* Amount & Date */}
            <div className="text-right shrink-0">
                <Text
                    variant="mono-sm"
                    color={type === 'income' ? 'accent' : 'primary'}
                    className="block"
                >
                    {type === 'income' ? '+' : '-'}
                    {Math.abs(amount).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                    })}
                </Text>
                <Text variant="body-sm" color="tertiary">{date}</Text>
            </div>
        </div>
    );
}

// ===== ACCOUNT ROW =====
// Connected account display

interface AccountRowProps {
    name: string;
    institution: string;
    balance: number;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    logo?: string;
    lastUpdated?: string;
}

export function AccountRow({
    name,
    institution,
    balance,
    type,
    logo,
    lastUpdated,
}: AccountRowProps) {
    const typeColors = {
        checking: 'var(--chart-3)',
        savings: 'var(--chart-4)',
        credit: 'var(--chart-2)',
        investment: 'var(--chart-1)',
    };

    return (
        <div className="flex items-center gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0">
            {/* Logo */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${typeColors[type]} 15%, transparent)` }}
            >
                {logo ? (
                    <img src={logo} alt={institution} className="w-6 h-6" />
                ) : (
                    <span
                        className="text-sm font-semibold"
                        style={{ color: typeColors[type] }}
                    >
                        {institution.charAt(0)}
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Text variant="body-md" className="truncate block">{name}</Text>
                <Text variant="body-sm" color="tertiary">{institution}</Text>
            </div>

            {/* Balance */}
            <div className="text-right shrink-0">
                <Text
                    variant="mono-md"
                    color={balance >= 0 ? 'primary' : 'danger'}
                >
                    {balance.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                    })}
                </Text>
                {lastUpdated && (
                    <Text variant="body-sm" color="tertiary">{lastUpdated}</Text>
                )}
            </div>
        </div>
    );
}

// ===== INSIGHT CARD =====
// AI-powered insight display

interface InsightCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'info' | 'success' | 'warning' | 'danger';
}

export function InsightCard({
    icon: Icon,
    title,
    description,
    action,
    variant = 'info',
}: InsightCardProps) {
    const variantStyles = {
        info: {
            bg: 'var(--accent-tertiary-subtle)',
            color: 'var(--accent-tertiary)',
        },
        success: {
            bg: 'var(--accent-primary-subtle)',
            color: 'var(--accent-primary)',
        },
        warning: {
            bg: 'var(--accent-warning-subtle)',
            color: 'var(--accent-warning)',
        },
        danger: {
            bg: 'var(--accent-danger-subtle)',
            color: 'var(--accent-danger)',
        },
    };

    return (
        <div
            className="p-4 rounded-xl border"
            style={{
                backgroundColor: variantStyles[variant].bg,
                borderColor: `color-mix(in srgb, ${variantStyles[variant].color} 20%, transparent)`,
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${variantStyles[variant].color} 15%, transparent)`
                    }}
                >
                    <Icon
                        className="w-4 h-4"
                        style={{ color: variantStyles[variant].color }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <Text variant="body-md" className="font-medium mb-1 block">{title}</Text>
                    <Text variant="body-sm" color="secondary">{description}</Text>
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="mt-2 text-sm font-medium hover:underline"
                            style={{ color: variantStyles[variant].color }}
                        >
                            {action.label} →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Export all
export default {
    MetricCard,
    BentoGrid,
    BentoCard,
    WidgetCard,
    QuickAction,
    TransactionRow,
    AccountRow,
    InsightCard,
};
