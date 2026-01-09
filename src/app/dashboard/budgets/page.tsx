'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    Wallet,
    TrendingUp,
    TrendingDown,
    Edit3,
    MoreVertical,
    AlertTriangle,
    CheckCircle,
    Coffee,
    ShoppingBag,
    Home,
    Car,
    Utensils,
    Zap,
    Film,
    Heart,
    BarChart3,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import BudgetForecast from '@/components/budgets/BudgetForecast';

interface Budget {
    id: string;
    category: string;
    amount: number;
    spent: number;
    period: string;
    icon: string;
    color: string;
}

const categoryConfig: Record<string, { icon: typeof Wallet; color: string; bg: string }> = {
    'Groceries': { icon: ShoppingBag, color: 'text-green-400', bg: 'bg-green-500/10' },
    'Restaurants': { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    'Transportation': { icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'Housing': { icon: Home, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    'Utilities': { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    'Entertainment': { icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    'Shopping': { icon: ShoppingBag, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    'Healthcare': { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
    'Personal': { icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'Other': { icon: Wallet, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

const mockBudgets: Budget[] = [
    { id: '1', category: 'Groceries', amount: 600, spent: 520, period: 'monthly', icon: 'shopping-bag', color: 'green' },
    { id: '2', category: 'Restaurants', amount: 400, spent: 450, period: 'monthly', icon: 'utensils', color: 'orange' },
    { id: '3', category: 'Transportation', amount: 350, spent: 280, period: 'monthly', icon: 'car', color: 'blue' },
    { id: '4', category: 'Entertainment', amount: 200, spent: 145, period: 'monthly', icon: 'film', color: 'pink' },
    { id: '5', category: 'Shopping', amount: 300, spent: 180, period: 'monthly', icon: 'shopping-bag', color: 'cyan' },
    { id: '6', category: 'Utilities', amount: 250, spent: 225, period: 'monthly', icon: 'zap', color: 'yellow' },
];

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [showForecast, setShowForecast] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
    });

    useEffect(() => {
        async function fetchBudgets() {
            const supabase = createClient();
            const { data } = await supabase
                .from('budgets')
                .select('*')
                .eq('period', period)
                .order('category', { ascending: true });

            if (data) setBudgets(data);
            setLoading(false);
        }
        fetchBudgets();
    }, [period]);

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    const overBudgetCount = budgets.filter(b => b.spent > b.amount).length;
    const onTrackCount = budgets.filter(b => b.spent <= b.amount * 0.85).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Budgets</h1>
                    <p className="text-slate-500 text-sm mt-1">Track spending against your budget limits</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white/[0.02] border border-white/[0.06] rounded-lg p-1">
                        {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${period === p
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Add Budget
                    </Button>
                    <Button
                        variant={showForecast ? 'primary' : 'secondary'}
                        onClick={() => setShowForecast(!showForecast)}
                        className="gap-2"
                    >
                        <BarChart3 className="w-4 h-4" />
                        {showForecast ? 'Hide' : 'Show'} Forecast
                    </Button>
                </div>
            </div>

            {/* 6-Month Forecast */}
            {showForecast && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">6-Month Spending Forecast</h3>
                    <BudgetForecast
                        budgets={budgets.map(b => ({ category: b.category, budget: b.amount, spent: b.spent }))}
                        historicalSpending={[totalSpent * 0.9, totalSpent * 0.95, totalSpent * 1.02, totalSpent * 0.98, totalSpent * 1.05, totalSpent]}
                    />
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Budget</p>
                            <p className="text-xl font-semibold">${totalBudget.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <TrendingDown className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Spent</p>
                            <p className="text-xl font-semibold">${totalSpent.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${remaining >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <TrendingUp className={`w-5 h-5 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Remaining</p>
                            <p className={`text-xl font-semibold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${Math.abs(remaining).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            {overBudgetCount > 0 ? (
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <p className="text-sm font-medium">
                                {overBudgetCount > 0 ? (
                                    <span className="text-amber-400">{overBudgetCount} over budget</span>
                                ) : (
                                    <span className="text-emerald-400">All on track</span>
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Budget Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget, index) => {
                    const config = categoryConfig[budget.category] || categoryConfig['Other'];
                    const Icon = config.icon;
                    const progress = (budget.spent / budget.amount) * 100;
                    const isOverBudget = progress > 100;
                    const isWarning = progress >= 85 && progress <= 100;

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-5 border-l-4 ${isOverBudget ? 'border-l-red-500' :
                                isWarning ? 'border-l-amber-500' :
                                    'border-l-emerald-500'
                                }`}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${config.bg}`}>
                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                        </div>
                                        <h3 className="font-medium">{budget.category}</h3>
                                    </div>
                                    <button className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                                        <MoreVertical className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(progress, 100)}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' :
                                                isWarning ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className={`text-lg font-semibold font-mono ${isOverBudget ? 'text-red-400' :
                                            isWarning ? 'text-amber-400' :
                                                'text-white'
                                            }`}>
                                            ${budget.spent.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500">of ${budget.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${isOverBudget ? 'text-red-400' :
                                            isWarning ? 'text-amber-400' :
                                                'text-emerald-400'
                                            }`}>
                                            {isOverBudget ? '+' : ''}{(budget.amount - budget.spent).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {isOverBudget ? 'over budget' : 'remaining'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                    {isOverBudget ? (
                                        <span className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Over budget by ${(budget.spent - budget.amount).toLocaleString()}
                                        </span>
                                    ) : isWarning ? (
                                        <span className="text-xs text-amber-400">
                                            ⚠️ Approaching budget limit
                                        </span>
                                    ) : (
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            On track
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {/* Add Budget Card */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: budgets.length * 0.05 }}
                    onClick={() => setShowAddModal(true)}
                    className="p-5 rounded-2xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.01] transition-all flex flex-col items-center justify-center min-h-[200px]"
                >
                    <PlusCircle className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-sm text-slate-500">Add Budget Category</span>
                </motion.button>
            </div>

            {/* Add Budget Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <Card className="relative z-10 w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Add Budget Category</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                >
                                    <option value="">Select category</option>
                                    {Object.keys(categoryConfig).map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Monthly Budget</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="500"
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={() => setShowAddModal(false)} className="flex-1">
                                    Add Budget
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
