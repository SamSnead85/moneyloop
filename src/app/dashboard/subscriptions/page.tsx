'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Trash2,
    ExternalLink,
    Calendar,
    DollarSign,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Search,
    Filter,
    Eye,
    EyeOff,
    MoreVertical,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Subscription {
    id: string;
    service_name: string;
    amount: number;
    billing_frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    next_billing_date: string;
    category?: string;
    logo_url?: string;
    status: 'active' | 'cancelled' | 'paused' | 'trial';
    usage_score?: number;
    last_used_at?: string;
}

const mockSubscriptions: Subscription[] = [
    { id: '1', service_name: 'Netflix', amount: 15.99, billing_frequency: 'monthly', next_billing_date: '2026-01-15', category: 'Entertainment', status: 'active', usage_score: 0.85, last_used_at: '2026-01-06' },
    { id: '2', service_name: 'Spotify', amount: 11.99, billing_frequency: 'monthly', next_billing_date: '2026-01-18', category: 'Entertainment', status: 'active', usage_score: 0.45, last_used_at: '2025-12-01' },
    { id: '3', service_name: 'Adobe Creative Cloud', amount: 59.99, billing_frequency: 'monthly', next_billing_date: '2026-01-20', category: 'Productivity', status: 'active', usage_score: 0.92 },
    { id: '4', service_name: 'Amazon Prime', amount: 139.00, billing_frequency: 'annual', next_billing_date: '2026-06-15', category: 'Shopping', status: 'active', usage_score: 0.78 },
    { id: '5', service_name: 'Hulu', amount: 17.99, billing_frequency: 'monthly', next_billing_date: '2026-01-22', category: 'Entertainment', status: 'active', usage_score: 0.25, last_used_at: '2025-10-15' },
    { id: '6', service_name: 'Disney+', amount: 13.99, billing_frequency: 'monthly', next_billing_date: '2026-01-25', category: 'Entertainment', status: 'active', usage_score: 0.35, last_used_at: '2025-11-20' },
    { id: '7', service_name: 'Gym Membership', amount: 49.99, billing_frequency: 'monthly', next_billing_date: '2026-01-01', category: 'Health', status: 'active', usage_score: 0.15, last_used_at: '2025-09-01' },
    { id: '8', service_name: 'iCloud Storage', amount: 2.99, billing_frequency: 'monthly', next_billing_date: '2026-01-10', category: 'Cloud', status: 'active', usage_score: 0.95 },
];

function getUsageColor(score: number) {
    if (score >= 0.7) return 'text-emerald-400';
    if (score >= 0.4) return 'text-amber-400';
    return 'text-red-400';
}

