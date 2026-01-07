'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    TrendingUp,
    Sparkles,
    Home,
    Car,
    Utensils,
    ShoppingBag,
    Zap,
    Wifi,
    Heart,
    Film,
    Plane,
    GraduationCap,
    DollarSign,
    ChevronRight,
    Settings,
    Plus,
    Check,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

// Budget methodologies
const methodologies = [
    { id: '50-30-20', name: '50/30/20 Rule', description: 'Needs 50%, Wants 30%, Savings 20%' },
    { id: 'zero-based', name: 'Zero-Based', description: 'Every dollar has a job' },
    { id: 'envelope', name: 'Envelope System', description: 'Digital envelopes for each category' },
];

// Budget categories
const budgetCategories = [
    { id: 'housing', name: 'Housing', icon: Home, budget: 2800, spent: 2400, color: 'blue' },
    { id: 'transportation', name: 'Transportation', icon: Car, budget: 600, spent: 512, color: 'purple' },
    { id: 'food', name: 'Food & Dining', icon: Utensils, budget: 800, spent: 687, color: 'amber' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, budget: 400, spent: 523, color: 'red' },
    { id: 'utilities', name: 'Utilities', icon: Zap, budget: 300, spent: 248, color: 'emerald' },
    { id: 'internet', name: 'Internet & Phone', icon: Wifi, budget: 200, spent: 189, color: 'indigo' },
    { id: 'health', name: 'Health & Fitness', icon: Heart, budget: 250, spent: 175, color: 'pink' },
    { id: 'entertainment', name: 'Entertainment', icon: Film, budget: 200, spent: 156, color: 'violet' },
    { id: 'travel', name: 'Travel', icon: Plane, budget: 300, spent: 0, color: 'cyan' },
    { id: 'education', name: 'Education', icon: GraduationCap, budget: 150, spent: 99, color: 'orange' },
];

const aiInsights = [
    {
        type: 'warning',
        title: 'Shopping Over Budget',
        message: 'You\'ve exceeded your shopping budget by $123. Consider reducing dining out to compensate.',
        action: 'Adjust Budget'
    },
    {
        type: 'success',
        title: 'Great Savings on Utilities',
        message: 'You\'re 17% under budget on utilities. Nice work being energy efficient!',
        action: null
    },
    {
        type: 'tip',
        title: 'AI Recommendation',
        message: 'Based on your spending, suggest increasing Food budget to $850 and reducing Entertainment to $150.',
        action: 'Apply Changes'
    },
];

export default function BudgetsPage() {
    const [selectedMethod, setSelectedMethod] = useState('50-30-20');

    const totalBudget = budgetCategories.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percentSpent = (totalSpent / totalBudget) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Budgets</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your spending with smart budgets</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Configure
                    </Button>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* Budget Method Selector */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Budget Method</span>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                    {methodologies.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${selectedMethod === method.id
                                    ? 'border-emerald-500/50 bg-emerald-500/[0.05]'
                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium ${selectedMethod === method.id ? 'text-emerald-400' : ''}`}>
                                    {method.name}
                                </span>
                                {selectedMethod === method.id && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                )}
                            </div>
                            <p className="text-xs text-slate-500">{method.description}</p>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Overview */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-5">
                    <p className="text-slate-500 text-sm">Total Budget</p>
                    <p className="text-2xl font-semibold mt-1">${totalBudget.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Monthly allocation</p>
                </Card>
                <Card className="p-5">
                    <p className="text-slate-500 text-sm">Spent So Far</p>
                    <p className="text-2xl font-semibold mt-1">${totalSpent.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${percentSpent > 100 ? 'bg-red-500' : percentSpent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-400">{percentSpent.toFixed(0)}%</span>
                    </div>
                </Card>
                <Card className="p-5">
                    <p className="text-slate-500 text-sm">Remaining</p>
                    <p className={`text-2xl font-semibold mt-1 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{remaining >= 0 ? 'Left to spend' : 'Over budget'}</p>
                </Card>
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-medium text-slate-300">AI Budget Insights</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {aiInsights.map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`p-4 ${insight.type === 'warning' ? 'border-amber-500/20 bg-amber-500/[0.02]' :
                                    insight.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/[0.02]' :
                                        'border-blue-500/20 bg-blue-500/[0.02]'
                                }`}>
                                <h3 className="font-medium text-sm">{insight.title}</h3>
                                <p className="text-slate-500 text-xs mt-1">{insight.message}</p>
                                {insight.action && (
                                    <button className={`mt-3 text-xs font-medium flex items-center gap-1 ${insight.type === 'warning' ? 'text-amber-400' :
                                            insight.type === 'tip' ? 'text-blue-400' : 'text-emerald-400'
                                        }`}>
                                        {insight.action} <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Budget Categories */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-300">Categories</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {budgetCategories.map((category, i) => {
                        const Icon = category.icon;
                        const percent = (category.spent / category.budget) * 100;
                        const isOver = percent > 100;

                        const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-500',
                            purple: 'bg-purple-500',
                            amber: 'bg-amber-500',
                            red: 'bg-red-500',
                            emerald: 'bg-emerald-500',
                            indigo: 'bg-indigo-500',
                            pink: 'bg-pink-500',
                            violet: 'bg-violet-500',
                            cyan: 'bg-cyan-500',
                            orange: 'bg-orange-500',
                        };

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <Card className="p-4 hover:border-white/[0.08] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-white/[0.04]">
                                            <Icon className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm">{category.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${isOver ? 'text-red-400' : ''}`}>
                                                ${category.spent}
                                            </p>
                                            <p className="text-xs text-slate-500">of ${category.budget}</p>
                                        </div>
                                    </div>

                                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(percent, 100)}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }}
                                            className={`h-full rounded-full ${isOver ? 'bg-red-500' : colorClasses[category.color] || 'bg-emerald-500'}`}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs">
                                        <span className={isOver ? 'text-red-400' : 'text-slate-500'}>
                                            {isOver ? `$${category.spent - category.budget} over` : `$${category.budget - category.spent} left`}
                                        </span>
                                        <span className="text-slate-500">{percent.toFixed(0)}%</span>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 50/30/20 Breakdown (if selected) */}
            {selectedMethod === '50-30-20' && (
                <Card className="p-5">
                    <h3 className="font-medium mb-4">50/30/20 Breakdown</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Needs (50%)</span>
                                <span className="text-sm font-medium">$3,800 / $4,000</span>
                            </div>
                            <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '95%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Wants (30%)</span>
                                <span className="text-sm font-medium">$1,900 / $2,400</span>
                            </div>
                            <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '79%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Savings (20%)</span>
                                <span className="text-sm font-medium">$1,200 / $1,600</span>
                            </div>
                            <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
