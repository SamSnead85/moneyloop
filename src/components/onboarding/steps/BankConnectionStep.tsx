'use client';

import { motion } from 'framer-motion';
import { Building2, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { PlaidLinkButton } from '@/components/PlaidLink';
import { Button } from '@/components/ui';

interface BankConnectionStepProps {
    onComplete: () => void;
    onSkip: () => void;
}

const benefits = [
    'Automatically import your transactions',
    'Detect recurring subscriptions & bills',
    'Track spending patterns over time',
    'Real-time balance updates',
];

export function BankConnectionStep({ onComplete, onSkip }: BankConnectionStepProps) {
    return (
        <div className="max-w-xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 rounded-2xl bg-[#34d399]/10 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-[#34d399]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    Connect Your Bank Account
                </h1>
                <p className="text-slate-400">
                    Securely link your accounts to automatically import your financial data.
                </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
                className="bg-white/[0.02] rounded-2xl border border-white/10 p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="font-medium mb-4 text-sm text-slate-400 uppercase tracking-wider">
                    What you&apos;ll get
                </h3>
                <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                        <motion.li
                            key={benefit}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                        >
                            <CheckCircle className="w-5 h-5 text-[#34d399] flex-shrink-0" />
                            <span className="text-slate-300">{benefit}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Plaid Connect Button */}
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <PlaidLinkButton
                    onSuccess={onComplete}
                    className="w-full bg-[#34d399] hover:bg-[#6bc497] text-[#0a0a0f] font-medium py-4 text-lg"
                >
                    <Building2 className="w-5 h-5 mr-2" />
                    Connect with Plaid
                    <ArrowRight className="w-5 h-5 ml-2" />
                </PlaidLinkButton>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Shield className="w-3 h-3" />
                    <span>256-bit encryption • Read-only access • Powered by Plaid</span>
                </div>
            </motion.div>

            {/* Skip Option */}
            <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-slate-500 hover:text-slate-300"
                >
                    Skip for now
                </Button>
            </motion.div>
        </div>
    );
}

export default BankConnectionStep;
