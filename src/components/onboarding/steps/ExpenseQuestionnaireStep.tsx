'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    Zap,
    Home,
    Car,
    Wifi,
    CreditCard,
    ArrowRight,
    Check,
    MessageCircle,
    ShoppingBag,
    Fuel,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { ManualExpense } from '../OnboardingWizard';
import { LifeBuilder, LifeBuilderState } from '../LifeBuilder';

interface ExpenseQuestionnaireStepProps {
    expenses: ManualExpense[];
    onComplete: (expenses: ManualExpense[]) => void;
    onSkip: () => void;
}

interface Question {
    id: string;
    category: string;
    lifeKey: keyof LifeBuilderState;
    icon: typeof Smartphone;
    question: string;
    subtext: string;
    placeholder: string;
    options?: string[];
}

const questions: Question[] = [
    {
        id: 'housing',
        category: 'Housing',
        lifeKey: 'housing',
        icon: Home,
        question: "What's your monthly rent or mortgage?",
        subtext: "This is typically your biggest expense",
        placeholder: "Monthly payment",
    },
    {
        id: 'car',
        category: 'Transportation',
        lifeKey: 'car',
        icon: Car,
        question: "Do you have a car payment?",
        subtext: "Enter $0 if you own your car or don't have one",
        placeholder: "Monthly payment or $0",
    },
    {
        id: 'electric',
        category: 'Utilities',
        lifeKey: 'utilities',
        icon: Zap,
        question: "How much is your monthly electric bill?",
        subtext: "This will light up your home in the visual!",
        placeholder: "Average amount",
    },
    {
        id: 'insurance',
        category: 'Insurance',
        lifeKey: 'insurance',
        icon: CreditCard,
        question: "How much do you pay for car insurance?",
        subtext: "This protects your vehicle from the boot!",
        placeholder: "Monthly amount",
    },
    {
        id: 'phone',
        category: 'Phone',
        lifeKey: 'phone',
        icon: Smartphone,
        question: "Who is your cell phone provider?",
        subtext: "Stay connected with the world",
        placeholder: "e.g., Verizon, AT&T, T-Mobile",
        options: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Other'],
    },
    {
        id: 'groceries',
        category: 'Groceries',
        lifeKey: 'groceries',
        icon: ShoppingBag,
        question: "How much do you spend on groceries?",
        subtext: "Everyone needs to eat!",
        placeholder: "Monthly amount",
    },
    {
        id: 'gas',
        category: 'Gas/Transportation',
        lifeKey: 'gas',
        icon: Fuel,
        question: "How much do you spend on gas or transit?",
        subtext: "Getting to work and school",
        placeholder: "Monthly amount",
    },
    {
        id: 'internet',
        category: 'Internet',
        lifeKey: 'utilities',
        icon: Wifi,
        question: "How much do you pay for internet?",
        subtext: "Keeping your home connected",
        placeholder: "Monthly amount",
    },
];

