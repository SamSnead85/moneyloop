'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Target,
    Zap,
    DollarSign,
    Calendar,
    ChevronRight,
    X,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    Sparkles,
    Info,
    AlertCircle,
    Gift,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface Insight {
    id: string;
    type: 'opportunity' | 'warning' | 'achievement' | 'tip' | 'anomaly' | 'trend';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    category?: string;
    createdAt: string;
    read?: boolean;
    dismissed?: boolean;
    metadata?: {
        amount?: number;
        percentage?: number;
        trend?: 'up' | 'down' | 'stable';
        comparison?: string;
    };
}

interface InsightsEngineProps {
    insights: Insight[];
    onMarkRead?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onFeedback?: (id: string, helpful: boolean) => void;
    onAction?: (insight: Insight) => void;
    loading?: boolean;
}

// ===== HELPERS =====

const typeConfig: Record<Insight['type'], {
    icon: typeof Lightbulb;
    color: string;
    bgColor: string;
    label: string;
}> = {
    opportunity: {
        icon: DollarSign,
        color: 'var(--accent-primary)',
        bgColor: 'var(--accent-primary-subtle)',
        label: 'Opportunity',
    },
    warning: {
        icon: AlertTriangle,
        color: 'var(--accent-warning)',
        bgColor: 'var(--accent-warning-subtle)',
        label: 'Warning',
    },
    achievement: {
        icon: Gift,
        color: 'var(--accent-success)',
        bgColor: 'var(--accent-success-subtle)',
        label: 'Achievement',
    },
    tip: {
        icon: Lightbulb,
        color: 'var(--chart-3)',
        bgColor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)',
        label: 'Tip',
    },
    anomaly: {
        icon: AlertCircle,
        color: 'var(--accent-danger)',
        bgColor: 'var(--accent-danger-subtle)',
        label: 'Unusual',
    },
    trend: {
        icon: TrendingUp,
        color: 'var(--chart-5)',
        bgColor: 'color-mix(in srgb, var(--chart-5) 15%, transparent)',
        label: 'Trend',
    },
};

// ===== COMPONENT =====

