'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, DollarSign, Briefcase, Building2, Coins, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';
import type { IncomeStream } from '../OnboardingWizard';
import { LifeBuilder, LifeBuilderState } from '../LifeBuilder';

interface IncomeEntryStepProps {
    incomeStreams: IncomeStream[];
    onComplete: (streams: IncomeStream[]) => void;
    onSkip: () => void;
}

const frequencyOptions = [
    { value: 'weekly', label: 'Weekly', multiplier: 4.33 },
    { value: 'biweekly', label: 'Bi-weekly', multiplier: 2.17 },
    { value: 'monthly', label: 'Monthly', multiplier: 1 },
    { value: 'annually', label: 'Annually', multiplier: 1 / 12 },
] as const;

const incomeTypes = [
    { icon: Briefcase, label: 'Salary', source: 'Employment', color: 'from-blue-500/20 to-blue-600/10' },
    { icon: Building2, label: 'Freelance', source: 'Self-employment', color: 'from-purple-500/20 to-purple-600/10' },
    { icon: Coins, label: 'Investments', source: 'Dividends/Interest', color: 'from-amber-500/20 to-amber-600/10' },
];

export function IncomeEntryStep({ incomeStreams: initial, onComplete, onSkip }: IncomeEntryStepProps) {
    const [streams, setStreams] = useState<IncomeStream[]>(
        initial.length > 0 ? initial : [{
            id: crypto.randomUUID(),
            name: 'Primary Salary',
            source: 'Employment',
            amount: 0,
            frequency: 'monthly',
        }]
    );
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const addStream = () => {
        setStreams([
            ...streams,
            {
                id: crypto.randomUUID(),
                name: '',
                source: '',
                amount: 0,
                frequency: 'monthly',
            },
        ]);
    };

    const removeStream = (id: string) => {
        if (streams.length > 1) {
            setStreams(streams.filter(s => s.id !== id));
        }
    };

    const updateStream = (id: string, updates: Partial<IncomeStream>) => {
        setStreams(streams.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const monthlyTotal = streams.reduce((sum, s) => {
        const amount = s.amount || 0;
        const freq = frequencyOptions.find(f => f.value === s.frequency);
        return sum + (amount * (freq?.multiplier || 1));
    }, 0);

    const handleContinue = () => {
        const validStreams = streams.filter(s => s.name && s.amount > 0);
        onComplete(validStreams);
    };

    const selectIncomeType = (type: typeof incomeTypes[0]) => {
        setSelectedType(type.label);
        if (streams.length === 1 && !streams[0].name) {
            updateStream(streams[0].id, { name: type.label, source: type.source });
        }
    };

    // Build life state for the visual
    const lifeBuilderState = useMemo((): Partial<LifeBuilderState> => ({
        income: monthlyTotal,
    }), [monthlyTotal]);

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Main Form Panel */}
                <div className="flex-1 lg:max-w-xl order-2 lg:order-1">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9b896]/20 to-[#c9b896]/5 flex items-center justify-center mx-auto mb-6 border border-[#c9b896]/20"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <TrendingUp className="w-8 h-8 text-[#c9b896]" />
                        </motion.div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            What&apos;s Your Income?
                        </h1>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Add your income sources to see your money flow into your financial life.
                        </p>
                    </motion.div>

                    {/* Quick Type Selector */}
                    <motion.div
                        className="flex justify-center gap-3 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {incomeTypes.map((type) => (
                            <motion.button
                                key={type.label}
                                onClick={() => selectIncomeType(type)}
                                className={`
                                    flex flex-col items-center gap-2.5 p-4 rounded-2xl 
                                    bg-gradient-to-br ${type.color}
                                    border transition-all duration-300
                                    ${selectedType === type.label
                                        ? 'border-[#c9b896]/50 shadow-lg shadow-[#c9b896]/10'
                                        : 'border-white/10 hover:border-white/20'}
                                `}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <type.icon className="w-6 h-6 text-[#c9b896]" />
                                <span className="text-sm font-medium">{type.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Income Streams */}
                    <div className="space-y-4 mb-6">
                        {streams.map((stream, index) => (
                            <motion.div
                                key={stream.id}
                                className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                                                Income Name
                                            </label>
                                            <input
                                                type="text"
                                                value={stream.name}
                                                onChange={(e) => updateStream(stream.id, { name: e.target.value })}
                                                placeholder="e.g., Primary Salary"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#c9b896]/50 focus:outline-none focus:ring-2 focus:ring-[#c9b896]/20 transition-all"
                                            />
                                        </div>

                                        {/* Amount & Frequency */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                                                    Amount
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="number"
                                                        value={stream.amount || ''}
                                                        onChange={(e) => updateStream(stream.id, { amount: parseFloat(e.target.value) || 0 })}
                                                        placeholder="0.00"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 focus:border-[#c9b896]/50 focus:outline-none focus:ring-2 focus:ring-[#c9b896]/20 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                                                    Frequency
                                                </label>
                                                <select
                                                    value={stream.frequency}
                                                    onChange={(e) => updateStream(stream.id, { frequency: e.target.value as IncomeStream['frequency'] })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#c9b896]/50 focus:outline-none focus:ring-2 focus:ring-[#c9b896]/20 transition-all appearance-none cursor-pointer"
                                                >
                                                    {frequencyOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value} className="bg-[#12121a]">
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {streams.length > 1 && (
                                        <motion.button
                                            onClick={() => removeStream(stream.id)}
                                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Add Another Button */}
                    <motion.button
                        onClick={addStream}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#c9b896]/50 text-slate-400 hover:text-[#c9b896] flex items-center justify-center gap-2 transition-all mb-6 group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">Add Another Income Source</span>
                    </motion.button>

                    {/* Monthly Total Display */}
                    {monthlyTotal > 0 && (
                        <motion.div
                            className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <p className="text-sm text-emerald-400/80 mb-1 font-medium">Estimated Monthly Income</p>
                            <motion.p
                                className="text-4xl font-bold font-mono bg-gradient-to-r from-emerald-400 to-[#7dd3a8] bg-clip-text text-transparent"
                                key={monthlyTotal}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                            >
                                ${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </motion.p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            onClick={handleContinue}
                            className="w-full bg-gradient-to-r from-[#c9b896] to-[#b8a785] hover:from-[#b8a785] hover:to-[#a89775] text-[#0a0a0f] py-3.5 font-semibold shadow-lg shadow-[#c9b896]/20"
                            icon={<ArrowRight className="w-5 h-5" />}
                            disabled={!streams.some(s => s.name && s.amount > 0)}
                        >
                            Continue
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className="w-full text-slate-500 hover:text-white border border-white/10"
                        >
                            Skip for now
                        </Button>
                    </motion.div>
                </div>

                {/* Life Builder Visual Panel */}
                <div className="lg:w-[420px] xl:w-[480px] order-1 lg:order-2 lg:sticky lg:top-24 self-start">
                    {/* Desktop: Full Life Builder */}
                    <motion.div
                        className="hidden lg:block"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-base font-medium text-slate-300 mb-4 text-center">
                            Watch Your Income Flow
                        </h3>
                        <LifeBuilder
                            state={lifeBuilderState}
                            compact={false}
                        />
                        <p className="text-center text-xs text-slate-500 mt-4 px-4">
                            Your income is the foundation of your financial life. Next, we&apos;ll add your expenses.
                        </p>
                    </motion.div>

                    {/* Mobile: Compact at top */}
                    <div className="lg:hidden mb-6">
                        <LifeBuilder
                            state={lifeBuilderState}
                            compact={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IncomeEntryStep;
