'use client';

import { motion } from 'framer-motion';
import {
    CheckCircle,
    Clock,
    User,
    DollarSign,
    AlertCircle,
    Zap,
    ChevronRight,
    Calendar,
    Tag
} from 'lucide-react';
import { Task, HouseholdMember, useHousehold } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
    onClaim?: (task: Task) => void;
    onComplete?: (task: Task) => void;
    onClick?: (task: Task) => void;
}

const typeIcons: Record<Task['type'], typeof Clock> = {
    bill: DollarSign,
    action: CheckCircle,
    reminder: Clock,
    goal: Zap,
    tax: AlertCircle,
    investment: Zap,
    property: Tag,
};

const typeColors: Record<Task['type'], string> = {
    bill: 'text-red-400',
    action: 'text-blue-400',
    reminder: 'text-yellow-400',
    goal: 'text-emerald-400',
    tax: 'text-orange-400',
    investment: 'text-purple-400',
    property: 'text-cyan-400',
};

const statusStyles: Record<Task['status'], { bg: string; text: string }> = {
    open: { bg: 'bg-zinc-700/50', text: 'text-zinc-300' },
    claimed: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    cancelled: { bg: 'bg-zinc-600/50', text: 'text-zinc-500' },
};

export function TaskCard({ task, compact = false, onClaim, onComplete, onClick }: TaskCardProps) {
    const { currentUser, claimTask, completeTask } = useHousehold();

    const TypeIcon = typeIcons[task.type];
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    const isClaimedByMe = task.claimed_by === currentUser?.id;
    const isSignal = task.priority === 'signal';

    const handleClaim = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClaim) {
            onClaim(task);
        } else {
            await claimTask(task.id);
        }
    };

    const handleComplete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onComplete) {
            onComplete(task);
        } else {
            await completeTask(task.id);
        }
    };

    const formatDueDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (compact) {
        return (
            <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onClick?.(task)}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    'bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800',
                    isSignal && 'border-l-2 border-l-amber-500',
                    task.status === 'completed' && 'opacity-60'
                )}
            >
                <div className={cn('p-1.5 rounded-md bg-zinc-800', typeColors[task.type])}>
                    <TypeIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className={cn(
                        'text-sm font-medium truncate',
                        task.status === 'completed' && 'line-through text-zinc-500'
                    )}>
                        {task.title}
                    </p>
                </div>

                {task.due_date && (
                    <span className={cn(
                        'text-xs',
                        isOverdue ? 'text-red-400' : 'text-zinc-500'
                    )}>
                        {formatDueDate(task.due_date)}
                    </span>
                )}

                {task.amount && (
                    <span className="text-sm font-mono text-zinc-400">
                        ${task.amount.toLocaleString()}
                    </span>
                )}

                <ChevronRight className="w-4 h-4 text-zinc-600" />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onClick?.(task)}
            className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer',
                'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700',
                isSignal && 'ring-1 ring-amber-500/30 border-amber-500/50',
                task.status === 'completed' && 'opacity-60'
            )}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                    'p-2 rounded-lg',
                    task.status === 'completed' ? 'bg-emerald-500/20' : 'bg-zinc-800',
                    typeColors[task.type]
                )}>
                    <TypeIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {isSignal && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                                SIGNAL
                            </span>
                        )}
                        <span className={cn(
                            'px-1.5 py-0.5 text-xs font-medium rounded capitalize',
                            statusStyles[task.status].bg,
                            statusStyles[task.status].text
                        )}>
                            {task.status.replace('_', ' ')}
                        </span>
                    </div>

                    <h3 className={cn(
                        'text-base font-medium leading-tight',
                        task.status === 'completed' && 'line-through text-zinc-500'
                    )}>
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                {task.amount && (
                    <div className="text-right">
                        <p className="text-lg font-mono font-semibold text-zinc-200">
                            ${task.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500">{task.currency}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    {task.due_date && (
                        <div className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-red-400'
                        )}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDueDate(task.due_date)}</span>
                        </div>
                    )}

                    {task.context?.name && (
                        <div className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{task.context.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Claimer avatar */}
                    {task.claimed_by && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                                <User className="w-3 h-3" />
                            </div>
                            <span>{isClaimedByMe ? 'You' : 'Claimed'}</span>
                        </div>
                    )}

                    {/* Actions */}
                    {task.status === 'open' && !task.claimed_by && (
                        <button
                            onClick={handleClaim}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                            Claim
                        </button>
                    )}

                    {(task.status === 'claimed' || task.status === 'in_progress') && isClaimedByMe && (
                        <button
                            onClick={handleComplete}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        >
                            Complete
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default TaskCard;
