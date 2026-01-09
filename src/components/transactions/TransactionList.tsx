'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    Edit2,
    Trash2,
    Copy,
    MoreHorizontal,
    Calendar,
    Tag,
    Receipt,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
} from 'lucide-react';
import { Surface, Text, Badge, Skeleton } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface Transaction {
    id: string;
    date: string;
    merchant: string;
    amount: number;
    category: string;
    categoryIcon?: string;
    account: string;
    accountId: string;
    type: 'expense' | 'income' | 'transfer';
    pending?: boolean;
    notes?: string;
    tags?: string[];
    receiptUrl?: string;
    recurring?: boolean;
}

export interface TransactionFilters {
    search: string;
    dateRange: { start: string; end: string } | null;
    amountRange: { min: number; max: number } | null;
    categories: string[];
    accounts: string[];
    types: ('expense' | 'income' | 'transfer')[];
    showPending: boolean;
}

interface TransactionListProps {
    transactions: Transaction[];
    loading?: boolean;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (transaction: Transaction) => void;
    onSelect?: (ids: string[]) => void;
    categories?: string[];
    accounts?: Array<{ id: string; name: string }>;
}

// ===== VIRTUALIZATION HOOK =====

function useVirtualization<T>(
    items: T[],
    containerRef: React.RefObject<HTMLDivElement | null>,
    itemHeight: number,
    overscan = 5
) {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => setScrollTop(container.scrollTop);
        const handleResize = () => setContainerHeight(container.clientHeight);

        container.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [containerRef]);

    const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

        const virtual = [];
        for (let i = start; i <= end; i++) {
            virtual.push({
                index: i,
                item: items[i],
                offsetTop: i * itemHeight,
            });
        }

        return {
            startIndex: start,
            endIndex: end,
            virtualItems: virtual,
            totalHeight: items.length * itemHeight,
        };
    }, [items, scrollTop, containerHeight, itemHeight, overscan]);

    return { virtualItems, totalHeight, startIndex, endIndex };
}

// ===== DEFAULT FILTERS =====

const defaultFilters: TransactionFilters = {
    search: '',
    dateRange: null,
    amountRange: null,
    categories: [],
    accounts: [],
    types: [],
    showPending: true,
};

// ===== COMPONENT =====

