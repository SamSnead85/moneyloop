'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Percent,
    Calendar,
    Target,
    Sparkles,
    RefreshCw,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

const portfolioSummary = {
    totalValue: 127450,
    dayChange: 1234,
    dayChangePercent: 0.98,
    totalGain: 24560,
    totalGainPercent: 23.8,
};

const holdings = [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market', value: 45200, shares: 182.4, change: 1.2, allocation: 35.5 },
    { symbol: 'VXUS', name: 'Vanguard Total International', value: 22600, shares: 412.5, change: -0.8, allocation: 17.7 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market', value: 18900, shares: 241.2, change: 0.1, allocation: 14.8 },
    { symbol: 'VNQ', name: 'Vanguard Real Estate', value: 12400, shares: 142.8, change: 2.4, allocation: 9.7 },
    { symbol: 'AAPL', name: 'Apple Inc.', value: 15800, shares: 84.2, change: 1.8, allocation: 12.4 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', value: 12550, shares: 72.1, change: 0.5, allocation: 9.9 },
];

const assetAllocation = [
    { category: 'US Stocks', percentage: 47.9, color: 'indigo' },
    { category: 'International Stocks', percentage: 17.7, color: 'purple' },
    { category: 'Bonds', percentage: 14.8, color: 'blue' },
    { category: 'Real Estate', percentage: 9.7, color: 'emerald' },
    { category: 'Individual Stocks', percentage: 9.9, color: 'amber' },
];

const performanceMetrics = [
    { label: 'YTD Return', value: '+18.4%', trend: 'up' },
    { label: '1-Year Return', value: '+23.8%', trend: 'up' },
    { label: '3-Year Avg', value: '+12.2%', trend: 'up' },
    { label: 'Dividend Yield', value: '1.8%', trend: 'neutral' },
];

export default function InvestmentsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                        Investments
                    </h1>
                    <p className="text-slate-400">Track your portfolio performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Last updated: 2 min ago</span>
                    <Button variant="secondary" size="sm">
                        <RefreshCw className="w-4 h-4" />
                        Sync
                    </Button>
                </div>
            </div>

            {/* Portfolio Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card padding="lg" hover={false} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
                            <p className="text-4xl font-bold font-mono">${portfolioSummary.totalValue.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Today&apos;s Change</p>
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                <span className="text-2xl font-bold text-emerald-400 font-mono">
                                    +${portfolioSummary.dayChange.toLocaleString()}
                                </span>
                                <span className="text-emerald-400">({portfolioSummary.dayChangePercent}%)</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Total Gain/Loss</p>
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                <span className="text-2xl font-bold text-emerald-400 font-mono">
                                    +${portfolioSummary.totalGain.toLocaleString()}
                                </span>
                                <span className="text-emerald-400">({portfolioSummary.totalGainPercent}%)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {performanceMetrics.slice(0, 2).map((metric) => (
                                <div key={metric.label} className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
                                    <p className={`text-lg font-semibold font-mono ${metric.trend === 'up' ? 'text-emerald-400' : 'text-white'
                                        }`}>
                                        {metric.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Holdings */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Holdings</h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-slate-500 border-b border-white/5">
                                        <th className="pb-4 font-medium">Symbol</th>
                                        <th className="pb-4 font-medium">Value</th>
                                        <th className="pb-4 font-medium">Shares</th>
                                        <th className="pb-4 font-medium">Today</th>
                                        <th className="pb-4 font-medium text-right">Allocation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map((holding, index) => (
                                        <motion.tr
                                            key={holding.symbol}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 last:border-0"
                                        >
                                            <td className="py-4">
                                                <div>
                                                    <p className="font-semibold">{holding.symbol}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{holding.name}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono">${holding.value.toLocaleString()}</td>
                                            <td className="py-4 text-slate-400">{holding.shares}</td>
                                            <td className="py-4">
                                                <span className={`flex items-center gap-1 ${holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                    }`}>
                                                    {holding.change >= 0 ? (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4" />
                                                    )}
                                                    {Math.abs(holding.change)}%
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: `${holding.allocation}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-400 w-12">{holding.allocation}%</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Asset Allocation */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-semibold">Asset Allocation</h2>
                    </div>

                    {/* Simple donut placeholder */}
                    <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {assetAllocation.map((asset, index) => {
                                const colorMap = {
                                    indigo: '#6366f1',
                                    purple: '#a855f7',
                                    blue: '#3b82f6',
                                    emerald: '#10b981',
                                    amber: '#f59e0b',
                                };
                                const offset = assetAllocation.slice(0, index).reduce((acc, a) => acc + a.percentage, 0);
                                return (
                                    <circle
                                        key={asset.category}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke={colorMap[asset.color as keyof typeof colorMap]}
                                        strokeWidth="20"
                                        strokeDasharray={`${asset.percentage * 2.51} 251`}
                                        strokeDashoffset={-offset * 2.51}
                                        opacity="0.8"
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-2xl font-bold">5</p>
                                <p className="text-xs text-slate-500">Categories</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {assetAllocation.map((asset) => {
                            const colorMap = {
                                indigo: 'bg-indigo-500',
                                purple: 'bg-purple-500',
                                blue: 'bg-blue-500',
                                emerald: 'bg-emerald-500',
                                amber: 'bg-amber-500',
                            };
                            return (
                                <div key={asset.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${colorMap[asset.color as keyof typeof colorMap]}`} />
                                        <span className="text-sm text-slate-400">{asset.category}</span>
                                    </div>
                                    <span className="font-mono text-sm">{asset.percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* AI Investment Insights */}
            <Card padding="lg" hover={false}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">AI Investment Insights</h3>
                        <p className="text-sm text-slate-500">Personalized recommendations</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Well Balanced</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Your portfolio is well-diversified with a healthy mix of growth and stability assets.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">Opportunity</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Consider increasing international exposure by 5% to reduce US market concentration.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">Reminder</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Annual rebalancing due in 45 days. I'll remind you when it's time to optimize.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
