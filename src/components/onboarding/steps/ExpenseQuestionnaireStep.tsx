'use client';

import { useState } from 'react';
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
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { ManualExpense } from '../OnboardingWizard';

interface ExpenseQuestionnaireStepProps {
    expenses: ManualExpense[];
    onComplete: (expenses: ManualExpense[]) => void;
    onSkip: () => void;
}

interface Question {
    id: string;
    category: string;
    icon: typeof Smartphone;
    question: string;
    placeholder: string;
    options?: string[];
}

const questions: Question[] = [
    {
        id: 'phone',
        category: 'Phone',
        icon: Smartphone,
        question: "Who is your cell phone provider?",
        placeholder: "e.g., Verizon, AT&T, T-Mobile",
        options: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Other'],
    },
    {
        id: 'electric',
        category: 'Utilities',
        icon: Zap,
        question: "How much is your monthly electric bill?",
        placeholder: "Average amount",
    },
    {
        id: 'internet',
        category: 'Internet',
        icon: Wifi,
        question: "How much do you pay for internet?",
        placeholder: "Monthly amount",
    },
    {
        id: 'housing',
        category: 'Housing',
        icon: Home,
        question: "What's your monthly rent or mortgage?",
        placeholder: "Monthly payment",
    },
    {
        id: 'car',
        category: 'Transportation',
        icon: Car,
        question: "Do you have a car payment? How much?",
        placeholder: "Monthly payment or $0",
    },
    {
        id: 'insurance',
        category: 'Insurance',
        icon: CreditCard,
        question: "How much do you pay for car insurance?",
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

    const handleOptionSelect = (option: string) => {
        setNameValue(option);
    };

    const totalSoFar = Object.values(answers).reduce((sum, a) => sum + a.amount, 0);

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#c9b896] to-[#b8a785] rounded-full"
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
                    className="bg-white/[0.02] rounded-2xl border border-white/10 p-6 mb-6"
                >
                    {/* AI Avatar */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#c9b896]/10 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-6 h-6 text-[#c9b896]" />
                        </div>
                        <div>
                            <p className="text-lg font-medium mb-1">{question.question}</p>
                            <p className="text-sm text-slate-500">
                                Enter $0 if you don&apos;t have this expense
                            </p>
                        </div>
                    </div>

                    {/* Quick Options (if available) */}
                    {question.options && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm transition-all
                                        ${nameValue === option
                                            ? 'bg-[#c9b896] text-[#0a0a0f]'
                                            : 'bg-white/5 hover:bg-white/10'}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Provider Name (if options were shown) */}
                    {question.options && nameValue === 'Other' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter provider name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-[#c9b896]/50 focus:outline-none transition-colors"
                                onChange={(e) => setNameValue(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">$</div>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={question.placeholder}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-2xl font-mono focus:border-[#c9b896]/50 focus:outline-none transition-colors"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleNext();
                                }
                            }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">/month</div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Running Total */}
            {totalSoFar > 0 && (
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-sm text-slate-400 mb-1">Expenses so far</p>
                    <p className="text-2xl font-bold font-mono text-[#c9b896]">
                        ${totalSoFar.toFixed(2)}/mo
                    </p>
                </motion.div>
            )}

            {/* Answered Questions Summary */}
            {Object.keys(answers).length > 0 && (
                <motion.div
                    className="flex flex-wrap gap-2 justify-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {Object.entries(answers).map(([id, data]) => (
                        <div
                            key={id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c9b896]/10 text-[#c9b896] text-sm"
                        >
                            <Check className="w-3 h-3" />
                            {data.name}: ${data.amount}
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="flex-1 text-slate-500"
                >
                    Skip All
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex-1 bg-[#c9b896] hover:bg-[#b8a785] text-[#0a0a0f]"
                    icon={<ArrowRight className="w-5 h-5" />}
                >
                    {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
                </Button>
            </div>
        </div>
    );
}

export default ExpenseQuestionnaireStep;
