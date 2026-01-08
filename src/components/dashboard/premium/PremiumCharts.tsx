'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Surface, Text } from '@/components/primitives';

// ===== CHART THEME =====
// Consistent styling for all charts

export const chartTheme = {
    colors: {
        primary: 'var(--chart-1)',
        secondary: 'var(--chart-2)',
        tertiary: 'var(--chart-3)',
        quaternary: 'var(--chart-4)',
        series: [
            'var(--chart-1)',
            'var(--chart-2)',
            'var(--chart-3)',
            'var(--chart-4)',
            'var(--chart-5)',
            'var(--chart-6)',
            'var(--chart-7)',
            'var(--chart-8)',
        ],
    },
    grid: {
        stroke: 'var(--border-subtle)',
        strokeWidth: 1,
    },
    axis: {
        stroke: 'var(--border-default)',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        tickColor: 'var(--text-quaternary)',
    },
    tooltip: {
        background: 'var(--surface-elevated-2)',
        border: 'var(--border-default)',
        text: 'var(--text-primary)',
        shadow: 'var(--shadow-lg)',
    },
};

// ===== SPARKLINE =====
// Compact line chart for metrics

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    showArea?: boolean;
    className?: string;
}

export function Sparkline({
    data,
    width = 100,
    height = 32,
    color = 'var(--accent-primary)',
    showArea = true,
    className = '',
}: SparklineProps) {
    const { path, areaPath } = useMemo(() => {
        if (!data.length) return { path: '', areaPath: '' };

        const padding = 2;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((value, i) => {
            const x = padding + (i / (data.length - 1)) * (width - padding * 2);
            const y = padding + (1 - (value - min) / range) * (height - padding * 2);
            return { x, y };
        });

        const linePath = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        const area = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

        return { path: linePath, areaPath: area };
    }, [data, width, height]);

    if (!data.length) return null;

    return (
        <svg width={width} height={height} className={className}>
            <defs>
                <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {showArea && (
                <motion.path
                    d={areaPath}
                    fill={`url(#sparkline-gradient-${color})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            )}

            <motion.path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </svg>
    );
}

// ===== MINI BAR CHART =====
// Compact bar visualization

interface MiniBarChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    height?: number;
    showLabels?: boolean;
    className?: string;
}

export function MiniBarChart({
    data,
    height = 60,
    showLabels = false,
    className = '',
}: MiniBarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className={`flex items-end gap-1 ${className}`} style={{ height }}>
            {data.map((item, i) => {
                const barHeight = (item.value / maxValue) * height;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                            className="w-full rounded-t-sm"
                            style={{
                                backgroundColor: item.color || chartTheme.colors.series[i % chartTheme.colors.series.length],
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: barHeight }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                        {showLabels && (
                            <Text variant="body-sm" color="tertiary" className="text-center truncate w-full">
                                {item.label}
                            </Text>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ===== DONUT CHART =====
// Category breakdown visualization

interface DonutChartProps {
    data: Array<{ label: string; value: number; color: string }>;
    size?: number;
    thickness?: number;
    showLegend?: boolean;
    centerLabel?: string;
    centerValue?: string;
    className?: string;
}

export function DonutChart({
    data,
    size = 160,
    thickness = 20,
    showLegend = true,
    centerLabel,
    centerValue,
    className = '',
}: DonutChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativeOffset = 0;

    return (
        <div className={`flex items-center gap-6 ${className}`}>
            {/* Chart */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--surface-elevated-2)"
                        strokeWidth={thickness}
                    />

                    {/* Segments */}
                    {data.map((segment, i) => {
                        const percentage = segment.value / total;
                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativeOffset * circumference;
                        cumulativeOffset += percentage;

                        return (
                            <motion.circle
                                key={i}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={thickness}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        );
                    })}
                </svg>

                {/* Center label */}
                {(centerLabel || centerValue) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {centerValue && (
                            <Text variant="mono-lg">{centerValue}</Text>
                        )}
                        {centerLabel && (
                            <Text variant="body-sm" color="tertiary">{centerLabel}</Text>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="flex-1 space-y-2">
                    {data.map((item, i) => (
                        <motion.div
                            key={i}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                        >
                            <div
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <Text variant="body-sm" color="secondary" className="flex-1 truncate">
                                {item.label}
                            </Text>
                            <Text variant="mono-sm" color="tertiary">
                                {Math.round((item.value / total) * 100)}%
                            </Text>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===== AREA CHART =====
// Time series with gradient fill

interface AreaChartProps {
    data: Array<{ date: string; value: number }>;
    height?: number;
    color?: string;
    showGrid?: boolean;
    showLabels?: boolean;
    className?: string;
}

export function AreaChart({
    data,
    height = 200,
    color = 'var(--accent-primary)',
    showGrid = true,
    showLabels = true,
    className = '',
}: AreaChartProps) {
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };

    const { path, areaPath, points, minValue, maxValue } = useMemo(() => {
        if (!data.length) return { path: '', areaPath: '', points: [], minValue: 0, maxValue: 0 };

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const chartWidth = 600 - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const pts = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartWidth,
            y: padding.top + (1 - (d.value - min) / range) * chartHeight,
            value: d.value,
            date: d.date,
        }));

        const linePath = pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        const area = `${linePath} L ${pts[pts.length - 1].x} ${height - padding.bottom} L ${pts[0].x} ${height - padding.bottom} Z`;

        return { path: linePath, areaPath: area, points: pts, minValue: min, maxValue: max };
    }, [data, height, padding]);

    if (!data.length) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <Text variant="body-sm" color="tertiary">No data available</Text>
            </div>
        );
    }

    const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <svg
            viewBox={`0 0 600 ${height}`}
            className={`w-full ${className}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {showGrid && (
                <g>
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const y = padding.top + ratio * (height - padding.top - padding.bottom);
                        return (
                            <line
                                key={ratio}
                                x1={padding.left}
                                y1={y}
                                x2={600 - padding.right}
                                y2={y}
                                stroke="var(--border-subtle)"
                                strokeWidth="1"
                            />
                        );
                    })}
                </g>
            )}

            {/* Y-axis labels */}
            {showLabels && (
                <g>
                    {[0, 0.5, 1].map(ratio => {
                        const value = maxValue - ratio * (maxValue - minValue);
                        const y = padding.top + ratio * (height - padding.top - padding.bottom);
                        return (
                            <text
                                key={ratio}
                                x={padding.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                fill="var(--text-quaternary)"
                                fontSize="11"
                                fontFamily="var(--font-mono)"
                            >
                                ${Math.round(value / 1000)}k
                            </text>
                        );
                    })}
                </g>
            )}

            {/* X-axis labels */}
            {showLabels && (
                <g>
                    {[0, Math.floor(data.length / 2), data.length - 1].map(i => {
                        const point = points[i];
                        if (!point) return null;
                        return (
                            <text
                                key={i}
                                x={point.x}
                                y={height - 10}
                                textAnchor="middle"
                                fill="var(--text-quaternary)"
                                fontSize="11"
                            >
                                {data[i].date}
                            </text>
                        );
                    })}
                </g>
            )}

            {/* Area fill */}
            <motion.path
                d={areaPath}
                fill={`url(#${gradientId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Line */}
            <motion.path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* End point */}
            {points.length > 0 && (
                <motion.circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={5}
                    fill="var(--surface-base)"
                    stroke={color}
                    strokeWidth={2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 }}
                />
            )}
        </svg>
    );
}

export default {
    chartTheme,
    Sparkline,
    MiniBarChart,
    DonutChart,
    AreaChart,
};
