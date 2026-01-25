'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    DollarSign,
    Calendar,
    Clock,
    FileText,
    Building2,
    CreditCard,
    Shield,
    TrendingUp,
    ChevronRight,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Heart,
    Wallet,
    Send,
    Download,
    Settings,
    UserPlus,
    ClipboardList,
    PieChart,
    Banknote,
    Receipt,
    Upload,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { WelcomeTutorial, SetupChecklist, QuickStartCard, VideoTutorialCard } from '@/components/employer/WelcomeTutorial';

// Types
interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    employmentType: 'full-time' | 'part-time' | 'contractor';
    startDate: string;
    salary: number;
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
    status: 'active' | 'pending' | 'offboarding';
    avatar?: string;
    lastPayDate?: string;
    nextPayDate?: string;
    benefits?: {
        health: boolean;
        dental: boolean;
        vision: boolean;
        retirement: boolean;
    };
}

interface PayrollRun {
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    totalGross: number;
    totalTaxes: number;
    totalDeductions: number;
    totalNet: number;
    employeeCount: number;
    status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
}

// Mock data
const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@company.com',
        role: 'Senior Engineer',
        department: 'Engineering',
        employmentType: 'full-time',
        startDate: '2024-03-15',
        salary: 145000,
        payFrequency: 'bi-weekly',
        status: 'active',
        lastPayDate: '2026-01-10',
        nextPayDate: '2026-01-24',
        benefits: { health: true, dental: true, vision: true, retirement: true },
    },
    {
        id: '2',
        name: 'Marcus Johnson',
        email: 'marcus@company.com',
        role: 'Product Designer',
        department: 'Design',
        employmentType: 'full-time',
        startDate: '2024-06-01',
        salary: 125000,
        payFrequency: 'bi-weekly',
        status: 'active',
        lastPayDate: '2026-01-10',
        nextPayDate: '2026-01-24',
        benefits: { health: true, dental: true, vision: false, retirement: true },
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily@company.com',
        role: 'Marketing Manager',
        department: 'Marketing',
        employmentType: 'full-time',
        startDate: '2024-01-20',
        salary: 110000,
        payFrequency: 'bi-weekly',
        status: 'active',
        lastPayDate: '2026-01-10',
        nextPayDate: '2026-01-24',
        benefits: { health: true, dental: false, vision: false, retirement: true },
    },
    {
        id: '4',
        name: 'Alex Kim',
        email: 'alex@contractor.com',
        role: 'DevOps Consultant',
        department: 'Engineering',
        employmentType: 'contractor',
        startDate: '2025-09-01',
        salary: 85, // hourly rate
        payFrequency: 'bi-weekly',
        status: 'active',
        lastPayDate: '2026-01-10',
        nextPayDate: '2026-01-24',
    },
    {
        id: '5',
        name: 'Jordan Taylor',
        email: 'jordan@company.com',
        role: 'Customer Success',
        department: 'Operations',
        employmentType: 'full-time',
        startDate: '2025-11-15',
        salary: 75000,
        payFrequency: 'bi-weekly',
        status: 'pending',
        benefits: { health: true, dental: true, vision: true, retirement: false },
    },
];

const mockPayrollRuns: PayrollRun[] = [
    {
        id: 'pr-001',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-15',
        payDate: '2026-01-17',
        totalGross: 23456.78,
        totalTaxes: 5678.90,
        totalDeductions: 1234.56,
        totalNet: 16543.32,
        employeeCount: 5,
        status: 'completed',
    },
    {
        id: 'pr-002',
        payPeriodStart: '2026-01-16',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-01',
        totalGross: 24123.45,
        totalTaxes: 5890.12,
        totalDeductions: 1289.45,
        totalNet: 16943.88,
        employeeCount: 5,
        status: 'draft',
    },
];

// Navigation tabs
type TabId = 'overview' | 'employees' | 'payroll' | 'benefits' | 'documents' | 'settings';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'employees', label: 'Team', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: Banknote },
    { id: 'benefits', label: 'Benefits', icon: Heart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
];

// Metric Card Component
function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#34d399]/20 transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#34d399]" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-[#34d399]' : 'text-rose-400'}`}>
                        <ArrowUpRight className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-2xl font-semibold text-white mb-1">{value}</p>
            <p className="text-sm text-white/40">{title}</p>
            {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </motion.div>
    );
}

