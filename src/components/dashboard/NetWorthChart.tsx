'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';

interface NetWorthData {
    date: string;
    value: number;
}

interface NetWorthChartProps {
    data?: NetWorthData[];
    currentNetWorth?: number;
    previousNetWorth?: number;
}

// Generate sample data if none provided
const generateSampleData = (): NetWorthData[] => {
    const data: NetWorthData[] = [];
    let value = 580000;

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        value += (Math.random() - 0.3) * 15000; // Trend upward
        data.push({
            date: date.toISOString(),
            value: Math.max(value, 400000), // Floor at 400k
        });
    }

    return data;
};

export function NetWorthChart({
    data,
    currentNetWorth = 628010.77,
    previousNetWorth = 605432.21
}: NetWorthChartProps) {
    const chartData = data || generateSampleData();

    const { minValue, maxValue, change, changePercent, isPositive } = useMemo(() => {
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const diff = currentNetWorth - previousNetWorth;
        const pct = previousNetWorth > 0 ? (diff / previousNetWorth) * 100 : 0;

        return {
            minValue: min,
            maxValue: max,
            change: diff,
            changePercent: pct,
            isPositive: diff >= 0,
        };
    }, [chartData, currentNetWorth, previousNetWorth]);

    // Calculate SVG path for the chart
    const pathData = useMemo(() => {
        if (chartData.length < 2) return '';

        const width = 100;
        const height = 100;
        const padding = 5;
        const range = maxValue - minValue || 1;

        const points = chartData.map((d, i) => {
            const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    }, [chartData, minValue, maxValue]);

    // Area fill path
    const areaPath = useMemo(() => {
        if (chartData.length < 2) return '';

        const width = 100;
        const height = 100;
        const padding = 5;
        const range = maxValue - minValue || 1;

        const points = chartData.map((d, i) => {
            const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
            return `${x},${y}`;
        });

        return `M ${padding},${height - padding} L ${points.join(' L ')} L ${100 - padding},${height - padding} Z`;
    }, [chartData, minValue, maxValue]);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Net Worth</h2>
                    <p className="text-xs text-slate-500">Total across all accounts</p>
                </div>
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 outline-none">
                    <option>12 Months</option>
                    <option>6 Months</option>
                    <option>3 Months</option>
                    <option>All Time</option>
                </select>
            </div>

            {/* Current Value */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2"
                >
                    <span className="text-4xl font-bold font-mono">
                        ${currentNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </motion.div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${isPositive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4" />
                    )}
                    {isPositive ? '+' : ''}${Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    <span className="text-xs opacity-60">
                        ({isPositive ? '+' : ''}{changePercent.toFixed(1)}%)
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-48">
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <g className="text-slate-800">
                        {[0.25, 0.5, 0.75].map((pos) => (
                            <line
                                key={pos}
                                x1="0"
                                y1={pos * 100}
                                x2="100"
                                y2={pos * 100}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                strokeDasharray="2,2"
                            />
                        ))}
                    </g>

                    {/* Area Fill */}
                    <motion.path
                        d={areaPath}
                        fill="url(#netWorthGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Line */}
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke={isPositive ? '#10b981' : '#ef4444'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />

                    {/* End Point */}
                    <motion.circle
                        cx={95}
                        cy={(() => {
                            const range = maxValue - minValue || 1;
                            const lastValue = chartData[chartData.length - 1]?.value || 0;
                            return 100 - 5 - ((lastValue - minValue) / range) * 90;
                        })()}
                        r="3"
                        fill={isPositive ? '#10b981' : '#ef4444'}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, duration: 0.3 }}
                    />
                </svg>

                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-600 font-mono">
                    <span>${(maxValue / 1000).toFixed(0)}K</span>
                    <span>${((maxValue + minValue) / 2 / 1000).toFixed(0)}K</span>
                    <span>${(minValue / 1000).toFixed(0)}K</span>
                </div>
            </div>

            {/* X-axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                {chartData.filter((_, i) => i % 3 === 0 || i === chartData.length - 1).map((d, i) => (
                    <span key={i}>
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default NetWorthChart;
