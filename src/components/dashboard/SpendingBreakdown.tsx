'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const categories = [
    { name: 'Housing', amount: 2200, percentage: 35, color: '#8b5cf6', icon: '🏠' },
    { name: 'Investments', amount: 2000, percentage: 32, color: '#6366f1', icon: '📈' },
    { name: 'Lifestyle', amount: 1500, percentage: 24, color: '#10b981', icon: '✨' },
    { name: 'Utilities', amount: 400, percentage: 6, color: '#f59e0b', icon: '⚡' },
    { name: 'Other', amount: 200, percentage: 3, color: '#64748b', icon: '📦' },
];

export function SpendingBreakdown() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);

    // Calculate arc paths for conic gradient effect
    const getArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
        const start = polarToCartesian(50, 50, radius, endAngle);
        const end = polarToCartesian(50, 50, radius, startAngle);
        const innerStart = polarToCartesian(50, 50, innerRadius, endAngle);
        const innerEnd = polarToCartesian(50, 50, innerRadius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            'L', innerEnd.x, innerEnd.y,
            'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
            'Z'
        ].join(' ');
    };

    const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
        const rad = (angle - 90) * Math.PI / 180;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad)
        };
    };

    let currentAngle = 0;

    return (
        <div className="space-y-6">
            {/* Enhanced animated donut chart with hover effects */}
            <div className="relative w-52 h-52 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                        {categories.map((cat, i) => (
                            <linearGradient key={i} id={`spend-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={cat.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={cat.color} stopOpacity="0.6" />
                            </linearGradient>
                        ))}
                        {/* Glow filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="10"
                    />

                    {/* Animated segments */}
                    {categories.map((cat, index) => {
                        const startAngle = currentAngle;
                        const sweepAngle = (cat.percentage / 100) * 360;
                        currentAngle += sweepAngle;
                        const isHovered = hoveredIndex === index;
                        const radius = isHovered ? 42 : 38;
                        const innerRadius = isHovered ? 30 : 28;

                        return (
                            <motion.path
                                key={cat.name}
                                d={getArcPath(startAngle, startAngle + sweepAngle - 1, radius, innerRadius)}
                                fill={`url(#spend-grad-${index})`}
                                filter={isHovered ? 'url(#glow)' : undefined}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: isHovered ? 1 : 0.85,
                                    scale: isHovered ? 1.02 : 1,
                                }}
                                transition={{ duration: 0.3 }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    })}

                    {/* Inner decorative ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="22"
                        fill="none"
                        stroke="rgba(255,255,255,0.02)"
                        strokeWidth="1"
                    />
                </svg>

                {/* Center content with animated number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.p
                        className="text-2xl font-bold font-mono"
                        key={hoveredIndex}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        ${hoveredIndex !== null
                            ? categories[hoveredIndex].amount.toLocaleString()
                            : totalSpending.toLocaleString()
                        }
                    </motion.p>
                    <p className="text-xs text-white/40">
                        {hoveredIndex !== null ? categories[hoveredIndex].name : 'Total Spent'}
                    </p>
                </div>
            </div>

            {/* Enhanced category list with hover interactions */}
            <div className="space-y-2">
                {categories.map((cat, index) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${hoveredIndex === index
                                ? 'bg-white/[0.04]'
                                : 'hover:bg-white/[0.02]'
                            }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                style={{ backgroundColor: `${cat.color}20` }}
                            >
                                {cat.icon}
                            </div>
                            <div>
                                <span className="text-sm font-medium">{cat.name}</span>
                                <div className="w-20 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-mono">
                                ${cat.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-white/30 ml-2">
                                {cat.percentage}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
