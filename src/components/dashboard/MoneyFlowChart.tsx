'use client';

import { motion } from 'framer-motion';

// Enhanced Sankey-style money flow with income sources
export function MoneyFlowChart() {
    // Income sources (left side)
    const incomeSources = [
        { name: 'Employer', amount: 8500, color: '#10b981' },
        { name: 'Rental', amount: 2400, color: '#6366f1' },
        { name: 'Dividends', amount: 340, color: '#8b5cf6' },
        { name: 'Side Work', amount: 1250, color: '#f59e0b' },
    ];

    // Total income
    const totalIncome = incomeSources.reduce((sum, s) => sum + s.amount, 0);

    // Spending categories (right side)
    const spendCategories = [
        { name: 'Savings', amount: 2500, color: '#10b981' },
        { name: 'Investments', amount: 3000, color: '#6366f1' },
        { name: 'Housing', amount: 2400, color: '#8b5cf6' },
        { name: 'Lifestyle', amount: 2000, color: '#f59e0b' },
        { name: 'Bills', amount: 1200, color: '#ec4899' },
        { name: 'Other', amount: 1390, color: '#64748b' },
    ];

    return (
        <div className="h-[320px] relative">
            <svg
                className="w-full h-full"
                viewBox="0 0 700 300"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Income gradients */}
                    {incomeSources.map((src, i) => (
                        <linearGradient
                            key={`income-${i}`}
                            id={`income-gradient-${i}`}
                            x1="0%" y1="0%" x2="100%" y2="0%"
                        >
                            <stop offset="0%" stopColor={src.color} stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0.3" />
                        </linearGradient>
                    ))}
                    {/* Spend gradients */}
                    {spendCategories.map((cat, i) => (
                        <linearGradient
                            key={`spend-${i}`}
                            id={`spend-gradient-${i}`}
                            x1="0%" y1="0%" x2="100%" y2="0%"
                        >
                            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor={cat.color} stopOpacity="0.7" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Income Sources (left) */}
                {incomeSources.map((src, index) => {
                    const y = 50 + index * 55;
                    const height = Math.max(12, (src.amount / totalIncome) * 80);
                    return (
                        <motion.g
                            key={src.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Source label */}
                            <text x="10" y={y + 5} fill="#71717a" fontSize="11" fontWeight="500">
                                {src.name}
                            </text>
                            <text x="10" y={y + 20} fill={src.color} fontSize="10" fontFamily="monospace">
                                ${src.amount.toLocaleString()}
                            </text>

                            {/* Flow from source to center */}
                            <motion.path
                                d={`M 90 ${y + 10} C 180 ${y + 10} 250 150 300 150`}
                                fill="none"
                                stroke={`url(#income-gradient-${index})`}
                                strokeWidth={height / 4}
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.5 }}
                                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            />
                        </motion.g>
                    );
                })}

                {/* Central Income Hub */}
                <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <rect
                        x="285"
                        y="110"
                        width="130"
                        height="80"
                        rx="12"
                        fill="rgba(255,255,255,0.05)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                    <text x="350" y="145" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600">
                        Total Income
                    </text>
                    <text x="350" y="170" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="700" fontFamily="monospace">
                        ${totalIncome.toLocaleString()}
                    </text>
                </motion.g>

                {/* Spend Categories (right) */}
                {spendCategories.map((cat, index) => {
                    const y = 30 + index * 42;
                    const height = Math.max(8, (cat.amount / totalIncome) * 60);
                    return (
                        <motion.g
                            key={cat.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        >
                            {/* Flow from center to category */}
                            <motion.path
                                d={`M 415 150 C 470 150 520 ${y} 570 ${y}`}
                                fill="none"
                                stroke={`url(#spend-gradient-${index})`}
                                strokeWidth={height / 3}
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.5 }}
                                transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                            />

                            {/* Category pill */}
                            <rect
                                x="575"
                                y={y - 12}
                                width="115"
                                height="24"
                                rx="6"
                                fill={cat.color}
                                opacity="0.15"
                            />
                            <circle cx="585" cy={y} r="4" fill={cat.color} />
                            <text x="595" y={y + 4} fill="#fafafa" fontSize="10" fontWeight="500">
                                {cat.name}
                            </text>
                            <text x="680" y={y + 4} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                                ${cat.amount.toLocaleString()}
                            </text>
                        </motion.g>
                    );
                })}
            </svg>
        </div>
    );
}