// Overview Tab
function OverviewTab({ employees, payrollRuns }: { employees: Employee[]; payrollRuns: PayrollRun[] }) {
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalPayroll = employees.reduce((sum, e) => {
        if (e.employmentType === 'contractor') return sum;
        return sum + e.salary;
    }, 0);
    const latestPayroll = payrollRuns[0];
    const pendingOnboarding = employees.filter(e => e.status === 'pending').length;

    const upcomingTasks = [
        { id: 1, title: 'Run payroll for Jan 16-31', due: 'Due Jan 31', urgent: true },
        { id: 2, title: 'Complete Jordan Taylor onboarding', due: 'Due Feb 1', urgent: false },
        { id: 3, title: 'Submit Q4 941 tax filing', due: 'Due Jan 31', urgent: true },
        { id: 4, title: 'Review contractor agreements', due: 'Due Feb 15', urgent: false },
    ];

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Employees"
                    value={activeEmployees.toString()}
                    subtitle={`${pendingOnboarding} pending onboarding`}
                    icon={Users}
                    trend="+2 this month"
                    trendUp={true}
                />
                <MetricCard
                    title="Monthly Payroll"
                    value={`$${(totalPayroll / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    subtitle={`Annual: $${totalPayroll.toLocaleString()}`}
                    icon={DollarSign}
                />
                <MetricCard
                    title="Last Payroll Run"
                    value={`$${latestPayroll?.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle={latestPayroll?.payDate}
                    icon={Banknote}
                />
                <MetricCard
                    title="Next Pay Date"
                    value="Feb 1, 2026"
                    subtitle="In 8 days"
                    icon={Calendar}
                />
            </div>

            {/* Quick Actions & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: UserPlus, label: 'Add Employee', color: 'bg-blue-500/10 text-blue-400' },
                            { icon: Send, label: 'Run Payroll', color: 'bg-[#34d399]/10 text-[#34d399]' },
                            { icon: Receipt, label: 'View Reports', color: 'bg-purple-500/10 text-purple-400' },
                            { icon: Upload, label: 'Import Data', color: 'bg-amber-500/10 text-amber-400' },
                        ].map((action) => (
                            <button
                                key={action.label}
                                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
                            >
                                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Upcoming Tasks</h3>
                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {upcomingTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-amber-400' : 'bg-white/20'}`} />
                                    <span className="text-sm text-white/80">{task.title}</span>
                                </div>
                                <span className={`text-xs ${task.urgent ? 'text-amber-400' : 'text-white/40'}`}>{task.due}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Payroll Summary Chart Placeholder */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white">Payroll Expenses (2026)</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">Monthly</Button>
                        <Button variant="ghost" size="sm" className="text-[#34d399]">Quarterly</Button>
                    </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 px-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                        const heights = [85, 0, 0, 0, 0, 0];
                        const height = heights[i] || Math.random() * 30 + 10;
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-[#34d399]/40 to-[#34d399]/80 transition-all hover:from-[#34d399]/50 hover:to-[#34d399]"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-xs text-white/40">{month}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// Employees Tab
function EmployeesTab({ employees }: { employees: Employee[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'full-time' | 'contractor'>('all');

    const filteredEmployees = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || e.employmentType === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-white">Team Members</h2>
                    <p className="text-sm text-white/40">{employees.length} total employees and contractors</p>
                </div>
                <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90 font-medium">
                    <UserPlus className="w-4 h-4" />
                    Add Employee
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#34d399]/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'full-time', 'contractor'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === type
                                ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30'
                                : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            {type === 'all' ? 'All' : type === 'full-time' ? 'Full-time' : 'Contractors'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Employee List */}
            <div className="space-y-3">
                {filteredEmployees.map((employee, index) => (
                    <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34d399]/20 to-[#818cf8]/20 flex items-center justify-center">
                                    <span className="text-lg font-medium text-white">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-white">{employee.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${employee.status === 'active'
                                            ? 'bg-[#34d399]/10 text-[#34d399]'
                                            : employee.status === 'pending'
                                                ? 'bg-amber-400/10 text-amber-400'
                                                : 'bg-rose-400/10 text-rose-400'
                                            }`}>
                                            {employee.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">{employee.role} · {employee.department}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Employment Type */}
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-white/70">
                                        {employee.employmentType === 'contractor'
                                            ? `$${employee.salary}/hr`
                                            : `$${(employee.salary).toLocaleString()}/yr`
                                        }
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {employee.employmentType === 'contractor' ? '1099 Contractor' : 'W-2 Employee'}
                                    </p>
                                </div>

                                {/* Benefits */}
                                {employee.benefits && (
                                    <div className="hidden lg:flex items-center gap-1">
                                        {employee.benefits.health && (
                                            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center" title="Health">
                                                <Heart className="w-3 h-3 text-blue-400" />
                                            </div>
                                        )}
                                        {employee.benefits.retirement && (
                                            <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center" title="401k">
                                                <Wallet className="w-3 h-3 text-purple-400" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <button className="p-2 rounded-lg hover:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all">
                                    <MoreHorizontal className="w-5 h-5 text-white/40" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Payroll Tab
function PayrollTab({ payrollRuns }: { payrollRuns: PayrollRun[] }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-white">Payroll</h2>
                    <p className="text-sm text-white/40">Manage payroll runs and tax filings</p>
                </div>
                <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90 font-medium">
                    <Send className="w-4 h-4" />
                    Run Payroll
                </Button>
            </div>

            {/* Pending Payroll Alert */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="font-medium text-white">Payroll draft ready for review</p>
                        <p className="text-sm text-white/50">Pay period Jan 16 - Jan 31, 2026 · 5 employees</p>
                    </div>
                </div>
                <Button variant="secondary" className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10">
                    Review & Submit
                </Button>
            </motion.div>

            {/* Payroll History */}
            <Card className="overflow-hidden bg-white/[0.02] border-white/[0.06]">
                <div className="p-4 border-b border-white/[0.06]">
                    <h3 className="font-medium text-white">Payroll History</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                    {payrollRuns.map((run, index) => (
                        <motion.div
                            key={run.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${run.status === 'completed'
                                        ? 'bg-[#34d399]/10'
                                        : run.status === 'draft'
                                            ? 'bg-amber-400/10'
                                            : 'bg-blue-400/10'
                                        }`}>
                                        {run.status === 'completed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
                                        ) : run.status === 'draft' ? (
                                            <FileText className="w-5 h-5 text-amber-400" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-blue-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Pay Period: {run.payPeriodStart} to {run.payPeriodEnd}</p>
                                        <p className="text-sm text-white/50">{run.employeeCount} employees · Pay date: {run.payDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-medium text-white">${run.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-xs text-white/40">Net pay</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${run.status === 'completed'
                                        ? 'bg-[#34d399]/10 text-[#34d399]'
                                        : run.status === 'draft'
                                            ? 'bg-amber-400/10 text-amber-400'
                                            : 'bg-blue-400/10 text-blue-400'
                                        }`}>
                                        {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Tax Filing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <h4 className="font-medium text-white">Form 941</h4>
                    </div>
                    <p className="text-sm text-white/50 mb-2">Quarterly Federal Tax Return</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400">Due Jan 31</span>
                        <Button variant="ghost" size="sm" className="text-xs">File Now</Button>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-purple-400" />
                        </div>
                        <h4 className="font-medium text-white">W-2 Forms</h4>
                    </div>
                    <p className="text-sm text-white/50 mb-2">Employee wage statements</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#34d399]">Generated</span>
                        <Button variant="ghost" size="sm" className="text-xs">Download</Button>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-amber-400" />
                        </div>
                        <h4 className="font-medium text-white">1099-NEC</h4>
                    </div>
                    <p className="text-sm text-white/50 mb-2">Contractor payments</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">1 contractor</span>
                        <Button variant="ghost" size="sm" className="text-xs">Generate</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Benefits Tab
function BenefitsTab() {
    const benefitPlans = [
        {
            id: 'health',
            name: 'Health Insurance',
            provider: 'Blue Cross Blue Shield',
            enrolled: 4,
            total: 5,
            monthlyCost: 2400,
            icon: Heart,
            color: 'text-rose-400 bg-rose-400/10',
        },
        {
            id: 'dental',
            name: 'Dental Insurance',
            provider: 'Delta Dental',
            enrolled: 3,
            total: 5,
            monthlyCost: 450,
            icon: Heart,
            color: 'text-blue-400 bg-blue-400/10',
        },
        {
            id: 'vision',
            name: 'Vision Insurance',
            provider: 'VSP Vision',
            enrolled: 2,
            total: 5,
            monthlyCost: 180,
            icon: Heart,
            color: 'text-purple-400 bg-purple-400/10',
        },
        {
            id: '401k',
            name: '401(k) Retirement',
            provider: 'Guideline',
            enrolled: 4,
            total: 5,
            monthlyCost: 0,
            matchPercent: 4,
            icon: Wallet,
            color: 'text-[#34d399] bg-[#34d399]/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-white">Benefits Administration</h2>
                    <p className="text-sm text-white/40">Manage health, dental, vision, and retirement benefits</p>
                </div>
                <Button variant="secondary" className="border-white/10">
                    <Plus className="w-4 h-4" />
                    Add Benefit Plan
                </Button>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitPlans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center`}>
                                        <plan.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{plan.name}</h4>
                                        <p className="text-sm text-white/40">{plan.provider}</p>
                                    </div>
                                </div>
                                <button className="p-1.5 rounded-lg hover:bg-white/[0.05]">
                                    <MoreHorizontal className="w-4 h-4 text-white/40" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/50">Enrolled</span>
                                    <span className="text-sm text-white">{plan.enrolled} of {plan.total} employees</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${plan.color.includes('rose') ? 'bg-rose-400' : plan.color.includes('blue') ? 'bg-blue-400' : plan.color.includes('purple') ? 'bg-purple-400' : 'bg-[#34d399]'}`}
                                        style={{ width: `${(plan.enrolled / plan.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                                    <span className="text-sm text-white/50">
                                        {plan.matchPercent ? `${plan.matchPercent}% employer match` : 'Monthly cost'}
                                    </span>
                                    <span className="text-sm font-medium text-white">
                                        {plan.monthlyCost > 0 ? `$${plan.monthlyCost.toLocaleString()}` : 'Variable'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Open Enrollment Banner */}
            <Card className="p-6 bg-gradient-to-r from-[#34d399]/5 to-[#818cf8]/5 border-[#34d399]/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-medium text-white mb-1">Open Enrollment Period</h3>
                        <p className="text-sm text-white/50">Employees can update their benefit elections during open enrollment.</p>
                    </div>
                    <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                        Configure Enrollment
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// Documents Tab
function DocumentsTab() {
    const documents = [
        { id: 1, name: 'Employee Handbook 2026', type: 'PDF', size: '2.4 MB', date: 'Jan 1, 2026', category: 'Policies' },
        { id: 2, name: 'I-9 Employment Verification', type: 'PDF', size: '156 KB', date: 'Varies', category: 'Compliance' },
        { id: 3, name: 'W-4 Tax Withholding', type: 'PDF', size: '98 KB', date: 'Varies', category: 'Tax Forms' },
        { id: 4, name: 'Direct Deposit Authorization', type: 'PDF', size: '45 KB', date: 'Varies', category: 'Payroll' },
        { id: 5, name: 'Offer Letter Template', type: 'DOCX', size: '32 KB', date: 'Dec 15, 2025', category: 'Templates' },
        { id: 6, name: 'NDA Agreement', type: 'PDF', size: '128 KB', date: 'Oct 1, 2025', category: 'Legal' },
    ];

    const categories = ['All', 'Policies', 'Compliance', 'Tax Forms', 'Payroll', 'Templates', 'Legal'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-white">Documents & Templates</h2>
                    <p className="text-sm text-white/40">Manage HR documents, forms, and templates</p>
                </div>
                <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                    <Upload className="w-4 h-4" />
                    Upload Document
                </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${cat === 'All'
                            ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30'
                            : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Document List */}
            <Card className="overflow-hidden bg-white/[0.02] border-white/[0.06]">
                <div className="divide-y divide-white/[0.04]">
                    {documents.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white/50" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{doc.name}</p>
                                    <p className="text-sm text-white/40">{doc.type} · {doc.size} · {doc.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded-md bg-white/[0.05] text-xs text-white/50">{doc.category}</span>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// Settings Tab
function SettingsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-white">Employer Settings</h2>
                <p className="text-sm text-white/40">Configure your company payroll and HR settings</p>
            </div>

            {/* Company Info */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-white/50 mb-2 block">Company Name</label>
                        <input
                            type="text"
                            defaultValue="Acme Technologies Inc."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#34d399]/50"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/50 mb-2 block">EIN (Tax ID)</label>
                        <input
                            type="text"
                            defaultValue="12-3456789"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#34d399]/50"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/50 mb-2 block">Pay Schedule</label>
                        <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#34d399]/50">
                            <option>Bi-weekly</option>
                            <option>Weekly</option>
                            <option>Semi-monthly</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-white/50 mb-2 block">State</label>
                        <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-[#34d399]/50">
                            <option>California</option>
                            <option>New York</option>
                            <option>Texas</option>
                            <option>Florida</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Bank Connection */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Bank Connection</h3>
                    <span className="px-2 py-1 rounded-full bg-[#34d399]/10 text-[#34d399] text-xs">Connected</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-white">Mercury Business Checking</p>
                        <p className="text-sm text-white/40">****4521 · Connected Jan 15, 2026</p>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Notifications</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Payroll reminders', desc: 'Get notified before each pay period', enabled: true },
                        { label: 'Tax filing deadlines', desc: 'Alerts for upcoming tax deadlines', enabled: true },
                        { label: 'New employee onboarding', desc: 'Notifications when employees complete onboarding', enabled: false },
                        { label: 'Benefits enrollment', desc: 'Open enrollment period alerts', enabled: true },
                    ].map((setting) => (
                        <div key={setting.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm text-white">{setting.label}</p>
                                <p className="text-xs text-white/40">{setting.desc}</p>
                            </div>
                            <button
                                className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-[#34d399]' : 'bg-white/10'
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// Main Component
export default function EmployerDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [employees] = useState(mockEmployees);
    const [payrollRuns] = useState(mockPayrollRuns);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showChecklist, setShowChecklist] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    // Check if user is new (first visit)
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('moneyloop_employer_tutorial_completed');
        const checklistDismissed = localStorage.getItem('moneyloop_employer_checklist_dismissed');

        if (!hasSeenTutorial) {
            setShowTutorial(true);
            setIsNewUser(true);
        }

        if (checklistDismissed) {
            setShowChecklist(false);
        }
    }, []);

    const handleTutorialComplete = () => {
        localStorage.setItem('moneyloop_employer_tutorial_completed', 'true');
        setShowTutorial(false);
    };

    const handleTutorialSkip = () => {
        localStorage.setItem('moneyloop_employer_tutorial_completed', 'true');
        setShowTutorial(false);
    };

    const handleDismissChecklist = () => {
        localStorage.setItem('moneyloop_employer_checklist_dismissed', 'true');
        setShowChecklist(false);
    };

    return (
        <div className="min-h-screen">
            {/* Welcome Tutorial Modal */}
            <AnimatePresence>
                {showTutorial && (
                    <WelcomeTutorial
                        onComplete={handleTutorialComplete}
                        onSkip={handleTutorialSkip}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34d399] to-[#818cf8] flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Employer Hub</h1>
                                <p className="text-xs text-white/40">Payroll, HR & Benefits</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/50 hover:text-white"
                                onClick={() => setShowTutorial(true)}
                            >
                                <ClipboardList className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">Tutorial</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">Export</span>
                            </Button>
                            <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90 text-sm">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline ml-1">New Employee</span>
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 -mb-px overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-[#34d399] text-[#34d399]'
                                    : 'border-transparent text-white/40 hover:text-white/70'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Getting Started Section for new users */}
                {isNewUser && showChecklist && activeTab === 'overview' && (
                    <div className="mb-6">
                        <SetupChecklist onDismiss={handleDismissChecklist} />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && <OverviewTab employees={employees} payrollRuns={payrollRuns} />}
                        {activeTab === 'employees' && <EmployeesTab employees={employees} />}
                        {activeTab === 'payroll' && <PayrollTab payrollRuns={payrollRuns} />}
                        {activeTab === 'benefits' && <BenefitsTab />}
                        {activeTab === 'documents' && <DocumentsTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
