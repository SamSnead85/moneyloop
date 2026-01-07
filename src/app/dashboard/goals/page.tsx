'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    TrendingUp,
    PiggyBank,
    Home,
    Plane,
    Car,
    GraduationCap,
    Sparkles,
    Plus,
    ChevronRight,
    Calendar,
    DollarSign,
    ArrowRight,
    CheckCircle2,
    Clock,
    Zap,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

// Goal data
const goals = [
    {
        id: 1,
        name: 'Emergency Fund',
        icon: PiggyBank,
        target: 25000,
        current: 18750,
        deadline: 'Jun 2026',
        color: 'emerald',
        monthlyContribution: 850,
        status: 'on-track',
        linkedAccount: 'High-Yield Savings',
    },
    {
        id: 2,
        name: 'Home Down Payment',
        icon: Home,
        target: 80000,
        current: 32000,
        deadline: 'Dec 2027',
        color: 'blue',
        monthlyContribution: 2000,
        status: 'on-track',
        linkedAccount: 'Investment Account',
    },
    {
        id: 3,
        name: 'Vacation Fund',
        icon: Plane,
        target: 5000,
        current: 4200,
        deadline: 'Mar 2026',
        color: 'purple',
        monthlyContribution: 400,
        status: 'ahead',
        linkedAccount: 'Vacation Savings',
    },
    {
        id: 4,
        name: 'New Car',
        icon: Car,
        target: 35000,
        current: 8500,
        deadline: 'Jan 2028',
        color: 'amber',
        monthlyContribution: 750,
        status: 'behind',
        linkedAccount: 'Car Fund',
    },
    {
        id: 5,
        name: 'Education Fund',
        icon: GraduationCap,
        target: 50000,
        current: 12000,
        deadline: 'Sep 2030',
        color: 'indigo',
        monthlyContribution: 500,
        status: 'on-track',
        linkedAccount: '529 Plan',
    },
];

const aiRecommendations = [
    {
        title: 'Boost Your Emergency Fund',
        description: 'You have $2,400 excess in checking. Move to emergency fund to hit goal 2 months earlier.',
        impact: '+$2,400',
        action: 'Transfer Now',
    },
    {
        title: 'Round-Up Savings Available',
        description: 'Enable round-ups on your card. Based on spending, you could save $127/month automatically.',
        impact: '+$1,524/yr',
        action: 'Enable',
    },
];

export default function GoalsPage() {
    const [showNewGoal, setShowNewGoal] = useState(false);

    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.current, 0);
    const overallProgress = (totalCurrent / totalTarget) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Financial Goals</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your progress and build wealth</p>
                </div>
                <Button onClick={() => setShowNewGoal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Goal
                </Button>
            </div>

            {/* Overall Progress */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-slate-500 text-sm">Total Goals Progress</p>
                        <p className="text-2xl font-semibold mt-1">
                            ${totalCurrent.toLocaleString()} <span className="text-slate-500 text-lg font-normal">/ ${totalTarget.toLocaleString()}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-400">{overallProgress.toFixed(0)}%</p>
                        <p className="text-slate-500 text-sm">Complete</p>
                    </div>
                </div>
                <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>5 active goals</span>
                    <span>${(totalTarget - totalCurrent).toLocaleString()} remaining</span>
                </div>
            </Card>

            {/* AI Recommendations */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-medium text-slate-300">AI Recommendations</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {aiRecommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-4 border-amber-500/20 bg-amber-500/[0.02]">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm">{rec.title}</h3>
                                        <p className="text-slate-500 text-xs mt-1">{rec.description}</p>
                                    </div>
                                    <span className="text-emerald-400 font-semibold text-sm">{rec.impact}</span>
                                </div>
                                <button className="mt-3 text-amber-400 text-xs font-medium flex items-center gap-1 hover:text-amber-300 transition-colors">
                                    {rec.action} <ArrowRight className="w-3 h-3" />
                                </button>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal, i) => {
                    const progress = (goal.current / goal.target) * 100;
                    const Icon = goal.icon;
                    const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
                        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
                        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/30' },
                        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/30' },
                        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/30' },
                        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'ring-indigo-500/30' },
                    };
                    const colors = colorClasses[goal.color] || colorClasses.emerald;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="p-5 hover:border-white/[0.08] transition-colors cursor-pointer group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${colors.bg} ring-1 ${colors.ring}`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {goal.status === 'ahead' && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <TrendingUp className="w-3 h-3" /> Ahead
                                            </span>
                                        )}
                                        {goal.status === 'behind' && (
                                            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                <Clock className="w-3 h-3" /> Behind
                                            </span>
                                        )}
                                        {goal.status === 'on-track' && (
                                            <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> On Track
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-medium mb-1">{goal.name}</h3>
                                <p className="text-slate-500 text-xs mb-4">Target: {goal.deadline}</p>

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold">${goal.current.toLocaleString()}</span>
                                        <span className="text-slate-500">${goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className={`h-full rounded-full ${goal.color === 'emerald' ? 'bg-emerald-500' :
                                                goal.color === 'blue' ? 'bg-blue-500' :
                                                    goal.color === 'purple' ? 'bg-purple-500' :
                                                        goal.color === 'amber' ? 'bg-amber-500' :
                                                            'bg-indigo-500'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/[0.04]">
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        ${goal.monthlyContribution}/mo
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {goal.deadline}
                                    </span>
                                </div>

                                {/* Hover action */}
                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                        Manage Goal <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}

                {/* Add Goal Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: goals.length * 0.05 }}
                >
                    <div
                        className="p-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] hover:border-[#7dd3a8]/30 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[240px] group"
                        onClick={() => setShowNewGoal(true)}
                    >
                        <div className="p-3 rounded-full bg-[#7dd3a8]/10 group-hover:bg-[#7dd3a8]/20 transition-colors mb-3">
                            <Plus className="w-6 h-6 text-[#7dd3a8]" />
                        </div>
                        <p className="font-medium text-slate-300 group-hover:text-white transition-colors">Create New Goal</p>
                        <p className="text-xs text-slate-500 mt-1">Set a target and track your progress</p>
                    </div>
                </motion.div>
            </div>

            {/* Quick Tips */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-medium text-sm">Quick Tips</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-sm">
                        <p className="text-slate-300 font-medium">Automate Savings</p>
                        <p className="text-slate-500 text-xs mt-1">Set up automatic transfers to reach goals faster</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-slate-300 font-medium">Prioritize High-Interest</p>
                        <p className="text-slate-500 text-xs mt-1">Focus on emergency fund first, then investments</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-slate-300 font-medium">Review Monthly</p>
                        <p className="text-slate-500 text-xs mt-1">Adjust contributions based on income changes</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