function getUsageLabel(score: number) {
    if (score >= 0.7) return 'High usage';
    if (score >= 0.4) return 'Moderate';
    return 'Low usage';
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'unused'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchSubscriptions() {
            const supabase = createClient();
            const { data } = await supabase
                .from('subscriptions')
                .select('*')
                .order('amount', { ascending: false });

            if (data?.length) setSubscriptions(data);
        }
        fetchSubscriptions();
    }, []);

    const monthlyTotal = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            if (s.billing_frequency === 'annual') return sum + s.amount / 12;
            if (s.billing_frequency === 'quarterly') return sum + s.amount / 3;
            return sum + s.amount;
        }, 0);

    const annualTotal = monthlyTotal * 12;

    const unusedSubscriptions = subscriptions.filter(s =>
        s.status === 'active' && (s.usage_score || 0) < 0.4
    );

    const potentialSavings = unusedSubscriptions.reduce((sum, s) => {
        if (s.billing_frequency === 'annual') return sum + s.amount;
        return sum + s.amount * 12;
    }, 0);

    const filteredSubs = subscriptions.filter(s => {
        if (filter === 'active' && s.status !== 'active') return false;
        if (filter === 'unused' && (s.usage_score || 0) >= 0.4) return false;
        if (searchQuery && !s.service_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const [cancelInstructions, setCancelInstructions] = useState<{ steps: string[]; url?: string } | null>(null);
    const [loadingCancel, setLoadingCancel] = useState(false);

    const handleCancel = async (sub: Subscription) => {
        setSelectedSub(sub);
        setShowCancelModal(true);
        setLoadingCancel(true);

        try {
            const res = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceName: sub.service_name }),
            });
            const data = await res.json();
            if (data.success) {
                setCancelInstructions({ steps: data.steps, url: data.url });
            }
        } catch (error) {
            console.error('Failed to get cancellation instructions:', error);
        } finally {
            setLoadingCancel(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-purple-400" />
                        Subscriptions
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track and optimize your recurring payments
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Monthly Cost</p>
                            <p className="text-xl font-semibold">${monthlyTotal.toFixed(0)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Annual Cost</p>
                            <p className="text-xl font-semibold">${annualTotal.toFixed(0)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Unused</p>
                            <p className="text-xl font-semibold">{unusedSubscriptions.length} services</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <TrendingDown className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Potential Savings</p>
                            <p className="text-xl font-semibold text-emerald-400">${potentialSavings.toFixed(0)}/yr</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {(['all', 'active', 'unused'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === f
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subscriptions List */}
            <Card className="overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                    {filteredSubs.map((sub, index) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="flex items-center gap-4 p-4 hover:bg-white/[0.01] transition-colors group"
                        >
                            {/* Logo/Icon */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{sub.service_name}</span>
                                    {sub.status === 'trial' && (
                                        <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Trial</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                    <span>{sub.category}</span>
                                    <span>•</span>
                                    <span>Bills {sub.billing_frequency}</span>
                                </div>
                            </div>

                            {/* Usage Score */}
                            {sub.usage_score !== undefined && (
                                <div className="text-right hidden sm:block">
                                    <p className={`text-sm font-medium ${getUsageColor(sub.usage_score)}`}>
                                        {getUsageLabel(sub.usage_score)}
                                    </p>
                                    <div className="w-16 h-1.5 bg-white/[0.04] rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${sub.usage_score >= 0.7 ? 'bg-emerald-500' :
                                                sub.usage_score >= 0.4 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                                }`}
                                            style={{ width: `${sub.usage_score * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <div className="text-right min-w-[80px]">
                                <p className="font-semibold font-mono">${sub.amount.toFixed(2)}</p>
                                <p className="text-[10px] text-slate-600">/{sub.billing_frequency.slice(0, 2)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleCancel(sub)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                    title="Cancel subscription"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Cancel Modal */}
            <AnimatePresence>
                {showCancelModal && selectedSub && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowCancelModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="relative z-10 w-full max-w-md p-6">
                                <h2 className="text-lg font-semibold mb-2">Cancel {selectedSub.service_name}?</h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Cancelling will save you ${selectedSub.amount.toFixed(2)}/{selectedSub.billing_frequency}.
                                    {selectedSub.billing_frequency === 'annual' && (
                                        <span className="text-amber-400"> Note: Annual subscriptions may not offer prorated refunds.</span>
                                    )}
                                </p>

                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6">
                                    <h3 className="text-sm font-medium mb-2">How to Cancel</h3>
                                    {loadingCancel ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <div className="w-4 h-4 border-2 border-slate-500 border-t-purple-400 rounded-full animate-spin" />
                                            Loading instructions...
                                        </div>
                                    ) : (
                                        <ol className="text-xs text-slate-400 space-y-1">
                                            {(cancelInstructions?.steps || [
                                                'Log into your account',
                                                'Navigate to Settings > Subscription',
                                                'Click "Cancel Subscription"',
                                                'Follow prompts to confirm',
                                            ]).map((step, i) => (
                                                <li key={i}>{i + 1}. {step}</li>
                                            ))}
                                        </ol>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={() => { setShowCancelModal(false); setCancelInstructions(null); }} className="flex-1">
                                        Keep Subscription
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const url = cancelInstructions?.url || `https://www.google.com/search?q=how+to+cancel+${selectedSub.service_name}`;
                                            window.open(url, '_blank');
                                            setShowCancelModal(false);
                                            setCancelInstructions(null);
                                        }}
                                        className="flex-1 gap-1"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {cancelInstructions?.url ? 'Go to Cancel Page' : 'Cancel Guide'}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
