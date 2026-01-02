'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowUpRight,
    TrendingUp,
    Wallet,
    Lightbulb,
    Home,
    Coins,
    DollarSign,
    Receipt,
    Heart,
    Target,
    ChevronRight,
    X,
    ExternalLink,
    Building2,
    Briefcase,
    CreditCard,
    PiggyBank,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { MoneyFlowChart } from '@/components/dashboard/MoneyFlowChart';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { NetWorthChart } from '@/components/dashboard/NetWorthChart';

// Asset categories with detailed accounts
const assetCategories = [
    {
        id: 'cash',
        name: 'Cash & Banking',
        balance: 57650.32,
        change: 2.1,
        icon: Wallet,
        items: ['Checking', 'Savings', 'Money Market'],
        accounts: [
            { name: 'Chase Checking', balance: 12450.32, type: 'checking', lastUpdated: '2 min ago' },
            { name: 'Chase Savings', balance: 25200.00, type: 'savings', apy: '4.5%' },
            { name: 'Marcus Savings', balance: 15000.00, type: 'savings', apy: '5.1%' },
            { name: 'Fidelity Money Market', balance: 5000.00, type: 'money-market', apy: '4.9%' },
        ],
    },
    {
        id: 'investments',
        name: 'Investments',
        balance: 127320.45,
        change: 5.2,
        icon: TrendingUp,
        items: ['Brokerage', '401k', 'Roth IRA'],
        href: '/dashboard/investments',
        accounts: [
            { name: 'Fidelity Brokerage', balance: 45320.45, type: 'brokerage', dayChange: '+$523.40' },
            { name: 'Company 401(k)', balance: 67000.00, type: '401k', employer: 'Acme Corp' },
            { name: 'Roth IRA', balance: 15000.00, type: 'roth-ira', contribution: '$2,500 left' },
        ],
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        balance: 425000.00,
        change: 0.8,
        icon: Home,
        items: ['Primary Residence'],
        accounts: [
            { name: '123 Main Street', balance: 425000.00, type: 'property', equity: '$185,000', mortgage: '$240,000' },
        ],
    },
    {
        id: 'alternatives',
        name: 'Alternatives',
        balance: 18040.00,
        change: 2.4,
        icon: Coins,
        items: ['Gold', 'Silver'],
        accounts: [
            { name: 'Gold (5 oz)', balance: 10500.00, type: 'gold', price: '$2,100/oz', change: '+1.2%' },
            { name: 'Silver (250 oz)', balance: 7540.00, type: 'silver', price: '$30.16/oz', change: '+3.8%' },
        ],
    },
];

// Income streams with details
const incomeStreams = [
    { id: 'salary', name: 'Salary', amount: 8500, frequency: 'monthly', icon: Briefcase, source: 'Acme Corporation', nextDate: 'Jan 15' },
    { id: 'rental', name: 'Rental Income', amount: 2400, frequency: 'monthly', icon: Home, source: '123 Main St - Unit B', nextDate: 'Jan 1' },
    { id: 'dividends', name: 'Dividends', amount: 340, frequency: 'monthly', icon: TrendingUp, source: 'Fidelity Brokerage', nextDate: 'Quarterly' },
    { id: 'side', name: 'Side Projects', amount: 1250, frequency: 'variable', icon: Receipt, source: 'Stripe', nextDate: 'Variable' },
];

// Financial Goals
const goals = [
    { id: 'emergency', name: 'Emergency Fund', current: 15000, target: 25000, color: 'emerald', deadline: 'Jun 2026' },
    { id: 'house', name: 'House Down Payment', current: 42000, target: 100000, color: 'blue', deadline: 'Dec 2027' },
    { id: 'vacation', name: 'Vacation Fund', current: 2800, target: 5000, color: 'purple', deadline: 'Aug 2026' },
];

// Insights
const insights = [
    { title: 'Unused Subscription', message: 'Spotify unused 45 days. Save $11.99/month.', type: 'savings', impact: '$144/year' },
    { title: 'Better Insurance Rate', message: 'Similar coverage $35 less per month.', type: 'savings', impact: '$420/year' },
    { title: 'FSA Reminder', message: '$1,200 in FSA funds to use by year end.', type: 'reminder', impact: null },
];

