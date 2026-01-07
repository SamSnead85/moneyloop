'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Brain,
    Sparkles,
    ChevronRight,
    RefreshCw,
    PiggyBank,
    CreditCard,
    ShoppingBag,
    Zap,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface Insight {
    id: string;
    type: 'savings' | 'spending' | 'pattern' | 'opportunity' | 'warning' | 'achievement';
    title: string;
    description: string;
    impact?: { amount: number; period: string; type: 'positive' | 'negative' };
    actionLabel?: string;
    actionUrl?: string;
    priority: 'high' | 'medium' | 'low';
}

const mockInsights: Insight[] = [
    {
        id: '1',
        type: 'savings',
        title: 'Unused Spotify Subscription',
        description: 'You haven\'t used Spotify in 45 days. Consider canceling to save $11.99/month.',
        impact: { amount: 144, period: 'year', type: 'positive' },
        actionLabel: 'Review Subscription',
        actionUrl: '/dashboard/subscriptions',
        priority: 'high',
    },
    {
        id: '2',
        type: 'opportunity',
        title: 'High-Yield Savings Opportunity',
        description: 'You have $12,450 in checking. Moving $8,000 to a high-yield savings could earn $360/year at 4.5% APY.',
        impact: { amount: 360, period: 'year', type: 'positive' },
        actionLabel: 'Learn More',
        actionUrl: '/dashboard/accounts',
        priority: 'high',
    },
    {
        id: '3',
        type: 'pattern',
        title: 'Restaurant Spending Up 45%',
        description: 'Your dining out expenses increased from $320/month to $465/month this quarter.',
        impact: { amount: 145, period: 'month', type: 'negative' },
        priority: 'medium',
    },
    {
        id: '4',
        type: 'warning',
        title: 'Groceries Budget Warning',
        description: 'You\'ve used 85% of your $600 groceries budget with 9 days remaining.',
        actionLabel: 'View Budget',
        actionUrl: '/dashboard/budgets',
        priority: 'high',
    },
    {
        id: '5',
        type: 'achievement',
        title: '75% to Vacation Goal! 🎉',
        description: 'You\'ve saved $3,750 of your $5,000 vacation goal. Just $1,250 to go!',
        actionLabel: 'View Goal',
        actionUrl: '/dashboard/goals',
        priority: 'low',
    },
    {
        id: '6',
        type: 'spending',
        title: 'Coffee Spending Insight',
        description: 'You spend $148/month on coffee shops. Brewing at home 3 days a week could save $1,000/year.',
        impact: { amount: 1000, period: 'year', type: 'positive' },
        priority: 'medium',
    },
    {
        id: '7',
        type: 'opportunity',
        title: 'Better Auto Insurance Rate',
        description: 'Users with similar profiles found rates $35/month lower. Consider getting quotes.',
        impact: { amount: 420, period: 'year', type: 'positive' },
        priority: 'medium',
    },
    {
        id: '8',
        type: 'pattern',
        title: 'Subscription Creep Detected',
        description: 'Your monthly subscriptions increased from $89 to $142 over 6 months (+60%).',
        impact: { amount: 636, period: 'year', type: 'negative' },
        actionLabel: 'Review All',
        actionUrl: '/dashboard/subscriptions',
        priority: 'high',
    },
];

const typeConfig = {
    savings: { icon: PiggyBank, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    spending: { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    pattern: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    opportunity: { icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    warning: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    achievement: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>(mockInsights);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | Insight['type']>('all');

    const filteredInsights = insights.filter(i => filter === 'all' || i.type === filter);

    const totalSavings = insights
        .filter(i => i.impact?.type === 'positive')
        .reduce((sum, i) => sum + (i.impact?.amount || 0), 0);

    const highPriorityCount = insights.filter(i => i.priority === 'high').length;

    const refreshInsights = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'insights' }),
            });
            const data = await response.json();
            // In production, would update insights from API response
        } catch (error) {
            console.error('Failed to refresh insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                        AI Insights
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Personalized recommendations to optimize your finances
                    </p>
                </div>
                <Button onClick={refreshInsights} disabled={isLoading} variant="secondary" className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Insights
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Potential Savings</p>
                            <p className="text-xl font-semibold text-emerald-400">
                                ${totalSavings.toLocaleString()}/yr
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">High Priority</p>
                            <p className="text-xl font-semibold">{highPriorityCount} items</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Brain className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Insights</p>
                            <p className="text-xl font-semibold">{insights.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Patterns Found</p>
                            <p className="text-xl font-semibold">
                                {insights.filter(i => i.type === 'pattern').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'savings', 'opportunity', 'warning', 'pattern', 'spending', 'achievement'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === f
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Insights Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredInsights.map((insight, index) => {
                    const config = typeConfig[insight.type];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-5 border-l-4 ${insight.priority === 'high' ? 'border-l-red-500' :
                                    insight.priority === 'medium' ? 'border-l-amber-500' :
                                        'border-l-emerald-500'
                                } hover:bg-white/[0.01] transition-colors`}>
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        <Icon className={`w-5 h-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{insight.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{insight.description}</p>
                                    </div>
                                </div>

                                {/* Impact & Action */}
                                <div className="flex items-center justify-between">
                                    {insight.impact && (
                                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${insight.impact.type === 'positive'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {insight.impact.type === 'positive' ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            {insight.impact.type === 'positive' ? '+' : '-'}
                                            ${insight.impact.amount.toLocaleString()}/{insight.impact.period}
                                        </div>
                                    )}

                                    {insight.actionLabel && (
                                        <button
                                            onClick={() => insight.actionUrl && (window.location.href = insight.actionUrl)}
                                            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            {insight.actionLabel}
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredInsights.length === 0 && (
                <Card className="p-12 text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <h3 className="font-medium mb-2">No insights in this category</h3>
                    <p className="text-sm text-slate-500">Check back later or try another filter.</p>
                </Card>
            )}
        </div>
    );
}
