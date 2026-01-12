'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    CheckCircle,
    AlertCircle,
    Clock,
    DollarSign,
    Users,
    Zap,
    Settings,
    BellOff,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold, Task } from './HouseholdProvider';
import { cn } from '@/lib/utils';

interface TaskNotification {
    id: string;
    type: 'task_claimed' | 'task_completed' | 'task_assigned' | 'task_overdue' | 'member_joined';
    title: string;
    message: string;
    task_id?: string;
    read: boolean;
    created_at: string;
}

interface TaskNotificationsProps {
    showBadge?: boolean;
}

export function TaskNotifications({ showBadge = true }: TaskNotificationsProps) {
    const supabase = createClient();
    const { currentHousehold, tasks, members, currentUser } = useHousehold();

    const [notifications, setNotifications] = useState<TaskNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate notifications from task changes
    useEffect(() => {
        if (!currentHousehold) return;

        // Check for overdue tasks
        const overdueTasks = tasks.filter(t =>
            t.due_date &&
            new Date(t.due_date) < new Date() &&
            t.status !== 'completed' &&
            !t.claimed_by // Not claimed yet
        );

        // Generate overdue notifications
        const overdueNotifications: TaskNotification[] = overdueTasks.slice(0, 3).map(task => ({
            id: `overdue-${task.id}`,
            type: 'task_overdue',
            title: 'Task Overdue',
            message: `"${task.title}" is past due`,
            task_id: task.id,
            read: false,
            created_at: new Date().toISOString(),
        }));

        // Check for recently completed tasks by others
        const recentlyCompleted = tasks.filter(t =>
            t.status === 'completed' &&
            t.completed_at &&
            new Date(t.completed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
            t.claimed_by !== currentUser?.id
        );

        const completedNotifications: TaskNotification[] = recentlyCompleted.slice(0, 3).map(task => {
            const claimer = members.find(m => m.user_id === task.claimed_by);
            return {
                id: `completed-${task.id}`,
                type: 'task_completed',
                title: 'Task Completed',
                message: `${claimer?.profile?.full_name || 'Someone'} completed "${task.title}"`,
                task_id: task.id,
                read: false,
                created_at: task.completed_at!,
            };
        });

        setNotifications([...overdueNotifications, ...completedNotifications]);
    }, [tasks, members, currentHousehold, currentUser]);

    // Subscribe to real-time task updates
    useEffect(() => {
        if (!currentHousehold) return;

        const channel = supabase
            .channel(`task-notifications-${currentHousehold.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tasks',
                    filter: `household_id=eq.${currentHousehold.id}`,
                },
                (payload) => {
                    const task = payload.new as Task;
                    const oldTask = payload.old as Task;

                    // Task was claimed
                    if (task.claimed_by && !oldTask.claimed_by && task.claimed_by !== currentUser?.id) {
                        const claimer = members.find(m => m.user_id === task.claimed_by);
                        addNotification({
                            type: 'task_claimed',
                            title: 'Task Claimed',
                            message: `${claimer?.profile?.full_name || 'Someone'} claimed "${task.title}"`,
                            task_id: task.id,
                        });
                    }

                    // Task was completed
                    if (task.status === 'completed' && oldTask.status !== 'completed' && task.claimed_by !== currentUser?.id) {
                        const claimer = members.find(m => m.user_id === task.claimed_by);
                        addNotification({
                            type: 'task_completed',
                            title: 'Task Completed',
                            message: `${claimer?.profile?.full_name || 'Someone'} completed "${task.title}"`,
                            task_id: task.id,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentHousehold, members, currentUser]);

    const addNotification = (notif: Omit<TaskNotification, 'id' | 'read' | 'created_at'>) => {
        const newNotif: TaskNotification = {
            ...notif,
            id: `${notif.type}-${Date.now()}`,
            read: false,
            created_at: new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: TaskNotification['type']) => {
        switch (type) {
            case 'task_claimed': return Users;
            case 'task_completed': return CheckCircle;
            case 'task_assigned': return Zap;
            case 'task_overdue': return AlertCircle;
            case 'member_joined': return Users;
            default: return Bell;
        }
    };

    const getNotificationColor = (type: TaskNotification['type']) => {
        switch (type) {
            case 'task_claimed': return 'text-amber-400 bg-amber-500/20';
            case 'task_completed': return 'text-emerald-400 bg-emerald-500/20';
            case 'task_assigned': return 'text-purple-400 bg-purple-500/20';
            case 'task_overdue': return 'text-red-400 bg-red-500/20';
            case 'member_joined': return 'text-blue-400 bg-blue-500/20';
            default: return 'text-zinc-400 bg-zinc-800';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'relative p-2 rounded-lg transition-colors',
                    isOpen ? 'bg-zinc-700' : 'hover:bg-zinc-800',
                )}
            >
                <Bell className="w-5 h-5 text-zinc-400" />
                {showBadge && unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <h3 className="font-medium text-zinc-200">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <BellOff className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                                    <p className="text-sm text-zinc-500">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800">
                                    {notifications.map(notif => {
                                        const Icon = getNotificationIcon(notif.type);
                                        const colorClass = getNotificationColor(notif.type);

                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                className={cn(
                                                    'flex gap-3 p-4 cursor-pointer transition-colors',
                                                    notif.read ? 'bg-zinc-900' : 'bg-zinc-800/30'
                                                )}
                                            >
                                                <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-200">{notif.title}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{notif.message}</p>
                                                    <p className="text-xs text-zinc-600 mt-1">
                                                        {formatTime(notif.created_at)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearNotification(notif.id);
                                                    }}
                                                    className="p-1 rounded hover:bg-zinc-700 transition-colors"
                                                >
                                                    <X className="w-3 h-3 text-zinc-600" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-zinc-800">
                            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm text-zinc-400">
                                <Settings className="w-4 h-4" />
                                Notification Settings
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TaskNotifications;
