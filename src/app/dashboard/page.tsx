'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Wallet,
    CreditCard,
    PiggyBank,
    BarChart3,
    ArrowRight,
    Lightbulb,
    Home,
    Coins,
    DollarSign,
    Receipt,
    Heart,
    Target,
    ChevronRight,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { MoneyFlowChart } from '@/components/dashboard/MoneyFlowChart';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';

// Net Worth Summary
const netWorthData = {
    total: 579670.27,
    monthChange: 12420,
    assets: 612010.77,
    liabilities: 32340.50,
};

// All asset categories
const assetCategories = [
    {
        name: 'Cash & Banking',
        balance: 57650.32,
        change: 2.1,
        icon: Wallet,
        items: ['Checking', 'Savings', 'Money Market'],
    },
    {
        name: 'Investments',
        balance: 127320.45,
        change: 5.2,
        icon: TrendingUp,
        items: ['Brokerage', '401k', 'Roth IRA'],
    },
    {
        name: 'Real Estate',
        balance: 425000.00,
        change: 0.8,
        icon: Home,
        items: ['Primary Residence'],
    },
    {
        name: 'Alternatives',
        balance: 18040.00,
        change: 2.4,
        icon: Coins,
        items: ['Gold', 'Silver'],
    },
];

// Income streams
const incomeStreams = [
    { name: 'Salary', amount: 8500, frequency: 'monthly', icon: DollarSign },
    { name: 'Rental Income', amount: 2400, frequency: 'monthly', icon: Home },
    { name: 'Dividends', amount: 340, frequency: 'monthly', icon: TrendingUp },
    { name: 'Side Projects', amount: 1250, frequency: 'variable', icon: Receipt },
];

// Financial Goals
const goals = [
    { name: 'Emergency Fund', current: 15000, target: 25000, color: 'emerald' },
    { name: 'House Down Payment', current: 42000, target: 100000, color: 'blue' },
    { name: 'Vacation Fund', current: 2800, target: 5000, color: 'purple' },
];

// Smart insights (value-driven, not AI-labeled)
const insights = [
    {
        title: 'Unused Subscription Found',
        message: 'You haven\'t used Spotify in 45 days. Cancel to save $11.99/month.',
        type: 'savings',
        action: 'Review',
        impact: '$144/year',
    },
    {
        title: 'Better Insurance Rate',
        message: 'Similar coverage available for $35 less per month.',
        type: 'savings',
        action: 'Compare',
        impact: '$420/year',
    },
    {
        title: 'Healthcare Reminder',
        message: 'You have $1,200 in FSA funds to use by year end.',
        type: 'reminder',
        action: 'Plan',
        impact: null,
    },
];

// Recent Activity
const recentActivity = [
    { id: 1, name: 'Salary Deposit', category: 'Income', amount: 4250.00, date: 'Today' },
    { id: 2, name: 'Rent Payment', category: 'Housing', amount: -2400.00, date: 'Jan 1' },
    { id: 3, name: 'Whole Foods', category: 'Groceries', amount: -156.43, date: 'Dec 31' },
    { id: 4, name: 'Rental Income', category: 'Income', amount: 2400.00, date: 'Dec 31' },
    { id: 5, name: 'Electric Bill', category: 'Utilities', amount: -124.00, date: 'Dec 30' },
];

