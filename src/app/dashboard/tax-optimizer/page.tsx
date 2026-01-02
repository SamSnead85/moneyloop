'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Calculator,
    Zap,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    TrendingUp,
    Building2,
    Home,
    Car,
    Briefcase,
    Heart,
    GraduationCap,
    Laptop,
    Plane,
    Receipt,
    ArrowRight,
    Sparkles,
    Download,
    ChevronRight,
    Lock,
    RefreshCw,
    PiggyBank,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

// Tax optimization categories
const deductionCategories = [
    {
        id: 'home-office',
        name: 'Home Office',
        icon: Home,
        potentialSavings: 2400,
        status: 'found',
        description: 'Dedicated workspace deduction',
        details: '150 sq ft @ $5/sq ft simplified method',
    },
    {
        id: 'business-travel',
        name: 'Business Travel',
        icon: Plane,
        potentialSavings: 3200,
        status: 'found',
        description: 'Flights, hotels, and meals',
        details: '8 business trips detected',
    },
    {
        id: 'vehicle',
        name: 'Vehicle Expenses',
        icon: Car,
        potentialSavings: 4800,
        status: 'found',
        description: 'Mileage deduction',
        details: '8,000 miles @ $0.67/mile',
    },
    {
        id: 'equipment',
        name: 'Equipment & Software',
        icon: Laptop,
        potentialSavings: 1850,
        status: 'found',
        description: 'Business equipment purchases',
        details: 'Section 179 deduction eligible',
    },
    {
        id: 'health-insurance',
        name: 'Health Insurance',
        icon: Heart,
        potentialSavings: 6000,
        status: 'review',
        description: 'Self-employed health premiums',
        details: 'Requires additional documentation',
    },
    {
        id: 'education',
        name: 'Education & Training',
        icon: GraduationCap,
        potentialSavings: 1200,
        status: 'found',
        description: 'Professional development',
        details: 'Courses and certifications',
    },
    {
        id: 'contractors',
        name: 'Contractor Payments',
        icon: Briefcase,
        potentialSavings: 0,
        status: 'pending',
        description: 'Need to generate 1099s',
        details: '3 contractors paid > $600',
    },
    {
        id: 'retirement',
        name: 'Retirement Contributions',
        icon: PiggyBank,
        potentialSavings: 8500,
        status: 'opportunity',
        description: 'SEP-IRA contribution room',
        details: 'You can still contribute for 2025',
    },
];

const taxInsights = [
    {
        type: 'savings',
        title: 'Estimated Tax Savings Found',
        value: '$27,950',
        subtitle: 'Based on your bracket',
        icon: DollarSign,
        color: 'emerald',
    },
    {
        type: 'deductions',
        title: 'Total Deductions Identified',
        value: '$89,450',
        subtitle: 'Across 8 categories',
        icon: Receipt,
        color: 'indigo',
    },
    {
        type: 'refund',
        title: 'Projected Refund',
        value: '+$4,230',
        subtitle: 'vs. standard deduction',
        icon: TrendingUp,
        color: 'purple',
    },
    {
        type: 'bracket',
        title: 'Current Tax Bracket',
        value: '24%',
        subtitle: 'Marginal rate',
        icon: Calculator,
        color: 'amber',
    },
];

