'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Coffee,
    ShoppingBag,
    ChevronRight,
    X,
    MessageSquare,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface AIInsight {
    id: string;
    type: 'savings' | 'pattern' | 'goal' | 'tip';
    title: string;
    message: string;
    impact?: string;
    trend?: 'up' | 'down';
}

const mockInsights: AIInsight[] = [
    {
        id: '1',
        type: 'pattern',
        title: 'Restaurant spending up 45%',
        message: 'Your dining out expenses increased this quarter compared to last.',
        impact: '+$890/quarter',
        trend: 'up',
    },
    {
        id: '2',
        type: 'goal',
        title: '75% to vacation goal!',
        message: 'Just $500 more to reach your target. Keep it up!',
        trend: 'up',
    },
    {
        id: '3',
        type: 'savings',
        title: 'Subscription optimization',
        message: 'You\'re spending $127/month (65% more than similar users).',
        impact: '$76 potential savings',
    },
    {
        id: '4',
        type: 'tip',
        title: 'Coffee spending insight',
        message: 'You spend $37/week on coffee. Brewing 3 days saves $1,000/year.',
        impact: '$1,000/year',
    },
];

const typeConfig = {
    savings: {
        icon: DollarSign,
        bg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-400',
    },
    pattern: {
        icon: TrendingUp,
        bg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
    },
    goal: {
        icon: TrendingUp,
        bg: 'bg-purple-500/10',
        iconColor: 'text-purple-400',
    },
    tip: {
        icon: Coffee,
        bg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
    },
};

export function AIInsightsWidget() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const insights = mockInsights;
    const currentInsight = insights[currentIndex];
    const config = typeConfig[currentInsight.type];
    const Icon = config.icon;

    const nextInsight = () => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
    };

    return (
        <Card padding="lg" hover={false}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <motion.div
                            className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <h3 className="font-semibold">AI Insights</h3>
                </div>
                <div className="flex items-center gap-1">
                    {insights.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-emerald-400 w-3' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <motion.div
                key={currentInsight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-4 rounded-xl ${config.bg} cursor-pointer`}
                onClick={nextInsight}
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                        <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{currentInsight.title}</span>
                            {currentInsight.trend && (
                                currentInsight.trend === 'up'
                                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    : <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                        </div>
                        <p className="text-xs text-slate-400">{currentInsight.message}</p>
                        {currentInsight.impact && (
                            <span className="inline-block mt-2 text-xs font-medium text-emerald-400">
                                {currentInsight.impact}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Ask AI Button */}
            <button
                onClick={() => window.location.href = '/dashboard/insights'}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-sm text-slate-400 hover:text-white border border-white/[0.06] rounded-xl hover:bg-white/[0.02] transition-all"
            >
                <MessageSquare className="w-4 h-4" />
                Ask AI About Your Finances
            </button>
        </Card>
    );
}
