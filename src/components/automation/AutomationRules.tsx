'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Zap,
    Play,
    Pause,
    Trash2,
    Edit2,
    ChevronRight,
    ChevronDown,
    Tag,
    Bell,
    ArrowRight,
    Copy,
    MoreHorizontal,
    Check,
    X,
    Filter,
    DollarSign,
    Store,
    Calendar,
    CreditCard,
    Hash,
    AlertCircle,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export type ConditionType =
    | 'amount_greater' | 'amount_less' | 'amount_between'
    | 'merchant_contains' | 'merchant_equals'
    | 'category_is' | 'category_is_not'
    | 'account_is' | 'date_is_weekend' | 'is_recurring';

export type ActionType =
    | 'set_category' | 'add_tag' | 'remove_tag'
    | 'send_notification' | 'mark_reviewed'
    | 'add_to_budget' | 'flag_for_review';

export interface RuleCondition {
    type: ConditionType;
    value: string | number | [number, number];
}

export interface RuleAction {
    type: ActionType;
    value?: string;
}

export interface AutomationRule {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    conditions: RuleCondition[];
    actions: RuleAction[];
    matchAll: boolean; // AND vs OR
    runCount?: number;
    lastRun?: string;
    createdAt: string;
}

interface AutomationRulesProps {
    rules: AutomationRule[];
    onCreateRule?: () => void;
    onEditRule?: (rule: AutomationRule) => void;
    onDeleteRule?: (id: string) => void;
    onToggleRule?: (id: string) => void;
    onDuplicateRule?: (rule: AutomationRule) => void;
    onRunRule?: (id: string) => void;
    categories?: string[];
    accounts?: Array<{ id: string; name: string }>;
}

// ===== HELPERS =====

const conditionLabels: Record<ConditionType, string> = {
    amount_greater: 'Amount is greater than',
    amount_less: 'Amount is less than',
    amount_between: 'Amount is between',
    merchant_contains: 'Merchant contains',
    merchant_equals: 'Merchant equals',
    category_is: 'Category is',
    category_is_not: 'Category is not',
    account_is: 'Account is',
    date_is_weekend: 'Is on weekend',
    is_recurring: 'Is recurring',
};

const actionLabels: Record<ActionType, string> = {
    set_category: 'Set category to',
    add_tag: 'Add tag',
    remove_tag: 'Remove tag',
    send_notification: 'Send notification',
    mark_reviewed: 'Mark as reviewed',
    add_to_budget: 'Add to budget',
    flag_for_review: 'Flag for review',
};

const conditionIcons: Record<ConditionType, typeof DollarSign> = {
    amount_greater: DollarSign,
    amount_less: DollarSign,
    amount_between: DollarSign,
    merchant_contains: Store,
    merchant_equals: Store,
    category_is: Tag,
    category_is_not: Tag,
    account_is: CreditCard,
    date_is_weekend: Calendar,
    is_recurring: Hash,
};

const actionIcons: Record<ActionType, typeof Tag> = {
    set_category: Tag,
    add_tag: Tag,
    remove_tag: Tag,
    send_notification: Bell,
    mark_reviewed: Check,
    add_to_budget: DollarSign,
    flag_for_review: AlertCircle,
};

// ===== COMPONENT =====

