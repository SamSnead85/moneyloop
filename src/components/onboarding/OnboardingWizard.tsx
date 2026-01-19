'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { WizardProgress } from './WizardProgress';
import { PathSelector } from './steps/PathSelector';
import { BankConnectionStep } from './steps/BankConnectionStep';
import { AIAnalysisStep } from './steps/AIAnalysisStep';
import { ExpenseReviewStep } from './steps/ExpenseReviewStep';
import { IncomeEntryStep } from './steps/IncomeEntryStep';
import { ExpenseQuestionnaireStep } from './steps/ExpenseQuestionnaireStep';
import { FileUploadStep } from './steps/FileUploadStep';
import { CompletionStep } from './steps/CompletionStep';
import { DataConsentModal } from './DataConsentModal';

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
const MANUAL_STEPS = ['path', 'income', 'expenses', 'upload', 'complete'];

export function OnboardingWizard() {
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
    });
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Get steps based on selected path
    const steps = state.path === 'ai_assisted' ? AI_STEPS :
        state.path === 'manual' ? MANUAL_STEPS :
            ['path'];

    // Load existing progress from database
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
                    setState(prev => ({
                        ...prev,
                        path: progress.onboarding_path as OnboardingPath,
                        currentStep: steps.indexOf(progress.current_step) || 0,
                        completedSteps: progress.completed_steps || [],
                        bankConnected: progress.bank_connected,
                        emailConnected: progress.email_connected,
                        incomeEntered: progress.income_entered,
                        expensesEntered: progress.expenses_entered,
                    }));
                }
            } catch (error) {
                console.error('Error loading onboarding progress:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProgress();
    }, []);

    // Save progress to database
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
            console.error('Error saving onboarding progress:', error);
        }
    }, [state, steps, supabase]);

    // Handle path selection
    const handlePathSelect = (path: OnboardingPath) => {
        if (path === 'ai_assisted') {
            setShowConsentModal(true);
        } else {
            const newState = { ...state, path, currentStep: 1 };
            setState(newState);
            saveProgress(newState);
        }
    };

    // Handle consent confirmation
    const handleConsentConfirm = () => {
        setShowConsentModal(false);
        const newState = { ...state, path: 'ai_assisted' as OnboardingPath, currentStep: 1 };
        setState(newState);
        saveProgress(newState);
    };

    // Handle step navigation
    const nextStep = () => {
        const newStep = state.currentStep + 1;
        const completed = [...state.completedSteps, state.currentStep];
        const newState = { ...state, currentStep: newStep, completedSteps: completed };
        setState(newState);
        saveProgress(newState);
    };

    const prevStep = () => {
        if (state.currentStep > 0) {
            const newState = { ...state, currentStep: state.currentStep - 1 };
            setState(newState);
        }
    };

    // Handle skip
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

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error skipping onboarding:', error);
        }
    };

    // Handle completion
    const handleComplete = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('onboarding_progress').update({
                completed_at: new Date().toISOString(),
            }).eq('user_id', user.id);

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    // Update state helpers
    const updateState = (updates: Partial<OnboardingState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="w-8 h-8 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Render current step
    const renderStep = () => {
        const currentStepName = steps[state.currentStep];

        switch (currentStepName) {
            case 'path':
                return (
                    <PathSelector
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
                            updateState({ detectedExpenses: confirmed, expensesEntered: true });
                            nextStep();
                        }}
                    />
                );
            case 'income':
                return (
                    <IncomeEntryStep
                        incomeStreams={state.incomeStreams}
                        onComplete={(streams) => {
                            updateState({ incomeStreams: streams, incomeEntered: true });
                            nextStep();
                        }}
                        onSkip={nextStep}
                    />
                );
            case 'expenses':
                return (
                    <ExpenseQuestionnaireStep
                        expenses={state.manualExpenses}
                        onComplete={(expenses) => {
                            updateState({ manualExpenses: expenses, expensesEntered: true });
                            nextStep();
                        }}
                        onSkip={nextStep}
                    />
                );
            case 'upload':
                return (
                    <FileUploadStep
                        onComplete={nextStep}
                        onSkip={nextStep}
                    />
                );
            case 'complete':
                return (
                    <CompletionStep
                        path={state.path}
                        onComplete={handleComplete}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#34d399]/5 via-transparent to-[#818cf8]/5 pointer-events-none" />

            {/* Progress Header */}
            {state.path && state.currentStep > 0 && state.currentStep < steps.length - 1 && (
                <WizardProgress
                    steps={steps.slice(1, -1)} // Exclude path and complete steps
                    currentStep={state.currentStep - 1}
                    onBack={prevStep}
                />
            )}

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Consent Modal */}
            <DataConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onConfirm={handleConsentConfirm}
            />
        </div>
    );
}

export default OnboardingWizard;
