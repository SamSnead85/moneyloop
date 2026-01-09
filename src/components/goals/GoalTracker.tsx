'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    TrendingUp,
    Sparkles,
    ChevronRight,
    Check,
    Pause,
    Play,
    MoreHorizontal,
    Home,
    Car,
    Plane,
    GraduationCap,
    Heart,
    Gift,
    Shield,
    Wallet,
    PiggyBank,
    X,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface SavingsGoal {
    id: string;
    name: string;
    icon: string;
    color: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    monthlyContribution?: number;
    autoContribute?: boolean;
    paused?: boolean;
    priority?: number;
    notes?: string;
    createdAt: string;
}

interface GoalTrackerProps {
    goals: SavingsGoal[];
    onAddGoal?: () => void;
    onEditGoal?: (goal: SavingsGoal) => void;
    onDeleteGoal?: (id: string) => void;
    onContribute?: (goalId: string, amount: number) => void;
    onTogglePause?: (goalId: string) => void;
}

// ===== ICONS MAP =====

const iconMap: Record<string, typeof Target> = {
    target: Target,
    home: Home,
    car: Car,
    plane: Plane,
    education: GraduationCap,
    health: Heart,
    gift: Gift,
    emergency: Shield,
    savings: Wallet,
    piggy: PiggyBank,
};

// ===== COMPONENT =====

