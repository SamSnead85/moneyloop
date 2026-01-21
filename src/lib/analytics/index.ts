/**
 * Analytics Module Exports
 * 
 * Centralized exports for MoneyLoop analytics system
 */

// Cash Flow Forecasting
export {
    generateCashFlowForecast,
    getForecastSummary,
} from './cash-flow-forecast';
export type {
    ForecastDay,
    CashFlowForecast,
    ForecastPeriod,
    RecurringPattern,
} from './cash-flow-forecast';

// Spending Pattern Analysis
export {
    analyzeSpendingPatterns,
    getPatternSummary,
} from './spending-patterns';
export type {
    SpendingTrend,
    SpendingAnomaly,
    CategoryPattern,
    SpendingPatternAnalysis,
} from './spending-patterns';

// Budget Optimization
export {
    optimizeBudget,
    getBudgetHealthQuick,
} from './budget-optimizer';
export type {
    BudgetRecommendation,
    BudgetOptimization,
} from './budget-optimizer';
