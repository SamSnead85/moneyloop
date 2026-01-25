'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Banknote,
    Calendar,
    Clock,
    DollarSign,
    Send,
    CheckCircle2,
    AlertCircle,
    FileText,
    Download,
    ChevronRight,
    Users,
    TrendingUp,
    ArrowUpRight,
    Calculator,
    Eye,
    Play,
    Pause,
    RotateCcw,
    Building2,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { RunPayrollModal } from '@/components/employer/RunPayrollModal';

// Types
interface PayrollRun {
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    checkDate: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
    employeeCount: number;
    contractorCount: number;
    totals: {
        grossPay: number;
        employeeTaxes: number;
        employerTaxes: number;
        deductions: number;
        netPay: number;
        totalCost: number;
    };
    createdAt: string;
    submittedAt?: string;
    processedAt?: string;
}

interface TaxFiling {
    id: string;
    type: 'form_941' | 'form_940' | 'w2' | '1099_nec' | 'state_unemployment';
    period: string;
    dueDate: string;
    status: 'upcoming' | 'due_soon' | 'overdue' | 'filed' | 'accepted';
    amount?: number;
    filedDate?: string;
}

// Mock Data
const mockPayrollRuns: PayrollRun[] = [
    {
        id: 'pr-003',
        payPeriodStart: '2026-01-16',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-01',
        checkDate: '2026-02-03',
        status: 'draft',
        employeeCount: 5,
        contractorCount: 1,
        totals: {
            grossPay: 24567.89,
            employeeTaxes: 5234.56,
            employerTaxes: 2345.67,
            deductions: 1890.12,
            netPay: 17443.21,
            totalCost: 26913.56,
        },
        createdAt: '2026-01-25T10:00:00Z',
    },
    {
        id: 'pr-002',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-15',
        payDate: '2026-01-17',
        checkDate: '2026-01-17',
        status: 'completed',
        employeeCount: 5,
        contractorCount: 1,
        totals: {
            grossPay: 23456.78,
            employeeTaxes: 5012.34,
            employerTaxes: 2234.56,
            deductions: 1780.45,
            netPay: 16663.99,
            totalCost: 25691.34,
        },
        createdAt: '2026-01-10T10:00:00Z',
        submittedAt: '2026-01-15T14:30:00Z',
        processedAt: '2026-01-17T06:00:00Z',
    },
    {
        id: 'pr-001',
        payPeriodStart: '2025-12-16',
        payPeriodEnd: '2025-12-31',
        payDate: '2026-01-02',
        checkDate: '2026-01-02',
        status: 'completed',
        employeeCount: 4,
        contractorCount: 1,
        totals: {
            grossPay: 22123.45,
            employeeTaxes: 4756.78,
            employerTaxes: 2123.45,
            deductions: 1650.00,
            netPay: 15716.67,
            totalCost: 24246.90,
        },
        createdAt: '2025-12-26T10:00:00Z',
        submittedAt: '2025-12-30T09:00:00Z',
        processedAt: '2026-01-02T06:00:00Z',
    },
];

const mockTaxFilings: TaxFiling[] = [
    { id: 'tf-1', type: 'form_941', period: 'Q4 2025', dueDate: '2026-01-31', status: 'due_soon', amount: 15678.90 },
    { id: 'tf-2', type: 'w2', period: '2025', dueDate: '2026-01-31', status: 'filed', filedDate: '2026-01-15' },
    { id: 'tf-3', type: '1099_nec', period: '2025', dueDate: '2026-01-31', status: 'filed', filedDate: '2026-01-15' },
    { id: 'tf-4', type: 'form_940', period: '2025', dueDate: '2026-01-31', status: 'due_soon', amount: 2345.67 },
    { id: 'tf-5', type: 'state_unemployment', period: 'Q4 2025', dueDate: '2026-01-31', status: 'upcoming' },
    { id: 'tf-6', type: 'form_941', period: 'Q1 2026', dueDate: '2026-04-30', status: 'upcoming' },
];

