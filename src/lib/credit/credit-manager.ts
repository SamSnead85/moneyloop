/**
 * Credit Management System
 * 
 * Credit score integration, debt payoff strategies,
 * and credit utilization monitoring.
 * 
 * Super-Sprint 24: Phases 2301-2350
 */

export interface CreditScore {
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
    source: 'experian' | 'equifax' | 'transunion' | 'estimated';
    factors: CreditFactor[];
    updatedAt: Date;
    history: { date: Date; score: number }[];
}

export interface CreditFactor {
    name: string;
    impact: 'high' | 'medium' | 'low';
    status: 'positive' | 'negative' | 'neutral';
    description: string;
    recommendation?: string;
}

export interface Debt {
    id: string;
    name: string;
    type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'auto_loan' | 'medical' | 'other';
    balance: number;
    creditLimit?: number;
    interestRate: number;
    minimumPayment: number;
    dueDate: number; // Day of month
    lender: string;
    accountId?: string;
}

export interface PayoffStrategy {
    name: string;
    method: 'avalanche' | 'snowball' | 'hybrid' | 'custom';
    totalDebt: number;
    totalInterest: number;
    monthsToPayoff: number;
    monthlyPayment: number;
    payoffOrder: DebtPayoffSchedule[];
}

export interface DebtPayoffSchedule {
    debtId: string;
    debtName: string;
    currentBalance: number;
    payoffMonth: number;
    totalInterestPaid: number;
    monthlyPayments: { month: number; principal: number; interest: number; balance: number }[];
}

