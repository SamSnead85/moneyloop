'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Clock,
    Download,
    Calendar,
    Filter,
    ChevronDown,
    FileText,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface ReportMetric {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    format?: 'currency' | 'percent' | 'number';
}

interface ReportCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    description: string;
}

// Report Categories
const reportCategories: ReportCategory[] = [
    { id: 'payroll', label: 'Payroll', icon: DollarSign, description: 'Payroll costs, taxes, and trends' },
    { id: 'workforce', label: 'Workforce', icon: Users, description: 'Headcount, turnover, demographics' },
    { id: 'time', label: 'Time & Attendance', icon: Clock, description: 'Hours worked, overtime, absences' },
    { id: 'benefits', label: 'Benefits', icon: PieChart, description: 'Enrollment, costs, utilization' },
    { id: 'compliance', label: 'Compliance', icon: FileText, description: 'Tax filings, audits, deadlines' },
];

// Mock Data
const payrollMetrics: ReportMetric[] = [
    { label: 'Total Payroll (YTD)', value: 245678.90, change: 12.5, trend: 'up', format: 'currency' },
    { label: 'Avg. Salary', value: 98500, change: 5.2, trend: 'up', format: 'currency' },
    { label: 'Tax Burden', value: 52345.67, change: -2.1, trend: 'down', format: 'currency' },
    { label: 'Benefits Cost', value: 28900, change: 8.4, trend: 'up', format: 'currency' },
];

const workforceMetrics: ReportMetric[] = [
    { label: 'Total Headcount', value: 24, change: 4, trend: 'up', format: 'number' },
    { label: 'Turnover Rate', value: 8.5, change: -2.3, trend: 'down', format: 'percent' },
    { label: 'Avg. Tenure', value: '2.4 yrs', trend: 'neutral' },
    { label: 'Open Positions', value: 3, change: 1, trend: 'up', format: 'number' },
];

const timeMetrics: ReportMetric[] = [
    { label: 'Avg. Hours/Week', value: 38.5, change: -1.2, trend: 'down', format: 'number' },
    { label: 'Overtime Hours (Mo)', value: 45, change: 15, trend: 'up', format: 'number' },
    { label: 'Absence Rate', value: 3.2, change: -0.5, trend: 'down', format: 'percent' },
    { label: 'PTO Utilization', value: 65, change: 8, trend: 'up', format: 'percent' },
];

// Saved Reports
const savedReports = [
    { id: '1', name: 'Monthly Payroll Summary', lastRun: '2026-01-24', schedule: 'Monthly' },
    { id: '2', name: 'Quarterly Tax Report', lastRun: '2026-01-15', schedule: 'Quarterly' },
    { id: '3', name: 'Headcount by Department', lastRun: '2026-01-20', schedule: 'Weekly' },
    { id: '4', name: 'Overtime Analysis', lastRun: '2026-01-22', schedule: 'Bi-weekly' },
];

// Department breakdown (mock)
const departmentBreakdown = [
    { name: 'Engineering', count: 8, color: 'bg-[#0ea5e9]', percent: 33 },
    { name: 'Design', count: 4, color: 'bg-purple-400', percent: 17 },
    { name: 'Marketing', count: 3, color: 'bg-amber-400', percent: 13 },
    { name: 'Sales', count: 5, color: 'bg-[#34d399]', percent: 21 },
    { name: 'Operations', count: 4, color: 'bg-rose-400', percent: 16 },
];

// Metric Card
function MetricCard({ metric }: { metric: ReportMetric }) {
    const formatValue = (value: string | number, format?: string) => {
        if (typeof value === 'string') return value;
        if (format === 'currency') return `$${value.toLocaleString()}`;
        if (format === 'percent') return `${value}%`;
        return value.toLocaleString();
    };

    return (
        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
            <p className="text-sm text-white/40 mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-white">
                    {formatValue(metric.value, metric.format)}
                </p>
                {metric.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-[#34d399]' : metric.trend === 'down' ? 'text-rose-400' : 'text-white/40'
                        }`}>
                        {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                            metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                        {Math.abs(metric.change)}{metric.format === 'percent' || metric.format === 'number' ? '%' : ''}
                    </div>
                )}
            </div>
        </Card>
    );
}

// Bar Chart (simple visual)
function SimpleBarChart({ data }: { data: typeof departmentBreakdown }) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white">{item.name}</span>
                        <span className="text-white/40">{item.count} ({item.percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percent}%` }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                            className={`h-full rounded-full ${item.color}`}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// Main Component
export default function ReportsPage() {
    const [selectedCategory, setSelectedCategory] = useState('payroll');
    const [dateRange, setDateRange] = useState('This Month');

    const getMetricsForCategory = () => {
        switch (selectedCategory) {
            case 'payroll': return payrollMetrics;
            case 'workforce': return workforceMetrics;
            case 'time': return timeMetrics;
            default: return payrollMetrics;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                    <p className="text-white/50">Insights across your workforce and payroll</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50"
                        >
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Quarter</option>
                            <option>This Year</option>
                            <option>Custom Range</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                    <Button variant="secondary" className="border-white/10">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Sparkles className="w-4 h-4" />
                        New Report
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {reportCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {getMetricsForCategory().map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Headcount by Department */}
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-white">Headcount by Department</h3>
                        <Button variant="ghost" size="sm" className="text-white/40">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                    <SimpleBarChart data={departmentBreakdown} />
                </Card>

                {/* Payroll Trend */}
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-white">Monthly Payroll Trend</h3>
                        <span className="text-sm text-white/40">2025-2026</span>
                    </div>
                    {/* Simple trend visualization */}
                    <div className="h-40 flex items-end gap-2">
                        {[65, 72, 68, 80, 75, 82, 78, 85, 90, 88, 95, 92].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                className={`flex-1 rounded-t ${i === 11 ? 'bg-[#0ea5e9]' : 'bg-white/[0.08]'}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-white/30">
                        <span>Feb</span>
                        <span>May</span>
                        <span>Aug</span>
                        <span>Nov</span>
                        <span>Jan</span>
                    </div>
                </Card>
            </div>

            {/* Saved Reports */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Saved Reports</h3>
                    <Button variant="ghost" size="sm" className="text-[#0ea5e9]">
                        View all
                    </Button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                    {savedReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{report.name}</p>
                                    <p className="text-xs text-white/40">Last run: {report.lastRun}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-1 rounded">
                                    {report.schedule}
                                </span>
                                <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* AI Insights */}
            <Card className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#8b5cf6]/10 border-[#0ea5e9]/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white mb-2">AI Insights</h3>
                        <div className="space-y-2 text-sm text-white/70">
                            <p>• <strong>Overtime is up 15%</strong> this month. Consider hiring for the Engineering team to reduce burden.</p>
                            <p>• <strong>Turnover decreased to 8.5%</strong> - below industry average. Your retention strategies are working.</p>
                            <p>• <strong>PTO utilization increased</strong> - employees are taking more time off, which correlates with higher productivity.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-4 text-[#0ea5e9]">
                            Get detailed analysis <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
