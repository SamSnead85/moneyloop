'use client';

import { motion } from 'framer-motion';
import {
    Heart,
    ChevronRight,
    ArrowLeft,
    Check,
    Shield,
    Umbrella,
    PiggyBank,
    Calendar,
    Eye,
    Stethoscope,
    Sparkles,
} from 'lucide-react';
import { BenefitsConfig } from '../EliteOnboardingWizard';

interface EliteBenefitsStepProps {
    data: BenefitsConfig;
    onChange: (data: BenefitsConfig) => void;
    onNext: () => void;
    onBack: () => void;
}

// Toggle component
function BenefitToggle({
    enabled,
    onChange,
    icon: Icon,
    title,
    description,
    color = 'emerald',
    children,
}: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    icon: React.ElementType;
    title: string;
    description: string;
    color?: 'emerald' | 'violet' | 'cyan' | 'amber';
    children?: React.ReactNode;
}) {
    const colors = {
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
        violet: 'from-violet-500 to-violet-600 shadow-violet-500/20',
        cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/20',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    };

    return (
        <div className={`p-4 rounded-xl border transition-all duration-300 ${enabled
                ? 'bg-white/[0.04] border-white/[0.12]'
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white">{title}</h4>
                        <motion.button
                            type="button"
                            onClick={() => onChange(!enabled)}
                            whileTap={{ scale: 0.9 }}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-white/20'
                                }`}
                        >
                            <motion.div
                                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                                animate={{ left: enabled ? '28px' : '4px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </motion.button>
                    </div>
                    <p className="text-sm text-white/40">{description}</p>

                    {enabled && children && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/[0.06]"
                        >
                            {children}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Slider component
function PremiumSlider({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    suffix = '%',
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">{label}</span>
                <span className="text-sm font-semibold text-emerald-400">{value}{suffix}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:bg-gradient-to-br
                    [&::-webkit-slider-thumb]:from-emerald-400
                    [&::-webkit-slider-thumb]:to-emerald-500
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:shadow-emerald-500/30
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
            />
        </div>
    );
}

export function EliteBenefitsStep({ data, onChange, onNext, onBack }: EliteBenefitsStepProps) {
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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-4"
                >
                    <Heart className="w-3 h-3" />
                    Step 3 of 5
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Benefits Package
                </h2>
                <p className="text-white/50">
                    Configure the benefits you'll offer your team
                </p>
            </div>

            <div className="space-y-4">
                {/* Health Insurance */}
                <BenefitToggle
                    enabled={data.offersHealthInsurance}
                    onChange={(v) => onChange({ ...data, offersHealthInsurance: v })}
                    icon={Stethoscope}
                    title="Health Insurance"
                    description="Offer medical coverage to employees"
                    color="emerald"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-white/50 mb-2">Provider (optional)</label>
                            <input
                                type="text"
                                value={data.healthInsuranceProvider}
                                onChange={(e) => onChange({ ...data, healthInsuranceProvider: e.target.value })}
                                placeholder="e.g., Blue Cross, Aetna, United"
                                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <PremiumSlider
                            label="Employer contribution"
                            value={data.healthEmployerContributionPct}
                            onChange={(v) => onChange({ ...data, healthEmployerContributionPct: v })}
                            min={0}
                            max={100}
                            step={5}
                        />
                    </div>
                </BenefitToggle>

                {/* 401(k) */}
                <BenefitToggle
                    enabled={data.offers401k}
                    onChange={(v) => onChange({ ...data, offers401k: v })}
                    icon={PiggyBank}
                    title="401(k) Retirement Plan"
                    description="Help employees save for retirement"
                    color="violet"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="employerMatch"
                                checked={data.hasEmployerMatch}
                                onChange={(e) => onChange({ ...data, hasEmployerMatch: e.target.checked })}
                                className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/20"
                            />
                            <label htmlFor="employerMatch" className="text-sm text-white/70">
                                Offer employer matching
                            </label>
                        </div>

                        {data.hasEmployerMatch && (
                            <div className="grid grid-cols-2 gap-4">
                                <PremiumSlider
                                    label="Match percentage"
                                    value={data.employerMatchPct}
                                    onChange={(v) => onChange({ ...data, employerMatchPct: v })}
                                    min={0}
                                    max={10}
                                    step={0.5}
                                />
                                <PremiumSlider
                                    label="Up to % salary"
                                    value={data.employerMatchLimitPct}
                                    onChange={(v) => onChange({ ...data, employerMatchLimitPct: v })}
                                    min={1}
                                    max={15}
                                    step={1}
                                />
                            </div>
                        )}
                    </div>
                </BenefitToggle>

                {/* PTO */}
                <BenefitToggle
                    enabled={data.offersPto}
                    onChange={(v) => onChange({ ...data, offersPto: v })}
                    icon={Calendar}
                    title="Paid Time Off"
                    description="Vacation, sick leave, and personal days"
                    color="cyan"
                >
                    <PremiumSlider
                        label="Days per year"
                        value={data.ptoDaysPerYear}
                        onChange={(v) => onChange({ ...data, ptoDaysPerYear: v })}
                        min={5}
                        max={30}
                        step={1}
                        suffix=" days"
                    />
                </BenefitToggle>

                {/* Additional Benefits */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <h4 className="flex items-center gap-2 font-medium text-white mb-4">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Additional Benefits
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { key: 'offersDental', label: 'Dental', icon: '🦷' },
                            { key: 'offersVision', label: 'Vision', icon: '👁️' },
                            { key: 'offersLifeInsurance', label: 'Life Insurance', icon: '🛡️' },
                        ].map((benefit) => (
                            <motion.button
                                key={benefit.key}
                                type="button"
                                onClick={() => onChange({
                                    ...data,
                                    [benefit.key]: !data[benefit.key as keyof BenefitsConfig]
                                })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl border text-center transition-all ${data[benefit.key as keyof BenefitsConfig]
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className="text-xl block mb-1">{benefit.icon}</span>
                                <span className="text-sm text-white">{benefit.label}</span>
                                {data[benefit.key as keyof BenefitsConfig] && (
                                    <Check className="w-3 h-3 text-amber-400 mx-auto mt-1" />
                                )}
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all"
                >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