export default function TaxOptimizerPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [exportInProgress, setExportInProgress] = useState(false);

    const foundDeductions = deductionCategories.filter(d => d.status === 'found');
    const reviewDeductions = deductionCategories.filter(d => d.status === 'review');
    const opportunityDeductions = deductionCategories.filter(d => d.status === 'opportunity');

    const handleExport = async (format: string) => {
        setExportInProgress(true);
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 2000));
        setExportInProgress(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                            <Calculator className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold">Tax Optimizer</h1>
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                            Beta
                        </span>
                    </div>
                    <p className="text-slate-400">
                        AI-powered tax optimization • Maximize deductions • Minimize liability
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => handleExport('turbotax')}>
                        <Download className="w-4 h-4" />
                        Export to TurboTax
                    </Button>
                    <Button onClick={() => handleExport('pdf')}>
                        <FileText className="w-4 h-4" />
                        Generate Tax Report
                    </Button>
                </div>
            </div>

            {/* Tax Season Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20" padding="lg" hover={false}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/20">
                                <Sparkles className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Tax Season 2026 is Here! 🎉</h2>
                                <p className="text-slate-400">
                                    We've analyzed your transactions and found <span className="text-emerald-400 font-semibold">$27,950</span> in potential tax savings.
                                    Review your deductions below and export when ready.
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 mb-1">Filing deadline</p>
                            <p className="text-2xl font-bold text-white">April 15, 2026</p>
                            <p className="text-sm text-amber-400">104 days remaining</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {taxInsights.map((insight, index) => {
                    const colorMap = {
                        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
                        indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-400',
                        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
                        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
                    };
                    return (
                        <motion.div
                            key={insight.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full">
                                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${colorMap[insight.color as keyof typeof colorMap]} border mb-4`}>
                                    <insight.icon className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-slate-400 mb-1">{insight.title}</p>
                                <p className="text-3xl font-bold font-mono mb-1">{insight.value}</p>
                                <p className="text-xs text-slate-500">{insight.subtitle}</p>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* AI Tax Assistant */}
            <Card padding="lg" hover={false}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">AI Tax Assistant</h3>
                        <p className="text-sm text-slate-500">Ask anything about your taxes</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {[
                        'What deductions am I missing?',
                        'How can I reduce my tax bill?',
                        'Should I contribute more to retirement?',
                    ].map((question) => (
                        <button
                            key={question}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{question}</p>
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Ask about tax strategies, deductions, or deadlines..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <Button>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            {/* Deductions Found */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Found Deductions */}
                <div className="lg:col-span-2">
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-semibold">Deductions Found</h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                    {foundDeductions.length} items
                                </span>
                            </div>
                            <Button variant="ghost" size="sm">
                                <RefreshCw className="w-4 h-4" />
                                Rescan
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {foundDeductions.map((deduction, index) => (
                                <motion.div
                                    key={deduction.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => setActiveCategory(activeCategory === deduction.id ? null : deduction.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <deduction.icon className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{deduction.name}</p>
                                            <p className="text-sm text-slate-500">{deduction.details}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold text-emerald-400">
                                            +${deduction.potentialSavings.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-slate-500">savings</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Needs Review */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold">Needs Review</h3>
                        </div>
                        <div className="space-y-3">
                            {reviewDeductions.map((deduction) => (
                                <div
                                    key={deduction.id}
                                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <deduction.icon className="w-4 h-4 text-amber-400" />
                                        <p className="text-sm font-medium">{deduction.name}</p>
                                    </div>
                                    <p className="text-xs text-slate-500">{deduction.details}</p>
                                    <Button variant="ghost" size="sm" className="mt-2 w-full">
                                        Upload Documents
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Opportunities */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold">Opportunities</h3>
                        </div>
                        <div className="space-y-3">
                            {opportunityDeductions.map((deduction) => (
                                <div
                                    key={deduction.id}
                                    className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <deduction.icon className="w-4 h-4 text-purple-400" />
                                        <p className="text-sm font-medium">{deduction.name}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{deduction.details}</p>
                                    <p className="text-sm text-purple-400 font-medium">
                                        +${deduction.potentialSavings.toLocaleString()} potential
                                    </p>
                                    <Button variant="secondary" size="sm" className="mt-2 w-full">
                                        Take Action
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Export Options */}
                    <Card padding="lg" hover={false}>
                        <div className="flex items-center gap-3 mb-4">
                            <Download className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold">Export Options</h3>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors flex items-center justify-between">
                                <span className="text-sm">TurboTax (.txf)</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors flex items-center justify-between">
                                <span className="text-sm">H&R Block Import</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors flex items-center justify-between">
                                <span className="text-sm">PDF Tax Summary</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors flex items-center justify-between">
                                <span className="text-sm">CSV for Accountant</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Disclaimer */}
            <Card className="bg-slate-900/50 border-slate-700/50" padding="md" hover={false}>
                <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-slate-400">
                            <strong className="text-slate-300">Disclaimer:</strong> MoneyLoop Tax Optimizer provides estimates and suggestions based on your financial data.
                            This is not tax advice. Consult a qualified tax professional for personalized guidance. Tax laws vary by jurisdiction and change frequently.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
