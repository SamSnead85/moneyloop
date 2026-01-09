'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Plus,
    Trash2,
    Edit2,
    Play,
    ChevronDown,
    ChevronRight,
    Check,
    X,
    Filter,
    Tag,
    Hash,
    Building,
    Repeat,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export type ConditionField = 'description' | 'amount' | 'category' | 'merchant' | 'account';
export type ConditionOperator = 'contains' | 'equals' | 'greater_than' | 'less_than' | 'starts_with';
export type ActionType = 'set_category' | 'add_tag' | 'set_notes' | 'flag_review';

export interface RuleCondition {
    id: string;
    field: ConditionField;
    operator: ConditionOperator;
    value: string;
}

export interface RuleAction {
    id: string;
    type: ActionType;
    value: string;
}

export interface TransactionRule {
    id: string;
    name: string;
    enabled: boolean;
    conditions: RuleCondition[];
    actions: RuleAction[];
    matchType: 'all' | 'any';
    autoApply: boolean;
    createdAt: string;
    appliedCount: number;
}

interface TransactionRulesProps {
    rules: TransactionRule[];
    categories: string[];
    onSave: (rule: TransactionRule) => void;
    onDelete: (ruleId: string) => void;
    onToggle: (ruleId: string) => void;
    onTest?: (rule: TransactionRule) => void;
    className?: string;
}

// ===== HELPERS =====

const fieldLabels: Record<ConditionField, string> = {
    description: 'Description',
    amount: 'Amount',
    category: 'Category',
    merchant: 'Merchant',
    account: 'Account',
};

const operatorLabels: Record<ConditionOperator, string> = {
    contains: 'contains',
    equals: 'equals',
    greater_than: 'is greater than',
    less_than: 'is less than',
    starts_with: 'starts with',
};

const actionLabels: Record<ActionType, string> = {
    set_category: 'Set category to',
    add_tag: 'Add tag',
    set_notes: 'Set notes to',
    flag_review: 'Flag for review',
};

// ===== COMPONENT =====

