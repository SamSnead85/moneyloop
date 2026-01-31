'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Users,
    CreditCard,
    Heart,
    FileText,
    Check,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    Loader2,
    DollarSign,
    Shield,
    Zap,
    Star,
} from 'lucide-react';

// Step components
import { EliteWelcomeStep } from './steps/EliteWelcomeStep';
import { EliteCompanyStep } from './steps/EliteCompanyStep';
import { ElitePayrollStep } from './steps/ElitePayrollStep';
import { EliteBenefitsStep } from './steps/EliteBenefitsStep';
import { EliteBankingStep } from './steps/EliteBankingStep';
import { EliteReviewStep } from './steps/EliteReviewStep';

// Types
export interface CompanyInfo {
    legalName: string;
    dba: string;
    entityType: 'llc' | 'corporation' | 's_corp' | 'partnership' | 'sole_proprietorship' | 'nonprofit' | '';
    industry: string;
    ein: string;
    address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phone: string;
    website: string;
}

export interface PayrollSetup {
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly' | '';
    firstPayDate: string;
    employeeCount: string;
    hasContractors: boolean;
}

export interface BankingInfo {
    bankName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string;
    accountNumber: string;
    useMercury: boolean;
}

export interface BenefitsConfig {
    offersHealthInsurance: boolean;
    healthInsuranceProvider: string;
    healthEmployerContributionPct: number;
    offers401k: boolean;
    hasEmployerMatch: boolean;
    employerMatchPct: number;
    employerMatchLimitPct: number;
    offersPto: boolean;
    ptoDaysPerYear: number;
    offersDental: boolean;
    offersVision: boolean;
    offersLifeInsurance: boolean;
}

// Step definitions with icons
const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles, description: 'Get started' },
    { id: 'company', title: 'Company', icon: Building2, description: 'Business info' },
    { id: 'payroll', title: 'Payroll', icon: DollarSign, description: 'Pay setup' },
    { id: 'benefits', title: 'Benefits', icon: Heart, description: 'Employee perks' },
    { id: 'banking', title: 'Banking', icon: CreditCard, description: 'Fund payroll' },
    { id: 'review', title: 'Review', icon: FileText, description: 'Confirm setup' },
];

// Particle component for background effects
function FloatingParticle({ delay, size, x }: { delay: number; size: number; x: number }) {
    return (
        <motion.div
            className="absolute rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20"
            style={{
                width: size,
                height: size,
                left: `${x}%`,
                bottom: '-20px',
            }}
            animate={{
                y: [0, -800],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.8],
            }}
            transition={{
                duration: 15 + Math.random() * 10,
                delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    );
}

// Atmospheric background
function AtmosphericBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-[#050508]" />

            {/* Mesh gradient orbs */}
            <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-emerald-500/8 via-emerald-500/3 to-transparent blur-3xl" />
            <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-violet-500/6 via-violet-500/2 to-transparent blur-3xl" />
            <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-gradient-radial from-cyan-500/5 via-cyan-500/1 to-transparent blur-3xl" />

            {/* Floating particles */}
            {[...Array(12)].map((_, i) => (
                <FloatingParticle
                    key={i}
                    delay={i * 1.5}
                    size={4 + Math.random() * 6}
                    x={Math.random() * 100}
                />
            ))}

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        </div>
    );
}

