'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Car,
    Zap,
    Wifi,
    Phone,
    ShoppingBag,
    Fuel,
    CreditCard,
    Utensils,
    Tv,
    Dumbbell,
    Heart,
    ArrowRight,
    ArrowLeft,
    Check,
    SkipForward
} from 'lucide-react';
import { Surface, Text, Progress, Divider } from '@/components/primitives';
import { FinancialSnapshot } from '../FinancialSnapshot';
import type { ManualExpense } from '../OnboardingWizard';

interface PremiumExpenseQuestionnaireProps {
    expenses?: ManualExpense[];
    onComplete: (expenses: ManualExpense[]) => void;
    onSkip: () => void;
    onBack?: () => void;
    monthlyIncome?: number;
}

interface ExpenseCategory {
    id: string;
    name: string;
    icon: typeof Home;
    question: string;
    placeholder: string;
    color: string;
    typical?: string;
}

const expenseCategories: ExpenseCategory[] = [
    {
        id: 'housing',
        name: 'Housing',
        icon: Home,
        question: 'What is your monthly rent or mortgage payment?',
        placeholder: 'Monthly housing cost',
        color: 'var(--chart-3)',
        typical: 'Typically 25-35% of income',
    },
    {
        id: 'transportation',
        name: 'Transportation',
        icon: Car,
        question: 'How much do you spend on car payments?',
        placeholder: 'Car payment or $0 if none',
        color: 'var(--chart-4)',
    },
    {
        id: 'utilities',
        name: 'Utilities',
        icon: Zap,
        question: 'What are your monthly utility costs?',
        placeholder: 'Electric, water, gas combined',
        color: 'var(--chart-5)',
        typical: 'Electric, water, gas',
    },
    {
        id: 'internet',
        name: 'Internet & Phone',
        icon: Wifi,
        question: 'How much do you pay for internet and phone?',
        placeholder: 'Monthly internet + phone',
        color: 'var(--chart-6)',
    },
    {
        id: 'groceries',
        name: 'Groceries',
        icon: ShoppingBag,
        question: 'What is your monthly grocery budget?',
        placeholder: 'Food and household items',
        color: 'var(--chart-1)',
        typical: 'Average $400-800/month',
    },
    {
        id: 'dining',
        name: 'Dining Out',
        icon: Utensils,
        question: 'How much do you spend on restaurants and takeout?',
        placeholder: 'Eating out and delivery',
        color: 'var(--chart-7)',
    },
    {
        id: 'fuel',
        name: 'Gas & Transit',
        icon: Fuel,
        question: 'What are your monthly transportation costs?',
        placeholder: 'Gas, parking, transit passes',
        color: 'var(--chart-8)',
    },
    {
        id: 'insurance',
        name: 'Insurance',
        icon: CreditCard,
        question: 'How much do you pay for insurance?',
        placeholder: 'Car, health, home insurance',
        color: 'var(--chart-2)',
        typical: 'Car, health, renter\'s',
    },
    {
        id: 'subscriptions',
        name: 'Subscriptions',
        icon: Tv,
        question: 'What are your monthly subscription costs?',
        placeholder: 'Streaming, software, memberships',
        color: 'var(--chart-4)',
    },
    {
        id: 'health',
        name: 'Health & Wellness',
        icon: Heart,
        question: 'How much do you spend on health and fitness?',
        placeholder: 'Gym, medications, wellness',
        color: 'var(--chart-1)',
    },
];

