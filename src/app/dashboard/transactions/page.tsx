'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    Tag,
    ArrowUpRight,
    ArrowDownLeft,
    MoreVertical,
    ChevronDown,
    Download,
    RefreshCw,
    Building2,
    Coffee,
    ShoppingBag,
    Utensils,
    Car,
    Home,
    Zap,
    CreditCard,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

// Transaction data
const transactions = [
    { id: 1, name: 'Salary Deposit', category: 'Income', amount: 4250.00, date: 'Jan 3, 2026', time: '9:00 AM', account: 'Chase Checking', merchant: 'Acme Corporation', type: 'credit', icon: Building2, pending: false },
    { id: 2, name: 'Starbucks', category: 'Food & Dining', amount: -6.45, date: 'Jan 3, 2026', time: '7:32 AM', account: 'Chase Sapphire', merchant: 'Starbucks', type: 'debit', icon: Coffee, pending: false },
    { id: 3, name: 'Amazon Prime', category: 'Shopping', amount: -14.99, date: 'Jan 2, 2026', time: '12:00 AM', account: 'Chase Sapphire', merchant: 'Amazon', type: 'debit', icon: ShoppingBag, pending: false },
    { id: 4, name: 'Chipotle', category: 'Food & Dining', amount: -12.85, date: 'Jan 2, 2026', time: '1:15 PM', account: 'Amex Gold', merchant: 'Chipotle', type: 'debit', icon: Utensils, pending: false },
    { id: 5, name: 'Gas Station', category: 'Transportation', amount: -45.20, date: 'Jan 2, 2026', time: '6:45 PM', account: 'Chase Freedom', merchant: 'Shell', type: 'debit', icon: Car, pending: false },
    { id: 6, name: 'Mortgage Payment', category: 'Housing', amount: -2400.00, date: 'Jan 1, 2026', time: '12:00 AM', account: 'Chase Checking', merchant: 'Wells Fargo Mortgage', type: 'debit', icon: Home, pending: false },
    { id: 7, name: 'Electric Bill', category: 'Utilities', amount: -124.00, date: 'Jan 1, 2026', time: '12:00 AM', account: 'Chase Checking', merchant: 'Duke Energy', type: 'debit', icon: Zap, pending: false },
    { id: 8, name: 'Rental Income', category: 'Income', amount: 2400.00, date: 'Dec 31, 2025', time: '10:00 AM', account: 'Chase Checking', merchant: 'Tenant - Unit 2B', type: 'credit', icon: Home, pending: false },
    { id: 9, name: 'Pending - Target', category: 'Shopping', amount: -87.54, date: 'Jan 3, 2026', time: '3:22 PM', account: 'Chase Sapphire', merchant: 'Target', type: 'debit', icon: ShoppingBag, pending: true },
    { id: 10, name: 'Dividend - VTI', category: 'Income', amount: 156.32, date: 'Dec 31, 2025', time: '4:00 PM', account: 'Fidelity Brokerage', merchant: 'Vanguard', type: 'credit', icon: Building2, pending: false },
];

const categories = ['All Categories', 'Income', 'Food & Dining', 'Shopping', 'Transportation', 'Housing', 'Utilities'];
const accounts = ['All Accounts', 'Chase Checking', 'Chase Sapphire', 'Amex Gold', 'Chase Freedom', 'Fidelity Brokerage'];
const dateRanges = ['Last 7 days', 'Last 30 days', 'This month', 'Last month', 'Last 3 months', 'Custom'];

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedAccount, setSelectedAccount] = useState('All Accounts');
    const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
    const [showFilters, setShowFilters] = useState(false);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || t.category === selectedCategory;
        const matchesAccount = selectedAccount === 'All Accounts' || t.account === selectedAccount;
        return matchesSearch && matchesCategory && matchesAccount;
    });

    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Transactions</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage all your transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Sync
                    </Button>
                    <Button variant="secondary" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-slate-500 text-xs">Total Income</p>
                    <p className="text-xl font-semibold text-emerald-400 mt-1">+${totalIncome.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-500 text-xs">Total Expenses</p>
                    <p className="text-xl font-semibold text-red-400 mt-1">-${totalExpenses.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-500 text-xs">Net Cash Flow</p>
                    <p className={`text-xl font-semibold mt-1 ${totalIncome - totalExpenses > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {totalIncome - totalExpenses > 0 ? '+' : '-'}${Math.abs(totalIncome - totalExpenses).toLocaleString()}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-500 text-xs">Transactions</p>
                    <p className="text-xl font-semibold mt-1">{transactions.length}</p>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-[#0a0a0f]">{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                                {accounts.map(acc => (
                                    <option key={acc} value={acc} className="bg-[#0a0a0f]">{acc}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-lg border transition-colors ${showFilters ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'}`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-white/[0.04] grid md:grid-cols-4 gap-4"
                    >
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">Date Range</label>
                            <select className="w-full appearance-none px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm">
                                {dateRanges.map(range => (
                                    <option key={range} value={range} className="bg-[#0a0a0f]">{range}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">Amount Range</label>
                            <div className="flex items-center gap-2">
                                <input type="text" placeholder="Min" className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm" />
                                <span className="text-slate-500">-</span>
                                <input type="text" placeholder="Max" className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">Transaction Type</label>
                            <select className="w-full appearance-none px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm">
                                <option className="bg-[#0a0a0f]">All Types</option>
                                <option className="bg-[#0a0a0f]">Income</option>
                                <option className="bg-[#0a0a0f]">Expenses</option>
                                <option className="bg-[#0a0a0f]">Transfers</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">Status</label>
                            <select className="w-full appearance-none px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm">
                                <option className="bg-[#0a0a0f]">All</option>
                                <option className="bg-[#0a0a0f]">Posted</option>
                                <option className="bg-[#0a0a0f]">Pending</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </Card>

            {/* Transactions List */}
            <Card className="overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                    {filteredTransactions.map((transaction, i) => {
                        const Icon = transaction.icon;
                        return (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                                {/* Icon */}
                                <div className={`p-2.5 rounded-xl ${transaction.amount > 0 ? 'bg-emerald-500/10' : 'bg-white/[0.04]'}`}>
                                    <Icon className={`w-5 h-5 ${transaction.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`} />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{transaction.name}</span>
                                        {transaction.pending && (
                                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Pending</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                        <span>{transaction.category}</span>
                                        <span>•</span>
                                        <span>{transaction.account}</span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-slate-400">{transaction.date}</p>
                                    <p className="text-xs text-slate-500">{transaction.time}</p>
                                </div>

                                {/* Amount */}
                                <div className="text-right min-w-[100px]">
                                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.04] transition-all">
                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Load More */}
                <div className="p-4 border-t border-white/[0.04] text-center">
                    <button className="text-sm text-slate-400 hover:text-white transition-colors">
                        Load more transactions
                    </button>
                </div>
            </Card>
        </div>
    );
}