// Elite Progress Indicator
function EliteProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="hidden md:flex items-center gap-2">
            {steps.slice(1).map((step, i) => {
                const stepIndex = i + 1;
                const isCompleted = currentStep > stepIndex;
                const isCurrent = currentStep === stepIndex;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-center">
                        <motion.div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isCompleted
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
                                    : isCurrent
                                        ? 'bg-white/10 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5 text-white" />
                            ) : (
                                <Icon className={`w-5 h-5 ${isCurrent ? 'text-emerald-400' : 'text-white/40'}`} />
                            )}

                            {/* Glow effect for current */}
                            {isCurrent && (
                                <motion.div
                                    className="absolute inset-0 rounded-xl bg-emerald-500/20"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                        </motion.div>

                        {/* Connector line */}
                        {i < steps.length - 2 && (
                            <div className={`w-8 h-0.5 mx-1 rounded-full transition-colors duration-300 ${currentStep > stepIndex ? 'bg-emerald-500' : 'bg-white/10'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Main Wizard Component
export function EliteOnboardingWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        legalName: '',
        dba: '',
        entityType: '',
        industry: '',
        ein: '',
        address: { street1: '', street2: '', city: '', state: '', zipCode: '' },
        phone: '',
        website: '',
    });

    const [payrollSetup, setPayrollSetup] = useState<PayrollSetup>({
        payFrequency: '',
        firstPayDate: '',
        employeeCount: '',
        hasContractors: false,
    });

    const [bankingInfo, setBankingInfo] = useState<BankingInfo>({
        bankName: '',
        accountType: 'checking',
        routingNumber: '',
        accountNumber: '',
        useMercury: false,
    });

    const [benefitsConfig, setBenefitsConfig] = useState<BenefitsConfig>({
        offersHealthInsurance: false,
        healthInsuranceProvider: '',
        healthEmployerContributionPct: 50,
        offers401k: false,
        hasEmployerMatch: false,
        employerMatchPct: 3,
        employerMatchLimitPct: 6,
        offersPto: true,
        ptoDaysPerYear: 15,
        offersDental: false,
        offersVision: false,
        offersLifeInsurance: false,
    });

    // Load existing data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/employer/onboarding');
                if (response.ok) {
                    const data = await response.json();
                    if (data.companyInfo) setCompanyInfo(data.companyInfo);
                    if (data.payrollSetup) setPayrollSetup(data.payrollSetup);
                    if (data.bankingInfo) setBankingInfo(data.bankingInfo);
                    if (data.benefitsConfig) setBenefitsConfig(data.benefitsConfig);
                    // Resume from last step
                    if (data.currentStep) {
                        const stepIndex = steps.findIndex(s => s.id === data.currentStep);
                        if (stepIndex > 0) setCurrentStep(stepIndex);
                    }
                }
            } catch (error) {
                console.error('Failed to load onboarding data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Auto-save progress
    const saveProgress = useCallback(async (stepId: string) => {
        setIsSaving(true);
        try {
            await fetch('/api/employer/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyInfo: companyInfo.legalName ? companyInfo : undefined,
                    payrollSetup: payrollSetup.payFrequency ? payrollSetup : undefined,
                    bankingInfo: bankingInfo.useMercury || bankingInfo.bankName ? bankingInfo : undefined,
                    benefitsConfig,
                    currentStep: stepId,
                }),
            });
        } catch (error) {
            console.error('Failed to save progress:', error);
        } finally {
            setIsSaving(false);
        }
    }, [companyInfo, payrollSetup, bankingInfo, benefitsConfig]);

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await fetch('/api/employer/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyInfo,
                    payrollSetup,
                    bankingInfo,
                    benefitsConfig,
                    currentStep: 'complete',
                    completed: true,
                }),
            });
            // Navigate to employer dashboard
            router.push('/employer');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setIsSubmitting(false);
        }
    };

    const goNext = () => {
        const nextStep = Math.min(currentStep + 1, steps.length - 1);
        setCurrentStep(nextStep);
        saveProgress(steps[nextStep].id);
    };

    const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white/60">Loading your setup...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AtmosphericBackground />

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Elite Header */}
                <header className="px-6 py-5 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <motion.div
                            className="relative group"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/30 to-violet-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-white">MoneyLoop</span>
                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-violet-500/20 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                                    Employer
                                </span>
                            </div>
                            <span className="text-xs text-white/40">Business Setup</span>
                        </div>
                    </div>

                    {currentStep > 0 && (
                        <EliteProgressIndicator currentStep={currentStep} totalSteps={steps.length} />
                    )}

                    {/* Saving indicator */}
                    <AnimatePresence>
                        {isSaving && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2 text-xs text-white/40"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <EliteWelcomeStep key="welcome" onNext={goNext} />
                        )}
                        {currentStep === 1 && (
                            <EliteCompanyStep
                                key="company"
                                data={companyInfo}
                                onChange={setCompanyInfo}
                                onNext={goNext}
                                onBack={goBack}
                            />
                        )}
                        {currentStep === 2 && (
                            <ElitePayrollStep
                                key="payroll"
                                data={payrollSetup}
                                onChange={setPayrollSetup}
                                onNext={goNext}
                                onBack={goBack}
                            />
                        )}
                        {currentStep === 3 && (
                            <EliteBenefitsStep
                                key="benefits"
                                data={benefitsConfig}
                                onChange={setBenefitsConfig}
                                onNext={goNext}
                                onBack={goBack}
                            />
                        )}
                        {currentStep === 4 && (
                            <EliteBankingStep
                                key="banking"
                                data={bankingInfo}
                                onChange={setBankingInfo}
                                onNext={goNext}
                                onBack={goBack}
                            />
                        )}
                        {currentStep === 5 && (
                            <EliteReviewStep
                                key="review"
                                companyInfo={companyInfo}
                                payrollSetup={payrollSetup}
                                bankingInfo={bankingInfo}
                                benefitsConfig={benefitsConfig}
                                onBack={goBack}
                                onComplete={handleComplete}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
