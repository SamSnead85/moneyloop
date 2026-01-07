'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, DollarSign, Briefcase, Building2, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import type { IncomeStream } from '../OnboardingWizard';
import { LifeBuilder } from '../LifeBuilder';

interface IncomeEntryStepProps {
    incomeStreams: IncomeStream[];
    onComplete: (streams: IncomeStream[]) => void;
    onSkip: () => void;
}

const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
] as const;

const incomeTypes = [
    { icon: Briefcase, label: 'Salary', source: 'Employment' },
    { icon: Building2, label: 'Freelance', source: 'Self-employment' },
    { icon: Coins, label: 'Investments', source: 'Dividends/Interest' },
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
        switch (s.frequency) {
            case 'weekly': return sum + (amount * 4.33);
            case 'biweekly': return sum + (amount * 2.17);
            case 'monthly': return sum + amount;
            case 'annually': return sum + (amount / 12);
            default: return sum + amount;
        }
    }, 0);

    const handleContinue = () => {
        const validStreams = streams.filter(s => s.name && s.amount > 0);
        onComplete(validStreams);
    };

    return (
        <div className="max-w-xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 rounded-2xl bg-[#c9b896]/10 flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="w-8 h-8 text-[#c9b896]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    What&apos;s Your Income?
                </h1>
                <p className="text-slate-400">
                    Add your income sources so we can help you budget effectively.
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
                    <button
                        key={type.label}
                        onClick={() => {
                            if (streams.length === 1 && !streams[0].name) {
                                updateStream(streams[0].id, { name: type.label, source: type.source });
                            }
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#c9b896]/50 transition-colors"
                    >
                        <type.icon className="w-6 h-6 text-[#c9b896]" />
                        <span className="text-sm">{type.label}</span>
                    </button>
                ))}
            </motion.div>

            {/* Income Streams */}
            <div className="space-y-4 mb-6">
                {streams.map((stream, index) => (
                    <motion.div
                        key={stream.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">
                                        Income Name
                                    </label>
                                    <input
                                        type="text"
                                        value={stream.name}
                                        onChange={(e) => updateStream(stream.id, { name: e.target.value })}
                                        placeholder="e.g., Primary Salary"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-[#c9b896]/50 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Amount & Frequency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">
                                            Amount
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="number"
                                                value={stream.amount || ''}
                                                onChange={(e) => updateStream(stream.id, { amount: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 focus:border-[#c9b896]/50 focus:outline-none transition-colors font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">
                                            Frequency
                                        </label>
                                        <select
                                            value={stream.frequency}
                                            onChange={(e) => updateStream(stream.id, { frequency: e.target.value as IncomeStream['frequency'] })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-[#c9b896]/50 focus:outline-none transition-colors appearance-none cursor-pointer"
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

                            {/* Remove */}
                            {streams.length > 1 && (
                                <button
                                    onClick={() => removeStream(stream.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Another */}
            <motion.button
                onClick={addStream}
                className="w-full p-3 rounded-xl border border-dashed border-white/20 hover:border-[#c9b896]/50 text-slate-400 hover:text-[#c9b896] flex items-center justify-center gap-2 transition-colors mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Plus className="w-4 h-4" />
                Add Another Income Source
            </motion.button>

            {/* Monthly Total */}
            {monthlyTotal > 0 && (
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-sm text-slate-400 mb-1">Estimated Monthly Income</p>
                    <p className="text-3xl font-bold font-mono text-[#c9b896]">
                        ${monthlyTotal.toFixed(2)}
                    </p>
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
                    className="w-full bg-[#c9b896] hover:bg-[#b8a785] text-[#0a0a0f] py-3"
                    icon={<ArrowRight className="w-5 h-5" />}
                    disabled={!streams.some(s => s.name && s.amount > 0)}
                >
                    Continue
                </Button>
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="w-full text-slate-500"
                >
                    Skip for now
                </Button>
            </motion.div>

            {/* Life Builder Preview - Shows income flowing in */}
            {monthlyTotal > 0 && (
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <LifeBuilder
                        state={{ income: monthlyTotal }}
                        compact={true}
                    />
                </motion.div>
            )}
        </div>
    );
}

export default IncomeEntryStep;

