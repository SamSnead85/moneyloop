'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Lightbulb,
    Bell,
    TrendingUp,
    CreditCard,
    ChevronRight,
    X,
    DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Alert, getMockAlerts } from '@/lib/alerts';

interface CriticalAlertsProps {
    alerts?: Alert[];
    maxAlerts?: number;
}

const severityConfig = {
    critical: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: AlertTriangle,
        iconColor: 'text-red-400',
    },
    warning: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: Bell,
        iconColor: 'text-amber-400',
    },
    info: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: Lightbulb,
        iconColor: 'text-emerald-400',
    },
};

const typeIcons = {
    pattern: TrendingUp,
    threshold: AlertTriangle,
    opportunity: DollarSign,
    predictive: Lightbulb,
    bill: CreditCard,
    subscription: CreditCard,
};

export function CriticalAlerts({ alerts: propAlerts, maxAlerts = 3 }: CriticalAlertsProps) {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    // Use provided alerts or fall back to mock alerts
    const allAlerts = propAlerts || getMockAlerts();

    // Filter out dismissed alerts and limit to maxAlerts
    const visibleAlerts = allAlerts
        .filter(alert => !dismissedIds.has(alert.id) && !alert.dismissed)
        .slice(0, maxAlerts);

    const handleDismiss = (alertId: string) => {
        setDismissedIds(prev => new Set([...prev, alertId]));
    };

    if (visibleAlerts.length === 0) {
        return (
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-semibold">All Clear!</h3>
                </div>
                <p className="text-sm text-slate-500">
                    No critical alerts. Your finances are looking good! 🎉
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {visibleAlerts.map((alert, index) => {
                    const config = severityConfig[alert.severity];
                    const TypeIcon = typeIcons[alert.type] || Lightbulb;

                    return (
                        <motion.div
                            key={alert.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`p-4 ${config.bg} border ${config.border} relative group`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg bg-white/[0.05]`}>
                                        <TypeIcon className={`w-4 h-4 ${config.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-medium text-sm">{alert.title}</h4>
                                            {alert.impact && (
                                                <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                                                    {alert.impact}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                            {alert.message}
                                        </p>

                                        {/* Action */}
                                        {alert.actionLabel && (
                                            <button
                                                onClick={() => alert.actionUrl && (window.location.href = alert.actionUrl)}
                                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                {alert.actionLabel}
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Dismiss button */}
                                    <button
                                        onClick={() => handleDismiss(alert.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.1] transition-all"
                                        aria-label="Dismiss alert"
                                    >
                                        <X className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* View All link */}
            {allAlerts.length > maxAlerts && (
                <button
                    onClick={() => window.location.href = '/dashboard/insights'}
                    className="w-full text-center py-2 text-xs text-slate-500 hover:text-white transition-colors"
                >
                    View all {allAlerts.length} alerts
                </button>
            )}
        </div>
    );
}
