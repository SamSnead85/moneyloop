/**
 * Agent Orchestrator
 * 
 * Coordinates multiple specialized AI agents in MoneyLoop.
 * Manages priority queues, execution logging, and agent lifecycle.
 * 
 * Phase 16-20 of Sprint 1.1
 */

import { analyzeBillsForNegotiation, Bill, BillNegotiatorResult } from './bill-negotiator';
import { optimizeSubscriptions, Subscription, SubscriptionOptimizerResult } from './subscription-optimizer';
import { findSavingsOpportunities, Transaction, SpendingCategory, SavingsFinderResult } from './savings-finder';

export type AgentType = 'bill_negotiator' | 'subscription_optimizer' | 'savings_finder' | 'budget_analyzer';

export type AgentStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed';

export interface AgentTask {
    id: string;
    agentType: AgentType;
    status: AgentStatus;
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    result?: BillNegotiatorResult | SubscriptionOptimizerResult | SavingsFinderResult | unknown;
    error?: string;
    metadata?: Record<string, unknown>;
}

export interface AgentQueueStats {
    totalQueued: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
    averageExecutionTime: number;
}

export interface AgentSummary {
    agentType: AgentType;
    displayName: string;
    description: string;
    lastRun?: Date;
    lastResult?: {
        potentialSavings: number;
        actionCount: number;
        topAction?: string;
    };
    status: AgentStatus;
    healthScore: number; // 0-100
}

// In-memory task queue (in production, use Redis or database)
const taskQueue: AgentTask[] = [];
const completedTasks: AgentTask[] = [];
let isProcessing = false;

// Agent metadata
const AGENT_METADATA: Record<AgentType, { displayName: string; description: string }> = {
    bill_negotiator: {
        displayName: 'Bill Negotiator',
        description: 'Analyzes recurring bills and suggests negotiation strategies to reduce costs',
    },
    subscription_optimizer: {
        displayName: 'Subscription Optimizer',
        description: 'Detects unused, duplicate, or overpriced subscriptions',
    },
    savings_finder: {
        displayName: 'Savings Finder',
        description: 'Identifies spending patterns and opportunities to save money',
    },
    budget_analyzer: {
        displayName: 'Budget Analyzer',
        description: 'Monitors budget adherence and suggests optimizations',
    },
};

/**
 * Generate unique task ID
 */
function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Queue a new agent task
 */
export function queueAgentTask(
    agentType: AgentType,
    priority: 'high' | 'medium' | 'low' = 'medium',
    metadata?: Record<string, unknown>
): AgentTask {
    const task: AgentTask = {
        id: generateTaskId(),
        agentType,
        status: 'queued',
        priority,
        createdAt: new Date(),
        metadata,
    };

    // Insert based on priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const insertIndex = taskQueue.findIndex(t => priorityOrder[t.priority] > priorityOrder[priority]);

    if (insertIndex === -1) {
        taskQueue.push(task);
    } else {
        taskQueue.splice(insertIndex, 0, task);
    }

    // Start processing if not already running
    if (!isProcessing) {
        processQueue();
    }

    return task;
}

/**
 * Execute a specific agent
 */
async function executeAgent(task: AgentTask): Promise<void> {
    task.status = 'running';
    task.startedAt = new Date();

    try {
        let result: unknown;

        switch (task.agentType) {
            case 'bill_negotiator': {
                const bills = task.metadata?.bills as Bill[] || [];
                result = await analyzeBillsForNegotiation(bills);
                break;
            }
            case 'subscription_optimizer': {
                const subscriptions = task.metadata?.subscriptions as Subscription[] || [];
                result = await optimizeSubscriptions(subscriptions);
                break;
            }
            case 'savings_finder': {
                const transactions = task.metadata?.transactions as Transaction[] || [];
                const categorySpending = task.metadata?.categorySpending as SpendingCategory[] || [];
                const monthlyIncome = task.metadata?.monthlyIncome as number || 0;
                result = await findSavingsOpportunities(transactions, categorySpending, monthlyIncome);
                break;
            }
            case 'budget_analyzer': {
                // Placeholder for budget analyzer - would call existing analyzeBudget
                result = { recommendations: [], alerts: [] };
                break;
            }
        }

        task.result = result;
        task.status = 'completed';
        task.completedAt = new Date();
    } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.completedAt = new Date();
    }
}

/**
 * Process the task queue
 */
async function processQueue(): Promise<void> {
    if (isProcessing || taskQueue.length === 0) return;

    isProcessing = true;

    while (taskQueue.length > 0) {
        const task = taskQueue.shift()!;
        await executeAgent(task);
        completedTasks.unshift(task);

        // Keep only last 100 completed tasks
        if (completedTasks.length > 100) {
            completedTasks.pop();
        }
    }

    isProcessing = false;
}

