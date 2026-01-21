/**
 * Financial Health Score Engine
 * 
 * Comprehensive financial health scoring with actionable insights.
 * Powers the premium Financial Health Dashboard.
 * 
 * Super-Sprint 8: Phases 701-750
 */

export interface FinancialMetrics {
    monthlyIncome: number;
    monthlyExpenses: number;
    totalSavings: number;
    totalDebt: number;
    emergencyFund: number;
    investments: number;
    creditScore?: number;
    netWorth: number;
}

export interface HealthScoreBreakdown {
    category: string;
    score: number;
    weight: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    details: string;
}

export interface FinancialHealthScore {
    overallScore: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: HealthScoreBreakdown[];
    strengths: string[];
    improvements: string[];
    nextActions: { action: string; impact: 'high' | 'medium' | 'low'; timeframe: string }[];
    comparedToAverage: number; // percentile
    trend: 'improving' | 'stable' | 'declining';
    generatedAt: Date;
}

// Scoring weights
const SCORE_WEIGHTS = {
    savingsRate: 0.2,
    emergencyFund: 0.2,
    debtToIncome: 0.2,
    netWorth: 0.15,
    investmentRate: 0.15,
    creditScore: 0.1,
};

/**
 * Calculate savings rate score
 */
function scoreSavingsRate(income: number, expenses: number): HealthScoreBreakdown {
    if (income <= 0) {
        return {
            category: 'Savings Rate',
            score: 0,
            weight: SCORE_WEIGHTS.savingsRate,
            status: 'poor',
            details: 'No income data available',
        };
    }

    const savingsRate = ((income - expenses) / income) * 100;
    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (savingsRate >= 20) {
        score = 100;
        status = 'excellent';
    } else if (savingsRate >= 15) {
        score = 85;
        status = 'good';
    } else if (savingsRate >= 10) {
        score = 70;
        status = 'fair';
    } else if (savingsRate >= 5) {
        score = 50;
        status = 'fair';
    } else if (savingsRate >= 0) {
        score = 30;
        status = 'poor';
    } else {
        score = 10;
        status = 'poor';
    }

    return {
        category: 'Savings Rate',
        score,
        weight: SCORE_WEIGHTS.savingsRate,
        status,
        details: `Saving ${savingsRate.toFixed(1)}% of income (target: 20%+)`,
    };
}

/**
 * Calculate emergency fund score
 */
function scoreEmergencyFund(emergencyFund: number, monthlyExpenses: number): HealthScoreBreakdown {
    if (monthlyExpenses <= 0) {
        return {
            category: 'Emergency Fund',
            score: 50,
            weight: SCORE_WEIGHTS.emergencyFund,
            status: 'fair',
            details: 'Unable to calculate - no expense data',
        };
    }

    const monthsCovered = emergencyFund / monthlyExpenses;
    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (monthsCovered >= 6) {
        score = 100;
        status = 'excellent';
    } else if (monthsCovered >= 3) {
        score = 75;
        status = 'good';
    } else if (monthsCovered >= 1) {
        score = 50;
        status = 'fair';
    } else {
        score = 25;
        status = 'poor';
    }

    return {
        category: 'Emergency Fund',
        score,
        weight: SCORE_WEIGHTS.emergencyFund,
        status,
        details: `${monthsCovered.toFixed(1)} months of expenses covered (target: 6 months)`,
    };
}

/**
 * Calculate debt-to-income score
 */
function scoreDebtToIncome(totalDebt: number, annualIncome: number): HealthScoreBreakdown {
    if (annualIncome <= 0) {
        return {
            category: 'Debt-to-Income',
            score: 50,
            weight: SCORE_WEIGHTS.debtToIncome,
            status: 'fair',
            details: 'Unable to calculate - no income data',
        };
    }

    const dti = (totalDebt / annualIncome) * 100;
    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (dti === 0) {
        score = 100;
        status = 'excellent';
    } else if (dti <= 20) {
        score = 90;
        status = 'excellent';
    } else if (dti <= 36) {
        score = 75;
        status = 'good';
    } else if (dti <= 50) {
        score = 50;
        status = 'fair';
    } else {
        score = 25;
        status = 'poor';
    }

    return {
        category: 'Debt-to-Income',
        score,
        weight: SCORE_WEIGHTS.debtToIncome,
        status,
        details: `${dti.toFixed(0)}% debt-to-income ratio (target: <36%)`,
    };
}

/**
 * Calculate net worth score (age-adjusted)
 */
function scoreNetWorth(netWorth: number, annualIncome: number, age: number = 35): HealthScoreBreakdown {
    // Target: Net worth = annual income × (age / 10)
    const targetMultiplier = Math.max(1, age / 10);
    const targetNetWorth = annualIncome * targetMultiplier;

    const ratio = targetNetWorth > 0 ? netWorth / targetNetWorth : 0;
    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (ratio >= 1.5) {
        score = 100;
        status = 'excellent';
    } else if (ratio >= 1) {
        score = 85;
        status = 'good';
    } else if (ratio >= 0.5) {
        score = 60;
        status = 'fair';
    } else if (ratio >= 0.25) {
        score = 40;
        status = 'fair';
    } else {
        score = 20;
        status = 'poor';
    }

    return {
        category: 'Net Worth',
        score,
        weight: SCORE_WEIGHTS.netWorth,
        status,
        details: `$${netWorth.toLocaleString()} (${(ratio * 100).toFixed(0)}% of age-adjusted target)`,
    };
}

/**
 * Calculate investment rate score
 */