export function InsightsEngine({
    insights,
    onMarkRead,
    onDismiss,
    onFeedback,
    onAction,
    loading = false,
}: InsightsEngineProps) {
    const [filter, setFilter] = useState<'all' | Insight['type']>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filter insights
    const filteredInsights = useMemo(() => {
        return insights
            .filter(i => !i.dismissed)
            .filter(i => filter === 'all' || i.type === filter)
            .sort((a, b) => {
                // Unread first
                if (a.read !== b.read) return a.read ? 1 : -1;
                // Then by priority
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                // Then by date
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [insights, filter]);

    // Count by type
    const typeCounts = useMemo(() => {
        return insights.reduce((acc, i) => {
            if (!i.dismissed) {
                acc[i.type] = (acc[i.type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [insights]);

    const unreadCount = insights.filter(i => !i.read && !i.dismissed).length;
    const highPriorityCount = insights.filter(i => i.priority === 'high' && !i.dismissed).length;

    if (loading) {
        return (
            <Surface elevation={1} className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-[var(--surface-elevated)] rounded w-1/3" />
                    <div className="h-4 bg-[var(--surface-elevated)] rounded w-2/3" />
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-[var(--surface-elevated)] rounded-xl" />
                        ))}
                    </div>
                </div>
            </Surface>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <Text variant="heading-lg">Insights</Text>
                            <Text variant="body-sm" color="tertiary">
                                {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
                            </Text>
                        </div>
                    </div>
                    {highPriorityCount > 0 && (
                        <Badge variant="danger">
                            {highPriorityCount} important
                        </Badge>
                    )}
                </div>

                {/* Type Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                            filter === 'all'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)]'
                        )}
                    >
                        All ({insights.filter(i => !i.dismissed).length})
                    </button>
                    {Object.entries(typeConfig).map(([type, config]) => {
                        const count = typeCounts[type] || 0;
                        if (count === 0) return null;
                        const Icon = config.icon;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilter(type as Insight['type'])}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                                    filter === type
                                        ? 'text-white'
                                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)]'
                                )}
                                style={filter === type ? { backgroundColor: config.color } : {}}
                            >
                                <Icon className="w-4 h-4" />
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </Surface>

            {/* Insights List */}
            <div className="space-y-3">
                {filteredInsights.map((insight) => {
                    const config = typeConfig[insight.type];
                    const Icon = config.icon;
                    const isExpanded = expandedId === insight.id;

                    return (
                        <Surface
                            key={insight.id}
                            elevation={1}
                            className={cn(
                                'p-0 overflow-hidden transition-all',
                                !insight.read && 'ring-1 ring-[var(--accent-primary)]/20'
                            )}
                        >
                            <div
                                className="p-4 cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                                onClick={() => {
                                    setExpandedId(isExpanded ? null : insight.id);
                                    if (!insight.read) onMarkRead?.(insight.id);
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: config.bgColor }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Text variant="body-md" className="font-medium">
                                                {insight.title}
                                            </Text>
                                            {!insight.read && (
                                                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                                            )}
                                            {insight.priority === 'high' && (
                                                <Badge variant="danger" size="sm">Important</Badge>
                                            )}
                                        </div>
                                        <Text variant="body-sm" color="tertiary" className="line-clamp-2">
                                            {insight.description}
                                        </Text>

                                        {/* Metadata */}
                                        {insight.metadata && (
                                            <div className="flex items-center gap-4 mt-2">
                                                {insight.metadata.amount !== undefined && (
                                                    <Text
                                                        variant="mono-sm"
                                                        color={insight.metadata.trend === 'up' ? 'accent' : 'danger'}
                                                    >
                                                        {insight.metadata.trend === 'up' ? '+' : insight.metadata.trend === 'down' ? '-' : ''}
                                                        ${Math.abs(insight.metadata.amount).toLocaleString()}
                                                    </Text>
                                                )}
                                                {insight.metadata.percentage !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        {insight.metadata.trend === 'up' ? (
                                                            <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                                                        ) : insight.metadata.trend === 'down' ? (
                                                            <TrendingDown className="w-4 h-4 text-[var(--accent-danger)]" />
                                                        ) : null}
                                                        <Text variant="mono-sm">
                                                            {insight.metadata.percentage}%
                                                        </Text>
                                                    </div>
                                                )}
                                                {insight.metadata.comparison && (
                                                    <Text variant="body-sm" color="tertiary">
                                                        {insight.metadata.comparison}
                                                    </Text>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expand indicator */}
                                    <ChevronRight className={cn(
                                        'w-5 h-5 text-[var(--text-tertiary)] transition-transform shrink-0',
                                        isExpanded && 'rotate-90'
                                    )} />
                                </div>
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4">
                                            <Divider className="mb-4" />

                                            {insight.impact && (
                                                <div className="p-3 rounded-lg bg-[var(--surface-elevated)] mb-4">
                                                    <Text variant="body-sm" color="tertiary" className="mb-1">
                                                        Potential Impact
                                                    </Text>
                                                    <Text variant="body-md">{insight.impact}</Text>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                {/* Feedback */}
                                                <div className="flex items-center gap-2">
                                                    <Text variant="body-sm" color="tertiary">Helpful?</Text>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onFeedback?.(insight.id, true);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-[var(--accent-primary-subtle)] transition-colors"
                                                    >
                                                        <ThumbsUp className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)]" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onFeedback?.(insight.id, false);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                                    >
                                                        <ThumbsDown className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]" />
                                                    </button>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDismiss?.(insight.id);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-sm text-[var(--text-tertiary)] hover:bg-[var(--surface-elevated)] transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                    {insight.action && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (insight.action?.onClick) {
                                                                    insight.action.onClick();
                                                                } else {
                                                                    onAction?.(insight);
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                                                        >
                                                            {insight.action.label}
                                                            {insight.action.href && <ExternalLink className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Surface>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredInsights.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-[var(--accent-primary)]" />
                    </div>
                    <Text variant="heading-sm" className="mb-2">All caught up!</Text>
                    <Text variant="body-sm" color="tertiary">
                        {filter === 'all'
                            ? 'No new insights at the moment. Check back later.'
                            : `No ${typeConfig[filter].label.toLowerCase()} insights right now.`}
                    </Text>
                </Surface>
            )}
        </div>
    );
}

export default InsightsEngine;
