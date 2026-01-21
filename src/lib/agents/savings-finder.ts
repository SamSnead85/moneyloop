/**
 * Savings Finder Agent
 * 
 * Proactively identifies savings opportunities through:
 * - Spending pattern analysis
 * - Round-up savings calculations
 * - Category optimization suggestions
 * - Behavioral nudges
 * 
 * Phase 11-15 of Sprint 1.1
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Category benchmarks (median spending as % of income)
const CATEGORY_BENCHMARKS: Record<string, { optimal: number; max: number; name: string }> = {
    housing: { optimal: 25, max: 30, name: 'Housing' },
    transportation: { optimal: 10, max: 15, name: 'Transportation' },
    food_dining: { optimal: 10, max: 15, name: 'Food & Dining' },
    groceries: { optimal: 8, max: 12, name: 'Groceries' },
    utilities: { optimal: 5, max: 8, name: 'Utilities' },
    entertainment: { optimal: 5, max: 10, name: 'Entertainment' },
    shopping: { optimal: 5, max: 10, name: 'Shopping' },
    personal_care: { optimal: 3, max: 5, name: 'Personal Care' },
    subscriptions: { optimal: 2, max: 5, name: 'Subscriptions' },
    health: { optimal: 5, max: 10, name: 'Healthcare' },
    insurance: { optimal: 10, max: 15, name: 'Insurance' },
    travel: { optimal: 3, max: 8, name: 'Travel' },
    education: { optimal: 3, max: 7, name: 'Education' },
    gifts_donations: { optimal: 3, max: 7, name: 'Gifts & Donations' },
};

// Spending patterns that indicate savings opportunities
const SPENDING_PATTERNS = {
    coffeeShop: {
        keywords: ['starbucks', 'dunkin', 'coffee', 'cafe', 'peets', 'philz'],
        annualizedMultiplier: 260, // Assume 5x/week
        savingsMessage: 'Coffee from home could save you',
    },
    fastFood: {
        keywords: ['mcdonald', 'wendy', 'burger king', 'taco bell', 'chipotle', 'subway', 'chick-fil-a'],
        annualizedMultiplier: 156, // ~3x/week
        savingsMessage: 'Meal prep instead of fast food could save you',
    },
    convenience: {
        keywords: ['7-eleven', 'cvs', 'walgreens', 'convenience', 'gas station'],
        annualizedMultiplier: 104, // ~2x/week
        savingsMessage: 'Buying at grocery stores instead could save you',
    },
    rideshare: {
        keywords: ['uber', 'lyft', 'taxi', 'cab'],
        annualizedMultiplier: 52, // ~1x/week
        savingsMessage: 'Using public transit or carpooling could save you',
    },
    impulse: {
        keywords: ['amazon', 'target', 'walmart', 'best buy'],
        annualizedMultiplier: 24, // ~2x/month
        savingsMessage: 'Implementing a 24-hour waiting period for purchases could save you',
    },
};

export interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: Date;
    merchant?: string;
}

export interface SpendingCategory {
    category: string;
    amount: number;
    transactionCount: number;
    percentOfIncome: number;
}

export interface SavingsOpportunity {
    id: string;
    type: 'pattern' | 'benchmark' | 'roundup' | 'behavioral' | 'goal';
    title: string;
    description: string;
    potentialSavings: {
        monthly: number;
        annual: number;
    };
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    actionItems: string[];
    category?: string;
}

export interface SavingsFinderResult {
    opportunities: SavingsOpportunity[];
    roundUpSavings: {
        ifEnabled: number;
        transactions: number;
    };
    totalPotentialSavings: {
        monthly: number;
        annual: number;
    };
    categoryAnalysis: {
        category: string;
        status: 'optimal' | 'elevated' | 'high';
        currentPercent: number;
        benchmarkPercent: number;
        overspend: number;
    }[];
    insights: string[];
    timestamp: Date;
}

/**
 * Normalize category names
 */
