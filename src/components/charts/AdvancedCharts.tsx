'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Surface, Text } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface CashFlowData {
    label: string;
    income: number;
    expenses: number;
    transfers?: number;
}

interface CashFlowChartProps {
    data: CashFlowData[];
    height?: number;
    showLabels?: boolean;
    className?: string;
}

// ===== COMPONENT =====

export function CashFlowChart({
    data,
    height = 300,
    showLabels = true,
    className,
}: CashFlowChartProps) {
    const chartData = useMemo(() => {
        let runningTotal = 0;
        return data.map((d, i) => {
            const startValue = runningTotal;
            const netChange = d.income - d.expenses - (d.transfers || 0);
            runningTotal += netChange;
            return {
                ...d,
                netChange,
                startValue,
                endValue: runningTotal,
                isPositive: netChange >= 0,
            };
        });
    }, [data]);

    const { minValue, maxValue, range } = useMemo(() => {
        const allValues = chartData.flatMap(d => [d.startValue, d.endValue]);
        const min = Math.min(0, ...allValues);
        const max = Math.max(0, ...allValues);
        return { minValue: min, maxValue: max, range: max - min || 1 };
    }, [chartData]);

    const barWidth = 100 / (data.length * 2 + 1);
    const getY = (value: number) => ((maxValue - value) / range) * 100;
    const zeroY = getY(0);

    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const netCashFlow = totalIncome - totalExpenses;

    return (
        <Surface elevation={1} className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <Text variant="heading-md">Cash Flow</Text>
                    <Text variant="body-sm" color="tertiary">Income vs Expenses over time</Text>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)]" />
                        <Text variant="body-sm" color="tertiary">Income</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--accent-danger)]" />
                        <Text variant="body-sm" color="tertiary">Expenses</Text>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[var(--accent-primary-subtle)]">
                    <Text variant="body-sm" color="tertiary">Total Income</Text>
                    <Text variant="heading-sm" className="font-mono text-[var(--accent-primary)]">
                        +{formatCurrency(totalIncome)}
                    </Text>
                </div>
                <div className="p-3 rounded-xl bg-[var(--accent-danger-subtle)]">
                    <Text variant="body-sm" color="tertiary">Total Expenses</Text>
                    <Text variant="heading-sm" className="font-mono text-[var(--accent-danger)]">
                        -{formatCurrency(totalExpenses)}
                    </Text>
                </div>
                <div className={cn(
                    'p-3 rounded-xl',
                    netCashFlow >= 0 ? 'bg-[var(--accent-success-subtle)]' : 'bg-[var(--accent-danger-subtle)]'
                )}>
                    <Text variant="body-sm" color="tertiary">Net Cash Flow</Text>
                    <div className="flex items-center gap-1">
                        {netCashFlow > 0 ? (
                            <TrendingUp className="w-4 h-4 text-[var(--accent-success)]" />
                        ) : netCashFlow < 0 ? (
                            <TrendingDown className="w-4 h-4 text-[var(--accent-danger)]" />
                        ) : (
                            <Minus className="w-4 h-4 text-[var(--text-tertiary)]" />
                        )}
                        <Text
                            variant="heading-sm"
                            className={cn(
                                'font-mono',
                                netCashFlow >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                            )}
                        >
                            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Zero line */}
                    <line
                        x1="0"
                        y1={zeroY}
                        x2="100"
                        y2={zeroY}
                        stroke="var(--border-default)"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                    />

                    {/* Bars */}
                    {chartData.map((d, i) => {
                        const x = barWidth + i * barWidth * 2;
                        const incomeHeight = (d.income / range) * 100;
                        const expenseHeight = (d.expenses / range) * 100;

                        return (
                            <g key={i}>
                                {/* Income bar (above zero) */}
                                <motion.rect
                                    initial={{ height: 0, y: zeroY }}
                                    animate={{
                                        height: incomeHeight,
                                        y: zeroY - incomeHeight
                                    }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    x={x - barWidth * 0.4}
                                    width={barWidth * 0.35}
                                    rx="0.5"
                                    fill="var(--accent-primary)"
                                    className="opacity-90"
                                />

                                {/* Expense bar (below zero visually, but measured from zero) */}
                                <motion.rect
                                    initial={{ height: 0, y: zeroY }}
                                    animate={{
                                        height: expenseHeight,
                                        y: zeroY
                                    }}
                                    transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
                                    x={x + barWidth * 0.05}
                                    width={barWidth * 0.35}
                                    rx="0.5"
                                    fill="var(--accent-danger)"
                                    className="opacity-90"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* X-axis labels */}
                {showLabels && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around pt-2 border-t border-[var(--border-subtle)]">
                        {data.map((d, i) => (
                            <Text key={i} variant="caption" color="tertiary" className="text-center">
                                {d.label}
                            </Text>
                        ))}
                    </div>
                )}
            </div>
        </Surface>
    );
}

// ===== TREND CHART =====

export interface TrendData {
    date: string;
    value: number;
    label?: string;
}

interface TrendChartProps {
    data: TrendData[];
    title?: string;
    subtitle?: string;
    valueFormat?: (value: number) => string;
    color?: string;
    height?: number;
    showArea?: boolean;
    className?: string;
}

export function TrendChart({
    data,
    title,
    subtitle,
    valueFormat = formatCurrency,
    color = 'var(--accent-primary)',
    height = 200,
    showArea = true,
    className,
}: TrendChartProps) {
    const { points, minValue, maxValue, trend } = useMemo(() => {
        if (data.length === 0) return { points: '', minValue: 0, maxValue: 0, trend: 0 };

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const pts = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value - min) / range) * 85 - 5;
            return `${x},${y}`;
        }).join(' ');

        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const trendPercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

        return { points: pts, minValue: min, maxValue: max, trend: trendPercent };
    }, [data]);

    const areaPath = useMemo(() => {
        if (!points) return '';
        return `M0,100 L${points} L100,100 Z`;
    }, [points]);

    const currentValue = data[data.length - 1]?.value ?? 0;

    return (
        <Surface elevation={1} className={cn('p-6', className)}>
            {(title || subtitle) && (
                <div className="flex items-start justify-between mb-4">
                    <div>
                        {title && <Text variant="heading-md">{title}</Text>}
                        {subtitle && <Text variant="body-sm" color="tertiary">{subtitle}</Text>}
                    </div>
                    <div className="text-right">
                        <Text variant="heading-lg" className="font-mono">
                            {valueFormat(currentValue)}
                        </Text>
                        <div className={cn(
                            'flex items-center gap-1 justify-end',
                            trend >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                        )}>
                            {trend >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <Text variant="mono-sm">
                                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                            </Text>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ height }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id={`trend-gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    {showArea && areaPath && (
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            d={areaPath}
                            fill={`url(#trend-gradient-${title})`}
                        />
                    )}

                    {/* Line */}
                    {points && (
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            points={points}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Data points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const range = maxValue - minValue || 1;
                        const y = 100 - ((d.value - minValue) / range) * 85 - 5;
                        return (
                            <motion.circle
                                key={i}
                                initial={{ r: 0 }}
                                animate={{ r: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                cx={x}
                                cy={y}
                                fill={color}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
                <Text variant="caption" color="tertiary">
                    {data[0]?.label || data[0]?.date}
                </Text>
                <Text variant="caption" color="tertiary">
                    {data[data.length - 1]?.label || data[data.length - 1]?.date}
                </Text>
            </div>
        </Surface>
    );
}

// ===== PROJECTION CHART =====

export interface ProjectionData {
    date: string;
    actual?: number;
    projected?: number;
}

interface ProjectionChartProps {
    data: ProjectionData[];
    title?: string;
    targetValue?: number;
    targetLabel?: string;
    height?: number;
    className?: string;
}

export function ProjectionChart({
    data,
    title = 'Net Worth Projection',
    targetValue,
    targetLabel = 'Target',
    height = 250,
    className,
}: ProjectionChartProps) {
    const { actualPoints, projectedPoints, minValue, maxValue } = useMemo(() => {
        const actuals = data.filter(d => d.actual !== undefined);
        const projected = data.filter(d => d.projected !== undefined);

        const allValues = [
            ...actuals.map(d => d.actual!),
            ...projected.map(d => d.projected!),
            targetValue ?? 0,
        ].filter(v => v !== undefined);

        const min = Math.min(...allValues) * 0.9;
        const max = Math.max(...allValues) * 1.1;
        const range = max - min || 1;

        const toPoints = (arr: typeof data, key: 'actual' | 'projected') =>
            arr.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((d[key]! - min) / range) * 90;
                return `${x},${y}`;
            }).join(' ');

        return {
            actualPoints: toPoints(actuals, 'actual'),
            projectedPoints: toPoints(projected, 'projected'),
            minValue: min,
            maxValue: max,
        };
    }, [data, targetValue]);

    const targetY = targetValue
        ? 100 - ((targetValue - minValue) / (maxValue - minValue || 1)) * 90
        : null;

    return (
        <Surface elevation={1} className={cn('p-6', className)}>
            <div className="flex items-start justify-between mb-4">
                <Text variant="heading-md">{title}</Text>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)]" />
                        <Text variant="body-sm" color="tertiary">Actual</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-[var(--chart-3)]" style={{ borderStyle: 'dashed' }} />
                        <Text variant="body-sm" color="tertiary">Projected</Text>
                    </div>
                </div>
            </div>

            <div style={{ height }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id="projection-actual-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Target line */}
                    {targetY && (
                        <>
                            <line
                                x1="0"
                                y1={targetY}
                                x2="100"
                                y2={targetY}
                                stroke="var(--accent-success)"
                                strokeWidth="0.3"
                                strokeDasharray="2,2"
                            />
                            <text
                                x="98"
                                y={targetY - 2}
                                textAnchor="end"
                                fontSize="3"
                                fill="var(--accent-success)"
                            >
                                {targetLabel}
                            </text>
                        </>
                    )}

                    {/* Actual line */}
                    {actualPoints && (
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                            points={actualPoints}
                            fill="none"
                            stroke="var(--accent-primary)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                        />
                    )}

                    {/* Projected line */}
                    {projectedPoints && (
                        <motion.polyline
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            points={projectedPoints}
                            fill="none"
                            stroke="var(--chart-3)"
                            strokeWidth="0.6"
                            strokeDasharray="2,2"
                        />
                    )}
                </svg>
            </div>

            {/* Timeline */}
            <div className="flex justify-between mt-2">
                <Text variant="caption" color="tertiary">{data[0]?.date}</Text>
                <Text variant="caption" color="tertiary">{data[data.length - 1]?.date}</Text>
            </div>
        </Surface>
    );
}

export default CashFlowChart;
