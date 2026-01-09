'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    ChevronLeft,
    ChevronRight,
    Printer,
    Share2,
    Filter,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface MonthlyReportData {
    month: string; // YYYY-MM
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    netWorth: number;
    netWorthChange: number;
    topCategories: Array<{
        name: string;
        amount: number;
        percentage: number;
        trend: number;
    }>;
    budgetStatus: {
        onTrack: number;
        overBudget: number;
        total: number;
    };
    goalsProgress: {
        completed: number;
        inProgress: number;
        totalContributed: number;
    };
    transactionCount: number;
    averageTransaction: number;
}

interface MonthlySummaryReportProps {
    data: MonthlyReportData;
    previousMonth?: MonthlyReportData;
    onMonthChange?: (month: string) => void;
    onExport?: (format: 'pdf' | 'csv') => void;
    onPrint?: () => void;
    className?: string;
}

// ===== COMPONENT =====

export function MonthlySummaryReport({
    data,
    previousMonth,
    onMonthChange,
    onExport,
    onPrint,
    className,
}: MonthlySummaryReportProps) {
    const monthDate = new Date(data.month + '-01');
    const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const getChangePercent = (current: number, previous?: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const incomeChange = getChangePercent(data.income, previousMonth?.income);
    const expenseChange = getChangePercent(data.expenses, previousMonth?.expenses);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const date = new Date(data.month + '-01');
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        onMonthChange?.(date.toISOString().slice(0, 7));
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <Text variant="heading-lg">Monthly Summary</Text>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigateMonth('prev')}
                                    className="p-1 rounded hover:bg-[var(--surface-elevated)]"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <Text variant="body-md" color="tertiary">{monthLabel}</Text>
                                <button
                                    onClick={() => navigateMonth('next')}
                                    className="p-1 rounded hover:bg-[var(--surface-elevated)]"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="text-sm">Print</span>
                        </button>
                        <button
                            onClick={() => onExport?.('pdf')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--accent-primary-subtle)]">
                        <Text variant="body-sm" color="tertiary">Total Income</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                            +{formatCurrency(data.income)}
                        </Text>
                        {incomeChange !== 0 && (
                            <div className={cn(
                                'flex items-center gap-1 mt-1',
                                incomeChange > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                            )}>
                                {incomeChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <Text variant="caption">{Math.abs(incomeChange).toFixed(1)}% vs last month</Text>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--accent-danger-subtle)]">
                        <Text variant="body-sm" color="tertiary">Total Expenses</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-danger)]">
                            -{formatCurrency(data.expenses)}
                        </Text>
                        {expenseChange !== 0 && (
                            <div className={cn(
                                'flex items-center gap-1 mt-1',
                                expenseChange < 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                            )}>
                                {expenseChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                <Text variant="caption">{Math.abs(expenseChange).toFixed(1)}% vs last month</Text>
                            </div>
                        )}
                    </div>

                    <div className={cn(
                        'p-4 rounded-xl',
                        data.savings >= 0 ? 'bg-[var(--accent-success-subtle)]' : 'bg-[var(--accent-danger-subtle)]'
                    )}>
                        <Text variant="body-sm" color="tertiary">Net Savings</Text>
                        <Text variant="heading-md" className={cn(
                            'font-mono',
                            data.savings >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                        )}>
                            {data.savings >= 0 ? '+' : ''}{formatCurrency(data.savings)}
                        </Text>
                        <Text variant="caption" color="tertiary" className="mt-1">
                            {data.savingsRate.toFixed(0)}% savings rate
                        </Text>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Net Worth</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(data.netWorth)}
                        </Text>
                        <div className={cn(
                            'flex items-center gap-1 mt-1',
                            data.netWorthChange >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                        )}>
                            {data.netWorthChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <Text variant="caption">{data.netWorthChange >= 0 ? '+' : ''}{formatCurrency(data.netWorthChange)}</Text>
                        </div>
                    </div>
                </div>
            </Surface>

            {/* Spending by Category */}
            <Surface elevation={1} className="p-6">
                <Text variant="heading-md" className="mb-4">Spending by Category</Text>
                <div className="space-y-4">
                    {data.topCategories.map((cat, i) => (
                        <div key={cat.name}>
                            <div className="flex items-center justify-between mb-2">
                                <Text variant="body-md">{cat.name}</Text>
                                <div className="flex items-center gap-3">
                                    <Text variant="mono-sm">{formatCurrency(cat.amount)}</Text>
                                    <Badge variant={cat.trend < 0 ? 'success' : cat.trend > 10 ? 'warning' : 'default'} size="sm">
                                        {cat.trend >= 0 ? '+' : ''}{cat.trend.toFixed(0)}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress value={cat.percentage} size="sm" />
                        </div>
                    ))}
                </div>
            </Surface>

            {/* Budget & Goals Summary */}
            <div className="grid grid-cols-2 gap-6">
                <Surface elevation={1} className="p-6">
                    <Text variant="heading-md" className="mb-4">Budget Status</Text>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[var(--accent-success-subtle)] text-center">
                            <Text variant="heading-lg" className="text-[var(--accent-success)]">
                                {data.budgetStatus.onTrack}
                            </Text>
                            <Text variant="body-sm" color="tertiary">On Track</Text>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--accent-danger-subtle)] text-center">
                            <Text variant="heading-lg" className="text-[var(--accent-danger)]">
                                {data.budgetStatus.overBudget}
                            </Text>
                            <Text variant="body-sm" color="tertiary">Over Budget</Text>
                        </div>
                    </div>
                    <Text variant="body-sm" color="tertiary" className="mt-4 text-center">
                        {data.budgetStatus.total} total budget categories
                    </Text>
                </Surface>

                <Surface elevation={1} className="p-6">
                    <Text variant="heading-md" className="mb-4">Goals Progress</Text>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Text variant="body-sm" color="tertiary">Completed this month</Text>
                            <Text variant="body-md" className="font-medium">{data.goalsProgress.completed}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text variant="body-sm" color="tertiary">In progress</Text>
                            <Text variant="body-md" className="font-medium">{data.goalsProgress.inProgress}</Text>
                        </div>
                        <Divider />
                        <div className="flex justify-between">
                            <Text variant="body-sm" color="tertiary">Total contributed</Text>
                            <Text variant="mono-md" className="text-[var(--accent-primary)]">
                                {formatCurrency(data.goalsProgress.totalContributed)}
                            </Text>
                        </div>
                    </div>
                </Surface>
            </div>

            {/* Transaction Stats */}
            <Surface elevation={1} className="p-6">
                <Text variant="heading-md" className="mb-4">Transaction Statistics</Text>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <Text variant="heading-lg" className="font-mono">{data.transactionCount}</Text>
                        <Text variant="body-sm" color="tertiary">Total Transactions</Text>
                    </div>
                    <div className="text-center">
                        <Text variant="heading-lg" className="font-mono">{formatCurrency(data.averageTransaction)}</Text>
                        <Text variant="body-sm" color="tertiary">Average Transaction</Text>
                    </div>
                    <div className="text-center">
                        <Text variant="heading-lg" className="font-mono">
                            {(data.transactionCount / 30).toFixed(1)}
                        </Text>
                        <Text variant="body-sm" color="tertiary">Transactions/Day</Text>
                    </div>
                </div>
            </Surface>
        </div>
    );
}

