'use client';

import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    Shield,
    Zap,
    LayoutDashboard
} from 'lucide-react';
import { Surface, Text, Badge } from '@/components/primitives';
import { IllustrationSuccess, IllustrationDashboard } from '@/components/illustrations';
import type { OnboardingPath } from '../OnboardingWizard';

interface PremiumCompletionStepProps {
    path: OnboardingPath;
    onComplete: () => void;
    stats?: {
        income?: number;
        expenses?: number;
        accounts?: number;
    };
}

export function PremiumCompletionStep({
    path,
    onComplete,
    stats = {}
}: PremiumCompletionStepProps) {
    const { income = 0, expenses = 0, accounts = 0 } = stats;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    const features = [
        {
            icon: TrendingUp,
            title: 'Track Net Worth',
            description: 'Monitor your wealth growth over time',
        },
        {
            icon: Shield,
            title: 'Budget Protection',
            description: 'Get alerts before overspending',
        },
        {
            icon: Zap,
            title: 'Smart Insights',
            description: 'AI-powered financial recommendations',
        },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
                {/* Success Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="mb-8"
                >
                    <Badge variant="success" size="md">
                        <CheckCircle2 className="w-4 h-4" />
                        Setup Complete
                    </Badge>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <Text variant="display-lg" as="h1" className="mb-4">
                        Your financial command
                        <br />
                        <span className="text-[var(--accent-primary)]">center is ready</span>
                    </Text>
                    <Text variant="body-lg" color="secondary" className="max-w-lg">
                        {path === 'ai_assisted'
                            ? "We've connected your accounts and analyzed your spending patterns. Your dashboard is personalized and ready."
                            : "Your financial data has been set up. Start exploring your personalized dashboard."
                        }
                    </Text>
                </motion.div>

                {/* Stats Summary */}
                {(income > 0 || expenses > 0 || accounts > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <Surface elevation={1} className="p-6">
                            <Text variant="body-sm" color="tertiary" className="mb-4">
                                YOUR FINANCIAL OVERVIEW
                            </Text>
                            <div className="grid grid-cols-3 gap-6">
                                {income > 0 && (
                                    <div>
                                        <Text variant="mono-lg" color="accent">
                                            {income.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                maximumFractionDigits: 0
                                            })}
                                        </Text>
                                        <Text variant="body-sm" color="tertiary">Monthly Income</Text>
                                    </div>
                                )}
                                {expenses > 0 && (
                                    <div>
                                        <Text variant="mono-lg" className="text-[var(--accent-danger)]">
                                            {expenses.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                maximumFractionDigits: 0
                                            })}
                                        </Text>
                                        <Text variant="body-sm" color="tertiary">Monthly Expenses</Text>
                                    </div>
                                )}
                                {income > 0 && expenses > 0 && (
                                    <div>
                                        <Text
                                            variant="mono-lg"
                                            color={savingsRate >= 0 ? 'accent' : 'danger'}
                                        >
                                            {savingsRate}%
                                        </Text>
                                        <Text variant="body-sm" color="tertiary">Savings Rate</Text>
                                    </div>
                                )}
                                {accounts > 0 && (
                                    <div>
                                        <Text variant="mono-lg">
                                            {accounts}
                                        </Text>
                                        <Text variant="body-sm" color="tertiary">Connected Accounts</Text>
                                    </div>
                                )}
                            </div>
                        </Surface>
                    </motion.div>
                )}

                {/* Features Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <Text variant="body-sm" color="tertiary" className="mb-4">
                        WHAT&apos;S NEXT
                    </Text>
                    <div className="grid gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                            >
                                <Surface elevation={0} variant="interactive" className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center shrink-0">
                                        <feature.icon className="w-5 h-5 text-[var(--accent-primary)]" />
                                    </div>
                                    <div>
                                        <Text variant="body-md" className="font-medium">
                                            {feature.title}
                                        </Text>
                                        <Text variant="body-sm" color="tertiary">
                                            {feature.description}
                                        </Text>
                                    </div>
                                </Surface>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <button
                        onClick={onComplete}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-[var(--text-inverse)] font-semibold text-lg hover:brightness-110 transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>

            {/* Right Panel - Illustration */}
            <div className="hidden lg:flex w-[45%] bg-[var(--surface-elevated)] items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 via-transparent to-[var(--accent-secondary)]/5" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="relative z-10"
                >
                    {/* Animated success */}
                    <div className="relative">
                        <IllustrationSuccess className="w-48 h-48 mx-auto mb-8" animate />

                        {/* Dashboard preview hint */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                        >
                            <IllustrationDashboard className="w-80 h-auto opacity-50" animate={false} />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Celebratory particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: i % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                            left: `${20 + i * 12}%`,
                            top: `${30 + (i % 3) * 15}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            y: [0, -20, -40],
                        }}
                        transition={{
                            duration: 2,
                            delay: 0.5 + i * 0.2,
                            repeat: Infinity,
                            repeatDelay: 3,
                        }}
                    />
                ))}

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(var(--border-subtle) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>
        </div>
    );
}

export default PremiumCompletionStep;
