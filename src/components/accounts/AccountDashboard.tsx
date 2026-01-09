'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    MoreHorizontal,
    Trash2,
    Eye,
    EyeOff,
    ChevronRight,
    Building2,
    CreditCard,
    PiggyBank,
    TrendingUp,
    Wallet,
    Link2,
    Unlink,
    Clock,
    X,
    Check,
} from 'lucide-react';
import { Surface, Text, Badge, Divider, Skeleton, Avatar } from '@/components/primitives';
import { Sparkline } from '@/components/dashboard/premium/PremiumCharts';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface Account {
    id: string;
    name: string;
    officialName?: string;
    institution: string;
    institutionId?: string;
    institutionLogo?: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';
    subtype?: string;
    mask?: string;  // Last 4 digits
    balance: number;
    availableBalance?: number;
    limit?: number; // For credit cards
    currency: string;
    lastSynced?: string;
    syncStatus: 'connected' | 'error' | 'pending' | 'disconnected';
    hidden?: boolean;
    balanceHistory?: number[];
}

interface AccountDashboardProps {
    accounts: Account[];
    onAddAccount?: () => void;
    onRefreshAccount?: (id: string) => void;
    onDeleteAccount?: (id: string) => void;
    onToggleHidden?: (id: string) => void;
    onReconnect?: (id: string) => void;
    loading?: boolean;
}

// ===== HELPERS =====

const accountTypeIcons: Record<Account['type'], typeof Wallet> = {
    checking: Wallet,
    savings: PiggyBank,
    credit: CreditCard,
    investment: TrendingUp,
    loan: Building2,
    other: Wallet,
};

const accountTypeLabels: Record<Account['type'], string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit: 'Credit Card',
    investment: 'Investment',
    loan: 'Loan',
    other: 'Other',
};

// ===== COMPONENT =====

