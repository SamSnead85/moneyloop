'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    CreditCard,
    PiggyBank,
    Bell,
    Settings,
    Plus,
    Search,
    ChevronDown,
    Lightbulb,
    Receipt,
    ArrowUpRight,
    Calendar,
    BarChart3,
} from 'lucide-react';
import { Surface, Text, Badge, Avatar, Skeleton } from '@/components/primitives';
import {
    MetricCard,
    BentoGrid,
    BentoCard,
    WidgetCard,
    QuickAction,
    TransactionRow,
    AccountRow,
    InsightCard,
} from './DashboardPrimitives';
import {
    Sparkline,
    DonutChart,
    AreaChart,
} from './PremiumCharts';

interface DashboardData {
    user?: {
        name: string;
        avatar?: string;
    };
    netWorth?: number;
    netWorthTrend?: number;
    cashFlow?: number;
    monthlySpending?: number;
    savingsRate?: number;
    accounts?: Array<{
        id: string;
        name: string;
        institution: string;
        balance: number;
        type: 'checking' | 'savings' | 'credit' | 'investment';
        logo?: string;
    }>;
    transactions?: Array<{
        id: string;
        merchant: string;
        category: string;
        amount: number;
        date: string;
        type: 'expense' | 'income';
    }>;
    spendingByCategory?: Array<{
        category: string;
        amount: number;
        color: string;
    }>;
    netWorthHistory?: Array<{
        date: string;
        value: number;
    }>;
    insights?: Array<{
        id: string;
        type: 'info' | 'success' | 'warning' | 'danger';
        title: string;
        description: string;
    }>;
}

interface PremiumDashboardProps {
    data?: DashboardData;
    loading?: boolean;
}

// Sample data for demonstration
const sampleData: DashboardData = {
    user: { name: 'Sam' },
    netWorth: 127450,
    netWorthTrend: 4.2,
    cashFlow: 2340,
    monthlySpending: 4850,
    savingsRate: 32,
    accounts: [
        { id: '1', name: 'Primary Checking', institution: 'Chase', balance: 12450, type: 'checking' },
        { id: '2', name: 'High-Yield Savings', institution: 'Marcus', balance: 45000, type: 'savings' },
        { id: '3', name: 'Sapphire Reserve', institution: 'Chase', balance: -2340, type: 'credit' },
        { id: '4', name: 'Brokerage', institution: 'Fidelity', balance: 72340, type: 'investment' },
    ],
    transactions: [
        { id: '1', merchant: 'Whole Foods', category: 'Groceries', amount: 127, date: 'Today', type: 'expense' },
        { id: '2', merchant: 'Uber', category: 'Transportation', amount: 24, date: 'Today', type: 'expense' },
        { id: '3', merchant: 'Payroll Deposit', category: 'Income', amount: 4250, date: 'Yesterday', type: 'income' },
        { id: '4', merchant: 'Netflix', category: 'Entertainment', amount: 15, date: 'Dec 15', type: 'expense' },
        { id: '5', merchant: 'Electric Company', category: 'Utilities', amount: 145, date: 'Dec 14', type: 'expense' },
    ],
    spendingByCategory: [
        { category: 'Housing', amount: 2100, color: 'var(--chart-3)' },
        { category: 'Food', amount: 850, color: 'var(--chart-1)' },
        { category: 'Transport', amount: 420, color: 'var(--chart-4)' },
        { category: 'Utilities', amount: 280, color: 'var(--chart-5)' },
        { category: 'Entertainment', amount: 200, color: 'var(--chart-7)' },
        { category: 'Other', amount: 1000, color: 'var(--chart-6)' },
    ],
    netWorthHistory: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: 100000 + i * 2500 + Math.random() * 5000,
    })),
    insights: [
        {
            id: '1',
            type: 'success',
            title: 'Great savings rate!',
            description: 'You\'re saving 32% of your income, above the recommended 20%.',
        },
        {
            id: '2',
            type: 'warning',
            title: 'Credit card due soon',
            description: 'Chase Sapphire payment of $2,340 is due in 5 days.',
        },
    ],
};

