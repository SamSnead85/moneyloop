'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Calendar,
    Tag,
    DollarSign,
    Edit3,
    MessageSquare
} from 'lucide-react';

interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string | null;
    subcategory: string | null;
    date: string;
    pending: boolean;
    account_id: string | null;
    notes?: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    onUpdateCategory: (id: string, category: string) => Promise<void>;
    onAddNote: (id: string, note: string) => Promise<void>;
}

const categoryColors: Record<string, string> = {
    'Income': 'text-emerald-400 bg-emerald-500/10',
    'Food & Dining': 'text-amber-400 bg-amber-500/10',
    'Shopping': 'text-cyan-400 bg-cyan-500/10',
    'Transportation': 'text-purple-400 bg-purple-500/10',
    'Entertainment': 'text-rose-400 bg-rose-500/10',
    'Bills & Utilities': 'text-blue-400 bg-blue-500/10',
    'Healthcare': 'text-red-400 bg-red-500/10',
    'Travel': 'text-indigo-400 bg-indigo-500/10',
    'Transfer': 'text-slate-400 bg-slate-500/10',
    'Other': 'text-slate-400 bg-slate-500/10',
};

function TransactionRow({
    transaction,
    onUpdateCategory,
    onAddNote
}: {
    transaction: Transaction;
    onUpdateCategory: (category: string) => void;
    onAddNote: (note: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editingCategory, setEditingCategory] = useState(false);
    const [editingNote, setEditingNote] = useState(false);
    const [newNote, setNewNote] = useState(transaction.notes || '');

    const isIncome = transaction.amount > 0;
    const categoryStyle = categoryColors[transaction.category || 'Other'] || categoryColors['Other'];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div layout>
            <div
                className={`flex items-center justify-between py-3 px-3 -mx-3 rounded-xl cursor-pointer transition-colors ${expanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                    }`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                        }`}>
                        {isIncome ? (
                            <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <ArrowUpRight className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{transaction.name}</p>
                            {transaction.pending && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400">
                                    Pending
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`px-1.5 py-0.5 rounded ${categoryStyle}`}>
                                {transaction.category || 'Uncategorized'}
                            </span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className={`font-mono font-medium ${isIncome ? 'text-emerald-400' : ''}`}>
                        {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 pb-4 px-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Category Edit */}
                                <div
                                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setEditingCategory(!editingCategory); }}
                                >
                                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        Category
                                    </p>
                                    <p className="font-medium text-sm">{transaction.category || 'Uncategorized'}</p>
                                </div>

                                {/* Date */}
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Date
                                    </p>
                                    <p className="font-medium text-sm">
                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Category Selector */}
                            {editingCategory && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p className="text-xs text-slate-500 mb-2">Select Category</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(categoryColors).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    onUpdateCategory(cat);
                                                    setEditingCategory(false);
                                                }}
                                                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${transaction.category === cat
                                                        ? categoryColors[cat]
                                                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Notes */}
                            <div
                                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    Notes
                                </p>
                                {editingNote ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add a note..."
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none text-sm"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                onAddNote(newNote);
                                                setEditingNote(false);
                                            }}
                                            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingNote(true)}
                                        className="text-sm text-slate-500 hover:text-white transition-colors"
                                    >
                                        {transaction.notes || 'Add a note...'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function TransactionList({
    transactions,
    onUpdateCategory,
    onAddNote
}: TransactionListProps) {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(transactions.map(t => t.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Search filter
            if (search && !t.name.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            // Category filter
            if (filterCategory && t.category !== filterCategory) {
                return false;
            }
            // Type filter
            if (filterType === 'income' && t.amount <= 0) return false;
            if (filterType === 'expense' && t.amount > 0) return false;

            return true;
        });
    }, [transactions, search, filterCategory, filterType]);

    // Group by date
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        filteredTransactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(t);
        });

        return groups;
    }, [filteredTransactions]);

    const clearFilters = () => {
        setSearch('');
        setFilterCategory(null);
        setFilterType('all');
    };

    const hasActiveFilters = search || filterCategory || filterType !== 'all';

    return (
        <div>
            {/* Header with Search */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none text-sm"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl border transition-colors ${hasActiveFilters
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                            {/* Type Filter */}
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Type</p>
                                <div className="flex gap-2">
                                    {(['all', 'income', 'expense'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${filterType === type
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Category</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFilterCategory(null)}
                                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!filterCategory
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-white/[0.04] text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterCategory === cat
                                                    ? categoryColors[cat] || 'bg-slate-500/20 text-slate-400'
                                                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            <p className="text-xs text-slate-500 mb-3">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
            </p>

            {/* Transaction Groups */}
            {Object.keys(groupedTransactions).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedTransactions).map(([date, txs]) => (
                        <div key={date}>
                            <h3 className="text-xs font-medium text-slate-500 mb-2 sticky top-0 bg-[#050508] py-2">
                                {date}
                            </h3>
                            <div className="divide-y divide-white/[0.04]">
                                {txs.map((tx) => (
                                    <TransactionRow
                                        key={tx.id}
                                        transaction={tx}
                                        onUpdateCategory={(cat) => onUpdateCategory(tx.id, cat)}
                                        onAddNote={(note) => onAddNote(tx.id, note)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No transactions found</h3>
                    <p className="text-sm text-slate-500">
                        {hasActiveFilters
                            ? 'Try adjusting your filters'
                            : 'Transactions will appear here once you connect an account'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

export default TransactionList;
