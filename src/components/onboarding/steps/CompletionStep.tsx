'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui';
import type { OnboardingPath } from '../OnboardingWizard';

interface CompletionStepProps {
    path: OnboardingPath;
    onComplete: () => void;
}

export function CompletionStep({ path, onComplete }: CompletionStepProps) {
    const [showContent, setShowContent] = useState(false);

    // Trigger confetti on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#34d399', '#818cf8', '#ffffff'],
            });
            setShowContent(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const benefits = path === 'ai_assisted'
        ? [
            'Your accounts are connected and syncing',
            'Recurring expenses are being tracked',
            'AI insights are now active',
        ]
        : [
            'Your income streams are set up',
            'Monthly expenses are configured',
            'Budget tracking is ready',
        ];

    return (
        <div className="max-w-lg mx-auto text-center">
            {/* Animated Checkmark */}
            <motion.div
                className="relative w-24 h-24 mx-auto mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
                <div className="absolute inset-0 bg-[#34d399]/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#34d399] to-[#5bc898] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-[#0a0a0f]" />
                </div>
            </motion.div>

            {/* Content */}
            {showContent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#34d399]/10 text-[#34d399] text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        Setup Complete!
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        You&apos;re All Set!
                    </h1>
                    <p className="text-slate-400 text-lg mb-8">
                        Welcome to MoneyLoop. Your financial command center is ready.
                    </p>

                    {/* Benefits */}
                    <div className="bg-white/[0.02] rounded-2xl border border-white/10 p-6 mb-8">
                        <h3 className="font-medium mb-4 text-left">What&apos;s Ready for You</h3>
                        <ul className="space-y-3 text-left">
                            {benefits.map((benefit, index) => (
                                <motion.li
                                    key={benefit}
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-[#34d399]" />
                                    </div>
                                    <span className="text-slate-300">{benefit}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            onClick={onComplete}
                            className="bg-[#34d399] hover:bg-[#6bc497] text-[#0a0a0f] px-8 py-4 text-lg"
                            icon={<Rocket className="w-5 h-5" />}
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>

                    {/* Fun Fact */}
                    <motion.p
                        className="text-sm text-slate-500 mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        💡 Tip: Check the Insights tab for personalized savings recommendations
                    </motion.p>
                </motion.div>
            )}
        </div>
    );
}

export default CompletionStep;
