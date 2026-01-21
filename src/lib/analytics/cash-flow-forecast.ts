/**
 * Cash Flow Forecasting Engine
 * 
 * ML-based cash flow prediction with pattern detection and confidence intervals.
 * Supports 7, 30, and 90-day forecasts with scenario modeling.
 * 
 * Phase 51-55 of Sprint 1.3
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface Transaction {
    id: string;
    amount: number;
    date: Date;
    category: string;
    isRecurring?: boolean;
    merchant?: string;
}

export interface RecurringPattern {
    id: string;
    name: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
    nextOccurrence: Date;
    category: string;
    type: 'income' | 'expense';
    confidence: number;
    occurrences: number;
}

export interface ForecastDay {
    date: Date;
    predictedBalance: number;
    predictedIncome: number;
    predictedExpenses: number;
    confidence: number;
    events: {
        name: string;
        amount: number;
        type: 'income' | 'expense' | 'transfer';
        isRecurring: boolean;
    }[];
    lowEstimate: number;
    highEstimate: number;
}

export interface CashFlowForecast {
    startDate: Date;
    endDate: Date;
    startingBalance: number;
    endingBalance: {
        predicted: number;
        low: number;
        high: number;
    };
    dailyForecasts: ForecastDay[];
    patterns: RecurringPattern[];
    insights: string[];
    confidence: number;
    generatedAt: Date;
}

export type ForecastPeriod = '7d' | '30d' | '90d';

/**
 * Detect recurring patterns from transaction history
 */
