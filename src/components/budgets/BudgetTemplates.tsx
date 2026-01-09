'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Check,
    ChevronRight,
    PieChart,
    TrendingUp,
    Shield,
    Wallet,
    Home,
    GraduationCap,
    Plane,
    Edit2,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface BudgetTemplate {
    id: string;
    name: string;
    description: string;
    icon: typeof PieChart;
    categories: Array<{
        name: string;
        percentage: number;
        type: 'needs' | 'wants' | 'savings';
    }>;
    popular?: boolean;
}

interface BudgetTemplatePickerProps {
    templates: BudgetTemplate[];
    monthlyIncome: number;
    onSelect: (template: BudgetTemplate, allocations: Record<string, number>) => void;
    onCustomize?: () => void;
    className?: string;
}

// ===== DEFAULT TEMPLATES =====

export const defaultBudgetTemplates: BudgetTemplate[] = [
    {
        id: '50-30-20',
        name: '50/30/20 Rule',
        description: 'Classic balanced approach: 50% needs, 30% wants, 20% savings',
        icon: PieChart,
        popular: true,
        categories: [
            { name: 'Housing', percentage: 25, type: 'needs' },
            { name: 'Utilities', percentage: 10, type: 'needs' },
            { name: 'Groceries', percentage: 10, type: 'needs' },
            { name: 'Transportation', percentage: 5, type: 'needs' },
            { name: 'Entertainment', percentage: 15, type: 'wants' },
            { name: 'Dining Out', percentage: 10, type: 'wants' },
            { name: 'Shopping', percentage: 5, type: 'wants' },
            { name: 'Emergency Fund', percentage: 10, type: 'savings' },
            { name: 'Investments', percentage: 10, type: 'savings' },
        ],
    },
    {
        id: 'aggressive-saver',
        name: 'Aggressive Saver',
        description: 'Maximize savings: 50% needs, 20% wants, 30% savings',
        icon: TrendingUp,
        categories: [
            { name: 'Housing', percentage: 25, type: 'needs' },
            { name: 'Utilities', percentage: 8, type: 'needs' },
            { name: 'Groceries', percentage: 10, type: 'needs' },
            { name: 'Transportation', percentage: 7, type: 'needs' },
            { name: 'Entertainment', percentage: 10, type: 'wants' },
            { name: 'Dining Out', percentage: 5, type: 'wants' },
            { name: 'Shopping', percentage: 5, type: 'wants' },
            { name: 'Emergency Fund', percentage: 15, type: 'savings' },
            { name: 'Investments', percentage: 15, type: 'savings' },
        ],
    },
    {
        id: 'debt-payoff',
        name: 'Debt Payoff Focus',
        description: 'Accelerate debt repayment with minimal discretionary spending',
        icon: Shield,
        categories: [
            { name: 'Housing', percentage: 25, type: 'needs' },
            { name: 'Utilities', percentage: 10, type: 'needs' },
            { name: 'Groceries', percentage: 12, type: 'needs' },
            { name: 'Transportation', percentage: 8, type: 'needs' },
            { name: 'Debt Payments', percentage: 25, type: 'needs' },
            { name: 'Entertainment', percentage: 5, type: 'wants' },
            { name: 'Dining Out', percentage: 5, type: 'wants' },
            { name: 'Emergency Fund', percentage: 10, type: 'savings' },
        ],
    },
];

// ===== COMPONENT =====

export function BudgetTemplatePicker({
    templates = defaultBudgetTemplates,
    monthlyIncome,
    onSelect,
    onCustomize,
    className,
}: BudgetTemplatePickerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [step, setStep] = useState<'select' | 'preview'>('select');

    const selectedTemplate = templates.find(t => t.id === selectedId);

    const typeColors = {
        needs: 'var(--accent-primary)',
        wants: 'var(--chart-3)',
        savings: 'var(--accent-success)',
    };

    const handleConfirm = () => {
        if (!selectedTemplate) return;

        const allocations: Record<string, number> = {};
        selectedTemplate.categories.forEach(cat => {
            allocations[cat.name] = Math.round(monthlyIncome * (cat.percentage / 100));
        });

        onSelect(selectedTemplate, allocations);
    };

    return (
        <Surface elevation={1} className={cn('p-6', className)}>
            {step === 'select' ? (
                <>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" />
                        <div>
                            <Text variant="heading-lg">Choose a Budget Template</Text>
                            <Text variant="body-sm" color="tertiary">
                                Start with a proven approach, customize later
                            </Text>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {templates.map(template => {
                            const Icon = template.icon;
                            const isSelected = selectedId === template.id;

                            return (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedId(template.id)}
                                    className={cn(
                                        'w-full p-4 rounded-xl text-left transition-all',
                                        isSelected
                                            ? 'bg-[var(--accent-primary-subtle)] ring-2 ring-[var(--accent-primary)]'
                                            : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)]'
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                                            isSelected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--surface-base)]'
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Text variant="body-md" className="font-medium">{template.name}</Text>
                                                {template.popular && (
                                                    <Badge variant="info" size="sm">Popular</Badge>
                                                )}
                                            </div>
                                            <Text variant="body-sm" color="tertiary">{template.description}</Text>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-[var(--accent-primary)]" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onCustomize}
                            className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                        >
                            <Edit2 className="w-4 h-4 inline mr-2" />
                            Build Custom
                        </button>
                        <button
                            onClick={() => selectedId && setStep('preview')}
                            disabled={!selectedId}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-primary)] text-white disabled:opacity-50 hover:brightness-110"
                        >
                            Preview
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </>
            ) : selectedTemplate && (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Text variant="heading-lg">{selectedTemplate.name}</Text>
                            <Text variant="body-sm" color="tertiary">
                                Based on {formatCurrency(monthlyIncome)}/month income
                            </Text>
                        </div>
                        <button
                            onClick={() => setStep('select')}
                            className="text-[var(--accent-primary)] hover:underline text-sm"
                        >
                            Change Template
                        </button>
                    </div>

                    {/* Category Allocations */}
                    <div className="space-y-4 mb-6">
                        {(['needs', 'wants', 'savings'] as const).map(type => {
                            const categories = selectedTemplate.categories.filter(c => c.type === type);
                            const typeTotal = categories.reduce((sum, c) => sum + c.percentage, 0);

                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Text variant="body-sm" className="capitalize font-medium">{type}</Text>
                                        <Text variant="mono-sm" style={{ color: typeColors[type] }}>
                                            {typeTotal}% ({formatCurrency(monthlyIncome * typeTotal / 100)})
                                        </Text>
                                    </div>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <div key={cat.name} className="flex items-center gap-3 pl-4">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: typeColors[type] }}
                                                />
                                                <Text variant="body-sm" color="tertiary" className="flex-1">
                                                    {cat.name}
                                                </Text>
                                                <Text variant="mono-sm">
                                                    {formatCurrency(monthlyIncome * cat.percentage / 100)}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                    >
                        Apply This Budget
                    </button>
                </>
            )}
        </Surface>
    );
}

