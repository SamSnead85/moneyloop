'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    CreditCard,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Edit3,
    Trash2,
    Zap,
    MoreVertical,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Bill {
    id: string;
    name: string;
    amount: number;
    due_date: string;
    frequency: string;
    category?: string;
    autopay: boolean;
    status: 'pending' | 'paid' | 'overdue' | 'scheduled';
}

const mockBills: Bill[] = [
    { id: '1', name: 'Electric Bill', amount: 125, due_date: '2026-01-10', frequency: 'monthly', category: 'Utilities', autopay: false, status: 'pending' },
    { id: '2', name: 'Internet', amount: 80, due_date: '2026-01-12', frequency: 'monthly', category: 'Utilities', autopay: true, status: 'scheduled' },
    { id: '3', name: 'Phone', amount: 85, due_date: '2026-01-15', frequency: 'monthly', category: 'Utilities', autopay: false, status: 'pending' },
    { id: '4', name: 'Car Lease', amount: 450, due_date: '2026-01-20', frequency: 'monthly', category: 'Transportation', autopay: true, status: 'scheduled' },
    { id: '5', name: 'Car Insurance', amount: 150, due_date: '2026-01-25', frequency: 'monthly', category: 'Insurance', autopay: true, status: 'scheduled' },
    { id: '6', name: 'Mortgage', amount: 2400, due_date: '2026-01-01', frequency: 'monthly', category: 'Housing', autopay: true, status: 'paid' },
    { id: '7', name: 'HOA Fees', amount: 350, due_date: '2026-01-01', frequency: 'monthly', category: 'Housing', autopay: false, status: 'paid' },
    { id: '8', name: 'Credit Card Minimum', amount: 125, due_date: '2026-01-05', frequency: 'monthly', category: 'Debt', autopay: false, status: 'overdue' },
];

function getDaysUntil(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueDate(dateStr: string): string {
    const days = getDaysUntil(dateStr);
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days} days`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>(mockBills);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

    useEffect(() => {
        async function fetchBills() {
            const supabase = createClient();
            const { data } = await supabase
                .from('bills')
                .select('*')
                .order('due_date', { ascending: true });

            if (data?.length) setBills(data);
        }
        fetchBills();
    }, []);

    const filteredBills = bills.filter(b => filter === 'all' || b.status === filter);
    const totalDue = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
    const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);
    const upcomingCount = bills.filter(b => b.status === 'pending' || b.status === 'scheduled').length;
    const autopayCount = bills.filter(b => b.autopay).length;

    const handleMarkPaid = async (id: string) => {
        setBills(bills.map(b => b.id === id ? { ...b, status: 'paid' as const } : b));
        const supabase = createClient();
        await supabase.from('bills').update({ status: 'paid', last_paid_date: new Date().toISOString() }).eq('id', id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Bills</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage recurring payments</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add Bill
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Due</p>
                            <p className="text-xl font-semibold">${totalDue.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${overdueAmount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                            <AlertTriangle className={`w-5 h-5 ${overdueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Overdue</p>
                            <p className={`text-xl font-semibold ${overdueAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                ${overdueAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Upcoming</p>
                            <p className="text-xl font-semibold">{upcomingCount} bills</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">On Autopay</p>
                            <p className="text-xl font-semibold">{autopayCount} bills</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
                {(['all', 'pending', 'paid', 'overdue'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === f
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Bills List */}
            <Card className="overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                    {filteredBills.map((bill, index) => {
                        const daysUntil = getDaysUntil(bill.due_date);
                        const isOverdue = daysUntil < 0 && bill.status !== 'paid';
                        const isDueSoon = daysUntil <= 3 && daysUntil >= 0 && bill.status !== 'paid';

                        return (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
                            >
                                {/* Status Icon */}
                                <div className={`p-2.5 rounded-xl ${bill.status === 'paid' ? 'bg-emerald-500/10' :
                                        isOverdue ? 'bg-red-500/10' :
                                            isDueSoon ? 'bg-amber-500/10' :
                                                'bg-white/[0.04]'
                                    }`}>
                                    {bill.status === 'paid' ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    ) : isOverdue ? (
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    ) : (
                                        <CreditCard className={`w-5 h-5 ${isDueSoon ? 'text-amber-400' : 'text-slate-400'}`} />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{bill.name}</span>
                                        {bill.autopay && (
                                            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                                                Autopay
                                            </span>
                                        )}
                                        {bill.status === 'paid' && (
                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                Paid
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                        <span>{bill.category}</span>
                                        <span>•</span>
                                        <span>{bill.frequency}</span>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="text-right">
                                    <p className={`text-sm ${isOverdue ? 'text-red-400' :
                                            isDueSoon ? 'text-amber-400' :
                                                bill.status === 'paid' ? 'text-slate-500' :
                                                    'text-slate-400'
                                        }`}>
                                        {formatDueDate(bill.due_date)}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right min-w-[100px]">
                                    <p className="font-semibold font-mono">
                                        ${bill.amount.toLocaleString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                {bill.status !== 'paid' && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleMarkPaid(bill.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        Mark Paid
                                    </Button>
                                )}

                                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.04] transition-all">
                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredBills.length === 0 && (
                    <div className="p-8 text-center">
                        <CreditCard className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-500">No bills in this category</p>
                    </div>
                )}
            </Card>

            {/* Add Bill Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <Card className="relative z-10 w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Add New Bill</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Bill Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Electric Bill"
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 block mb-1.5">Amount</label>
                                    <input
                                        type="number"
                                        placeholder="125"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 block mb-1.5">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Frequency</label>
                                <select className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50">
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="autopay" className="rounded" />
                                <label htmlFor="autopay" className="text-sm text-slate-400">Enable Autopay tracking</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                                <Button onClick={() => setShowAddModal(false)} className="flex-1">Add Bill</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
