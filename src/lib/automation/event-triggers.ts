/**
 * Event Trigger System
 * 
 * Handles event-based automation triggers from various sources.
 * Integrates with transaction webhooks, account updates, and user actions.
 * 
 * Phase 41-45 of Sprint 1.2
 */

import { AutomationRule, processRulesForTrigger, RuleTrigger, RuleExecutionLog } from './rules-engine';

export interface TriggerEvent {
    type: RuleTrigger;
    data: Record<string, unknown>;
    source: 'plaid' | 'user' | 'system' | 'schedule';
    userId: string;
    timestamp: Date;
}

export interface EventHandler {
    trigger: RuleTrigger;
    handler: (event: TriggerEvent) => Record<string, unknown>;
}

// Event queue for processing
const eventQueue: TriggerEvent[] = [];
let isProcessing = false;
const eventListeners: Map<RuleTrigger, ((event: TriggerEvent, logs: RuleExecutionLog[]) => void)[]> = new Map();

/**
 * Transaction event handler - transforms transaction data
 */
const transactionHandler: EventHandler = {
    trigger: 'transaction_created',
    handler: (event) => ({
        amount: event.data.amount,
        merchant: event.data.merchant_name || event.data.name,
        category: event.data.category,
        account: event.data.account_id,
        date: event.data.date,
        pending: event.data.pending,
        transaction_id: event.data.id,
    }),
};

/**
 * Bill due handler - transforms bill data
 */
const billDueHandler: EventHandler = {
    trigger: 'bill_due_soon',
    handler: (event) => {
        const dueDate = new Date(event.data.due_date as string);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            bill_name: event.data.name,
            amount: event.data.amount,
            due_date: event.data.due_date,
            days_until_due: daysUntilDue,
            auto_pay: event.data.auto_pay || false,
            bill_id: event.data.id,
        };
    },
};

/**
 * Budget exceeded handler
 */
const budgetExceededHandler: EventHandler = {
    trigger: 'budget_exceeded',
    handler: (event) => ({
        category: event.data.category,
        budget_amount: event.data.budget_amount,
        spent_amount: event.data.spent_amount,
        overage: (event.data.spent_amount as number) - (event.data.budget_amount as number),
        percent_used: ((event.data.spent_amount as number) / (event.data.budget_amount as number)) * 100,
    }),
};

/**
 * Low balance handler
 */
const lowBalanceHandler: EventHandler = {
    trigger: 'low_balance',
    handler: (event) => ({
        account_name: event.data.name,
        account_type: event.data.type,
        balance: event.data.balance,
        account_id: event.data.id,
    }),
};

/**
 * Large expense handler
 */
const largeExpenseHandler: EventHandler = {
    trigger: 'large_expense',
    handler: (event) => ({
        amount: Math.abs(event.data.amount as number),
        merchant: event.data.merchant_name || event.data.name,
        category: event.data.category,
        is_recurring: event.data.is_recurring || false,
        transaction_id: event.data.id,
    }),
};

/**
 * Goal milestone handler
 */
const goalMilestoneHandler: EventHandler = {
    trigger: 'goal_milestone',
    handler: (event) => ({
        goal_name: event.data.name,
        target_amount: event.data.target_amount,
        current_amount: event.data.current_amount,
        percent_complete: ((event.data.current_amount as number) / (event.data.target_amount as number)) * 100,
        milestone: event.data.milestone, // 25%, 50%, 75%, 100%
        goal_id: event.data.id,
    }),
};

/**
 * Recurring transaction detected handler
 */
const recurringDetectedHandler: EventHandler = {
    trigger: 'recurring_detected',
    handler: (event) => ({
        merchant: event.data.merchant,
        amount: event.data.amount,
        frequency: event.data.frequency, // weekly, monthly, yearly
        first_occurrence: event.data.first_occurrence,
        occurrence_count: event.data.occurrence_count,
    }),
};

// Register all handlers
const eventHandlers: Map<RuleTrigger, EventHandler> = new Map([
    ['transaction_created', transactionHandler],
    ['bill_due_soon', billDueHandler],
    ['budget_exceeded', budgetExceededHandler],
    ['low_balance', lowBalanceHandler],
    ['large_expense', largeExpenseHandler],
    ['goal_milestone', goalMilestoneHandler],
    ['recurring_detected', recurringDetectedHandler],
]);

/**
 * Emit an event to the trigger system
 */
export function emitEvent(event: TriggerEvent): void {
    eventQueue.push(event);

    if (!isProcessing) {
        processEventQueue();
    }
}

/**
 * Process the event queue
 */
