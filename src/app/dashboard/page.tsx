'use client';

import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Wallet,
    CreditCard,
    PiggyBank,
    BarChart3,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { MoneyFlowChart } from '@/components/dashboard/MoneyFlowChart';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';

// Mock data
const accounts = [
    { name: 'Checking', balance: 12450.32, change: 2.3, icon: Wallet, color: 'emerald' },
    { name: 'Savings', balance: 45200.00, change: 1.2, icon: PiggyBank, color: 'blue' },
    { name: 'Credit Card', balance: -2340.50, change: -8.5, icon: CreditCard, color: 'purple' },
    { name: 'Investments', balance: 78320.45, change: 5.2, icon: BarChart3, color: 'indigo' },
];

const recentTransactions = [
    { id: 1, name: 'Amazon', category: 'Shopping', amount: -89.99, date: 'Today' },
    { id: 2, name: 'Salary Deposit', category: 'Income', amount: 4500.00, date: 'Yesterday' },
    { id: 3, name: 'Netflix', category: 'Subscription', amount: -15.99, date: 'Dec 30' },
    { id: 4, name: 'Whole Foods', category: 'Groceries', amount: -156.43, date: 'Dec 30' },
    { id: 5, name: 'Electric Bill', category: 'Utilities', amount: -124.00, date: 'Dec 29' },
];

const insights = [
    {
        title: 'Subscription Savings',
        message: 'You could save $47/month by switching 2 subscriptions to annual billing.',
        type: 'tip',
    },
    {
        title: 'Spending Alert',
        message: 'Dining expenses are 23% higher than your 3-month average.',
        type: 'warning',
    },
];

export default function DashboardPage() {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Good evening, John</h1>
                    <p className="text-slate-400">Here&apos;s your financial overview</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Net Worth</p>
                    <p className="text-3xl font-bold font-mono">
                        ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-emerald-400 text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+$3,420 this month</span>
                    </div>
                </div>
            </div>

            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((account, index) => {
                    const colorClasses = {
                        emerald: 'bg-emerald-500/20 text-emerald-400',
                        blue: 'bg-blue-500/20 text-blue-400',
                        purple: 'bg-purple-500/20 text-purple-400',
                        indigo: 'bg-indigo-500/20 text-indigo-400',
                    };
                    return (
                        <motion.div
                            key={account.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card className="cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${colorClasses[account.color as keyof typeof colorClasses]}`}>
                                        <account.icon className="w-5 h-5" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${account.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {account.change >= 0 ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4" />
                                        )}
                                        <span>{Math.abs(account.change)}%</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-1">{account.name}</p>
                                <p className={`text-2xl font-bold font-mono ${account.balance < 0 ? 'text-red-400' : ''}`}>
                                    {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Money Flow Chart */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Money Flow</h2>
                                <p className="text-sm text-slate-400">See where your money goes</p>
                            </div>
                            <select className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 outline-none focus:border-indigo-500/50">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>
                        <MoneyFlowChart />
                    </Card>
                </div>

                {/* Spending Breakdown */}
                <div>
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Spending</h2>
                                <p className="text-sm text-slate-400">By category</p>
                            </div>
                        </div>
                        <SpendingBreakdown />
                    </Card>
                </div>
            </div>

            {/* Insights and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Insights */}
                <div>
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xl font-semibold">AI Insights</h2>
                        </div>
                        <div className="space-y-4">
                            {insights.map((insight, index) => (
                                <motion.div
                                    key={insight.title}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`p-4 rounded-xl border ${insight.type === 'tip'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-amber-500/10 border-amber-500/20'
                                        }`}
                                >
                                    <p className="text-sm font-medium mb-1">{insight.title}</p>
                                    <p className="text-sm text-slate-400">{insight.message}</p>
                                </motion.div>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                View All Insights
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Recent Transactions</h2>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium">
                                            {tx.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tx.name}</p>
                                            <p className="text-sm text-slate-500">{tx.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-medium ${tx.amount >= 0 ? 'text-emerald-400' : ''}`}>
                                            {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-sm text-slate-500">{tx.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
