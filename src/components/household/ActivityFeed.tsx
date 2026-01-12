'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    CheckCircle,
    Hand,
    Plus,
    RefreshCw,
    User,
    Clock,
    MessageSquare,
    ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from './HouseholdProvider';
import { cn } from '@/lib/utils';

interface TaskActivity {
    id: string;
    task_id: string;
    user_id: string;
    action: 'created' | 'claimed' | 'unclaimed' | 'completed' | 'reopened' | 'assigned' | 'updated' | 'commented';
    details: Record<string, unknown>;
    created_at: string;
    // Joined data
    task?: {
        title: string;
        type: string;
    };
    user?: {
        full_name: string;
        email: string;
        avatar_url: string;
    };
}

const actionIcons: Record<TaskActivity['action'], typeof Activity> = {
    created: Plus,
    claimed: Hand,
    unclaimed: RefreshCw,
    completed: CheckCircle,
    reopened: RefreshCw,
    assigned: User,
    updated: RefreshCw,
    commented: MessageSquare,
};

const actionLabels: Record<TaskActivity['action'], string> = {
    created: 'created',
    claimed: 'claimed',
    unclaimed: 'released',
    completed: 'completed',
    reopened: 'reopened',
    assigned: 'assigned',
    updated: 'updated',
    commented: 'commented on',
};

const actionColors: Record<TaskActivity['action'], string> = {
    created: 'text-blue-400',
    claimed: 'text-amber-400',
    unclaimed: 'text-zinc-400',
    completed: 'text-emerald-400',
    reopened: 'text-orange-400',
    assigned: 'text-purple-400',
    updated: 'text-zinc-400',
    commented: 'text-cyan-400',
};

interface ActivityFeedProps {
    limit?: number;
    compact?: boolean;
}

export function ActivityFeed({ limit = 20, compact = false }: ActivityFeedProps) {
    const supabase = createClient();
    const { currentHousehold, currentUser } = useHousehold();

    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentHousehold) return;

        loadActivities();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`activities-${currentHousehold.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'task_activities',
                },
                (payload) => {
                    // Add new activity to the top
                    const newActivity = payload.new as TaskActivity;
                    loadSingleActivity(newActivity.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentHousehold?.id]);

    async function loadActivities() {
        if (!currentHousehold) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('task_activities')
            .select(`
        *,
        task:tasks(title, type),
        user:profiles!user_id(full_name, email, avatar_url)
      `)
            .eq('task.household_id', currentHousehold.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!error && data) {
            setActivities(data);
        }
        setLoading(false);
    }

    async function loadSingleActivity(activityId: string) {
        const { data } = await supabase
            .from('task_activities')
            .select(`
        *,
        task:tasks(title, type),
        user:profiles!user_id(full_name, email, avatar_url)
      `)
            .eq('id', activityId)
            .single();

        if (data) {
            setActivities(prev => [data, ...prev.slice(0, limit - 1)]);
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getUserName = (activity: TaskActivity) => {
        if (activity.user_id === currentUser?.id) return 'You';
        return activity.user?.full_name || activity.user?.email || 'Someone';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                <p className="text-sm text-zinc-500">No activity yet</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {activities.slice(0, 5).map((activity) => {
                    const Icon = actionIcons[activity.action];

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                            <Icon className={cn('w-4 h-4', actionColors[activity.action])} />
                            <p className="text-sm text-zinc-400 truncate flex-1">
                                <span className="text-zinc-200">{getUserName(activity)}</span>
                                {' '}{actionLabels[activity.action]}{' '}
                                <span className="text-zinc-300">{activity.task?.title}</span>
                            </p>
                            <span className="text-xs text-zinc-600">{formatTime(activity.created_at)}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-200">Recent Activity</h3>
                <button
                    onClick={loadActivities}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 text-zinc-500" />
                </button>
            </div>

            <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                    {activities.map((activity, index) => {
                        const Icon = actionIcons[activity.action];

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-3 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors"
                            >
                                {/* User Avatar */}
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium shrink-0">
                                    {(activity.user?.full_name || 'U')[0].toUpperCase()}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium text-zinc-200">
                                            {getUserName(activity)}
                                        </span>
                                        <span className={cn('mx-1.5', actionColors[activity.action])}>
                                            {actionLabels[activity.action]}
                                        </span>
                                        <span className="text-zinc-300">
                                            {activity.task?.title}
                                        </span>
                                    </p>

                                    {typeof activity.details?.notes === 'string' && activity.details.notes && (
                                        <p className="text-xs text-zinc-500 mt-1 italic">
                                            &quot;{activity.details.notes}&quot;
                                        </p>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <div className="flex items-center gap-1 text-xs text-zinc-600 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(activity.created_at)}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ActivityFeed;
