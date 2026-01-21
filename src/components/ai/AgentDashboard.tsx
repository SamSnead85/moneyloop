'use client';

/**
 * Agent Dashboard
 * 
 * Unified control panel for MoneyLoop AI agents.
 * Shows agent status, recent results, and allows triggering agent runs.
 * 
 * Phase 21-25 of Sprint 1.1
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Play,
    CheckCircle2,
    AlertCircle,
    Clock,
    Loader2,
    ChevronRight,
    TrendingDown,
    Receipt,
    PiggyBank,
    Wallet,
    RefreshCw,
    X,
} from 'lucide-react';

interface AgentSummary {
    agentType: string;
    displayName: string;
    description: string;
    lastRun?: string;
    lastResult?: {
        potentialSavings: number;
        actionCount: number;
        topAction?: string;
    };
    status: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
    healthScore: number;
}

interface AgentDashboardProps {
    onClose?: () => void;
    isOpen?: boolean;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
    bill_negotiator: <Receipt className="w-5 h-5" />,
    subscription_optimizer: <Wallet className="w-5 h-5" />,
    savings_finder: <PiggyBank className="w-5 h-5" />,
    budget_analyzer: <TrendingDown className="w-5 h-5" />,
};

const STATUS_CONFIG = {
    idle: { color: 'text-[var(--text-tertiary)]', bg: 'bg-[var(--surface-secondary)]', label: 'Ready' },
    queued: { color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Queued' },
    running: { color: 'text-[var(--accent-primary)]', bg: 'bg-[var(--accent-primary)]/10', label: 'Running' },
    completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Completed' },
    failed: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
};

export function AgentDashboard({ onClose, isOpen = true }: AgentDashboardProps) {
    const [agents, setAgents] = useState<AgentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [totalSavings, setTotalSavings] = useState(0);

    // Fetch agent summaries
    const fetchAgents = useCallback(async () => {
        try {
            const response = await fetch('/api/agents');
            if (response.ok) {
                const data = await response.json();
                setAgents(data.agents || []);

                // Calculate total potential savings
                const savings = (data.agents || []).reduce((sum: number, agent: AgentSummary) => {
                    return sum + (agent.lastResult?.potentialSavings || 0);
                }, 0);
                setTotalSavings(savings);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
            // Poll for updates while panel is open
            const interval = setInterval(fetchAgents, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, fetchAgents]);

    // Run a specific agent
    const runAgent = async (agentType: string) => {
        try {
            setAgents(prev => prev.map(a =>
                a.agentType === agentType ? { ...a, status: 'queued' as const } : a
            ));

            await fetch('/api/agents/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentType }),
            });

            // Refresh after a delay
            setTimeout(fetchAgents, 2000);
        } catch (error) {
            console.error('Failed to run agent:', error);
        }
    };

    // Run all agents
    const runAllAgents = async () => {
        setIsRunningAll(true);
        try {
            await fetch('/api/agents/run-all', { method: 'POST' });
            setTimeout(fetchAgents, 2000);
        } catch (error) {
            console.error('Failed to run all agents:', error);
        } finally {
            setIsRunningAll(false);
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--surface-base)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10">
                            <Bot className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI Agents</h2>
                            <p className="text-xs text-[var(--text-tertiary)]">Financial intelligence at work</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <div className="rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--text-secondary)]">Total Potential Savings</span>
                            <button
                                onClick={runAllAgents}
                                disabled={isRunningAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50"
                            >
                                {isRunningAll ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3.5 h-3.5" />
                                )}
                                Run All
                            </button>
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                            ${totalSavings.toLocaleString()}
                            <span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span>
                        </div>
                    </div>
                </div>

                {/* Agent List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-12">
                            <Bot className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
                            <p className="text-[var(--text-secondary)]">No agents configured</p>
                        </div>
                    ) : (
                        agents.map((agent) => (
                            <motion.div
                                key={agent.agentType}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-xl border transition-all cursor-pointer ${selectedAgent === agent.agentType
                                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                                        : 'border-[var(--border-primary)] bg-[var(--surface-secondary)] hover:border-[var(--border-secondary)]'
                                    }`}
                                onClick={() => setSelectedAgent(
                                    selectedAgent === agent.agentType ? null : agent.agentType
                                )}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${STATUS_CONFIG[agent.status].bg}`}>
                                                <span className={STATUS_CONFIG[agent.status].color}>
                                                    {AGENT_ICONS[agent.agentType] || <Bot className="w-5 h-5" />}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-[var(--text-primary)]">
                                                    {agent.displayName}
                                                </h3>
                                                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                                                    {agent.description}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${selectedAgent === agent.agentType ? 'rotate-90' : ''
                                                }`}
                                        />
                                    </div>

                                    {/* Status & Last Run */}
                                    <div className="flex items-center gap-4 mt-3 text-xs">
                                        <div className={`flex items-center gap-1 ${STATUS_CONFIG[agent.status].color}`}>
                                            {agent.status === 'running' ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : agent.status === 'completed' ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : agent.status === 'failed' ? (
                                                <AlertCircle className="w-3 h-3" />
                                            ) : (
                                                <Clock className="w-3 h-3" />
                                            )}
                                            {STATUS_CONFIG[agent.status].label}
                                        </div>
                                        <span className="text-[var(--text-tertiary)]">
                                            Last run: {formatTimeAgo(agent.lastRun)}
                                        </span>
                                    </div>

                                    {/* Health Score Bar */}
                                    <div className="mt-3">
                                        <div className="h-1.5 rounded-full bg-[var(--surface-tertiary)] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${agent.healthScore}%` }}
                                                className={`h-full rounded-full ${agent.healthScore >= 80 ? 'bg-emerald-400' :
                                                        agent.healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {selectedAgent === agent.agentType && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-[var(--border-primary)]"
                                        >
                                            <div className="p-4 space-y-3">
                                                {agent.lastResult && (
                                                    <>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[var(--text-secondary)]">Potential Savings</span>
                                                            <span className="font-medium text-emerald-400">
                                                                ${agent.lastResult.potentialSavings}/mo
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[var(--text-secondary)]">Actions Found</span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                {agent.lastResult.actionCount}
                                                            </span>
                                                        </div>
                                                        {agent.lastResult.topAction && (
                                                            <div className="text-sm">
                                                                <span className="text-[var(--text-tertiary)]">Top Action:</span>
                                                                <p className="mt-1 text-[var(--text-secondary)] text-xs line-clamp-2">
                                                                    {agent.lastResult.topAction}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        runAgent(agent.agentType);
                                                    }}
                                                    disabled={agent.status === 'running' || agent.status === 'queued'}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50"
                                                >
                                                    {agent.status === 'running' ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Running...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4" />
                                                            Run Agent
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--surface-secondary)]">
                    <p className="text-xs text-center text-[var(--text-tertiary)]">
                        Agents analyze your finances to find savings opportunities
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AgentDashboard;
