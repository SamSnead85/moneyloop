'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Send,
    Download,
    RefreshCw,
    Eye,
    EyeOff,
    Check,
    Clock,
    AlertCircle,
    ChevronRight,
    ExternalLink,
    Shield,
    Wallet,
    TrendingUp,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface BankAccount {
    id: string;
    provider: 'mercury' | 'chase' | 'bofa' | 'wells_fargo' | 'other';
    name: string;
    type: 'checking' | 'savings';
    lastFour: string;
    balance: number;
    availableBalance: number;
    status: 'active' | 'pending' | 'frozen';
    isPrimary: boolean;
    connectedAt: string;
}

interface Transaction {
    id: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
    category: 'payroll' | 'tax' | 'transfer' | 'fee' | 'deposit' | 'vendor';
    status: 'pending' | 'completed' | 'failed';
    date: string;
    counterparty?: string;
}

// Mock data
const mockAccounts: BankAccount[] = [
    {
        id: '1',
        provider: 'mercury',
        name: 'Mercury Business Checking',
        type: 'checking',
        lastFour: '4521',
        balance: 127543.89,
        availableBalance: 125000.00,
        status: 'active',
        isPrimary: true,
        connectedAt: '2025-06-15',
    },
    {
        id: '2',
        provider: 'mercury',
        name: 'Mercury Savings Reserve',
        type: 'savings',
        lastFour: '7832',
        balance: 50000.00,
        availableBalance: 50000.00,
        status: 'active',
        isPrimary: false,
        connectedAt: '2025-08-01',
    },
];

const mockTransactions: Transaction[] = [
    { id: 't1', type: 'debit', amount: 17443.21, description: 'Payroll - Jan 16-31', category: 'payroll', status: 'pending', date: '2026-02-01', counterparty: 'Employees' },
    { id: 't2', type: 'debit', amount: 5234.56, description: 'Tax Deposit - Federal', category: 'tax', status: 'pending', date: '2026-02-01', counterparty: 'IRS' },
    { id: 't3', type: 'debit', amount: 2345.67, description: 'Tax Deposit - State', category: 'tax', status: 'pending', date: '2026-02-01', counterparty: 'CA FTB' },
    { id: 't4', type: 'credit', amount: 75000.00, description: 'Client Payment - Acme Corp', category: 'deposit', status: 'completed', date: '2026-01-28', counterparty: 'Acme Corp' },
    { id: 't5', type: 'debit', amount: 16663.99, description: 'Payroll - Jan 1-15', category: 'payroll', status: 'completed', date: '2026-01-17', counterparty: 'Employees' },
    { id: 't6', type: 'debit', amount: 4500.00, description: 'AWS Monthly', category: 'vendor', status: 'completed', date: '2026-01-15', counterparty: 'Amazon Web Services' },
    { id: 't7', type: 'debit', amount: 25.00, description: 'Wire Transfer Fee', category: 'fee', status: 'completed', date: '2026-01-10' },
    { id: 't8', type: 'credit', amount: 45000.00, description: 'Client Payment - TechStart', category: 'deposit', status: 'completed', date: '2026-01-08', counterparty: 'TechStart Inc' },
];

// Bank Account Card
function BankAccountCard({ account, showBalance }: { account: BankAccount; showBalance: boolean }) {
    const getProviderLogo = (provider: string) => {
        if (provider === 'mercury') {
            return (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
            );
        }
        return (
            <div className="w-10 h-10 rounded-xl bg-white/[0.1] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white/60" />
            </div>
        );
    };

    return (
        <Card className={`p-5 transition-all ${account.isPrimary
                ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20'
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {getProviderLogo(account.provider)}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{account.name}</h3>
                            {account.isPrimary && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-medium">
                                    Primary
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-white/40">****{account.lastFour} · {account.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-[#34d399]' : 'bg-amber-400'}`} />
                    <span className="text-xs text-white/40 capitalize">{account.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-white/40 mb-1">Current Balance</p>
                    <p className="text-2xl font-semibold text-white">
                        {showBalance ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-white/40 mb-1">Available</p>
                    <p className="text-lg font-medium text-white/70">
                        {showBalance ? `$${account.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <Button variant="secondary" size="sm" className="flex-1 border-white/10 text-xs">
                    <Send className="w-3 h-3" />
                    Send
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 border-white/10 text-xs">
                    <Download className="w-3 h-3" />
                    Receive
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 border-white/10 text-xs">
                    <RefreshCw className="w-3 h-3" />
                    Transfer
                </Button>
            </div>
        </Card>
    );
}

// Transaction Row
function TransactionRow({ transaction }: { transaction: Transaction }) {
    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'payroll': return { icon: Wallet, color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10' };
            case 'tax': return { icon: Building2, color: 'text-purple-400', bg: 'bg-purple-400/10' };
            case 'deposit': return { icon: ArrowDownRight, color: 'text-[#34d399]', bg: 'bg-[#34d399]/10' };
            case 'vendor': return { icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-400/10' };
            case 'fee': return { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' };
            default: return { icon: ArrowUpRight, color: 'text-white/40', bg: 'bg-white/[0.05]' };
        }
    };

    const config = getCategoryConfig(transaction.category);
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">{transaction.date}</span>
                        {transaction.counterparty && (
                            <>
                                <span className="text-xs text-white/20">·</span>
                                <span className="text-xs text-white/40">{transaction.counterparty}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-medium ${transaction.type === 'credit' ? 'text-[#34d399]' : 'text-white'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <span className={`text-xs ${transaction.status === 'completed' ? 'text-white/30' :
                        transaction.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                    {transaction.status === 'completed' ? '' : transaction.status}
                </span>
            </div>
        </div>
    );
}

// Main Component
export default function BankingPage() {
    const [accounts] = useState(mockAccounts);
    const [transactions] = useState(mockTransactions);
    const [showBalance, setShowBalance] = useState(true);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const pendingDebits = transactions.filter(t => t.type === 'debit' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Banking</h1>
                    <p className="text-white/50">Manage your business bank accounts</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowBalance(!showBalance)}
                        className="border-white/10"
                    >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showBalance ? 'Hide' : 'Show'}
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/50">Total Balance</p>
                        <TrendingUp className="w-4 h-4 text-[#34d399]" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Across {accounts.length} accounts</p>
                </Card>

                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/50">Pending Payroll</p>
                        <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-amber-400">
                        {showBalance ? `$${pendingDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Scheduled for Feb 1</p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/50">Mercury Status</p>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                            <span className="text-xs text-[#34d399]">Connected</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">Mercury</p>
                            <p className="text-xs text-white/40">API Connected</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-3 text-purple-400 text-xs">
                        Open Mercury <ExternalLink className="w-3 h-3" />
                    </Button>
                </Card>
            </div>

            {/* Accounts */}
            <div>
                <h2 className="text-lg font-medium text-white mb-4">Accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accounts.map((account) => (
                        <BankAccountCard key={account.id} account={account} showBalance={showBalance} />
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
                    <Button variant="ghost" className="text-[#0ea5e9]">
                        View All <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {transactions.map((transaction) => (
                            <TransactionRow key={transaction.id} transaction={transaction} />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Security */}
            <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-[#34d399]" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white mb-1">Bank-Level Security</h3>
                        <p className="text-sm text-white/50">
                            All banking data is encrypted with AES-256 and transmitted over TLS 1.3.
                            We never store your full account numbers.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
