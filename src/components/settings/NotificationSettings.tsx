'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Bell,
    BellOff,
    BellRing,
    CheckCircle,
    AlertTriangle,
    CreditCard,
    Calendar,
    TrendingDown,
    Target,
    Loader2,
} from 'lucide-react';

interface NotificationPreference {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
}

export function NotificationSettings() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isEnabling, setIsEnabling] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreference[]>([
        {
            id: 'bills',
            label: 'Bill Reminders',
            description: 'Get notified before bills are due',
            icon: Calendar,
            enabled: true,
        },
        {
            id: 'spending',
            label: 'Spending Alerts',
            description: 'Alert when you exceed budget categories',
            icon: TrendingDown,
            enabled: true,
        },
        {
            id: 'goals',
            label: 'Goal Progress',
            description: 'Celebrate milestones and progress updates',
            icon: Target,
            enabled: true,
        },
        {
            id: 'subscriptions',
            label: 'Subscription Renewals',
            description: 'Reminders before subscriptions renew',
            icon: CreditCard,
            enabled: false,
        },
    ]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return;

        setIsEnabling(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Register service worker if needed
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;

                    // Subscribe to push notifications
                    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                    const subscriptionOptions: PushSubscriptionOptionsInit = {
                        userVisibleOnly: true,
                    };

                    if (vapidKey) {
                        subscriptionOptions.applicationServerKey = urlBase64ToUint8Array(vapidKey);
                    }

                    const subscription = await registration.pushManager.subscribe(subscriptionOptions);

                    // Send subscription to server
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(subscription),
                    });
                }

                // Show test notification
                new Notification('MoneyLoop Notifications Enabled', {
                    body: "You'll now receive important financial alerts",
                    icon: '/icon-192x192.png',
                });
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        } finally {
            setIsEnabling(false);
        }
    };

    const togglePreference = (id: string) => {
        setPreferences(prev =>
            prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
        );
    };

    const getStatusColor = () => {
        switch (permission) {
            case 'granted': return 'text-emerald-400';
            case 'denied': return 'text-red-400';
            default: return 'text-amber-400';
        }
    };

    const getStatusText = () => {
        switch (permission) {
            case 'granted': return 'Enabled';
            case 'denied': return 'Blocked';
            default: return 'Not enabled';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                        <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
                    </div>
                </div>

                {permission !== 'granted' && (
                    <Button
                        onClick={requestPermission}
                        disabled={!isSupported || permission === 'denied' || isEnabling}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        {isEnabling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <BellRing className="w-4 h-4" />
                        )}
                        Enable Notifications
                    </Button>
                )}
            </div>

            {/* Not supported warning */}
            {!isSupported && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">
                        Push notifications are not supported in this browser
                    </span>
                </div>
            )}

            {/* Blocked warning */}
            {permission === 'denied' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <BellOff className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">
                        Notifications are blocked. Please enable them in your browser settings.
                    </span>
                </div>
            )}

            {/* Preferences */}
            {permission === 'granted' && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/70">Notification Types</h4>
                    {preferences.map((pref, index) => (
                        <motion.div
                            key={pref.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                    <pref.icon className="w-5 h-5 text-white/70" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{pref.label}</p>
                                    <p className="text-sm text-white/50">{pref.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => togglePreference(pref.id)}
                                className={`relative w-12 h-7 rounded-full transition-colors ${pref.enabled ? 'bg-emerald-500' : 'bg-white/20'
                                    }`}
                            >
                                <motion.div
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                                    animate={{ left: pref.enabled ? '26px' : '4px' }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">About Notifications</h4>
                <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Never miss a bill payment deadline
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Stay on track with spending limits
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Works even when the app is closed
                    </li>
                </ul>
            </div>
        </div>
    );
}

// Helper to convert VAPID key - returns ArrayBuffer which is BufferSource compatible
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    if (!base64String) return new ArrayBuffer(0);
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}

export default NotificationSettings;