async function processEventQueue(): Promise<void> {
    if (isProcessing) return;
    isProcessing = true;

    while (eventQueue.length > 0) {
        const event = eventQueue.shift();
        if (!event) continue;

        try {
            await processEvent(event);
        } catch (error) {
            console.error('Error processing event:', error);
        }
    }

    isProcessing = false;
}

/**
 * Process a single event
 */
async function processEvent(event: TriggerEvent): Promise<RuleExecutionLog[]> {
    // Get handler for this trigger type
    const handler = eventHandlers.get(event.type);
    if (!handler) {
        console.warn(`No handler for trigger type: ${event.type}`);
        return [];
    }

    // Transform event data
    const transformedData = handler.handler(event);

    // Get user's rules (in production, fetch from database)
    const rules = await getUserRules(event.userId);

    // Process rules for this trigger
    const logs = await processRulesForTrigger(event.type, transformedData, rules);

    // Notify listeners
    const listeners = eventListeners.get(event.type) || [];
    for (const listener of listeners) {
        try {
            listener(event, logs);
        } catch (error) {
            console.error('Event listener error:', error);
        }
    }

    return logs;
}

/**
 * Get user's automation rules
 * In production, this would fetch from database
 */
async function getUserRules(userId: string): Promise<AutomationRule[]> {
    // Placeholder - would query database
    console.log('Fetching rules for user:', userId);
    return [];
}

/**
 * Register an event listener
 */
export function addEventListener(
    trigger: RuleTrigger,
    callback: (event: TriggerEvent, logs: RuleExecutionLog[]) => void
): () => void {
    const listeners = eventListeners.get(trigger) || [];
    listeners.push(callback);
    eventListeners.set(trigger, listeners);

    // Return unsubscribe function
    return () => {
        const current = eventListeners.get(trigger) || [];
        eventListeners.set(trigger, current.filter(l => l !== callback));
    };
}

/**
 * Create event from Plaid transaction webhook
 */
export function createTransactionEvent(
    userId: string,
    transaction: Record<string, unknown>
): TriggerEvent {
    const amount = Math.abs(transaction.amount as number);

    return {
        type: amount > 100 ? 'large_expense' : 'transaction_created',
        data: transaction,
        source: 'plaid',
        userId,
        timestamp: new Date(),
    };
}

/**
 * Create event from account balance change
 */
export function createBalanceEvent(
    userId: string,
    account: Record<string, unknown>,
    threshold: number = 500
): TriggerEvent | null {
    const balance = account.balance as number;

    if (balance < threshold) {
        return {
            type: 'low_balance',
            data: account,
            source: 'plaid',
            userId,
            timestamp: new Date(),
        };
    }

    return null;
}

/**
 * Create event from bill approaching due date
 */
export function createBillDueEvent(
    userId: string,
    bill: Record<string, unknown>
): TriggerEvent {
    return {
        type: 'bill_due_soon',
        data: bill,
        source: 'system',
        userId,
        timestamp: new Date(),
    };
}

/**
 * Create event from budget threshold crossed
 */
export function createBudgetEvent(
    userId: string,
    budget: Record<string, unknown>
): TriggerEvent {
    return {
        type: 'budget_exceeded',
        data: budget,
        source: 'system',
        userId,
        timestamp: new Date(),
    };
}

/**
 * Create event from goal milestone reached
 */
export function createGoalMilestoneEvent(
    userId: string,
    goal: Record<string, unknown>,
    milestone: number
): TriggerEvent {
    return {
        type: 'goal_milestone',
        data: { ...goal, milestone },
        source: 'system',
        userId,
        timestamp: new Date(),
    };
}

/**
 * Get all registered trigger types
 */
export function getAvailableTriggers(): { type: RuleTrigger; description: string }[] {
    return [
        { type: 'transaction_created', description: 'When a new transaction is detected' },
        { type: 'bill_due_soon', description: 'When a bill due date is approaching' },
        { type: 'budget_exceeded', description: 'When spending exceeds a budget' },
        { type: 'goal_milestone', description: 'When a savings goal milestone is reached' },
        { type: 'low_balance', description: 'When an account balance falls below threshold' },
        { type: 'large_expense', description: 'When a transaction exceeds a threshold' },
        { type: 'recurring_detected', description: 'When a recurring expense pattern is detected' },
        { type: 'scheduled', description: 'On a scheduled time' },
        { type: 'manual', description: 'Triggered manually by user' },
    ];
}

export default {
    emitEvent,
    addEventListener,
    createTransactionEvent,
    createBalanceEvent,
    createBillDueEvent,
    createBudgetEvent,
    createGoalMilestoneEvent,
    getAvailableTriggers,
};
