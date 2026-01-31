'use client';

import { motion } from 'framer-motion';
import {
    CreditCard,
    ChevronRight,
    ArrowLeft,
    Check,
    Shield,
    Building2,
    Lock,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import { BankingInfo } from '../EliteOnboardingWizard';

interface EliteBankingStepProps {
    data: BankingInfo;
    onChange: (data: BankingInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

export function EliteBankingStep({ data, onChange, onNext, onBack }: EliteBankingStepProps) {
    const canProceed = data.useMercury || (data.bankName && data.routingNumber?.length === 9 && data.accountNumber);

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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4"
                >
                    <CreditCard className="w-3 h-3" />
                    Step 4 of 5
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Banking Setup
                </h2>
                <p className="text-white/50">
                    Connect your business bank account for payroll
                </p>
            </div>

            <div className="space-y-6">
                {/* Mercury Integration - Premium Option */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${data.useMercury
                            ? 'bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-purple-500/10 border-violet-500/40'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-violet-500/20'
                        }`}
                >
                    {/* Premium badge */}
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[10px] font-semibold text-white uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Recommended
                        </span>
                    </div>

                    <div className="flex items-start gap-4">
                        {/* Mercury Logo */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20 flex-shrink-0">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">Mercury Bank</h3>
                            <p className="text-sm text-white/50 mb-4">
                                Instant connection with seamless ACH transfers. No routing numbers needed.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Instant Setup', 'No Fees', 'Auto-sync'].map((tag) => (
                                    <span key={tag} className="px-2 py-1 rounded-full bg-violet-500/20 text-xs text-violet-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <motion.button
                                type="button"
                                onClick={() => onChange({ ...data, useMercury: !data.useMercury, bankName: '', routingNumber: '', accountNumber: '' })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${data.useMercury
                                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25'
                                        : 'bg-white/10 text-white hover:bg-white/15'
                                    }`}
                            >
                                {data.useMercury ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Connected
                                    </>
                                ) : (
                                    <>
                                        Connect Mercury
                                        <ExternalLink className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-sm text-white/30 uppercase tracking-wider">or add manually</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Manual Bank Entry */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`space-y-4 transition-opacity ${data.useMercury ? 'opacity-40 pointer-events-none' : ''}`}
                >
                    {/* Bank Name */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Bank Name <span className="text-emerald-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.bankName}
                            onChange={(e) => onChange({ ...data, bankName: e.target.value, useMercury: false })}
                            placeholder="Chase, Bank of America, Wells Fargo, etc."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">
                            Account Type
                        </label>
                        <div className="flex gap-3">
                            {(['checking', 'savings'] as const).map((type) => (
                                <motion.button
                                    key={type}
                                    type="button"
                                    onClick={() => onChange({ ...data, accountType: type, useMercury: false })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex-1 p-3 rounded-xl border capitalize font-medium transition-all ${data.accountType === type
                                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                                            : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    {type}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Routing & Account Numbers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Routing Number <span className="text-emerald-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.routingNumber}
                                onChange={(e) => onChange({
                                    ...data,
                                    routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9),
                                    useMercury: false
                                })}
                                placeholder="9 digits"
                                maxLength={9}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all font-mono tracking-widest"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Account Number <span className="text-emerald-400">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.accountNumber}
                                onChange={(e) => onChange({
                                    ...data,
                                    accountNumber: e.target.value.replace(/\D/g, ''),
                                    useMercury: false
                                })}
                                placeholder="Account number"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all font-mono tracking-widest"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Security Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-medium text-emerald-400 mb-1">Bank-Level Security</h4>
                        <p className="text-sm text-white/50">
                            Your banking information is encrypted with 256-bit SSL and stored securely.
                            We never share your data with third parties.
                        </p>
                    </div>
                </motion.div>
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
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:bg-cyan-400'
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
