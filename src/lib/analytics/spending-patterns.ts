/**
 * Spending Pattern Analysis Engine
 * 
 * Analyzes transaction history for trends, anomalies, and behavioral patterns.
 * Powers insights, alerts, and recommendations.
 * 
 * Phase 61-65 of Sprint 1.3
 */

export interface Transaction {
    id: string;
    amount: number;
    date: Date;
    category: string;
    merchant?: string;
    isRecurring?: boolean;
}

export interface SpendingTrend {
    category: string;
    currentPeriod: number;
    previousPeriod: number;
    change: number;
    changePercent: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    significance: 'high' | 'medium' | 'low';
}

export interface SpendingAnomaly {
    id: string;
    date: Date;
    category: string;
    merchant?: string;
    amount: number;
    expectedAmount: number;
    deviation: number;
    type: 'spike' | 'unusual_merchant' | 'unusual_time' | 'unusual_category';
    description: string;
}

export interface CategoryPattern {
    category: string;
    avgMonthlySpend: number;
    medianTransaction: number;
    frequency: number; // transactions per month
    volatility: number; // 0-1 score
    dayOfWeekDistribution: number[]; // 0=Sun to 6=Sat
    topMerchants: { name: string; amount: number; count: number }[];
}

export interface SpendingPatternAnalysis {
    trends: SpendingTrend[];
    anomalies: SpendingAnomaly[];
    categoryPatterns: CategoryPattern[];
    weekdayVsWeekend: { weekday: number; weekend: number; ratio: number };
    timeOfDayDistribution: { morning: number; afternoon: number; evening: number; night: number };
    savingsRate: number;
    impulseSpendingScore: number; // 0-100
    analyzedPeriod: { start: Date; end: Date };
    generatedAt: Date;
}

/**
 * Calculate spending trends by category
 */
function calculateTrends(
    transactions: Transaction[],
    periodDays: number = 30
): SpendingTrend[] {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - periodDays);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - periodDays);

    // Group by period and category
    const currentPeriod: Map<string, number> = new Map();
    const previousPeriod: Map<string, number> = new Map();

    for (const tx of transactions) {
        const txDate = new Date(tx.date);
        const category = tx.category || 'uncategorized';
        const amount = Math.abs(tx.amount);

        if (txDate >= currentStart) {
            currentPeriod.set(category, (currentPeriod.get(category) || 0) + amount);
        } else if (txDate >= previousStart) {
            previousPeriod.set(category, (previousPeriod.get(category) || 0) + amount);
        }
    }

    // Calculate trends
    const trends: SpendingTrend[] = [];
    const allCategories = new Set([...currentPeriod.keys(), ...previousPeriod.keys()]);

    for (const category of allCategories) {
        const current = currentPeriod.get(category) || 0;
        const previous = previousPeriod.get(category) || 0;
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;

        let trend: SpendingTrend['trend'];
        if (changePercent > 10) trend = 'increasing';
        else if (changePercent < -10) trend = 'decreasing';
        else trend = 'stable';

        let significance: SpendingTrend['significance'];
        if (Math.abs(changePercent) > 50 || Math.abs(change) > 500) significance = 'high';
        else if (Math.abs(changePercent) > 20 || Math.abs(change) > 100) significance = 'medium';
        else significance = 'low';

        trends.push({
            category,
            currentPeriod: Math.round(current * 100) / 100,
            previousPeriod: Math.round(previous * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 10) / 10,
            trend,
            significance,
        });
    }

    return trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Detect spending anomalies
 */
