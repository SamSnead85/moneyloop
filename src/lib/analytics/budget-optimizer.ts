/**
 * Budget Optimization Engine
 * 
 * AI-powered budget recommendations based on spending analysis.
 * Suggests optimal budget allocations and identifies savings opportunities.
 * 
 * Phase 71-75 of Sprint 1.3
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Standard budget allocation guidelines (50/30/20 rule variations)
const BUDGET_TEMPLATES = {
    conservative: {
        needs: 50, wants: 20, savings: 30,
        categories: {
            housing: 25, utilities: 5, groceries: 10, transportation: 10,
            entertainment: 5, dining: 5, shopping: 5, personal: 5,
            savings: 20, investments: 10,
        },
    },
    balanced: {
        needs: 50, wants: 30, savings: 20,
        categories: {
            housing: 28, utilities: 5, groceries: 10, transportation: 7,
            entertainment: 8, dining: 7, shopping: 8, personal: 7,
            savings: 15, investments: 5,
        },
    },
    aggressive: {
        needs: 45, wants: 15, savings: 40,
        categories: {
            housing: 25, utilities: 5, groceries: 8, transportation: 7,
            entertainment: 3, dining: 4, shopping: 4, personal: 4,
            savings: 25, investments: 15,
        },
    },
};

export interface CategorySpending {
    category: string;
    amount: number;
    percentOfIncome: number;
}

export interface BudgetRecommendation {
    category: string;
    currentAmount: number;
    recommendedAmount: number;
    difference: number;
    action: 'reduce' | 'maintain' | 'increase';
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
}

export interface BudgetOptimization {
    monthlyIncome: number;
    currentSavingsRate: number;
    targetSavingsRate: number;
    potentialMonthlySavings: number;
    recommendations: BudgetRecommendation[];
    suggestedTemplate: 'conservative' | 'balanced' | 'aggressive';
    insights: string[];
    score: number; // 0-100 budget health score
    generatedAt: Date;
}

/**
 * Calculate category-level optimization recommendations
 */
function calculateRecommendations(
    spending: CategorySpending[],
    monthlyIncome: number,
    template: keyof typeof BUDGET_TEMPLATES
): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];
    const templateCats = BUDGET_TEMPLATES[template].categories;

    for (const cat of spending) {
        const normalizedCat = cat.category.toLowerCase().replace(/[^a-z]/g, '');

        // Find matching template category
        let targetPercent = 5; // Default
        for (const [key, percent] of Object.entries(templateCats)) {
            if (normalizedCat.includes(key) || key.includes(normalizedCat)) {
                targetPercent = percent;
                break;
            }
        }

        const recommendedAmount = (monthlyIncome * targetPercent) / 100;
        const difference = cat.amount - recommendedAmount;
        const differencePercent = recommendedAmount > 0 ? (difference / recommendedAmount) * 100 : 0;

        let action: BudgetRecommendation['action'];
        let priority: BudgetRecommendation['priority'];
        let reasoning: string;

        if (difference > 0 && differencePercent > 20) {
            action = 'reduce';
            priority = differencePercent > 50 ? 'high' : 'medium';
            reasoning = `Spending ${Math.round(differencePercent)}% above recommended allocation`;
        } else if (difference < 0 && Math.abs(differencePercent) > 30) {
            action = 'increase';
            priority = 'low';
            reasoning = 'Below typical allocation, consider if needs are being met';
        } else {
            action = 'maintain';
            priority = 'low';
            reasoning = 'Within recommended range';
        }

        recommendations.push({
            category: cat.category,
            currentAmount: Math.round(cat.amount * 100) / 100,
            recommendedAmount: Math.round(recommendedAmount * 100) / 100,
            difference: Math.round(difference * 100) / 100,
            action,
            priority,
            reasoning,
        });
    }

    // Sort by priority and difference
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return Math.abs(b.difference) - Math.abs(a.difference);
    });
}

/**
 * Determine best template based on goals and spending
 */
function suggestTemplate(
    currentSavingsRate: number,
    totalDebt: number = 0,
    age: number = 35
): keyof typeof BUDGET_TEMPLATES {
    // High debt or low savings → conservative
    if (totalDebt > 10000 || currentSavingsRate < 5) {
        return 'conservative';
    }

    // Good savings, younger → aggressive for wealth building
    if (currentSavingsRate > 15 && age < 40) {
        return 'aggressive';
    }

    return 'balanced';
}

/**
 * Calculate budget health score
 */