function detectRecurringPatterns(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    const merchantGroups: Map<string, Transaction[]> = new Map();

    // Group transactions by merchant/name
    for (const tx of transactions) {
        const key = tx.merchant || tx.category;
        if (!merchantGroups.has(key)) {
            merchantGroups.set(key, []);
        }
        merchantGroups.get(key)!.push(tx);
    }

    // Analyze each merchant group for patterns
    for (const [name, txs] of merchantGroups) {
        if (txs.length < 2) continue;

        // Sort by date
        const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate average interval between transactions
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
            const days = Math.round(
                (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            intervals.push(days);
        }

        if (intervals.length === 0) continue;

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Determine frequency based on average interval
        let frequency: RecurringPattern['frequency'];
        let expectedInterval: number;

        if (avgInterval <= 1.5) {
            frequency = 'daily';
            expectedInterval = 1;
        } else if (avgInterval <= 9) {
            frequency = 'weekly';
            expectedInterval = 7;
        } else if (avgInterval <= 18) {
            frequency = 'biweekly';
            expectedInterval = 14;
        } else if (avgInterval <= 45) {
            frequency = 'monthly';
            expectedInterval = 30;
        } else if (avgInterval <= 120) {
            frequency = 'quarterly';
            expectedInterval = 90;
        } else {
            frequency = 'yearly';
            expectedInterval = 365;
        }

        // Calculate confidence based on consistency
        const deviationFromExpected = Math.abs(avgInterval - expectedInterval) / expectedInterval;
        const consistencyScore = Math.max(0, 1 - (stdDev / avgInterval));
        const confidence = Math.round((consistencyScore * (1 - deviationFromExpected * 0.5)) * 100) / 100;

        if (confidence < 0.5) continue; // Skip low-confidence patterns

        // Calculate average amount
        const avgAmount = sorted.reduce((sum, tx) => sum + tx.amount, 0) / sorted.length;

        // Predict next occurrence
        const lastTx = sorted[sorted.length - 1];
        const nextOccurrence = new Date(lastTx.date);
        nextOccurrence.setDate(nextOccurrence.getDate() + expectedInterval);

        patterns.push({
            id: `pattern_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name,
            amount: Math.round(avgAmount * 100) / 100,
            frequency,
            nextOccurrence,
            category: sorted[0].category,
            type: avgAmount > 0 ? 'income' : 'expense',
            confidence,
            occurrences: sorted.length,
        });
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate future occurrences based on patterns
 */
function generateFutureOccurrences(
    patterns: RecurringPattern[],
    startDate: Date,
    endDate: Date
): Map<string, { name: string; amount: number; type: 'income' | 'expense'; isRecurring: boolean }[]> {
    const occurrences: Map<string, { name: string; amount: number; type: 'income' | 'expense'; isRecurring: boolean }[]> = new Map();

    const frequencyDays: Record<RecurringPattern['frequency'], number> = {
        daily: 1,
        weekly: 7,
        biweekly: 14,
        monthly: 30,
        quarterly: 90,
        yearly: 365,
    };

    for (const pattern of patterns) {
        let current = new Date(pattern.nextOccurrence);
        const interval = frequencyDays[pattern.frequency];

        while (current <= endDate) {
            if (current >= startDate) {
                const dateKey = current.toISOString().split('T')[0];

                if (!occurrences.has(dateKey)) {
                    occurrences.set(dateKey, []);
                }

                occurrences.get(dateKey)!.push({
                    name: pattern.name,
                    amount: Math.abs(pattern.amount),
                    type: pattern.type,
                    isRecurring: true,
                });
            }

            current = new Date(current);
            current.setDate(current.getDate() + interval);
        }
    }

    return occurrences;
}

/**
 * Calculate daily spending average for baseline
 */
function calculateDailyBaseline(transactions: Transaction[]): {
    avgDailyExpense: number;
    avgDailyIncome: number;
    volatility: number;
} {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTx = transactions.filter(tx => new Date(tx.date) >= thirtyDaysAgo);

    const dailyTotals: Map<string, { income: number; expense: number }> = new Map();

    for (const tx of recentTx) {
        const dateKey = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyTotals.has(dateKey)) {
            dailyTotals.set(dateKey, { income: 0, expense: 0 });
        }

        const day = dailyTotals.get(dateKey)!;
        if (tx.amount > 0) {
            day.income += tx.amount;
        } else {
            day.expense += Math.abs(tx.amount);
        }
    }

    const days = Array.from(dailyTotals.values());
    const avgDailyExpense = days.reduce((s, d) => s + d.expense, 0) / Math.max(days.length, 1);
    const avgDailyIncome = days.reduce((s, d) => s + d.income, 0) / Math.max(days.length, 1);

    // Calculate volatility (standard deviation of daily expenses)
    const variance = days.reduce((s, d) => s + Math.pow(d.expense - avgDailyExpense, 2), 0) / Math.max(days.length, 1);
    const volatility = Math.sqrt(variance);

    return { avgDailyExpense, avgDailyIncome, volatility };
}

/**
 * Generate cash flow forecast
 */
export async function generateCashFlowForecast(
    transactions: Transaction[],
    currentBalance: number,
    period: ForecastPeriod = '30d'
): Promise<CashFlowForecast> {
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + periodDays);

    // Detect recurring patterns
    const patterns = detectRecurringPatterns(transactions);

    // Generate future occurrences
    const futureEvents = generateFutureOccurrences(patterns, startDate, endDate);

    // Calculate baseline
    const baseline = calculateDailyBaseline(transactions);

    // Generate daily forecasts
    const dailyForecasts: ForecastDay[] = [];
    let runningBalance = currentBalance;

    for (let i = 0; i < periodDays; i++) {
        const forecastDate = new Date(startDate);
        forecastDate.setDate(forecastDate.getDate() + i);
        const dateKey = forecastDate.toISOString().split('T')[0];

        // Get scheduled events for this day
        const events = futureEvents.get(dateKey) || [];
        const scheduledIncome = events
            .filter(e => e.type === 'income')
            .reduce((s, e) => s + e.amount, 0);
        const scheduledExpenses = events
            .filter(e => e.type === 'expense')
            .reduce((s, e) => s + e.amount, 0);

        // Add baseline non-recurring spending estimate
        const baselineExpense = baseline.avgDailyExpense * 0.3; // 30% of average for misc

        const predictedIncome = scheduledIncome;
        const predictedExpenses = scheduledExpenses + baselineExpense;

        // Calculate confidence (decreases over time)
        const dayConfidence = Math.max(0.5, 1 - (i / periodDays) * 0.4);

        // Calculate uncertainty range
        const uncertainty = baseline.volatility * Math.sqrt(i + 1);

        runningBalance = runningBalance + predictedIncome - predictedExpenses;

        dailyForecasts.push({
            date: forecastDate,
            predictedBalance: Math.round(runningBalance * 100) / 100,
            predictedIncome: Math.round(predictedIncome * 100) / 100,
            predictedExpenses: Math.round(predictedExpenses * 100) / 100,
            confidence: Math.round(dayConfidence * 100) / 100,
            events: events.map(e => ({ ...e, type: e.type as 'income' | 'expense' | 'transfer' })),
            lowEstimate: Math.round((runningBalance - uncertainty) * 100) / 100,
            highEstimate: Math.round((runningBalance + uncertainty) * 100) / 100,
        });
    }

    // Calculate overall confidence
    const avgConfidence = dailyForecasts.reduce((s, d) => s + d.confidence, 0) / dailyForecasts.length;

    // Get final forecasts
    const lastDay = dailyForecasts[dailyForecasts.length - 1];

    // Generate AI insights
    const insights = await generateForecastInsights(
        currentBalance,
        lastDay.predictedBalance,
        patterns,
        periodDays
    );

    return {
        startDate,
        endDate,
        startingBalance: currentBalance,
        endingBalance: {
            predicted: lastDay.predictedBalance,
            low: lastDay.lowEstimate,
            high: lastDay.highEstimate,
        },
        dailyForecasts,
        patterns,
        insights,
        confidence: Math.round(avgConfidence * 100) / 100,
        generatedAt: new Date(),
    };
}

/**
 * Generate AI-powered forecast insights
 */
async function generateForecastInsights(
    startBalance: number,
    endBalance: number,
    patterns: RecurringPattern[],
    days: number
): Promise<string[]> {
    const change = endBalance - startBalance;
    const changePercent = ((change / startBalance) * 100).toFixed(1);
    const direction = change >= 0 ? 'increase' : 'decrease';

    const topExpenses = patterns
        .filter(p => p.type === 'expense')
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 3)
        .map(p => `${p.name}: $${Math.abs(p.amount)}/${p.frequency}`);

    const prompt = `Generate 3 brief, actionable financial insights (1 sentence each) based on this ${days}-day cash flow forecast:
- Starting balance: $${startBalance.toFixed(0)}
- Predicted ending: $${endBalance.toFixed(0)} (${changePercent}% ${direction})
- Top recurring expenses: ${topExpenses.join(', ') || 'None detected'}

Focus on: upcoming cash pressure, savings opportunities, and timing of expenses.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200 },
        });

        const text = result.response.text() || '';
        return text.split(/\d+\.\s*/).filter(s => s.trim()).map(s => s.trim());
    } catch {
        // Fallback insights
        const insights: string[] = [];

        if (change < 0) {
            insights.push(`Your balance is projected to ${direction} by $${Math.abs(change).toFixed(0)} over the next ${days} days.`);
            if (Math.abs(change) > startBalance * 0.1) {
                insights.push('Consider reviewing upcoming expenses to maintain your target balance.');
            }
        } else {
            insights.push(`You're on track to grow your balance by $${change.toFixed(0)} over ${days} days.`);
        }

        if (patterns.length > 0) {
            const biggestExpense = patterns.find(p => p.type === 'expense');
            if (biggestExpense) {
                insights.push(`Your largest recurring expense is ${biggestExpense.name} at $${Math.abs(biggestExpense.amount).toFixed(0)}/${biggestExpense.frequency}.`);
            }
        }

        return insights;
    }
}

