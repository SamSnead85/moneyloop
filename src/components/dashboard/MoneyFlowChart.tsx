'use client';

import { motion } from 'framer-motion';

// Animated Sankey-style money flow visualization
export function MoneyFlowChart() {
    const income = 8500;
    const categories = [
        { name: 'Savings', amount: 1500, color: '#10b981', percentage: 17.6 },
        { name: 'Investments', amount: 2000, color: '#6366f1', percentage: 23.5 },
        { name: 'Housing', amount: 2200, color: '#8b5cf6', percentage: 25.9 },
        { name: 'Lifestyle', amount: 1500, color: '#f59e0b', percentage: 17.6 },
        { name: 'Bills', amount: 800, color: '#ec4899', percentage: 9.4 },
        { name: 'Other', amount: 500, color: '#64748b', percentage: 5.9 },
    ];

    return (
        <div className="h-[300px] relative">
            {/* SVG Flow Visualization */}
            <svg
                className="w-full h-full"
                viewBox="0 0 600 280"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {categories.map((cat, i) => (
                        <linearGradient
                            key={cat.name}
                            id={`flow-gradient-${i}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor={cat.color} stopOpacity="0.8" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Income source on left */}
                <motion.rect
                    x="10"
                    y="90"
                    width="80"
                    height="100"
                    rx="8"
                    fill="url(#flow-gradient-0)"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                />
                <text x="50" y="145" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">
                    Income
                </text>
                <text x="50" y="165" textAnchor="middle" fill="#94a3b8" fontSize="12">
                    ${income.toLocaleString()}
                </text>

                {/* Flow paths to categories */}
                {categories.map((cat, index) => {
                    const startY = 140;
                    const endY = 30 + index * 42;
                    const endX = 510;

                    return (
                        <motion.path
                            key={cat.name}
                            d={`M 90 ${startY} C 200 ${startY} 400 ${endY} ${endX} ${endY}`}
                            fill="none"
                            stroke={`url(#flow-gradient-${index})`}
                            strokeWidth={Math.max(4, cat.percentage / 3)}
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 1, delay: index * 0.15 }}
                        />
                    );
                })}

                {/* Category labels on right */}
                {categories.map((cat, index) => {
                    const y = 30 + index * 42;
                    return (
                        <motion.g
                            key={cat.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        >
                            <rect
                                x="520"
                                y={y - 16}
                                width="70"
                                height="32"
                                rx="6"
                                fill={cat.color}
                                opacity="0.2"
                            />
                            <circle cx="530" cy={y} r="4" fill={cat.color} />
                            <text x="540" y={y + 4} fill="#f8fafc" fontSize="11" fontWeight="500">
                                {cat.name}
                            </text>
                        </motion.g>
                    );
                })}
            </svg>

            {/* Legend below */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-4 text-xs">
                {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-slate-400">{cat.name}</span>
                        <span className="text-slate-500 font-mono">${cat.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