// ===== GOAL MILESTONES =====

export interface GoalMilestone {
    id: string;
    percentage: number;
    label: string;
    reached: boolean;
    reachedDate?: string;
}

export interface GoalWithMilestones {
    id: string;
    name: string;
    icon: typeof Home;
    currentAmount: number;
    targetAmount: number;
    milestones: GoalMilestone[];
}

interface GoalMilestonesProps {
    goal: GoalWithMilestones;
    onCelebrate?: (milestone: GoalMilestone) => void;
    className?: string;
}

export function GoalMilestones({ goal, onCelebrate, className }: GoalMilestonesProps) {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const Icon = goal.icon;
    const nextMilestone = goal.milestones.find(m => !m.reached);

    return (
        <Surface elevation={1} className={cn('p-6', className)}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <div className="flex-1">
                    <Text variant="heading-md">{goal.name}</Text>
                    <Text variant="body-sm" color="tertiary">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </Text>
                </div>
                <Text variant="heading-lg" className="text-[var(--accent-primary)] font-mono">
                    {progress.toFixed(0)}%
                </Text>
            </div>

            {/* Progress bar with milestones */}
            <div className="relative mb-8">
                <div className="h-3 rounded-full bg-[var(--surface-elevated-2)] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-[var(--accent-primary)]"
                    />
                </div>

                {/* Milestone markers */}
                {goal.milestones.map(milestone => (
                    <div
                        key={milestone.id}
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: `${milestone.percentage}%` }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className={cn(
                                'w-6 h-6 rounded-full border-2 flex items-center justify-center -ml-3',
                                milestone.reached
                                    ? 'bg-[var(--accent-success)] border-[var(--accent-success)]'
                                    : 'bg-[var(--surface-base)] border-[var(--border-default)]'
                            )}
                        >
                            {milestone.reached && <Check className="w-3 h-3 text-white" />}
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Milestone list */}
            <div className="space-y-3">
                {goal.milestones.map((milestone, i) => (
                    <div
                        key={milestone.id}
                        className={cn(
                            'flex items-center gap-3 p-3 rounded-xl',
                            milestone.reached
                                ? 'bg-[var(--accent-success-subtle)]'
                                : 'bg-[var(--surface-elevated)]'
                        )}
                    >
                        <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            milestone.reached
                                ? 'bg-[var(--accent-success)] text-white'
                                : 'bg-[var(--surface-base)]'
                        )}>
                            {milestone.reached ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Text variant="mono-sm">{milestone.percentage}%</Text>
                            )}
                        </div>
                        <div className="flex-1">
                            <Text variant="body-sm" className="font-medium">{milestone.label}</Text>
                            {milestone.reachedDate && (
                                <Text variant="caption" color="tertiary">
                                    Reached {new Date(milestone.reachedDate).toLocaleDateString()}
                                </Text>
                            )}
                        </div>
                        <Text variant="mono-sm" color="tertiary">
                            {formatCurrency(goal.targetAmount * milestone.percentage / 100)}
                        </Text>
                    </div>
                ))}
            </div>

            {/* Next milestone callout */}
            {nextMilestone && (
                <div className="mt-6 p-4 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
                    <div className="flex-1">
                        <Text variant="body-sm" className="font-medium">
                            Next: {nextMilestone.label}
                        </Text>
                        <Text variant="caption" color="tertiary">
                            {formatCurrency((goal.targetAmount * nextMilestone.percentage / 100) - goal.currentAmount)} to go
                        </Text>
                    </div>
                </div>
            )}
        </Surface>
    );
}

export default BudgetTemplatePicker;
