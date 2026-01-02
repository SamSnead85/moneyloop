'use client';

import { motion } from 'framer-motion';

const categories = [
    { name: 'Housing', amount: 2200, percentage: 35, color: '#8b5cf6' },
    { name: 'Investments', amount: 2000, percentage: 32, color: '#6366f1' },
    { name: 'Lifestyle', amount: 1500, percentage: 24, color: '#f59e0b' },
    { name: 'Utilities', amount: 400, percentage: 6, color: '#ec4899' },
    { name: 'Other', amount: 200, percentage: 3, color: '#64748b' },
];

export function SpendingBreakdown() {
    const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);

    return (
        <div className="space-y-6">
            {/* Animated donut chart */}
            <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {categories.map((cat, index) => {
                        const previousPercentages = categories
                            .slice(0, index)
                            .reduce((sum, c) => sum + c.percentage, 0);
                        const circumference = 2 * Math.PI * 35;
                        const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -(previousPercentages / 100) * circumference;

                        return (
                            <motion.circle
                                key={cat.name}
                                cx="50"
                                cy="50"
                                r="35"
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="12"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                initial={{ opacity: 0, pathLength: 0 }}
                                animate={{ opacity: 1, pathLength: 1 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                        );
                    })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold font-mono">
                        ${totalSpending.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total Spent</p>
                </div>
            </div>

            {/* Category list */}
            <div className="space-y-3">
                {categories.map((cat, index) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-slate-400">
                                ${cat.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 w-8 text-right">
                                {cat.percentage}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