function detectAnomalies(transactions: Transaction[]): SpendingAnomaly[] {
    const anomalies: SpendingAnomaly[] = [];

    // Calculate category averages
    const categoryStats: Map<string, { amounts: number[]; merchants: Set<string> }> = new Map();

    for (const tx of transactions) {
        const category = tx.category || 'uncategorized';
        if (!categoryStats.has(category)) {
            categoryStats.set(category, { amounts: [], merchants: new Set() });
        }
        const stats = categoryStats.get(category)!;
        stats.amounts.push(Math.abs(tx.amount));
        if (tx.merchant) stats.merchants.add(tx.merchant);
    }

    // Calculate thresholds and detect anomalies
    for (const tx of transactions) {
        const category = tx.category || 'uncategorized';
        const stats = categoryStats.get(category);
        if (!stats || stats.amounts.length < 3) continue;

        const amounts = stats.amounts;
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(
            amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
        );

        const txAmount = Math.abs(tx.amount);
        const zScore = stdDev > 0 ? (txAmount - mean) / stdDev : 0;

        // Spike detection (>2.5 standard deviations)
        if (zScore > 2.5 && txAmount > mean + 50) {
            anomalies.push({
                id: `anomaly_${tx.id}`,
                date: new Date(tx.date),
                category,
                merchant: tx.merchant,
                amount: txAmount,
                expectedAmount: Math.round(mean * 100) / 100,
                deviation: Math.round((txAmount - mean) * 100) / 100,
                type: 'spike',
                description: `Unusually high ${category} expense: $${txAmount.toFixed(0)} vs typical $${mean.toFixed(0)}`,
            });
        }

        // Unusual merchant detection
        if (tx.merchant && stats.merchants.size > 5 && !stats.merchants.has(tx.merchant)) {
            anomalies.push({
                id: `anomaly_merchant_${tx.id}`,
                date: new Date(tx.date),
                category,
                merchant: tx.merchant,
                amount: txAmount,
                expectedAmount: mean,
                deviation: 0,
                type: 'unusual_merchant',
                description: `New merchant "${tx.merchant}" in ${category}`,
            });
        }
    }

    // Sort by date, most recent first
    return anomalies.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
}

/**
 * Analyze category spending patterns
 */