export default function DashboardPage() {
    const totalMonthlyIncome = incomeStreams.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className="space-y-8">
            {/* Header - Net Worth Overview */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">Net Worth</p>
                    <h1 className="text-4xl font-bold font-mono mb-2">
                        ${netWorthData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h1>
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+${netWorthData.monthChange.toLocaleString()} this month</span>
                    </div>
                </div>
                <div className="text-right text-sm">
                    <div className="mb-2">
                        <span className="text-slate-500">Assets: </span>
                        <span className="font-mono text-emerald-400">${netWorthData.assets.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Liabilities: </span>
                        <span className="font-mono text-rose-400">-${netWorthData.liabilities.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Asset Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {assetCategories.map((cat, index) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="cursor-pointer group" hover>
                            <div className="flex items-start justify-between mb-3">
                                <cat.icon className="w-5 h-5 text-slate-500" />
                                <div className="flex items-center gap-1 text-xs text-emerald-400">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {cat.change}%
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{cat.name}</p>
                            <p className="text-xl font-bold font-mono">
                                ${cat.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-2">{cat.items.join(' • ')}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Money Flow */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold">Cash Flow</h2>
                                <p className="text-xs text-slate-500">Income vs Spending</p>
                            </div>
                            <select className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 outline-none">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                        <MoneyFlowChart />
                    </Card>
                </div>

                {/* Spending Breakdown */}
                <Card padding="lg" hover={false}>
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Spending</h2>
                        <p className="text-xs text-slate-500">By category</p>
                    </div>
                    <SpendingBreakdown />
                </Card>
            </div>

            {/* Goals and Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Financial Goals */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-slate-500" />
                            <h2 className="text-lg font-semibold">Goals</h2>
                        </div>
                        <button className="text-xs text-slate-500 hover:text-white transition-colors">
                            Add Goal
                        </button>
                    </div>
                    <div className="space-y-4">
                        {goals.map((goal) => {
                            const progress = (goal.current / goal.target) * 100;
                            return (
                                <div key={goal.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">{goal.name}</span>
                                        <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-${goal.color}-500`}
                                                style={{
                                                    width: `${progress}%`,
                                                    backgroundColor: goal.color === 'emerald' ? '#10b981' : goal.color === 'blue' ? '#3b82f6' : '#a855f7'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-slate-400">
                                            ${(goal.target - goal.current).toLocaleString()} left
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Smart Insights */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center gap-2 mb-5">
                        <Lightbulb className="w-4 h-4 text-slate-500" />
                        <h2 className="text-lg font-semibold">Opportunities</h2>
                    </div>
                    <div className="space-y-3">
                        {insights.map((insight) => (
                            <div
                                key={insight.title}
                                className={`p-3 rounded-xl border ${insight.type === 'savings'
                                    ? 'bg-emerald-500/5 border-emerald-500/10'
                                    : 'bg-amber-500/5 border-amber-500/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-medium">{insight.title}</p>
                                    {insight.impact && (
                                        <span className="text-xs text-emerald-400 font-medium">{insight.impact}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-2">{insight.message}</p>
                                <button className="text-xs text-slate-400 hover:text-white transition-colors">
                                    {insight.action} →
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Income Streams */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-500" />
                            <h2 className="text-lg font-semibold">Income</h2>
                        </div>
                        <span className="text-sm font-mono text-emerald-400">${totalMonthlyIncome.toLocaleString()}/mo</span>
                    </div>
                    <div className="space-y-3">
                        {incomeStreams.map((stream) => (
                            <div key={stream.name} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                        <stream.icon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm">{stream.name}</p>
                                        <p className="text-[10px] text-slate-600">{stream.frequency}</p>
                                    </div>
                                </div>
                                <span className="font-mono text-sm text-emerald-400">
                                    +${stream.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Healthcare Summary */}
            <Link href="/dashboard/healthcare">
                <Card padding="lg" className="cursor-pointer group" hover>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-rose-500/10">
                                <Heart className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Healthcare</h3>
                                <p className="text-sm text-slate-500">Track coverage, claims, and medical expenses</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-500">2025 Spending</p>
                                <p className="font-mono font-medium">$12,565</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">HSA Balance</p>
                                <p className="font-mono text-emerald-400">$4,250</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Recent Activity */}
            <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <button className="text-xs text-slate-500 hover:text-white transition-colors">
                        View All
                    </button>
                </div>
                <div className="grid lg:grid-cols-2 gap-x-8">
                    {recentActivity.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.amount >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-white/[0.04] text-slate-500'
                                    }`}>
                                    {tx.amount >= 0 ? '+' : tx.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm">{tx.name}</p>
                                    <p className="text-[10px] text-slate-600">{tx.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono text-sm ${tx.amount >= 0 ? 'text-emerald-400' : ''}`}>
                                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] text-slate-600">{tx.date}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
