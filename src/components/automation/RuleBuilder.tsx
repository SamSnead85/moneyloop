'use client';

/**
 * Rule Builder
 * 
 * Visual interface for creating and editing automation rules.
 * Supports drag-and-drop condition blocks and action configuration.
 * 
 * Phase 26-30 of Sprint 1.2
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    Zap,
    Bell,
    Tag,
    Flag,
    PiggyBank,
    Bot,
    Mail,
    Globe,
    Calendar,
    Settings,
    X,
    Check,
} from 'lucide-react';

// Types from rules-engine
type RuleTrigger =
    | 'transaction_created'
    | 'bill_due_soon'
    | 'budget_exceeded'
    | 'goal_milestone'
    | 'low_balance'
    | 'large_expense'
    | 'recurring_detected'
    | 'scheduled'
    | 'manual';

type RuleAction =
    | 'send_notification'
    | 'categorize_transaction'
    | 'flag_for_review'
    | 'create_task'
    | 'move_to_savings'
    | 'run_agent'
    | 'send_email'
    | 'webhook';

type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'between';

interface Condition {
    id: string;
    field: string;
    operator: ConditionOperator;
    value: string | number;
}

interface ActionConfig {
    id: string;
    type: RuleAction;
    config: Record<string, string | number | boolean>;
}

interface RuleBuilderProps {
    onSave: (rule: {
        name: string;
        trigger: RuleTrigger;
        conditions: Condition[];
        conditionLogic: 'AND' | 'OR';
        actions: ActionConfig[];
        schedule?: string;
    }) => void;
    onCancel: () => void;
    initialRule?: {
        name: string;
        trigger: RuleTrigger;
        conditions: Condition[];
        conditionLogic: 'AND' | 'OR';
        actions: ActionConfig[];
        schedule?: string;
    };
}

const TRIGGERS: { value: RuleTrigger; label: string; icon: React.ReactNode }[] = [
    { value: 'transaction_created', label: 'New Transaction', icon: <Tag className="w-4 h-4" /> },
    { value: 'bill_due_soon', label: 'Bill Due Soon', icon: <Calendar className="w-4 h-4" /> },
    { value: 'budget_exceeded', label: 'Budget Exceeded', icon: <Flag className="w-4 h-4" /> },
    { value: 'low_balance', label: 'Low Balance', icon: <PiggyBank className="w-4 h-4" /> },
    { value: 'large_expense', label: 'Large Expense', icon: <Zap className="w-4 h-4" /> },
    { value: 'goal_milestone', label: 'Goal Milestone', icon: <Check className="w-4 h-4" /> },
    { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" /> },
    { value: 'manual', label: 'Manual Run', icon: <Settings className="w-4 h-4" /> },
];

const ACTIONS: { value: RuleAction; label: string; icon: React.ReactNode }[] = [
    { value: 'send_notification', label: 'Send Notification', icon: <Bell className="w-4 h-4" /> },
    { value: 'categorize_transaction', label: 'Categorize', icon: <Tag className="w-4 h-4" /> },
    { value: 'flag_for_review', label: 'Flag for Review', icon: <Flag className="w-4 h-4" /> },
    { value: 'create_task', label: 'Create Task', icon: <Check className="w-4 h-4" /> },
    { value: 'move_to_savings', label: 'Move to Savings', icon: <PiggyBank className="w-4 h-4" /> },
    { value: 'run_agent', label: 'Run AI Agent', icon: <Bot className="w-4 h-4" /> },
    { value: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'webhook', label: 'Call Webhook', icon: <Globe className="w-4 h-4" /> },
];

const OPERATORS: { value: ConditionOperator; label: string }[] = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'greater_than', label: 'is greater than' },
    { value: 'less_than', label: 'is less than' },
    { value: 'between', label: 'is between' },
];

const FIELDS = ['amount', 'merchant', 'category', 'account', 'balance', 'days_until_due'];

export function RuleBuilder({ onSave, onCancel, initialRule }: RuleBuilderProps) {
    const [name, setName] = useState(initialRule?.name || '');
    const [trigger, setTrigger] = useState<RuleTrigger>(initialRule?.trigger || 'transaction_created');
    const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>(initialRule?.conditionLogic || 'AND');
    const [conditions, setConditions] = useState<Condition[]>(
        initialRule?.conditions || []
    );
    const [actions, setActions] = useState<ActionConfig[]>(
        initialRule?.actions || []
    );
    const [schedule, setSchedule] = useState(initialRule?.schedule || '');
    const [expandedAction, setExpandedAction] = useState<string | null>(null);

    const generateId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const addCondition = () => {
        setConditions([
            ...conditions,
            { id: generateId(), field: 'amount', operator: 'greater_than', value: 0 },
        ]);
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const updateCondition = (id: string, updates: Partial<Condition>) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const addAction = (type: RuleAction) => {
        const newAction: ActionConfig = {
            id: generateId(),
            type,
            config: {},
        };
        setActions([...actions, newAction]);
        setExpandedAction(newAction.id);
    };

    const removeAction = (id: string) => {
        setActions(actions.filter(a => a.id !== id));
    };

    const updateActionConfig = (id: string, key: string, value: string | number | boolean) => {
        setActions(actions.map(a =>
            a.id === id ? { ...a, config: { ...a.config, [key]: value } } : a
        ));
    };

    const handleSave = () => {
        onSave({
            name,
            trigger,
            conditions,
            conditionLogic,
            actions,
            schedule: trigger === 'scheduled' ? schedule : undefined,
        });
    };

    const isValid = name.trim() && actions.length > 0;

    return (
        <div className="bg-[var(--surface-base)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--surface-secondary)]">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10">
                        <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rule Name"
                        className="text-lg font-semibold bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-[var(--surface-tertiary)] rounded-lg">
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Trigger Selection */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        When this happens...
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TRIGGERS.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setTrigger(t.value)}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-sm ${trigger === t.value
                                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule (if scheduled trigger) */}
                {trigger === 'scheduled' && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Schedule (cron expression)
                        </label>
                        <input
                            type="text"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                            placeholder="0 9 * * * (daily at 9am)"
                            className="w-full px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                        />
                    </div>
                )}

                {/* Conditions */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">
                            If these conditions are met...
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setConditionLogic('AND')}
                                className={`px-2 py-1 text-xs rounded ${conditionLogic === 'AND' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                AND
                            </button>
                            <button
                                onClick={() => setConditionLogic('OR')}
                                className={`px-2 py-1 text-xs rounded ${conditionLogic === 'OR' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                OR
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {conditions.map((condition, idx) => (
                                <motion.div
                                    key={condition.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    {idx > 0 && (
                                        <span className="text-xs text-[var(--text-tertiary)] w-8">{conditionLogic}</span>
                                    )}
                                    <select
                                        value={condition.field}
                                        onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] text-sm"
                                    >
                                        {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select
                                        value={condition.operator}
                                        onChange={(e) => updateCondition(condition.id, { operator: e.target.value as ConditionOperator })}
                                        className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] text-sm"
                                    >
                                        {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        value={condition.value}
                                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                        placeholder="Value"
                                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] text-sm"
                                    />
                                    <button
                                        onClick={() => removeCondition(condition.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <button
                            onClick={addCondition}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Condition
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Then do this...
                    </label>

                    <div className="space-y-2 mb-3">
                        <AnimatePresence>
                            {actions.map((action) => {
                                const actionMeta = ACTIONS.find(a => a.value === action.type);
                                return (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border border-[var(--border-primary)] rounded-lg overflow-hidden"
                                    >
                                        <div
                                            className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] cursor-pointer"
                                            onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[var(--accent-primary)]">{actionMeta?.icon}</span>
                                                <span className="font-medium text-sm text-[var(--text-primary)]">{actionMeta?.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeAction(action.id); }}
                                                    className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                {expandedAction === action.id ? (
                                                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                )}
                                            </div>
                                        </div>

                                        {expandedAction === action.id && (
                                            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--surface-base)]">
                                                {action.type === 'send_notification' && (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            value={action.config.title as string || ''}
                                                            onChange={(e) => updateActionConfig(action.id, 'title', e.target.value)}
                                                            placeholder="Notification title"
                                                            className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={action.config.message as string || ''}
                                                            onChange={(e) => updateActionConfig(action.id, 'message', e.target.value)}
                                                            placeholder="Notification message (use {field} for variables)"
                                                            className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-sm"
                                                        />
                                                    </div>
                                                )}
                                                {action.type === 'categorize_transaction' && (
                                                    <input
                                                        type="text"
                                                        value={action.config.category as string || ''}
                                                        onChange={(e) => updateActionConfig(action.id, 'category', e.target.value)}
                                                        placeholder="Category name"
                                                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-sm"
                                                    />
                                                )}
                                                {action.type === 'run_agent' && (
                                                    <select
                                                        value={action.config.agentType as string || ''}
                                                        onChange={(e) => updateActionConfig(action.id, 'agentType', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-sm"
                                                    >
                                                        <option value="">Select agent...</option>
                                                        <option value="bill_negotiator">Bill Negotiator</option>
                                                        <option value="subscription_optimizer">Subscription Optimizer</option>
                                                        <option value="savings_finder">Savings Finder</option>
                                                    </select>
                                                )}
                                                {action.type === 'webhook' && (
                                                    <input
                                                        type="url"
                                                        value={action.config.url as string || ''}
                                                        onChange={(e) => updateActionConfig(action.id, 'url', e.target.value)}
                                                        placeholder="https://example.com/webhook"
                                                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-sm"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Add Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {ACTIONS.map((a) => (
                            <button
                                key={a.value}
                                onClick={() => addAction(a.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                            >
                                {a.icon}
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-primary)] bg-[var(--surface-secondary)]">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check className="w-4 h-4" />
                    Save Rule
                </button>
            </div>
        </div>
    );
}

export default RuleBuilder;
