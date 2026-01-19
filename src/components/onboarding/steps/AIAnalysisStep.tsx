'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, CreditCard, Receipt, TrendingUp, CheckCircle } from 'lucide-react';
import type { DetectedExpense } from '../OnboardingWizard';

interface AIAnalysisStepProps {
    onComplete: (expenses: DetectedExpense[]) => void;
}

const analysisSteps = [
    { icon: CreditCard, label: 'Connecting to your accounts...', duration: 1500 },
    { icon: Receipt, label: 'Analyzing transaction history...', duration: 2500 },
    { icon: TrendingUp, label: 'Detecting recurring expenses...', duration: 2000 },
    { icon: Brain, label: 'Categorizing subscriptions...', duration: 1500 },
];

// Mock detected expenses - in production, this would come from AI analysis
const mockDetectedExpenses: DetectedExpense[] = [
    { id: '1', name: 'Netflix', amount: 15.99, category: 'Entertainment', frequency: 'monthly', confirmed: false },
    { id: '2', name: 'Spotify', amount: 9.99, category: 'Entertainment', frequency: 'monthly', confirmed: false },
    { id: '3', name: 'Verizon Wireless', amount: 89.00, category: 'Utilities', frequency: 'monthly', confirmed: false },
    { id: '4', name: 'Planet Fitness', amount: 24.99, category: 'Health', frequency: 'monthly', confirmed: false },
    { id: '5', name: 'Adobe Creative Cloud', amount: 54.99, category: 'Productivity', frequency: 'monthly', confirmed: false },
    { id: '6', name: 'Electric Company', amount: 125.00, category: 'Utilities', frequency: 'monthly', confirmed: false },
    { id: '7', name: 'Internet Provider', amount: 79.99, category: 'Utilities', frequency: 'monthly', confirmed: false },
    { id: '8', name: 'Car Insurance', amount: 145.00, category: 'Insurance', frequency: 'monthly', confirmed: false },
];

export function AIAnalysisStep({ onComplete }: AIAnalysisStepProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (currentStep < analysisSteps.length) {
            timeoutId = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, analysisSteps[currentStep].duration);
        } else if (!isComplete) {
            // Analysis complete, wait a moment then proceed
            timeoutId = setTimeout(() => {
                setIsComplete(true);
                onComplete(mockDetectedExpenses);
            }, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [currentStep, isComplete, onComplete]);

    const progress = (currentStep / analysisSteps.length) * 100;

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#34d399]/20 to-[#818cf8]/20 flex items-center justify-center mx-auto mb-6 relative">
                    <Brain className="w-10 h-10 text-[#34d399]" />
                    {/* Pulsing animation */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-[#34d399]/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    Analyzing Your Finances
                </h1>
                <p className="text-slate-400">
                    Our AI is scanning your transactions to find recurring expenses and subscriptions.
                </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#34d399] to-[#5bc898] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-500">
                    <span>Analyzing...</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </motion.div>

            {/* Analysis Steps */}
            <div className="space-y-4">
                {analysisSteps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isDone = index < currentStep;

                    return (
                        <motion.div
                            key={step.label}
                            className={`
                                flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                                ${isActive ? 'bg-[#34d399]/10 border border-[#34d399]/30' :
                                    isDone ? 'bg-white/[0.02]' : 'opacity-40'}
                            `}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                    ${isDone ? 'bg-[#34d399] text-[#0a0a0f]' :
                                        isActive ? 'bg-[#34d399]/20 text-[#34d399]' :
                                            'bg-white/5 text-slate-500'}
                                `}
                            >
                                {isDone ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium ${isDone ? 'text-slate-400' : 'text-white'}`}>
                                    {step.label}
                                </p>
                            </div>
                            {isActive && (
                                <div className="w-5 h-5 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Results Preview */}
            {currentStep >= analysisSteps.length && (
                <motion.div
                    className="mt-8 p-6 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/30 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <CheckCircle className="w-12 h-12 text-[#34d399] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Analysis Complete!</h3>
                    <p className="text-slate-400">
                        Found <span className="text-[#34d399] font-medium">{mockDetectedExpenses.length}</span> recurring expenses totaling{' '}
                        <span className="text-[#34d399] font-medium font-mono">
                            ${mockDetectedExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}/month
                        </span>
                    </p>
                </motion.div>
            )}
        </div>
    );
}

export default AIAnalysisStep;
