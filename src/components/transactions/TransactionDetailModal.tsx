'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Edit2,
    Save,
    Trash2,
    Calendar,
    Tag,
    Receipt,
    MessageSquare,
    Link2,
    ArrowUpRight,
    ArrowDownLeft,
    Copy,
    Check,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';
import type { Transaction } from './TransactionList';

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    categories?: string[];
    accounts?: Array<{ id: string; name: string }>;
}

export function TransactionDetailModal({
    transaction,
    isOpen,
    onClose,
    onSave,
    onDelete,
    categories = [],
    accounts = [],
}: TransactionDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTx, setEditedTx] = useState<Transaction | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset state when transaction changes
    useEffect(() => {
        if (transaction) {
            setEditedTx({ ...transaction });
            setIsEditing(false);
            setShowDeleteConfirm(false);
        }
    }, [transaction]);

    if (!transaction || !editedTx) return null;

    const handleSave = () => {
        if (editedTx) {
            onSave?.(editedTx);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        onDelete?.(transaction.id);
        onClose();
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
                    >
                        <Surface elevation={2} className="h-full md:h-auto max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--border-subtle)]">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            'w-12 h-12 rounded-xl flex items-center justify-center',
                                            transaction.type === 'income'
                                                ? 'bg-[var(--accent-primary-subtle)]'
                                                : 'bg-[var(--surface-elevated-2)]'
                                        )}>
                                            {transaction.type === 'income' ? (
                                                <ArrowDownLeft className="w-6 h-6 text-[var(--accent-primary)]" />
                                            ) : (
                                                <ArrowUpRight className="w-6 h-6 text-[var(--text-tertiary)]" />
                                            )}
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editedTx.merchant}
                                                    onChange={(e) => setEditedTx({ ...editedTx, merchant: e.target.value })}
                                                    className="text-xl font-semibold bg-transparent border-b border-[var(--border-emphasis)] focus:border-[var(--accent-primary)] outline-none w-full"
                                                />
                                            ) : (
                                                <Text variant="heading-md">{transaction.merchant}</Text>
                                            )}
                                            <Text variant="body-sm" color="tertiary">
                                                {formatFullDate(transaction.date)}
                                            </Text>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    </button>
                                </div>

                                {/* Amount */}
                                <div className="mt-6">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl text-[var(--text-tertiary)]">$</span>
                                            <input
                                                type="number"
                                                value={Math.abs(editedTx.amount)}
                                                onChange={(e) => setEditedTx({
                                                    ...editedTx,
                                                    amount: parseFloat(e.target.value) * (transaction.type === 'expense' ? -1 : 1)
                                                })}
                                                className="text-3xl font-mono font-semibold bg-transparent border-b border-[var(--border-emphasis)] focus:border-[var(--accent-primary)] outline-none w-32"
                                            />
                                        </div>
                                    ) : (
                                        <Text
                                            variant="mono-xl"
                                            color={transaction.type === 'income' ? 'accent' : 'primary'}
                                            className="text-3xl"
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {Math.abs(transaction.amount).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            })}
                                        </Text>
                                    )}
                                </div>

                                {/* Status badges */}
                                <div className="flex gap-2 mt-4">
                                    {transaction.pending && <Badge variant="warning">Pending</Badge>}
                                    {transaction.recurring && <Badge variant="info">Recurring</Badge>}
                                    <Badge variant={transaction.type === 'income' ? 'success' : 'default'}>
                                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Category */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <Text variant="body-sm" color="tertiary">Category</Text>
                                    </div>
                                    {isEditing ? (
                                        <select
                                            value={editedTx.category}
                                            onChange={(e) => setEditedTx({ ...editedTx, category: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Text variant="body-md">{transaction.category}</Text>
                                    )}
                                </div>

                                <Divider />

                                {/* Account */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <Text variant="body-sm" color="tertiary">Account</Text>
                                    </div>
                                    {isEditing ? (
                                        <select
                                            value={editedTx.accountId}
                                            onChange={(e) => {
                                                const acc = accounts.find(a => a.id === e.target.value);
                                                setEditedTx({
                                                    ...editedTx,
                                                    accountId: e.target.value,
                                                    account: acc?.name || e.target.value,
                                                });
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                        >
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Text variant="body-md">{transaction.account}</Text>
                                    )}
                                </div>

                                <Divider />

                                {/* Notes */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <Text variant="body-sm" color="tertiary">Notes</Text>
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            value={editedTx.notes || ''}
                                            onChange={(e) => setEditedTx({ ...editedTx, notes: e.target.value })}
                                            placeholder="Add a note..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none resize-none"
                                        />
                                    ) : (
                                        <Text variant="body-md" color={transaction.notes ? 'primary' : 'tertiary'}>
                                            {transaction.notes || 'No notes'}
                                        </Text>
                                    )}
                                </div>

                                <Divider />

                                {/* Tags */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <Text variant="body-sm" color="tertiary">Tags</Text>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(editedTx.tags || []).map((tag, i) => (
                                            <Badge key={i} variant="info" size="sm">
                                                {tag}
                                                {isEditing && (
                                                    <button
                                                        onClick={() => setEditedTx({
                                                            ...editedTx,
                                                            tags: editedTx.tags?.filter((_, idx) => idx !== i)
                                                        })}
                                                        className="ml-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                        {isEditing && (
                                            <button className="px-3 py-1 rounded-full border border-dashed border-[var(--border-default)] text-sm text-[var(--text-tertiary)] hover:border-[var(--border-emphasis)] transition-colors">
                                                + Add tag
                                            </button>
                                        )}
                                        {!isEditing && (!transaction.tags || transaction.tags.length === 0) && (
                                            <Text variant="body-sm" color="tertiary">No tags</Text>
                                        )}
                                    </div>
                                </div>

                                <Divider />

                                {/* Receipt */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Receipt className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <Text variant="body-sm" color="tertiary">Receipt</Text>
                                    </div>
                                    {transaction.receiptUrl ? (
                                        <div className="relative rounded-xl overflow-hidden border border-[var(--border-default)]">
                                            <img
                                                src={transaction.receiptUrl}
                                                alt="Receipt"
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    ) : isEditing ? (
                                        <button className="w-full py-8 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-colors flex flex-col items-center gap-2">
                                            <Upload className="w-6 h-6 text-[var(--text-tertiary)]" />
                                            <Text variant="body-sm" color="tertiary">Upload receipt</Text>
                                        </button>
                                    ) : (
                                        <Text variant="body-sm" color="tertiary">No receipt attached</Text>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[var(--border-subtle)] flex items-center gap-3">
                                {showDeleteConfirm ? (
                                    <>
                                        <Text variant="body-sm" color="danger" className="flex-1">
                                            Are you sure you want to delete this transaction?
                                        </Text>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--surface-elevated)] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 rounded-xl text-sm bg-[var(--accent-danger)] text-white hover:brightness-110 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : isEditing ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditedTx({ ...transaction });
                                                setIsEditing(false);
                                            }}
                                            className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--surface-elevated)] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <div className="flex-1" />
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                                        >
                                            <Check className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="p-2 rounded-xl text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1" />
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </Surface>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default TransactionDetailModal;
