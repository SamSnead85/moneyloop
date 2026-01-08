'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

// Premium step components
import { PremiumPathSelector } from './steps/PremiumPathSelector';
import { PremiumIncomeEntry } from './steps/PremiumIncomeEntry';
import { PremiumExpenseQuestionnaire } from './steps/PremiumExpenseQuestionnaire';
import { PremiumCompletionStep } from './steps/PremiumCompletionStep';

// Original components for AI-assisted flow (can be updated later)
import { BankConnectionStep } from './steps/BankConnectionStep';
import { AIAnalysisStep } from './steps/AIAnalysisStep';
import { ExpenseReviewStep } from './steps/ExpenseReviewStep';

import { DataConsentModal } from './DataConsentModal';
import { Surface, Text } from '@/components/primitives';

export type OnboardingPath = 'ai_assisted' | 'manual' | 'skipped' | null;

export interface OnboardingState {
    path: OnboardingPath;
    currentStep: number;
    completedSteps: number[];
    bankConnected: boolean;
    emailConnected: boolean;
    incomeEntered: boolean;
    expensesEntered: boolean;
    detectedExpenses: DetectedExpense[];
    manualExpenses: ManualExpense[];
    incomeStreams: IncomeStream[];
    totalIncome: number;
    totalExpenses: number;
}

export interface DetectedExpense {
    id: string;
    name: string;
    amount: number;
    category: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    confirmed: boolean;
}

