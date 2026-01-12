'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    Filter,
    Zap,
    LayoutGrid,
    List
} from 'lucide-react';
import { useHousehold, Task } from './HouseholdProvider';
import { TaskCard } from '../tasks/TaskCard';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'open' | 'my-tasks' | 'signal' | 'overdue';

export function HouseholdDashboard() {
    const {
        currentHousehold,
        tasks,
        members,
        currentUser,
        loading
    } = useHousehold();

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [showCompleted, setShowCompleted] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentHousehold) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">No household selected</p>
            </div>
        );
    }

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        // Always filter completed unless toggled
        if (!showCompleted && task.status === 'completed') return false;
        if (task.status === 'cancelled') return false;

        switch (filterMode) {
            case 'open':
                return task.status === 'open';
            case 'my-tasks':
                return task.claimed_by === currentUser?.id || task.assigned_to === currentUser?.id;
            case 'signal':
                return task.priority === 'signal';
            case 'overdue':
                return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
            default:
                return true;
        }
    });

    // Stats
    const openTasks = tasks.filter(t => t.status === 'open').length;
    const myClaimedTasks = tasks.filter(t => t.claimed_by === currentUser?.id && t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== 'completed'
    ).length;
    const signalTasks = tasks.filter(t => t.priority === 'signal' && t.status !== 'completed').length;

    const stats = [
        { label: 'Open', value: openTasks, icon: Clock, color: 'text-blue-400' },
        { label: 'My Tasks', value: myClaimedTasks, icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Signal', value: signalTasks, icon: Zap, color: 'text-amber-400' },
        { label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'text-red-400' },
    ];

    const filters: { key: FilterMode; label: string }[] = [
        { key: 'all', label: 'All Tasks' },
        { key: 'open', label: 'Open' },
        { key: 'my-tasks', label: 'My Tasks' },
        { key: 'signal', label: 'Signal Only' },
        { key: 'overdue', label: 'Overdue' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-100">
                        {currentHousehold.name}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {members.length} member{members.length !== 1 ? 's' : ''} • {openTasks} open task{openTasks !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Member avatars */}
                    <div className="flex -space-x-2">
                        {members.slice(0, 4).map((member, i) => (
                            <div
                                key={member.id}
                                className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs font-medium"
                                title={member.profile?.full_name || member.nickname || 'Member'}
                            >
                                {(member.profile?.full_name || member.nickname || 'U')[0].toUpperCase()}
                            </div>
                        ))}
                        {members.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs font-medium">
                                +{members.length - 4}
                            </div>
                        )}
                    </div>

                    <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                        <Users className="w-4 h-4 text-zinc-400" />
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Task</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg bg-zinc-800', stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold font-mono text-zinc-100">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-zinc-500">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setFilterMode(filter.key)}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                                filterMode === filter.key
                                    ? 'bg-zinc-700 text-zinc-100'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-zinc-500">
                        <input
                            type="checkbox"
                            checked={showCompleted}
                            onChange={(e) => setShowCompleted(e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        Show completed
                    </label>

                    <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 transition-colors',
                                viewMode === 'list' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-2 transition-colors',
                                viewMode === 'grid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className={cn(
                viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
            )}>
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 col-span-full"
                        >
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                            <p className="text-zinc-500">No tasks match your filter</p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                compact={viewMode === 'list'}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default HouseholdDashboard;
