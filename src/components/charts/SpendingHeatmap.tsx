'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
    date: string;
    value: number;
}

interface SpendingHeatmapProps {
    data: HeatmapData[];
    year?: number;
    className?: string;
}

// Color scale from low to high spending
const getColor = (value: number, max: number): string => {
    if (value === 0) return 'rgba(255, 255, 255, 0.05)';
    const intensity = Math.min(value / max, 1);

    if (intensity < 0.25) return 'rgba(125, 211, 168, 0.3)';
    if (intensity < 0.5) return 'rgba(125, 211, 168, 0.5)';
    if (intensity < 0.75) return 'rgba(251, 191, 36, 0.6)';
    return 'rgba(244, 63, 94, 0.7)';
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function SpendingHeatmap({ data, year = new Date().getFullYear(), className = '' }: SpendingHeatmapProps) {
    // Process data into a grid
    const { grid, maxValue, monthPositions } = useMemo(() => {
        // Create a map of date -> value
        const valueMap = new Map<string, number>();
        data.forEach(d => valueMap.set(d.date, d.value));

        // Find max value for scaling
        const max = Math.max(...data.map(d => d.value), 1);

        // Generate grid for the year
        const weeks: { date: Date; value: number }[][] = [];
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        let currentDate = new Date(startDate);
        let currentWeek: { date: Date; value: number }[] = [];

        // Pad first week with empty days
        for (let i = 0; i < currentDate.getDay(); i++) {
            currentWeek.push({ date: new Date(0), value: -1 });
        }

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            currentWeek.push({
                date: new Date(currentDate),
                value: valueMap.get(dateStr) ?? 0,
            });

            if (currentDate.getDay() === 6) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        // Calculate month label positions
        const monthPos: { month: string; x: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, weekIdx) => {
            week.forEach(day => {
                if (day.value >= 0) {
                    const month = day.date.getMonth();
                    if (month !== lastMonth) {
                        monthPos.push({ month: MONTHS[month], x: weekIdx });
                        lastMonth = month;
                    }
                }
            });
        });

        return { grid: weeks, maxValue: max, monthPositions: monthPos };
    }, [data, year]);

    const cellSize = 12;
    const cellGap = 3;
    const width = grid.length * (cellSize + cellGap) + 40;
    const height = 7 * (cellSize + cellGap) + 40;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className={`overflow-x-auto ${className}`}>
            <svg width={width} height={height} className="min-w-full">
                {/* Day labels */}
                {DAYS.map((day, i) => (
                    <text
                        key={day}
                        x={10}
                        y={30 + i * (cellSize + cellGap) + cellSize / 2}
                        fontSize={9}
                        fill="rgba(255,255,255,0.4)"
                        dominantBaseline="middle"
                    >
                        {i % 2 === 1 ? day.slice(0, 1) : ''}
                    </text>
                ))}

                {/* Month labels */}
                {monthPositions.map((mp) => (
                    <text
                        key={mp.month + mp.x}
                        x={40 + mp.x * (cellSize + cellGap)}
                        y={15}
                        fontSize={10}
                        fill="rgba(255,255,255,0.5)"
                    >
                        {mp.month}
                    </text>
                ))}

                {/* Heatmap cells */}
                {grid.map((week, weekIdx) =>
                    week.map((day, dayIdx) => {
                        if (day.value < 0) return null;
                        return (
                            <motion.rect
                                key={`${weekIdx}-${dayIdx}`}
                                x={40 + weekIdx * (cellSize + cellGap)}
                                y={25 + dayIdx * (cellSize + cellGap)}
                                width={cellSize}
                                height={cellSize}
                                rx={2}
                                fill={getColor(day.value, maxValue)}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: weekIdx * 0.01 }}
                                className="hover:stroke-white/50 hover:stroke-1 cursor-pointer"
                            >
                                <title>
                                    {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {day.value > 0 ? `: ${formatCurrency(day.value)}` : ': No spending'}
                                </title>
                            </motion.rect>
                        );
                    })
                )}
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 px-4">
                <span className="text-xs text-white/40">Less</span>
                <div className="flex gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: getColor(i * maxValue, maxValue) }}
                        />
                    ))}
                </div>
                <span className="text-xs text-white/40">More</span>
            </div>
        </div>
    );
}

export default SpendingHeatmap;
