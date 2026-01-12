'use server';

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Collaborative AI Agent Types
type AgentType = 'bill_payment' | 'budget' | 'task_priority' | 'spending_insights';

interface AgentContext {
    householdId: string;
    userId: string;
    contextId?: string;
}

interface AgentResult<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
    actions?: AgentAction[];
}

interface AgentAction {
    type: 'create_task' | 'update_budget' | 'send_notification' | 'schedule_reminder';
    payload: Record<string, unknown>;
    requiresApproval: boolean;
}

// Bill Payment Agent - Tracks and manages household bills
export async function runBillPaymentAgent(
    context: AgentContext
): Promise<AgentResult> {
    const supabase = await createClient();

    // Get upcoming bills from tasks
    const { data: bills } = await supabase
        .from('tasks')
        .select('*')
        .eq('household_id', context.householdId)
        .eq('type', 'bill')
        .in('status', ['open', 'claimed'])
        .order('due_date', { ascending: true })
        .limit(20);

    // Get household members
    const { data: members } = await supabase
        .from('household_members')
        .select('*, profile:profiles(*)')
        .eq('household_id', context.householdId);

    // Calculate bill summary
    const now = new Date();
    const overdue = bills?.filter(b => b.due_date && new Date(b.due_date) < now) || [];
    const upcomingWeek = bills?.filter(b => {
        if (!b.due_date) return false;
        const due = new Date(b.due_date);
        return due >= now && due <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }) || [];
    const totalDue = upcomingWeek.reduce((sum, b) => sum + (b.amount || 0), 0);

    // Generate AI recommendations
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze these household bills and provide recommendations:

Overdue Bills: ${JSON.stringify(overdue.map(b => ({ title: b.title, amount: b.amount, due: b.due_date })))}
Upcoming This Week: ${JSON.stringify(upcomingWeek.map(b => ({ title: b.title, amount: b.amount, due: b.due_date })))}
Total Due This Week: $${totalDue}
Household Members: ${members?.length || 1}

Provide:
1. Priority ranking of bills to pay first
2. Suggested task assignments based on bill type
3. Any automation opportunities (e.g., autopay suggestions)
4. Cash flow warning if total is high

Format as JSON: { priorities: [...], assignments: [...], automations: [...], warnings: [...] }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response
    let recommendations;
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        recommendations = null;
    }

    // Generate actions
    const actions: AgentAction[] = [];

    // Auto-assign unclaimed bills
    overdue.forEach(bill => {
        if (!bill.claimed_by && members && members.length > 0) {
            actions.push({
                type: 'update_budget',
                payload: {
                    taskId: bill.id,
                    priority: 'signal', // Escalate overdue to signal
                },
                requiresApproval: false,
            });
        }
    });

    return {
        success: true,
        data: {
            summary: {
                overdueCount: overdue.length,
                overdueTotal: overdue.reduce((s, b) => s + (b.amount || 0), 0),
                upcomingCount: upcomingWeek.length,
                upcomingTotal: totalDue,
            },
            bills: bills?.slice(0, 10),
            recommendations,
        },
        message: overdue.length > 0
            ? `⚠️ You have ${overdue.length} overdue bills totaling $${overdue.reduce((s, b) => s + (b.amount || 0), 0)}`
            : `You have ${upcomingWeek.length} bills due this week ($${totalDue})`,
        actions,
    };
}

// Budget Recommendation Agent
export async function runBudgetAgent(
    context: AgentContext
): Promise<AgentResult> {
    const supabase = await createClient();

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('household_id', context.householdId)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: false });

    // Calculate spending by category
    const spending: Record<string, number> = {};
    transactions?.forEach(t => {
        const category = t.category || 'Uncategorized';
        spending[category] = (spending[category] || 0) + Math.abs(t.amount);
    });

    const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);

    // Generate AI budget recommendations
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this household's spending and suggest budgets:

Monthly Spending by Category: ${JSON.stringify(spending)}
Total Monthly Spending: $${totalSpent.toFixed(2)}
Transaction Count: ${transactions?.length || 0}

Provide personalized budget recommendations:
1. Suggested monthly budget for each category
2. Areas to potentially reduce spending
3. Unusual spending patterns to flag
4. Savings opportunities

Format as JSON: { budgets: [{ category, suggested, current, savings_potential }], insights: [...], total_savings_opportunity: number }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let recommendations;
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        recommendations = null;
    }

    return {
        success: true,
        data: {
            currentSpending: spending,
            totalSpent,
            recommendations,
        },
        message: `Analyzed ${transactions?.length || 0} transactions. Total spending: $${totalSpent.toFixed(0)}`,
    };
}

