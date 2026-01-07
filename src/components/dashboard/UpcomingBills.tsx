'use client';

import { motion } from 'framer-motion';
import { CreditCard, Calendar, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';

interface Bill {
    id: string;
    name: string;
    amount: number;
    due_date: string;
    status: 'upcoming' | 'due_soon' | 'overdue' | 'paid';
    autopay?: boolean;
}

interface UpcomingBillsProps {
    bills?: Bill[];
    maxBills?: number;
}

const getMockBills = (): Bill[] => {
    const today = new Date();
    return [
        { id: '1', name: 'Electric Bill', amount: 125, due_date: addDays(today, 3), status: 'due_soon' },
        { id: '2', name: 'Internet', amount: 80, due_date: addDays(today, 5), status: 'upcoming', autopay: true },
        { id: '3', name: 'Phone', amount: 85, due_date: addDays(today, 7), status: 'upcoming' },
        { id: '4', name: 'Car Lease', amount: 450, due_date: addDays(today, 9), status: 'upcoming', autopay: true },
        { id: '5', name: 'Credit Card', amount: 1200, due_date: addDays(today, 12), status: 'upcoming' },
    ];
};

function addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusConfig = {
    overdue: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
    due_soon: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Calendar },
    upcoming: { color: 'text-slate-400', bg: 'bg-white/[0.04]', icon: Calendar },
    paid: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
};

export function UpcomingBills({ bills: propBills, maxBills = 5 }: UpcomingBillsProps) {
    const bills = (propBills || getMockBills()).slice(0, maxBills);

    const totalUpcoming = bills.reduce((sum, bill) => sum + bill.amount, 0);

    return (
        <Card padding="lg" hover={false}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold">Upcoming Bills</h3>
                </div>
                <span className="text-sm font-mono text-slate-400">
                    ${totalUpcoming.toLocaleString()}
                </span>
            </div>

            <div className="space-y-2">
                {bills.map((bill, index) => {
                    const config = statusConfig[bill.status];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.bg}`}>
                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{bill.name}</span>
                                        {bill.autopay && (
                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                Autopay
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-xs ${config.color}`}>
                                        {formatDate(bill.due_date)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                    ${bill.amount.toLocaleString()}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <button
                onClick={() => window.location.href = '/dashboard/bills'}
                className="w-full mt-4 py-2.5 text-sm text-slate-400 hover:text-white border border-white/[0.06] rounded-xl hover:bg-white/[0.02] transition-all"
            >
                View All Bills
            </button>
        </Card>
    );
}