/**
 * Get task by ID
 */
export function getTask(taskId: string): AgentTask | undefined {
    return taskQueue.find(t => t.id === taskId) || completedTasks.find(t => t.id === taskId);
}

/**
 * Get queue statistics
 */
export function getQueueStats(): AgentQueueStats {
    const completed = completedTasks.filter(t => t.status === 'completed');
    const failed = completedTasks.filter(t => t.status === 'failed');

    const totalExecutionTime = completed.reduce((sum, t) => {
        if (t.startedAt && t.completedAt) {
            return sum + (t.completedAt.getTime() - t.startedAt.getTime());
        }
        return sum;
    }, 0);

    return {
        totalQueued: taskQueue.length,
        totalRunning: taskQueue.filter(t => t.status === 'running').length,
        totalCompleted: completed.length,
        totalFailed: failed.length,
        averageExecutionTime: completed.length > 0 ? totalExecutionTime / completed.length : 0,
    };
}

/**
 * Get all agent summaries
 */
export function getAgentSummaries(): AgentSummary[] {
    const summaries: AgentSummary[] = [];

    for (const [type, meta] of Object.entries(AGENT_METADATA)) {
        const agentType = type as AgentType;
        const lastTask = completedTasks.find(t => t.agentType === agentType && t.status === 'completed');
        const runningTask = taskQueue.find(t => t.agentType === agentType && t.status === 'running');
        const queuedTask = taskQueue.find(t => t.agentType === agentType);

        let status: AgentStatus = 'idle';
        if (runningTask) status = 'running';
        else if (queuedTask) status = 'queued';

        let lastResult: AgentSummary['lastResult'];
        if (lastTask?.result) {
            // Extract summary based on agent type
            const result = lastTask.result;
            if (agentType === 'bill_negotiator') {
                const r = result as unknown as BillNegotiatorResult;
                lastResult = {
                    potentialSavings: r.totalPotentialSavings?.monthly || 0,
                    actionCount: r.opportunities?.length || 0,
                    topAction: r.prioritizedActions?.[0],
                };
            } else if (agentType === 'subscription_optimizer') {
                const r = result as SubscriptionOptimizerResult;
                lastResult = {
                    potentialSavings: r.potentialMonthlySavings || 0,
                    actionCount: r.issues?.length || 0,
                    topAction: r.issues?.[0]?.recommendation,
                };
            } else if (agentType === 'savings_finder') {
                const r = result as SavingsFinderResult;
                lastResult = {
                    potentialSavings: r.totalPotentialSavings?.monthly || 0,
                    actionCount: r.opportunities?.length || 0,
                    topAction: r.opportunities?.[0]?.title,
                };
            }
        }

        // Calculate health score based on recent activity
        let healthScore = 50;
        if (lastTask) {
            const hoursSinceRun = (Date.now() - (lastTask.completedAt?.getTime() || 0)) / (1000 * 60 * 60);
            if (hoursSinceRun < 24) healthScore = 100;
            else if (hoursSinceRun < 72) healthScore = 80;
            else if (hoursSinceRun < 168) healthScore = 60;
            else healthScore = 40;
        }

        summaries.push({
            agentType,
            displayName: meta.displayName,
            description: meta.description,
            lastRun: lastTask?.completedAt,
            lastResult,
            status,
            healthScore,
        });
    }

    return summaries;
}

/**
 * Run all agents with provided data
 */
export async function runAllAgents(data: {
    bills?: Bill[];
    subscriptions?: Subscription[];
    transactions?: Transaction[];
    categorySpending?: SpendingCategory[];
    monthlyIncome?: number;
}): Promise<{ taskIds: string[] }> {
    const taskIds: string[] = [];

    if (data.bills && data.bills.length > 0) {
        const task = queueAgentTask('bill_negotiator', 'high', { bills: data.bills });
        taskIds.push(task.id);
    }

    if (data.subscriptions && data.subscriptions.length > 0) {
        const task = queueAgentTask('subscription_optimizer', 'high', { subscriptions: data.subscriptions });
        taskIds.push(task.id);
    }

    if (data.transactions && data.transactions.length > 0) {
        const task = queueAgentTask('savings_finder', 'medium', {
            transactions: data.transactions,
            categorySpending: data.categorySpending || [],
            monthlyIncome: data.monthlyIncome || 0,
        });
        taskIds.push(task.id);
    }

    return { taskIds };
}

/**
 * Get recent task history
 */
export function getRecentTasks(limit: number = 20): AgentTask[] {
    return completedTasks.slice(0, limit);
}

/**
 * Clear task history
 */
export function clearTaskHistory(): void {
    completedTasks.length = 0;
}

export default {
    queueAgentTask,
    getTask,
    getQueueStats,
    getAgentSummaries,
    runAllAgents,
    getRecentTasks,
    clearTaskHistory,
};
