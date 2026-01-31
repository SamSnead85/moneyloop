'use client';

import { motion } from 'framer-motion';
import {
    DollarSign,
    ChevronRight,
    ArrowLeft,
    Check,
    Calendar,
    Users,
    FileText,
} from 'lucide-react';
import { PayrollSetup } from '../EliteOnboardingWizard';

interface ElitePayrollStepProps {
    data: PayrollSetup;
    onChange: (data: PayrollSetup) => void;
    onNext: () => void;
    onBack: () => void;
}

// Pay frequency options with details
const frequencies = [
    {
        value: 'weekly',
        label: 'Weekly',
        periods: 52,
        desc: 'Every week',
        icon: '📅',
    },
    {
        value: 'bi-weekly',
        label: 'Bi-weekly',
        periods: 26,
        desc: 'Every 2 weeks',
        icon: '📆',
        recommended: true,
    },
    {
        value: 'semi-monthly',
        label: 'Semi-monthly',
        periods: 24,
        desc: '1st & 15th',
        icon: '🗓️',
    },
    {
        value: 'monthly',
        label: 'Monthly',
        periods: 12,
        desc: 'Once per month',
        icon: '📋',
    },
];

// Employee count ranges
const employeeCounts = [
    { value: '1-5', label: '1-5', tier: 'Startup' },
    { value: '6-10', label: '6-10', tier: 'Small' },
    { value: '11-25', label: '11-25', tier: 'Growing' },
    { value: '26-50', label: '26-50', tier: 'Medium' },
    { value: '51-100', label: '51-100', tier: 'Scale' },
    { value: '100+', label: '100+', tier: 'Enterprise' },
];

export function ElitePayrollStep({ data, onChange, onNext, onBack }: ElitePayrollStepProps) {
    const canProceed = data.payFrequency && data.firstPayDate && data.employeeCount;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4"
                >
                    <DollarSign className="w-3 h-3" />
                    Step 2 of 5
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Payroll Setup
                </h2>
                <p className="text-white/50">
                    Configure how you'll pay your team
                </p>
            </div>

            <div className="space-y-8">
                {/* Pay Frequency */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-4">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        Pay Frequency <span className="text-emerald-400">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {frequencies.map((freq) => (
                            <motion.button
                                key={freq.value}
                                type="button"
                                onClick={() => onChange({ ...data, payFrequency: freq.value as PayrollSetup['payFrequency'] })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${data.payFrequency === freq.value
                                        ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10'
                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]'
                                    }`}
                            >
                                {freq.recommended && (
                                    <div className="absolute -top-2 right-3">
                                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-[10px] font-semibold text-white uppercase tracking-wider">
                                            Popular
                                        </span>
                                    </div>
                                )}

                                {data.payFrequency === freq.value && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{freq.icon}</span>
                                    <div>
                                        <div className="font-semibold text-white">{freq.label}</div>
                                        <div className="text-xs text-white/40">{freq.desc}</div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-white/30">
                                    {freq.periods} pay periods/year
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* First Pay Date */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-4">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        First Pay Date <span className="text-emerald-400">*</span>
                    </label>

                    <div className="relative">
                        <input
                            type="date"
                            value={data.firstPayDate}
                            onChange={(e) => onChange({ ...data, firstPayDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-white/30 mt-2">When will you run your first payroll?</p>
                </div>

                {/* Team Size */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-4">
                        <Users className="w-4 h-4 text-violet-400" />
                        Team Size <span className="text-emerald-400">*</span>
                    </label>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {employeeCounts.map((count) => (
                            <motion.button
                                key={count.value}
                                type="button"
                                onClick={() => onChange({ ...data, employeeCount: count.value })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-3 rounded-xl border text-center transition-all duration-200 ${data.employeeCount === count.value
                                        ? 'bg-violet-500/10 border-violet-500/50'
                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="font-semibold text-white">{count.label}</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">{count.tier}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Contractors */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-4">
                        <FileText className="w-4 h-4 text-violet-400" />
                        Do you work with contractors?
                    </label>

                    <div className="flex gap-3">
                        {[
                            { value: true, label: 'Yes, I have 1099 contractors', icon: '✓' },
                            { value: false, label: 'No, only W-2 employees', icon: '○' },
                        ].map((option) => (
                            <motion.button
                                key={String(option.value)}
                                type="button"
                                onClick={() => onChange({ ...data, hasContractors: option.value })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-1 p-4 rounded-xl border text-center transition-all ${data.hasContractors === option.value
                                        ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10'
                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className="font-medium text-white">{option.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                <motion.button
                    onClick={onNext}
                    disabled={!canProceed}
                    whileHover={canProceed ? { scale: 1.02 } : {}}
                    whileTap={canProceed ? { scale: 0.98 } : {}}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${canProceed
                            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
