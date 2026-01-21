/**
 * Investment Portfolio Tracking
 * 
 * Real-time portfolio tracking with performance analytics,
 * asset allocation, and retirement projections.
 * 
 * Super-Sprint 4: Phases 301-350
 */

export interface Holding {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'crypto' | 'reit' | 'other';
    quantity: number;
    costBasis: number;
    currentPrice: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
    accountId: string;
}

export interface Portfolio {
    id: string;
    userId: string;
    name: string;
    holdings: Holding[];
    totalValue: number;
    totalCostBasis: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
    lastUpdated: Date;
}

export interface AssetAllocation {
    type: string;
    value: number;
    percentage: number;
    targetPercentage?: number;
    drift?: number;
}

export interface PerformanceMetrics {
    period: '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'ALL';
    startValue: number;
    endValue: number;
    returnAmount: number;
    returnPercent: number;
    benchmarkReturn?: number;
    alpha?: number;
}

export interface RetirementProjection {
    currentAge: number;
    retirementAge: number;
    currentBalance: number;
    monthlyContribution: number;
    annualReturn: number;
    projectedBalance: number;
    yearsToRetirement: number;
    monthlyRetirementIncome: number;
    yearByYear: { age: number; balance: number }[];
}

export interface DiversificationScore {
    overall: number; // 0-100
    byAssetClass: number;
    bySector: number;
    byGeography: number;
    recommendations: string[];
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(holdings: Holding[]): {
    totalValue: number;
    totalCostBasis: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
} {
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalCostBasis = holdings.reduce((s, h) => s + h.costBasis, 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
    const dayChange = holdings.reduce((s, h) => s + h.dayChange * h.quantity, 0);
    const previousValue = totalValue - dayChange;
    const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;

    return {
        totalValue: Math.round(totalValue * 100) / 100,
        totalCostBasis: Math.round(totalCostBasis * 100) / 100,
        totalGainLoss: Math.round(totalGainLoss * 100) / 100,
        totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
        dayChange: Math.round(dayChange * 100) / 100,
        dayChangePercent: Math.round(dayChangePercent * 100) / 100,
    };
}

/**
 * Calculate asset allocation
 */
export function calculateAssetAllocation(
    holdings: Holding[],
    targets?: Record<string, number>
): AssetAllocation[] {
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const typeValues: Map<string, number> = new Map();

    for (const holding of holdings) {
        const current = typeValues.get(holding.type) || 0;
        typeValues.set(holding.type, current + holding.currentValue);
    }

    const allocations: AssetAllocation[] = [];
    for (const [type, value] of typeValues) {
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const targetPercentage = targets?.[type];
        const drift = targetPercentage !== undefined ? percentage - targetPercentage : undefined;

        allocations.push({
            type,
            value: Math.round(value * 100) / 100,
            percentage: Math.round(percentage * 10) / 10,
            targetPercentage,
            drift: drift !== undefined ? Math.round(drift * 10) / 10 : undefined,
        });
    }

    return allocations.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Calculate performance for a period
 */
export function calculatePerformance(
    currentValue: number,
    historicalValues: { date: Date; value: number }[],
    period: PerformanceMetrics['period']
): PerformanceMetrics {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case '1D':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 1);
            break;
        case '1W':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '1M':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case '3M':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case '6M':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case 'YTD':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case '1Y':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case '3Y':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 3);
            break;
        case '5Y':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 5);
            break;
        case 'ALL':
        default:
            startDate = new Date(0);
    }

    // Find closest value to start date
    const sortedHistory = historicalValues
        .filter(v => v.date >= startDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const startValue = sortedHistory.length > 0 ? sortedHistory[0].value : currentValue;
    const returnAmount = currentValue - startValue;
    const returnPercent = startValue > 0 ? (returnAmount / startValue) * 100 : 0;

    return {
        period,
        startValue: Math.round(startValue * 100) / 100,
        endValue: Math.round(currentValue * 100) / 100,
        returnAmount: Math.round(returnAmount * 100) / 100,
        returnPercent: Math.round(returnPercent * 100) / 100,
    };
}

/**
 * Project retirement balance
 */
