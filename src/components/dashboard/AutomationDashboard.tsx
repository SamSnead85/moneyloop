'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Zap,
    CreditCard,
    ShoppingCart,
    Settings,
    Play,
    Pause,
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronRight,
    Plus,
    Trash2,
    Edit3,
    RefreshCw,
    Shield
} from 'lucide-react';

interface AutomationRule {
    id: string;
    name: string;
    type: 'bill_payment' | 'subscription' | 'grocery' | 'transfer' | 'savings';
    enabled: boolean;
    lastRun?: string;
    nextRun?: string;
    status: 'active' | 'paused' | 'error' | 'pending';
    config: Record<string, any>;
}

interface AutomationDashboardProps {
    rules?: AutomationRule[];
    onToggle: (id: string, enabled: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onRunNow: (id: string) => Promise<void>;
    pendingApprovals?: number;
}

const automationIcons: Record<string, typeof CreditCard> = {
    bill_payment: CreditCard,
    subscription: Zap,
    grocery: ShoppingCart,
    transfer: RefreshCw,
    savings: Shield,
};

const automationColors: Record<string, { bg: string; text: string }> = {
    bill_payment: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    subscription: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    grocery: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    transfer: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    savings: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

// Sample data
const sampleRules: AutomationRule[] = [
    {
        id: '1',
        name: 'Auto-pay Electric Bill',
        type: 'bill_payment',
        enabled: true,
        lastRun: '2026-01-01T10:00:00Z',
        nextRun: '2026-02-01T10:00:00Z',
        status: 'active',
        config: { provider: 'duke-energy', amount: 'statement_balance' },
    },
    {
        id: '2',
        name: 'Cancel Unused Subscriptions',
        type: 'subscription',
        enabled: true,
        lastRun: '2026-01-05T14:30:00Z',
        status: 'pending',
        config: { threshold_days: 30 },
    },
    {
        id: '3',
        name: 'Weekly Grocery Order',
        type: 'grocery',
        enabled: false,
        lastRun: '2025-12-28T09:00:00Z',
        nextRun: '2026-01-11T09:00:00Z',
        status: 'paused',
        config: { store: 'instacart', budget: 150 },
    },
    {
        id: '4',
        name: 'Round-Up Savings',
        type: 'savings',
        enabled: true,
        lastRun: '2026-01-07T23:59:00Z',
        status: 'active',
        config: { round_to: 1, account: 'savings' },
    },
];

function AutomationCard({
    rule,
    onToggle,
    onDelete,
    onRunNow,
}: {
    rule: AutomationRule;
    onToggle: () => void;
    onDelete: () => void;
    onRunNow: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [running, setRunning] = useState(false);
    const Icon = automationIcons[rule.type] || Bot;
    const colors = automationColors[rule.type] || { bg: 'bg-slate-500/10', text: 'text-slate-400' };

    const handleRunNow = async () => {
        setRunning(true);
        await onRunNow();
        setRunning(false);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-2xl border transition-colors ${rule.status === 'error'
                    ? 'bg-red-500/5 border-red-500/20'
                    : !rule.enabled
                        ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                }`}
        >
            {/* Main Row */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium">{rule.name}</h3>
                            {rule.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400">
                                    Approval Needed
                                </span>
                            )}
                            {rule.status === 'error' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                                    Error
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="capitalize">{rule.type.replace('_', ' ')}</span>
                            {rule.lastRun && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Last: {formatDate(rule.lastRun)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${rule.enabled ? 'bg-emerald-500' : 'bg-white/10'
                            }`}
                    >
                        <motion.div
                            className="w-5 h-5 rounded-full bg-white"
                            animate={{ x: rule.enabled ? 20 : 0 }}
                        />
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''
                        }`} />
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                            {/* Config Details */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {rule.nextRun && (
                                    <div className="p-3 rounded-xl bg-white/[0.02]">
                                        <p className="text-xs text-slate-500 mb-1">Next Run</p>
                                        <p className="text-sm font-medium">{formatDate(rule.nextRun)}</p>
                                    </div>
                                )}
                                <div className="p-3 rounded-xl bg-white/[0.02]">
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    <div className="flex items-center gap-1">
                                        {rule.status === 'active' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                                        {rule.status === 'paused' && <Pause className="w-3 h-3 text-slate-400" />}
                                        {rule.status === 'pending' && <Clock className="w-3 h-3 text-amber-400" />}
                                        {rule.status === 'error' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                        <span className="text-sm capitalize">{rule.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Config Parameters */}
                            {Object.keys(rule.config).length > 0 && (
                                <div className="p-3 rounded-xl bg-white/[0.02] mb-4">
                                    <p className="text-xs text-slate-500 mb-2">Configuration</p>
                                    <div className="space-y-1">
                                        {Object.entries(rule.config).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-mono">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRunNow}
                                    disabled={running || !rule.enabled}
                                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {running ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    Run Now
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function AutomationDashboard({
    rules,
    onToggle,
    onDelete,
    onRunNow,
    pendingApprovals = 0,
}: AutomationDashboardProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const automationRules = rules || sampleRules;

    const activeCount = automationRules.filter(r => r.enabled && r.status === 'active').length;
    const errorCount = automationRules.filter(r => r.status === 'error').length;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        Automations
                    </h2>
                    <p className="text-sm text-slate-500">Set it and forget it</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Rule
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-xs text-slate-500 mb-1">Total Rules</p>
                    <p className="text-2xl font-medium">{automationRules.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 mb-1">Active</p>
                    <p className="text-2xl font-medium text-emerald-400">{activeCount}</p>
                </div>
                {pendingApprovals > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-amber-400 mb-1">Pending Approval</p>
                        <p className="text-2xl font-medium text-amber-400">{pendingApprovals}</p>
                    </div>
                )}
                {errorCount > 0 && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400 mb-1">Errors</p>
                        <p className="text-2xl font-medium text-red-400">{errorCount}</p>
                    </div>
                )}
            </div>

            {/* Automation Rules */}
            {automationRules.length > 0 ? (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {automationRules.map((rule) => (
                            <AutomationCard
                                key={rule.id}
                                rule={rule}
                                onToggle={() => onToggle(rule.id, !rule.enabled)}
                                onDelete={() => onDelete(rule.id)}
                                onRunNow={() => onRunNow(rule.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No automations set up</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Create rules to automate your finances
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm"
                    >
                        Create Rule
                    </button>
                </div>
            )}

            {/* AI Agent Info Card */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                        <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">AI Agent Powered</h3>
                        <p className="text-sm text-slate-400 mb-3">
                            MoneyLoop&apos;s AI agents handle your automations intelligently.
                            They&apos;ll always ask for approval before taking important actions.
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-lg bg-white/[0.04] text-slate-400">
                                🔒 Bank-level encryption
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-white/[0.04] text-slate-400">
                                ✓ Human-in-the-loop
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-white/[0.04] text-slate-400">
                                🛡️ Read-only by default
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AutomationDashboard;