export function AutomationRules({
    rules,
    onCreateRule,
    onEditRule,
    onDeleteRule,
    onToggleRule,
    onDuplicateRule,
    onRunRule,
    categories = [],
    accounts = [],
}: AutomationRulesProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const enabledCount = rules.filter(r => r.enabled).length;
    const totalRuns = rules.reduce((sum, r) => sum + (r.runCount || 0), 0);

    const formatConditionValue = (condition: RuleCondition) => {
        if (condition.type === 'amount_between' && Array.isArray(condition.value)) {
            return `$${condition.value[0]} - $${condition.value[1]}`;
        }
        if (condition.type.startsWith('amount_')) {
            return `$${condition.value}`;
        }
        if (condition.type === 'date_is_weekend' || condition.type === 'is_recurring') {
            return condition.value ? 'Yes' : 'No';
        }
        return condition.value?.toString() || '';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <Text variant="heading-lg">Automation Rules</Text>
                            <Text variant="body-sm" color="tertiary">
                                Auto-categorize and organize transactions
                            </Text>
                        </div>
                    </div>
                    <button
                        onClick={onCreateRule}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Rule
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Total Rules</Text>
                        <Text variant="heading-md" className="font-mono">{rules.length}</Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Active</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                            {enabledCount}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Total Runs</Text>
                        <Text variant="heading-md" className="font-mono">{totalRuns.toLocaleString()}</Text>
                    </div>
                </div>
            </Surface>

            {/* Rules List */}
            <div className="space-y-3">
                {rules.map((rule) => {
                    const isExpanded = expandedId === rule.id;

                    return (
                        <Surface
                            key={rule.id}
                            elevation={1}
                            className={cn(
                                'p-0 overflow-hidden transition-opacity',
                                !rule.enabled && 'opacity-60'
                            )}
                        >
                            <div
                                className="p-4 cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Toggle */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleRule?.(rule.id);
                                        }}
                                        className={cn(
                                            'w-10 h-6 rounded-full transition-colors relative shrink-0',
                                            rule.enabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-elevated-2)]'
                                        )}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: rule.enabled ? 16 : 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>

                                    {/* Name & Description */}
                                    <div className="flex-1 min-w-0">
                                        <Text variant="body-md" className="font-medium">{rule.name}</Text>
                                        {rule.description && (
                                            <Text variant="body-sm" color="tertiary" className="truncate">
                                                {rule.description}
                                            </Text>
                                        )}
                                    </div>

                                    {/* Preview of conditions/actions */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <Badge variant="info" size="sm">
                                            {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                                        </Badge>
                                        <ArrowRight className="w-4 h-4 text-[var(--text-quaternary)]" />
                                        <Badge variant="success" size="sm">
                                            {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>

                                    {/* Run count */}
                                    {rule.runCount !== undefined && rule.runCount > 0 && (
                                        <Text variant="body-sm" color="tertiary">
                                            {rule.runCount.toLocaleString()} runs
                                        </Text>
                                    )}

                                    {/* Expand */}
                                    <ChevronRight className={cn(
                                        'w-5 h-5 text-[var(--text-tertiary)] transition-transform shrink-0',
                                        isExpanded && 'rotate-90'
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
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4">
                                            <Divider className="mb-4" />

                                            {/* Conditions */}
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                    <Text variant="body-sm" color="tertiary">
                                                        When {rule.matchAll ? 'ALL' : 'ANY'} conditions match:
                                                    </Text>
                                                </div>
                                                <div className="space-y-2 pl-6">
                                                    {rule.conditions.map((condition, i) => {
                                                        const Icon = conditionIcons[condition.type];
                                                        return (
                                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                                <Icon className="w-4 h-4 text-[var(--text-quaternary)]" />
                                                                <Text variant="body-sm">
                                                                    {conditionLabels[condition.type]}
                                                                </Text>
                                                                <Badge variant="info" size="sm">
                                                                    {formatConditionValue(condition)}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                    <Text variant="body-sm" color="tertiary">Then:</Text>
                                                </div>
                                                <div className="space-y-2 pl-6">
                                                    {rule.actions.map((action, i) => {
                                                        const Icon = actionIcons[action.type];
                                                        return (
                                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                                <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                                                                <Text variant="body-sm">
                                                                    {actionLabels[action.type]}
                                                                </Text>
                                                                {action.value && (
                                                                    <Badge variant="success" size="sm">
                                                                        {action.value}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Last run info */}
                                            {rule.lastRun && (
                                                <Text variant="body-sm" color="tertiary" className="mb-4">
                                                    Last run: {new Date(rule.lastRun).toLocaleString()}
                                                </Text>
                                            )}

                                            <Divider className="mb-4" />

                                            {/* Actions */}
                                            {deleteConfirmId === rule.id ? (
                                                <div className="flex items-center justify-between">
                                                    <Text variant="body-sm" color="danger">
                                                        Delete this rule?
                                                    </Text>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onDeleteRule?.(rule.id);
                                                                setDeleteConfirmId(null);
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent-danger)] text-white"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => onRunRule?.(rule.id)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        Run Now
                                                    </button>
                                                    <button
                                                        onClick={() => onEditRule?.(rule)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => onDuplicateRule?.(rule)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        Duplicate
                                                    </button>
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={() => setDeleteConfirmId(rule.id)}
                                                        className="p-2 rounded-lg text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Surface>
                    );
                })}
            </div>

            {/* Empty State */}
            {rules.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
                        <Zap className="w-8 h-8 text-[var(--text-quaternary)]" />
                    </div>
                    <Text variant="heading-sm" className="mb-2">No automation rules yet</Text>
                    <Text variant="body-sm" color="tertiary" className="mb-6">
                        Create rules to automatically categorize and organize your transactions
                    </Text>
                    <button
                        onClick={onCreateRule}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Rule
                    </button>
                </Surface>
            )}
        </div>
    );
}

export default AutomationRules;
