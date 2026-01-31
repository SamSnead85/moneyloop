'use client';

import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    DollarSign,
    Shield,
    Zap,
    ChevronRight,
    Star,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface EliteWelcomeStepProps {
    onNext: () => void;
}

// Feature card data
const features = [
    {
        icon: Users,
        title: 'Team Management',
        description: 'Add employees, manage onboarding, and track performance',
        gradient: 'from-emerald-500 to-emerald-600',
    },
    {
        icon: DollarSign,
        title: 'Automated Payroll',
        description: 'Run payroll in minutes with automatic tax calculations',
        gradient: 'from-violet-500 to-violet-600',
    },
    {
        icon: Shield,
        title: 'Tax Compliance',
        description: 'Automatic Form 941, W-2, 1099 filing and reporting',
        gradient: 'from-cyan-500 to-cyan-600',
    },
];

// Stats
const stats = [
    { value: '50K+', label: 'Businesses' },
    { value: '$2.8B', label: 'Processed' },
    { value: '99.9%', label: 'Uptime' },
];

export function EliteWelcomeStep({ onNext }: EliteWelcomeStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
        >
            {/* Hero Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                className="relative inline-block mb-8"
            >
                {/* Glow layers */}
                <div className="absolute inset-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 blur-2xl opacity-30" />
                <div className="absolute inset-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 blur-lg opacity-50" />

                {/* Icon container */}
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-500 to-violet-600 flex items-center justify-center shadow-2xl">
                    <Building2 className="w-12 h-12 text-white" />

                    {/* Sparkle accents */}
                    <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
                Welcome to{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent">
                    Employer Hub
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/60 mb-10 max-w-lg mx-auto"
            >
                Set up your business in minutes. We'll help you manage payroll,
                benefits, and your team—all in one powerful platform.
            </motion.p>

            {/* Feature Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
            >
                {features.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm overflow-hidden"
                    >
                        {/* Hover gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                            <feature.icon className="w-6 h-6 text-white" />
                        </div>

                        <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-8 mb-10"
            >
                {stats.map((stat, i) => (
                    <div key={stat.label} className="text-center">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30"
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>

                    <span className="relative">Get Started</span>
                    <ChevronRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>

            {/* Setup time estimate */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-sm text-white/30 flex items-center justify-center gap-2"
            >
                <Zap className="w-4 h-4 text-yellow-500" />
                Takes about 5 minutes to complete
            </motion.p>
        </motion.div>
    );
}