export function projectRetirement(params: {
    currentAge: number;
    retirementAge: number;
    currentBalance: number;
    monthlyContribution: number;
    annualReturnRate?: number;
    inflationRate?: number;
    withdrawalRate?: number;
}): RetirementProjection {
    const {
        currentAge,
        retirementAge,
        currentBalance,
        monthlyContribution,
        annualReturnRate = 0.07,
        inflationRate = 0.03,
        withdrawalRate = 0.04,
    } = params;

    const yearsToRetirement = retirementAge - currentAge;
    const monthlyReturn = annualReturnRate / 12;
    const totalMonths = yearsToRetirement * 12;

    // Future value of current balance
    const fvCurrentBalance = currentBalance * Math.pow(1 + annualReturnRate, yearsToRetirement);

    // Future value of monthly contributions (annuity)
    const fvContributions = monthlyContribution *
        ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

    const projectedBalance = fvCurrentBalance + fvContributions;

    // Adjust for inflation
    const realBalance = projectedBalance / Math.pow(1 + inflationRate, yearsToRetirement);

    // Calculate monthly retirement income (4% rule)
    const annualIncome = realBalance * withdrawalRate;
    const monthlyRetirementIncome = annualIncome / 12;

    // Year by year projection
    const yearByYear: { age: number; balance: number }[] = [];
    let balance = currentBalance;
    for (let year = 0; year <= yearsToRetirement; year++) {
        yearByYear.push({
            age: currentAge + year,
            balance: Math.round(balance),
        });
        balance = balance * (1 + annualReturnRate) + monthlyContribution * 12;
    }

    return {
        currentAge,
        retirementAge,
        currentBalance: Math.round(currentBalance),
        monthlyContribution: Math.round(monthlyContribution),
        annualReturn: annualReturnRate * 100,
        projectedBalance: Math.round(projectedBalance),
        yearsToRetirement,
        monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
        yearByYear,
    };
}

/**
 * Calculate diversification score
 */
export function calculateDiversificationScore(holdings: Holding[]): DiversificationScore {
    const recommendations: string[] = [];
    let byAssetClass = 0;
    let bySector = 0;
    let byGeography = 0;

    // Asset class diversification
    const assetTypes = new Set(holdings.map(h => h.type));
    if (assetTypes.size >= 4) byAssetClass = 100;
    else if (assetTypes.size >= 3) byAssetClass = 75;
    else if (assetTypes.size >= 2) byAssetClass = 50;
    else byAssetClass = 25;

    if (byAssetClass < 75) {
        recommendations.push('Consider adding more asset classes for better diversification');
    }

    // Concentration check
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const largestHolding = Math.max(...holdings.map(h => h.currentValue));
    const concentrationRatio = totalValue > 0 ? (largestHolding / totalValue) * 100 : 0;

    if (concentrationRatio > 25) {
        bySector = 50;
        recommendations.push(`Your largest position is ${Math.round(concentrationRatio)}% of portfolio - consider rebalancing`);
    } else if (concentrationRatio > 15) {
        bySector = 75;
    } else {
        bySector = 100;
    }

    // Geographic (simplified - in production would use actual data)
    const hasInternational = holdings.some(h =>
        h.symbol.includes('EF') || h.symbol.includes('VWO') || h.symbol.includes('IEMG')
    );
    byGeography = hasInternational ? 100 : 50;
    if (!hasInternational) {
        recommendations.push('Consider adding international exposure for geographic diversification');
    }

    const overall = Math.round((byAssetClass + bySector + byGeography) / 3);

    return {
        overall,
        byAssetClass,
        bySector,
        byGeography,
        recommendations,
    };
}

/**
 * Get top movers in portfolio
 */
export function getTopMovers(holdings: Holding[]): {
    gainers: Holding[];
    losers: Holding[];
} {
    const sorted = [...holdings].sort((a, b) => b.dayChangePercent - a.dayChangePercent);

    return {
        gainers: sorted.filter(h => h.dayChangePercent > 0).slice(0, 5),
        losers: sorted.filter(h => h.dayChangePercent < 0).slice(-5).reverse(),
    };
}

export default {
    calculatePortfolioMetrics,
    calculateAssetAllocation,
    calculatePerformance,
    projectRetirement,
    calculateDiversificationScore,
    getTopMovers,
};
