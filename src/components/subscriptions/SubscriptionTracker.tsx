'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Repeat,
    Calendar,
    CreditCard,
    Trash2,
    Edit2,
    Plus,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    Pause,
    Play,
    DollarSign,
    Clock,
    TrendingUp,
    Filter,
    Grid3X3,
    List,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface Subscription {
    id: string;
    name: string;
    logo?: string;
    category: string;
    amount: number;
    billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextBillingDate: string;
    startDate: string;
    status: 'active' | 'paused' | 'cancelled';
    paymentMethod?: string;
    notes?: string;
    autoRenew?: boolean;
}

interface SubscriptionTrackerProps {
    subscriptions: Subscription[];
    onAdd?: () => void;
    onEdit?: (subscription: Subscription) => void;
    onPause?: (id: string) => void;
    onCancel?: (id: string) => void;
    className?: string;
}

// ===== HELPERS =====

const cycleLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

const cycleMultipliers = {
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
};

const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
};

const categoryColors: Record<string, string> = {
    'Entertainment': 'var(--chart-1)',
    'Productivity': 'var(--chart-2)',
    'Music': 'var(--chart-3)',
    'Video': 'var(--chart-4)',
    'Cloud Storage': 'var(--chart-5)',
    'Software': 'var(--accent-primary)',
    'Fitness': 'var(--accent-success)',
    'News': 'var(--accent-warning)',
};

// ===== COMPONENT =====