function calculateBudgetScore(
    recommendations: BudgetRecommendation[],
    savingsRate: number,
    targetSavingsRate: number
): number {
    let score = 100;

    // Deduct for high-priority issues
    for (const rec of recommendations) {
        if (rec.priority === 'high' && rec.action === 'reduce') {
            score -= 15;
        } else if (rec.priority === 'medium' && rec.action === 'reduce') {
            score -= 8;
        }
    }

    // Savings rate impact
    if (savingsRate < targetSavingsRate) {
        const gap = targetSavingsRate - savingsRate;
        score -= Math.min(30, gap * 1.5);
    } else {
        score += Math.min(10, (savingsRate - targetSavingsRate) * 0.5);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate AI-powered budget insights
 */
async function generateBudgetInsights(
    optimization: Partial<BudgetOptimization>,
    spending: CategorySpending[]
): Promise<string[]> {
    const topSpending = spending
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(s => `${s.category}: $${s.amount.toFixed(0)}`);

    const highPriority = optimization.recommendations?.filter(r => r.priority === 'high') || [];

    const prompt = `Generate 3 brief, actionable budget insights based on:
- Monthly income: $${optimization.monthlyIncome}
- Current savings rate: ${optimization.currentSavingsRate}%
- Target: ${optimization.targetSavingsRate}%
- Top spending: ${topSpending.join(', ')}
- Issues: ${highPriority.length} high-priority categories need attention

Each insight should be 1 sentence, encouraging but direct.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200 },
        });

        const text = result.response.text() || '';
        return text.split(/\d+\.\s*/).filter(s => s.trim()).map(s => s.trim());
    } catch {
        return [
            `Your savings rate of ${optimization.currentSavingsRate}% ${(optimization.currentSavingsRate || 0) >= (optimization.targetSavingsRate || 20)
                ? 'exceeds' : 'is below'
            } the target of ${optimization.targetSavingsRate}%.`,
            highPriority.length > 0
                ? `Focus on ${highPriority[0]?.category} to free up $${Math.abs(highPriority[0]?.difference || 0).toFixed(0)}/month.`
                : 'Your budget allocation looks healthy overall.',
            'Consider automating transfers to savings on payday.',
        ];
    }
}

/**
 * Main optimization function
 */
export async function optimizeBudget(
    categorySpending: CategorySpending[],
    monthlyIncome: number,
    options?: {
        totalDebt?: number;
        age?: number;
        targetSavingsRate?: number;
    }
): Promise<BudgetOptimization> {
    const totalSpending = categorySpending.reduce((s, c) => s + c.amount, 0);
    const currentSavingsRate = monthlyIncome > 0
        ? Math.round(((monthlyIncome - totalSpending) / monthlyIncome) * 100)
        : 0;

    const suggestedTemplate = suggestTemplate(
        currentSavingsRate,
        options?.totalDebt,
        options?.age
    );

    const targetSavingsRate = options?.targetSavingsRate || BUDGET_TEMPLATES[suggestedTemplate].savings;

    const recommendations = calculateRecommendations(
        categorySpending,
        monthlyIncome,
        suggestedTemplate
    );

    const potentialMonthlySavings = recommendations
        .filter(r => r.action === 'reduce')
        .reduce((s, r) => s + r.difference, 0);

    const score = calculateBudgetScore(recommendations, currentSavingsRate, targetSavingsRate);

    const partialResult: Partial<BudgetOptimization> = {
        monthlyIncome,
        currentSavingsRate,
        targetSavingsRate,
        potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
        recommendations,
    };

    const insights = await generateBudgetInsights(partialResult, categorySpending);

    return {
        monthlyIncome,
        currentSavingsRate,
        targetSavingsRate,
        potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
        recommendations,
        suggestedTemplate,
        insights,
        score,
        generatedAt: new Date(),
    };
}

/**
 * Quick budget health check
 */
export function getBudgetHealthQuick(
    categorySpending: CategorySpending[],
    monthlyIncome: number
): { score: number; label: string; topIssue: string | null } {
    const totalSpending = categorySpending.reduce((s, c) => s + c.amount, 0);
    const savingsRate = monthlyIncome > 0
        ? ((monthlyIncome - totalSpending) / monthlyIncome) * 100
        : 0;

    let score: number;
    let label: string;

    if (savingsRate >= 20) {
        score = 90;
        label = 'Excellent';
    } else if (savingsRate >= 10) {
        score = 70;
        label = 'Good';
    } else if (savingsRate >= 0) {
        score = 50;
        label = 'Needs Work';
    } else {
        score = 25;
        label = 'Critical';
    }

    const highestCategory = categorySpending.sort((a, b) => b.percentOfIncome - a.percentOfIncome)[0];
    const topIssue = highestCategory && highestCategory.percentOfIncome > 30
        ? `${highestCategory.category} is ${Math.round(highestCategory.percentOfIncome)}% of income`
        : null;

    return { score, label, topIssue };
}

export default {
    optimizeBudget,
    getBudgetHealthQuick,
    BUDGET_TEMPLATES,
};
