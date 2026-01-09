import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

// Admin bypass email
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

// Financial context for the AI
const SYSTEM_PROMPT = `You are MoneyLoop AI, a helpful and knowledgeable financial assistant embedded in a personal finance app called MoneyLoop.

Your role is to:
1. Help users understand their financial situation
2. Provide actionable savings tips and budgeting advice
3. Explain financial concepts in simple terms
4. Analyze spending patterns and suggest improvements
5. Assist with goal planning and debt payoff strategies

Guidelines:
- Be conversational but professional
- Give specific, actionable advice when possible
- Use numbers and percentages when discussing finances
- Be encouraging about financial progress
- Never give specific investment advice or recommend specific stocks/funds
- If asked about investments, recommend consulting a licensed financial advisor
- Keep responses concise but comprehensive (aim for 2-4 paragraphs)

You have access to the user's financial data context when provided. Use it to personalize your responses.`;

export async function POST(request: NextRequest) {
    try {
        // Check for admin bypass cookie first
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');
        let userId: string | undefined;

        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            userId = 'admin-bypass-user';
        } else {
            // Regular Supabase auth flow
            const supabase = await createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            userId = user.id;
        }

        const { query } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Missing query' },
                { status: 400 }
            );
        }

        // Initialize Anthropic client
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            // Fallback response when API key not configured
            return NextResponse.json({
                response: generateFallbackResponse(query)
            });
        }

        const anthropic = new Anthropic({ apiKey });

        // Generate response
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [
                { role: 'user', content: query }
            ],
        });

        // Extract text from response
        const responseText = message.content
            .filter(block => block.type === 'text')
            .map(block => (block as { type: 'text'; text: string }).text)
            .join('\n');

        return NextResponse.json({
            response: responseText,
            usage: {
                input_tokens: message.usage.input_tokens,
                output_tokens: message.usage.output_tokens,
            }
        });
    } catch (error) {
        console.error('Error in AI ask endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

// Generate helpful fallback responses when API key not configured
function generateFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
        return `Here are some proven strategies to boost your savings:

**1. Automate Your Savings**: Set up automatic transfers on payday to move 10-20% of your income directly to savings before you can spend it.

**2. 50/30/20 Rule**: Allocate 50% to needs, 30% to wants, and 20% to savings. Review your transactions in the Transactions tab to see where you stand.

**3. Cut Subscriptions**: Check your Subscriptions page - the average person wastes $200+/month on unused subscriptions.

**4. Meal Planning**: Reduce food spending by 30-40% by planning meals weekly and using the Grocery feature to track spending.

Would you like me to analyze any specific area of your spending?`;
    }

    if (lowerQuery.includes('doing') || lowerQuery.includes('month') || lowerQuery.includes('how am i')) {
        return `Based on your MoneyLoop dashboard, here's a quick financial health check:

**Cash Flow**: Check your Overview page for your net cash flow this month. Positive is great - you're spending less than you earn!

**Budget Performance**: Visit Budgets to see how you're tracking against your spending limits in each category.

**Goal Progress**: Your Goals page shows if you're on track for savings targets.

**Key Tip**: If your spending is higher than expected, look at your Transactions for the biggest expenses this month.

For a detailed analysis, I recommend reviewing your Reports section for month-over-month trends.`;
    }

    if (lowerQuery.includes('expense') || lowerQuery.includes('spending') || lowerQuery.includes('biggest')) {
        return `To identify your biggest expenses, here's what I recommend:

**1. Check Transactions**: Sort by amount (highest first) to see your largest individual purchases this month.

**2. Review Categories**: Your Budgets page shows spending by category - typically Housing, Food, and Transportation are the top 3.

**3. Look for Patterns**: In Reports, compare this month to previous months to spot unusual spikes.

**Common Expense Traps**:
- Subscription creep (small monthly fees that add up)
- Convenience spending (delivery fees, rideshares)
- Lifestyle inflation after a raise

Would you like tips on reducing spending in a specific category?`;
    }

    if (lowerQuery.includes('subscription')) {
        return `Let's analyze your subscriptions:

**What to Review**:
1. Visit the Subscriptions tab to see all recurring charges
2. Sort by amount to identify the most expensive ones
3. Look for overlap (multiple streaming services, duplicate tools)

**Average Savings Potential**: Most people can cut $50-150/month by canceling unused subscriptions.

**Quick Wins**:
- Cancel "free trials" that converted to paid
- Downgrade annual plans you rarely use
- Share family plans when possible
- Use the "cancel and wait" strategy - many services offer discounts to win you back

Check your Subscriptions page now to see the full breakdown!`;
    }

    if (lowerQuery.includes('goal') || lowerQuery.includes('progress')) {
        return `Let's check on your financial goals:

**View Your Goals**: Head to the Goals page to see all active goals with progress bars and projected completion dates.

**Tips for Faster Progress**:
1. Automate transfers to goal-specific accounts
2. Use "found money" (tax refunds, bonuses) for goals
3. Set milestone celebrations to stay motivated
4. Review and adjust targets quarterly

**Goal Setting Best Practices**:
- Emergency fund: 3-6 months of expenses (high priority)
- Specific targets work better than vague ones
- Break big goals into smaller milestones

Which goal would you like to focus on accelerating?`;
    }

    // Default response
    return `I'm MoneyLoop AI, your personal financial assistant! I can help you with:

**📊 Spending Analysis**: Understanding where your money goes
**💰 Savings Strategies**: Tips to save more each month  
**🎯 Goal Planning**: Strategies to reach your financial targets
**📝 Budget Advice**: Creating and sticking to budgets
**💳 Subscription Management**: Finding and cutting waste
**📈 Financial Health**: Overall money wellness tips

**Try asking me things like**:
- "How am I doing this month?"
- "How can I save more money?"
- "What are my biggest expenses?"
- "Analyze my subscriptions"

What would you like to explore?`;
}
