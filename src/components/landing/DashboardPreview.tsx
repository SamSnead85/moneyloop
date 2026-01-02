'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, Wallet, Home, Coins, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        const animation = animate(count, value, { duration: 2.5, ease: 'easeOut' });
        const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
        return () => {
            animation.stop();
            unsubscribe();
        };
    }, [value, count, rounded]);

    return <span>{prefix}{displayValue}{suffix}</span>;
}

const assets = [
    { icon: Wallet, label: 'Checking', value: 24850, color: 'emerald' },
    { icon: CreditCard, label: 'Savings', value: 156200, color: 'blue' },
    { icon: TrendingUp, label: 'Investments', value: 412000, color: 'purple' },
    { icon: Home, label: 'Real Estate', value: 485000, color: 'amber' },
    { icon: Coins, label: 'Gold & Silver', value: 45960, color: 'yellow' },
];

export default function DashboardPreview() {
    const [isHovered, setIsHovered] = useState(false);

    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);

    return (
        <motion.div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            style={{ perspective: 1000 }}
        >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-transparent to-amber-500/20 rounded-3xl blur-3xl opacity-50" />

            {/* Main card */}
            <motion.div
                className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 overflow-hidden"
                animate={{
                    rotateY: isHovered ? 2 : 0,
                    rotateX: isHovered ? -2 : 0,
                    scale: isHovered ? 1.02 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Net Worth</p>
                        <p className="text-3xl font-semibold text-white">
                            <AnimatedValue value={totalNetWorth} prefix="$" />
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">+12.4%</span>
                    </div>
                </div>

                {/* Mini chart */}
                <div className="h-16 mb-6 flex items-end gap-1">
                    {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 92].map((h, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/40 to-emerald-400/60"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.8, delay: 0.8 + i * 0.05, ease: 'easeOut' }}
                        />
                    ))}
                </div>

                {/* Asset breakdown */}
                <div className="space-y-2.5">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={asset.label}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${asset.color === 'emerald' ? 'bg-emerald-500/10' :
                                        asset.color === 'blue' ? 'bg-blue-500/10' :
                                            asset.color === 'purple' ? 'bg-purple-500/10' :
                                                asset.color === 'amber' ? 'bg-amber-500/10' :
                                                    'bg-yellow-500/10'
                                    }`}>
                                    <asset.icon className={`w-4 h-4 ${asset.color === 'emerald' ? 'text-emerald-400' :
                                            asset.color === 'blue' ? 'text-blue-400' :
                                                asset.color === 'purple' ? 'text-purple-400' :
                                                    asset.color === 'amber' ? 'text-amber-400' :
                                                        'text-yellow-400'
                                        }`} />
                                </div>
                                <span className="text-sm text-white/70">{asset.label}</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                                ${asset.value.toLocaleString()}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl" />
            </motion.div>
        </motion.div>
    );
}
