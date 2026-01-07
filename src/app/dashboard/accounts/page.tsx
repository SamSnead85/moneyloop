'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    CreditCard,
    TrendingUp,
    Home,
    Coins,
    Plus,
    RefreshCw,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Clock,
    Wallet,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { PlaidLinkButton } from '@/components/PlaidLink';


// Account data
const accountGroups = [
    {
        type: 'Cash & Banking',
        icon: Wallet,
        totalBalance: 57650.32,
        accounts: [
            { id: 1, name: 'Chase Checking', balance: 12450.32, type: 'checking', institution: 'Chase', lastSync: '2 min ago', status: 'connected' },
            { id: 2, name: 'High-Yield Savings', balance: 38200.00, type: 'savings', institution: 'Marcus', lastSync: '5 min ago', status: 'connected', apy: '4.50%' },
            { id: 3, name: 'Money Market', balance: 7000.00, type: 'money-market', institution: 'Fidelity', lastSync: '1 hr ago', status: 'connected', apy: '4.75%' },
        ]
    },
    {
        type: 'Credit Cards',
        icon: CreditCard,
        totalBalance: -4850.00,
        accounts: [
            { id: 4, name: 'Chase Sapphire Preferred', balance: -2350.00, type: 'credit', institution: 'Chase', lastSync: '10 min ago', status: 'connected', limit: 15000, rewards: '2X on travel' },
            { id: 5, name: 'Amex Gold', balance: -1800.00, type: 'credit', institution: 'American Express', lastSync: '10 min ago', status: 'connected', limit: 10000, rewards: '4X on dining' },
            { id: 6, name: 'Chase Freedom', balance: -700.00, type: 'credit', institution: 'Chase', lastSync: '10 min ago', status: 'connected', limit: 8000, rewards: '5% rotating' },
        ]
    },
    {
        type: 'Investments',
        icon: TrendingUp,
        totalBalance: 127450.00,
        accounts: [
            { id: 7, name: 'Fidelity Brokerage', balance: 45450.00, type: 'brokerage', institution: 'Fidelity', lastSync: '1 hr ago', status: 'connected', change: '+2.4%' },
            { id: 8, name: 'Company 401(k)', balance: 67000.00, type: '401k', institution: 'Fidelity', lastSync: '1 day ago', status: 'connected', change: '+1.8%' },
            { id: 9, name: 'Roth IRA', balance: 15000.00, type: 'roth-ira', institution: 'Vanguard', lastSync: '1 hr ago', status: 'connected', change: '+1.2%' },
        ]
    },
    {
        type: 'Real Estate',
        icon: Home,
        totalBalance: 425000.00,
        accounts: [
            { id: 10, name: 'Primary Residence', balance: 425000.00, type: 'property', institution: 'Manual', lastSync: 'Dec 2025', status: 'manual', equity: 175000 },
        ]
    },
    {
        type: 'Loans',
        icon: Building2,
        totalBalance: -282000.00,
        accounts: [
            { id: 11, name: 'Mortgage - Wells Fargo', balance: -250000.00, type: 'mortgage', institution: 'Wells Fargo', lastSync: '1 day ago', status: 'connected', rate: '6.5%', payment: 2400 },
            { id: 12, name: 'Auto Loan', balance: -18000.00, type: 'auto-loan', institution: 'Capital One', lastSync: '1 day ago', status: 'connected', rate: '4.9%', payment: 450 },
            { id: 13, name: 'Student Loan', balance: -14000.00, type: 'student', institution: 'Nelnet', lastSync: '3 days ago', status: 'needs-attention' },
        ]
    },
    {
        type: 'Alternative Assets',
        icon: Coins,
        totalBalance: 18040.00,
        accounts: [
            { id: 14, name: 'Gold (5 oz)', balance: 10500.00, type: 'commodity', institution: 'Manual', lastSync: 'Live', status: 'manual', change: '+1.2%' },
            { id: 15, name: 'Silver (250 oz)', balance: 7540.00, type: 'commodity', institution: 'Manual', lastSync: 'Live', status: 'manual', change: '+3.8%' },
        ]
    },
];

