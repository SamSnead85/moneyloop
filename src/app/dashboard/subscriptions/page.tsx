'use client';

import { motion } from 'framer-motion';
import {
    CreditCard,
    AlertTriangle,
    TrendingUp,
    Calendar,
    MoreVertical,
    ExternalLink,
    Pause,
    Trash2,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

const subscriptions = [
    {
        id: 1,
        name: 'Netflix',
        category: 'Entertainment',
        price: 15.99,
        billingCycle: 'monthly',
        nextBilling: 'Jan 15',
        logo: 'N',
        color: '#e50914',
        status: 'active',
    },
    {
        id: 2,
        name: 'Spotify',
        category: 'Entertainment',
        price: 9.99,
        billingCycle: 'monthly',
        nextBilling: 'Jan 8',
        logo: 'S',
        color: '#1db954',
        status: 'active',
    },
    {
        id: 3,
        name: 'Adobe Creative Cloud',
        category: 'Productivity',
        price: 54.99,
        billingCycle: 'monthly',
        nextBilling: 'Jan 20',
        logo: 'A',
        color: '#ff0000',
        status: 'active',
        alert: 'Price increased $5 last month',
    },
    {
        id: 4,
        name: 'GitHub Pro',
        category: 'Development',
        price: 4.00,
        billingCycle: 'monthly',
        nextBilling: 'Jan 12',
        logo: 'G',
        color: '#6e5494',
        status: 'active',
    },
    {
        id: 5,
        name: 'ChatGPT Plus',
        category: 'Productivity',
        price: 20.00,
        billingCycle: 'monthly',
        nextBilling: 'Jan 18',
        logo: 'C',
        color: '#10a37f',
        status: 'active',
    },
    {
        id: 6,
        name: 'Notion',
        category: 'Productivity',
        price: 10.00,
        billingCycle: 'monthly',
        nextBilling: 'Jan 25',
        logo: 'N',
        color: '#000000',
        status: 'trial',
        alert: 'Trial ends in 5 days',
    },
    {
        id: 7,
        name: 'Gym Membership',
        category: 'Health',
        price: 49.00,
        billingCycle: 'monthly',
        nextBilling: 'Jan 1',
        logo: 'G',
        color: '#f97316',
        status: 'unused',
        alert: 'No visits in 45 days',
    },
];

const insights = [
    {
        type: 'savings',
        title: 'Switch to Annual Billing',
        description: 'Save $47/year by switching Netflix & Spotify to annual plans.',
        action: 'View Options',
    },
    {
        type: 'warning',
        title: 'Unused Subscription',
        description: "You haven't used your gym membership in 45 days.",
        action: 'Review',
    },
    {
        type: 'alert',
        title: 'Price Increase',
        description: 'Adobe Creative Cloud increased by $5/month.',
        action: 'Compare Alternatives',
    },
];

export default function SubscriptionsPage() {
    const monthlyTotal = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    const yearlyTotal = monthlyTotal * 12;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Subscriptions</h1>
                    <p className="text-slate-400">Track and manage all your recurring payments</p>
                </div>
                <Button icon={<CreditCard className="w-4 h-4" />}>
                    Add Subscription
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Monthly Spend</p>
                            <p className="text-3xl font-bold font-mono">${monthlyTotal.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/20">
                            <Calendar className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Yearly Cost</p>
                            <p className="text-3xl font-bold font-mono">${yearlyTotal.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
                            <p className="text-3xl font-bold font-mono">{subscriptions.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                    <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card
                            className={`${insight.type === 'savings'
                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                    : insight.type === 'warning'
                                        ? 'border-amber-500/30 bg-amber-500/5'
                                        : 'border-red-500/30 bg-red-500/5'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-2 rounded-lg ${insight.type === 'savings'
                                            ? 'bg-emerald-500/20'
                                            : insight.type === 'warning'
                                                ? 'bg-amber-500/20'
                                                : 'bg-red-500/20'
                                        }`}
                                >
                                    <AlertTriangle
                                        className={`w-4 h-4 ${insight.type === 'savings'
                                                ? 'text-emerald-400'
                                                : insight.type === 'warning'
                                                    ? 'text-amber-400'
                                                    : 'text-red-400'
                                            }`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">{insight.title}</p>
                                    <p className="text-xs text-slate-400 mb-3">{insight.description}</p>
                                    <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        {insight.action} →
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Subscriptions List */}
            <Card padding="none" hover={false}>
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-semibold">All Subscriptions</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {subscriptions.map((sub, index) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                                    style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                                >
                                    {sub.logo}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{sub.name}</p>
                                        {sub.status === 'trial' && (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                                Trial
                                            </span>
                                        )}
                                        {sub.status === 'unused' && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                                Unused
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{sub.category}</p>
                                    {sub.alert && (
                                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {sub.alert}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="font-mono font-medium">${sub.price.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">/{sub.billingCycle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">Next billing</p>
                                    <p className="text-sm font-medium">{sub.nextBilling}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-amber-400">
                                        <Pause className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
