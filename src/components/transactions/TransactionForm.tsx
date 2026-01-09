'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Tag,
    Repeat,
    X,
    Check,
} from 'lucide-react';
import { Surface, Text, Badge } from '@/components/primitives';
import { cn } from '@/lib/utils';
import type { Transaction } from './TransactionList';

interface TransactionFormProps {
    onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
    onCancel?: () => void;
    initialData?: Partial<Transaction>;
    categories?: string[];
    accounts?: Array<{ id: string; name: string }>;
    mode?: 'create' | 'edit';
}

export function TransactionForm({
    onSubmit,
    onCancel,
    initialData,
    categories = ['Food & Dining', 'Transportation', 'Shopping', 'Utilities', 'Entertainment', 'Healthcare', 'Other'],
    accounts = [],
    mode = 'create',
}: TransactionFormProps) {
    // Handle 'transfer' type by defaulting to 'expense' for the form
    const initialType = initialData?.type === 'income' ? 'income' : 'expense';
    const [type, setType] = useState<'expense' | 'income'>(initialType);
    const [merchant, setMerchant] = useState(initialData?.merchant || '');
    const [amount, setAmount] = useState(initialData?.amount ? Math.abs(initialData.amount).toString() : '');
    const [category, setCategory] = useState(initialData?.category || categories[0] || '');
    const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [isRecurring, setIsRecurring] = useState(initialData?.recurring || false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!merchant.trim()) newErrors.merchant = 'Description is required';
        if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
        if (!category) newErrors.category = 'Category is required';
        if (!date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const account = accounts.find(a => a.id === accountId);

        onSubmit({
            type,
            merchant: merchant.trim(),
            amount: parseFloat(amount) * (type === 'expense' ? -1 : 1),
            category,
            categoryIcon: undefined,
            account: account?.name || '',
            accountId,
            date,
            notes: notes.trim() || undefined,
            tags: [],
            recurring: isRecurring,
            pending: false,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Toggle */}
            <div>
                <Text variant="body-sm" color="tertiary" className="mb-3 block">Transaction Type</Text>
                <div className="flex rounded-xl bg-[var(--surface-elevated)] p-1">
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                            type === 'expense'
                                ? 'bg-[var(--surface-base)] text-[var(--text-primary)] shadow-sm'
                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        )}
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                            type === 'income'
                                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        )}
                    >
                        <ArrowDownLeft className="w-4 h-4" />
                        Income
                    </button>
                </div>
            </div>

            {/* Amount */}
            <div>
                <Text variant="body-sm" color="tertiary" className="mb-2 block">Amount</Text>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--text-tertiary)]">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={cn(
                            'w-full pl-10 pr-4 py-4 rounded-xl bg-[var(--surface-base)] border text-2xl font-mono focus:ring-1 outline-none transition-colors',
                            errors.amount
                                ? 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]'
                        )}
                    />
                </div>
                {errors.amount && (
                    <Text variant="body-sm" color="danger" className="mt-1">{errors.amount}</Text>
                )}
            </div>

            {/* Description */}
            <div>
                <Text variant="body-sm" color="tertiary" className="mb-2 block">Description</Text>
                <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g., Starbucks, Paycheck, Amazon"
                    className={cn(
                        'w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border focus:ring-1 outline-none transition-colors',
                        errors.merchant
                            ? 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]'
                    )}
                />
                {errors.merchant && (
                    <Text variant="body-sm" color="danger" className="mt-1">{errors.merchant}</Text>
                )}
            </div>

            {/* Category & Date Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Category</Text>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={cn(
                            'w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border focus:ring-1 outline-none transition-colors appearance-none',
                            errors.category
                                ? 'border-[var(--accent-danger)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-primary)]'
                        )}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div>
                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Date</Text>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Account */}
            {accounts.length > 0 && (
                <div>
                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Account</Text>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-colors appearance-none"
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Notes */}
            <div>
                <Text variant="body-sm" color="tertiary" className="mb-2 block">Notes (optional)</Text>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-colors resize-none"
                />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)]">
                <div className="flex items-center gap-3">
                    <Repeat className="w-5 h-5 text-[var(--text-tertiary)]" />
                    <div>
                        <Text variant="body-md">Recurring transaction</Text>
                        <Text variant="body-sm" color="tertiary">Mark as a regular expense</Text>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={cn(
                        'w-12 h-7 rounded-full transition-colors relative',
                        isRecurring ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-elevated-2)]'
                    )}
                >
                    <motion.div
                        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: isRecurring ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:brightness-110 transition-all"
                >
                    {mode === 'create' ? (
                        <>
                            <Plus className="w-5 h-5" />
                            Add Transaction
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default TransactionForm;
