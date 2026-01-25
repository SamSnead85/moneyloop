'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Users,
    DollarSign,
    Calendar,
    FileText,
    Heart,
    Check,
    Sparkles,
    Play,
    Clock,
    Building2,
    Zap,
    ArrowRight,
    CheckCircle2,
    Circle,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface WelcomeTutorialProps {
    onComplete: () => void;
    onSkip: () => void;
}

const tutorialSteps = [
    {
        id: 'welcome',
        title: 'Welcome to MoneyLoop! 🎉',
        subtitle: 'Your all-in-one platform for payroll, HR, and benefits',
        description: 'Let\'s take a quick tour to show you how to get your team paid. This will only take 2 minutes.',
        icon: Building2,
        color: 'from-cyan-500 to-blue-600',
        tips: [
            'Add your first employee in under 5 minutes',
            'Run payroll with just 2 clicks',
            'Automatic tax calculations and filings',
        ],
    },
    {
        id: 'add-employees',
        title: 'Step 1: Add Your Team',
        subtitle: 'Invite employees or add them manually',
        description: 'Start by adding your employees. They\'ll receive an invite to complete their own onboarding (W-4, direct deposit, etc.).',
        icon: Users,
        color: 'from-blue-500 to-indigo-600',
        tips: [
            'Go to Team → Add Employee',
            'Enter basic info: name, email, start date, salary',
            'Employee completes their own W-4 and banking info',
            'You can also bulk import from a spreadsheet',
        ],
        action: {
            label: 'Go to Team',
            href: '/employer/team',
        },
    },
    {
        id: 'set-schedule',
        title: 'Step 2: Set Your Pay Schedule',
        subtitle: 'Choose when and how often to pay',
        description: 'Set up your payroll schedule. Most companies use bi-weekly or semi-monthly. You can always change this later.',
        icon: Calendar,
        color: 'from-indigo-500 to-violet-600',
        tips: [
            'Go to Settings → Payroll Settings',
            'Choose frequency: Weekly, Bi-weekly, Semi-monthly, or Monthly',
            'Set your first pay date',
            'We\'ll remind you 3 days before each payroll deadline',
        ],
        action: {
            label: 'Go to Settings',
            href: '/employer/settings',
        },
    },
    {
        id: 'run-payroll',
        title: 'Step 3: Run Payroll',
        subtitle: 'Review and approve in 2 clicks',
        description: 'When payday approaches, we\'ll calculate everything automatically. Just review and approve!',
        icon: DollarSign,
        color: 'from-cyan-500 to-teal-500',
        tips: [
            'Go to Payroll → Run Payroll',
            'Review hours, salaries, and deductions',
            'We calculate federal, state, and local taxes automatically',
            'Click "Approve & Submit" – that\'s it!',
            'Employees receive direct deposit on pay day',
        ],
        action: {
            label: 'Go to Payroll',
            href: '/employer/payroll',
        },
    },
    {
        id: 'benefits',
        title: 'Bonus: Set Up Benefits',
        subtitle: 'Offer health insurance, 401(k), and more',
        description: 'Attract and retain top talent with competitive benefits. We partner with leading carriers.',
        icon: Heart,
        color: 'from-rose-500 to-pink-600',
        tips: [
            'Go to Benefits to explore options',
            'Health, dental, and vision insurance',
            '401(k) with automatic employer matching',
            'HSA/FSA accounts',
            'Employees enroll through their self-service portal',
        ],
        action: {
            label: 'Explore Benefits',
            href: '/employer/benefits',
        },
    },
    {
        id: 'done',
        title: 'You\'re All Set! ✅',
        subtitle: 'Your payroll system is ready to go',
        description: 'You now know the essentials. Add your team, set your schedule, and run payroll – it\'s that simple.',
        icon: CheckCircle2,
        color: 'from-emerald-500 to-teal-500',
        tips: [
            'Add your first employee now',
            'Explore the dashboard to see real-time stats',
            'Check out Reports for workforce analytics',
            'Need help? Click the chat button anytime',
        ],
    },
];

