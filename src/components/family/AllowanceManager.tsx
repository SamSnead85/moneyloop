'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    Gift,
    Star,
    Plus,
    Minus,
    History,
    Edit2,
    Check,
    X,
    TrendingUp,
    Award,
} from 'lucide-react';
import { useHousehold, HouseholdMember } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

interface Allowance {
    memberId: string;
    weeklyAmount: number;
    balance: number;
    lastPaid: string | null;
}

interface Reward {
    id: string;
    name: string;
    pointsCost: number;
    icon: string;
}

interface AllowanceManagerProps {
    allowances?: Allowance[];
    rewards?: Reward[];
    onUpdateAllowance?: (memberId: string, amount: number) => void;
    onAddBonus?: (memberId: string, amount: number, reason: string) => void;
    onDeductPenalty?: (memberId: string, amount: number, reason: string) => void;
}

export function AllowanceManager({
    allowances = [],
    rewards = [],
    onUpdateAllowance,
    onAddBonus,
    onDeductPenalty,
}: AllowanceManagerProps) {
    const { members, currentMember } = useHousehold();
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [showAction, setShowAction] = useState<{ type: 'bonus' | 'penalty'; memberId: string } | null>(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';

    // Filter to show only members who might have allowances (typically children/dependents)
    const allowanceMembers = members.filter(m =>
        allowances.some(a => a.memberId === m.user_id)
    );

    const getMemberAllowance = (memberId: string) =>
        allowances.find(a => a.memberId === memberId);

    const handleAction = () => {
        if (!showAction || !amount) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        if (showAction.type === 'bonus') {
            onAddBonus?.(showAction.memberId, numAmount, reason);
        } else {
            onDeductPenalty?.(showAction.memberId, numAmount, reason);
        }

        setShowAction(null);
        setAmount('');
        setReason('');
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                        <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-100">Allowance Tracker</h2>
                        <p className="text-sm text-zinc-500">Manage family allowances and rewards</p>
                    </div>
                </div>
            </div>

            {/* Member Allowances */}
            <div className="divide-y divide-zinc-800">
                {allowanceMembers.length === 0 ? (
                    <div className="p-8 text-center">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                        <p className="text-zinc-500">No allowances set up yet</p>
                        {isAdmin && (
                            <button className="mt-4 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                                Set Up Allowances
                            </button>
                        )}
                    </div>
                ) : (
                    allowanceMembers.map(member => {
                        const allowance = getMemberAllowance(member.user_id);
                        if (!allowance) return null;

                        return (
                            <div key={member.id} className="p-5">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                        {(member.profile?.full_name || 'M')[0].toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-200">
                                            {member.profile?.full_name || member.nickname || 'Member'}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            ${allowance.weeklyAmount}/week allowance
                                        </p>
                                    </div>

                                    {/* Balance */}
                                    <div className="text-right">
                                        <p className="text-2xl font-mono font-bold text-emerald-400">
                                            ${allowance.balance.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-zinc-500">Current Balance</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {isAdmin && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <button
                                            onClick={() => setShowAction({ type: 'bonus', memberId: member.user_id })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Bonus
                                        </button>
                                        <button
                                            onClick={() => setShowAction({ type: 'penalty', memberId: member.user_id })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                            Deduct
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors">
                                            <History className="w-3.5 h-3.5" />
                                            History
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Rewards Shop */}
            {rewards.length > 0 && (
                <div className="p-6 border-t border-zinc-800">
                    <h3 className="font-medium text-zinc-200 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        Reward Shop
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {rewards.map(reward => (
                            <div
                                key={reward.id}
                                className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center"
                            >
                                <div className="text-3xl mb-2">{reward.icon}</div>
                                <p className="text-sm font-medium text-zinc-200">{reward.name}</p>
                                <p className="text-xs text-amber-400 mt-1">
                                    <Star className="w-3 h-3 inline mr-1" />
                                    {reward.pointsCost} points
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Modal */}
            <AnimatePresence>
                {showAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAction(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                                {showAction.type === 'bonus' ? 'Add Bonus' : 'Deduct Amount'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="5.00"
                                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Reason</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        placeholder={showAction.type === 'bonus' ? 'Great job on chores!' : 'Missed chore'}
                                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAction(null)}
                                        className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAction}
                                        className={cn(
                                            'flex-1 py-2 rounded-lg font-medium',
                                            showAction.type === 'bonus'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-red-500 text-white'
                                        )}
                                    >
                                        {showAction.type === 'bonus' ? 'Add Bonus' : 'Deduct'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AllowanceManager;
