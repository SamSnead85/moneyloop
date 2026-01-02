'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
    month: string;
    value: number;
}

const netWorthHistory: DataPoint[] = [
    { month: 'Jul', value: 485000 },
    { month: 'Aug', value: 502000 },
    { month: 'Sep', value: 498000 },
    { month: 'Oct', value: 525000 },
    { month: 'Nov', value: 548000 },
    { month: 'Dec', value: 565000 },
    { month: 'Jan', value: 579670 },
];

export function NetWorthChart() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxValue = Math.max(...netWorthHistory.map(d => d.value));
    const minValue = Math.min(...netWorthHistory.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.15;

    const chartHeight = 200;
    const chartWidth = 600;
    const pointSpacing = chartWidth / (netWorthHistory.length - 1);

    // Generate smooth curve path
    const getPath = () => {
        const points = netWorthHistory.map((d, i) => {
            const x = i * pointSpacing;
            const y = chartHeight - ((d.value - minValue + padding) / (range + padding * 2)) * chartHeight;
            return { x, y };
        });

        // Create smooth bezier curve
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
            const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
            path += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
        }
        return path;
    };

    // Generate area path (for gradient fill)
    const getAreaPath = () => {
        const linePath = getPath();
        const lastPoint = netWorthHistory.length - 1;
        return `${linePath} L ${lastPoint * pointSpacing} ${chartHeight} L 0 ${chartHeight} Z`;
    };

    const currentValue = netWorthHistory[netWorthHistory.length - 1].value;
    const previousValue = netWorthHistory[netWorthHistory.length - 2].value;
    const change = currentValue - previousValue;
    const changePercent = ((change / previousValue) * 100).toFixed(1);
    const isPositive = change >= 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-white/40 mb-1">Net Worth Trend</p>
                    <p className="text-3xl font-bold font-mono">
                        ${currentValue.toLocaleString()}
                    </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isPositive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPositive ? '+' : ''}{changePercent}%
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-[220px]">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Gradient fill */}
                        <linearGradient id="networth-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>

                        {/* Line gradient */}
                        <linearGradient id="networth-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={(chartHeight / 4) * i}
                            x2={chartWidth}
                            y2={(chartHeight / 4) * i}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area fill */}
                    <motion.path
                        d={getAreaPath()}
                        fill="url(#networth-gradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />

                    {/* Main line with glow */}
                    <motion.path
                        d={getPath()}
                        fill="none"
                        stroke="url(#networth-line)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter="url(#line-glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data points */}
                    {netWorthHistory.map((d, i) => {
                        const x = i * pointSpacing;
                        const y = chartHeight - ((d.value - minValue + padding) / (range + padding * 2)) * chartHeight;
                        const isHovered = hoveredIndex === i;

                        return (
                            <g key={i}>
                                {/* Invisible hit area */}
                                <rect
                                    x={x - 30}
                                    y={0}
                                    width={60}
                                    height={chartHeight}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    style={{ cursor: 'pointer' }}
                                />

                                {/* Vertical line on hover */}
                                {isHovered && (
                                    <motion.line
                                        x1={x}
                                        y1={0}
                                        x2={x}
                                        y2={chartHeight}
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}

                                {/* Point */}
                                <motion.circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? 6 : 4}
                                    fill="#10b981"
                                    stroke="#050508"
                                    strokeWidth="2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                                />

                                {/* Tooltip */}
                                {isHovered && (
                                    <motion.g
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <rect
                                            x={x - 45}
                                            y={y - 45}
                                            width={90}
                                            height={35}
                                            rx={6}
                                            fill="rgba(0,0,0,0.9)"
                                            stroke="rgba(255,255,255,0.1)"
                                        />
                                        <text
                                            x={x}
                                            y={y - 28}
                                            textAnchor="middle"
                                            fill="#fff"
                                            fontSize="12"
                                            fontWeight="600"
                                            fontFamily="monospace"
                                        >
                                            ${d.value.toLocaleString()}
                                        </text>
                                        <text
                                            x={x}
                                            y={y - 15}
                                            textAnchor="middle"
                                            fill="#71717a"
                                            fontSize="10"
                                        >
                                            {d.month} 2025
                                        </text>
                                    </motion.g>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                    {netWorthHistory.map((d, i) => (
                        <span
                            key={i}
                            className={`text-xs transition-colors ${hoveredIndex === i ? 'text-white' : 'text-white/30'
                                }`}
                        >
                            {d.month}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