export function TransactionRules({
    rules,
    categories,
    onSave,
    onDelete,
    onToggle,
    onTest,
    className,
}: TransactionRulesProps) {
    const [editingRule, setEditingRule] = useState<TransactionRule | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const createNewRule = (): TransactionRule => ({
        id: Date.now().toString(),
        name: 'New Rule',
        enabled: true,
        conditions: [{ id: '1', field: 'description', operator: 'contains', value: '' }],
        actions: [{ id: '1', type: 'set_category', value: categories[0] || '' }],
        matchType: 'all',
        autoApply: true,
        createdAt: new Date().toISOString(),
        appliedCount: 0,
    });

    const handleAddCondition = () => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            conditions: [
                ...editingRule.conditions,
                { id: Date.now().toString(), field: 'description', operator: 'contains', value: '' },
            ],
        });
    };

    const handleAddAction = () => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            actions: [
                ...editingRule.actions,
                { id: Date.now().toString(), type: 'add_tag', value: '' },
            ],
        });
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-[var(--accent-primary)]" />
                        <div>
                            <Text variant="heading-lg">Transaction Rules</Text>
                            <Text variant="body-sm" color="tertiary">
                                Automatically categorize and tag transactions
                            </Text>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingRule(createNewRule());
                            setShowBuilder(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                    >
                        <Plus className="w-4 h-4" />
                        Create Rule
                    </button>
                </div>
            </Surface>

            {/* Rules List */}
            <Surface elevation={1} className="p-0 divide-y divide-[var(--border-subtle)]">
                {rules.length === 0 ? (
                    <div className="p-12 text-center">
                        <Filter className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                        <Text variant="heading-sm" className="mb-2">No rules yet</Text>
                        <Text variant="body-sm" color="tertiary">
                            Create rules to automatically organize your transactions
                        </Text>
                    </div>
                ) : (
                    rules.map(rule => {
                        const isExpanded = expandedId === rule.id;

                        return (
                            <div key={rule.id}>
                                <div
                                    className="p-4 cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggle(rule.id);
                                            }}
                                            className={cn(
                                                'w-10 h-6 rounded-full p-1 transition-colors',
                                                rule.enabled ? 'bg-[var(--accent-success)]' : 'bg-[var(--surface-elevated-2)]'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-4 h-4 rounded-full bg-white transition-transform',
                                                rule.enabled && 'translate-x-4'
                                            )} />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <Text variant="body-md" className="font-medium">{rule.name}</Text>
                                            <Text variant="body-sm" color="tertiary">
                                                {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''} •
                                                {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                                            </Text>
                                        </div>

                                        <Badge variant="default" size="sm">
                                            Applied {rule.appliedCount}x
                                        </Badge>

                                        <ChevronDown className={cn(
                                            'w-5 h-5 text-[var(--text-tertiary)] transition-transform',
                                            isExpanded && 'rotate-180'
                                        )} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[var(--surface-elevated)]"
                                        >
                                            <div className="p-4 space-y-4">
                                                {/* Conditions */}
                                                <div>
                                                    <Text variant="caption" color="tertiary" className="mb-2 block uppercase tracking-wider">
                                                        When {rule.matchType === 'all' ? 'ALL' : 'ANY'} conditions match:
                                                    </Text>
                                                    <div className="space-y-2">
                                                        {rule.conditions.map(cond => (
                                                            <div key={cond.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-base)]">
                                                                <Badge variant="info" size="sm">{fieldLabels[cond.field]}</Badge>
                                                                <Text variant="body-sm" color="tertiary">{operatorLabels[cond.operator]}</Text>
                                                                <Badge variant="default" size="sm">{cond.value}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div>
                                                    <Text variant="caption" color="tertiary" className="mb-2 block uppercase tracking-wider">
                                                        Then:
                                                    </Text>
                                                    <div className="space-y-2">
                                                        {rule.actions.map(action => (
                                                            <div key={action.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-base)]">
                                                                <Badge variant="success" size="sm">{actionLabels[action.type]}</Badge>
                                                                {action.value && (
                                                                    <Badge variant="default" size="sm">{action.value}</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingRule(rule);
                                                            setShowBuilder(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)]"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    {onTest && (
                                                        <button
                                                            onClick={() => onTest(rule)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)]"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                            Test
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onDelete(rule.id)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)]"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </Surface>

            {/* Rule Builder Modal */}
            <AnimatePresence>
                {showBuilder && editingRule && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="w-full max-w-2xl mx-4"
                        >
                            <Surface elevation={2} className="p-6 max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <Text variant="heading-lg">
                                        {editingRule.appliedCount === 0 ? 'Create Rule' : 'Edit Rule'}
                                    </Text>
                                    <button
                                        onClick={() => setShowBuilder(false)}
                                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Rule Name */}
                                <div className="mb-6">
                                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Rule Name</Text>
                                    <input
                                        type="text"
                                        value={editingRule.name}
                                        onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)]"
                                    />
                                </div>

                                {/* Conditions */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <Text variant="body-sm" color="tertiary">Conditions</Text>
                                        <select
                                            value={editingRule.matchType}
                                            onChange={(e) => setEditingRule({ ...editingRule, matchType: e.target.value as 'all' | 'any' })}
                                            className="px-3 py-1 rounded-lg bg-[var(--surface-elevated)] text-sm"
                                        >
                                            <option value="all">Match ALL</option>
                                            <option value="any">Match ANY</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        {editingRule.conditions.map((cond, i) => (
                                            <div key={cond.id} className="flex gap-2">
                                                <select
                                                    value={cond.field}
                                                    onChange={(e) => {
                                                        const newConds = [...editingRule.conditions];
                                                        newConds[i] = { ...cond, field: e.target.value as ConditionField };
                                                        setEditingRule({ ...editingRule, conditions: newConds });
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-[var(--surface-elevated)]"
                                                >
                                                    {Object.entries(fieldLabels).map(([k, v]) => (
                                                        <option key={k} value={k}>{v}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={cond.operator}
                                                    onChange={(e) => {
                                                        const newConds = [...editingRule.conditions];
                                                        newConds[i] = { ...cond, operator: e.target.value as ConditionOperator };
                                                        setEditingRule({ ...editingRule, conditions: newConds });
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-[var(--surface-elevated)]"
                                                >
                                                    {Object.entries(operatorLabels).map(([k, v]) => (
                                                        <option key={k} value={k}>{v}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={cond.value}
                                                    onChange={(e) => {
                                                        const newConds = [...editingRule.conditions];
                                                        newConds[i] = { ...cond, value: e.target.value };
                                                        setEditingRule({ ...editingRule, conditions: newConds });
                                                    }}
                                                    placeholder="Value..."
                                                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]"
                                                />
                                                {editingRule.conditions.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingRule({
                                                                ...editingRule,
                                                                conditions: editingRule.conditions.filter(c => c.id !== cond.id),
                                                            });
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)]"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddCondition}
                                        className="flex items-center gap-2 mt-2 text-sm text-[var(--accent-primary)] hover:underline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Condition
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="mb-6">
                                    <Text variant="body-sm" color="tertiary" className="mb-3 block">Actions</Text>
                                    <div className="space-y-2">
                                        {editingRule.actions.map((action, i) => (
                                            <div key={action.id} className="flex gap-2">
                                                <select
                                                    value={action.type}
                                                    onChange={(e) => {
                                                        const newActions = [...editingRule.actions];
                                                        newActions[i] = { ...action, type: e.target.value as ActionType };
                                                        setEditingRule({ ...editingRule, actions: newActions });
                                                    }}
                                                    className="px-3 py-2 rounded-lg bg-[var(--surface-elevated)]"
                                                >
                                                    {Object.entries(actionLabels).map(([k, v]) => (
                                                        <option key={k} value={k}>{v}</option>
                                                    ))}
                                                </select>
                                                {action.type !== 'flag_review' && (
                                                    action.type === 'set_category' ? (
                                                        <select
                                                            value={action.value}
                                                            onChange={(e) => {
                                                                const newActions = [...editingRule.actions];
                                                                newActions[i] = { ...action, value: e.target.value };
                                                                setEditingRule({ ...editingRule, actions: newActions });
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-elevated)]"
                                                        >
                                                            {categories.map(cat => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={action.value}
                                                            onChange={(e) => {
                                                                const newActions = [...editingRule.actions];
                                                                newActions[i] = { ...action, value: e.target.value };
                                                                setEditingRule({ ...editingRule, actions: newActions });
                                                            }}
                                                            placeholder="Value..."
                                                            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]"
                                                        />
                                                    )
                                                )}
                                                {editingRule.actions.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingRule({
                                                                ...editingRule,
                                                                actions: editingRule.actions.filter(a => a.id !== action.id),
                                                            });
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)]"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddAction}
                                        className="flex items-center gap-2 mt-2 text-sm text-[var(--accent-primary)] hover:underline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Action
                                    </button>
                                </div>

                                {/* Auto-Apply */}
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-elevated)] cursor-pointer mb-6">
                                    <input
                                        type="checkbox"
                                        checked={editingRule.autoApply}
                                        onChange={(e) => setEditingRule({ ...editingRule, autoApply: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <div>
                                        <Text variant="body-sm" className="font-medium">Auto-apply to new transactions</Text>
                                        <Text variant="caption" color="tertiary">
                                            Automatically run this rule on incoming transactions
                                        </Text>
                                    </div>
                                </label>

                                {/* Save */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBuilder(false)}
                                        className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSave(editingRule);
                                            setShowBuilder(false);
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                                    >
                                        Save Rule
                                    </button>
                                </div>
                            </Surface>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TransactionRules;