export function WelcomeTutorial({ onComplete, onSkip }: WelcomeTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const step = tutorialSteps[currentStep];
    const Icon = step.icon;
    const isLast = currentStep === tutorialSteps.length - 1;
    const isFirst = currentStep === 0;

    const goNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const goBack = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-xl" onClick={onSkip} />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0f1c] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.05]">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Skip button */}
                <button
                    onClick={onSkip}
                    className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8 pt-12">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {tutorialSteps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentStep(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-cyan-500' : i < currentStep ? 'bg-cyan-500/50' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-6"
                    >
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                            <Icon className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    {/* Text */}
                    <motion.div
                        key={`text-${step.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-2xl font-semibold text-white mb-2">{step.title}</h2>
                        <p className="text-white/50 mb-4">{step.subtitle}</p>
                        <p className="text-white/70 max-w-md mx-auto">{step.description}</p>
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                        key={`tips-${step.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8"
                    >
                        <ul className="space-y-3">
                            {step.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-cyan-400 text-xs font-semibold">{i + 1}</span>
                                    </div>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goBack}
                            disabled={isFirst}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFirst ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <Button
                            onClick={goNext}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6"
                        >
                            {isLast ? 'Get Started' : 'Next'}
                            {isLast ? <Zap className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Quick action cards for the dashboard
interface QuickStartCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
    completed?: boolean;
}

export function QuickStartCard({ title, description, icon: Icon, href, color, completed }: QuickStartCardProps) {
    return (
        <a
            href={href}
            className={`block p-5 rounded-2xl border transition-all group ${completed
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-500/30'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {completed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                ) : (
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                )}
            </div>
            <h3 className="font-medium text-white mb-1">{title}</h3>
            <p className="text-sm text-white/40">{description}</p>
        </a>
    );
}

// Setup checklist component
interface SetupChecklistProps {
    onDismiss: () => void;
}

export function SetupChecklist({ onDismiss }: SetupChecklistProps) {
    const [checklist, setChecklist] = useState([
        { id: 'company', label: 'Complete company setup', completed: true, href: '/employer/settings' },
        { id: 'banking', label: 'Connect bank account', completed: true, href: '/employer/banking' },
        { id: 'employee', label: 'Add your first employee', completed: false, href: '/employer/team' },
        { id: 'schedule', label: 'Set payroll schedule', completed: false, href: '/employer/settings' },
        { id: 'payroll', label: 'Run your first payroll', completed: false, href: '/employer/payroll' },
    ]);

    const completedCount = checklist.filter(item => item.completed).length;
    const progress = (completedCount / checklist.length) * 100;

    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Getting Started</h3>
                        <p className="text-sm text-white/40">{completedCount} of {checklist.length} completed</p>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-white/30 hover:text-white/60 transition-colors text-sm"
                >
                    Dismiss
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/[0.08] mb-6 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />
            </div>

            {/* Checklist items */}
            <ul className="space-y-3">
                {checklist.map((item) => (
                    <li key={item.id}>
                        <a
                            href={item.href}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all ${item.completed
                                    ? 'bg-emerald-500/10'
                                    : 'bg-white/[0.02] hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                ) : (
                                    <Circle className="w-5 h-5 text-white/30" />
                                )}
                                <span className={`text-sm ${item.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                                    {item.label}
                                </span>
                            </div>
                            {!item.completed && (
                                <ChevronRight className="w-4 h-4 text-white/30" />
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Video tutorial card
export function VideoTutorialCard() {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-1">Watch: Getting Started in 5 Minutes</h3>
                    <p className="text-sm text-white/40">Learn how to add employees, set up payroll, and run your first paycheck.</p>
                </div>
            </div>
        </div>
    );
}

export default WelcomeTutorial;
