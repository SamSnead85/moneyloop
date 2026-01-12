'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    CreditCard,
    DollarSign,
    ListTodo,
    TrendingUp,
    Play,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    Sparkles,
} from 'lucide-react';
import { useHousehold } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

type AgentType = 'bill_payment' | 'budget' | 'task_priority' | 'spending_insights';

interface Agent {
    id: AgentType;
    name: string;
    description: string;
    icon: typeof Bot;
    color: string;
}

const agents: Agent[] = [
    {
        id: 'bill_payment',
        name: 'Bill Manager',
        description: 'Track overdue bills and suggest payment priorities',
        icon: CreditCard,
        color: 'text-rose-400 bg-rose-500/20',
    },
    {
        id: 'budget',
        name: 'Budget Advisor',
        description: 'Analyze spending and recommend budget adjustments',
        icon: DollarSign,
        color: 'text-emerald-400 bg-emerald-500/20',
    },
    {
        id: 'task_priority',
        name: 'Priority Coach',
        description: 'Sort tasks into Signal vs Noise for focus',
        icon: ListTodo,
        color: 'text-amber-400 bg-amber-500/20',
    },
    {
        id: 'spending_insights',
        name: 'Spending Analyst',
        description: 'Family spending patterns and financial health',
        icon: TrendingUp,
        color: 'text-blue-400 bg-blue-500/20',
    },
];

interface AgentResult {
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}

export function AIAgentDashboard() {
    const { currentHousehold } = useHousehold();
    const [runningAgent, setRunningAgent] = useState<AgentType | null>(null);
    const [results, setResults] = useState<Record<AgentType, AgentResult | null>>({
        bill_payment: null,
        budget: null,
        task_priority: null,
        spending_insights: null,
    });
    const [expandedResult, setExpandedResult] = useState<AgentType | null>(null);

    const runAgent = async (agentType: AgentType) => {
        if (!currentHousehold) return;

        setRunningAgent(agentType);

        try {
            const response = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType,
                    householdId: currentHousehold.id,
                }),
            });

            const result = await response.json();

            setResults(prev => ({
                ...prev,
                [agentType]: result,
            }));

            setExpandedResult(agentType);
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [agentType]: {
                    success: false,
                    message: 'Agent failed to run',
                },
            }));
        }

        setRunningAgent(null);
    };

    const runAllAgents = async () => {
        for (const agent of agents) {
            await runAgent(agent.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                        <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-100">AI Agents</h2>
                        <p className="text-sm text-zinc-500">Intelligent financial assistants</p>
                    </div>
                </div>

                <button
                    onClick={runAllAgents}
                    disabled={runningAgent !== null}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    Run All Agents
                </button>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => {
                    const Icon = agent.icon;
                    const isRunning = runningAgent === agent.id;
                    const result = results[agent.id];
                    const isExpanded = expandedResult === agent.id;
                    const [iconColor, bgColor] = agent.color.split(' ');

                    return (
                        <motion.div
                            key={agent.id}
                            layout
                            className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
                        >
                            {/* Agent Header */}
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className={cn('p-3 rounded-xl', bgColor)}>
                                        <Icon className={cn('w-6 h-6', iconColor)} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium text-zinc-200">{agent.name}</h3>
                                        <p className="text-sm text-zinc-500 mt-0.5">{agent.description}</p>
                                    </div>

                                    <button
                                        onClick={() => runAgent(agent.id)}
                                        disabled={isRunning || runningAgent !== null}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                                            result?.success
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30',
                                            isRunning && 'opacity-50'
                                        )}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Running...
                                            </>
                                        ) : result ? (
                                            <>
                                                <Play className="w-3.5 h-3.5" />
                                                Re-run
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5" />
                                                Run
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Status Badge */}
                                {result && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className={cn(
                                            'flex items-center gap-1.5 text-sm',
                                            result.success ? 'text-emerald-400' : 'text-rose-400'
                                        )}>
                                            {result.success ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4" />
                                            )}
                                            {result.message}
                                        </div>

                                        {result.data && (
                                            <button
                                                onClick={() => setExpandedResult(isExpanded ? null : agent.id)}
                                                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                            >
                                                <ChevronDown className={cn(
                                                    'w-5 h-5 transition-transform',
                                                    isExpanded && 'rotate-180'
                                                )} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Expanded Results */}
                            <AnimatePresence>
                                {isExpanded && result?.data && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                                            <pre className="text-xs text-zinc-400 bg-zinc-800/50 p-3 rounded-lg overflow-x-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-sm text-zinc-400">
                    <span className="text-zinc-300 font-medium">Tip:</span> Run agents regularly to get updated insights.
                    All recommendations are powered by Google Gemini 2.0 Flash.
                </p>
            </div>
        </div>
    );
}

export default AIAgentDashboard;
