'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Award, CheckCircle2 } from 'lucide-react';

const securityBadges = [
    { icon: Shield, label: '256-bit Encryption', description: 'Bank-level security' },
    { icon: Lock, label: 'Read-Only Access', description: 'We never move money' },
    { icon: Eye, label: 'SOC 2 Type II', description: 'Enterprise certified' },
    { icon: Award, label: 'GDPR Compliant', description: 'Data privacy first' },
];

const partnerLogos = [
    { name: 'Plaid', initial: 'P' },
    { name: 'Stripe', initial: 'S' },
    { name: 'Coinbase', initial: 'C' },
    { name: 'Fidelity', initial: 'F' },
];

export function SecurityBadges() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
            {securityBadges.map((badge, i) => (
                <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group cursor-default"
                >
                    <badge.icon className="w-4 h-4 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{badge.label}</span>
                </motion.div>
            ))}
        </motion.div>
    );
}

export function TrustStats() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-8 text-center"
        >
            {[
                { value: '$2.4B+', label: 'Assets tracked' },
                { value: '10,000+', label: 'Users' },
                { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
                <div key={stat.label} className="px-4">
                    <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
                </div>
            ))}
        </motion.div>
    );
}

export function PartnerLogos() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col items-center gap-4"
        >
            <p className="text-xs text-white/30 uppercase tracking-widest">Integrates with</p>
            <div className="flex items-center gap-6">
                {partnerLogos.map((partner) => (
                    <div
                        key={partner.name}
                        className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 text-sm font-medium hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-default"
                        title={partner.name}
                    >
                        {partner.initial}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export function DataPromise() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex items-center justify-center gap-6 text-sm"
        >
            {[
                'Your data is never sold',
                'Cancel anytime',
                'No credit card required',
            ].map((text) => (
                <div key={text} className="flex items-center gap-2 text-white/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60" />
                    <span>{text}</span>
                </div>
            ))}
        </motion.div>
    );
}

export default function TrustSection() {
    return (
        <section className="py-16 px-6 border-t border-white/[0.03]">
            <div className="max-w-4xl mx-auto space-y-12">
                <SecurityBadges />
                <TrustStats />
                <PartnerLogos />
            </div>
        </section>
    );
}
