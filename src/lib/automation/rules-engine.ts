/**
 * Automation Rules Engine
 * 
 * Provides a powerful rule-based automation system for MoneyLoop.
 * Supports conditions, actions, triggers, and scheduling.
 * 
 * Phase 26-35 of Sprint 1.2
 */

export type RuleTrigger =
    | 'transaction_created'
    | 'bill_due_soon'
    | 'budget_exceeded'
    | 'goal_milestone'
    | 'low_balance'
    | 'large_expense'
    | 'recurring_detected'
    | 'scheduled'
    | 'manual';

export type RuleAction =
    | 'send_notification'
    | 'categorize_transaction'
    | 'add_to_budget'
    | 'flag_for_review'
    | 'create_task'
    | 'move_to_savings'
    | 'run_agent'
    | 'send_email'
    | 'webhook';

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'between'
    | 'starts_with'
    | 'ends_with'
    | 'matches_regex';

export interface RuleCondition {
    id: string;
    field: string;
    operator: ConditionOperator;
    value: string | number | boolean;
    secondaryValue?: string | number; // For 'between' operator
}

export interface RuleConditionGroup {
    id: string;
    logic: 'AND' | 'OR';
    conditions: (RuleCondition | RuleConditionGroup)[];
}

export interface RuleActionConfig {
    id: string;
    type: RuleAction;
    config: Record<string, unknown>;
}

export interface AutomationRule {
    id: string;
    name: string;
    description?: string;
    isEnabled: boolean;
    trigger: RuleTrigger;
    schedule?: {
        cron?: string;
        timezone?: string;
        nextRun?: Date;
    };
    conditions: RuleConditionGroup;
    actions: RuleActionConfig[];
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    lastTriggeredAt?: Date;
    triggerCount: number;
    userId: string;
}

export interface RuleExecutionLog {
    id: string;
    ruleId: string;
    ruleName: string;
    trigger: RuleTrigger;
    triggerData: Record<string, unknown>;
    conditionResult: boolean;
    actionsExecuted: string[];
    status: 'success' | 'partial' | 'failed';
    error?: string;
    executedAt: Date;
    duration: number;
}