// Recent Activity
const recentActivity = [
    { id: 1, name: 'Salary Deposit', category: 'Income', amount: 4250.00, date: 'Today', account: 'Chase Checking' },
    { id: 2, name: 'Rent Payment', category: 'Housing', amount: -2400.00, date: 'Jan 1', account: 'Chase Checking' },
    { id: 3, name: 'Whole Foods', category: 'Groceries', amount: -156.43, date: 'Dec 31', account: 'Chase Credit' },
    { id: 4, name: 'Rental Income', category: 'Income', amount: 2400.00, date: 'Dec 31', account: 'Chase Checking' },
    { id: 5, name: 'Electric Bill', category: 'Utilities', amount: -124.00, date: 'Dec 30', account: 'Auto Pay' },
];

// Detail Modal Component
function DetailModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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
                        className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-xl max-h-[84vh] overflow-y-auto rounded-2xl bg-[#0d0d12] border border-white/[0.06]"
                    >
                        <div className="sticky top-0 flex items-center justify-between p-5 pb-4 border-b border-white/[0.06] bg-[#0d0d12]">
                            <h2 className="text-lg font-semibold">{title}</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04]">
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                        <div className="p-5">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function DashboardPage() {
    const [selectedCategory, setSelectedCategory] = useState<typeof assetCategories[0] | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
    const [selectedIncome, setSelectedIncome] = useState<typeof incomeStreams[0] | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<typeof recentActivity[0] | null>(null);

    const totalMonthlyIncome = incomeStreams.reduce((sum, s) => sum + s.amount, 0);

    const handleCategoryClick = (cat: typeof assetCategories[0]) => {
        if (cat.href) {
            window.location.href = cat.href;
        } else {
            setSelectedCategory(cat);
        }
    };

    return (
        <>
            <div className="space-y-8">
                {/* Net Worth Chart */}
                <Card padding="lg" hover={false}>
                    <NetWorthChart />
                </Card>

                {/* Asset Overview Cards - Clickable */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {assetCategories.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            <Card className="cursor-pointer group" hover>
                                <div className="flex items-start justify-between mb-3">
                                    <cat.icon className="w-5 h-5 text-slate-500 group-hover:text-white/60 transition-colors" />
                                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {cat.change}%
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">{cat.name}</p>
                                <p className="text-xl font-bold font-mono">
                                    ${cat.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[10px] text-slate-600">{cat.items.join(' • ')}</p>
                                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-white/40 transition-colors" />
                                </div>
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

                {/* Goals, Insights, Income - All Clickable */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Financial Goals */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-slate-500" />
                                <h2 className="text-lg font-semibold">Goals</h2>
                            </div>
                            <button className="text-xs text-slate-500 hover:text-white transition-colors">+ Add</button>
                        </div>
                        <div className="space-y-3">
                            {goals.map((goal) => {
                                const progress = (goal.current / goal.target) * 100;
                                return (
                                    <div
                                        key={goal.name}
                                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
                                        onClick={() => setSelectedGoal(goal)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{goal.name}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${progress}%`,
                                                        backgroundColor: goal.color === 'emerald' ? '#10b981' : goal.color === 'blue' ? '#3b82f6' : '#a855f7'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Insights */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-2 mb-5">
                            <Lightbulb className="w-4 h-4 text-slate-500" />
                            <h2 className="text-lg font-semibold">Opportunities</h2>
                        </div>
                        <div className="space-y-3">
                            {insights.map((insight) => (
                                <div
                                    key={insight.title}
                                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${insight.type === 'savings'
                                            ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
                                            : 'bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-medium">{insight.title}</p>
                                        {insight.impact && (
                                            <span className="text-xs text-emerald-400 font-medium">{insight.impact}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{insight.message}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Income Streams - Clickable */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-500" />
                                <h2 className="text-lg font-semibold">Income</h2>
                            </div>
                            <span className="text-sm font-mono text-emerald-400">${totalMonthlyIncome.toLocaleString()}/mo</span>
                        </div>
                        <div className="space-y-2">
                            {incomeStreams.map((stream) => (
                                <div
                                    key={stream.name}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors"
                                    onClick={() => setSelectedIncome(stream)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                            <stream.icon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm">{stream.name}</p>
                                            <p className="text-[10px] text-slate-600">{stream.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-emerald-400">
                                            +${stream.amount.toLocaleString()}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                    </div>
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

                {/* Recent Activity - Clickable */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        <button className="text-xs text-slate-500 hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-x-8">
                        {recentActivity.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.01] px-2 -mx-2 rounded-lg transition-colors"
                                onClick={() => setSelectedTransaction(tx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.amount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-slate-500'
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

            {/* Asset Category Detail Modal */}
            <DetailModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                title={selectedCategory?.name || ''}
            >
                {selectedCategory && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                            <span className="text-white/60">Total Balance</span>
                            <span className="text-2xl font-bold font-mono">${selectedCategory.balance.toLocaleString()}</span>
                        </div>
                        <div className="space-y-3">
                            {selectedCategory.accounts.map((account, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{account.name}</span>
                                        <span className="font-mono text-lg">${account.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-white/40">
                                        {Object.entries(account).filter(([key]) => !['name', 'balance', 'type'].includes(key)).map(([key, value]) => (
                                            <span key={key}>{key}: {value}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Goal Detail Modal */}
            <DetailModal
                isOpen={!!selectedGoal}
                onClose={() => setSelectedGoal(null)}
                title={selectedGoal?.name || ''}
            >
                {selectedGoal && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold font-mono mb-2">${selectedGoal.current.toLocaleString()}</p>
                            <p className="text-white/40">of ${selectedGoal.target.toLocaleString()} goal</p>
                        </div>
                        <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${(selectedGoal.current / selectedGoal.target) * 100}%`,
                                    backgroundColor: selectedGoal.color === 'emerald' ? '#10b981' : selectedGoal.color === 'blue' ? '#3b82f6' : '#a855f7'
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Remaining</p>
                                <p className="font-mono font-medium">${(selectedGoal.target - selectedGoal.current).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Target Date</p>
                                <p className="font-medium">{selectedGoal.deadline}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Income Detail Modal */}
            <DetailModal
                isOpen={!!selectedIncome}
                onClose={() => setSelectedIncome(null)}
                title={selectedIncome?.name || ''}
            >
                {selectedIncome && (
                    <div className="space-y-4">
                        <div className="text-center p-6 rounded-xl bg-emerald-500/10">
                            <p className="text-3xl font-bold font-mono text-emerald-400">+${selectedIncome.amount.toLocaleString()}</p>
                            <p className="text-white/40">{selectedIncome.frequency}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Source</p>
                                <p className="font-medium">{selectedIncome.source}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Next Payment</p>
                                <p className="font-medium">{selectedIncome.nextDate}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Transaction Detail Modal */}
            <DetailModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                title="Transaction Details"
            >
                {selectedTransaction && (
                    <div className="space-y-4">
                        <div className={`text-center p-6 rounded-xl ${selectedTransaction.amount >= 0 ? 'bg-emerald-500/10' : 'bg-white/[0.02]'}`}>
                            <p className={`text-3xl font-bold font-mono ${selectedTransaction.amount >= 0 ? 'text-emerald-400' : ''}`}>
                                {selectedTransaction.amount >= 0 ? '+' : '-'}${Math.abs(selectedTransaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-white/40">{selectedTransaction.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Category</p>
                                <p className="font-medium">{selectedTransaction.category}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02]">
                                <p className="text-xs text-white/40 mb-1">Date</p>
                                <p className="font-medium">{selectedTransaction.date}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] col-span-2">
                                <p className="text-xs text-white/40 mb-1">Account</p>
                                <p className="font-medium">{selectedTransaction.account}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>
        </>
    );
}
