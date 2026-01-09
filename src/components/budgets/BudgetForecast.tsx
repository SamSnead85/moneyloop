'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';

interface BudgetData {
    category: string;
    budget: number;
    spent: number;
}

interface ProjectedMonth {
    month: string;
    projected: number;
    budget: number;
    trend: 'up' | 'down' | 'stable';
}

interface BudgetForecastProps {
    budgets: BudgetData[];
    historicalSpending?: number[]; // Last 6 months spending
    className?: string;
}

// Calculate trend and forecast future spending
function forecastSpending(
    currentBudgets: BudgetData[],
    historicalSpending: number[] = []
): ProjectedMonth[] {
    const totalBudget = currentBudgets.reduce((sum, b) => sum + b.budget, 0);
    const currentSpending = currentBudgets.reduce((sum, b) => sum + b.spent, 0);

    // Calculate average monthly change from history
    let avgChange = 0;
    if (historicalSpending.length >= 2) {
        const changes = [];
        for (let i = 1; i < historicalSpending.length; i++) {
            changes.push(historicalSpending[i] - historicalSpending[i - 1]);
        }
        avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    }

    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const projections: ProjectedMonth[] = [];

    let projectedSpending = currentSpending;

    for (const month of months) {
        // Add some variance for realism
        const variance = (Math.random() - 0.5) * 500;
        projectedSpending = Math.max(0, projectedSpending + avgChange + variance);

        projections.push({
            month,
            projected: Math.round(projectedSpending),
            budget: totalBudget,
            trend: projectedSpending > totalBudget ? 'up' :
                projectedSpending < totalBudget * 0.9 ? 'down' : 'stable',
        });
    }

    return projections;
}

export function BudgetForecast({ budgets, historicalSpending, className = '' }: BudgetForecastProps) {
    const projections = useMemo(
        () => forecastSpending(budgets, historicalSpending),
        [budgets, historicalSpending]
    );

    const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
    const averageProjected = projections.reduce((sum, p) => sum + p.projected, 0) / projections.length;
    const overBudgetMonths = projections.filter(p => p.projected > p.budget).length;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <Calendar className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-sm text-white/50">6-Month Forecast</p>
                    <p className="text-xl font-semibold text-white font-mono">{formatCurrency(averageProjected)}/mo</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                    <p className="text-sm text-white/50">Monthly Budget</p>
                    <p className="text-xl font-semibold text-white font-mono">{formatCurrency(totalBudget)}</p>
                </div>
                <div className={`p-4 rounded-xl border ${overBudgetMonths > 2
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-white/[0.03] border-white/10'
                    }`}>
                    <AlertTriangle className={`w-5 h-5 mb-2 ${overBudgetMonths > 2 ? 'text-red-400' : 'text-amber-400'
                        }`} />
                    <p className="text-sm text-white/50">Months Over Budget</p>
                    <p className="text-xl font-semibold text-white font-mono">{overBudgetMonths} of 6</p>
                </div>
            </div>

            {/* Forecast Chart */}
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
                <h4 className="text-sm font-medium text-white/70 mb-6">Spending Projection</h4>

                <div className="relative h-48">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-white/40 font-mono">
                        <span>{formatCurrency(totalBudget * 1.5)}</span>
                        <span>{formatCurrency(totalBudget)}</span>
                        <span>{formatCurrency(totalBudget * 0.5)}</span>
                        <span>$0</span>
                    </div>

                    {/* Chart area */}
                    <div className="ml-20 h-full flex items-end justify-between gap-2">
                        {projections.map((proj, index) => {
                            const height = Math.min((proj.projected / (totalBudget * 1.5)) * 100, 100);
                            const budgetHeight = (proj.budget / (totalBudget * 1.5)) * 100;

                            return (
                                <div key={proj.month} className="flex-1 relative h-full flex flex-col justify-end">
                                    {/* Budget line marker */}
                                    <div
                                        className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/50"
                                        style={{ bottom: `${budgetHeight}%` }}
                                    />

                                    {/* Projected bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className={`rounded-t-lg ${proj.trend === 'up'
                                                ? 'bg-gradient-to-t from-red-500/60 to-red-400/40'
                                                : proj.trend === 'down'
                                                    ? 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/40'
                                                    : 'bg-gradient-to-t from-blue-500/60 to-blue-400/40'
                                            }`}
                                    />

                                    {/* Month label */}
                                    <p className="text-center text-xs text-white/50 mt-2">{proj.month}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/50">
                    <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-blue-500/60" />
                        Projected Spending
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-6 border-t-2 border-dashed border-amber-500/50" />
                        Budget Limit
                    </span>
                </div>
            </div>

            {/* Insights */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Forecast Insights</h4>
                <ul className="space-y-2 text-sm text-white/60">
                    {overBudgetMonths > 0 && (
                        <li className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-red-400 mt-0.5" />
                            <span>
                                You&apos;re projected to exceed your budget in {overBudgetMonths} of the next 6 months.
                                Consider reducing discretionary spending.
                            </span>
                        </li>
                    )}
                    {averageProjected < totalBudget && (
                        <li className="flex items-start gap-2">
                            <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span>
                                Great news! Your spending trend is below budget. You could save an extra{' '}
                                {formatCurrency((totalBudget - averageProjected) * 6)} over 6 months.
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default BudgetForecast;
