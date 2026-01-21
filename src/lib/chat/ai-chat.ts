/**
 * AI Financial Chat System
 * 
 * Conversational finance assistant with natural language
 * queries and voice command support.
 * 
 * Super-Sprint 28: Phases 2701-2750
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        intent?: string;
        entities?: Record<string, unknown>;
        actionTaken?: string;
        dataQueried?: string[];
    };
}

export interface ChatContext {
    userId: string;
    conversationId: string;
    messages: ChatMessage[];
    financialContext?: {
        accounts?: { name: string; balance: number }[];
        budgets?: { category: string; limit: number; spent: number }[];
        goals?: { name: string; target: number; current: number }[];
        recentTransactions?: { merchant: string; amount: number; date: Date }[];
    };
}

export interface ChatIntent {
    type: string;
    confidence: number;
    entities: Record<string, unknown>;
    suggestedQuery?: string;
}

export interface ChatResponse {
    message: string;
    intent: ChatIntent;
    data?: unknown;
    suggestions?: string[];
    actions?: { label: string; action: string; params?: Record<string, unknown> }[];
}

// Intent patterns
const INTENT_PATTERNS: { pattern: RegExp; intent: string; extractor?: (match: RegExpMatchArray) => Record<string, unknown> }[] = [
    { pattern: /how much (did i|have i) spen(t|d)/i, intent: 'query_spending' },
    { pattern: /what('s| is) my balance/i, intent: 'query_balance' },
    { pattern: /show me (my )?(transactions|spending)/i, intent: 'query_transactions' },
    { pattern: /how much (did i|have i) spen(t|d) (on|at) (.+)/i, intent: 'query_spending_category', extractor: (m) => ({ category: m[4] }) },
    { pattern: /am i on (track|budget)/i, intent: 'query_budget_status' },
    { pattern: /how close am i to my (.+) goal/i, intent: 'query_goal_progress', extractor: (m) => ({ goalName: m[1] }) },
    { pattern: /when (will i|can i) (pay off|be done with) (.+)/i, intent: 'query_debt_payoff', extractor: (m) => ({ debtName: m[3] }) },
    { pattern: /what bills? (are|is) (due|coming)/i, intent: 'query_upcoming_bills' },
    { pattern: /set (a )?budget (of|for) \$?(\d+)/i, intent: 'action_set_budget', extractor: (m) => ({ amount: parseInt(m[3]) }) },
    { pattern: /add (\d+) to (.+) goal/i, intent: 'action_add_to_goal', extractor: (m) => ({ amount: parseInt(m[1]), goalName: m[2] }) },
    { pattern: /categorize (.+) as (.+)/i, intent: 'action_categorize', extractor: (m) => ({ merchant: m[1], category: m[2] }) },
    { pattern: /remind me (to|about) (.+)/i, intent: 'action_set_reminder', extractor: (m) => ({ reminder: m[2] }) },
    { pattern: /what'?s my (financial )?health score/i, intent: 'query_health_score' },
    { pattern: /give me (a )?(tips?|advice|suggestions?)/i, intent: 'query_tips' },
    { pattern: /compare (my )?spending/i, intent: 'query_spending_comparison' },
];

// Quick responses for common queries
const QUICK_RESPONSES: Record<string, (ctx: ChatContext) => string> = {
    greeting: () => "Hi! I'm your MoneyLoop AI assistant. I can help you track spending, check budgets, and answer questions about your finances. What would you like to know?",

    query_balance: (ctx) => {
        const accounts = ctx.financialContext?.accounts || [];
        if (accounts.length === 0) return "I don't see any connected accounts. Would you like to connect a bank account?";
        const total = accounts.reduce((s, a) => s + a.balance, 0);
        return `Your total balance across ${accounts.length} account(s) is $${total.toLocaleString()}. Would you like to see a breakdown?`;
    },

    query_budget_status: (ctx) => {
        const budgets = ctx.financialContext?.budgets || [];
        if (budgets.length === 0) return "You haven't set up any budgets yet. Would you like me to help you create one?";
        const overBudget = budgets.filter(b => b.spent > b.limit);
        if (overBudget.length === 0) return "Great news! You're on track with all your budgets this month! 🎉";
        return `You're over budget in ${overBudget.length} category(s): ${overBudget.map(b => b.category).join(', ')}. Want me to show you where you can cut back?`;
    },

    query_health_score: () => "Your financial health score is being calculated based on your savings rate, debt levels, and spending habits. Would you like a detailed breakdown?",

    fallback: () => "I'm not sure I understood that. You can ask me about your spending, budgets, goals, or bills. For example, try 'How much did I spend this month?' or 'What bills are due soon?'",
};

/**
 * Detect intent from user message
 */
export function detectIntent(message: string): ChatIntent {
    const normalized = message.toLowerCase().trim();

    // Check for greetings
    if (/^(hi|hello|hey|howdy|yo)/i.test(normalized)) {
        return { type: 'greeting', confidence: 0.9, entities: {} };
    }

    // Check patterns
    for (const { pattern, intent, extractor } of INTENT_PATTERNS) {
        const match = normalized.match(pattern);
        if (match) {
            return {
                type: intent,
                confidence: 0.85,
                entities: extractor ? extractor(match) : {},
            };
        }
    }

    // Fallback to general query
    return { type: 'unknown', confidence: 0.3, entities: {} };
}

