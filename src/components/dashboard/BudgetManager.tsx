'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Wallet,
    PieChart,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Check,
    Edit3,
    Trash2,
    Loader2,
    DollarSign
} from 'lucide-react';

interface Budget {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    period: 'weekly' | 'monthly' | 'yearly';
    color: string;
}

interface BudgetManagerProps {
    budgets: Budget[];
    onAdd: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Budget>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const categoryPresets = [
    { name: 'Housing', icon: '🏠', color: 'blue' },
    { name: 'Food & Dining', icon: '🍽️', color: 'amber' },
    { name: 'Transportation', icon: '🚗', color: 'purple' },
    { name: 'Entertainment', icon: '🎬', color: 'rose' },
    { name: 'Shopping', icon: '🛍️', color: 'cyan' },
    { name: 'Utilities', icon: '💡', color: 'yellow' },
    { name: 'Healthcare', icon: '🏥', color: 'red' },
    { name: 'Personal', icon: '✨', color: 'indigo' },
    { name: 'Custom', icon: '📝', color: 'slate' },
];

const colorMap: Record<string, { bg: string; progress: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', progress: 'bg-blue-500', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', progress: 'bg-amber-500', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/10', progress: 'bg-purple-500', text: 'text-purple-400' },
    rose: { bg: 'bg-rose-500/10', progress: 'bg-rose-500', text: 'text-rose-400' },
    cyan: { bg: 'bg-cyan-500/10', progress: 'bg-cyan-500', text: 'text-cyan-400' },
    yellow: { bg: 'bg-yellow-500/10', progress: 'bg-yellow-500', text: 'text-yellow-400' },
    red: { bg: 'bg-red-500/10', progress: 'bg-red-500', text: 'text-red-400' },
    indigo: { bg: 'bg-indigo-500/10', progress: 'bg-indigo-500', text: 'text-indigo-400' },
    slate: { bg: 'bg-slate-500/10', progress: 'bg-slate-500', text: 'text-slate-400' },
    emerald: { bg: 'bg-emerald-500/10', progress: 'bg-emerald-500', text: 'text-emerald-400' },
};

function BudgetCard({
    budget,
    onEdit,
    onDelete
}: {
    budget: Budget;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - budget.spent;
    const isOverBudget = budget.spent > budget.amount;
    const isNearLimit = percentUsed >= 80 && percentUsed < 100;

    const colors = colorMap[budget.color] || colorMap.slate;
    const preset = categoryPresets.find(p => p.name === budget.category);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 rounded-2xl border transition-colors ${isOverBudget
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                        <span className="text-lg">{preset?.icon || '📊'}</span>
                    </div>
                    <div>
                        <h3 className="font-medium">{budget.name}</h3>
                        <p className="text-xs text-slate-500 capitalize">{budget.period}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${isOverBudget
                                ? 'bg-red-500'
                                : isNearLimit
                                    ? 'bg-amber-500'
                                    : colors.progress
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-mono text-lg">${budget.spent.toLocaleString()}</span>
                    <span className="text-slate-500 text-sm"> / ${budget.amount.toLocaleString()}</span>
                </div>
                <div className={`text-sm font-medium flex items-center gap-1 ${isOverBudget
                        ? 'text-red-400'
                        : isNearLimit
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                    }`}>
                    {isOverBudget ? (
                        <>
                            <TrendingUp className="w-4 h-4" />
                            ${Math.abs(remaining).toLocaleString()} over
                        </>
                    ) : (
                        <>
                            <TrendingDown className="w-4 h-4" />
                            ${remaining.toLocaleString()} left
                        </>
                    )}
                </div>
            </div>

            {/* Warning/Alert */}
            {isOverBudget && (
                <motion.div
                    className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AlertTriangle className="w-4 h-4" />
                    You&apos;ve exceeded this budget
                </motion.div>
            )}
            {isNearLimit && !isOverBudget && (
                <motion.div
                    className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Approaching budget limit
                </motion.div>
            )}
        </motion.div>
    );
}

function AddBudgetModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
}) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [color, setColor] = useState('emerald');
    const [loading, setLoading] = useState(false);

    const handleCategorySelect = (preset: typeof categoryPresets[0]) => {
        setCategory(preset.name);
        setColor(preset.color);
        if (!name) {
            setName(preset.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        setLoading(true);
        await onAdd({
            name,
            category: category || 'Custom',
            amount: parseFloat(amount),
            period,
            color,
        });
        setLoading(false);
        onClose();

        // Reset
        setName('');
        setCategory('');
        setAmount('');
        setPeriod('monthly');
        setColor('emerald');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-md max-h-[84vh] overflow-y-auto rounded-2xl bg-[#0d0d12] border border-white/[0.08]"
                    >
                        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/[0.06] bg-[#0d0d12]">
                            <h2 className="text-lg font-semibold">Create Budget</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04]">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Category Presets */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categoryPresets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => handleCategorySelect(preset)}
                                            className={`p-3 rounded-xl border transition-all text-center ${category === preset.name
                                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                                                }`}
                                        >
                                            <span className="text-xl">{preset.icon}</span>
                                            <p className="text-xs mt-1 text-slate-400">{preset.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Budget Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Monthly Groceries"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Budget Amount *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Period</label>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value as typeof period)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name || !amount}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Create Budget
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Summary Card
function BudgetSummary({ budgets }: { budgets: Budget[] }) {
    const totals = useMemo(() => {
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
        const overBudget = budgets.filter(b => b.spent > b.amount).length;
        const onTrack = budgets.filter(b => b.spent <= b.amount * 0.8).length;

        return { totalBudget, totalSpent, overBudget, onTrack, total: budgets.length };
    }, [budgets]);

    if (budgets.length === 0) return null;

    const percentUsed = totals.totalBudget > 0 ? (totals.totalSpent / totals.totalBudget) * 100 : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Total Budget</p>
                <p className="text-xl font-mono font-medium">${totals.totalBudget.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Total Spent</p>
                <p className="text-xl font-mono font-medium">${totals.totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Overall Usage</p>
                <p className={`text-xl font-medium ${percentUsed > 100 ? 'text-red-400' : percentUsed > 80 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {Math.round(percentUsed)}%
                </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{totals.onTrack}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-red-400">{totals.overBudget}</span>
                    <span className="text-xs text-slate-500">on track / over</span>
                </div>
            </div>
        </div>
    );
}

// Main Component
export function BudgetManager({
    budgets,
    onAdd,
    onUpdate,
    onDelete
}: BudgetManagerProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Budgets</h2>
                    <p className="text-sm text-slate-500">Track your spending limits</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Budget
                </button>
            </div>

            {/* Summary */}
            <BudgetSummary budgets={budgets} />

            {/* Budget Cards */}
            {budgets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={() => { }}
                                onDelete={() => onDelete(budget.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No budgets set</h3>
                    <p className="text-sm text-slate-500 mb-4">Create budgets to track your spending limits</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm"
                    >
                        Create Budget
                    </button>
                </div>
            )}

            {/* Add Modal */}
            <AddBudgetModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={onAdd}
            />
        </div>
    );
}

export default BudgetManager;
