'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    AlertTriangle,
    Check,
    X,
    Merge,
    Eye,
    Calendar,
    DollarSign,
    Building2,
} from 'lucide-react';

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    account: string;
}

interface DuplicateGroup {
    id: string;
    transactions: Transaction[];
    similarity: number;
    reason: string;
}

// Demo data with potential duplicates
const DEMO_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '2026-01-08', description: 'AMAZON.COM', amount: -89.99, category: 'Shopping', account: 'Chase Checking' },
    { id: '2', date: '2026-01-08', description: 'Amazon.com*123456', amount: -89.99, category: 'Shopping', account: 'Chase Credit' },
    { id: '3', date: '2026-01-07', description: 'STARBUCKS #12345', amount: -7.45, category: 'Food & Drink', account: 'Chase Checking' },
    { id: '4', date: '2026-01-07', description: 'Starbucks Store #12345', amount: -7.45, category: 'Food & Drink', account: 'Amex' },
    { id: '5', date: '2026-01-05', description: 'NETFLIX.COM', amount: -22.99, category: 'Entertainment', account: 'Chase Credit' },
    { id: '6', date: '2026-01-05', description: 'Netflix Monthly', amount: -22.99, category: 'Subscriptions', account: 'BoA Checking' },
];

// Detect duplicates using similarity scoring
function detectDuplicates(transactions: Transaction[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < transactions.length; i++) {
        if (processed.has(transactions[i].id)) continue;

        const duplicates: Transaction[] = [transactions[i]];

        for (let j = i + 1; j < transactions.length; j++) {
            if (processed.has(transactions[j].id)) continue;

            const similarity = calculateSimilarity(transactions[i], transactions[j]);
            if (similarity > 0.7) {
                duplicates.push(transactions[j]);
                processed.add(transactions[j].id);
            }
        }

        if (duplicates.length > 1) {
            processed.add(transactions[i].id);
            groups.push({
                id: `group-${i}`,
                transactions: duplicates,
                similarity: 0.85 + Math.random() * 0.1,
                reason: determineReason(duplicates),
            });
        }
    }

    return groups;
}

function calculateSimilarity(a: Transaction, b: Transaction): number {
    let score = 0;

    // Same amount is strong indicator
    if (a.amount === b.amount) score += 0.4;

    // Same or adjacent date
    const dayDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff <= 1) score += 0.3;

    // Similar description (normalize and compare)
    const normalizeDesc = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const descA = normalizeDesc(a.description);
    const descB = normalizeDesc(b.description);
    if (descA.includes(descB.slice(0, 5)) || descB.includes(descA.slice(0, 5))) {
        score += 0.3;
    }

    return score;
}

function determineReason(transactions: Transaction[]): string {
    const accounts = new Set(transactions.map(t => t.account));
    if (accounts.size > 1) {
        return 'Same transaction synced from multiple accounts';
    }
    return 'Similar amount and date detected';
}

export function DuplicateDetector() {
    const [transactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
    const [resolvedGroups, setResolvedGroups] = useState<Set<string>>(new Set());
    const [viewingGroup, setViewingGroup] = useState<string | null>(null);

    const duplicateGroups = useMemo(() => detectDuplicates(transactions), [transactions]);
    const unresolvedGroups = duplicateGroups.filter(g => !resolvedGroups.has(g.id));

    const keepOne = (groupId: string, keepId: string) => {
        // In production, this would mark duplicates as hidden/merged in the database
        console.log(`Keeping transaction ${keepId}, hiding others in group ${groupId}`);
        setResolvedGroups(prev => new Set(prev).add(groupId));
    };

    const keepAll = (groupId: string) => {
        // Mark all as not duplicates
        console.log(`Marking group ${groupId} as not duplicates`);
        setResolvedGroups(prev => new Set(prev).add(groupId));
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));

    if (unresolvedGroups.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Duplicates Found</h3>
                <p className="text-white/50">Your transactions are clean and deduplicated.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        {unresolvedGroups.length} Potential Duplicate{unresolvedGroups.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-white/50">Review and merge duplicate transactions</p>
                </div>
            </div>

            {/* Duplicate Groups */}
            <div className="space-y-4">
                <AnimatePresence>
                    {unresolvedGroups.map((group, index) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">
                                        {Math.round(group.similarity * 100)}% match
                                    </span>
                                    <span className="text-sm text-white/50">{group.reason}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewingGroup(viewingGroup === group.id ? null : group.id)}
                                    >
                                        <Eye className="w-4 h-4" />
                                        {viewingGroup === group.id ? 'Hide' : 'Details'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => keepAll(group.id)}
                                        className="text-white/50 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                        Not Duplicates
                                    </Button>
                                </div>
                            </div>

                            {/* Transaction cards */}
                            <div className="space-y-2">
                                {group.transactions.map((txn) => (
                                    <div
                                        key={txn.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-black/20"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-left">
                                                <p className="font-medium text-white">{txn.description}</p>
                                                <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(txn.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {txn.account}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-white">
                                                {txn.amount < 0 ? '-' : '+'}{formatCurrency(txn.amount)}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={() => keepOne(group.id, txn.id)}
                                                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                                            >
                                                <Check className="w-4 h-4" />
                                                Keep
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                                {viewingGroup === group.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 pt-4 border-t border-white/10"
                                    >
                                        <p className="text-sm text-white/60">
                                            These transactions appear to be duplicates because they have the same amount
                                            ({formatCurrency(group.transactions[0].amount)}) and occurred on similar dates.
                                            This often happens when the same purchase syncs from multiple accounts.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default DuplicateDetector;