export function PremiumExpenseQuestionnaire({
    expenses: initial = [],
    onComplete,
    onSkip,
    onBack,
    monthlyIncome = 0,
}: PremiumExpenseQuestionnaireProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>(() => {
        const initialAnswers: Record<string, number> = {};
        initial.forEach(exp => {
            const category = expenseCategories.find(c => c.id === exp.category.toLowerCase());
            if (category) {
                initialAnswers[category.id] = exp.amount;
            }
        });
        return initialAnswers;
    });
    const [inputValue, setInputValue] = useState('');

    const currentCategory = expenseCategories[currentIndex];
    const progress = ((currentIndex + 1) / expenseCategories.length) * 100;

    const handleNext = () => {
        if (inputValue) {
            const amount = parseFloat(inputValue) || 0;
            if (amount > 0) {
                setAnswers(prev => ({ ...prev, [currentCategory.id]: amount }));
            }
        }

        if (currentIndex < expenseCategories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            const nextCategory = expenseCategories[currentIndex + 1];
            setInputValue(answers[nextCategory.id]?.toString() || '');
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            // Save current value before going back
            if (inputValue) {
                const amount = parseFloat(inputValue) || 0;
                if (amount > 0) {
                    setAnswers(prev => ({ ...prev, [currentCategory.id]: amount }));
                }
            }
            setCurrentIndex(currentIndex - 1);
            const prevCategory = expenseCategories[currentIndex - 1];
            setInputValue(answers[prevCategory.id]?.toString() || '');
        } else if (onBack) {
            onBack();
        }
    };

    const handleComplete = () => {
        // Save final input
        const finalAnswers = { ...answers };
        if (inputValue) {
            const amount = parseFloat(inputValue) || 0;
            if (amount > 0) {
                finalAnswers[currentCategory.id] = amount;
            }
        }

        const allExpenses: ManualExpense[] = Object.entries(finalAnswers)
            .filter(([_, amount]) => amount > 0)
            .map(([id, amount]) => ({
                id,
                category: expenseCategories.find(c => c.id === id)?.name || id,
                name: expenseCategories.find(c => c.id === id)?.name || id,
                amount,
                frequency: 'monthly',
            }));

        onComplete(allExpenses);
    };

    const totalExpenses = useMemo(() => {
        let total = Object.values(answers).reduce((sum, amt) => sum + amt, 0);
        if (inputValue && !answers[currentCategory.id]) {
            total += parseFloat(inputValue) || 0;
        }
        return total;
    }, [answers, inputValue, currentCategory.id]);

    const snapshotCategories = useMemo(() => {
        return Object.entries(answers).map(([id, amount]) => ({
            name: expenseCategories.find(c => c.id === id)?.name || id,
            amount,
            color: expenseCategories.find(c => c.id === id)?.color || 'var(--accent-primary)',
        }));
    }, [answers]);

    const answeredCount = Object.keys(answers).length;
    const Icon = currentCategory.icon;

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Question */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 max-w-2xl">
                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Text variant="caption" color="tertiary">
                            STEP 3 OF 4 · EXPENSES
                        </Text>
                        <Text variant="mono-sm" color="tertiary">
                            {currentIndex + 1} / {expenseCategories.length}
                        </Text>
                    </div>
                    <Progress value={progress} max={100} size="sm" />
                </motion.div>

                {/* Category Icon & Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCategory.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-start gap-4 mb-8">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `color-mix(in srgb, ${currentCategory.color} 15%, transparent)` }}
                            >
                                <Icon className="w-7 h-7" style={{ color: currentCategory.color }} />
                            </div>
                            <div>
                                <Text variant="heading-lg" as="h2" className="mb-2">
                                    {currentCategory.question}
                                </Text>
                                {currentCategory.typical && (
                                    <Text variant="body-sm" color="tertiary">
                                        {currentCategory.typical}
                                    </Text>
                                )}
                            </div>
                        </div>

                        {/* Amount Input */}
                        <Surface elevation={1} className="p-6 mb-6">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-3xl font-light">
                                    $
                                </span>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="0"
                                    autoFocus
                                    className="w-full pl-14 pr-24 py-6 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none font-mono text-4xl"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleNext();
                                    }}
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)]">
                                    /month
                                </span>
                            </div>
                        </Surface>

                        {/* Quick amounts */}
                        <div className="flex gap-2 mb-8 flex-wrap">
                            {[0, 50, 100, 200, 500].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setInputValue(amount.toString())}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-mono transition-all
                                        ${inputValue === amount.toString()
                                            ? 'bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]'
                                            : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated-2)]'
                                        }
                                    `}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Answered Categories */}
                {answeredCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {Object.entries(answers).map(([id, amount]) => {
                            const cat = expenseCategories.find(c => c.id === id);
                            return (
                                <motion.div
                                    key={id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] text-sm"
                                >
                                    <Check className="w-3 h-3 text-[var(--accent-primary)]" />
                                    <span className="text-[var(--text-secondary)]">{cat?.name}</span>
                                    <span className="text-[var(--text-quaternary)] font-mono">
                                        ${amount}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <button
                        onClick={() => {
                            setInputValue('');
                            handleNext();
                        }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                        Skip
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-[var(--text-inverse)] font-medium hover:brightness-110 transition-all"
                    >
                        {currentIndex < expenseCategories.length - 1 ? 'Next' : 'Finish'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Skip All */}
                <button
                    onClick={onSkip}
                    className="mt-6 text-center text-sm text-[var(--text-quaternary)] hover:text-[var(--text-tertiary)] transition-colors"
                >
                    Skip expense entry
                </button>
            </div>

            {/* Right Panel - Financial Snapshot */}
            <div className="hidden lg:flex w-[40%] bg-[var(--surface-elevated)] items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-[var(--accent-danger)]/3 via-transparent to-transparent" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <FinancialSnapshot
                        income={monthlyIncome}
                        expenses={totalExpenses}
                        categories={snapshotCategories}
                    />

                    {/* Total running */}
                    <Surface elevation={0} className="p-4 mt-4 text-center">
                        <Text variant="body-sm" color="tertiary" className="mb-1">
                            Total Monthly Expenses
                        </Text>
                        <Text variant="mono-xl" color="danger">
                            ${totalExpenses.toLocaleString()}
                        </Text>
                    </Surface>
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

export default PremiumExpenseQuestionnaire;
