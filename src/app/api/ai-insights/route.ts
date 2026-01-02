import { NextRequest, NextResponse } from 'next/server';

// AI Insights API - Powered by Gemini
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, context } = body;

        // For now, return smart pre-built responses
        // In production, this would call Gemini API
        const responses: Record<string, string> = {
            default: `Based on your financial data, here are some insights:

**Spending Pattern:** You're spending 15% more on dining than last month. Consider setting a dining budget of $400/month to stay on track.

**Savings Opportunity:** I noticed 3 subscriptions you haven't used in 30+ days. Canceling them would save you $47/month ($564/year).

**Tax Optimization:** You have $8,500 in unused SEP-IRA contribution room. Contributing before April 15th could reduce your tax burden by approximately $2,040.

Would you like me to elaborate on any of these?`,

            spending: `Looking at your spending over the past 3 months:

📊 **Top Categories:**
1. Housing: $2,400/month (32% of income)
2. Food & Dining: $680/month (9%)
3. Transportation: $450/month (6%)
4. Subscriptions: $273/month (4%)

💡 **Key Insight:** Your housing cost is right at the recommended 30% threshold. Your subscription spending is higher than average—I found 3 services you haven't used in 30+ days.

🎯 **Recommendation:** Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're currently at 52/33/15. Shifting 5% from wants to savings could add $375/month to your investments.`,

            deductions: `Based on your transaction history, here are potential tax deductions I've identified:

✅ **Home Office:** $2,400 (150 sq ft × $5/sq ft simplified method)
✅ **Business Travel:** $3,200 (8 trips detected)
✅ **Vehicle Expenses:** $4,800 (8,000 miles @ $0.67/mile)
✅ **Equipment:** $1,850 (Section 179 eligible)
⚠️ **Health Insurance:** $6,000 (needs documentation)

**Total Potential Deductions:** $18,250
**Estimated Tax Savings:** $4,380 (at 24% bracket)

I can generate a detailed report for your accountant or export directly to TurboTax.`,

            retirement: `Great question about retirement planning! Here's your current snapshot:

📈 **Current Retirement Savings:** $127,450
📊 **Monthly Contribution:** $500 (6% of income)
🎯 **Employer Match:** $250/month (you're maximizing this!)

**Projection at Current Rate:**
- Age 50: $312,000
- Age 60: $687,000
- Age 65: $945,000

💡 **Opportunity:** You're eligible for a SEP-IRA with up to $8,500 additional contribution room this year. This would:
- Reduce your 2025 tax bill by ~$2,040
- Add ~$34,000+ to your retirement by age 65

Want me to model different contribution scenarios?`,
        };

        // Simple keyword matching for demo
        let response = responses.default;
        const q = question.toLowerCase();

        if (q.includes('spend') || q.includes('budget')) {
            response = responses.spending;
        } else if (q.includes('tax') || q.includes('deduct') || q.includes('write')) {
            response = responses.deductions;
        } else if (q.includes('retire') || q.includes('401k') || q.includes('ira') || q.includes('invest')) {
            response = responses.retirement;
        }

        return NextResponse.json({
            success: true,
            response,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('AI Insights error:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
