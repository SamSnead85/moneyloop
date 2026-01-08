'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Building2,
    Laptop,
    Plus,
    Trash2,
    ArrowRight,
    DollarSign,
    Calendar,
    Check
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { IllustrationGrowth } from '@/components/illustrations';
import type { IncomeStream } from '../OnboardingWizard';

interface PremiumIncomeEntryProps {
    incomeStreams?: IncomeStream[];
    onComplete: (streams: IncomeStream[]) => void;
    onSkip: () => void;
    onBack?: () => void;
}

type IncomeType = 'salary' | 'freelance' | 'investment' | 'other';
type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'annually';

interface IncomeFormData {
    id: string;
    type: IncomeType;
    name: string;
    amount: string;
    frequency: Frequency;
}

const incomeTypes: Array<{
    id: IncomeType;
    label: string;
    icon: typeof Briefcase;
    description: string;
}> = [
        { id: 'salary', label: 'Salary', icon: Building2, description: 'Regular employment income' },
        { id: 'freelance', label: 'Freelance', icon: Laptop, description: 'Contract or gig work' },
        { id: 'investment', label: 'Investment', icon: DollarSign, description: 'Dividends, interest, etc.' },
        { id: 'other', label: 'Other', icon: Briefcase, description: 'Any other income' },
    ];

const frequencies: Array<{ value: Frequency; label: string }> = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
];