/**
 * Get forecast summary for dashboard widget
 */
export async function getForecastSummary(
    transactions: Transaction[],
    currentBalance: number
): Promise<{
    trend: 'up' | 'down' | 'stable';
    change: number;
    changePercent: number;
    nextBigExpense?: { name: string; amount: number; date: Date };
    alerts: string[];
}> {
    const forecast = await generateCashFlowForecast(transactions, currentBalance, '7d');
    const change = forecast.endingBalance.predicted - currentBalance;
    const changePercent = (change / currentBalance) * 100;

    let trend: 'up' | 'down' | 'stable';
    if (changePercent > 2) trend = 'up';
    else if (changePercent < -2) trend = 'down';
    else trend = 'stable';

    // Find next significant expense
    let nextBigExpense: { name: string; amount: number; date: Date } | undefined;
    for (const day of forecast.dailyForecasts) {
        const bigExpense = day.events
            .filter(e => e.type === 'expense' && e.amount > 50)
            .sort((a, b) => b.amount - a.amount)[0];

        if (bigExpense) {
            nextBigExpense = {
                name: bigExpense.name,
                amount: bigExpense.amount,
                date: day.date,
            };
            break;
        }
    }

    // Generate alerts
    const alerts: string[] = [];
    if (forecast.endingBalance.low < 0) {
        alerts.push('Risk of negative balance within 7 days');
    }
    if (forecast.endingBalance.low < currentBalance * 0.2) {
        alerts.push('Balance may drop below 20% of current level');
    }

    return {
        trend,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 10) / 10,
        nextBigExpense,
        alerts,
    };
}

export default {
    generateCashFlowForecast,
    getForecastSummary,
    detectRecurringPatterns,
};
