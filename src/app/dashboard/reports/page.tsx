'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Calendar,
    PieChart,
    TrendingUp,
    DollarSign,
    Receipt,
    BarChart3,
    FileSpreadsheet,
    File,
    Clock,
    ChevronRight,
    Plus,
    Check,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

const reportTemplates = [
    {
        id: 'net-worth',
        name: 'Net Worth Statement',
        description: 'Complete breakdown of assets and liabilities',
        icon: PieChart,
        lastGenerated: 'Dec 31, 2025',
        category: 'Overview',
    },
    {
        id: 'spending',
        name: 'Spending Report',
        description: 'Detailed analysis of expenses by category',
        icon: BarChart3,
        lastGenerated: 'Jan 1, 2026',
        category: 'Spending',
    },
    {
        id: 'tax-summary',
        name: 'Tax Summary',
        description: 'Deductions, income, and tax liability overview',
        icon: Receipt,
        lastGenerated: 'Dec 31, 2025',
        category: 'Tax',
    },
    {
        id: 'income',
        name: 'Income Statement',
        description: 'All income sources and trends',
        icon: DollarSign,
        lastGenerated: 'Jan 1, 2026',
        category: 'Income',
    },
    {
        id: 'investments',
        name: 'Investment Performance',
        description: 'Portfolio returns and allocation analysis',
        icon: TrendingUp,
        lastGenerated: 'Dec 31, 2025',
        category: 'Investments',
    },
    {
        id: 'cash-flow',
        name: 'Cash Flow Report',
        description: 'Monthly inflows and outflows',
        icon: FileText,
        lastGenerated: 'Dec 31, 2025',
        category: 'Overview',
    },
];

const recentReports = [
    { name: 'Net Worth Statement', date: 'Dec 31, 2025', format: 'PDF', size: '245 KB' },
    { name: 'Q4 2025 Tax Summary', date: 'Dec 31, 2025', format: 'PDF', size: '189 KB' },
    { name: 'December Spending Report', date: 'Jan 1, 2026', format: 'Excel', size: '312 KB' },
    { name: 'Annual Investment Report', date: 'Dec 31, 2025', format: 'PDF', size: '1.2 MB' },
];

const dateRanges = [
    'This Month',
    'Last Month',
    'This Quarter',
    'Last Quarter',
    'This Year',
    'Last Year',
    'Custom Range',
];

export default function ReportsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [selectedDateRange, setSelectedDateRange] = useState('This Month');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">Generate and export financial reports</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Custom Report
                </Button>
            </div>

            {/* Quick Generate */}
            <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">Quick Generate</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Report Type</label>
                        <select
                            value={selectedTemplate || ''}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                        >
                            <option value="" className="bg-[#0a0a0f]">Select a report...</option>
                            {reportTemplates.map((template) => (
                                <option key={template.id} value={template.id} className="bg-[#0a0a0f]">
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Date Range</label>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                        >
                            {dateRanges.map((range) => (
                                <option key={range} value={range} className="bg-[#0a0a0f]">{range}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1.5">Format</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'pdf', icon: File, label: 'PDF' },
                                { id: 'excel', icon: FileSpreadsheet, label: 'Excel' },
                                { id: 'csv', icon: FileText, label: 'CSV' },
                            ].map((format) => {
                                const Icon = format.icon;
                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={`flex-1 p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${selectedFormat === format.id
                                            ? 'border-emerald-500/50 bg-emerald-500/[0.05] text-emerald-400'
                                            : 'border-white/[0.06] text-slate-400 hover:border-white/[0.1]'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm">{format.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button className="gap-2" disabled={!selectedTemplate}>
                        <Download className="w-4 h-4" />
                        Generate Report
                    </Button>
                </div>
            </Card>

            {/* Report Templates */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-300">Report Templates</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTemplates.map((template, i) => {
                        const Icon = template.icon;
                        return (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-5 hover:border-white/[0.08] transition-colors cursor-pointer group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-white/[0.04]">
                                            <Icon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{template.name}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
                                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                Last: {template.lastGenerated}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-between items-center">
                                        <span className="text-xs text-slate-500 px-2 py-0.5 bg-white/[0.02] rounded">
                                            {template.category}
                                        </span>
                                        <button className="text-xs text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Generate <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Reports */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-white/[0.04]">
                    <h2 className="font-medium">Recent Reports</h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                    {recentReports.map((report, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/[0.02]">
                                    {report.format === 'PDF' ? (
                                        <File className="w-5 h-5 text-red-400" />
                                    ) : (
                                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{report.name}</p>
                                    <p className="text-xs text-slate-500">{report.date} • {report.size}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Scheduled Reports */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium">Scheduled Reports</h2>
                    <Button variant="secondary" size="sm">Add Schedule</Button>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No scheduled reports yet</p>
                    <p className="text-xs mt-1">Set up automatic report generation and delivery</p>
                </div>
            </Card>
        </div>
    );
}