export function PremiumIncomeEntry({
    incomeStreams = [],
    onComplete,
    onSkip,
    onBack
}: PremiumIncomeEntryProps) {
    const [streams, setStreams] = useState<IncomeFormData[]>(
        incomeStreams.length > 0
            ? incomeStreams.map(s => ({
                id: s.id,
                type: (s.source as IncomeType) || 'salary',
                name: s.name,
                amount: s.amount.toString(),
                frequency: s.frequency,
            }))
            : [{ id: '1', type: 'salary', name: '', amount: '', frequency: 'monthly' }]
    );

    const [activeStreamId, setActiveStreamId] = useState<string>(streams[0]?.id || '1');

    const activeStream = streams.find(s => s.id === activeStreamId);

    const updateStream = (id: string, updates: Partial<IncomeFormData>) => {
        setStreams(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const addStream = () => {
        const newId = Date.now().toString();
        setStreams(prev => [...prev, {
            id: newId,
            type: 'salary',
            name: '',
            amount: '',
            frequency: 'monthly'
        }]);
        setActiveStreamId(newId);
    };

    const removeStream = (id: string) => {
        if (streams.length <= 1) return;
        const newStreams = streams.filter(s => s.id !== id);
        setStreams(newStreams);
        if (activeStreamId === id) {
            setActiveStreamId(newStreams[0].id);
        }
    };

    const handleComplete = () => {
        const validStreams: IncomeStream[] = streams
            .filter(s => s.amount && parseFloat(s.amount) > 0)
            .map(s => ({
                id: s.id,
                name: s.name || incomeTypes.find(t => t.id === s.type)?.label || 'Income',
                source: s.type,
                amount: parseFloat(s.amount),
                frequency: s.frequency,
            }));
        onComplete(validStreams);
    };

    const totalMonthlyIncome = streams.reduce((sum, s) => {
        const amount = parseFloat(s.amount) || 0;
        const multipliers: Record<Frequency, number> = {
            weekly: 4.33,
            biweekly: 2.17,
            monthly: 1,
            annually: 1 / 12,
        };
        return sum + amount * multipliers[s.frequency];
    }, 0);

    const hasValidIncome = streams.some(s => parseFloat(s.amount || '0') > 0);

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Text variant="caption" color="tertiary" className="mb-3">
                        STEP 2 OF 4
                    </Text>
                    <Text variant="display-lg" as="h1" className="mb-4">
                        What&apos;s your income?
                    </Text>
                    <Text variant="body-lg" color="secondary">
                        Add all your income sources. This helps us calculate your savings potential.
                    </Text>
                </motion.div>

                {/* Income Stream Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {streams.map((stream, i) => (
                        <button
                            key={stream.id}
                            onClick={() => setActiveStreamId(stream.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0
                                ${activeStreamId === stream.id
                                    ? 'bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]'
                                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)]'
                                }
                            `}
                        >
                            {stream.name || incomeTypes.find(t => t.id === stream.type)?.label || `Income ${i + 1}`}
                            {parseFloat(stream.amount || '0') > 0 && (
                                <Check className="w-3 h-3" />
                            )}
                        </button>
                    ))}
                    <button
                        onClick={addStream}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-all shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                {/* Active Stream Form */}
                <AnimatePresence mode="wait">
                    {activeStream && (
                        <motion.div
                            key={activeStream.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Surface elevation={1} className="p-6 mb-6">
                                {/* Income Type */}
                                <div className="mb-6">
                                    <Text variant="body-sm" color="tertiary" className="mb-3">
                                        Income Type
                                    </Text>
                                    <div className="grid grid-cols-2 gap-3">
                                        {incomeTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => updateStream(activeStream.id, { type: type.id })}
                                                className={`
                                                    p-4 rounded-xl border text-left transition-all
                                                    ${activeStream.type === type.id
                                                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)]'
                                                        : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                                                    }
                                                `}
                                            >
                                                <type.icon className={`w-5 h-5 mb-2 ${activeStream.type === type.id
                                                        ? 'text-[var(--accent-primary)]'
                                                        : 'text-[var(--text-tertiary)]'
                                                    }`} />
                                                <Text variant="body-md" className="block mb-0.5">
                                                    {type.label}
                                                </Text>
                                                <Text variant="body-sm" color="tertiary">
                                                    {type.description}
                                                </Text>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Divider className="my-6" />

                                {/* Amount & Frequency */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <Text variant="body-sm" color="tertiary" className="mb-2 block">
                                            Amount
                                        </Text>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                value={activeStream.amount}
                                                onChange={(e) => updateStream(activeStream.id, { amount: e.target.value })}
                                                placeholder="0"
                                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none font-mono text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Text variant="body-sm" color="tertiary" className="mb-2 block">
                                            Frequency
                                        </Text>
                                        <select
                                            value={activeStream.frequency}
                                            onChange={(e) => updateStream(activeStream.id, { frequency: e.target.value as Frequency })}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                                        >
                                            {frequencies.map((f) => (
                                                <option key={f.value} value={f.value} className="bg-[var(--surface-base)]">
                                                    {f.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Optional Name */}
                                <div>
                                    <Text variant="body-sm" color="tertiary" className="mb-2 block">
                                        Source Name <span className="text-[var(--text-quaternary)]">(optional)</span>
                                    </Text>
                                    <input
                                        type="text"
                                        value={activeStream.name}
                                        onChange={(e) => updateStream(activeStream.id, { name: e.target.value })}
                                        placeholder={`e.g., ${activeStream.type === 'salary' ? 'Acme Corp' : 'Side Projects'}`}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                                    />
                                </div>

                                {/* Remove button */}
                                {streams.length > 1 && (
                                    <button
                                        onClick={() => removeStream(activeStream.id)}
                                        className="flex items-center gap-2 mt-4 text-sm text-[var(--text-quaternary)] hover:text-[var(--accent-danger)] transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove this income
                                    </button>
                                )}
                            </Surface>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Total Summary */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <Surface elevation={0} className="p-4 flex items-center justify-between">
                        <div>
                            <Text variant="body-sm" color="tertiary">Estimated Monthly Income</Text>
                            <Text variant="mono-lg" color="accent">
                                {totalMonthlyIncome.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0
                                })}
                            </Text>
                        </div>
                        <Calendar className="w-5 h-5 text-[var(--text-quaternary)]" />
                    </Surface>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSkip}
                        className="px-6 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={!hasValidIncome}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                            ${hasValidIncome
                                ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:brightness-110'
                                : 'bg-[var(--surface-elevated-2)] text-[var(--text-quaternary)] cursor-not-allowed'
                            }
                        `}
                    >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Right Panel - Visualization */}
            <div className="hidden lg:flex w-[40%] bg-[var(--surface-elevated)] items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 w-full max-w-sm px-8"
                >
                    <IllustrationGrowth className="w-full h-auto mb-8" animate />

                    {totalMonthlyIncome > 0 && (
                        <div className="text-center">
                            <Text variant="body-sm" color="tertiary" className="mb-2">
                                Projected Annual
                            </Text>
                            <Text variant="mono-xl" color="accent">
                                {(totalMonthlyIncome * 12).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0
                                })}
                            </Text>
                        </div>
                    )}
                </motion.div>

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(var(--border-subtle) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>
        </div>
    );
}

export default PremiumIncomeEntry;
