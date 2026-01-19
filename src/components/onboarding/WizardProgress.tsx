'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

interface WizardProgressProps {
    steps: string[];
    currentStep: number;
    onBack?: () => void;
}

const stepLabels: Record<string, string> = {
    bank: 'Connect Bank',
    analysis: 'AI Analysis',
    review: 'Review Expenses',
    income: 'Income',
    expenses: 'Expenses',
    upload: 'Upload Files',
};

export function WizardProgress({ steps, currentStep, onBack }: WizardProgressProps) {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    {onBack && currentStep > 0 && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Progress Bar */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                            <span className="text-sm text-[#34d399]">
                                {Math.round(progress)}% complete
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#34d399] to-[#5bc898] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Step Indicators (Desktop) */}
                <div className="hidden md:flex items-center justify-center gap-2 mt-4">
                    {steps.map((step, index) => (
                        <div key={step} className="flex items-center">
                            {/* Step Circle */}
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                    transition-all duration-300
                                    ${index < currentStep
                                        ? 'bg-[#34d399] text-[#0a0a0f]'
                                        : index === currentStep
                                            ? 'bg-[#34d399]/20 text-[#34d399] ring-2 ring-[#34d399]'
                                            : 'bg-white/5 text-slate-500'
                                    }
                                `}
                            >
                                {index < currentStep ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`
                                    ml-2 text-sm hidden lg:block
                                    ${index === currentStep ? 'text-white' : 'text-slate-500'}
                                `}
                            >
                                {stepLabels[step] || step}
                            </span>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        w-8 lg:w-12 h-0.5 mx-2
                                        ${index < currentStep ? 'bg-[#34d399]' : 'bg-white/10'}
                                    `}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WizardProgress;