// ===== EXPORT WIZARD =====

export interface ExportOptions {
    format: 'csv' | 'pdf' | 'json';
    dateRange: { start: string; end: string };
    includeCategories: boolean;
    includeTags: boolean;
    includeNotes: boolean;
    includeAccounts: boolean;
}

interface ExportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => void;
    loading?: boolean;
}

export function ExportWizard({ isOpen, onClose, onExport, loading }: ExportWizardProps) {
    const [options, setOptions] = useState<ExportOptions>({
        format: 'csv',
        dateRange: {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
            end: new Date().toISOString().slice(0, 10),
        },
        includeCategories: true,
        includeTags: true,
        includeNotes: false,
        includeAccounts: true,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Surface elevation={2} className="w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <Text variant="heading-lg">Export Data</Text>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Format */}
                    <div>
                        <Text variant="body-sm" color="tertiary" className="mb-3 block">Format</Text>
                        <div className="flex gap-2">
                            {(['csv', 'pdf', 'json'] as const).map(format => (
                                <button
                                    key={format}
                                    onClick={() => setOptions(o => ({ ...o, format }))}
                                    className={cn(
                                        'flex-1 py-3 rounded-xl text-sm font-medium uppercase transition-colors',
                                        options.format === format
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                                    )}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <Text variant="body-sm" color="tertiary" className="mb-3 block">Date Range</Text>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={options.dateRange.start}
                                onChange={e => setOptions(o => ({ ...o, dateRange: { ...o.dateRange, start: e.target.value } }))}
                                className="px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)]"
                            />
                            <input
                                type="date"
                                value={options.dateRange.end}
                                onChange={e => setOptions(o => ({ ...o, dateRange: { ...o.dateRange, end: e.target.value } }))}
                                className="px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)]"
                            />
                        </div>
                    </div>

                    {/* Include Options */}
                    <div>
                        <Text variant="body-sm" color="tertiary" className="mb-3 block">Include</Text>
                        <div className="space-y-2">
                            {[
                                { key: 'includeCategories', label: 'Categories' },
                                { key: 'includeTags', label: 'Tags' },
                                { key: 'includeNotes', label: 'Notes' },
                                { key: 'includeAccounts', label: 'Account names' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(options as any)[key]}
                                        onChange={e => setOptions(o => ({ ...o, [key]: e.target.checked }))}
                                        className="w-4 h-4 rounded"
                                    />
                                    <Text variant="body-sm">{label}</Text>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onExport(options)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {loading ? 'Exporting...' : 'Export'}
                        </button>
                    </div>
                </div>
            </Surface>
        </div>
    );
}

export default MonthlySummaryReport;
