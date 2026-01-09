'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    BellOff,
    Check,
    X,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    ChevronRight,
    Trash2,
    Settings,
    DollarSign,
    CreditCard,
    Target,
    TrendingUp,
    Calendar,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'transaction' | 'budget' | 'goal' | 'bill' | 'insight' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read?: boolean;
    actionLabel?: string;
    actionHref?: string;
    metadata?: Record<string, unknown>;
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onDelete?: (id: string) => void;
    onClearAll?: () => void;
    onAction?: (notification: Notification) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

// ===== HELPERS =====

const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
};

const typeColors = {
    info: 'var(--chart-3)',
    success: 'var(--accent-success)',
    warning: 'var(--accent-warning)',
    error: 'var(--accent-danger)',
};

const categoryIcons = {
    transaction: DollarSign,
    budget: CreditCard,
    goal: Target,
    bill: Calendar,
    insight: TrendingUp,
    system: Settings,
};

const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
};

// ===== NOTIFICATION CENTER =====

export function NotificationCenter({
    notifications,
    onMarkRead,
    onMarkAllRead,
    onDelete,
    onClearAll,
    onAction,
    isOpen = false,
    onClose,
}: NotificationCenterProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    // Group by date
    const groupedNotifications = filteredNotifications.reduce((groups, n) => {
        const date = new Date(n.timestamp).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : date;
        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
        return groups;
    }, {} as Record<string, Notification[]>);

    if (!isOpen) return null;

    return (
        <Surface
            elevation={2}
            className="fixed right-4 top-16 w-96 max-h-[80vh] overflow-hidden flex flex-col z-50 p-0"
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[var(--text-tertiary)]" />
                        <Text variant="heading-md">Notifications</Text>
                        {unreadCount > 0 && (
                            <Badge variant="danger" size="sm">{unreadCount}</Badge>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-elevated)]">
                        <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                filter === 'all'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                filter === 'unread'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                            )}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-sm text-[var(--accent-primary)] hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedNotifications).map(([date, items]) => (
                    <div key={date}>
                        <div className="px-4 py-2 bg-[var(--surface-elevated)]">
                            <Text variant="caption" color="tertiary" className="uppercase tracking-wider">
                                {date}
                            </Text>
                        </div>
                        {items.map(notification => {
                            const TypeIcon = typeIcons[notification.type];
                            const CategoryIcon = categoryIcons[notification.category];

                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer',
                                        !notification.read && 'bg-[var(--accent-primary-subtle)]/30'
                                    )}
                                    onClick={() => {
                                        if (!notification.read) onMarkRead?.(notification.id);
                                        if (notification.actionHref) onAction?.(notification);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `color-mix(in srgb, ${typeColors[notification.type]} 15%, transparent)` }}
                                        >
                                            <CategoryIcon
                                                className="w-5 h-5"
                                                style={{ color: typeColors[notification.type] }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Text variant="body-sm" className="font-medium">
                                                    {notification.title}
                                                </Text>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                                                )}
                                            </div>
                                            <Text variant="body-sm" color="tertiary" className="line-clamp-2">
                                                {notification.message}
                                            </Text>
                                            <Text variant="caption" color="tertiary" className="mt-1">
                                                {formatTimeAgo(notification.timestamp)}
                                            </Text>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete?.(notification.id);
                                            }}
                                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-elevated-2)]"
                                        >
                                            <Trash2 className="w-4 h-4 text-[var(--text-quaternary)]" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="p-12 text-center">
                        <BellOff className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                        <Text variant="body-md" color="tertiary">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </Text>
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                    <button
                        onClick={onClearAll}
                        className="w-full py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-danger)] transition-colors"
                    >
                        Clear all notifications
                    </button>
                </div>
            )}
        </Surface>
    );
}

// ===== TOAST SYSTEM =====

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        const duration = toast.duration ?? 5000;

        setToasts(prev => [...prev, { ...toast, id }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const Icon = typeIcons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto"
        >
            <Surface elevation={2} className="p-4 min-w-[320px] max-w-md flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${typeColors[toast.type]} 15%, transparent)` }}
                >
                    <Icon className="w-4 h-4" style={{ color: typeColors[toast.type] }} />
                </div>
                <div className="flex-1 min-w-0">
                    <Text variant="body-sm" className="font-medium">{toast.title}</Text>
                    {toast.message && (
                        <Text variant="body-sm" color="tertiary">{toast.message}</Text>
                    )}
                    {toast.action && (
                        <button
                            onClick={toast.action.onClick}
                            className="mt-2 text-sm text-[var(--accent-primary)] hover:underline"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-[var(--surface-elevated)] shrink-0"
                >
                    <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
            </Surface>
        </motion.div>
    );
}

// ===== NOTIFICATION BADGE =====

interface NotificationBadgeProps {
    count: number;
    onClick?: () => void;
    className?: string;
}

export function NotificationBadge({ count, onClick, className }: NotificationBadgeProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative p-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors',
                className
            )}
        >
            <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-danger)] text-white text-xs font-medium flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}

export default NotificationCenter;