export function GoalTracker({
    goals,
    onAddGoal,
    onEditGoal,
    onDeleteGoal,
    onContribute,
    onTogglePause,
}: GoalTrackerProps) {
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [contributeAmount, setContributeAmount] = useState('');
    const [showContributeModal, setShowContributeModal] = useState<string | null>(null);

    // Calculate totals
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Sort goals by priority then progress
    const sortedGoals = [...goals].sort((a, b) => {
        if (a.paused !== b.paused) return a.paused ? 1 : -1;
        if ((a.priority || 0) !== (b.priority || 0)) return (a.priority || 0) - (b.priority || 0);
        const progressA = a.currentAmount / a.targetAmount;
        const progressB = b.currentAmount / b.targetAmount;
        return progressB - progressA;
    });

    const getTimeToGoal = (goal: SavingsGoal) => {
        if (!goal.monthlyContribution || goal.monthlyContribution <= 0) return null;
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) return 'Complete!';
        const months = Math.ceil(remaining / goal.monthlyContribution);
        if (months < 1) return 'This month';
        if (months === 1) return '1 month';
        if (months < 12) return `${months} months`;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return years === 1
            ? `1 year${remainingMonths > 0 ? ` ${remainingMonths}mo` : ''}`
            : `${years} years${remainingMonths > 0 ? ` ${remainingMonths}mo` : ''}`;
    };

    const handleContribute = (goalId: string) => {
        const amount = parseFloat(contributeAmount);
        if (amount > 0) {
            onContribute?.(goalId, amount);
            setContributeAmount('');
            setShowContributeModal(null);
        }
    };

    const renderIcon = (iconName: string, className?: string) => {
        const IconComponent = iconMap[iconName] || Target;
        return <IconComponent className={className} />;
    };

    return (
        <div className="space-y-6">
            {/* Overall Progress Card */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <Text variant="heading-lg">Savings Goals</Text>
                        <Text variant="body-sm" color="tertiary">
                            {goals.length} goal{goals.length !== 1 ? 's' : ''} in progress
                        </Text>
                    </div>
                    <button
                        onClick={onAddGoal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>

                {goals.length > 0 && (
                    <>
                        <div className="mb-4">
                            <div className="flex items-end justify-between mb-2">
                                <Text variant="heading-lg" className="font-mono">
                                    {formatCurrency(totalSaved)}
                                </Text>
                                <Text variant="body-sm" color="tertiary">
                                    of {formatCurrency(totalTarget)} total
                                </Text>
                            </div>
                            <Progress value={overallProgress} variant="success" size="lg" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 rounded-xl bg-[var(--surface-elevated)]">
                                <Text variant="body-sm" color="tertiary">Active</Text>
                                <Text variant="heading-md" className="font-mono">
                                    {goals.filter(g => !g.paused).length}
                                </Text>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--surface-elevated)]">
                                <Text variant="body-sm" color="tertiary">Completed</Text>
                                <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                                    {goals.filter(g => g.currentAmount >= g.targetAmount).length}
                                </Text>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--surface-elevated)]">
                                <Text variant="body-sm" color="tertiary">Monthly</Text>
                                <Text variant="heading-md" className="font-mono">
                                    {formatCurrency(goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0))}
                                </Text>
                            </div>
                        </div>
                    </>
                )}
            </Surface>

            {/* Goals List */}
            <div className="space-y-4">
                {sortedGoals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const isComplete = goal.currentAmount >= goal.targetAmount;
                    const timeToGoal = getTimeToGoal(goal);

                    return (
                        <Surface
                            key={goal.id}
                            elevation={1}
                            className={cn('p-0 overflow-hidden', goal.paused && 'opacity-60')}
                        >
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `color-mix(in srgb, ${goal.color} 20%, transparent)` }}
                                    >
                                        {renderIcon(goal.icon, cn('w-6 h-6', isComplete && 'text-[var(--accent-primary)]'))}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <Text variant="heading-sm">{goal.name}</Text>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {isComplete && (
                                                        <Badge variant="success" size="sm">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Complete
                                                        </Badge>
                                                    )}
                                                    {goal.paused && (
                                                        <Badge variant="info" size="sm">Paused</Badge>
                                                    )}
                                                    {goal.autoContribute && !goal.paused && (
                                                        <Badge variant="success" size="sm">
                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                            Auto
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => onTogglePause?.(goal.id)}
                                                    className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                                                    title={goal.paused ? 'Resume' : 'Pause'}
                                                >
                                                    {goal.paused ? (
                                                        <Play className="w-4 h-4 text-[var(--accent-primary)]" />
                                                    ) : (
                                                        <Pause className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => onEditGoal?.(goal)}
                                                    className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Text variant="mono-lg">
                                                    {formatCurrency(goal.currentAmount)}
                                                </Text>
                                                <Text variant="body-sm" color="tertiary">
                                                    of {formatCurrency(goal.targetAmount)}
                                                </Text>
                                            </div>
                                            <Progress
                                                value={Math.min(progress, 100)}
                                                variant={isComplete ? 'success' : 'default'}
                                                size="md"
                                            />
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            {goal.monthlyContribution && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {formatCurrency(goal.monthlyContribution)}/mo
                                                </div>
                                            )}
                                            {timeToGoal && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                                    <Calendar className="w-4 h-4" />
                                                    {timeToGoal}
                                                </div>
                                            )}
                                            {goal.targetDate && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                                    <Target className="w-4 h-4" />
                                                    {new Date(goal.targetDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Contribute */}
                            {!isComplete && !goal.paused && (
                                <div className="px-5 py-3 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)]">
                                    {showContributeModal === goal.id ? (
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">$</span>
                                                <input
                                                    type="number"
                                                    value={contributeAmount}
                                                    onChange={(e) => setContributeAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-7 pr-4 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={() => setShowContributeModal(null)}
                                                className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)]"
                                            >
                                                <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                                            </button>
                                            <button
                                                onClick={() => handleContribute(goal.id)}
                                                disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
                                                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowContributeModal(goal.id)}
                                            className="w-full flex items-center justify-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add contribution
                                        </button>
                                    )}
                                </div>
                            )}
                        </Surface>
                    );
                })}
            </div>

            {/* Empty State */}
            {goals.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
                        <Target className="w-8 h-8 text-[var(--text-quaternary)]" />
                    </div>
                    <Text variant="heading-sm" className="mb-2">No savings goals yet</Text>
                    <Text variant="body-sm" color="tertiary" className="mb-6">
                        Set your first goal to start tracking your progress
                    </Text>
                    <button
                        onClick={onAddGoal}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Goal
                    </button>
                </Surface>
            )}
        </div>
    );
}

export default GoalTracker;
