/**
 * Smart Goal Automation System
 * 
 * Automated goal tracking with milestone alerts, projections,
 * and smart contribution suggestions.
 * 
 * Super-Sprint 14: Phases 1301-1350
 */

export interface Goal {
    id: string;
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    createdAt: Date;
    category: 'emergency' | 'vacation' | 'home' | 'car' | 'education' | 'retirement' | 'debt' | 'other';
    priority: 'high' | 'medium' | 'low';
    autoContribute: boolean;
    contributionFrequency?: 'weekly' | 'biweekly' | 'monthly';
    contributionAmount?: number;
    fundingAccountId?: string;
    destinationAccountId?: string;
    milestones: Milestone[];
    status: 'active' | 'paused' | 'completed' | 'abandoned';
    completedAt?: Date;
}

export interface Milestone {
    id: string;
    name: string;
    targetAmount: number;
    reachedAt?: Date;
    notified: boolean;
}

export interface GoalProjection {
    goalId: string;
    currentAmount: number;
    targetAmount: number;
    targetDate: Date;
    projectedCompletionDate: Date;
    isOnTrack: boolean;
    daysAhead: number; // positive = ahead, negative = behind
    requiredMonthlyContribution: number;
    currentMonthlyContribution: number;
    shortfall: number;
    progressPercent: number;
    confidence: number;
}

export interface ContributionSuggestion {
    goalId: string;
    goalName: string;
    suggestedAmount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    reasoning: string;
    impact: {
        daysEarlier: number;
        newCompletionDate: Date;
    };
}

export interface GoalAlert {
    id: string;
    goalId: string;
    type: 'milestone_reached' | 'falling_behind' | 'goal_completed' | 'contribution_due' | 'deadline_approaching';
    message: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
    dismissed: boolean;
}

// In-memory stores
const goals: Map<string, Goal> = new Map();
const alerts: Map<string, GoalAlert> = new Map();

/**
 * Create milestone checkpoints for a goal
 */
function generateMilestones(targetAmount: number): Milestone[] {
    const milestones: Milestone[] = [];
    const percentages = [25, 50, 75, 90, 100];

    for (const pct of percentages) {
        milestones.push({
            id: `milestone_${pct}`,
            name: `${pct}% Complete`,
            targetAmount: Math.round((targetAmount * pct) / 100),
            notified: false,
        });
    }

    return milestones;
}

/**
 * Create a new goal
 */
export function createGoal(params: {
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    targetDate: Date;
    category: Goal['category'];
    priority?: Goal['priority'];
    autoContribute?: boolean;
    contributionFrequency?: Goal['contributionFrequency'];
    contributionAmount?: number;
    fundingAccountId?: string;
    destinationAccountId?: string;
}): Goal {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const goal: Goal = {
        id,
        userId: params.userId,
        name: params.name,
        description: params.description,
        targetAmount: params.targetAmount,
        currentAmount: 0,
        targetDate: params.targetDate,
        createdAt: new Date(),
        category: params.category,
        priority: params.priority || 'medium',
        autoContribute: params.autoContribute || false,
        contributionFrequency: params.contributionFrequency,
        contributionAmount: params.contributionAmount,
        fundingAccountId: params.fundingAccountId,
        destinationAccountId: params.destinationAccountId,
        milestones: generateMilestones(params.targetAmount),
        status: 'active',
    };

    goals.set(id, goal);
    return goal;
}

/**
 * Update goal progress
 */
