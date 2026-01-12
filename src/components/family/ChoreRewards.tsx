'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Circle,
    Star,
    Sparkles,
    Calendar,
    Users,
    Coins,
    Trophy,
    RefreshCw,
} from 'lucide-react';
import { useHousehold } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

interface Chore {
    id: string;
    name: string;
    points: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    assignedTo?: string;
    completedToday?: boolean;
    icon?: string;
}

interface ChoreReward {
    id: string;
    name: string;
    pointsCost: number;
    icon: string;
    description?: string;
}

interface ChoreRewardsProps {
    chores?: Chore[];
    rewards?: ChoreReward[];
    memberPoints?: Record<string, number>; // userId -> points
    onCompleteChore?: (choreId: string) => void;
    onRedeemReward?: (rewardId: string, memberId: string) => void;
}

const defaultChores: Chore[] = [
    { id: '1', name: 'Make Bed', points: 5, frequency: 'daily', icon: '🛏️' },
    { id: '2', name: 'Clean Room', points: 15, frequency: 'weekly', icon: '🧹' },
    { id: '3', name: 'Take Out Trash', points: 10, frequency: 'daily', icon: '🗑️' },
    { id: '4', name: 'Do Dishes', points: 10, frequency: 'daily', icon: '🍽️' },
    { id: '5', name: 'Walk Dog', points: 15, frequency: 'daily', icon: '🐕' },
    { id: '6', name: 'Mow Lawn', points: 30, frequency: 'weekly', icon: '🌿' },
];

const defaultRewards: ChoreReward[] = [
    { id: 'r1', name: 'Extra Screen Time (30 min)', pointsCost: 25, icon: '📱' },
    { id: 'r2', name: 'Choose Dinner', pointsCost: 40, icon: '🍕' },
    { id: 'r3', name: 'Stay Up Late', pointsCost: 50, icon: '🌙' },
    { id: 'r4', name: 'Allowance Bonus ($5)', pointsCost: 75, icon: '💵' },
    { id: 'r5', name: 'Special Outing', pointsCost: 100, icon: '🎢' },
    { id: 'r6', name: 'New Game/Toy', pointsCost: 200, icon: '🎮' },
];

export function ChoreRewards({
    chores = defaultChores,
    rewards = defaultRewards,
    memberPoints = {},
    onCompleteChore,
    onRedeemReward,
}: ChoreRewardsProps) {
    const { members, currentMember, currentUser } = useHousehold();
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [showRewardModal, setShowRewardModal] = useState<ChoreReward | null>(null);

    const activeMember = selectedMember || currentUser?.id;
    const currentPoints = activeMember ? (memberPoints[activeMember] || 0) : 0;

    // Filter members who participate in chores (non-owners)
    const choreParticipants = members.filter(m =>
        m.role === 'member' || m.role === 'viewer'
    );

    const isParent = currentMember?.role === 'owner' || currentMember?.role === 'admin';

    // Group chores by frequency
    const choresByFreq = useMemo(() => {
        return {
            daily: chores.filter(c => c.frequency === 'daily'),
            weekly: chores.filter(c => c.frequency === 'weekly'),
            monthly: chores.filter(c => c.frequency === 'monthly'),
        };
    }, [chores]);

    const handleComplete = (choreId: string) => {
        onCompleteChore?.(choreId);
        // TODO: Add animation/celebration
    };

    const handleRedeem = (reward: ChoreReward) => {
        if (currentPoints >= reward.pointsCost && activeMember) {
            onRedeemReward?.(reward.id, activeMember);
            setShowRewardModal(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Points Header */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-amber-400 text-sm font-medium">Chore Points</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">{currentPoints}</span>
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                    </div>
                    <Trophy className="w-16 h-16 text-amber-400 opacity-20" />
                </div>

                {/* Member Selector (for parents) */}
                {isParent && choreParticipants.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <div className="flex gap-2">
                            {choreParticipants.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedMember(member.user_id)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-sm transition-colors',
                                        selectedMember === member.user_id
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    )}
                                >
                                    {member.profile?.full_name?.split(' ')[0] || 'Member'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chores List */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Today's Chores
                    </h3>
                </div>

                <div className="divide-y divide-zinc-800">
                    {choresByFreq.daily.map(chore => (
                        <motion.div
                            key={chore.id}
                            className={cn(
                                'flex items-center gap-4 p-4 transition-colors',
                                chore.completedToday ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/50'
                            )}
                        >
                            <button
                                onClick={() => !chore.completedToday && handleComplete(chore.id)}
                                disabled={chore.completedToday}
                                className="shrink-0"
                            >
                                {chore.completedToday ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-zinc-600 hover:text-zinc-400 transition-colors" />
                                )}
                            </button>

                            <span className="text-2xl">{chore.icon}</span>

                            <div className="flex-1">
                                <p className={cn(
                                    'font-medium',
                                    chore.completedToday ? 'text-zinc-500 line-through' : 'text-zinc-200'
                                )}>
                                    {chore.name}
                                </p>
                                <p className="text-xs text-zinc-500 capitalize">{chore.frequency}</p>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400">
                                <span className="font-mono font-bold">+{chore.points}</span>
                                <Star className="w-4 h-4 fill-amber-400" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Chores */}
                {choresByFreq.weekly.length > 0 && (
                    <>
                        <div className="p-4 border-t border-b border-zinc-800 bg-zinc-800/30">
                            <h4 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Weekly Chores
                            </h4>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {choresByFreq.weekly.map(chore => (
                                <div key={chore.id} className="flex items-center gap-4 p-4">
                                    <Circle className="w-6 h-6 text-zinc-600" />
                                    <span className="text-2xl">{chore.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-200">{chore.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <span className="font-mono font-bold">+{chore.points}</span>
                                        <Star className="w-4 h-4 fill-amber-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Rewards Shop */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-emerald-400" />
                        Reward Shop
                    </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {rewards.map(reward => {
                        const canAfford = currentPoints >= reward.pointsCost;

                        return (
                            <button
                                key={reward.id}
                                onClick={() => canAfford && setShowRewardModal(reward)}
                                disabled={!canAfford}
                                className={cn(
                                    'p-4 rounded-xl border text-center transition-all',
                                    canAfford
                                        ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-emerald-500/50 hover:bg-zinc-800'
                                        : 'bg-zinc-800/30 border-zinc-800 opacity-50'
                                )}
                            >
                                <div className="text-4xl mb-2">{reward.icon}</div>
                                <p className="text-sm font-medium text-zinc-200 mb-1">{reward.name}</p>
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className={cn(
                                        'font-mono text-sm font-bold',
                                        canAfford ? 'text-amber-400' : 'text-zinc-500'
                                    )}>
                                        {reward.pointsCost}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Redeem Modal */}
            <AnimatePresence>
                {showRewardModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRewardModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-sm text-center"
                        >
                            <div className="text-6xl mb-4">{showRewardModal.icon}</div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-2">
                                {showRewardModal.name}
                            </h3>
                            <p className="text-zinc-400 mb-4">
                                Redeem for <span className="text-amber-400 font-mono font-bold">{showRewardModal.pointsCost}</span> points?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRewardModal(null)}
                                    className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRedeem(showRewardModal)}
                                    className="flex-1 py-2 rounded-lg bg-emerald-500 text-white font-medium"
                                >
                                    Redeem!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ChoreRewards;