// Payroll Run Card
function PayrollRunCard({ run, isLatest }: { run: PayrollRun; isLatest?: boolean }) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'draft':
                return { color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: FileText, label: 'Draft' };
            case 'pending_approval':
                return { color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: Clock, label: 'Pending Approval' };
            case 'approved':
                return { color: 'bg-purple-400/10 text-purple-400 border-purple-400/20', icon: CheckCircle2, label: 'Approved' };
            case 'processing':
                return { color: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20', icon: Clock, label: 'Processing' };
            case 'completed':
                return { color: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20', icon: CheckCircle2, label: 'Completed' };
            case 'failed':
                return { color: 'bg-rose-400/10 text-rose-400 border-rose-400/20', icon: AlertCircle, label: 'Failed' };
            default:
                return { color: 'bg-white/10 text-white/60', icon: FileText, label: status };
        }
    };

    const statusConfig = getStatusConfig(run.status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-white/[0.15] ${isLatest && run.status === 'draft'
                ? 'bg-gradient-to-r from-amber-400/5 to-orange-400/5 border-amber-400/20'
                : 'bg-white/[0.02] border-white/[0.06]'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">Pay Period: {run.payPeriodStart} to {run.payPeriodEnd}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                    <p className="text-sm text-white/50">
                        {run.employeeCount} employees{run.contractorCount > 0 && `, ${run.contractorCount} contractor`} · Pay date: {run.payDate}
                    </p>
                </div>
                {run.status === 'draft' && (
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Send className="w-4 h-4" />
                        Review & Submit
                    </Button>
                )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                    { label: 'Gross Pay', value: run.totals.grossPay },
                    { label: 'Employee Taxes', value: run.totals.employeeTaxes },
                    { label: 'Deductions', value: run.totals.deductions },
                    { label: 'Net Pay', value: run.totals.netPay, highlight: true },
                    { label: 'Total Cost', value: run.totals.totalCost, subtle: true },
                ].map((item) => (
                    <div key={item.label}>
                        <p className="text-xs text-white/40 mb-1">{item.label}</p>
                        <p className={`font-medium ${item.highlight ? 'text-[#34d399]' : item.subtle ? 'text-white/50' : 'text-white'}`}>
                            ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// Tax Filing Card
function TaxFilingCard({ filing }: { filing: TaxFiling }) {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'form_941': return 'Form 941';
            case 'form_940': return 'Form 940';
            case 'w2': return 'W-2';
            case '1099_nec': return '1099-NEC';
            case 'state_unemployment': return 'State Unemployment';
            default: return type;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'due_soon': return { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertCircle };
            case 'overdue': return { color: 'text-rose-400', bg: 'bg-rose-400/10', icon: AlertCircle };
            case 'filed': return { color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', icon: CheckCircle2 };
            case 'accepted': return { color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', icon: CheckCircle2 };
            default: return { color: 'text-white/40', bg: 'bg-white/[0.05]', icon: Clock };
        }
    };

    const statusConfig = getStatusConfig(filing.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Card className="p-4 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                    </div>
                    <div>
                        <h4 className="font-medium text-white">{getTypeLabel(filing.type)}</h4>
                        <p className="text-xs text-white/40">{filing.period}</p>
                    </div>
                </div>
                <div className="text-right">
                    {filing.amount && (
                        <p className="text-sm font-medium text-white">${filing.amount.toLocaleString()}</p>
                    )}
                    <p className={`text-xs ${filing.status === 'filed' ? 'text-[#34d399]' : statusConfig.color}`}>
                        {filing.status === 'filed' ? `Filed ${filing.filedDate}` : `Due ${filing.dueDate}`}
                    </p>
                </div>
            </div>
        </Card>
    );
}

// Main Component
export default function PayrollPage() {
    const [payrollRuns] = useState(mockPayrollRuns);
    const [taxFilings] = useState(mockTaxFilings);
    const [showRunPayroll, setShowRunPayroll] = useState(false);

    const currentDraft = payrollRuns.find(r => r.status === 'draft');
    const completedRuns = payrollRuns.filter(r => r.status === 'completed');

    const ytdTotals = completedRuns.reduce((acc, run) => ({
        grossPay: acc.grossPay + run.totals.grossPay,
        taxes: acc.taxes + run.totals.employeeTaxes + run.totals.employerTaxes,
        netPay: acc.netPay + run.totals.netPay,
    }), { grossPay: 0, taxes: 0, netPay: 0 });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Payroll</h1>
                    <p className="text-white/50">Run payroll and manage tax filings</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setShowRunPayroll(true)}
                        className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    >
                        <Play className="w-4 h-4" />
                        Run Payroll
                    </Button>
                </div>
            </div>

            {/* YTD Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'YTD Gross Payroll',
                        value: `$${ytdTotals.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: DollarSign,
                        color: 'text-[#0ea5e9]',
                        trend: '+12.5%',
                    },
                    {
                        label: 'YTD Taxes Withheld',
                        value: `$${ytdTotals.taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: Building2,
                        color: 'text-purple-400',
                    },
                    {
                        label: 'YTD Net Disbursed',
                        value: `$${ytdTotals.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: Banknote,
                        color: 'text-[#34d399]',
                    },
                ].map((stat) => (
                    <Card key={stat.label} className="p-5 bg-white/[0.02] border-white/[0.06]">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            {stat.trend && (
                                <div className="flex items-center gap-1 text-xs text-[#34d399]">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
                        <p className="text-sm text-white/40">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Current/Draft Payroll */}
            {currentDraft && (
                <div>
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        Pending Payroll
                    </h2>
                    <PayrollRunCard run={currentDraft} isLatest />
                </div>
            )}

            {/* Tax Filings */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Tax Filings & Forms</h2>
                    <Button variant="ghost" className="text-[#0ea5e9]">
                        View All <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taxFilings.slice(0, 6).map((filing) => (
                        <TaxFilingCard key={filing.id} filing={filing} />
                    ))}
                </div>
            </div>

            {/* Payroll History */}
            <div>
                <h2 className="text-lg font-medium text-white mb-4">Payroll History</h2>
                <div className="space-y-3">
                    {completedRuns.map((run) => (
                        <PayrollRunCard key={run.id} run={run} />
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: Calculator, label: 'Paycheck Calculator', desc: 'Preview net pay' },
                        { icon: FileText, label: 'Pay Stubs', desc: 'View & download' },
                        { icon: RotateCcw, label: 'Off-Cycle Payroll', desc: 'Bonus or correction' },
                        { icon: Eye, label: 'Payroll Reports', desc: 'Analytics & exports' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left group"
                        >
                            <action.icon className="w-6 h-6 text-[#0ea5e9] mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-medium text-white">{action.label}</p>
                            <p className="text-xs text-white/40">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
}
