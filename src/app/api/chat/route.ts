import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    processMessage,
    createConversation,
    addMessage,
    type ChatContext,
} from '@/lib/chat/ai-chat';

/**
 * AI Chat API Routes
 * 
 * Endpoints for conversational AI finance assistant.
 */

// In-memory conversation store (production would use database)
const conversations: Map<string, ChatContext> = new Map();

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            const conversation = conversations.get(conversationId);
            if (conversation && conversation.userId === user.id) {
                return NextResponse.json({
                    conversation: {
                        id: conversation.conversationId,
                        messages: conversation.messages,
                    }
                });
            }
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Return new conversation ID
        const newConversation = createConversation(user.id);
        conversations.set(newConversation.conversationId, newConversation);

        return NextResponse.json({
            conversationId: newConversation.conversationId,
            messages: [],
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { conversationId, message } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get or create conversation
        let context = conversationId ? conversations.get(conversationId) : null;

        if (!context) {
            context = createConversation(user.id);
            conversations.set(context.conversationId, context);
        }

        // Add financial context (in production, fetch from database)
        context.financialContext = {
            accounts: [
                { name: 'Checking', balance: 5432.10 },
                { name: 'Savings', balance: 12500.00 },
            ],
            budgets: [
                { category: 'Groceries', limit: 500, spent: 342 },
                { category: 'Dining', limit: 200, spent: 187 },
            ],
            goals: [
                { name: 'Emergency Fund', target: 10000, current: 7500 },
            ],
        };

        // Add user message
        addMessage(context, 'user', message);

        // Process and get response
        const response = await processMessage(message, context);

        // Add assistant message
        addMessage(context, 'assistant', response.message, {
            intent: response.intent.type,
            entities: response.intent.entities,
        });

        return NextResponse.json({
            conversationId: context.conversationId,
            response: {
                message: response.message,
                suggestions: response.suggestions,
                actions: response.actions,
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}
