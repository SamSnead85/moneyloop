'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Split,
    Check,
    Trash2,
    DollarSign,
} from 'lucide-react';
import { Surface, Text, Badge, Progress } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface SplitItem {
    id: string;
    category: string;
    amount: number;
    notes?: string;
}

interface SplitTransactionProps {
    totalAmount: number;
    categories: string[];
    initialSplits?: SplitItem[];
    onSave: (splits: SplitItem[]) => void;
    onCancel: () => void;
}

// ===== COMPONENT =====

export function SplitTransaction({
    totalAmount,
    categories,
    initialSplits = [],
    onSave,
    onCancel,
}: SplitTransactionProps) {
    const [splits, setSplits] = useState<SplitItem[]>(
        initialSplits.length > 0
            ? initialSplits
            : [
                { id: '1', category: categories[0] || '', amount: totalAmount / 2, notes: '' },
                { id: '2', category: categories[1] || categories[0] || '', amount: totalAmount / 2, notes: '' },
            ]
    );

    const allocatedAmount = splits.reduce((sum, s) => sum + s.amount, 0);
    const remainingAmount = totalAmount - allocatedAmount;
    const isBalanced = Math.abs(remainingAmount) < 0.01;

    const addSplit = () => {
        setSplits(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                category: categories[0] || '',
                amount: Math.max(0, remainingAmount),
                notes: '',
            },
        ]);
    };

    const removeSplit = (id: string) => {
        if (splits.length <= 2) return;
        setSplits(prev => prev.filter(s => s.id !== id));
    };

    const updateSplit = (id: string, updates: Partial<SplitItem>) => {
        setSplits(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const distributeEvenly = () => {
        const evenAmount = totalAmount / splits.length;
        setSplits(prev => prev.map(s => ({ ...s, amount: evenAmount })));
    };

    return (
        <Surface elevation={2} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                        <Split className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <Text variant="heading-md">Split Transaction</Text>
                        <Text variant="body-sm" color="tertiary">
                            Total: {formatCurrency(totalAmount)}
                        </Text>
                    </div>
                </div>
                <button onClick={onCancel} className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Allocation Status */}
            <div className={cn(
                'p-4 rounded-xl mb-6',
                isBalanced ? 'bg-[var(--accent-success-subtle)]' : 'bg-[var(--accent-warning-subtle)]'
            )}>
                <div className="flex items-center justify-between mb-2">
                    <Text variant="body-sm">Allocation Status</Text>
                    {isBalanced ? (
                        <Badge variant="success" size="sm">
                            <Check className="w-3 h-3 mr-1" />
                            Balanced
                        </Badge>
                    ) : (
                        <Badge variant="warning" size="sm">
                            {remainingAmount > 0 ? `${formatCurrency(remainingAmount)} remaining` : `${formatCurrency(Math.abs(remainingAmount))} over`}
                        </Badge>
                    )}
                </div>
                <Progress
                    value={Math.min((allocatedAmount / totalAmount) * 100, 100)}
                    variant={isBalanced ? 'success' : 'warning'}
                    size="sm"
                />
            </div>

            {/* Splits */}
            <div className="space-y-4 mb-6">
                <AnimatePresence>
                    {splits.map((split, index) => (
                        <motion.div
                            key={split.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-xl bg-[var(--surface-elevated)]"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Text variant="body-sm" color="tertiary">Split {index + 1}</Text>
                                {splits.length > 2 && (
                                    <button
                                        onClick={() => removeSplit(split.id)}
                                        className="ml-auto p-1 rounded hover:bg-[var(--accent-danger-subtle)] text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Text variant="caption" color="tertiary" className="mb-1 block">Category</Text>
                                    <select
                                        value={split.category}
                                        onChange={(e) => updateSplit(split.id, { category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Text variant="caption" color="tertiary" className="mb-1 block">Amount</Text>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">$</span>
                                        <input
                                            type="number"
                                            value={split.amount || ''}
                                            onChange={(e) => updateSplit(split.id, { amount: parseFloat(e.target.value) || 0 })}
                                            step="0.01"
                                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <Text variant="caption" color="tertiary" className="mb-1 block">Notes (optional)</Text>
                                <input
                                    type="text"
                                    value={split.notes || ''}
                                    onChange={(e) => updateSplit(split.id, { notes: e.target.value })}
                                    placeholder="Add a note..."
                                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={addSplit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] hover:brightness-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Split
                </button>
                <button
                    onClick={distributeEvenly}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--text-secondary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)]"
                >
                    <DollarSign className="w-4 h-4" />
                    Split Evenly
                </button>
            </div>

            {/* Save */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(splits)}
                    disabled={!isBalanced}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white disabled:opacity-50 hover:brightness-110"
                >
                    Save Split
                </button>
            </div>
        </Surface>
    );
}

// ===== EMPTY STATE COMPONENT =====

interface EmptyStateProps {
    icon?: typeof Plus;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    variant?: 'default' | 'minimal';
    className?: string;
}

export function EmptyState({
    icon: Icon = Plus,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    variant = 'default',
    className,
}: EmptyStateProps) {
    if (variant === 'minimal') {
        return (
            <div className={cn('py-8 text-center', className)}>
                <Text variant="body-md" color="tertiary" className="mb-2">{title}</Text>
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="text-[var(--accent-primary)] hover:underline text-sm"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        );
    }

    return (
        <Surface elevation={1} className={cn('p-12 text-center', className)}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
                <Icon className="w-8 h-8 text-[var(--text-quaternary)]" />
            </div>
            <Text variant="heading-sm" className="mb-2">{title}</Text>
            <Text variant="body-sm" color="tertiary" className="mb-6 max-w-sm mx-auto">
                {description}
            </Text>
            <div className="flex items-center justify-center gap-3">
                {secondaryActionLabel && onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className="px-6 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                    >
                        {secondaryActionLabel}
                    </button>
                )}
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                    >
                        <Plus className="w-5 h-5" />
                        {actionLabel}
                    </button>
                )}
            </div>
        </Surface>
    );
}

export default SplitTransaction;
