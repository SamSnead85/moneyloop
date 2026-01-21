/**
 * Scheduled Actions System
 * 
 * Manages scheduled automation rules with cron-based scheduling.
 * Handles job persistence, execution, and retry logic.
 * 
 * Phase 36-40 of Sprint 1.2
 */

import { AutomationRule, executeRule, RuleExecutionLog } from './rules-engine';

export interface ScheduledJob {
    id: string;
    ruleId: string;
    ruleName: string;
    cronExpression: string;
    timezone: string;
    nextRun: Date;
    lastRun?: Date;
    lastResult?: 'success' | 'failed';
    isEnabled: boolean;
    retryCount: number;
    maxRetries: number;
}

export interface SchedulerStats {
    activeJobs: number;
    executedToday: number;
    failedToday: number;
    nextExecution?: Date;
}

// In-memory job store (in production, use database)
const scheduledJobs: Map<string, ScheduledJob> = new Map();
const executionHistory: RuleExecutionLog[] = [];
let schedulerInterval: NodeJS.Timeout | null = null;

/**
 * Parse cron expression into next run date
 * Simplified implementation - supports common patterns
 */
function parseNextRun(cronExpression: string, fromDate: Date = new Date()): Date {
    const parts = cronExpression.split(' ');
    if (parts.length < 5) {
        throw new Error('Invalid cron expression');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const next = new Date(fromDate);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // Simple implementation for common patterns
    // Full cron parsing would use a library like 'cron-parser'

    if (minute !== '*') {
        next.setMinutes(parseInt(minute, 10));
    }
    if (hour !== '*') {
        next.setHours(parseInt(hour, 10));
    }

    // If the time has passed today, schedule for tomorrow
    if (next <= fromDate) {
        next.setDate(next.getDate() + 1);
    }

    // Handle day of week
    if (dayOfWeek !== '*') {
        const targetDay = parseInt(dayOfWeek, 10);
        while (next.getDay() !== targetDay) {
            next.setDate(next.getDate() + 1);
        }
    }

    return next;
}

/**
 * Format cron expression for display
 */
export function describeCronExpression(cron: string): string {
    const parts = cron.split(' ');
    if (parts.length < 5) return 'Invalid schedule';

    const [minute, hour, dayOfMonth, , dayOfWeek] = parts;

    const daysMap: Record<string, string> = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday',
    };

    let description = 'Runs ';

    if (dayOfWeek !== '*') {
        description += `every ${daysMap[dayOfWeek] || 'weekday'} `;
    } else if (dayOfMonth !== '*') {
        description += `on day ${dayOfMonth} of month `;
    } else {
        description += 'daily ';
    }

    if (hour !== '*' && minute !== '*') {
        const h = parseInt(hour, 10);
        const m = parseInt(minute, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        description += `at ${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    return description;
}

/**
 * Schedule a rule for execution
 */
export function scheduleRule(rule: AutomationRule): ScheduledJob | null {
    if (rule.trigger !== 'scheduled' || !rule.schedule?.cron) {
        return null;
    }

    const cronExpression = rule.schedule.cron;
    const timezone = rule.schedule.timezone || 'America/New_York';

    try {
        const nextRun = parseNextRun(cronExpression);

        const job: ScheduledJob = {
            id: `job_${rule.id}`,
            ruleId: rule.id,
            ruleName: rule.name,
            cronExpression,
            timezone,
            nextRun,
            isEnabled: rule.isEnabled,
            retryCount: 0,
            maxRetries: 3,
        };

        scheduledJobs.set(job.id, job);
        return job;
    } catch (error) {
        console.error('Failed to schedule rule:', error);
        return null;
    }
}

/**
 * Unschedule a rule
 */
export function unscheduleRule(ruleId: string): boolean {
    const jobId = `job_${ruleId}`;
    return scheduledJobs.delete(jobId);
}

/**
 * Update a scheduled job
 */
export function updateScheduledJob(ruleId: string, updates: Partial<ScheduledJob>): ScheduledJob | null {
    const jobId = `job_${ruleId}`;
    const job = scheduledJobs.get(jobId);

    if (!job) return null;

    const updated = { ...job, ...updates };
    scheduledJobs.set(jobId, updated);
    return updated;
}

/**
 * Get all scheduled jobs
 */
export function getScheduledJobs(): ScheduledJob[] {
    return Array.from(scheduledJobs.values())
        .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
}

/**
 * Get scheduler statistics
 */
export function getSchedulerStats(): SchedulerStats {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todaysExecutions = executionHistory.filter(
        e => e.executedAt >= startOfDay
    );

    const jobs = Array.from(scheduledJobs.values()).filter(j => j.isEnabled);
    const nextJob = jobs.sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime())[0];

    return {
        activeJobs: jobs.length,
        executedToday: todaysExecutions.filter(e => e.status === 'success').length,
        failedToday: todaysExecutions.filter(e => e.status === 'failed').length,
        nextExecution: nextJob?.nextRun,
    };
}

/**
 * Execute a scheduled job
 */
async function executeJob(job: ScheduledJob, rules: AutomationRule[]): Promise<void> {
    const rule = rules.find(r => r.id === job.ruleId);
    if (!rule) {
        console.error(`Rule not found for job: ${job.id}`);
        return;
    }

    try {
        const log = await executeRule(rule, {
            trigger: 'scheduled',
            scheduledAt: new Date(),
        });

        executionHistory.unshift(log);
        if (executionHistory.length > 500) {
            executionHistory.pop();
        }

        job.lastRun = new Date();
        job.lastResult = log.status === 'failed' ? 'failed' : 'success';
        job.retryCount = 0;

        // Schedule next run
        job.nextRun = parseNextRun(job.cronExpression, new Date());
        scheduledJobs.set(job.id, job);

    } catch (error) {
        console.error('Job execution failed:', error);
        job.lastResult = 'failed';
        job.retryCount++;

        if (job.retryCount < job.maxRetries) {
            // Retry in 5 minutes
            job.nextRun = new Date(Date.now() + 5 * 60 * 1000);
        } else {
            // Disable and schedule for next regular run
            job.nextRun = parseNextRun(job.cronExpression, new Date());
            job.retryCount = 0;
        }
        scheduledJobs.set(job.id, job);
    }
}

/**
 * Process due jobs
 */
export async function processDueJobs(rules: AutomationRule[]): Promise<number> {
    const now = new Date();
    let executed = 0;

    for (const job of scheduledJobs.values()) {
        if (!job.isEnabled) continue;
        if (job.nextRun > now) continue;

        await executeJob(job, rules);
        executed++;
    }

    return executed;
}

/**
 * Start the scheduler
 */
export function startScheduler(
    getRules: () => Promise<AutomationRule[]>,
    intervalMs: number = 60000
): void {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
    }

    schedulerInterval = setInterval(async () => {
        try {
            const rules = await getRules();
            await processDueJobs(rules);
        } catch (error) {
            console.error('Scheduler error:', error);
        }
    }, intervalMs);

    console.log(`Scheduler started with ${intervalMs}ms interval`);
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('Scheduler stopped');
    }
}

/**
 * Get execution history
 */
export function getExecutionHistory(limit: number = 50): RuleExecutionLog[] {
    return executionHistory.slice(0, limit);
}

/**
 * Common schedule presets
 */
export const SCHEDULE_PRESETS = [
    { label: 'Every day at 8am', cron: '0 8 * * *' },
    { label: 'Every day at 9pm', cron: '0 21 * * *' },
    { label: 'Every Monday at 9am', cron: '0 9 * * 1' },
    { label: 'First of every month', cron: '0 9 1 * *' },
    { label: 'Every hour', cron: '0 * * * *' },
    { label: 'Every 6 hours', cron: '0 */6 * * *' },
    { label: 'Weekdays at 8am', cron: '0 8 * * 1-5' },
    { label: 'Weekends at 10am', cron: '0 10 * * 0,6' },
];

export default {
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
};