export function ExpenseQuestionnaireStep({ expenses: initial, onComplete, onSkip }: ExpenseQuestionnaireStepProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, { name: string; amount: number }>>({});
    const [inputValue, setInputValue] = useState('');
    const [nameValue, setNameValue] = useState('');

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleNext = () => {
        if (inputValue) {
            const amount = parseFloat(inputValue) || 0;
            if (amount > 0) {
                setAnswers({
                    ...answers,
                    [question.id]: {
                        name: nameValue || question.category,
                        amount,
                    },
                });
            }
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setInputValue('');
            setNameValue('');
        } else {
            // Complete
            const allExpenses: ManualExpense[] = Object.entries(answers).map(([id, data]) => ({
                id,
                category: questions.find(q => q.id === id)?.category || 'Other',
                name: data.name,
                amount: data.amount,
                frequency: 'monthly',
            }));

            // Add final answer
            if (inputValue) {
                const amount = parseFloat(inputValue) || 0;
                if (amount > 0) {
                    allExpenses.push({
                        id: question.id,
                        category: question.category,
                        name: nameValue || question.category,
                        amount,
                        frequency: 'monthly',
                    });
                }
            }

            onComplete(allExpenses);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            const prevQuestion = questions[currentQuestion - 1];
            const prevAnswer = answers[prevQuestion.id];
            setInputValue(prevAnswer?.amount.toString() || '');
            setNameValue(prevAnswer?.name || '');
        }
    };

    const handleOptionSelect = (option: string) => {
        setNameValue(option);
    };

    const totalSoFar = Object.values(answers).reduce((sum, a) => sum + a.amount, 0);

    // Compute LifeBuilder state from answers
    const lifeBuilderState = useMemo(() => {
        const state: Partial<LifeBuilderState> = { income: 0 }; // Income comes from previous step

        Object.entries(answers).forEach(([id, data]) => {
            const q = questions.find(q => q.id === id);
            if (q && data.amount > 0) {
                const key = q.lifeKey;
                state[key] = (state[key] || 0) + data.amount;
            }
        });

        // Also include current input if it has value
        if (inputValue && parseFloat(inputValue) > 0) {
            const key = question.lifeKey;
            state[key] = (state[key] || 0) + parseFloat(inputValue);
        }

        return state;
    }, [answers, inputValue, question]);

    const Icon = question.icon;

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Two-column layout: Questions left, Life Builder right */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

                {/* Main Questionnaire Panel */}
                <div className="flex-1 lg:max-w-xl order-2 lg:order-1">
                    {/* Progress Bar */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                            <button
                                onClick={handleBack}
                                disabled={currentQuestion === 0}
                                className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <span className="font-mono">{currentQuestion + 1} / {questions.length}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#818cf8] to-[#34d399] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-2xl border border-white/10 p-6 md:p-8 mb-6 backdrop-blur-sm"
                        >
                            {/* Question Header with Icon */}
                            <div className="flex items-start gap-4 mb-6">
                                <motion.div
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#818cf8]/20 to-[#818cf8]/5 flex items-center justify-center flex-shrink-0 border border-[#818cf8]/20"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <Icon className="w-7 h-7 text-[#818cf8]" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <motion.h2
                                        className="text-xl md:text-2xl font-semibold mb-1 leading-tight"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {question.question}
                                    </motion.h2>
                                    <motion.p
                                        className="text-sm text-slate-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {question.subtext}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Quick Options (if available) */}
                            {question.options && (
                                <motion.div
                                    className="flex flex-wrap gap-2 mb-5"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {question.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleOptionSelect(option)}
                                            className={`
                                                px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                                ${nameValue === option
                                                    ? 'bg-[#818cf8] text-[#0a0a0f] shadow-lg shadow-[#818cf8]/20'
                                                    : 'bg-white/5 hover:bg-white/10 border border-white/10'}
                                            `}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {/* Provider Name Input (if "Other" selected) */}
                            {question.options && nameValue === 'Other' && (
                                <motion.div
                                    className="mb-5"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter provider name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-[#818cf8]/50 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/20 transition-all"
                                        onChange={(e) => setNameValue(e.target.value)}
                                    />
                                </motion.div>
                            )}

                            {/* Amount Input */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-light">$</div>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-24 py-5 text-3xl font-mono font-medium focus:border-[#818cf8]/50 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/20 transition-all placeholder:text-slate-600"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleNext();
                                        }
                                    }}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">/month</div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Running Total */}
                    <AnimatePresence>
                        {totalSoFar > 0 && (
                            <motion.div
                                className="text-center mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <p className="text-sm text-slate-400 mb-1">Monthly expenses so far</p>
                                <p className="text-3xl font-bold font-mono bg-gradient-to-r from-[#818cf8] to-[#34d399] bg-clip-text text-transparent">
                                    ${totalSoFar.toLocaleString()}/mo
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Answered Questions Tags */}
                    {Object.keys(answers).length > 0 && (
                        <motion.div
                            className="flex flex-wrap gap-2 justify-center mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {Object.entries(answers).map(([id, data]) => (
                                <motion.div
                                    key={id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#818cf8] text-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Check className="w-3 h-3" />
                                    <span className="font-medium">{data.name}</span>
                                    <span className="text-[#818cf8]/60">${data.amount}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className="flex-1 text-slate-500 hover:text-white border border-white/10"
                        >
                            Skip All
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="flex-1 bg-gradient-to-r from-[#818cf8] to-[#b8a785] hover:from-[#b8a785] hover:to-[#a89775] text-[#0a0a0f] font-semibold shadow-lg shadow-[#818cf8]/20"
                            icon={<ArrowRight className="w-5 h-5" />}
                        >
                            {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
                        </Button>
                    </div>
                </div>

                {/* Life Builder Visual Panel - Sticky on Desktop */}
                <div className="lg:w-[420px] xl:w-[480px] order-1 lg:order-2 lg:sticky lg:top-24 self-start">
                    {/* Desktop: Full Life Builder */}
                    <div className="hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-base font-medium text-slate-300 mb-4 text-center">
                                Watch Your Life Build
                            </h3>
                            <LifeBuilder
                                state={lifeBuilderState}
                                compact={false}
                            />
                        </motion.div>
                    </div>

                    {/* Mobile: Compact Life Builder at top */}
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

export default ExpenseQuestionnaireStep;
