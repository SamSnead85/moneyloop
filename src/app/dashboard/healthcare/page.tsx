'use client';

import { motion } from 'framer-motion';
import {
    Heart,
    Shield,
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Plus,
    Clock,
    PiggyBank,
    Activity,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

// Healthcare data
const coverageOverview = {
    plan: 'Blue Cross Blue Shield PPO',
    deductible: { used: 1250, total: 2500 },
    outOfPocketMax: { used: 2800, total: 8000 },
    hsaBalance: 4250,
    fsaBalance: 1200,
};

const recentClaims = [
    { id: 1, provider: 'Dr. Smith - Primary Care', date: 'Dec 15, 2025', billed: 285, youPay: 45, status: 'paid' },
    { id: 2, provider: 'LabCorp', date: 'Dec 10, 2025', billed: 420, youPay: 84, status: 'paid' },
    { id: 3, provider: 'City Pharmacy', date: 'Dec 8, 2025', billed: 65, youPay: 15, status: 'paid' },
    { id: 4, provider: 'Dental Associates', date: 'Dec 1, 2025', billed: 180, youPay: 0, status: 'covered' },
    { id: 5, provider: 'Vision Center', date: 'Nov 28, 2025', billed: 350, youPay: 75, status: 'pending' },
];

const upcomingBills = [
    { name: 'Monthly Premium', amount: 485, dueDate: 'Jan 1, 2026', auto: true },
    { name: 'Dental Premium', amount: 45, dueDate: 'Jan 1, 2026', auto: true },
    { name: 'Vision Premium', amount: 18, dueDate: 'Jan 1, 2026', auto: true },
];

const yearlyBreakdown = [
    { category: 'Premiums', amount: 6540, percentage: 52 },
    { category: 'Doctor Visits', amount: 2180, percentage: 17 },
    { category: 'Prescriptions', amount: 1450, percentage: 12 },
    { category: 'Lab Work', amount: 920, percentage: 7 },
    { category: 'Dental', amount: 850, percentage: 7 },
    { category: 'Vision', amount: 625, percentage: 5 },
];

const insights = [
    {
        title: 'HSA Contribution Room',
        message: 'You can contribute $3,350 more to your HSA this year. This reduces taxable income.',
        type: 'opportunity',
    },
    {
        title: 'Deductible Progress',
        message: 'You\'ve met 50% of your deductible. Consider scheduling preventive care visits.',
        type: 'info',
    },
];

export default function HealthcarePage() {
    const totalYearlySpend = yearlyBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                        <Heart className="w-8 h-8 text-rose-400" />
                        Healthcare
                    </h1>
                    <p className="text-slate-400">Track coverage, claims, and medical expenses</p>
                </div>
                <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Add Expense
                </Button>
            </div>

            {/* Coverage Overview */}
            <div className="grid lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-slate-400">Deductible</span>
                        </div>
                        <p className="text-2xl font-bold font-mono mb-2">
                            ${coverageOverview.deductible.used.toLocaleString()}
                            <span className="text-slate-500 text-lg"> / ${coverageOverview.deductible.total.toLocaleString()}</span>
                        </p>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(coverageOverview.deductible.used / coverageOverview.deductible.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {Math.round((coverageOverview.deductible.used / coverageOverview.deductible.total) * 100)}% met
                        </p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-purple-400" />
                            <span className="text-sm text-slate-400">Out-of-Pocket Max</span>
                        </div>
                        <p className="text-2xl font-bold font-mono mb-2">
                            ${coverageOverview.outOfPocketMax.used.toLocaleString()}
                            <span className="text-slate-500 text-lg"> / ${coverageOverview.outOfPocketMax.total.toLocaleString()}</span>
                        </p>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(coverageOverview.outOfPocketMax.used / coverageOverview.outOfPocketMax.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {Math.round((coverageOverview.outOfPocketMax.used / coverageOverview.outOfPocketMax.total) * 100)}% used
                        </p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <PiggyBank className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm text-slate-400">HSA Balance</span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-emerald-400">
                            ${coverageOverview.hsaBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Tax-advantaged savings</p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-amber-400" />
                            <span className="text-sm text-slate-400">FSA Balance</span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-amber-400">
                            ${coverageOverview.fsaBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Use by Dec 31, 2026</p>
                    </Card>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Claims */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Recent Claims</h2>
                            <button className="text-sm text-slate-400 hover:text-white transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {recentClaims.map((claim, index) => (
                                <motion.div
                                    key={claim.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${claim.status === 'covered'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : claim.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'bg-white/5 text-slate-400'
                                            }`}>
                                            {claim.status === 'covered' ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : claim.status === 'pending' ? (
                                                <Clock className="w-4 h-4" />
                                            ) : (
                                                <FileText className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{claim.provider}</p>
                                            <p className="text-sm text-slate-500">{claim.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm text-slate-500 line-through">${claim.billed}</p>
                                        <p className={`font-mono font-medium ${claim.youPay === 0 ? 'text-emerald-400' : ''}`}>
                                            {claim.youPay === 0 ? 'Covered' : `$${claim.youPay}`}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Bills */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold">Upcoming</h3>
                        </div>
                        <div className="space-y-3">
                            {upcomingBills.map((bill) => (
                                <div key={bill.name} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium">{bill.name}</p>
                                        <p className="text-xs text-slate-500">{bill.dueDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm">${bill.amount}</p>
                                        {bill.auto && (
                                            <span className="text-[10px] text-emerald-400">Auto-pay</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Insights */}
                    <Card padding="lg" hover={false}>
                        <h3 className="text-lg font-semibold mb-4">Insights</h3>
                        <div className="space-y-3">
                            {insights.map((insight, index) => (
                                <div
                                    key={insight.title}
                                    className={`p-3 rounded-xl border ${insight.type === 'opportunity'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-blue-500/10 border-blue-500/20'
                                        }`}
                                >
                                    <p className="text-sm font-medium mb-1">{insight.title}</p>
                                    <p className="text-xs text-slate-400">{insight.message}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Yearly Breakdown */}
            <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">2025 Healthcare Spending</h2>
                        <p className="text-sm text-slate-400">Total: ${totalYearlySpend.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yearlyBreakdown.map((cat, index) => (
                        <motion.div
                            key={cat.category}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-400">{cat.category}</span>
                                <span className="text-xs text-slate-500">{cat.percentage}%</span>
                            </div>
                            <p className="text-xl font-bold font-mono">${cat.amount.toLocaleString()}</p>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-rose-500/60 rounded-full"
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