export function PremiumDashboard({ data = sampleData, loading = false }: PremiumDashboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('This Month');

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-[var(--surface-base)] pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--surface-base)]/80 border-b border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Greeting */}
                        <div>
                            <Text variant="body-sm" color="tertiary">
                                {greeting()}, {data.user?.name || 'there'}
                            </Text>
                            <Text variant="heading-md" as="h1">
                                Your Financial Overview
                            </Text>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <button className="p-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors">
                                <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors">
                                <Bell className="w-5 h-5 text-[var(--text-tertiary)]" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                            </button>

                            {/* Avatar */}
                            <Avatar
                                name={data.user?.name}
                                src={data.user?.avatar}
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Period Selector */}
                <div className="flex items-center justify-between mb-6">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors">
                        <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                        <Text variant="body-md">{selectedPeriod}</Text>
                        <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:brightness-110 transition-all">
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </button>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        label="Net Worth"
                        value={data.netWorth || 0}
                        trend={{ value: data.netWorthTrend || 0, period: 'vs last month' }}
                        icon={Wallet}
                        variant="success"
                        loading={loading}
                    />
                    <MetricCard
                        label="Monthly Cash Flow"
                        value={data.cashFlow || 0}
                        icon={TrendingUp}
                        variant={(data.cashFlow || 0) >= 0 ? 'success' : 'danger'}
                        loading={loading}
                    />
                    <MetricCard
                        label="Monthly Spending"
                        value={data.monthlySpending || 0}
                        icon={CreditCard}
                        loading={loading}
                    />
                    <MetricCard
                        label="Savings Rate"
                        value={`${data.savingsRate || 0}%`}
                        icon={PiggyBank}
                        variant={(data.savingsRate || 0) >= 20 ? 'success' : 'warning'}
                        loading={loading}
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Net Worth Chart */}
                        <WidgetCard
                            title="Net Worth Trend"
                            subtitle="Last 12 months"
                            action={
                                <button className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                                    <BarChart3 className="w-4 h-4" />
                                    Details
                                </button>
                            }
                            loading={loading}
                        >
                            {data.netWorthHistory && (
                                <AreaChart
                                    data={data.netWorthHistory}
                                    height={220}
                                    color="var(--accent-primary)"
                                />
                            )}
                        </WidgetCard>

                        {/* Spending Breakdown */}
                        <WidgetCard
                            title="Spending Breakdown"
                            subtitle={selectedPeriod}
                            loading={loading}
                        >
                            {data.spendingByCategory && (
                                <DonutChart
                                    data={data.spendingByCategory.map(c => ({
                                        label: c.category,
                                        value: c.amount,
                                        color: c.color,
                                    }))}
                                    size={140}
                                    thickness={18}
                                    centerValue={`$${(data.monthlySpending || 0).toLocaleString()}`}
                                    centerLabel="Total"
                                />
                            )}
                        </WidgetCard>

                        {/* Recent Transactions */}
                        <WidgetCard
                            title="Recent Transactions"
                            action={
                                <button className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline">
                                    View all
                                    <ArrowUpRight className="w-3 h-3" />
                                </button>
                            }
                            loading={loading}
                        >
                            <div className="-mx-5 px-5">
                                {data.transactions?.slice(0, 5).map((tx) => (
                                    <TransactionRow
                                        key={tx.id}
                                        merchant={tx.merchant}
                                        category={tx.category}
                                        amount={tx.amount}
                                        date={tx.date}
                                        type={tx.type}
                                    />
                                ))}
                            </div>
                        </WidgetCard>
                    </div>

                    {/* Right Column - Accounts & Insights */}
                    <div className="space-y-6">
                        {/* Accounts */}
                        <WidgetCard
                            title="Accounts"
                            action={
                                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors">
                                    <Plus className="w-4 h-4 text-[var(--text-tertiary)]" />
                                </button>
                            }
                            loading={loading}
                        >
                            <div className="-mx-5 px-5">
                                {data.accounts?.map((account) => (
                                    <AccountRow
                                        key={account.id}
                                        name={account.name}
                                        institution={account.institution}
                                        balance={account.balance}
                                        type={account.type}
                                        logo={account.logo}
                                    />
                                ))}
                            </div>
                        </WidgetCard>

                        {/* AI Insights */}
                        <WidgetCard
                            title="Insights"
                            subtitle="AI-powered recommendations"
                            loading={loading}
                        >
                            <div className="space-y-3">
                                {data.insights?.map((insight) => (
                                    <InsightCard
                                        key={insight.id}
                                        icon={Lightbulb}
                                        title={insight.title}
                                        description={insight.description}
                                        variant={insight.type}
                                    />
                                ))}
                            </div>
                        </WidgetCard>

                        {/* Quick Actions */}
                        <WidgetCard title="Quick Actions" loading={loading}>
                            <div className="space-y-2">
                                <QuickAction
                                    label="Add Transaction"
                                    icon={Receipt}
                                    onClick={() => { }}
                                    variant="primary"
                                />
                                <QuickAction
                                    label="Set Budget"
                                    icon={PiggyBank}
                                    onClick={() => { }}
                                />
                                <QuickAction
                                    label="View Reports"
                                    icon={BarChart3}
                                    onClick={() => { }}
                                />
                            </div>
                        </WidgetCard>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PremiumDashboard;