// Task Priority Agent - Uses Signal/Noise paradigm
export async function runTaskPriorityAgent(
    context: AgentContext
): Promise<AgentResult> {
    const supabase = await createClient();

    // Get all open tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('household_id', context.householdId)
        .eq('status', 'open')
        .order('created_at', { ascending: true });

    if (!tasks || tasks.length === 0) {
        return {
            success: true,
            data: { signals: [], noise: [] },
            message: 'No open tasks to prioritize',
        };
    }

    // Generate AI prioritization
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Prioritize these tasks using the Signal vs Noise paradigm:
- SIGNAL: Maximum 3 tasks that are critical for today/this week
- NOISE: Everything else that can wait

Tasks: ${JSON.stringify(tasks.map(t => ({
        id: t.id,
        title: t.title,
        type: t.type,
        amount: t.amount,
        due_date: t.due_date,
        current_priority: t.priority,
    })))}

Consider:
1. Due date urgency
2. Financial impact (amount)
3. Task type importance (bills > goals > actions > reminders)
4. Dependencies

Format as JSON: { 
  signals: [{ id, reason }], 
  noise: [{ id, reason }],
  urgency_score: 0-10
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let prioritization;
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        prioritization = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        prioritization = null;
    }

    // Generate update actions
    const actions: AgentAction[] = [];

    if (prioritization?.signals) {
        prioritization.signals.forEach((s: { id: string }) => {
            const task = tasks.find(t => t.id === s.id);
            if (task && task.priority !== 'signal') {
                actions.push({
                    type: 'update_budget',
                    payload: { taskId: s.id, priority: 'signal' },
                    requiresApproval: true,
                });
            }
        });
    }

    return {
        success: true,
        data: {
            tasksAnalyzed: tasks.length,
            prioritization,
            signals: prioritization?.signals || [],
            noise: prioritization?.noise || [],
        },
        message: `Analyzed ${tasks.length} tasks. Recommended ${prioritization?.signals?.length || 0} as Signal.`,
        actions,
    };
}

// Family Spending Insights Agent
export async function runSpendingInsightsAgent(
    context: AgentContext
): Promise<AgentResult> {
    const supabase = await createClient();

    // Get transactions with context info
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, context:finance_contexts(name, type)')
        .eq('household_id', context.householdId)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false })
        .limit(500);

    // Split by context (personal vs business)
    const byContext: Record<string, number> = {};
    transactions?.forEach(t => {
        const ctxName = t.context?.name || 'Unassigned';
        byContext[ctxName] = (byContext[ctxName] || 0) + Math.abs(t.amount);
    });

    // Monthly trend
    const monthly: Record<string, number> = {};
    transactions?.forEach(t => {
        const month = t.date?.substring(0, 7) || 'Unknown';
        monthly[month] = (monthly[month] || 0) + Math.abs(t.amount);
    });

    // Generate AI insights
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this family's spending patterns:

Spending by Context: ${JSON.stringify(byContext)}
Monthly Trends: ${JSON.stringify(monthly)}
Total Transactions: ${transactions?.length || 0}

Provide family-friendly insights:
1. Overall financial health assessment
2. Spending trends (improving or concerning)
3. Comparison between personal and business spending
4. Recommendations for the household

Format as JSON: { 
  health_score: 0-100,
  health_label: string,
  trends: [...],
  comparisons: [...],
  recommendations: [...],
  highlights: [...] 
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let insights;
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        insights = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
        insights = null;
    }

    return {
        success: true,
        data: {
            byContext,
            monthly,
            transactionCount: transactions?.length || 0,
            insights,
        },
        message: insights?.health_label
            ? `Family financial health: ${insights.health_label} (${insights.health_score}/100)`
            : 'Analysis complete',
    };
}

// Main agent orchestrator
export async function runAgent(
    agentType: AgentType,
    context: AgentContext
): Promise<AgentResult> {
    switch (agentType) {
        case 'bill_payment':
            return runBillPaymentAgent(context);
        case 'budget':
            return runBudgetAgent(context);
        case 'task_priority':
            return runTaskPriorityAgent(context);
        case 'spending_insights':
            return runSpendingInsightsAgent(context);
        default:
            return {
                success: false,
                message: `Unknown agent type: ${agentType}`,
            };
    }
}