function normalizeCategory(category: string): string {
    return category.toLowerCase()
        .replace(/[^a-z_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/**
 * Calculate round-up savings potential
 */
function calculateRoundUpPotential(transactions: Transaction[]): {
    ifEnabled: number;
    transactions: number;
} {
    let totalRoundUp = 0;
    let eligibleTransactions = 0;

    for (const tx of transactions) {
        if (tx.amount < 0) continue; // Only outgoing transactions

        const remainder = tx.amount % 1;
        if (remainder > 0) {
            totalRoundUp += 1 - remainder;
            eligibleTransactions++;
        }
    }

    // Extrapolate to monthly
    const daysInData = transactions.length > 0
        ? Math.max(1, Math.ceil((Date.now() - new Date(transactions[0].date).getTime()) / (1000 * 60 * 60 * 24)))
        : 30;

    const monthlyRoundUp = (totalRoundUp / daysInData) * 30;

    return {
        ifEnabled: Math.round(monthlyRoundUp * 100) / 100,
        transactions: eligibleTransactions,
    };
}

/**
 * Analyze spending patterns for opportunities
 */
function analyzeSpendingPatterns(transactions: Transaction[]): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];
    const patternSpending: Record<string, { total: number; count: number; avgAmount: number }> = {};

    // Analyze each transaction
    for (const tx of transactions) {
        const txName = tx.name.toLowerCase();

        for (const [patternKey, pattern] of Object.entries(SPENDING_PATTERNS)) {
            if (pattern.keywords.some(kw => txName.includes(kw))) {
                if (!patternSpending[patternKey]) {
                    patternSpending[patternKey] = { total: 0, count: 0, avgAmount: 0 };
                }
                patternSpending[patternKey].total += Math.abs(tx.amount);
                patternSpending[patternKey].count++;
            }
        }
    }

    // Generate opportunities from patterns
    for (const [patternKey, spending] of Object.entries(patternSpending)) {
        if (spending.count < 3) continue; // Need pattern of at least 3 transactions

        spending.avgAmount = spending.total / spending.count;
        const pattern = SPENDING_PATTERNS[patternKey as keyof typeof SPENDING_PATTERNS];

        // Estimate annual spending based on frequency
        const daysInData = 30; // Assume 30 days of data
        const dailyFrequency = spending.count / daysInData;
        const annualSpending = spending.avgAmount * dailyFrequency * 365;

        // Potential savings if reduced by 50%
        const potentialSavings = annualSpending * 0.5;

        if (potentialSavings > 100) { // Only show if >$100/year potential
            opportunities.push({
                id: `pattern-${patternKey}`,
                type: 'pattern',
                title: `${patternKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Spending`,
                description: `${pattern.savingsMessage} ~$${Math.round(potentialSavings)}/year`,
                potentialSavings: {
                    monthly: Math.round(potentialSavings / 12),
                    annual: Math.round(potentialSavings),
                },
                impact: potentialSavings > 500 ? 'high' : potentialSavings > 200 ? 'medium' : 'low',
                difficulty: 'medium',
                actionItems: [
                    `Track your ${patternKey.replace(/_/g, ' ')} expenses for a week`,
                    'Set a monthly budget for this category',
                    'Find cheaper alternatives or reduce frequency',
                ],
            });
        }
    }

    return opportunities;
}

/**
 * Analyze category spending vs benchmarks
 */
function analyzeCategoryBenchmarks(
    categorySpending: SpendingCategory[],
    monthlyIncome: number
): {
    opportunities: SavingsOpportunity[];
    analysis: SavingsFinderResult['categoryAnalysis'];
} {
    const opportunities: SavingsOpportunity[] = [];
    const analysis: SavingsFinderResult['categoryAnalysis'] = [];

    for (const cat of categorySpending) {
        const normalizedCat = normalizeCategory(cat.category);
        const benchmark = CATEGORY_BENCHMARKS[normalizedCat];

        if (!benchmark) continue;

        const currentPercent = (cat.amount / monthlyIncome) * 100;
        let status: 'optimal' | 'elevated' | 'high';

        if (currentPercent <= benchmark.optimal) {
            status = 'optimal';
        } else if (currentPercent <= benchmark.max) {
            status = 'elevated';
        } else {
            status = 'high';
        }

        const overspend = status === 'high'
            ? cat.amount - (monthlyIncome * benchmark.max / 100)
            : status === 'elevated'
                ? cat.amount - (monthlyIncome * benchmark.optimal / 100)
                : 0;

        analysis.push({
            category: benchmark.name,
            status,
            currentPercent: Math.round(currentPercent * 10) / 10,
            benchmarkPercent: benchmark.optimal,
            overspend: Math.round(overspend),
        });

        if (status === 'high' && overspend > 50) {
            opportunities.push({
                id: `benchmark-${normalizedCat}`,
                type: 'benchmark',
                title: `${benchmark.name} Above Benchmark`,
                description: `You're spending ${Math.round(currentPercent)}% of income on ${benchmark.name.toLowerCase()}, above the recommended ${benchmark.max}%`,
                potentialSavings: {
                    monthly: Math.round(overspend),
                    annual: Math.round(overspend * 12),
                },
                impact: overspend > 200 ? 'high' : 'medium',
                difficulty: normalizedCat === 'housing' ? 'hard' : 'medium',
                actionItems: [
                    `Target reducing ${benchmark.name.toLowerCase()} by $${Math.round(overspend / 2)}/month`,
                    'Review recurring expenses in this category',
                    'Look for alternatives or negotiate better rates',
                ],
                category: benchmark.name,
            });
        }
    }

    return { opportunities, analysis };
}

/**
 * Generate behavioral nudges based on spending
 */
function generateBehavioralNudges(
    transactions: Transaction[],
    monthlyIncome: number
): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];

    // Weekend spending spike
    const weekendTransactions = transactions.filter(tx => {
        const day = new Date(tx.date).getDay();
        return day === 0 || day === 6;
    });

    const weekdayTransactions = transactions.filter(tx => {
        const day = new Date(tx.date).getDay();
        return day > 0 && day < 6;
    });

    if (weekendTransactions.length > 0 && weekdayTransactions.length > 0) {
        const weekendAvg = weekendTransactions.reduce((s, t) => s + Math.abs(t.amount), 0) / (weekendTransactions.length || 1);
        const weekdayAvg = weekdayTransactions.reduce((s, t) => s + Math.abs(t.amount), 0) / (weekdayTransactions.length || 1);

        if (weekendAvg > weekdayAvg * 1.5) {
            const potentialSavings = (weekendAvg - weekdayAvg) * 8; // 8 weekend days/month
            opportunities.push({
                id: 'behavioral-weekend',
                type: 'behavioral',
                title: 'Weekend Spending Spike',
                description: 'Your weekend spending is 50%+ higher than weekdays',
                potentialSavings: {
                    monthly: Math.round(potentialSavings),
                    annual: Math.round(potentialSavings * 12),
                },
                impact: 'medium',
                difficulty: 'medium',
                actionItems: [
                    'Plan free weekend activities in advance',
                    'Set a specific weekend spending budget',
                    'Leave credit cards at home on weekends',
                ],
            });
        }
    }

    // Late-night spending
    const lateNightTx = transactions.filter(tx => {
        const hour = new Date(tx.date).getHours();
        return hour >= 22 || hour < 6;
    });

    if (lateNightTx.length > 5) {
        const lateNightTotal = lateNightTx.reduce((s, t) => s + Math.abs(t.amount), 0);
        opportunities.push({
            id: 'behavioral-latenight',
            type: 'behavioral',
            title: 'Late-Night Purchases',
            description: `You made ${lateNightTx.length} purchases between 10 PM and 6 AM`,
            potentialSavings: {
                monthly: Math.round(lateNightTotal * 0.7),
                annual: Math.round(lateNightTotal * 0.7 * 12),
            },
            impact: 'low',
            difficulty: 'easy',
            actionItems: [
                'Enable purchase notifications',
                'Remove saved payment methods from late-night apps',
                'Implement a "sleep on it" rule for night purchases',
            ],
        });
    }

    // Small recurring charges adding up
    const smallCharges = transactions.filter(tx => Math.abs(tx.amount) < 10 && Math.abs(tx.amount) > 0);
    const smallChargesTotal = smallCharges.reduce((s, t) => s + Math.abs(t.amount), 0);

    if (smallChargesTotal > 100) {
        opportunities.push({
            id: 'behavioral-small-charges',
            type: 'behavioral',
            title: 'Small Charges Add Up',
            description: `${smallCharges.length} small purchases under $10 totaled $${Math.round(smallChargesTotal)}`,
            potentialSavings: {
                monthly: Math.round(smallChargesTotal * 0.3),
                annual: Math.round(smallChargesTotal * 0.3 * 12),
            },
            impact: 'low',
            difficulty: 'easy',
            actionItems: [
                'Review small recurring charges for forgotten subscriptions',
                'Batch small purchases to reduce impulse buying',
                'Set a minimum purchase threshold before buying',
            ],
        });
    }

    return opportunities;
}

