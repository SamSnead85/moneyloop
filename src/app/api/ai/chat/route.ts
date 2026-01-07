import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, generateInsights, AgentContext, AgentMessage } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messages, action } = body as {
            messages?: AgentMessage[];
            action?: 'chat' | 'insights';
        };

        // Build context from user's financial data
        const context = await buildUserContext(supabase, user.id);

        if (action === 'insights') {
            const insights = await generateInsights(context);
            return NextResponse.json({ insights });
        }

        // Default: chat
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages required for chat' }, { status: 400 });
        }

        const response = await chat(messages, context);

        // Save conversation to database
        await saveConversation(supabase, user.id, messages, response);

        return NextResponse.json({ response });
    } catch (error) {
        console.error('AI Agent API error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

async function buildUserContext(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<AgentContext> {
    const context: AgentContext = { userId };

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

    if (profile?.full_name) {
        context.userName = profile.full_name.split(' ')[0];
    }

    // Get accounts and calculate totals
    const { data: accounts } = await supabase
        .from('accounts')
        .select('balance, type')
        .eq('user_id', userId);

    if (accounts?.length) {
        const totalBalance = accounts
            .filter(a => ['checking', 'savings'].includes(a.type))
            .reduce((sum, a) => sum + (a.balance || 0), 0);

        const netWorth = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

        context.accountSummary = {
            totalBalance,
            netWorth,
            monthlyIncome: 0,
            monthlyExpenses: 0,
        };
    }

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('name, amount, category, date')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(50);

    if (transactions?.length) {
        context.recentTransactions = transactions.map(t => ({
            name: t.name,
            amount: t.amount,
            category: t.category || 'Uncategorized',
            date: t.date,
        }));

        // Calculate monthly income and expenses
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

        if (context.accountSummary) {
            context.accountSummary.monthlyIncome = income;
            context.accountSummary.monthlyExpenses = expenses;
        }
    }

    // Get budgets
    const { data: budgets } = await supabase
        .from('budgets')
        .select('category, amount, spent')
        .eq('user_id', userId);

    if (budgets?.length) {
        context.budgets = budgets.map(b => ({
            category: b.category,
            amount: b.amount,
            spent: b.spent || 0,
        }));
    }

    // Get goals
    const { data: goals } = await supabase
        .from('goals')
        .select('name, target_amount, current_amount')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (goals?.length) {
        context.goals = goals.map(g => ({
            name: g.name,
            target: g.target_amount,
            current: g.current_amount || 0,
        }));
    }

    // Get subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('service_name, amount, last_used_at')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (subscriptions?.length) {
        context.subscriptions = subscriptions.map(s => ({
            name: s.service_name,
            amount: s.amount,
            lastUsed: s.last_used_at,
        }));
    }

    // Get upcoming bills (next 14 days)
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    const { data: bills } = await supabase
        .from('bills')
        .select('name, amount, due_date')
        .eq('user_id', userId)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', fourteenDaysFromNow.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

    if (bills?.length) {
        context.upcomingBills = bills.map(b => ({
            name: b.name,
            amount: b.amount,
            dueDate: b.due_date,
        }));
    }

    return context;
}

async function saveConversation(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    messages: AgentMessage[],
    latestResponse: string
) {
    // Get or create conversation
    const { data: existing } = await supabase
        .from('ai_conversations')
        .select('id, messages')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    const allMessages = [
        ...messages,
        { role: 'assistant', content: latestResponse }
    ];

    if (existing) {
        // Update existing conversation
        await supabase
            .from('ai_conversations')
            .update({ messages: allMessages, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
    } else {
        // Create new conversation
        await supabase
            .from('ai_conversations')
            .insert({
                user_id: userId,
                messages: allMessages,
            });
    }
}
