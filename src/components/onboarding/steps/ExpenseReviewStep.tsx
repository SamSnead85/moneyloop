'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Edit3, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import type { DetectedExpense } from '../OnboardingWizard';

interface ExpenseReviewStepProps {
    expenses: DetectedExpense[];
    onConfirm: (expenses: DetectedExpense[]) => void;
}

const categoryColors: Record<string, string> = {
    Entertainment: '#e879f9',
    Utilities: '#60a5fa',
    Health: '#34d399',
    Productivity: '#fbbf24',
    Insurance: '#f472b6',
    Other: '#94a3b8',
};

export function ExpenseReviewStep({ expenses: initialExpenses, onConfirm }: ExpenseReviewStepProps) {
    const [expenses, setExpenses] = useState<DetectedExpense[]>(
        initialExpenses.map(e => ({ ...e, confirmed: true }))
    );
    const [editingId, setEditingId] = useState<string | null>(null);

    const confirmedExpenses = expenses.filter(e => e.confirmed);
    const monthlyTotal = confirmedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const toggleConfirm = (id: string) => {
        setExpenses(prev =>
            prev.map(e => e.id === id ? { ...e, confirmed: !e.confirmed } : e)
        );
    };

    const updateAmount = (id: string, amount: number) => {
        setExpenses(prev =>
            prev.map(e => e.id === id ? { ...e, amount } : e)
        );
        setEditingId(null);
    };

    const handleContinue = () => {
        onConfirm(confirmedExpenses);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    Review Your Expenses
                </h1>
                <p className="text-slate-400">
                    We detected these recurring expenses. Confirm or dismiss each one.
                </p>
            </motion.div>

            {/* Summary Card */}
            <motion.div
                className="bg-gradient-to-br from-[#7dd3a8]/10 to-[#c9b896]/10 rounded-2xl border border-white/10 p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">Monthly Total</p>
                        <p className="text-3xl font-bold font-mono">${monthlyTotal.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Confirmed</p>
                        <p className="text-xl font-semibold">
                            {confirmedExpenses.length} of {expenses.length}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Expenses List */}
            <div className="space-y-3 mb-8">
                {expenses.map((expense, index) => (
                    <motion.div
                        key={expense.id}
                        className={`
                            flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                            ${expense.confirmed
                                ? 'bg-white/[0.02] border-white/10'
                                : 'bg-white/[0.01] border-white/5 opacity-50'}
                        `}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                    >
                        {/* Confirm/Dismiss Toggle */}
                        <button
                            onClick={() => toggleConfirm(expense.id)}
                            className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                ${expense.confirmed
                                    ? 'bg-[#7dd3a8] text-[#0a0a0f]'
                                    : 'bg-white/5 text-slate-500 hover:bg-white/10'}
                            `}
                        >
                            {expense.confirmed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>

                        {/* Expense Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{expense.name}</p>
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs"
                                    style={{
                                        backgroundColor: `${categoryColors[expense.category] || categoryColors.Other}20`,
                                        color: categoryColors[expense.category] || categoryColors.Other,
                                    }}
                                >
                                    {expense.category}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 capitalize">{expense.frequency}</p>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-2">
                            {editingId === expense.id ? (
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        defaultValue={expense.amount}
                                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right font-mono"
                                        autoFocus
                                        onBlur={(e) => updateAmount(expense.id, parseFloat(e.target.value) || expense.amount)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateAmount(expense.id, parseFloat(e.currentTarget.value) || expense.amount);
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="font-mono font-medium">
                                        ${expense.amount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => setEditingId(expense.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    onClick={handleContinue}
                    className="bg-[#7dd3a8] hover:bg-[#6bc497] text-[#0a0a0f] px-8 py-3"
                    icon={<ArrowRight className="w-5 h-5" />}
                >
                    Continue with {confirmedExpenses.length} expenses
                </Button>
            </motion.div>
        </div>
    );
}

export default ExpenseReviewStep;