export interface ManualExpense {
    id: string;
    category: string;
    name: string;
    amount: number;
    frequency: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface IncomeStream {
    id: string;
    name: string;
    source: string;
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'annually';
}

const AI_STEPS = ['path', 'bank', 'analysis', 'review', 'complete'];
const MANUAL_STEPS = ['path', 'income', 'expenses', 'complete'];

export function PremiumOnboardingWizard() {
    const [state, setState] = useState<OnboardingState>({
        path: null,
        currentStep: 0,
        completedSteps: [],
        bankConnected: false,
        emailConnected: false,
        incomeEntered: false,
        expensesEntered: false,
        detectedExpenses: [],
        manualExpenses: [],
        incomeStreams: [],
        totalIncome: 0,
        totalExpenses: 0,
    });
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const steps = state.path === 'ai_assisted' ? AI_STEPS :
        state.path === 'manual' ? MANUAL_STEPS :
            ['path'];

    // Load existing progress
    useEffect(() => {
        async function loadProgress() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: progress } = await supabase
                    .from('onboarding_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (progress) {
                    const pathSteps = progress.onboarding_path === 'ai_assisted' ? AI_STEPS :
                        progress.onboarding_path === 'manual' ? MANUAL_STEPS : ['path'];

                    setState(prev => ({
                        ...prev,
                        path: progress.onboarding_path as OnboardingPath,
                        currentStep: pathSteps.indexOf(progress.current_step) || 0,
                        completedSteps: progress.completed_steps || [],
                        bankConnected: progress.bank_connected,
                        emailConnected: progress.email_connected,
                        incomeEntered: progress.income_entered,
                        expensesEntered: progress.expenses_entered,
                    }));
                }
            } catch (error) {
                console.error('Error loading progress:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProgress();
    }, [supabase]);

    // Save progress
    const saveProgress = useCallback(async (updates: Partial<OnboardingState>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const currentStepName = steps[updates.currentStep ?? state.currentStep] || 'path';

            await supabase.from('onboarding_progress').upsert({
                user_id: user.id,
                onboarding_path: updates.path ?? state.path,
                current_step: currentStepName,
                completed_steps: updates.completedSteps ?? state.completedSteps,
                bank_connected: updates.bankConnected ?? state.bankConnected,
                email_connected: updates.emailConnected ?? state.emailConnected,
                income_entered: updates.incomeEntered ?? state.incomeEntered,
                expenses_entered: updates.expensesEntered ?? state.expensesEntered,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [state, steps, supabase]);

    // Path selection
    const handlePathSelect = (path: OnboardingPath) => {
        if (path === 'ai_assisted') {
            setShowConsentModal(true);
        } else {
            const newState = { ...state, path, currentStep: 1 };
            setState(newState);
            saveProgress(newState);
        }
    };

    const handleConsentConfirm = () => {
        setShowConsentModal(false);
        const newState = { ...state, path: 'ai_assisted' as OnboardingPath, currentStep: 1 };
        setState(newState);
        saveProgress(newState);
    };

    // Navigation
    const nextStep = () => {
        const newStep = state.currentStep + 1;
        const completed = [...state.completedSteps, state.currentStep];
        const newState = { ...state, currentStep: newStep, completedSteps: completed };
        setState(newState);
        saveProgress(newState);
    };

    const prevStep = () => {
        if (state.currentStep > 0) {
            setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
        }
    };

    // Skip
    const handleSkip = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('onboarding_progress').upsert({
                user_id: user.id,
                onboarding_path: 'skipped',
                current_step: 'skipped',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error skipping:', error);
        }
    };

    // Complete
    const handleComplete = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('onboarding_progress').update({
                completed_at: new Date().toISOString(),
            }).eq('user_id', user.id);

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error completing:', error);
        }
    };

    // State updates
    const updateState = (updates: Partial<OnboardingState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Calculate totals for income
    const calculateMonthlyIncome = (streams: IncomeStream[]): number => {
        return streams.reduce((sum, s) => {
            const multipliers: Record<string, number> = {
                weekly: 4.33,
                biweekly: 2.17,
                monthly: 1,
                annually: 1 / 12,
            };
            return sum + s.amount * (multipliers[s.frequency] || 1);
        }, 0);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    <Text variant="body-sm" color="tertiary">Loading your progress...</Text>
                </div>
            </div>
        );
    }

    // Render current step
    const renderStep = () => {
        const currentStepName = steps[state.currentStep];

        switch (currentStepName) {
            case 'path':
                return (
                    <PremiumPathSelector
                        onSelect={handlePathSelect}
                        onSkip={handleSkip}
                    />
                );

            case 'bank':
                return (
                    <BankConnectionStep
                        onComplete={() => {
                            updateState({ bankConnected: true });
                            nextStep();
                        }}
                        onSkip={nextStep}
                    />
                );

            case 'analysis':
                return (
                    <AIAnalysisStep
                        onComplete={(expenses) => {
                            updateState({ detectedExpenses: expenses });
                            nextStep();
                        }}
                    />
                );

            case 'review':
                return (
                    <ExpenseReviewStep
                        expenses={state.detectedExpenses}
                        onConfirm={(confirmed) => {
                            const totalExp = confirmed.reduce((sum, e) => sum + e.amount, 0);
                            updateState({
                                detectedExpenses: confirmed,
                                expensesEntered: true,
                                totalExpenses: totalExp,
                            });
                            nextStep();
                        }}
                    />
                );

            case 'income':
                return (
                    <PremiumIncomeEntry
                        incomeStreams={state.incomeStreams}
                        onComplete={(streams) => {
                            const monthlyIncome = calculateMonthlyIncome(streams);
                            updateState({
                                incomeStreams: streams,
                                incomeEntered: true,
                                totalIncome: monthlyIncome,
                            });
                            nextStep();
                        }}
                        onSkip={nextStep}
                        onBack={prevStep}
                    />
                );

            case 'expenses':
                return (
                    <PremiumExpenseQuestionnaire
                        expenses={state.manualExpenses}
                        monthlyIncome={state.totalIncome}
                        onComplete={(expenses) => {
                            const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
                            updateState({
                                manualExpenses: expenses,
                                expensesEntered: true,
                                totalExpenses: totalExp,
                            });
                            nextStep();
                        }}
                        onSkip={nextStep}
                        onBack={prevStep}
                    />
                );

            case 'complete':
                return (
                    <PremiumCompletionStep
                        path={state.path}
                        onComplete={handleComplete}
                        stats={{
                            income: state.totalIncome,
                            expenses: state.totalExpenses,
                            accounts: state.bankConnected ? 1 : 0,
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${state.path}-${state.currentStep}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>

            {/* Consent Modal */}
            <DataConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onConfirm={handleConsentConfirm}
            />
        </div>
    );
}

export default PremiumOnboardingWizard;