/**
 * Generate quick response without AI
 */
function generateQuickResponse(intent: ChatIntent, context: ChatContext): string | null {
    // Handle greetings
    if (intent.type === 'greeting') {
        return QUICK_RESPONSES.greeting(context);
    }

    // Handle known intents with quick responses
    const quickHandler = QUICK_RESPONSES[intent.type];
    if (quickHandler && intent.confidence > 0.7) {
        return quickHandler(context);
    }

    return null;
}

/**
 * Process chat message and generate response
 */
export async function processMessage(
    message: string,
    context: ChatContext
): Promise<ChatResponse> {
    // Detect intent
    const intent = detectIntent(message);

    // Try quick response first
    const quickResponse = generateQuickResponse(intent, context);
    if (quickResponse && intent.confidence > 0.8) {
        return {
            message: quickResponse,
            intent,
            suggestions: getSuggestions(intent.type),
        };
    }

    // Use AI for complex queries or low confidence
    try {
        const aiResponse = await generateAIResponse(message, context, intent);
        return aiResponse;
    } catch (error) {
        console.error('AI response error:', error);
        return {
            message: QUICK_RESPONSES.fallback(context),
            intent: { type: 'fallback', confidence: 1, entities: {} },
            suggestions: [
                "How much did I spend this month?",
                "What's my account balance?",
                "Show me upcoming bills",
            ],
        };
    }
}

/**
 * Generate AI-powered response
 */
async function generateAIResponse(
    message: string,
    context: ChatContext,
    intent: ChatIntent
): Promise<ChatResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            message: "I'd love to help, but AI features aren't configured. I can still answer basic questions about your accounts and budgets.",
            intent,
            suggestions: getSuggestions(intent.type),
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are a helpful financial assistant for MoneyLoop, a personal finance app. 
Be concise, friendly, and actionable. Use emojis sparingly.
Always provide specific numbers when available.
If asked about something that requires action, suggest what the user can do.
Never make up financial data - only reference what's in the context.

User's financial context:
${JSON.stringify(context.financialContext, null, 2)}

Detected intent: ${intent.type}
Intent confidence: ${intent.confidence}
Extracted entities: ${JSON.stringify(intent.entities)}`;

    // Build conversation history
    const chatHistory = context.messages.slice(-5).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
        history: chatHistory as { role: "user" | "model"; parts: { text: string }[] }[],
        generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const responseText = result.response.text();

    return {
        message: responseText,
        intent,
        suggestions: getSuggestions(intent.type),
        actions: getActions(intent),
    };
}

/**
 * Get follow-up suggestions based on intent
 */
function getSuggestions(intentType: string): string[] {
    const suggestionMap: Record<string, string[]> = {
        query_spending: [
            "Break down by category",
            "Compare to last month",
            "Show unusual transactions",
        ],
        query_balance: [
            "Show all accounts",
            "What's my net worth?",
            "Show recent transactions",
        ],
        query_budget_status: [
            "Which categories are over budget?",
            "Adjust my budgets",
            "Show spending trends",
        ],
        query_goal_progress: [
            "Add money to this goal",
            "Show all my goals",
            "When will I reach this goal?",
        ],
        unknown: [
            "How much did I spend this month?",
            "What's my account balance?",
            "Am I on budget?",
            "Show upcoming bills",
        ],
    };

    return suggestionMap[intentType] || suggestionMap.unknown;
}

/**
 * Get actionable buttons based on intent
 */
function getActions(intent: ChatIntent): ChatResponse['actions'] {
    const actions: ChatResponse['actions'] = [];

    if (intent.type === 'query_spending') {
        actions.push({ label: 'View Details', action: 'navigate', params: { path: '/dashboard/transactions' } });
    } else if (intent.type === 'query_budget_status') {
        actions.push({ label: 'View Budgets', action: 'navigate', params: { path: '/dashboard/budgets' } });
        actions.push({ label: 'Adjust Budget', action: 'modal', params: { modal: 'budget-editor' } });
    } else if (intent.type.startsWith('action_')) {
        actions.push({ label: 'Confirm', action: 'confirm', params: intent.entities });
        actions.push({ label: 'Cancel', action: 'cancel' });
    }

    return actions.length > 0 ? actions : undefined;
}

/**
 * Create new conversation
 */
export function createConversation(userId: string): ChatContext {
    return {
        userId,
        conversationId: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        messages: [],
    };
}

/**
 * Add message to conversation
 */
export function addMessage(
    context: ChatContext,
    role: ChatMessage['role'],
    content: string,
    metadata?: ChatMessage['metadata']
): ChatMessage {
    const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role,
        content,
        timestamp: new Date(),
        metadata,
    };

    context.messages.push(message);
    return message;
}

/**
 * Parse voice command (stub for speech-to-text)
 */
export async function parseVoiceCommand(audioBlob: Blob): Promise<string> {
    // In production, use Web Speech API or cloud service
    console.log('Voice command received, size:', audioBlob.size);
    return 'Voice recognition not implemented';
}

export default {
    processMessage,
    detectIntent,
    createConversation,
    addMessage,
    parseVoiceCommand,
};
