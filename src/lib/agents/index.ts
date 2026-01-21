/**
 * Agent exports
 * 
 * Centralized exports for all MoneyLoop AI agents
 */

// Individual agents
export { analyzeBillsForNegotiation, getQuickNegotiationSummary } from './bill-negotiator';
export type { Bill, NegotiationOpportunity, BillNegotiatorResult } from './bill-negotiator';

export { optimizeSubscriptions, getSubscriptionHealthScore } from './subscription-optimizer';
export type { Subscription, SubscriptionIssue, SubscriptionOptimizerResult } from './subscription-optimizer';

export { findSavingsOpportunities, getQuickSavingsSummary } from './savings-finder';
export type { Transaction, SpendingCategory, SavingsOpportunity, SavingsFinderResult } from './savings-finder';

// Orchestrator
export {
    queueAgentTask,
    getTask,
    getQueueStats,
    getAgentSummaries,
    runAllAgents,
    getRecentTasks,
    clearTaskHistory,
} from './orchestrator';
export type { AgentType, AgentStatus, AgentTask, AgentQueueStats, AgentSummary } from './orchestrator';

// Collaborative agents (existing)
export * from './collaborativeAgents';
