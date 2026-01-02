'use client';

import { motion } from 'framer-motion';
import {
    Building2,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Zap,
    Clock,
    Tag,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui';

const businessMetrics = [
    {
        label: 'Monthly Revenue',
        value: 45200,
        change: 12.3,
        trend: 'up',
        icon: DollarSign,
        color: 'emerald',
    },
    {
        label: 'Burn Rate',
        value: 32400,
        change: -5.2,
        trend: 'down',
        icon: Zap,
        color: 'purple',
    },
    {
        label: 'Runway',
        value: '14 months',
        subtext: 'at current rate',
        icon: Clock,
        color: 'blue',
    },
    {
        label: 'Net Profit',
        value: 12800,
        change: 28.5,
        trend: 'up',
        icon: TrendingUp,
        color: 'indigo',
    },
];

const cashFlowData = [
    { month: 'Jul', income: 38000, expenses: 35000 },
    { month: 'Aug', income: 41000, expenses: 34000 },
    { month: 'Sep', income: 39000, expenses: 33000 },
    { month: 'Oct', income: 42000, expenses: 34500 },
    { month: 'Nov', income: 44000, expenses: 33000 },
    { month: 'Dec', income: 45200, expenses: 32400 },
];

const topVendors = [
    { name: 'AWS', category: 'Infrastructure', amount: 8450, change: 12 },
    { name: 'Stripe', category: 'Payment Processing', amount: 4230, change: 8 },
    { name: 'Google Workspace', category: 'Software', amount: 1260, change: 0 },
    { name: 'Salesforce', category: 'CRM', amount: 3200, change: -5 },
    { name: 'Payroll (Gusto)', category: 'HR', amount: 12500, change: 3 },
];

const taxCategories = [
    { category: 'Deductible Expenses', amount: 28400, count: 145 },
    { category: 'Capital Expenses', amount: 5200, count: 12 },
    { category: 'Travel & Entertainment', amount: 3800, count: 34 },
    { category: 'Pending Review', amount: 2100, count: 8 },
];

export default function BusinessPage() {
    const maxCashFlow = Math.max(...cashFlowData.map(d => Math.max(d.income, d.expenses)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-400" />
                        Business Finance
                    </h1>
                    <p className="text-slate-400">Monitor your business health and runway</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-emerald-400">Healthy Cash Flow</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {businessMetrics.map((metric, index) => {
                    const colorClasses = {
                        emerald: 'bg-emerald-500/20 text-emerald-400',
                        purple: 'bg-purple-500/20 text-purple-400',
                        blue: 'bg-blue-500/20 text-blue-400',
                        indigo: 'bg-indigo-500/20 text-indigo-400',
                    };
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                                        <metric.icon className="w-5 h-5" />
                                    </div>
                                    {metric.change !== undefined && (
                                        <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {metric.trend === 'up' ? (
                                                <ArrowUpRight className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" />
                                            )}
                                            <span>{Math.abs(metric.change)}%</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {typeof metric.value === 'number' ? `$${metric.value.toLocaleString()}` : metric.value}
                                </p>
                                {metric.subtext && (
                                    <p className="text-xs text-slate-500 mt-1">{metric.subtext}</p>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Flow Chart */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Cash Flow</h2>
                                <p className="text-sm text-slate-400">Revenue vs Expenses (6 months)</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-slate-400">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-slate-400">Expenses</span>
                                </div>
                            </div>
                        </div>

                        {/* Simple bar chart */}
                        <div className="h-[240px] flex items-end gap-4">
                            {cashFlowData.map((data, index) => (
                                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex gap-1 h-[200px] items-end">
                                        <motion.div
                                            className="flex-1 bg-emerald-500/80 rounded-t-lg"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(data.income / maxCashFlow) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        />
                                        <motion.div
                                            className="flex-1 bg-purple-500/60 rounded-t-lg"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(data.expenses / maxCashFlow) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Runway Projection */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold">Runway Projection</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Current Balance</span>
                                <span className="text-xl font-bold font-mono">$456,000</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Monthly Burn</span>
                                <span className="font-mono">$32,400</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Monthly Revenue</span>
                                <span className="font-mono text-emerald-400">$45,200</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Net Monthly</span>
                                <span className="font-mono text-emerald-400">+$12,800</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-slate-400">Runway</span>
                                <span className="font-mono font-bold text-blue-400">∞ (profitable)</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm text-emerald-400">
                                🎉 Great news! At current trajectory, you're cash flow positive.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Vendors */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Top Vendors</h2>
                        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {topVendors.map((vendor, index) => (
                            <motion.div
                                key={vendor.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium">
                                        {vendor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{vendor.name}</p>
                                        <p className="text-xs text-slate-500">{vendor.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono">${vendor.amount.toLocaleString()}</p>
                                    <p className={`text-xs ${vendor.change > 0 ? 'text-red-400' : vendor.change < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {vendor.change > 0 ? '+' : ''}{vendor.change}% vs last month
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Tax Categories */}
                <Card padding="lg" hover={false}>
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-semibold">Tax Categories</h2>
                    </div>

                    <div className="space-y-4">
                        {taxCategories.map((cat, index) => (
                            <motion.div
                                key={cat.category}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">{cat.category}</span>
                                    <span className="font-mono text-sm">${cat.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${cat.category === 'Pending Review'
                                                    ? 'bg-amber-500'
                                                    : 'bg-indigo-500'
                                                }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(cat.amount / 30000) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500">{cat.count} items</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors">
                        Export Tax Report
                    </button>
                </Card>
            </div>
        </div>
    );
}