export function updateGoalProgress(goalId: string, newAmount: number): {
    goal: Goal;
    reachedMilestones: Milestone[];
    isCompleted: boolean;
} {
    const goal = goals.get(goalId);
    if (!goal) throw new Error('Goal not found');

    const previousAmount = goal.currentAmount;
    goal.currentAmount = newAmount;

    // Check for reached milestones
    const reachedMilestones: Milestone[] = [];
    for (const milestone of goal.milestones) {
        if (!milestone.reachedAt && newAmount >= milestone.targetAmount) {
            milestone.reachedAt = new Date();
            reachedMilestones.push(milestone);

            // Create alert
            createGoalAlert(goalId, 'milestone_reached',
                `🎉 ${goal.name}: ${milestone.name}! You've saved $${newAmount.toLocaleString()}`
            );
        }
    }

    // Check for completion
    const isCompleted = newAmount >= goal.targetAmount;
    if (isCompleted && goal.status !== 'completed') {
        goal.status = 'completed';
        goal.completedAt = new Date();
        createGoalAlert(goalId, 'goal_completed',
            `🏆 Congratulations! You've reached your ${goal.name} goal of $${goal.targetAmount.toLocaleString()}!`,
            'high'
        );
    }

    return { goal, reachedMilestones, isCompleted };
}

/**
 * Calculate goal projection
 */
export function calculateProjection(goal: Goal): GoalProjection {
    const remaining = goal.targetAmount - goal.currentAmount;
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const monthsRemaining = daysRemaining / 30;

    // Required monthly contribution to meet goal
    const requiredMonthlyContribution = remaining / Math.max(1, monthsRemaining);

    // Current contribution rate (estimate from auto-contribute or last month)
    const currentMonthlyContribution = goal.contributionAmount || 0;

    // Projected completion based on current rate
    let projectedCompletionDate: Date;
    if (currentMonthlyContribution > 0) {
        const monthsToComplete = remaining / currentMonthlyContribution;
        projectedCompletionDate = new Date();
        projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + Math.ceil(monthsToComplete));
    } else {
        projectedCompletionDate = new Date(targetDate);
        projectedCompletionDate.setFullYear(projectedCompletionDate.getFullYear() + 10); // Far future
    }

    const isOnTrack = projectedCompletionDate <= targetDate;
    const daysAhead = Math.ceil((targetDate.getTime() - projectedCompletionDate.getTime()) / (1000 * 60 * 60 * 24));
    const shortfall = Math.max(0, requiredMonthlyContribution - currentMonthlyContribution);
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;

    // Confidence based on contribution consistency
    let confidence = 0.5;
    if (goal.autoContribute && goal.contributionAmount) confidence += 0.3;
    if (isOnTrack) confidence += 0.1;
    if (progressPercent > 20) confidence += 0.1;

    return {
        goalId: goal.id,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        targetDate,
        projectedCompletionDate,
        isOnTrack,
        daysAhead,
        requiredMonthlyContribution: Math.round(requiredMonthlyContribution * 100) / 100,
        currentMonthlyContribution,
        shortfall: Math.round(shortfall * 100) / 100,
        progressPercent: Math.round(progressPercent * 10) / 10,
        confidence: Math.min(1, confidence),
    };
}

/**
 * Generate contribution suggestions
 */
