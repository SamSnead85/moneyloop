import { createClient } from '@/lib/supabase/client';

export interface Alert {
    id: string;
    type: 'pattern' | 'threshold' | 'opportunity' | 'predictive' | 'bill' | 'subscription';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    impact?: string;
    actionLabel?: string;
    actionUrl?: string;
    dismissed: boolean;
    created_at: string;
}

// Pattern thresholds
const PATTERN_THRESHOLD = 3; // Number of months to detect pattern
const UNUSED_SUBSCRIPTION_DAYS = 60;
const BUDGET_WARNING_PERCENT = 85;

// Generate pattern-based alerts from transaction data
export function generatePatternAlerts(transactions: Array<{
    merchant_name?: string;
    category: string;
    amount: number;
    date: string;
}>): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    // Group by merchant
    const merchantSpending: Record<string, { total: number; count: number; months: Set<string> }> = {};

    transactions.filter(t => t.amount < 0).forEach(tx => {
        const merchant = tx.merchant_name || tx.category;
        const month = tx.date.substring(0, 7);

        if (!merchantSpending[merchant]) {
            merchantSpending[merchant] = { total: 0, count: 0, months: new Set() };
        }
        merchantSpending[merchant].total += Math.abs(tx.amount);
        merchantSpending[merchant].count += 1;
        merchantSpending[merchant].months.add(month);
    });

    // Identify high-spending patterns
    Object.entries(merchantSpending)
        .filter(([_, data]) => data.months.size >= PATTERN_THRESHOLD && data.total > 200)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3)
        .forEach(([merchant, data]) => {
            const monthlyAvg = data.total / data.months.size;
            const annualized = monthlyAvg * 12;

            if (monthlyAvg > 100) {
                alerts.push({
                    id: `pattern-${merchant}-${now.getTime()}`,
                    type: 'pattern',
                    severity: 'info',
                    title: `High "${merchant}" Spending`,
                    message: `You've spent $${monthlyAvg.toFixed(0)}/month at ${merchant} (${data.months.size} months). That's $${annualized.toFixed(0)}/year.`,
                    impact: `$${annualized.toFixed(0)}/year`,
                    actionLabel: 'Review Spending',
                    actionUrl: `/dashboard/transactions?merchant=${encodeURIComponent(merchant)}`,
                    dismissed: false,
                    created_at: now.toISOString(),
                });
            }
        });

    return alerts;
}

// Generate budget threshold alerts
export function generateBudgetAlerts(budgets: Array<{
    category: string;
    amount: number;
    spent: number;
}>): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    budgets.forEach(budget => {
        const percentUsed = (budget.spent / budget.amount) * 100;
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        if (percentUsed >= 100) {
            alerts.push({
                id: `budget-exceeded-${budget.category}-${now.getTime()}`,
                type: 'threshold',
                severity: 'critical',
                title: `${budget.category} Budget Exceeded`,
                message: `You've spent $${budget.spent.toFixed(0)} of your $${budget.amount} ${budget.category.toLowerCase()} budget.`,
                impact: `$${(budget.spent - budget.amount).toFixed(0)} over`,
                actionLabel: 'Review Budget',
                actionUrl: `/dashboard/budgets?category=${encodeURIComponent(budget.category)}`,
                dismissed: false,
                created_at: now.toISOString(),
            });
        } else if (percentUsed >= BUDGET_WARNING_PERCENT) {
            alerts.push({
                id: `budget-warning-${budget.category}-${now.getTime()}`,
                type: 'threshold',
                severity: 'warning',
                title: `${budget.category} Budget Warning`,
                message: `You're at ${percentUsed.toFixed(0)}% of your ${budget.category.toLowerCase()} budget with ${daysRemaining} days left.`,
                impact: `$${(budget.amount - budget.spent).toFixed(0)} left`,
                actionLabel: 'View Details',
                actionUrl: `/dashboard/budgets?category=${encodeURIComponent(budget.category)}`,
                dismissed: false,
                created_at: now.toISOString(),
            });
        }
    });

    return alerts;
}