export default function AccountsPage() {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    const totalAssets = accountGroups
        .filter(g => g.totalBalance > 0)
        .reduce((sum, g) => sum + g.totalBalance, 0);

    const totalLiabilities = Math.abs(
        accountGroups
            .filter(g => g.totalBalance < 0)
            .reduce((sum, g) => sum + g.totalBalance, 0)
    );

    const netWorth = totalAssets - totalLiabilities;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Accounts</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all your connected accounts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Sync All
                    </Button>
                    <PlaidLinkButton className="gap-2 bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]">
                        Connect Bank
                    </PlaidLinkButton>
                </div>
            </div>

            {/* Net Worth Summary */}
            <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-slate-500 text-sm">Net Worth</p>
                        <p className="text-3xl font-bold mt-1 text-[#7dd3a8]">${netWorth.toLocaleString()}</p>
                        <p className="text-xs text-[#7dd3a8] mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +$3,240 this month
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Assets</p>
                        <p className="text-2xl font-semibold mt-1">${totalAssets.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2">Across {accountGroups.filter(g => g.totalBalance > 0).length} categories</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Liabilities</p>
                        <p className="text-2xl font-semibold mt-1 text-red-400">-${totalLiabilities.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2">Credit cards + loans</p>
                    </div>
                </div>

                {/* Asset Allocation Bar */}
                <div className="mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Asset Allocation</span>
                        <span>100%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex">
                        <div className="bg-blue-500 h-full" style={{ width: '9%' }} title="Cash" />
                        <div className="bg-purple-500 h-full" style={{ width: '20%' }} title="Investments" />
                        <div className="bg-[#7dd3a8] h-full" style={{ width: '68%' }} title="Real Estate" />
                        <div className="bg-amber-500 h-full" style={{ width: '3%' }} title="Other" />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Cash 9%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Investments 20%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7dd3a8]" /> Real Estate 68%
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Other 3%
                        </span>
                    </div>
                </div>
            </Card>

            {/* Account Groups */}
            <div className="space-y-4">
                {accountGroups.map((group, gi) => {
                    const GroupIcon = group.icon;
                    const isNegative = group.totalBalance < 0;

                    return (
                        <motion.div
                            key={group.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: gi * 0.05 }}
                        >
                            <Card className="overflow-hidden">
                                {/* Group Header */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/[0.04]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/[0.04]">
                                            <GroupIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{group.type}</h3>
                                            <p className="text-xs text-slate-500">{group.accounts.length} accounts</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-semibold ${isNegative ? 'text-red-400' : ''}`}>
                                            {isNegative ? '-' : ''}${Math.abs(group.totalBalance).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Accounts */}
                                <div className="divide-y divide-white/[0.04]">
                                    {group.accounts.map((account, ai) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{account.name}</span>
                                                    {account.status === 'needs-attention' && (
                                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                    <span>{account.institution}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        {account.status === 'connected' ? (
                                                            <CheckCircle2 className="w-3 h-3 text-[#7dd3a8]" />
                                                        ) : account.status === 'needs-attention' ? (
                                                            <AlertCircle className="w-3 h-3 text-amber-400" />
                                                        ) : (
                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                        )}
                                                        {account.lastSync}
                                                    </span>
                                                    {'apy' in account && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#7dd3a8]">{account.apy} APY</span>
                                                        </>
                                                    )}
                                                    {'change' in account && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#7dd3a8]">{account.change}</span>
                                                        </>
                                                    )}
                                                    {'rate' in account && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{account.rate} rate</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className={`font-semibold ${account.balance < 0 ? 'text-red-400' : ''}`}>
                                                    {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString()}
                                                </p>
                                                {'limit' in account && (
                                                    <p className="text-xs text-slate-500">
                                                        ${(account.limit + account.balance).toLocaleString()} available
                                                    </p>
                                                )}
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Account CTA */}
            <Card className="p-6 border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-[#7dd3a8]/10 mb-3">
                    <Building2 className="w-6 h-6 text-[#7dd3a8]" />
                </div>
                <h3 className="font-medium">Connect More Accounts</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                    Link your bank accounts, credit cards, investments, and loans for a complete picture of your finances.
                </p>
                <PlaidLinkButton className="mt-4 gap-2 bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]" />
            </Card>
        </div>
    );
}