// Rule templates for quick setup
export const RULE_TEMPLATES: Partial<AutomationRule>[] = [
    {
        name: 'Large Expense Alert',
        description: 'Get notified when a transaction exceeds a threshold',
        trigger: 'transaction_created',
        conditions: {
            id: 'group-1',
            logic: 'AND',
            conditions: [
                { id: 'c1', field: 'amount', operator: 'greater_than', value: 100 },
            ],
        },
        actions: [
            {
                id: 'a1',
                type: 'send_notification',
                config: {
                    title: 'Large Expense Detected',
                    message: 'A transaction of ${amount} was made at {merchant}',
                    priority: 'high',
                },
            },
        ],
    },
    {
        name: 'Auto-Categorize Groceries',
        description: 'Automatically categorize transactions from grocery stores',
        trigger: 'transaction_created',
        conditions: {
            id: 'group-1',
            logic: 'OR',
            conditions: [
                { id: 'c1', field: 'merchant', operator: 'contains', value: 'Whole Foods' },
                { id: 'c2', field: 'merchant', operator: 'contains', value: 'Trader Joe' },
                { id: 'c3', field: 'merchant', operator: 'contains', value: 'Kroger' },
                { id: 'c4', field: 'merchant', operator: 'contains', value: 'Safeway' },
                { id: 'c5', field: 'merchant', operator: 'contains', value: 'Costco' },
            ],
        },
        actions: [
            {
                id: 'a1',
                type: 'categorize_transaction',
                config: { category: 'groceries' },
            },
        ],
    },
    {
        name: 'Low Balance Warning',
        description: 'Alert when checking account falls below threshold',
        trigger: 'low_balance',
        conditions: {
            id: 'group-1',
            logic: 'AND',
            conditions: [
                { id: 'c1', field: 'balance', operator: 'less_than', value: 500 },
                { id: 'c2', field: 'account_type', operator: 'equals', value: 'checking' },
            ],
        },
        actions: [
            {
                id: 'a1',
                type: 'send_notification',
                config: {
                    title: 'Low Balance Alert',
                    message: 'Your {account_name} balance is ${balance}',
                    priority: 'critical',
                },
            },
        ],
    },
    {
        name: 'Bill Due Reminder',
        description: 'Remind 3 days before bills are due',
        trigger: 'bill_due_soon',
        conditions: {
            id: 'group-1',
            logic: 'AND',
            conditions: [
                { id: 'c1', field: 'days_until_due', operator: 'equals', value: 3 },
                { id: 'c2', field: 'auto_pay', operator: 'equals', value: false },
            ],
        },
        actions: [
            {
                id: 'a1',
                type: 'send_notification',
                config: {
                    title: 'Bill Due Soon',
                    message: '{bill_name} of ${amount} is due in 3 days',
                    priority: 'medium',
                },
            },
            {
                id: 'a2',
                type: 'create_task',
                config: {
                    title: 'Pay {bill_name}',
                    dueDate: '{due_date}',
                },
            },
        ],
    },
    {
        name: 'Weekly Savings Transfer',
        description: 'Automatically transfer round-up savings weekly',
        trigger: 'scheduled',
        schedule: {
            cron: '0 9 * * 1', // Every Monday at 9 AM
        },
        conditions: {
            id: 'group-1',
            logic: 'AND',
            conditions: [
                { id: 'c1', field: 'roundup_balance', operator: 'greater_than', value: 10 },
            ],
        },
        actions: [
            {
                id: 'a1',
                type: 'move_to_savings',
                config: {
                    sourceType: 'roundup',
                    destinationAccount: 'savings',
                },
            },
            {
                id: 'a2',
                type: 'send_notification',
                config: {
                    title: 'Savings Transfer Complete',
                    message: 'Moved ${amount} to your savings account',
                    priority: 'low',
                },
            },
        ],
    },
    {
        name: 'Run Daily AI Analysis',
        description: 'Analyze finances daily and surface insights',
        trigger: 'scheduled',
        schedule: {
            cron: '0 8 * * *', // Every day at 8 AM
        },
        conditions: {
            id: 'group-1',
            logic: 'AND',
            conditions: [],
        },
        actions: [
            {
                id: 'a1',
                type: 'run_agent',
                config: { agentType: 'savings_finder' },
            },
        ],
    },
];

/**
 * Evaluate a single condition
 */
function evaluateCondition(
    condition: RuleCondition,
    data: Record<string, unknown>
): boolean {
    const fieldValue = data[condition.field];

    switch (condition.operator) {
        case 'equals':
            return fieldValue === condition.value;
        case 'not_equals':
            return fieldValue !== condition.value;
        case 'contains':
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'not_contains':
            return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'greater_than':
            return Number(fieldValue) > Number(condition.value);
        case 'less_than':
            return Number(fieldValue) < Number(condition.value);
        case 'between':
            return Number(fieldValue) >= Number(condition.value) &&
                Number(fieldValue) <= Number(condition.secondaryValue);
        case 'starts_with':
            return String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
        case 'ends_with':
            return String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
        case 'matches_regex':
            try {
                return new RegExp(String(condition.value), 'i').test(String(fieldValue));
            } catch {
                return false;
            }
        default:
            return false;
    }
}

/**
 * Evaluate a condition group (supports nested groups)
 */
function evaluateConditionGroup(
    group: RuleConditionGroup,
    data: Record<string, unknown>
): boolean {
    if (group.conditions.length === 0) return true;

    const results = group.conditions.map(item => {
        if ('logic' in item) {
            return evaluateConditionGroup(item as RuleConditionGroup, data);
        }
        return evaluateCondition(item as RuleCondition, data);
    });

    return group.logic === 'AND'
        ? results.every(r => r)
        : results.some(r => r);
}

/**
 * Execute a rule action
 */
