'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Check,
    ArrowLeft,
    Building2,
    DollarSign,
    Heart,
    CreditCard,
    Loader2,
    Edit2,
    Sparkles,
    Shield,
    Rocket,
} from 'lucide-react';
import { CompanyInfo, PayrollSetup, BankingInfo, BenefitsConfig } from '../EliteOnboardingWizard';
import confetti from 'canvas-confetti';

interface EliteReviewStepProps {
    companyInfo: CompanyInfo;
    payrollSetup: PayrollSetup;
    bankingInfo: BankingInfo;
    benefitsConfig: BenefitsConfig;
    onBack: () => void;
    onComplete: () => void;
    isSubmitting: boolean;
}

// Summary card component
function SummaryCard({
    title,
    icon: Icon,
    gradient,
    children,
    delay = 0,
}: {
    title: string;
    icon: React.ElementType;
    gradient: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">{title}</h4>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                {children}
            </div>
        </motion.div>
    );
}

// Data row
function DataRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-white/40">{label}</span>
            <span className="text-white font-medium">{value || '-'}</span>
        </div>
    );
}

export function EliteReviewStep({
    companyInfo,
    payrollSetup,
    bankingInfo,
    benefitsConfig,
    onBack,
    onComplete,
    isSubmitting,
}: EliteReviewStepProps) {
    const [agreed, setAgreed] = useState(false);

    const handleComplete = () => {
        // Trigger confetti celebration
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#34d399', '#818cf8', '#22d3ee'],
        });
        onComplete();
    };

    // Calculate enabled benefits count
    const benefitsCount = [
        benefitsConfig.offersHealthInsurance,
        benefitsConfig.offers401k,
        benefitsConfig.offersPto,
        benefitsConfig.offersDental,
        benefitsConfig.offersVision,
        benefitsConfig.offersLifeInsurance,
    ].filter(Boolean).length;

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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4"
                >
                    <FileText className="w-3 h-3" />
                    Final Step
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Review Your Setup
                </h2>
                <p className="text-white/50">
                    Make sure everything looks correct before completing
                </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4 mb-8">
                {/* Company Info */}
                <SummaryCard
                    title="Company Information"
                    icon={Building2}
                    gradient="from-emerald-500 to-emerald-600"
                    delay={0.1}
                >
                    <DataRow label="Legal Name" value={companyInfo.legalName} />
                    <DataRow label="Entity Type" value={companyInfo.entityType.replace('_', ' ').toUpperCase()} />
                    <DataRow label="EIN" value={companyInfo.ein} />
                    <DataRow label="Location" value={`${companyInfo.address.city}, ${companyInfo.address.state}`} />
                </SummaryCard>

                {/* Payroll Setup */}
                <SummaryCard
                    title="Payroll Configuration"
                    icon={DollarSign}
                    gradient="from-violet-500 to-violet-600"
                    delay={0.2}
                >
                    <DataRow label="Pay Frequency" value={payrollSetup.payFrequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                    <DataRow label="First Pay Date" value={payrollSetup.firstPayDate ? new Date(payrollSetup.firstPayDate).toLocaleDateString() : '-'} />
                    <DataRow label="Team Size" value={`${payrollSetup.employeeCount} employees`} />
                    <DataRow label="Contractors" value={payrollSetup.hasContractors ? 'Yes (1099)' : 'No'} />
                </SummaryCard>

                {/* Benefits */}
                <SummaryCard
                    title="Benefits Package"
                    icon={Heart}
                    gradient="from-rose-500 to-pink-500"
                    delay={0.3}
                >
                    <DataRow label="Benefits Offered" value={`${benefitsCount} types`} />
                    {benefitsConfig.offersHealthInsurance && (
                        <DataRow label="Health Insurance" value={`${benefitsConfig.healthEmployerContributionPct}% employer contribution`} />
                    )}
                    {benefitsConfig.offers401k && (
                        <DataRow label="401(k)" value={benefitsConfig.hasEmployerMatch ? `${benefitsConfig.employerMatchPct}% match up to ${benefitsConfig.employerMatchLimitPct}%` : 'Offered'} />
                    )}
                    {benefitsConfig.offersPto && (
                        <DataRow label="PTO" value={`${benefitsConfig.ptoDaysPerYear} days/year`} />
                    )}
                </SummaryCard>

                {/* Banking */}
                <SummaryCard
                    title="Banking"
                    icon={CreditCard}
                    gradient="from-cyan-500 to-cyan-600"
                    delay={0.4}
                >
                    {bankingInfo.useMercury ? (
                        <div className="flex items-center gap-3 py-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className="font-medium text-white">Mercury Bank</div>
                                <div className="text-xs text-emerald-400">Connected</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <DataRow label="Bank" value={bankingInfo.bankName} />
                            <DataRow label="Account Type" value={bankingInfo.accountType} />
                            <DataRow label="Account" value={`****${bankingInfo.accountNumber?.slice(-4) || '****'}`} />
                        </>
                    )}
                </SummaryCard>
            </div>

            {/* Terms & Agreement */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6"
            >
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-white/60 leading-relaxed">
                        By clicking "Complete Setup", I agree to MoneyLoop's{' '}
                        <a href="#" className="text-emerald-400 hover:underline">Terms of Service</a> and authorize
                        MoneyLoop to initiate ACH debits and credits from my connected bank account for payroll processing.
                    </span>
                </label>
            </motion.div>

            {/* Security Badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-xs text-white/30 mb-8"
            >
                <Shield className="w-4 h-4 text-emerald-500" />
                Secured with 256-bit SSL encryption
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                <motion.button
                    onClick={handleComplete}
                    disabled={!agreed || isSubmitting}
                    whileHover={agreed && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={agreed && !isSubmitting ? { scale: 0.98 } : {}}
                    className={`relative flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all overflow-hidden ${agreed && !isSubmitting
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    {/* Shine effect */}
                    {agreed && !isSubmitting && (
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                    )}

                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Setting Up...</span>
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5" />
                            <span>Complete Setup</span>
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
