'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Calendar,
    Clock,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Bell,
    BellOff,
    Edit2,
    Trash2,
    MoreHorizontal,
    CreditCard,
    Zap,
    Wifi,
    Home,
    Car,
    Smartphone,
    Tv,
    Shield,
    Heart,
    GraduationCap,
    ChevronDown,
    ChevronUp,
    X,
    Check,
} from 'lucide-react';
import { Surface, Text, Badge, Divider, Skeleton } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface Bill {
    id: string;
    name: string;
    icon: string;
    category: string;
    amount: number;
    isVariable?: boolean;
    dueDate: number; // Day of month
    frequency: 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'yearly';
    autoPay?: boolean;
    accountId?: string;
    lastPaid?: string;
    nextDue?: string;
    reminderDays?: number;
    status: 'upcoming' | 'due' | 'overdue' | 'paid';
    notes?: string;
}

interface BillManagerProps {
    bills: Bill[];
    currentDate?: Date;
    onAddBill?: () => void;
    onEditBill?: (bill: Bill) => void;
    onDeleteBill?: (id: string) => void;
    onMarkPaid?: (id: string) => void;
    onToggleAutoPay?: (id: string) => void;
    loading?: boolean;
}

// ===== ICONS MAP =====

const iconMap: Record<string, typeof CreditCard> = {
    credit: CreditCard,
    utility: Zap,
    internet: Wifi,
    rent: Home,
    car: Car,
    phone: Smartphone,
    streaming: Tv,
    insurance: Shield,
    health: Heart,
    education: GraduationCap,
};

// ===== COMPONENT =====

