'use client';

/**
 * Advanced Financial Charts Component
 * 
 * Rich data visualizations for financial data including
 * net worth trends, spending analysis, and investment performance.
 * 
 * Super-Sprint 20: Phases 1951-1975
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export interface ChartDataPoint {
    label: string;
    value: number;
    date?: Date;
    color?: string;
}

export interface TimeSeriesPoint {
    date: Date;
    value: number;
    label?: string;
}

// Sparkline Chart
interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    showDots?: boolean;
}

export function Sparkline({
    data,
    width = 120,
    height = 40,
    color = '#10b981',
    showDots = false,
}: SparklineProps) {
    if (data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((value - min) / range) * height,
    }));

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {showDots && points.map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={2}
                    fill={color}
                />
            ))}
        </svg>
    );
}

// Donut Chart
interface DonutChartProps {
    data: ChartDataPoint[];
    size?: number;
    thickness?: number;
    showLabels?: boolean;
    centerLabel?: string;
    centerValue?: string;
}

export function DonutChart({
    data,
    size = 200,
    thickness = 30,
    showLabels = true,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = -90; // Start from top

    const segments = data.map((item, i) => {
        const percent = total > 0 ? item.value / total : 0;
        const angle = percent * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        const x1 = size / 2 + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = size / 2 + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = size / 2 + radius * Math.cos(((startAngle + angle) * Math.PI) / 180);
        const y2 = size / 2 + radius * Math.sin(((startAngle + angle) * Math.PI) / 180);

        const largeArc = angle > 180 ? 1 : 0;

        const pathD = `
      M ${size / 2} ${size / 2}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      Z
    `;

        return {
            ...item,
            pathD,
            percent,
            color: item.color || getDefaultColor(i),
        };
    });

    return (
        <div className="relative inline-block">
            <svg width={size} height={size}>
                {segments.map((seg, i) => (
                    <motion.path
                        key={i}
                        d={seg.pathD}
                        fill={seg.color}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                ))}
                {/* Center hole */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius - thickness}
                    fill="var(--surface-base)"
                />
            </svg>

            {/* Center content */}
            {(centerLabel || centerValue) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {centerValue && (
                        <span className="text-2xl font-bold text-[var(--text-primary)]">
                            {centerValue}
                        </span>
                    )}
                    {centerLabel && (
                        <span className="text-xs text-[var(--text-tertiary)]">
                            {centerLabel}
                        </span>
                    )}
                </div>
            )}

            {/* Legend */}
            {showLabels && (
                <div className="mt-4 space-y-1">
                    {segments.map((seg, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="text-[var(--text-secondary)]">{seg.label}</span>
                            <span className="text-[var(--text-tertiary)] ml-auto">
                                {(seg.percent * 100).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Bar Chart
interface BarChartProps {
    data: ChartDataPoint[];
    height?: number;
    showValues?: boolean;
    horizontal?: boolean;
    animated?: boolean;
}

export function BarChart({
    data,
    height = 200,
    showValues = true,
    horizontal = false,
    animated = true,
}: BarChartProps) {
    const max = Math.max(...data.map(d => d.value));

    if (horizontal) {
        return (
            <div className="space-y-3">
                {data.map((item, i) => {
                    const percent = max > 0 ? (item.value / max) * 100 : 0;
                    const color = item.color || getDefaultColor(i);

                    return (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-[var(--text-secondary)]">{item.label}</span>
                                {showValues && (
                                    <span className="text-[var(--text-primary)] font-medium">
                                        ${item.value.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="h-3 bg-[var(--surface-tertiary)] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                    initial={animated ? { width: 0 } : { width: `${percent}%` }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex items-end gap-2" style={{ height }}>
            {data.map((item, i) => {
                const percent = max > 0 ? (item.value / max) * 100 : 0;
                const color = item.color || getDefaultColor(i);

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                            className="w-full rounded-t-md"
                            style={{ backgroundColor: color }}
                            initial={animated ? { height: 0 } : { height: `${percent}%` }}
                            animate={{ height: `${percent}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                        <span className="text-xs text-[var(--text-tertiary)] truncate max-w-full">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// Area Chart
interface AreaChartProps {
    data: TimeSeriesPoint[];
    width?: number;
    height?: number;
    color?: string;
    showGrid?: boolean;
    showTooltip?: boolean;
}

export function AreaChart({
    data,
    width = 400,
    height = 200,
    color = '#10b981',
    showGrid = true,
}: AreaChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const { points, pathD, areaD, minValue, maxValue } = useMemo(() => {
        if (data.length === 0) return { points: [], pathD: '', areaD: '', minValue: 0, maxValue: 0 };

        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        const padding = 20;

        const points = data.map((d, i) => ({
            x: padding + (i / (data.length - 1)) * (width - padding * 2),
            y: padding + (1 - (d.value - minValue) / range) * (height - padding * 2),
            value: d.value,
            date: d.date,
        }));

        const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${height - padding} L ${padding} ${height - padding} Z`;

        return { points, pathD, areaD, minValue, maxValue };
    }, [data, width, height]);

    if (data.length === 0) return null;

    return (
        <svg
            width={width}
            height={height}
            className="overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
        >
            {/* Grid lines */}
            {showGrid && (
                <g className="text-[var(--border-primary)]">
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                        <line
                            key={pct}
                            x1={20}
                            y1={20 + (1 - pct) * (height - 40)}
                            x2={width - 20}
                            y2={20 + (1 - pct) * (height - 40)}
                            stroke="currentColor"
                            strokeOpacity={0.2}
                            strokeDasharray="4"
                        />
                    ))}
                </g>
            )}

            {/* Area fill */}
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
            </defs>
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Line */}
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Hover areas */}
            {points.map((p, i) => (
                <rect
                    key={i}
                    x={p.x - (width - 40) / data.length / 2}
                    y={0}
                    width={(width - 40) / data.length}
                    height={height}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                />
            ))}

            {/* Hover indicator */}
            {hoveredIndex !== null && points[hoveredIndex] && (
                <g>
                    <line
                        x1={points[hoveredIndex].x}
                        y1={20}
                        x2={points[hoveredIndex].x}
                        y2={height - 20}
                        stroke={color}
                        strokeOpacity={0.5}
                        strokeDasharray="4"
                    />
                    <circle
                        cx={points[hoveredIndex].x}
                        cy={points[hoveredIndex].y}
                        r={5}
                        fill={color}
                        stroke="white"
                        strokeWidth={2}
                    />
                    <g transform={`translate(${points[hoveredIndex].x - 40}, ${points[hoveredIndex].y - 35})`}>
                        <rect
                            width={80}
                            height={26}
                            rx={4}
                            fill="var(--surface-base)"
                            stroke="var(--border-primary)"
                        />
                        <text
                            x={40}
                            y={17}
                            textAnchor="middle"
                            className="text-xs fill-[var(--text-primary)]"
                        >
                            ${points[hoveredIndex].value.toLocaleString()}
                        </text>
                    </g>
                </g>
            )}

            {/* Y-axis labels */}
            <text x={5} y={25} className="text-xs fill-[var(--text-tertiary)]">
                ${maxValue.toLocaleString()}
            </text>
            <text x={5} y={height - 10} className="text-xs fill-[var(--text-tertiary)]">
                ${minValue.toLocaleString()}
            </text>
        </svg>
    );
}

// Trend indicator
interface TrendIndicatorProps {
    value: number;
    previousValue: number;
    showPercent?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function TrendIndicator({
    value,
    previousValue,
    showPercent = true,
    size = 'md',
}: TrendIndicatorProps) {
    const change = value - previousValue;
    const percentChange = previousValue !== 0 ? (change / Math.abs(previousValue)) * 100 : 0;
    const isPositive = change >= 0;

    const sizeClasses = {
        sm: 'text-xs gap-0.5',
        md: 'text-sm gap-1',
        lg: 'text-base gap-1.5',
    };

    return (
        <div className={`flex items-center ${sizeClasses[size]} ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            {showPercent && (
                <span className="font-medium">
                    {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                </span>
            )}
        </div>
    );
}

// Helper function for default colors
function getDefaultColor(index: number): string {
    const colors = [
        '#10b981', // Emerald
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#84cc16', // Lime
    ];
    return colors[index % colors.length];
}

export default {
    Sparkline,
    DonutChart,
    BarChart,
    AreaChart,
    TrendIndicator,
};
