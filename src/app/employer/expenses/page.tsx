'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Receipt,
    CreditCard,
    DollarSign,
    Upload,
    Download,
    Camera,
    Check,
    X,
    Clock,
    AlertCircle,
    ChevronRight,
    Filter,
    Search,
    Plus,
    Building2,
    Plane,
    UtensilsCrossed,
    Car,
    Monitor,
    FileText,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface Expense {
    id: string;
    employeeId: string;
    employeeName: string;
    category: 'travel' | 'meals' | 'supplies' | 'software' | 'equipment' | 'transportation' | 'other';
    description: string;
    amount: number;
    date: string;
    status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
    receipt?: boolean;
    merchantName?: string;
    notes?: string;
}

// Mock data
const mockExpenses: Expense[] = [
    { id: '1', employeeId: '1', employeeName: 'Sarah Chen', category: 'travel', description: 'Flight to SF', amount: 425.00, date: '2026-01-23', status: 'pending', receipt: true, merchantName: 'United Airlines' },
    { id: '2', employeeId: '2', employeeName: 'Marcus Johnson', category: 'meals', description: 'Team lunch', amount: 156.78, date: '2026-01-22', status: 'pending', receipt: true, merchantName: 'Chez Panisse' },
    { id: '3', employeeId: '1', employeeName: 'Sarah Chen', category: 'software', description: 'Figma Pro Annual', amount: 180.00, date: '2026-01-20', status: 'approved', receipt: true, merchantName: 'Figma' },
    { id: '4', employeeId: '3', employeeName: 'Emily Rodriguez', category: 'supplies', description: 'Office supplies', amount: 89.45, date: '2026-01-18', status: 'reimbursed', receipt: true, merchantName: 'Staples' },
    { id: '5', employeeId: '5', employeeName: 'Casey Morgan', category: 'transportation', description: 'Uber to client', amount: 34.50, date: '2026-01-17', status: 'approved', receipt: true, merchantName: 'Uber' },
    { id: '6', employeeId: '4', employeeName: 'Jordan Taylor', category: 'equipment', description: 'Webcam', amount: 129.99, date: '2026-01-15', status: 'reimbursed', receipt: true, merchantName: 'Best Buy' },
];

// Category config
const categoryConfig = {
    travel: { label: 'Travel', icon: Plane, color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10' },
    meals: { label: 'Meals', icon: UtensilsCrossed, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    supplies: { label: 'Supplies', icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    software: { label: 'Software', icon: Monitor, color: 'text-[#34d399]', bg: 'bg-[#34d399]/10' },
    equipment: { label: 'Equipment', icon: Monitor, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    transportation: { label: 'Transport', icon: Car, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    other: { label: 'Other', icon: Receipt, color: 'text-white/40', bg: 'bg-white/10' },
};

// Expense Row
function ExpenseRow({
    expense,
    onApprove,
    onReject
}: {
    expense: Expense;
    onApprove: () => void;
    onReject: () => void;
}) {
    const catConfig = categoryConfig[expense.category];
    const CatIcon = catConfig.icon;

    const getStatusConfig = (status: Expense['status']) => {
        switch (status) {
            case 'pending': return { label: 'Pending', color: 'bg-amber-400/10 text-amber-400' };
            case 'approved': return { label: 'Approved', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' };
            case 'rejected': return { label: 'Rejected', color: 'bg-rose-400/10 text-rose-400' };
            case 'reimbursed': return { label: 'Reimbursed', color: 'bg-[#34d399]/10 text-[#34d399]' };
        }
    };

    const statusConfig = getStatusConfig(expense.status);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${catConfig.bg} flex items-center justify-center`}>
                    <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{expense.description}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{expense.employeeName}</span>
                        <span>·</span>
                        <span>{expense.date}</span>
                        {expense.merchantName && (
                            <>
                                <span>·</span>
                                <span>{expense.merchantName}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <p className="text-lg font-medium text-white">${expense.amount.toFixed(2)}</p>

                {expense.receipt && (
                    <div className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center" title="Has receipt">
                        <FileText className="w-3 h-3 text-white/40" />
                    </div>
                )}

                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>

                {expense.status === 'pending' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onApprove}
                            className="p-1.5 rounded-lg bg-[#34d399]/10 hover:bg-[#34d399]/20 transition-colors"
                        >
                            <Check className="w-4 h-4 text-[#34d399]" />
                        </button>
                        <button
                            onClick={onReject}
                            className="p-1.5 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-rose-400" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Main Component
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState(mockExpenses);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const pendingExpenses = expenses.filter(e => e.status === 'pending');
    const pendingTotal = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const approvedTotal = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
    const reimbursedTotal = expenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0);

    const handleApprove = (id: string) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
    };

    const handleReject = (id: string) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
    };

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Expenses</h1>
                    <p className="text-white/50">Manage employee expense reports and reimbursements</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{pendingExpenses.length}</p>
                            <p className="text-xs text-white/40">Pending Review</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">${pendingTotal.toFixed(0)}</p>
                            <p className="text-xs text-white/40">Pending Amount</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">${approvedTotal.toFixed(0)}</p>
                            <p className="text-xs text-white/40">Approved</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">${reimbursedTotal.toFixed(0)}</p>
                            <p className="text-xs text-white/40">Reimbursed (Mo)</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Alert */}
            {pendingExpenses.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <div>
                            <p className="font-medium text-white">{pendingExpenses.length} expenses need review</p>
                            <p className="text-sm text-white/50">Total: ${pendingTotal.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="border-rose-400/30 text-rose-400 hover:bg-rose-400/10">
                            Reject All
                        </Button>
                        <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                            <Check className="w-4 h-4" />
                            Approve All
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl">
                    {['all', 'pending', 'approved', 'reimbursed', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === status
                                    ? 'bg-[#0ea5e9] text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expense List */}
            <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                    {filteredExpenses.map((expense) => (
                        <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            onApprove={() => handleApprove(expense.id)}
                            onReject={() => handleReject(expense.id)}
                        />
                    ))}
                </div>
            </Card>

            {filteredExpenses.length === 0 && (
                <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No expenses found</p>
                </div>
            )}

            {/* Expense Policies */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Expense Policy Quick Reference</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { category: 'Meals', limit: '$75/person', icon: UtensilsCrossed },
                        { category: 'Travel', limit: 'Pre-approval req.', icon: Plane },
                        { category: 'Software', limit: '$500/mo', icon: Monitor },
                        { category: 'Equipment', limit: 'Manager approval', icon: Monitor },
                    ].map((policy) => (
                        <div key={policy.category} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <policy.icon className="w-5 h-5 text-[#0ea5e9] mb-2" />
                            <p className="text-sm font-medium text-white">{policy.category}</p>
                            <p className="text-xs text-white/40">{policy.limit}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
