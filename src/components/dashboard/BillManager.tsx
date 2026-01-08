'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Receipt,
    Calendar,
    AlertCircle,
    Check,
    Edit3,
    Trash2,
    Loader2,
    DollarSign,
    Zap,
    Bell,
    Clock,
    CheckCircle
} from 'lucide-react';

interface Bill {
    id: string;
    name: string;
    amount: number;
    due_date: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
    category: string;
    is_autopay: boolean;
    is_paid: boolean;
    reminder_days?: number;
}

interface BillManagerProps {
    bills: Bill[];
    onAdd: (bill: Omit<Bill, 'id'>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Bill>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onMarkPaid: (id: string) => Promise<void>;
}

const billCategories = [
    { name: 'Utilities', icon: '💡' },
    { name: 'Internet', icon: '📶' },
    { name: 'Phone', icon: '📱' },
    { name: 'Insurance', icon: '🛡️' },
    { name: 'Rent/Mortgage', icon: '🏠' },
    { name: 'Streaming', icon: '📺' },
    { name: 'Subscription', icon: '🔄' },
    { name: 'Other', icon: '📋' },
];

function getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function BillCard({
    bill,
    onEdit,
    onDelete,
    onMarkPaid
}: {
    bill: Bill;
    onEdit: () => void;
    onDelete: () => void;
    onMarkPaid: () => void;
}) {
    const [markingPaid, setMarkingPaid] = useState(false);
    const daysUntil = getDaysUntilDue(bill.due_date);
    const isOverdue = daysUntil < 0;
    const isDueSoon = daysUntil >= 0 && daysUntil <= 3;
    const preset = billCategories.find(c => c.name === bill.category);

    const handleMarkPaid = async () => {
        setMarkingPaid(true);
        await onMarkPaid();
        setMarkingPaid(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-xl border transition-colors ${bill.is_paid
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                    : isOverdue
                        ? 'bg-red-500/5 border-red-500/20'
                        : isDueSoon
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bill.is_paid ? 'bg-emerald-500/20' : 'bg-white/[0.04]'
                        }`}>
                        {bill.is_paid ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <span className="text-lg">{preset?.icon || '📋'}</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium">{bill.name}</h3>
                            {bill.is_autopay && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                    <Zap className="w-2.5 h-2.5" />
                                    Autopay
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="capitalize">{bill.frequency}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(bill.due_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="font-mono font-medium">${bill.amount.toLocaleString()}</p>
                        {!bill.is_paid && (
                            <p className={`text-xs ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-slate-500'
                                }`}>
                                {isOverdue
                                    ? `${Math.abs(daysUntil)} days overdue`
                                    : daysUntil === 0
                                        ? 'Due today'
                                        : `Due in ${daysUntil} days`
                                }
                            </p>
                        )}
                        {bill.is_paid && (
                            <p className="text-xs text-emerald-400">Paid</p>
                        )}
                    </div>

                    {!bill.is_paid && (
                        <button
                            onClick={handleMarkPaid}
                            disabled={markingPaid}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        >
                            {markingPaid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    <div className="flex items-center gap-1">
                        <button
                            onClick={onEdit}
                            className="p-2 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Overdue Alert */}
            {isOverdue && !bill.is_paid && (
                <motion.div
                    className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AlertCircle className="w-4 h-4" />
                    This bill is overdue! Please pay as soon as possible.
                </motion.div>
            )}
        </motion.div>
    );
}

function AddBillModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (bill: Omit<Bill, 'id'>) => Promise<void>;
}) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [frequency, setFrequency] = useState<Bill['frequency']>('monthly');
    const [category, setCategory] = useState('');
    const [isAutopay, setIsAutopay] = useState(false);
    const [reminderDays, setReminderDays] = useState('3');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !dueDate) return;

        setLoading(true);
        await onAdd({
            name,
            amount: parseFloat(amount),
            due_date: dueDate,
            frequency,
            category: category || 'Other',
            is_autopay: isAutopay,
            is_paid: false,
            reminder_days: parseInt(reminderDays) || 3,
        });
        setLoading(false);
        onClose();

        // Reset
        setName('');
        setAmount('');
        setDueDate('');
        setFrequency('monthly');
        setCategory('');
        setIsAutopay(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-md max-h-[84vh] overflow-y-auto rounded-2xl bg-[#0d0d12] border border-white/[0.08]"
                    >
                        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/[0.06] bg-[#0d0d12]">
                            <h2 className="text-lg font-semibold">Add Bill</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04]">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Category</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {billCategories.map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setCategory(cat.name)}
                                            className={`p-2 rounded-xl border transition-all text-center ${category === cat.name
                                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                                                }`}
                                        >
                                            <span className="text-lg">{cat.icon}</span>
                                            <p className="text-[10px] mt-0.5 text-slate-400">{cat.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Bill Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Electric Bill"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Amount *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="150"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Due Date *</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Frequency</label>
                                    <select
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="once">One-time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Remind Before</label>
                                    <select
                                        value={reminderDays}
                                        onChange={(e) => setReminderDays(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    >
                                        <option value="1">1 day</option>
                                        <option value="3">3 days</option>
                                        <option value="5">5 days</option>
                                        <option value="7">7 days</option>
                                    </select>
                                </div>
                            </div>

                            {/* Autopay Toggle */}
                            <div
                                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer"
                                onClick={() => setIsAutopay(!isAutopay)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Zap className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Autopay Enabled</p>
                                        <p className="text-xs text-slate-500">This bill is paid automatically</p>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${isAutopay ? 'bg-purple-500' : 'bg-white/10'
                                    }`}>
                                    <motion.div
                                        className="w-5 h-5 rounded-full bg-white"
                                        animate={{ x: isAutopay ? 20 : 0 }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name || !amount || !dueDate}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Add Bill
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Main Component
export function BillManager({
    bills,
    onAdd,
    onUpdate,
    onDelete,
    onMarkPaid
}: BillManagerProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    // Sort: overdue first, then by due date
    const sortedBills = [...bills].sort((a, b) => {
        if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    const overdueBills = sortedBills.filter(b => !b.is_paid && getDaysUntilDue(b.due_date) < 0);
    const upcomingBills = sortedBills.filter(b => !b.is_paid && getDaysUntilDue(b.due_date) >= 0);
    const paidBills = sortedBills.filter(b => b.is_paid);

    const totalDue = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
    const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Bills</h2>
                    <p className="text-sm text-slate-500">Track and pay your bills on time</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Bill
                </button>
            </div>

            {/* Summary */}
            {bills.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <p className="text-xs text-slate-500 mb-1">Total Bills</p>
                        <p className="text-xl font-medium">{bills.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <p className="text-xs text-slate-500 mb-1">Total Due</p>
                        <p className="text-xl font-mono">${totalDue.toLocaleString()}</p>
                    </div>
                    {totalOverdue > 0 && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-400 mb-1">Overdue</p>
                            <p className="text-xl font-mono text-red-400">${totalOverdue.toLocaleString()}</p>
                        </div>
                    )}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <p className="text-xs text-slate-500 mb-1">Paid This Month</p>
                        <p className="text-xl text-emerald-400">{paidBills.length}</p>
                    </div>
                </div>
            )}

            {/* Bills List */}
            {bills.length > 0 ? (
                <div className="space-y-6">
                    {/* Overdue Bills */}
                    {overdueBills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Overdue ({overdueBills.length})
                            </h3>
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {overdueBills.map((bill) => (
                                        <BillCard
                                            key={bill.id}
                                            bill={bill}
                                            onEdit={() => { }}
                                            onDelete={() => onDelete(bill.id)}
                                            onMarkPaid={() => onMarkPaid(bill.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Bills */}
                    {upcomingBills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Upcoming ({upcomingBills.length})
                            </h3>
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {upcomingBills.map((bill) => (
                                        <BillCard
                                            key={bill.id}
                                            bill={bill}
                                            onEdit={() => { }}
                                            onDelete={() => onDelete(bill.id)}
                                            onMarkPaid={() => onMarkPaid(bill.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Paid Bills */}
                    {paidBills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Paid ({paidBills.length})
                            </h3>
                            <div className="space-y-3">
                                {paidBills.slice(0, 3).map((bill) => (
                                    <BillCard
                                        key={bill.id}
                                        bill={bill}
                                        onEdit={() => { }}
                                        onDelete={() => onDelete(bill.id)}
                                        onMarkPaid={() => { }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No bills tracked</h3>
                    <p className="text-sm text-slate-500 mb-4">Add your recurring bills to never miss a payment</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm"
                    >
                        Add Bill
                    </button>
                </div>
            )}

            {/* Add Modal */}
            <AddBillModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={onAdd}
            />
        </div>
    );
}

export default BillManager;