export function AccountDashboard({
    accounts,
    onAddAccount,
    onRefreshAccount,
    onDeleteAccount,
    onToggleHidden,
    onReconnect,
    loading = false,
}: AccountDashboardProps) {
    const [showHidden, setShowHidden] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

    // Filter and group accounts
    const visibleAccounts = accounts.filter(a => showHidden || !a.hidden);
    const groupedAccounts = visibleAccounts.reduce((groups, account) => {
        const type = account.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(account);
        return groups;
    }, {} as Record<Account['type'], Account[]>);

    // Calculate totals
    const totals = accounts.reduce((acc, a) => {
        if (a.hidden) return acc;
        if (a.type === 'credit' || a.type === 'loan') {
            acc.liabilities += Math.abs(a.balance);
        } else {
            acc.assets += a.balance;
        }
        return acc;
    }, { assets: 0, liabilities: 0 });

    const netWorth = totals.assets - totals.liabilities;

    // Handle refresh with loading state
    const handleRefresh = async (id: string) => {
        setRefreshingIds(prev => new Set(prev).add(id));
        await onRefreshAccount?.(id);
        // Simulate delay for demo
        setTimeout(() => {
            setRefreshingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 1500);
    };

    const getStatusBadge = (status: Account['syncStatus']) => {
        switch (status) {
            case 'connected':
                return <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>;
            case 'error':
                return <Badge variant="danger" size="sm"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
            case 'pending':
                return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'disconnected':
                return <Badge variant="default" size="sm"><Unlink className="w-3 h-3 mr-1" />Disconnected</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Surface elevation={1} className="p-6">
                    <div className="flex justify-between mb-6">
                        <Skeleton width={200} height={28} />
                        <Skeleton width={120} height={40} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height={80} />
                        ))}
                    </div>
                </Surface>
                <Surface elevation={1} className="p-0">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border-subtle)]">
                            <Skeleton variant="circular" width={48} height={48} />
                            <div className="flex-1">
                                <Skeleton width="50%" height={16} className="mb-2" />
                                <Skeleton width="30%" height={12} />
                            </div>
                            <Skeleton width={100} height={20} />
                        </div>
                    ))}
                </Surface>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <Text variant="heading-lg">Accounts</Text>
                        <Text variant="body-sm" color="tertiary">
                            {accounts.length} connected account{accounts.length !== 1 ? 's' : ''}
                        </Text>
                    </div>
                    <button
                        onClick={onAddAccount}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Link Account
                    </button>
                </div>

                {/* Net Worth Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Assets</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                            {formatCurrency(totals.assets)}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Liabilities</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-danger)]">
                            -{formatCurrency(totals.liabilities)}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--accent-primary-subtle)]">
                        <Text variant="body-sm" color="accent">Net Worth</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(netWorth)}
                        </Text>
                    </div>
                </div>
            </Surface>

            {/* Account Groups */}
            {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
                const TypeIcon = accountTypeIcons[type as Account['type']];
                const typeLabel = accountTypeLabels[type as Account['type']];
                const typeTotal = typeAccounts.reduce((sum, a) =>
                    sum + (type === 'credit' || type === 'loan' ? -Math.abs(a.balance) : a.balance), 0
                );

                return (
                    <Surface key={type} elevation={1} className="p-0 overflow-hidden">
                        {/* Group Header */}
                        <div className="px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TypeIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                                <Text variant="heading-sm">{typeLabel}</Text>
                                <Badge variant="info" size="sm">{typeAccounts.length}</Badge>
                            </div>
                            <Text
                                variant="mono-md"
                                color={typeTotal >= 0 ? 'primary' : 'danger'}
                            >
                                {formatCurrency(typeTotal)}
                            </Text>
                        </div>

                        {/* Account Items */}
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {typeAccounts.map((account) => {
                                const isExpanded = expandedId === account.id;
                                const isRefreshing = refreshingIds.has(account.id);

                                return (
                                    <div key={account.id}>
                                        <div
                                            className={cn(
                                                'flex items-center gap-4 p-4 hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer',
                                                account.hidden && 'opacity-50',
                                                deleteConfirmId === account.id && 'bg-[var(--accent-danger-subtle)]'
                                            )}
                                            onClick={() => setExpandedId(isExpanded ? null : account.id)}
                                        >
                                            {/* Institution Logo/Avatar */}
                                            {account.institutionLogo ? (
                                                <img
                                                    src={account.institutionLogo}
                                                    alt={account.institution}
                                                    className="w-10 h-10 rounded-full object-contain bg-white"
                                                />
                                            ) : (
                                                <Avatar name={account.institution} size="md" />
                                            )}

                                            {/* Account Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Text variant="body-md" className="truncate">
                                                        {account.name}
                                                    </Text>
                                                    {account.hidden && (
                                                        <EyeOff className="w-4 h-4 text-[var(--text-quaternary)]" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Text variant="body-sm" color="tertiary">
                                                        {account.institution}
                                                    </Text>
                                                    {account.mask && (
                                                        <Text variant="body-sm" color="tertiary">
                                                            •••• {account.mask}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sparkline (if history available) */}
                                            {account.balanceHistory && account.balanceHistory.length > 2 && (
                                                <Sparkline
                                                    data={account.balanceHistory}
                                                    width={60}
                                                    height={24}
                                                    color={account.balance >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'}
                                                    showArea={false}
                                                />
                                            )}

                                            {/* Balance */}
                                            <div className="text-right">
                                                <Text
                                                    variant="mono-md"
                                                    color={
                                                        account.type === 'credit' || account.type === 'loan'
                                                            ? account.balance <= 0 ? 'primary' : 'danger'
                                                            : 'primary'
                                                    }
                                                >
                                                    {formatCurrency(account.balance)}
                                                </Text>
                                                {account.availableBalance !== undefined &&
                                                    account.availableBalance !== account.balance && (
                                                        <Text variant="body-sm" color="tertiary">
                                                            {formatCurrency(account.availableBalance)} avail
                                                        </Text>
                                                    )}
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center gap-2">
                                                {account.syncStatus === 'error' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onReconnect?.(account.id);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)] hover:bg-[var(--accent-danger-muted)] transition-colors"
                                                    >
                                                        Reconnect
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRefresh(account.id);
                                                        }}
                                                        disabled={isRefreshing}
                                                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors disabled:opacity-50"
                                                    >
                                                        <RefreshCw className={cn(
                                                            'w-4 h-4 text-[var(--text-tertiary)]',
                                                            isRefreshing && 'animate-spin'
                                                        )} />
                                                    </button>
                                                )}
                                                <ChevronRight className={cn(
                                                    'w-5 h-5 text-[var(--text-tertiary)] transition-transform',
                                                    isExpanded && 'rotate-90'
                                                )} />
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 pl-[72px]">
                                                        <div className="p-4 rounded-xl bg-[var(--surface-elevated)] space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <Text variant="body-sm" color="tertiary">Status</Text>
                                                                {getStatusBadge(account.syncStatus)}
                                                            </div>
                                                            {account.lastSynced && (
                                                                <div className="flex items-center justify-between">
                                                                    <Text variant="body-sm" color="tertiary">Last synced</Text>
                                                                    <Text variant="mono-sm">
                                                                        {new Date(account.lastSynced).toLocaleString()}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {account.limit && (
                                                                <div className="flex items-center justify-between">
                                                                    <Text variant="body-sm" color="tertiary">Credit limit</Text>
                                                                    <Text variant="mono-sm">
                                                                        {formatCurrency(account.limit)}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            {account.officialName && (
                                                                <div className="flex items-center justify-between">
                                                                    <Text variant="body-sm" color="tertiary">Official name</Text>
                                                                    <Text variant="body-sm">{account.officialName}</Text>
                                                                </div>
                                                            )}
                                                            <Divider />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => onToggleHidden?.(account.id)}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                                >
                                                                    {account.hidden ? (
                                                                        <>
                                                                            <Eye className="w-4 h-4" />
                                                                            Show
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <EyeOff className="w-4 h-4" />
                                                                            Hide
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirmId(account.id)}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Delete Confirmation */}
                                        <AnimatePresence>
                                            {deleteConfirmId === account.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 py-3 bg-[var(--accent-danger-subtle)] flex items-center justify-between">
                                                        <Text variant="body-sm" color="danger">
                                                            Remove this account? This cannot be undone.
                                                        </Text>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    onDeleteAccount?.(account.id);
                                                                    setDeleteConfirmId(null);
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg text-sm bg-[var(--accent-danger)] text-white"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </Surface>
                );
            })}

            {/* Hidden Accounts Toggle */}
            {accounts.some(a => a.hidden) && (
                <button
                    onClick={() => setShowHidden(!showHidden)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                    {showHidden ? (
                        <>
                            <EyeOff className="w-4 h-4" />
                            Hide {accounts.filter(a => a.hidden).length} hidden accounts
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4" />
                            Show {accounts.filter(a => a.hidden).length} hidden accounts
                        </>
                    )}
                </button>
            )}

            {/* Empty State */}
            {accounts.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center">
                        <Link2 className="w-8 h-8 text-[var(--text-quaternary)]" />
                    </div>
                    <Text variant="heading-sm" className="mb-2">No accounts connected</Text>
                    <Text variant="body-sm" color="tertiary" className="mb-6">
                        Link your bank accounts to start tracking your finances
                    </Text>
                    <button
                        onClick={onAddAccount}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Link Your First Account
                    </button>
                </Surface>
            )}
        </div>
    );
}

export default AccountDashboard;