export interface CreditUtilization {
    overall: number;
    byAccount: { accountId: string; accountName: string; balance: number; limit: number; utilization: number }[];
    recommendation: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Get credit score rating
 */
export function getCreditRating(score: number): CreditScore['rating'] {
    if (score >= 800) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    if (score >= 550) return 'poor';
    return 'very_poor';
}

/**
 * Estimate credit score from financial data
 */
export function estimateCreditScore(data: {
    creditUtilization: number; // 0-1
    paymentHistory: number; // 0-1 (on-time payment rate)
    accountAge: number; // months
    accountCount: number;
    hardInquiries: number;
    derogatoriesCount: number;
}): CreditScore {
    let score = 300;
    const factors: CreditFactor[] = [];

    // Payment history (35% of score)
    const paymentScore = Math.round(data.paymentHistory * 850 * 0.35);
    score += paymentScore;
    factors.push({
        name: 'Payment History',
        impact: 'high',
        status: data.paymentHistory > 0.95 ? 'positive' : data.paymentHistory > 0.8 ? 'neutral' : 'negative',
        description: `${Math.round(data.paymentHistory * 100)}% on-time payments`,
        recommendation: data.paymentHistory < 0.95 ? 'Set up autopay to never miss a payment' : undefined,
    });

    // Credit utilization (30%)
    const utilizationScore = Math.round((1 - Math.min(1, data.creditUtilization * 2)) * 850 * 0.30);
    score += utilizationScore;
    factors.push({
        name: 'Credit Utilization',
        impact: 'high',
        status: data.creditUtilization < 0.3 ? 'positive' : data.creditUtilization < 0.5 ? 'neutral' : 'negative',
        description: `${Math.round(data.creditUtilization * 100)}% of credit used`,
        recommendation: data.creditUtilization > 0.3 ? 'Try to keep utilization below 30%' : undefined,
    });

    // Account age (15%)
    const ageScore = Math.round(Math.min(1, data.accountAge / 120) * 850 * 0.15);
    score += ageScore;
    factors.push({
        name: 'Credit Age',
        impact: 'medium',
        status: data.accountAge > 60 ? 'positive' : data.accountAge > 24 ? 'neutral' : 'negative',
        description: `Average account age: ${Math.floor(data.accountAge / 12)} years ${data.accountAge % 12} months`,
    });

    // Credit mix (10%)
    const mixScore = Math.round(Math.min(1, data.accountCount / 5) * 850 * 0.10);
    score += mixScore;
    factors.push({
        name: 'Credit Mix',
        impact: 'low',
        status: data.accountCount >= 3 ? 'positive' : 'neutral',
        description: `${data.accountCount} credit accounts`,
    });

    // Hard inquiries (10%)
    const inquiryPenalty = Math.min(data.hardInquiries * 10, 85);
    score -= inquiryPenalty;
    if (data.hardInquiries > 2) {
        factors.push({
            name: 'Recent Inquiries',
            impact: 'low',
            status: 'negative',
            description: `${data.hardInquiries} hard inquiries in last 12 months`,
            recommendation: 'Avoid applying for new credit for a few months',
        });
    }

    // Derogatory marks
    if (data.derogatoriesCount > 0) {
        score -= data.derogatoriesCount * 50;
        factors.push({
            name: 'Derogatory Marks',
            impact: 'high',
            status: 'negative',
            description: `${data.derogatoriesCount} negative marks on record`,
            recommendation: 'Consider disputing any errors on your credit report',
        });
    }

    score = Math.max(300, Math.min(850, score));

    return {
        score: Math.round(score),
        rating: getCreditRating(score),
        source: 'estimated',
        factors,
        updatedAt: new Date(),
        history: [],
    };
}

/**
 * Calculate debt payoff using avalanche method (highest interest first)
 */
export function calculateAvalanchePayoff(
    debts: Debt[],
    monthlyBudget: number
): PayoffStrategy {
    const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    return calculatePayoff(sorted, monthlyBudget, 'avalanche');
}

/**
 * Calculate debt payoff using snowball method (lowest balance first)
 */
export function calculateSnowballPayoff(
    debts: Debt[],
    monthlyBudget: number
): PayoffStrategy {
    const sorted = [...debts].sort((a, b) => a.balance - b.balance);
    return calculatePayoff(sorted, monthlyBudget, 'snowball');
}

/**
 * Core payoff calculation
 */
function calculatePayoff(
    orderedDebts: Debt[],
    monthlyBudget: number,
    method: PayoffStrategy['method']
): PayoffStrategy {
    const schedules: DebtPayoffSchedule[] = [];
    let totalInterest = 0;
    let maxMonth = 0;

    // Clone debts for simulation
    const debtBalances = orderedDebts.map(d => ({
        ...d,
        remainingBalance: d.balance,
        paidOff: false,
        schedule: [] as DebtPayoffSchedule['monthlyPayments'],
    }));

    // Minimum payments total
    const minimumTotal = debtBalances.reduce((sum, d) => sum + d.minimumPayment, 0);
    let extraPayment = Math.max(0, monthlyBudget - minimumTotal);

    // Simulate month by month
    for (let month = 1; month <= 360; month++) {
        let allPaid = true;
        let availableExtra = extraPayment;

        for (const debt of debtBalances) {
            if (debt.paidOff) continue;
            allPaid = false;

            // Calculate interest
            const monthlyRate = debt.interestRate / 100 / 12;
            const interest = debt.remainingBalance * monthlyRate;
            totalInterest += interest;

            // Determine payment
            let payment = debt.minimumPayment;

            // Add extra to first unpaid debt (in priority order)
            const isHighestPriority = debtBalances.find(d => !d.paidOff)?.id === debt.id;
            if (isHighestPriority && availableExtra > 0) {
                payment += availableExtra;
                availableExtra = 0;
            }

            // Apply payment
            const principal = Math.min(payment - interest, debt.remainingBalance);
            debt.remainingBalance = Math.max(0, debt.remainingBalance - principal);

            debt.schedule.push({
                month,
                principal: Math.round(principal * 100) / 100,
                interest: Math.round(interest * 100) / 100,
                balance: Math.round(debt.remainingBalance * 100) / 100,
            });

            if (debt.remainingBalance <= 0.01) {
                debt.paidOff = true;
                debt.remainingBalance = 0;
                maxMonth = month;

                // Freed up minimum goes to extra
                extraPayment += debt.minimumPayment;
            }
        }

        if (allPaid) break;
    }

    // Build schedules
    for (const debt of debtBalances) {
        const payoffMonth = debt.schedule.findIndex(s => s.balance === 0);
        const interestPaid = debt.schedule.reduce((sum, s) => sum + s.interest, 0);

        schedules.push({
            debtId: debt.id,
            debtName: debt.name,
            currentBalance: debt.balance,
            payoffMonth: payoffMonth >= 0 ? payoffMonth + 1 : debt.schedule.length,
            totalInterestPaid: Math.round(interestPaid * 100) / 100,
            monthlyPayments: debt.schedule,
        });
    }

    const methodName = method === 'avalanche'
        ? 'Avalanche (Highest Interest First)'
        : 'Snowball (Lowest Balance First)';

    return {
        name: methodName,
        method,
        totalDebt: Math.round(orderedDebts.reduce((s, d) => s + d.balance, 0) * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        monthsToPayoff: maxMonth,
        monthlyPayment: monthlyBudget,
        payoffOrder: schedules.sort((a, b) => a.payoffMonth - b.payoffMonth),
    };
}

/**
 * Compare payoff strategies
 */
export function compareStrategies(
    debts: Debt[],
    monthlyBudget: number
): { avalanche: PayoffStrategy; snowball: PayoffStrategy; savings: number; recommendation: string } {
    const avalanche = calculateAvalanchePayoff(debts, monthlyBudget);
    const snowball = calculateSnowballPayoff(debts, monthlyBudget);

    const savings = snowball.totalInterest - avalanche.totalInterest;
    const timeDiff = snowball.monthsToPayoff - avalanche.monthsToPayoff;

    let recommendation: string;
    if (savings > 500) {
        recommendation = `Avalanche method saves $${savings.toFixed(0)} in interest and pays off ${Math.abs(timeDiff)} months faster. Recommended for maximum savings.`;
    } else if (debts.some(d => d.balance < 1000)) {
        recommendation = `Snowball method provides quick wins by eliminating small debts first. The psychological boost may help you stay motivated.`;
    } else {
        recommendation = `Both methods are similar for your debt profile. Choose based on whether you prefer quick wins (Snowball) or maximum savings (Avalanche).`;
    }

    return { avalanche, snowball, savings, recommendation };
}

/**
 * Calculate credit utilization
 */
export function calculateCreditUtilization(
    accounts: { id: string; name: string; balance: number; creditLimit: number }[]
): CreditUtilization {
    const creditAccounts = accounts.filter(a => a.creditLimit > 0);

    if (creditAccounts.length === 0) {
        return {
            overall: 0,
            byAccount: [],
            recommendation: 'No credit accounts found',
            healthStatus: 'excellent',
        };
    }

    const totalBalance = creditAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
    const totalLimit = creditAccounts.reduce((s, a) => s + a.creditLimit, 0);
    const overall = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

    const byAccount = creditAccounts.map(a => ({
        accountId: a.id,
        accountName: a.name,
        balance: Math.abs(a.balance),
        limit: a.creditLimit,
        utilization: a.creditLimit > 0 ? (Math.abs(a.balance) / a.creditLimit) * 100 : 0,
    }));

    let healthStatus: CreditUtilization['healthStatus'];
    let recommendation: string;

    if (overall < 10) {
        healthStatus = 'excellent';
        recommendation = 'Excellent credit utilization! Keep it up.';
    } else if (overall < 30) {
        healthStatus = 'good';
        recommendation = 'Good utilization. Staying under 30% is ideal for credit scores.';
    } else if (overall < 50) {
        healthStatus = 'fair';
        recommendation = 'Consider paying down balances to get under 30% utilization.';
    } else {
        healthStatus = 'poor';
        recommendation = 'High utilization may hurt your credit score. Focus on paying down balances.';
    }

    // Flag individual high utilization accounts
    const highUtilization = byAccount.filter(a => a.utilization > 50);
    if (highUtilization.length > 0) {
        recommendation += ` ${highUtilization.length} account(s) have over 50% utilization.`;
    }

    return {
        overall: Math.round(overall * 10) / 10,
        byAccount: byAccount.sort((a, b) => b.utilization - a.utilization),
        recommendation,
        healthStatus,
    };
}

/**
 * Get debt freedom date
 */
export function getDebtFreedomDate(
    debts: Debt[],
    monthlyBudget: number,
    method: 'avalanche' | 'snowball' = 'avalanche'
): { date: Date; strategy: PayoffStrategy } {
    const strategy = method === 'avalanche'
        ? calculateAvalanchePayoff(debts, monthlyBudget)
        : calculateSnowballPayoff(debts, monthlyBudget);

    const date = new Date();
    date.setMonth(date.getMonth() + strategy.monthsToPayoff);

    return { date, strategy };
}

export default {
    estimateCreditScore,
    getCreditRating,
    calculateAvalanchePayoff,
    calculateSnowballPayoff,
    compareStrategies,
    calculateCreditUtilization,
    getDebtFreedomDate,
};
