'use client';

import { motion } from 'framer-motion';
import { Zap, ClipboardList, Shield, Clock, ArrowRight } from 'lucide-react';
import type { OnboardingPath } from '../OnboardingWizard';

interface PathSelectorProps {
    onSelect: (path: OnboardingPath) => void;
    onSkip: () => void;
}

const paths = [
    {
        id: 'ai_assisted' as const,
        title: 'Quick Setup',
        subtitle: 'Recommended',
        description: 'Connect your accounts and let AI automatically detect your expenses, subscriptions, and income patterns.',
        icon: Zap,
        features: [
            'Auto-detect recurring expenses',
            'Import transaction history',
            'AI-powered categorization',
        ],
        time: '~2 minutes',
        color: '#7dd3a8',
    },
    {
        id: 'manual' as const,
        title: 'Manual Entry',
        subtitle: 'Step-by-step',
        description: 'Enter your financial information manually through a guided questionnaire or by uploading statements.',
        icon: ClipboardList,
        features: [
            'Guided expense questionnaire',
            'Upload bank statements',
            'Full control over data',
        ],
        time: '~8 minutes',
        color: '#c9b896',
    },
];

export function PathSelector({ onSelect, onSkip }: PathSelectorProps) {
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7dd3a8]/10 text-[#7dd3a8] text-sm mb-6">
                    <span className="text-lg">🎉</span>
                    Welcome to MoneyLoop!
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    How would you like to get started?
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Choose the setup method that works best for you. You can always add more information later.
                </p>
            </motion.div>

            {/* Path Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {paths.map((path, index) => (
                    <motion.button
                        key={path.id}
                        onClick={() => onSelect(path.id)}
                        className="group relative text-left p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.04]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                    >
                        {/* Recommended Badge */}
                        {path.subtitle === 'Recommended' && (
                            <div
                                className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: path.color, color: '#0a0a0f' }}
                            >
                                {path.subtitle}
                            </div>
                        )}

                        {/* Icon */}
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: `${path.color}20` }}
                        >
                            <path.icon className="w-7 h-7" style={{ color: path.color }} />
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                        <p className="text-slate-400 text-sm mb-4">{path.description}</p>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                            {path.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: path.color }}
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                {path.time}
                            </div>
                            <div
                                className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                                style={{ color: path.color }}
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Trust Badge */}
            <motion.div
                className="flex items-center justify-center gap-3 text-sm text-slate-500 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Shield className="w-4 h-4 text-[#7dd3a8]" />
                <span>Bank-level encryption. Your data is never shared without consent.</span>
            </motion.div>

            {/* Skip Option */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <button
                    onClick={onSkip}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline underline-offset-4"
                >
                    Skip for now — I&apos;ll set up later
                </button>
            </motion.div>
        </div>
    );
}

export default PathSelector;
