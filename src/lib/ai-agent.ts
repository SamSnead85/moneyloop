import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AgentMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AgentContext {
    userId: string;
    userName?: string;
    accountSummary?: {
        totalBalance: number;
        netWorth: number;
        monthlyIncome: number;
        monthlyExpenses: number;
    };
    recentTransactions?: Array<{
        name: string;
        amount: number;
        category: string;
        date: string;
    }>;
    budgets?: Array<{
        category: string;
        amount: number;
        spent: number;
    }>;
    goals?: Array<{
        name: string;
        target: number;
        current: number;
    }>;
    subscriptions?: Array<{
        name: string;
        amount: number;
        lastUsed?: string;
    }>;
    upcomingBills?: Array<{
        name: string;
        amount: number;
        dueDate: string;
    }>;
}

// System prompt for the financial agent
const SYSTEM_PROMPT = `You are MoneyLoop AI, an intelligent financial assistant helping users manage their personal finances. You have access to the user's financial data including accounts, transactions, budgets, goals, subscriptions, and bills.

Your capabilities:
1. **Analyze Spending**: Identify patterns, unusual expenses, and areas for improvement
2. **Budget Advice**: Help users stay within budgets and suggest adjustments
3. **Goal Tracking**: Provide updates on financial goals and strategies to achieve them
4. **Bill Management**: Alert about upcoming bills and payment strategies
5. **Subscription Optimization**: Identify unused or duplicate subscriptions
6. **Savings Opportunities**: Find ways to save money based on spending patterns
7. **Tax Tips**: Basic tax-saving suggestions (not professional tax advice)

Guidelines:
- Be concise and actionable in your responses
- Use specific numbers from the user's data when available
- Prioritize high-impact suggestions
- Be encouraging but honest about financial habits
- Never provide specific investment advice or recommendations
- Always clarify you're an AI and not a licensed financial advisor for complex questions

When proposing actions that involve moving money or canceling services, always ask for explicit confirmation before proceeding.`;

// Build context string from user data
function buildContextString(context: AgentContext): string {
    let contextStr = '';

    if (context.accountSummary) {
        const { totalBalance, netWorth, monthlyIncome, monthlyExpenses } = context.accountSummary;
        contextStr += `\n\n**Account Summary:**
- Total Cash Balance: $${totalBalance.toLocaleString()}
- Net Worth: $${netWorth.toLocaleString()}
- Monthly Income: $${monthlyIncome.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Monthly Savings Rate: ${((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)}%`;
    }

    if (context.recentTransactions?.length) {
        contextStr += `\n\n**Recent Transactions (last 10):**\n`;
        context.recentTransactions.slice(0, 10).forEach(tx => {
            contextStr += `- ${tx.name}: $${Math.abs(tx.amount).toFixed(2)} (${tx.category}) on ${tx.date}\n`;
        });
    }

    if (context.budgets?.length) {
        contextStr += `\n\n**Budget Status:**\n`;
        context.budgets.forEach(b => {
            const pct = (b.spent / b.amount * 100).toFixed(0);
            contextStr += `- ${b.category}: $${b.spent.toFixed(0)} / $${b.amount.toFixed(0)} (${pct}%)\n`;
        });
    }

    if (context.goals?.length) {
        contextStr += `\n\n**Financial Goals:**\n`;
        context.goals.forEach(g => {
            const pct = (g.current / g.target * 100).toFixed(0);
            contextStr += `- ${g.name}: $${g.current.toLocaleString()} / $${g.target.toLocaleString()} (${pct}%)\n`;
        });
    }

    if (context.subscriptions?.length) {
        const total = context.subscriptions.reduce((s, sub) => s + sub.amount, 0);
        contextStr += `\n\n**Subscriptions (${context.subscriptions.length} active, $${total.toFixed(2)}/month):**\n`;
        context.subscriptions.forEach(s => {
            contextStr += `- ${s.name}: $${s.amount.toFixed(2)}/month${s.lastUsed ? ` (last used: ${s.lastUsed})` : ''}\n`;
        });
    }

    if (context.upcomingBills?.length) {
        contextStr += `\n\n**Upcoming Bills:**\n`;
        context.upcomingBills.forEach(b => {
            contextStr += `- ${b.name}: $${b.amount.toFixed(2)} due ${b.dueDate}\n`;
        });
    }

    return contextStr;
}