export function generateContributionSuggestions(
    userId: string,
    availableBudget: number
): ContributionSuggestion[] {
    const userGoals = Array.from(goals.values())
        .filter(g => g.userId === userId && g.status === 'active');

    if (userGoals.length === 0) return [];

    const suggestions: ContributionSuggestion[] = [];

    // Sort by priority and whether falling behind
    const projections = userGoals.map(g => ({
        goal: g,
        projection: calculateProjection(g),
    }));

    projections.sort((a, b) => {
        // Prioritize goals that are falling behind
        if (a.projection.isOnTrack !== b.projection.isOnTrack) {
            return a.projection.isOnTrack ? 1 : -1;
        }
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.goal.priority] - priorityOrder[b.goal.priority];
    });

    let remainingBudget = availableBudget;

    for (const { goal, projection } of projections) {
        if (remainingBudget <= 0) break;

        let suggestedAmount: number;
        let reasoning: string;

        if (!projection.isOnTrack) {
            // Suggest shortfall amount
            suggestedAmount = Math.min(remainingBudget, projection.shortfall);
            reasoning = `You're behind on this goal. Adding this amount will help you get back on track.`;
        } else if (projection.daysAhead < 30) {
            // Close to deadline
            suggestedAmount = Math.min(remainingBudget, projection.requiredMonthlyContribution * 0.5);
            reasoning = `Your deadline is approaching. Extra contributions will provide a safety buffer.`;
        } else {
            // On track - suggest acceleration
            suggestedAmount = Math.min(remainingBudget * 0.3, projection.requiredMonthlyContribution * 0.25);
            reasoning = `You're on track! This extra contribution would complete your goal earlier.`;
        }

        if (suggestedAmount > 10) {
            // Calculate impact
            const monthsEarlier = suggestedAmount / projection.requiredMonthlyContribution;
            const newCompletionDate = new Date(projection.projectedCompletionDate);
            newCompletionDate.setMonth(newCompletionDate.getMonth() - Math.floor(monthsEarlier));

            suggestions.push({
                goalId: goal.id,
                goalName: goal.name,
                suggestedAmount: Math.round(suggestedAmount),
                frequency: goal.contributionFrequency || 'monthly',
                reasoning,
                impact: {
                    daysEarlier: Math.floor(monthsEarlier * 30),
                    newCompletionDate,
                },
            });

            remainingBudget -= suggestedAmount;
        }
    }

    return suggestions;
}

/**
 * Create goal alert
 */
function createGoalAlert(
    goalId: string,
    type: GoalAlert['type'],
    message: string,
    priority: GoalAlert['priority'] = 'medium'
): GoalAlert {
    const alert: GoalAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        goalId,
        type,
        message,
        priority,
        createdAt: new Date(),
        dismissed: false,
    };

    alerts.set(alert.id, alert);
    return alert;
}

/**
 * Check goals for alerts
 */
export function checkGoalsForAlerts(userId: string): GoalAlert[] {
    const newAlerts: GoalAlert[] = [];
    const userGoals = Array.from(goals.values())
        .filter(g => g.userId === userId && g.status === 'active');

    for (const goal of userGoals) {
        const projection = calculateProjection(goal);

        // Deadline approaching (within 30 days)
        const daysToDeadline = Math.ceil(
            (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysToDeadline <= 30 && daysToDeadline > 0 && projection.progressPercent < 90) {
            newAlerts.push(createGoalAlert(goal.id, 'deadline_approaching',
                `⏰ ${goal.name} deadline is in ${daysToDeadline} days. You're at ${projection.progressPercent.toFixed(0)}%`,
                'high'
            ));
        }

        // Falling behind
        if (!projection.isOnTrack && projection.shortfall > 50) {
            newAlerts.push(createGoalAlert(goal.id, 'falling_behind',
                `📉 ${goal.name} is falling behind. Consider increasing contributions by $${projection.shortfall.toFixed(0)}/month`,
                'medium'
            ));
        }
    }

    return newAlerts;
}

/**
 * Get user goals
 */
export function getUserGoals(userId: string, status?: Goal['status']): Goal[] {
    let userGoals = Array.from(goals.values())
        .filter(g => g.userId === userId);

    if (status) {
        userGoals = userGoals.filter(g => g.status === status);
    }

    return userGoals.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Get goal alerts
 */
export function getGoalAlerts(userId: string): GoalAlert[] {
    const userGoalIds = new Set(
        Array.from(goals.values())
            .filter(g => g.userId === userId)
            .map(g => g.id)
    );

    return Array.from(alerts.values())
        .filter(a => userGoalIds.has(a.goalId) && !a.dismissed)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Dismiss alert
 */
export function dismissAlert(alertId: string): boolean {
    const alert = alerts.get(alertId);
    if (!alert) return false;
    alert.dismissed = true;
    return true;
}

export default {
    createGoal,
    updateGoalProgress,
    calculateProjection,
    generateContributionSuggestions,
    checkGoalsForAlerts,
    getUserGoals,
    getGoalAlerts,
    dismissAlert,
};