export function TransactionList({
    transactions,
    loading = false,
    onEdit,
    onDelete,
    onDuplicate,
    onSelect,
    categories = [],
    accounts = [],
}: TransactionListProps) {
    const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const ITEM_HEIGHT = 72;

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            // Search filter
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (
                    !tx.merchant.toLowerCase().includes(search) &&
                    !tx.category.toLowerCase().includes(search) &&
                    !tx.notes?.toLowerCase().includes(search)
                ) {
                    return false;
                }
            }

            // Date range filter
            if (filters.dateRange) {
                const txDate = new Date(tx.date);
                if (
                    txDate < new Date(filters.dateRange.start) ||
                    txDate > new Date(filters.dateRange.end)
                ) {
                    return false;
                }
            }

            // Amount range filter
            if (filters.amountRange) {
                const absAmount = Math.abs(tx.amount);
                if (absAmount < filters.amountRange.min || absAmount > filters.amountRange.max) {
                    return false;
                }
            }

            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(tx.category)) {
                return false;
            }

            // Account filter
            if (filters.accounts.length > 0 && !filters.accounts.includes(tx.accountId)) {
                return false;
            }

            // Type filter
            if (filters.types.length > 0 && !filters.types.includes(tx.type)) {
                return false;
            }

            // Pending filter
            if (!filters.showPending && tx.pending) {
                return false;
            }

            return true;
        });
    }, [transactions, filters]);

    // Sort transactions
    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'amount':
                    comparison = Math.abs(a.amount) - Math.abs(b.amount);
                    break;
                case 'merchant':
                    comparison = a.merchant.localeCompare(b.merchant);
                    break;
            }
            return sortDir === 'asc' ? comparison : -comparison;
        });
    }, [filteredTransactions, sortBy, sortDir]);

    // Virtualization
    const { virtualItems, totalHeight } = useVirtualization(
        sortedTransactions,
        containerRef,
        ITEM_HEIGHT
    );

    // Selection handlers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        if (selectedIds.size === sortedTransactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedTransactions.map((tx) => tx.id)));
        }
    }, [sortedTransactions, selectedIds.size]);

    // Notify parent of selection changes
    useEffect(() => {
        onSelect?.(Array.from(selectedIds));
    }, [selectedIds, onSelect]);

    // Handle sorting
    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(column);
            setSortDir('desc');
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.dateRange) count++;
        if (filters.amountRange) count++;
        if (filters.categories.length) count++;
        if (filters.accounts.length) count++;
        if (filters.types.length) count++;
        return count;
    }, [filters]);

    if (loading) {
        return (
            <Surface elevation={1} className="p-0 overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)]">
                    <Skeleton width="40%" height={20} />
                </div>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border-subtle)]">
                        <Skeleton variant="circular" width={40} height={40} />
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
        <Surface elevation={1} className="p-0 overflow-hidden">
            {/* Header with Search and Filters */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-quaternary)]" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                            placeholder="Search transactions..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none text-sm"
                        />
                        {filters.search && (
                            <button
                                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--surface-elevated)] transition-colors"
                            >
                                <X className="w-3 h-3 text-[var(--text-quaternary)]" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors',
                            showFilters || activeFiltersCount > 0
                                ? 'bg-[var(--accent-primary-subtle)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                : 'bg-[var(--surface-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-emphasis)]'
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters</span>
                        {activeFiltersCount > 0 && (
                            <Badge variant="success" size="sm">{activeFiltersCount}</Badge>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Type Filter */}
                                <div>
                                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Type</Text>
                                    <div className="flex gap-2">
                                        {(['expense', 'income'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setFilters((f) => ({
                                                        ...f,
                                                        types: f.types.includes(type)
                                                            ? f.types.filter((t) => t !== type)
                                                            : [...f.types, type],
                                                    }));
                                                }}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                                    filters.types.includes(type)
                                                        ? 'bg-[var(--accent-primary)] text-white'
                                                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                                                )}
                                            >
                                                {type === 'expense' ? 'Expenses' : 'Income'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Category</Text>
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value && !filters.categories.includes(e.target.value)) {
                                                setFilters((f) => ({
                                                    ...f,
                                                    categories: [...f.categories, e.target.value],
                                                }));
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)] text-sm"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Account Filter */}
                                <div>
                                    <Text variant="body-sm" color="tertiary" className="mb-2 block">Account</Text>
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value && !filters.accounts.includes(e.target.value)) {
                                                setFilters((f) => ({
                                                    ...f,
                                                    accounts: [...f.accounts, e.target.value],
                                                }));
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)] text-sm"
                                    >
                                        <option value="">Select account</option>
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters(defaultFilters)}
                                        className="px-4 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>

                            {/* Active Filter Tags */}
                            {(filters.categories.length > 0 || filters.accounts.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {filters.categories.map((cat) => (
                                        <Badge key={cat} variant="info" size="sm">
                                            {cat}
                                            <button
                                                onClick={() => setFilters((f) => ({
                                                    ...f,
                                                    categories: f.categories.filter((c) => c !== cat),
                                                }))}
                                                className="ml-1.5 hover:text-[var(--accent-danger)]"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {filters.accounts.map((accId) => {
                                        const acc = accounts.find((a) => a.id === accId);
                                        return (
                                            <Badge key={accId} variant="info" size="sm">
                                                {acc?.name || accId}
                                                <button
                                                    onClick={() => setFilters((f) => ({
                                                        ...f,
                                                        accounts: f.accounts.filter((a) => a !== accId),
                                                    }))}
                                                    className="ml-1.5 hover:text-[var(--accent-danger)]"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 bg-[var(--accent-primary-subtle)] border-b border-[var(--accent-primary)]/20 flex items-center gap-4"
                    >
                        <Text variant="body-sm" color="accent">
                            {selectedIds.size} selected
                        </Text>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-sm text-[var(--accent-primary)] hover:underline"
                        >
                            Clear
                        </button>
                        <div className="flex-1" />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[var(--surface-base)] hover:bg-[var(--surface-elevated)] transition-colors">
                            <Tag className="w-3.5 h-3.5" />
                            Categorize
                        </button>
                        <button
                            onClick={() => {
                                selectedIds.forEach((id) => onDelete?.(id));
                                setSelectedIds(new Set());
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--accent-danger)] bg-[var(--accent-danger-subtle)] hover:bg-[var(--accent-danger-muted)] transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Column Headers */}
            <div className="grid grid-cols-[40px_1fr_120px_100px_40px] gap-4 px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] text-sm">
                <button
                    onClick={selectAll}
                    className="flex items-center justify-center"
                >
                    <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        selectedIds.size === sortedTransactions.length && sortedTransactions.length > 0
                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'border-[var(--border-emphasis)]'
                    )}>
                        {selectedIds.size === sortedTransactions.length && sortedTransactions.length > 0 && (
                            <Check className="w-3 h-3 text-white" />
                        )}
                    </div>
                </button>
                <button
                    onClick={() => handleSort('merchant')}
                    className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                    Description
                    {sortBy === 'merchant' && (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                </button>
                <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                    Date
                    {sortBy === 'date' && (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                </button>
                <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 justify-end text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                    Amount
                    {sortBy === 'amount' && (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                </button>
                <div />
            </div>

            {/* Transaction List (Virtualized) */}
            <div
                ref={containerRef}
                className="overflow-y-auto"
                style={{ height: 'calc(100vh - 400px)', minHeight: 300 }}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {virtualItems.map(({ item: tx, offsetTop, index }) => (
                        <div
                            key={tx.id}
                            className={cn(
                                'absolute left-0 right-0 grid grid-cols-[40px_1fr_120px_100px_40px] gap-4 px-4 items-center border-b border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-colors',
                                selectedIds.has(tx.id) && 'bg-[var(--accent-primary-subtle)]'
                            )}
                            style={{ top: offsetTop, height: ITEM_HEIGHT }}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleSelect(tx.id)}
                                className="flex items-center justify-center"
                            >
                                <div className={cn(
                                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                    selectedIds.has(tx.id)
                                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                                        : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                                )}>
                                    {selectedIds.has(tx.id) && <Check className="w-3 h-3 text-white" />}
                                </div>
                            </button>

                            {/* Merchant & Category */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                    tx.type === 'income'
                                        ? 'bg-[var(--accent-primary-subtle)]'
                                        : 'bg-[var(--surface-elevated-2)]'
                                )}>
                                    {tx.type === 'income' ? (
                                        <ArrowDownLeft className="w-5 h-5 text-[var(--accent-primary)]" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <Text variant="body-md" className="truncate block">
                                        {tx.merchant}
                                    </Text>
                                    <div className="flex items-center gap-2">
                                        <Text variant="body-sm" color="tertiary">{tx.category}</Text>
                                        {tx.pending && (
                                            <Badge variant="warning" size="sm">Pending</Badge>
                                        )}
                                        {tx.recurring && (
                                            <Badge variant="info" size="sm">Recurring</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <Text variant="body-sm" color="secondary">
                                {formatDate(tx.date)}
                            </Text>

                            {/* Amount */}
                            <Text
                                variant="mono-md"
                                className="text-right"
                                color={tx.type === 'income' ? 'accent' : 'primary'}
                            >
                                {tx.type === 'income' ? '+' : '-'}
                                {Math.abs(tx.amount).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0,
                                })}
                            </Text>

                            {/* Actions */}
                            <div className="relative">
                                <button
                                    onClick={() => setContextMenuId(contextMenuId === tx.id ? null : tx.id)}
                                    className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
                                </button>

                                {/* Context Menu */}
                                <AnimatePresence>
                                    {contextMenuId === tx.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-1 z-50 w-48 py-1 rounded-xl bg-[var(--surface-elevated-2)] border border-[var(--border-default)] shadow-lg"
                                        >
                                            <button
                                                onClick={() => {
                                                    onEdit?.(tx);
                                                    setContextMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--surface-elevated)] transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDuplicate?.(tx);
                                                    setContextMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--surface-elevated)] transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Duplicate
                                            </button>
                                            <div className="my-1 border-t border-[var(--border-subtle)]" />
                                            <button
                                                onClick={() => {
                                                    onDelete?.(tx.id);
                                                    setContextMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Text variant="body-sm" color="tertiary">
                    Showing {sortedTransactions.length} of {transactions.length} transactions
                </Text>
                {filteredTransactions.length !== transactions.length && (
                    <button
                        onClick={() => setFilters(defaultFilters)}
                        className="text-sm text-[var(--accent-primary)] hover:underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </Surface>
    );
}

export default TransactionList;