export function SubscriptionTracker({
    subscriptions,
    onAdd,
    onEdit,
    onPause,
    onCancel,
    className,
}: SubscriptionTrackerProps) {
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<'nextBilling' | 'amount' | 'name'>('nextBilling');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    // Calculate totals
    const { monthlyTotal, yearlyTotal, upcomingTotal } = useMemo(() => {
        const monthly = activeSubscriptions.reduce((sum, s) => {
            return sum + (s.amount * cycleMultipliers[s.billingCycle]) / 12;
        }, 0);

        const yearly = monthly * 12;

        const upcoming = activeSubscriptions
            .filter(s => getDaysUntil(s.nextBillingDate) <= 7)
            .reduce((sum, s) => sum + s.amount, 0);

        return { monthlyTotal: monthly, yearlyTotal: yearly, upcomingTotal: upcoming };
    }, [activeSubscriptions]);

    // Filter and sort
    const filteredSubs = useMemo(() => {
        let result = filterStatus === 'all'
            ? subscriptions
            : subscriptions.filter(s => s.status === filterStatus);

        result.sort((a, b) => {
            switch (sortBy) {
                case 'nextBilling':
                    return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
                case 'amount':
                    return b.amount - a.amount;
                case 'name':
                    return a.name.localeCompare(b.name);
            }
        });

        return result;
    }, [subscriptions, filterStatus, sortBy]);

    // Group by next 7 days
    const upcomingSubs = filteredSubs.filter(s => getDaysUntil(s.nextBillingDate) <= 7 && s.status === 'active');

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header Stats */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <Text variant="heading-lg">Subscriptions</Text>
                        <Text variant="body-sm" color="tertiary">
                            {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
                        </Text>
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Subscription
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Monthly Cost</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(monthlyTotal)}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Yearly Cost</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(yearlyTotal)}
                        </Text>
                    </div>
                    <div className={cn(
                        'p-4 rounded-xl',
                        upcomingTotal > 0 ? 'bg-[var(--accent-warning-subtle)]' : 'bg-[var(--surface-elevated)]'
                    )}>
                        <Text variant="body-sm" color="tertiary">Due This Week</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(upcomingTotal)}
                        </Text>
                    </div>
                </div>
            </Surface>

            {/* Upcoming Alert */}
            {upcomingSubs.length > 0 && (
                <Surface elevation={1} className="p-4 border-l-4 border-[var(--accent-warning)]">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-[var(--accent-warning)]" />
                        <Text variant="body-md">
                            {upcomingSubs.length} subscription{upcomingSubs.length !== 1 ? 's' : ''} renewing this week
                        </Text>
                    </div>
                </Surface>
            )}

            {/* Filters & View Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(['all', 'active', 'paused'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                                filterStatus === status
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView('list')}
                        className={cn(
                            'p-2 rounded-lg',
                            view === 'list' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                        )}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={cn(
                            'p-2 rounded-lg',
                            view === 'grid' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                        )}
                    >
                        <Grid3X3 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Subscriptions List/Grid */}
            {view === 'list' ? (
                <Surface elevation={1} className="p-0 divide-y divide-[var(--border-subtle)]">
                    {filteredSubs.map(sub => {
                        const daysUntil = getDaysUntil(sub.nextBillingDate);
                        const isExpanded = expandedId === sub.id;
                        const color = categoryColors[sub.category] || 'var(--text-tertiary)';

                        return (
                            <div key={sub.id}>
                                <div
                                    className={cn(
                                        'p-4 cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors',
                                        sub.status === 'paused' && 'opacity-60'
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Logo/Icon */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
                                        >
                                            {sub.logo ? (
                                                <img src={sub.logo} alt={sub.name} className="w-8 h-8 rounded" />
                                            ) : (
                                                <Text variant="heading-sm" style={{ color }}>
                                                    {sub.name.charAt(0)}
                                                </Text>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Text variant="body-md" className="font-medium">{sub.name}</Text>
                                                {sub.status === 'paused' && (
                                                    <Badge variant="warning" size="sm">Paused</Badge>
                                                )}
                                            </div>
                                            <Text variant="body-sm" color="tertiary">
                                                {cycleLabels[sub.billingCycle]} • {sub.category}
                                            </Text>
                                        </div>

                                        {/* Amount & Next Date */}
                                        <div className="text-right">
                                            <Text variant="mono-md">{formatCurrency(sub.amount)}</Text>
                                            <Text variant="body-sm" color={daysUntil <= 3 ? 'warning' : 'tertiary'}>
                                                {daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                            </Text>
                                        </div>

                                        <ChevronDown className={cn(
                                            'w-5 h-5 text-[var(--text-quaternary)] transition-transform',
                                            isExpanded && 'rotate-180'
                                        )} />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[var(--surface-elevated)]"
                                        >
                                            <div className="p-4 space-y-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <Text variant="caption" color="tertiary">Started</Text>
                                                        <Text variant="body-sm">
                                                            {new Date(sub.startDate).toLocaleDateString()}
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text variant="caption" color="tertiary">Next Billing</Text>
                                                        <Text variant="body-sm">
                                                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <Text variant="caption" color="tertiary">Payment</Text>
                                                        <Text variant="body-sm">
                                                            {sub.paymentMethod || 'Not set'}
                                                        </Text>
                                                    </div>
                                                </div>

                                                {sub.notes && (
                                                    <div>
                                                        <Text variant="caption" color="tertiary">Notes</Text>
                                                        <Text variant="body-sm">{sub.notes}</Text>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit?.(sub);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)]"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onPause?.(sub.id);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)]"
                                                    >
                                                        {sub.status === 'paused' ? (
                                                            <><Play className="w-4 h-4" /> Resume</>
                                                        ) : (
                                                            <><Pause className="w-4 h-4" /> Pause</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCancel?.(sub.id);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)]"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </Surface>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredSubs.map(sub => {
                        const color = categoryColors[sub.category] || 'var(--text-tertiary)';
                        const daysUntil = getDaysUntil(sub.nextBillingDate);

                        return (
                            <Surface key={sub.id} elevation={1} className={cn(
                                'p-4',
                                sub.status === 'paused' && 'opacity-60'
                            )}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
                                    >
                                        <Text variant="heading-sm" style={{ color }}>
                                            {sub.name.charAt(0)}
                                        </Text>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text variant="body-sm" className="font-medium truncate">{sub.name}</Text>
                                        <Text variant="caption" color="tertiary">{sub.category}</Text>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <Text variant="mono-md">{formatCurrency(sub.amount)}</Text>
                                        <Text variant="caption" color="tertiary">{cycleLabels[sub.billingCycle]}</Text>
                                    </div>
                                    <Badge variant={daysUntil <= 3 ? 'warning' : 'default'} size="sm">
                                        {daysUntil <= 0 ? 'Today' : `${daysUntil}d`}
                                    </Badge>
                                </div>
                            </Surface>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {filteredSubs.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <Repeat className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                    <Text variant="heading-sm" className="mb-2">No subscriptions</Text>
                    <Text variant="body-sm" color="tertiary" className="mb-6">
                        Track your recurring payments in one place
                    </Text>
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Subscription
                    </button>
                </Surface>
            )}
        </div>
    );
}

export default SubscriptionTracker;
