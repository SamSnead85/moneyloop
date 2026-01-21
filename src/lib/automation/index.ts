/**
 * Automation exports
 * 
 * Centralized exports for the MoneyLoop automation system
 */

// Rules Engine
export {
    executeRule,
    processRulesForTrigger,
    getRuleTemplates,
    createRuleFromTemplate,
    RULE_TEMPLATES,
} from './rules-engine';
export type {
    RuleTrigger,
    RuleAction,
    ConditionOperator,
    RuleCondition,
    RuleConditionGroup,
    RuleActionConfig,
    AutomationRule,
    RuleExecutionLog,
} from './rules-engine';

// Scheduler
export {
    scheduleRule,
    unscheduleRule,
    updateScheduledJob,
    getScheduledJobs,
    getSchedulerStats,
    processDueJobs,
    startScheduler,
    stopScheduler,
    getExecutionHistory,
    describeCronExpression,
    SCHEDULE_PRESETS,
} from './scheduler';
export type { ScheduledJob, SchedulerStats } from './scheduler';

// Event Triggers
export {
    emitEvent,
    addEventListener,
    createTransactionEvent,
    createBalanceEvent,
    createBillDueEvent,
    createBudgetEvent,
    createGoalMilestoneEvent,
    getAvailableTriggers,
} from './event-triggers';
export type { TriggerEvent, EventHandler } from './event-triggers';