// Main chat function
export async function chat(
    messages: AgentMessage[],
    context: AgentContext
): Promise<string> {
    const contextString = buildContextString(context);
    const userName = context.userName || 'there';

    const systemWithContext = `${SYSTEM_PROMPT}

**User Information:**
Name: ${userName}
${contextString}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build conversation history for Gemini
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history,
            generationConfig: {
                maxOutputTokens: 1024,
            },
        });

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        const prompt = messages.length === 1
            ? `${systemWithContext}\n\nUser: ${lastMessage.content}`
            : lastMessage.content;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text() || 'I apologize, but I was unable to generate a response. Please try again.';
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to get response from AI agent');
    }
}

// Generate insights from financial data
export async function generateInsights(context: AgentContext): Promise<string[]> {
    const contextString = buildContextString(context);

    const prompt = `Based on the following financial data, generate 3-5 actionable insights for the user. Each insight should be specific, data-driven, and include a potential impact amount where applicable. Format each insight as a single sentence.

${contextString}

Generate insights in this format:
1. [Insight about spending patterns or opportunities]
2. [Insight about budget or savings]
3. [Insight about subscriptions or bills]
...`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 512,
            },
        });

        const response = await result.response;
        const text = response.text() || '';

        // Parse numbered insights
        const insights = text
            .split(/\d+\.\s+/)
            .filter(s => s.trim())
            .map(s => s.trim().replace(/\n/g, ' '));

        return insights;
    } catch (error) {
        console.error('Failed to generate insights:', error);
        return [];
    }
}

// Specialized agent functions

export async function analyzeBudget(context: AgentContext): Promise<{
    recommendations: string[];
    alerts: Array<{ category: string; severity: 'warning' | 'critical'; message: string }>;
}> {
    const recommendations: string[] = [];
    const alerts: Array<{ category: string; severity: 'warning' | 'critical'; message: string }> = [];

    if (context.budgets) {
        for (const budget of context.budgets) {
            const pct = (budget.spent / budget.amount) * 100;

            if (pct >= 100) {
                alerts.push({
                    category: budget.category,
                    severity: 'critical',
                    message: `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.amount).toFixed(0)}`,
                });
            } else if (pct >= 85) {
                alerts.push({
                    category: budget.category,
                    severity: 'warning',
                    message: `You're at ${pct.toFixed(0)}% of your ${budget.category} budget`,
                });
            }
        }
    }

    if (context.accountSummary) {
        const savingsRate = (context.accountSummary.monthlyIncome - context.accountSummary.monthlyExpenses) / context.accountSummary.monthlyIncome;

        if (savingsRate < 0.1) {
            recommendations.push('Consider increasing your savings rate to at least 10% of income');
        } else if (savingsRate < 0.2) {
            recommendations.push('You\'re saving well! Consider boosting to 20% for faster goal progress');
        } else {
            recommendations.push('Excellent savings rate! You\'re on track for financial independence');
        }
    }

    return { recommendations, alerts };
}

export async function analyzeSubscriptions(subscriptions: AgentContext['subscriptions']): Promise<{
    unused: string[];
    duplicates: string[][];
    potentialSavings: number;
}> {
    const unused: string[] = [];
    const duplicates: string[][] = [];
    let potentialSavings = 0;

    if (!subscriptions) return { unused, duplicates, potentialSavings };

    // Find unused subscriptions (not used in 60+ days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const sub of subscriptions) {
        if (sub.lastUsed) {
            const lastUsedDate = new Date(sub.lastUsed);
            if (lastUsedDate < sixtyDaysAgo) {
                unused.push(sub.name);
                potentialSavings += sub.amount * 12; // Annual savings
            }
        }
    }

    // Find duplicate categories (streaming, music, etc.)
    const streamingServices = subscriptions.filter(s =>
        ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Amazon Prime Video', 'Apple TV+', 'Peacock'].some(
            name => s.name.toLowerCase().includes(name.toLowerCase())
        )
    );
    if (streamingServices.length > 2) {
        duplicates.push(streamingServices.map(s => s.name));
    }

    const musicServices = subscriptions.filter(s =>
        ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal'].some(
            name => s.name.toLowerCase().includes(name.toLowerCase())
        )
    );
    if (musicServices.length > 1) {
        duplicates.push(musicServices.map(s => s.name));
    }

    return { unused, duplicates, potentialSavings };
}
