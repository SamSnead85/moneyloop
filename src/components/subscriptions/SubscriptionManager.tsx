'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    CreditCard,
    Calendar,
    DollarSign,
    MoreVertical,
    Pause,
    Play,
    Trash2,
    ExternalLink,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Filter,
    Search,
    Grid,
    List,
} from 'lucide-react';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'yearly' | 'weekly';
    category: string;
    nextBilling: Date;
    status: 'active' | 'paused' | 'cancelled';
    logo?: string;
    color: string;
}

// Demo subscriptions
const DEMO_SUBSCRIPTIONS: Subscription[] = [
    { id: '1', name: 'Netflix', amount: 22.99, frequency: 'monthly', category: 'Entertainment', nextBilling: new Date('2026-01-15'), status: 'active', color: '#E50914' },
    { id: '2', name: 'Spotify', amount: 10.99, frequency: 'monthly', category: 'Entertainment', nextBilling: new Date('2026-01-20'), status: 'active', color: '#1DB954' },
    { id: '3', name: 'iCloud+', amount: 2.99, frequency: 'monthly', category: 'Storage', nextBilling: new Date('2026-01-18'), status: 'active', color: '#3478F6' },
    { id: '4', name: 'ChatGPT Plus', amount: 20, frequency: 'monthly', category: 'Productivity', nextBilling: new Date('2026-01-25'), status: 'active', color: '#10A37F' },
    { id: '5', name: 'Adobe CC', amount: 54.99, frequency: 'monthly', category: 'Productivity', nextBilling: new Date('2026-02-01'), status: 'active', color: '#FF0000' },
    { id: '6', name: 'Gym Membership', amount: 49.99, frequency: 'monthly', category: 'Health', nextBilling: new Date('2026-01-05'), status: 'paused', color: '#8B5CF6' },
    { id: '7', name: 'NYT Digital', amount: 17, frequency: 'monthly', category: 'News', nextBilling: new Date('2026-01-12'), status: 'active', color: '#000000' },
    { id: '8', name: 'AWS', amount: 125.50, frequency: 'monthly', category: 'Business', nextBilling: new Date('2026-02-01'), status: 'active', color: '#FF9900' },
];

export function SubscriptionManager() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Calculate totals
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
        if (s.frequency === 'yearly') return sum + s.amount / 12;
        if (s.frequency === 'weekly') return sum + s.amount * 4.33;
        return sum + s.amount;
    }, 0);
    const yearlyTotal = monthlyTotal * 12;

    // Filter subscriptions
    const filteredSubs = subscriptions.filter(s => {
        if (filter !== 'all' && s.status !== filter) return false;
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Categories
    const categories = [...new Set(subscriptions.map(s => s.category))];

    const toggleStatus = (id: string) => {
        setSubscriptions(prev => prev.map(s => {
            if (s.id !== id) return s;
            return {
                ...s,
                status: s.status === 'active' ? 'paused' : 'active'
            };
        }));
    };

    const cancelSubscription = (id: string) => {
        setSubscriptions(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'cancelled' } : s
        ));
        setSelectedId(null);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const daysUntil = (date: Date) => {
        const diff = date.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm text-white/50">Monthly Cost</span>
                    </div>
                    <p className="text-2xl font-semibold text-white font-mono">{formatCurrency(monthlyTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm text-white/50">Yearly Cost</span>
                    </div>
                    <p className="text-2xl font-semibold text-white font-mono">{formatCurrency(yearlyTotal)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-sm text-white/50">Active Subscriptions</span>
                    </div>
                    <p className="text-2xl font-semibold text-white font-mono">{activeSubscriptions.length}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="flex rounded-lg overflow-hidden border border-white/10">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 ${view === 'grid' ? 'bg-white/10' : 'bg-white/[0.03]'}`}
                        >
                            <Grid className="w-4 h-4 text-white/70" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 ${view === 'list' ? 'bg-white/10' : 'bg-white/[0.03]'}`}
                        >
                            <List className="w-4 h-4 text-white/70" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscription Grid/List */}
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                <AnimatePresence>
                    {filteredSubs.map((sub, index) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative p-4 rounded-xl border transition-all ${sub.status === 'cancelled'
                                    ? 'bg-white/[0.01] border-white/5 opacity-50'
                                    : sub.status === 'paused'
                                        ? 'bg-amber-500/5 border-amber-500/20'
                                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                                    style={{ backgroundColor: sub.color + '20', color: sub.color }}
                                >
                                    {sub.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-white">{sub.name}</h3>
                                            <p className="text-sm text-white/50">{sub.category}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedId(selectedId === sub.id ? null : sub.id)}
                                            className="p-1 rounded hover:bg-white/10"
                                        >
                                            <MoreVertical className="w-4 h-4 text-white/50" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div>
                                            <p className="text-lg font-semibold text-white font-mono">
                                                {formatCurrency(sub.amount)}
                                                <span className="text-sm text-white/50 font-normal">/{sub.frequency.slice(0, 2)}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/50">Next billing</p>
                                            <p className={`text-sm ${daysUntil(sub.nextBilling) <= 3 ? 'text-amber-400' : 'text-white/70'}`}>
                                                {formatDate(sub.nextBilling)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action menu */}
                            <AnimatePresence>
                                {selectedId === sub.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-4 top-12 z-10 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleStatus(sub.id)}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                                        >
                                            {sub.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            {sub.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                        <button
                                            onClick={() => cancelSubscription(sub.id)}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredSubs.length === 0 && (
                <div className="text-center py-12 text-white/50">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No subscriptions found</p>
                </div>
            )}
        </div>
    );
}

export default SubscriptionManager;