export function BillManager({
    bills,
    currentDate = new Date(),
    onAddBill,
    onEditBill,
    onDeleteBill,
    onMarkPaid,
    onToggleAutoPay,
    loading = false,
}: BillManagerProps) {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [showPaid, setShowPaid] = useState(false);
    const [expandedBill, setExpandedBill] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Calculate summary
    const summary = useMemo(() => {
        const activeBills = bills.filter(b => b.status !== 'paid');
        const totalMonthly = activeBills.reduce((sum, b) => {
            switch (b.frequency) {
                case 'weekly': return sum + b.amount * 4;
                case 'biweekly': return sum + b.amount * 2;
                case 'quarterly': return sum + b.amount / 3;
                case 'yearly': return sum + b.amount / 12;
                default: return sum + b.amount;
            }
        }, 0);

        const dueThisWeek = activeBills.filter(b => {
            const daysUntilDue = b.dueDate - currentDate.getDate();
            return daysUntilDue >= 0 && daysUntilDue <= 7;
        });

        const overdue = activeBills.filter(b => b.status === 'overdue');
        const autoPaying = activeBills.filter(b => b.autoPay);

        return {
            totalMonthly,
            dueThisWeek,
            overdue,
            autoPaying,
            totalBills: activeBills.length,
        };
    }, [bills, currentDate]);

    // Sort bills by due date
    const sortedBills = useMemo(() => {
        return [...bills]
            .filter(b => showPaid || b.status !== 'paid')
            .sort((a, b) => {
                // Overdue first
                if (a.status === 'overdue' && b.status !== 'overdue') return -1;
                if (b.status === 'overdue' && a.status !== 'overdue') return 1;
                // Then by due date
                return a.dueDate - b.dueDate;
            });
    }, [bills, showPaid]);

    const getStatusColor = (status: Bill['status']) => {
        switch (status) {
            case 'overdue': return 'danger';
            case 'due': return 'warning';
            case 'paid': return 'success';
            default: return 'secondary';
        }
    };

    const getDaysUntilDue = (dueDate: number) => {
        const today = currentDate.getDate();
        const diff = dueDate - today;
        if (diff < 0) return `${Math.abs(diff)} days overdue`;
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        return `Due in ${diff} days`;
    };

    const renderIcon = (iconName: string, className?: string) => {
        const IconComponent = iconMap[iconName] || CreditCard;
        return <IconComponent className={className} />;
    };

    if (loading) {
        return (
            <Surface elevation={1} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton width={150} height={24} />
                    <Skeleton width={100} height={36} />
                </div>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-[var(--border-subtle)]">
                        <Skeleton variant="circular" width={48} height={48} />
                        <div className="flex-1">
                            <Skeleton width="60%" height={16} className="mb-2" />
                            <Skeleton width="40%" height={12} />
                        </div>
                        <Skeleton width={80} height={16} />
                    </div>
                ))}
            </Surface>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <Text variant="heading-lg">Bills & Payments</Text>
                        <Text variant="body-sm" color="tertiary">
                            {summary.totalBills} recurring bill{summary.totalBills !== 1 ? 's' : ''}
                        </Text>
                    </div>
                    <button
                        onClick={onAddBill}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Bill
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Monthly Total</Text>
                        <Text variant="heading-md" className="font-mono">
                            {formatCurrency(summary.totalMonthly)}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Due This Week</Text>
                        <Text variant="heading-md" className="font-mono">
                            {summary.dueThisWeek.length}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Auto-Pay</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-primary)]">
                            {summary.autoPaying.length}
                        </Text>
                    </div>
                    <div className={cn(
                        'p-4 rounded-xl',
                        summary.overdue.length > 0
                            ? 'bg-[var(--accent-danger-subtle)]'
                            : 'bg-[var(--surface-elevated)]'
                    )}>
                        <Text variant="body-sm" color={summary.overdue.length > 0 ? 'danger' : 'tertiary'}>
                            Overdue
                        </Text>
                        <Text
                            variant="heading-md"
                            className="font-mono"
                            color={summary.overdue.length > 0 ? 'danger' : 'primary'}
                        >
                            {summary.overdue.length}
                        </Text>
                    </div>
                </div>

                {/* Overdue Alert */}
                {summary.overdue.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-[var(--accent-danger-subtle)] border border-[var(--accent-danger)]/20 flex items-center gap-3"
                    >
                        <AlertTriangle className="w-5 h-5 text-[var(--accent-danger)]" />
                        <Text variant="body-sm" color="danger">
                            You have {summary.overdue.length} overdue bill{summary.overdue.length !== 1 ? 's' : ''} totaling{' '}
                            {formatCurrency(summary.overdue.reduce((sum, b) => sum + b.amount, 0))}
                        </Text>
                    </motion.div>
                )}
            </Surface>

            {/* Bills List */}
            <Surface elevation={1} className="p-0 overflow-hidden">
                {/* Filter Bar */}
                <div className="px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPaid(!showPaid)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                                showPaid
                                    ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                                    : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-elevated-2)]'
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Show Paid
                        </button>
                    </div>
                    {/* View mode toggle could go here */}
                </div>

                {/* Bill Items */}
                <div className="divide-y divide-[var(--border-subtle)]">
                    {sortedBills.map((bill) => (
                        <div key={bill.id}>
                            <div
                                className={cn(
                                    'flex items-center gap-4 p-4 hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer',
                                    bill.status === 'paid' && 'opacity-60',
                                    deleteConfirmId === bill.id && 'bg-[var(--accent-danger-subtle)]'
                                )}
                                onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated-2)] flex items-center justify-center shrink-0">
                                    {renderIcon(bill.icon, 'w-6 h-6 text-[var(--text-tertiary)]')}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Text variant="body-md">{bill.name}</Text>
                                        {bill.autoPay && (
                                            <Badge variant="success" size="sm">Auto</Badge>
                                        )}
                                        {bill.isVariable && (
                                            <Badge variant="info" size="sm">Variable</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Text variant="body-sm" color="tertiary">{bill.category}</Text>
                                        <Text
                                            variant="body-sm"
                                            color={getStatusColor(bill.status) as any}
                                        >
                                            {getDaysUntilDue(bill.dueDate)}
                                        </Text>
                                    </div>
                                </div>

                                {/* Amount & Actions */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Text variant="mono-md">{formatCurrency(bill.amount)}</Text>
                                        <Text variant="body-sm" color="tertiary">
                                            /{bill.frequency === 'monthly' ? 'mo' : bill.frequency}
                                        </Text>
                                    </div>

                                    {deleteConfirmId === bill.id ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmId(null);
                                                }}
                                                className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)]"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteBill?.(bill.id);
                                                    setDeleteConfirmId(null);
                                                }}
                                                className="p-2 rounded-lg bg-[var(--accent-danger)] text-white"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {bill.status !== 'paid' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMarkPaid?.(bill.id);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] transition-colors"
                                                    title="Mark as paid"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors"
                                            >
                                                {expandedBill === bill.id ? (
                                                    <ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedBill === bill.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 pl-20">
                                            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Text variant="body-sm" color="tertiary">Due Date</Text>
                                                    <Text variant="mono-sm">
                                                        {bill.dueDate}{getOrdinalSuffix(bill.dueDate)} of each month
                                                    </Text>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Text variant="body-sm" color="tertiary">Last Paid</Text>
                                                    <Text variant="mono-sm">
                                                        {bill.lastPaid
                                                            ? new Date(bill.lastPaid).toLocaleDateString()
                                                            : 'Never'}
                                                    </Text>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Text variant="body-sm" color="tertiary">Auto-Pay</Text>
                                                    <button
                                                        onClick={() => onToggleAutoPay?.(bill.id)}
                                                        className={cn(
                                                            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm transition-colors',
                                                            bill.autoPay
                                                                ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                                                                : 'bg-[var(--surface-elevated-2)] text-[var(--text-tertiary)]'
                                                        )}
                                                    >
                                                        {bill.autoPay ? (
                                                            <>
                                                                <Bell className="w-3.5 h-3.5" />
                                                                Enabled
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BellOff className="w-3.5 h-3.5" />
                                                                Disabled
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                {bill.notes && (
                                                    <>
                                                        <Divider />
                                                        <Text variant="body-sm" color="tertiary">{bill.notes}</Text>
                                                    </>
                                                )}
                                                <Divider />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => onEditBill?.(bill)}
                                                        className="flex-1 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                                                    >
                                                        Edit Bill
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(bill.id)}
                                                        className="flex-1 py-2 rounded-lg text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {sortedBills.length === 0 && (
                    <div className="p-12 text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                        <Text variant="body-md" color="tertiary">No bills yet</Text>
                        <Text variant="body-sm" color="tertiary">Add your recurring bills to track payments</Text>
                    </div>
                )}
            </Surface>
        </div>
    );
}

// Helper function for ordinal suffix
function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

export default BillManager;
