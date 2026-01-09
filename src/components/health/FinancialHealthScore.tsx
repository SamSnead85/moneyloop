'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronRight,
    Lightbulb,
    Shield,
    Wallet,
    PiggyBank,
    CreditCard,
    Target,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    History,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface HealthScoreData {
    overallScore: number; // 0-100
    previousScore?: number;
    categories: {
        spending: number;
        savings: number;
        debt: number;
        budgeting: number;
        netWorth: number;
    };
    insights: HealthInsight[];
    history?: { date: string; score: number }[];
}

export interface HealthInsight {
    id: string;
    type: 'positive' | 'warning' | 'suggestion';
    category: keyof HealthScoreData['categories'];
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionLabel?: string;
    actionHref?: string;
}

interface FinancialHealthScoreProps {
    data: HealthScoreData;
    onAction?: (insight: HealthInsight) => void;
    className?: string;
}

// ===== HELPERS =====

const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--chart-3)';
    if (score >= 40) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
};

const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
};

const categoryIcons = {
    spending: Wallet,
    savings: PiggyBank,
    debt: CreditCard,
    budgeting: Target,
    netWorth: TrendingUp,
};

const categoryLabels = {
    spending: 'Spending Habits',
    savings: 'Savings Rate',
    debt: 'Debt Management',
    budgeting: 'Budget Adherence',
    netWorth: 'Net Worth Growth',
};

// ===== ANIMATED GAUGE =====

function AnimatedGauge({ score, size = 200 }: { score: number; size?: number }) {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI * 1.5; // 270 degrees
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-[135deg]">
                {/* Background arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--surface-elevated-2)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference * 0.33}`}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference * 0.33}`}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Text variant="heading-lg" className="font-mono text-4xl" style={{ color }}>
                        {score}
                    </Text>
                </motion.div>
                <Text variant="body-sm" color="tertiary">out of 100</Text>
            </div>
        </div>
    );
}

// ===== MAIN COMPONENT =====

export function FinancialHealthScore({
    data,
    onAction,
    className,
}: FinancialHealthScoreProps) {
    const [showHistory, setShowHistory] = useState(false);

    const scoreChange = data.previousScore
        ? data.overallScore - data.previousScore
        : 0;

    const sortedCategories = useMemo(() => {
        return Object.entries(data.categories)
            .map(([key, value]) => ({ key: key as keyof typeof data.categories, value }))
            .sort((a, b) => a.value - b.value);
    }, [data.categories]);

    const prioritizedInsights = useMemo(() => {
        return [...data.insights].sort((a, b) => {
            const impactOrder = { high: 0, medium: 1, low: 2 };
            return impactOrder[a.impact] - impactOrder[b.impact];
        }).slice(0, 5);
    }, [data.insights]);

    return (
        <div className={cn('space-y-6', className)}>
            {/* Score Card */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
                            <Text variant="heading-lg">Financial Health</Text>
                        </div>
                        <Text variant="body-sm" color="tertiary">
                            Your overall financial wellness score
                        </Text>
                    </div>
                    {data.history && (
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-center gap-12">
                    <AnimatedGauge score={data.overallScore} />

                    <div className="space-y-4">
                        <div>
                            <Badge
                                variant={data.overallScore >= 60 ? 'success' : data.overallScore >= 40 ? 'warning' : 'danger'}
                                size="md"
                            >
                                {getScoreLabel(data.overallScore)}
                            </Badge>
                        </div>

                        {scoreChange !== 0 && (
                            <div className={cn(
                                'flex items-center gap-1',
                                scoreChange > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                            )}>
                                {scoreChange > 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                <Text variant="body-sm">
                                    {scoreChange > 0 ? '+' : ''}{scoreChange} pts from last month
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Chart */}
                {showHistory && data.history && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-6 pt-6 border-t border-[var(--border-subtle)]"
                    >
                        <Text variant="body-sm" color="tertiary" className="mb-4">Score History</Text>
                        <div className="h-24 flex items-end gap-2">
                            {data.history.map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full rounded-t"
                                        style={{
                                            height: `${(h.score / 100) * 80}%`,
                                            backgroundColor: getScoreColor(h.score),
                                            opacity: i === data.history!.length - 1 ? 1 : 0.5,
                                        }}
                                    />
                                    <Text variant="caption" color="tertiary">{h.date}</Text>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </Surface>

            {/* Category Breakdown */}
            <Surface elevation={1} className="p-6">
                <Text variant="heading-md" className="mb-4">Score Breakdown</Text>
                <div className="space-y-4">
                    {sortedCategories.map(({ key, value }) => {
                        const Icon = categoryIcons[key];
                        const color = getScoreColor(value);

                        return (
                            <div key={key} className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <Text variant="body-sm">{categoryLabels[key]}</Text>
                                        <Text variant="mono-sm" style={{ color }}>{value}/100</Text>
                                    </div>
                                    <div className="h-2 rounded-full bg-[var(--surface-elevated-2)] overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Surface>

            {/* Insights & Suggestions */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-[var(--accent-warning)]" />
                    <Text variant="heading-md">Insights & Suggestions</Text>
                </div>

                <div className="space-y-3">
                    {prioritizedInsights.map(insight => {
                        const typeStyles = {
                            positive: { icon: CheckCircle, color: 'var(--accent-success)', bg: 'var(--accent-success-subtle)' },
                            warning: { icon: AlertTriangle, color: 'var(--accent-warning)', bg: 'var(--accent-warning-subtle)' },
                            suggestion: { icon: Lightbulb, color: 'var(--chart-3)', bg: 'var(--surface-elevated)' },
                        };
                        const style = typeStyles[insight.type];
                        const Icon = style.icon;

                        return (
                            <div
                                key={insight.id}
                                className="p-4 rounded-xl flex items-start gap-3"
                                style={{ backgroundColor: style.bg }}
                            >
                                <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: style.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Text variant="body-sm" className="font-medium">{insight.title}</Text>
                                        <Badge variant={insight.impact === 'high' ? 'warning' : 'default'} size="sm">
                                            {insight.impact} impact
                                        </Badge>
                                    </div>
                                    <Text variant="body-sm" color="tertiary">{insight.description}</Text>
                                    {insight.actionLabel && (
                                        <button
                                            onClick={() => onAction?.(insight)}
                                            className="flex items-center gap-1 mt-2 text-sm text-[var(--accent-primary)] hover:underline"
                                        >
                                            {insight.actionLabel}
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Surface>
        </div>
    );
}

export default FinancialHealthScore;