function scoreInvestmentRate(investments: number, annualIncome: number): HealthScoreBreakdown {
    const investmentRate = annualIncome > 0 ? (investments / annualIncome) * 100 : 0;
    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (investmentRate >= 15) {
        score = 100;
        status = 'excellent';
    } else if (investmentRate >= 10) {
        score = 80;
        status = 'good';
    } else if (investmentRate >= 5) {
        score = 60;
        status = 'fair';
    } else if (investmentRate > 0) {
        score = 40;
        status = 'fair';
    } else {
        score = 20;
        status = 'poor';
    }

    return {
        category: 'Investment Rate',
        score,
        weight: SCORE_WEIGHTS.investmentRate,
        status,
        details: `Investing ${investmentRate.toFixed(0)}% of income (target: 15%+)`,
    };
}

/**
 * Score credit score
 */
function scoreCreditScore(creditScore?: number): HealthScoreBreakdown {
    if (!creditScore) {
        return {
            category: 'Credit Score',
            score: 50,
            weight: SCORE_WEIGHTS.creditScore,
            status: 'fair',
            details: 'No credit score available',
        };
    }

    let score: number;
    let status: HealthScoreBreakdown['status'];

    if (creditScore >= 800) {
        score = 100;
        status = 'excellent';
    } else if (creditScore >= 740) {
        score = 90;
        status = 'excellent';
    } else if (creditScore >= 670) {
        score = 75;
        status = 'good';
    } else if (creditScore >= 580) {
        score = 50;
        status = 'fair';
    } else {
        score = 25;
        status = 'poor';
    }

    return {
        category: 'Credit Score',
        score,
        weight: SCORE_WEIGHTS.creditScore,
        status,
        details: `${creditScore} (${status === 'excellent' ? 'Excellent' : status === 'good' ? 'Good' : status === 'fair' ? 'Fair' : 'Poor'})`,
    };
}

/**
 * Generate improvement recommendations
 */
function generateRecommendations(
    breakdown: HealthScoreBreakdown[],
    metrics: FinancialMetrics
): { action: string; impact: 'high' | 'medium' | 'low'; timeframe: string }[] {
    const actions: { action: string; impact: 'high' | 'medium' | 'low'; timeframe: string }[] = [];

    const poorCategories = breakdown.filter(b => b.status === 'poor' || b.status === 'fair');

    for (const category of poorCategories) {
        switch (category.category) {
            case 'Emergency Fund':
                actions.push({
                    action: 'Build your emergency fund to 3 months of expenses',
                    impact: 'high',
                    timeframe: '6-12 months',
                });
                break;
            case 'Savings Rate':
                actions.push({
                    action: 'Increase savings by automating transfers on payday',
                    impact: 'high',
                    timeframe: 'Immediate',
                });
                break;
            case 'Debt-to-Income':
                actions.push({
                    action: 'Focus on paying down high-interest debt first',
                    impact: 'high',
                    timeframe: '12-24 months',
                });
                break;
            case 'Investment Rate':
                actions.push({
                    action: 'Start investing with employer 401k match',
                    impact: 'medium',
                    timeframe: '1-3 months',
                });
                break;
            case 'Credit Score':
                actions.push({
                    action: 'Pay all bills on time and reduce credit utilization below 30%',
                    impact: 'medium',
                    timeframe: '3-6 months',
                });
                break;
        }
    }

    return actions.slice(0, 5);
}

/**
 * Get letter grade from score
 */
function getGrade(score: number): FinancialHealthScore['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

/**
 * Main financial health calculation
 */
export function calculateFinancialHealth(
    metrics: FinancialMetrics,
    options?: { age?: number; previousScore?: number }
): FinancialHealthScore {
    const annualIncome = metrics.monthlyIncome * 12;
    const age = options?.age || 35;

    // Calculate all component scores
    const breakdown: HealthScoreBreakdown[] = [
        scoreSavingsRate(metrics.monthlyIncome, metrics.monthlyExpenses),
        scoreEmergencyFund(metrics.emergencyFund, metrics.monthlyExpenses),
        scoreDebtToIncome(metrics.totalDebt, annualIncome),
        scoreNetWorth(metrics.netWorth, annualIncome, age),
        scoreInvestmentRate(metrics.investments, annualIncome),
        scoreCreditScore(metrics.creditScore),
    ];

    // Calculate weighted overall score
    const overallScore = Math.round(
        breakdown.reduce((sum, b) => sum + b.score * b.weight, 0)
    );

    // Identify strengths and weaknesses
    const strengths = breakdown
        .filter(b => b.status === 'excellent' || b.status === 'good')
        .map(b => `${b.category}: ${b.status}`);

    const improvements = breakdown
        .filter(b => b.status === 'poor' || b.status === 'fair')
        .map(b => b.category);

    // Generate recommendations
    const nextActions = generateRecommendations(breakdown, metrics);

    // Determine trend
    let trend: FinancialHealthScore['trend'] = 'stable';
    if (options?.previousScore) {
        if (overallScore > options.previousScore + 3) trend = 'improving';
        else if (overallScore < options.previousScore - 3) trend = 'declining';
    }

    return {
        overallScore,
        grade: getGrade(overallScore),
        breakdown,
        strengths,
        improvements,
        nextActions,
        comparedToAverage: Math.min(99, Math.max(1, overallScore + Math.random() * 10 - 5)), // Simulated percentile
        trend,
        generatedAt: new Date(),
    };
}

/**
 * Quick health check for dashboard widget
 */
export function getQuickHealthCheck(metrics: FinancialMetrics): {
    score: number;
    grade: string;
    topIssue: string | null;
    topStrength: string | null;
} {
    const health = calculateFinancialHealth(metrics);

    return {
        score: health.overallScore,
        grade: health.grade,
        topIssue: health.improvements[0] || null,
        topStrength: health.strengths[0]?.split(':')[0] || null,
    };
}

export default {
    calculateFinancialHealth,
    getQuickHealthCheck,
};