/**
 * Generate AI-powered insights
 */
async function generateAIInsights(
    totalSpend: number,
    potentialSavings: number,
    topOpportunities: SavingsOpportunity[]
): Promise<string[]> {
    const topOps = topOpportunities.slice(0, 3).map(o => o.title).join(', ');

    const prompt = `Generate 3 brief, encouraging insights for someone who spends $${totalSpend.toFixed(0)}/month with potential savings of $${potentialSavings.toFixed(0)}/month. Top opportunities: ${topOps}. Each insight should be 1 sentence, actionable, and positive. Format as a numbered list.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200 },
        });

        const text = result.response.text() || '';
        return text.split(/\d+\.\s+/).filter(s => s.trim()).map(s => s.trim());
    } catch {
        return [
            `You could save up to $${Math.round(potentialSavings)}/month with a few simple changes.`,
            'Small daily changes lead to big annual savings.',
            'Start with one change this week and build from there.',
        ];
    }
}

/**
 * Main savings analysis function
 */
export async function findSavingsOpportunities(
    transactions: Transaction[],
    categorySpending: SpendingCategory[],
    monthlyIncome: number
): Promise<SavingsFinderResult> {
    // Run all analyses
    const patternOpportunities = analyzeSpendingPatterns(transactions);
    const { opportunities: benchmarkOpportunities, analysis: categoryAnalysis } =
        analyzeCategoryBenchmarks(categorySpending, monthlyIncome);
    const behavioralOpportunities = generateBehavioralNudges(transactions, monthlyIncome);
    const roundUpSavings = calculateRoundUpPotential(transactions);

    // Combine and sort opportunities
    const allOpportunities = [
        ...patternOpportunities,
        ...benchmarkOpportunities,
        ...behavioralOpportunities,
    ].sort((a, b) => b.potentialSavings.annual - a.potentialSavings.annual);

    // Add round-up as opportunity if significant
    if (roundUpSavings.ifEnabled > 20) {
        allOpportunities.push({
            id: 'roundup-savings',
            type: 'roundup',
            title: 'Enable Round-Up Savings',
            description: `Automatically save spare change from ${roundUpSavings.transactions} transactions`,
            potentialSavings: {
                monthly: roundUpSavings.ifEnabled,
                annual: Math.round(roundUpSavings.ifEnabled * 12),
            },
            impact: 'medium',
            difficulty: 'easy',
            actionItems: [
                'Enable round-up savings in MoneyLoop settings',
                'Link a savings account for automatic transfers',
                'Watch your savings grow automatically',
            ],
        });
    }

    // Calculate totals
    const totalMonthlySavings = allOpportunities.reduce((s, o) => s + o.potentialSavings.monthly, 0);
    const totalAnnualSavings = allOpportunities.reduce((s, o) => s + o.potentialSavings.annual, 0);

    // Generate AI insights
    const insights = await generateAIInsights(
        categorySpending.reduce((s, c) => s + c.amount, 0),
        totalMonthlySavings,
        allOpportunities
    );

    return {
        opportunities: allOpportunities,
        roundUpSavings,
        totalPotentialSavings: {
            monthly: totalMonthlySavings,
            annual: totalAnnualSavings,
        },
        categoryAnalysis,
        insights,
        timestamp: new Date(),
    };
}

/**
 * Quick savings summary
 */
export async function getQuickSavingsSummary(
    transactions: Transaction[],
    categorySpending: SpendingCategory[],
    monthlyIncome: number
): Promise<{
    potentialMonthlySavings: number;
    topOpportunity: string | null;
    opportunityCount: number;
}> {
    const result = await findSavingsOpportunities(transactions, categorySpending, monthlyIncome);

    return {
        potentialMonthlySavings: result.totalPotentialSavings.monthly,
        topOpportunity: result.opportunities.length > 0 ? result.opportunities[0].title : null,
        opportunityCount: result.opportunities.length,
    };
}

export default {
    findSavingsOpportunities,
    getQuickSavingsSummary,
};