function analyzeCategoryPatterns(transactions: Transaction[]): CategoryPattern[] {
    const categoryData: Map<string, {
        amounts: number[];
        merchants: Map<string, { amount: number; count: number }>;
        dayOfWeek: number[];
    }> = new Map();

    for (const tx of transactions) {
        const category = tx.category || 'uncategorized';
        if (!categoryData.has(category)) {
            categoryData.set(category, {
                amounts: [],
                merchants: new Map(),
                dayOfWeek: [0, 0, 0, 0, 0, 0, 0],
            });
        }

        const data = categoryData.get(category)!;
        const amount = Math.abs(tx.amount);
        data.amounts.push(amount);

        if (tx.merchant) {
            const m = data.merchants.get(tx.merchant) || { amount: 0, count: 0 };
            m.amount += amount;
            m.count++;
            data.merchants.set(tx.merchant, m);
        }

        const dayOfWeek = new Date(tx.date).getDay();
        data.dayOfWeek[dayOfWeek] += amount;
    }

    const patterns: CategoryPattern[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthFactor = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo).length > 0 ? 1 : 0.5;

    for (const [category, data] of categoryData) {
        const amounts = data.amounts.sort((a, b) => a - b);
        const sum = amounts.reduce((a, b) => a + b, 0);
        const avg = sum / amounts.length;
        const median = amounts[Math.floor(amounts.length / 2)];

        // Calculate volatility
        const variance = amounts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        const volatility = Math.min(1, stdDev / (avg || 1));

        // Top merchants
        const topMerchants = Array.from(data.merchants.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        patterns.push({
            category,
            avgMonthlySpend: Math.round(sum * monthFactor * 100) / 100,
            medianTransaction: Math.round(median * 100) / 100,
            frequency: Math.round(amounts.length * monthFactor),
            volatility: Math.round(volatility * 100) / 100,
            dayOfWeekDistribution: data.dayOfWeek,
            topMerchants,
        });
    }

    return patterns.sort((a, b) => b.avgMonthlySpend - a.avgMonthlySpend);
}

/**
 * Calculate time-based distribution
 */
function calculateTimeDistribution(transactions: Transaction[]): {
    weekdayVsWeekend: { weekday: number; weekend: number; ratio: number };
    timeOfDay: { morning: number; afternoon: number; evening: number; night: number };
} {
    let weekday = 0, weekend = 0;
    let morning = 0, afternoon = 0, evening = 0, night = 0;

    for (const tx of transactions) {
        const amount = Math.abs(tx.amount);
        const date = new Date(tx.date);
        const day = date.getDay();
        const hour = date.getHours();

        if (day === 0 || day === 6) weekend += amount;
        else weekday += amount;

        if (hour >= 6 && hour < 12) morning += amount;
        else if (hour >= 12 && hour < 17) afternoon += amount;
        else if (hour >= 17 && hour < 22) evening += amount;
        else night += amount;
    }

    return {
        weekdayVsWeekend: {
            weekday: Math.round(weekday * 100) / 100,
            weekend: Math.round(weekend * 100) / 100,
            ratio: weekday > 0 ? Math.round((weekend / weekday) * 100) / 100 : 0,
        },
        timeOfDay: {
            morning: Math.round(morning * 100) / 100,
            afternoon: Math.round(afternoon * 100) / 100,
            evening: Math.round(evening * 100) / 100,
            night: Math.round(night * 100) / 100,
        },
    };
}

/**
 * Calculate impulse spending score
 */
function calculateImpulseScore(transactions: Transaction[]): number {
    let impulseSignals = 0;
    let maxSignals = 0;

    for (const tx of transactions) {
        maxSignals += 4;
        const date = new Date(tx.date);
        const hour = date.getHours();
        const day = date.getDay();

        // Late night purchases
        if (hour >= 22 || hour < 6) impulseSignals++;

        // Weekend shopping spree
        if ((day === 0 || day === 6) && Math.abs(tx.amount) > 50) impulseSignals++;

        // High-frequency same-day spending
        const sameDay = transactions.filter(t =>
            new Date(t.date).toDateString() === date.toDateString() && t.id !== tx.id
        );
        if (sameDay.length > 3) impulseSignals++;

        // Small frequent purchases (snacks, coffee, etc.)
        if (Math.abs(tx.amount) < 10) impulseSignals++;
    }

    return maxSignals > 0 ? Math.round((impulseSignals / maxSignals) * 100) : 0;
}

/**
 * Main analysis function
 */
export function analyzeSpendingPatterns(
    transactions: Transaction[],
    income: number = 0
): SpendingPatternAnalysis {
    const trends = calculateTrends(transactions);
    const anomalies = detectAnomalies(transactions);
    const categoryPatterns = analyzeCategoryPatterns(transactions);
    const timeDistribution = calculateTimeDistribution(transactions);
    const impulseScore = calculateImpulseScore(transactions);

    // Calculate savings rate
    const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
    const savingsRate = income > 0 ? Math.round(((income - totalExpenses) / income) * 100) : 0;

    // Determine analysis period
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0] || new Date();
    const end = dates[dates.length - 1] || new Date();

    return {
        trends,
        anomalies,
        categoryPatterns,
        weekdayVsWeekend: timeDistribution.weekdayVsWeekend,
        timeOfDayDistribution: timeDistribution.timeOfDay,
        savingsRate,
        impulseSpendingScore: impulseScore,
        analyzedPeriod: { start, end },
        generatedAt: new Date(),
    };
}

/**
 * Get quick pattern summary for dashboard
 */
export function getPatternSummary(transactions: Transaction[]): {
    topCategory: string;
    biggestIncrease: { category: string; percent: number } | null;
    anomalyCount: number;
    impulseScore: number;
} {
    const analysis = analyzeSpendingPatterns(transactions);

    const topCategory = analysis.categoryPatterns[0]?.category || 'None';
    const increasingTrends = analysis.trends.filter(t => t.trend === 'increasing' && t.significance !== 'low');
    const biggestIncrease = increasingTrends.length > 0
        ? { category: increasingTrends[0].category, percent: increasingTrends[0].changePercent }
        : null;

    return {
        topCategory,
        biggestIncrease,
        anomalyCount: analysis.anomalies.length,
        impulseScore: analysis.impulseSpendingScore,
    };
}

export default {
    analyzeSpendingPatterns,
    getPatternSummary,
};