// Generate bill payment alerts
export function generateBillAlerts(bills: Array<{
    name: string;
    amount: number;
    due_date: string;
}>): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    bills.forEach(bill => {
        const dueDate = new Date(bill.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 0) {
            alerts.push({
                id: `bill-overdue-${bill.name}-${now.getTime()}`,
                type: 'bill',
                severity: 'critical',
                title: `${bill.name} Overdue!`,
                message: `Your ${bill.name} payment of $${bill.amount.toFixed(2)} was due ${Math.abs(daysUntilDue)} days ago.`,
                actionLabel: 'Pay Now',
                actionUrl: '/dashboard/bills',
                dismissed: false,
                created_at: now.toISOString(),
            });
        } else if (daysUntilDue <= 3) {
            alerts.push({
                id: `bill-due-${bill.name}-${now.getTime()}`,
                type: 'bill',
                severity: 'warning',
                title: `Bill Due Soon`,
                message: `${bill.name} ($${bill.amount.toFixed(2)}) is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`,
                actionLabel: 'Pay Now',
                actionUrl: '/dashboard/bills',
                dismissed: false,
                created_at: now.toISOString(),
            });
        } else if (daysUntilDue <= 7) {
            alerts.push({
                id: `bill-upcoming-${bill.name}-${now.getTime()}`,
                type: 'bill',
                severity: 'info',
                title: `Upcoming Bill`,
                message: `${bill.name} ($${bill.amount.toFixed(2)}) is due in ${daysUntilDue} days.`,
                actionLabel: 'Schedule',
                actionUrl: '/dashboard/bills',
                dismissed: false,
                created_at: now.toISOString(),
            });
        }
    });

    return alerts;
}

// Generate opportunity alerts
export function generateOpportunityAlerts(data: {
    checkingBalance?: number;
    savingsRate?: number;
    creditUtilization?: number;
}): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    // High checking balance opportunity
    if (data.checkingBalance && data.checkingBalance > 5000) {
        const potentialEarnings = data.checkingBalance * 0.045; // 4.5% APY
        alerts.push({
            id: `opportunity-hysa-${now.getTime()}`,
            type: 'opportunity',
            severity: 'info',
            title: 'Maximize Your Savings',
            message: `You have $${data.checkingBalance.toLocaleString()} in checking. Move to a high-yield account to earn $${potentialEarnings.toFixed(0)}/year.`,
            impact: `$${potentialEarnings.toFixed(0)}/year`,
            actionLabel: 'Learn More',
            actionUrl: '/dashboard/insights#savings',
            dismissed: false,
            created_at: now.toISOString(),
        });
    }

    // Credit utilization warning
    if (data.creditUtilization && data.creditUtilization > 30) {
        alerts.push({
            id: `opportunity-credit-${now.getTime()}`,
            type: 'opportunity',
            severity: data.creditUtilization > 50 ? 'warning' : 'info',
            title: 'Credit Utilization High',
            message: `Your credit utilization is ${data.creditUtilization}%. Keeping it under 30% improves your credit score.`,
            actionLabel: 'Pay Down',
            actionUrl: '/dashboard/accounts',
            dismissed: false,
            created_at: now.toISOString(),
        });
    }

    return alerts;
}

// Get mock alerts for demo purposes
export function getMockAlerts(): Alert[] {
    const now = new Date();
    return [
        {
            id: 'alert-1',
            type: 'subscription',
            severity: 'warning',
            title: 'Unused Subscription',
            message: 'Spotify unused for 45 days. Cancel to save $11.99/month.',
            impact: '$144/year',
            actionLabel: 'Review',
            actionUrl: '/dashboard/subscriptions',
            dismissed: false,
            created_at: now.toISOString(),
        },
        {
            id: 'alert-2',
            type: 'opportunity',
            severity: 'info',
            title: 'Better Insurance Rate',
            message: 'Similar auto coverage available for $35 less per month.',
            impact: '$420/year',
            actionLabel: 'Compare',
            actionUrl: '/dashboard/insights',
            dismissed: false,
            created_at: now.toISOString(),
        },
        {
            id: 'alert-3',
            type: 'bill',
            severity: 'warning',
            title: 'Electric Bill Due',
            message: 'Duke Energy ($125) is due in 3 days.',
            actionLabel: 'Pay Now',
            actionUrl: '/dashboard/bills',
            dismissed: false,
            created_at: now.toISOString(),
        },
    ];
}