async function executeAction(
    action: RuleActionConfig,
    data: Record<string, unknown>,
    rule: AutomationRule
): Promise<{ success: boolean; error?: string }> {
    try {
        switch (action.type) {
            case 'send_notification': {
                // Would integrate with notification service
                console.log('Notification:', action.config, data);
                return { success: true };
            }
            case 'categorize_transaction': {
                // Would update transaction in database
                console.log('Categorize:', action.config.category, data);
                return { success: true };
            }
            case 'create_task': {
                // Would create a task in the task system
                console.log('Create task:', action.config, data);
                return { success: true };
            }
            case 'move_to_savings': {
                // Would trigger savings transfer
                console.log('Move to savings:', action.config, data);
                return { success: true };
            }
            case 'run_agent': {
                // Would queue an agent task
                console.log('Run agent:', action.config.agentType);
                return { success: true };
            }
            case 'flag_for_review': {
                // Would flag item for user review
                console.log('Flag for review:', data);
                return { success: true };
            }
            case 'add_to_budget': {
                // Would add amount to budget tracking
                console.log('Add to budget:', action.config, data);
                return { success: true };
            }
            case 'send_email': {
                // Would send email via email service
                console.log('Send email:', action.config, data);
                return { success: true };
            }
            case 'webhook': {
                // Would call external webhook
                const url = action.config.url as string;
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rule: rule.name, data }),
                });
                return { success: true };
            }
            default:
                return { success: false, error: `Unknown action type: ${action.type}` };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Execute a rule against trigger data
 */
export async function executeRule(
    rule: AutomationRule,
    triggerData: Record<string, unknown>
): Promise<RuleExecutionLog> {
    const startTime = Date.now();
    const log: RuleExecutionLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        trigger: rule.trigger,
        triggerData,
        conditionResult: false,
        actionsExecuted: [],
        status: 'success',
        executedAt: new Date(),
        duration: 0,
    };

    try {
        // Evaluate conditions
        log.conditionResult = evaluateConditionGroup(rule.conditions, triggerData);

        if (!log.conditionResult) {
            log.duration = Date.now() - startTime;
            return log;
        }

        // Execute actions
        const actionResults: { success: boolean; error?: string }[] = [];

        for (const action of rule.actions) {
            const result = await executeAction(action, triggerData, rule);
            actionResults.push(result);

            if (result.success) {
                log.actionsExecuted.push(action.type);
            }
        }

        // Determine status
        const allSuccess = actionResults.every(r => r.success);
        const allFailed = actionResults.every(r => !r.success);

        if (allSuccess) {
            log.status = 'success';
        } else if (allFailed) {
            log.status = 'failed';
            log.error = actionResults.find(r => r.error)?.error;
        } else {
            log.status = 'partial';
        }
    } catch (error) {
        log.status = 'failed';
        log.error = error instanceof Error ? error.message : 'Unknown error';
    }

    log.duration = Date.now() - startTime;
    return log;
}

/**
 * Process multiple rules for a trigger event
 */
export async function processRulesForTrigger(
    trigger: RuleTrigger,
    data: Record<string, unknown>,
    rules: AutomationRule[]
): Promise<RuleExecutionLog[]> {
    const applicableRules = rules
        .filter(r => r.isEnabled && r.trigger === trigger)
        .sort((a, b) => b.priority - a.priority);

    const logs: RuleExecutionLog[] = [];

    for (const rule of applicableRules) {
        const log = await executeRule(rule, data);
        logs.push(log);
    }

    return logs;
}

/**
 * Get rule templates
 */
export function getRuleTemplates(): Partial<AutomationRule>[] {
    return RULE_TEMPLATES;
}

/**
 * Create a rule from template
 */
export function createRuleFromTemplate(
    templateIndex: number,
    userId: string,
    overrides?: Partial<AutomationRule>
): AutomationRule {
    const template = RULE_TEMPLATES[templateIndex];

    if (!template) {
        throw new Error(`Template ${templateIndex} not found`);
    }

    return {
        id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: template.name || 'New Rule',
        description: template.description,
        isEnabled: true,
        trigger: template.trigger || 'manual',
        schedule: template.schedule,
        conditions: template.conditions || { id: 'group-1', logic: 'AND', conditions: [] },
        actions: template.actions || [],
        priority: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggerCount: 0,
        userId,
        ...overrides,
    };
}

export default {
    executeRule,
    processRulesForTrigger,
    getRuleTemplates,
    createRuleFromTemplate,
    evaluateConditionGroup,
};
