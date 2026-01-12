'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Home,
    ArrowRight,
    Check,
    Plus,
    Briefcase,
    User,
    Sparkles,
} from 'lucide-react';
import { useHousehold } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

type SetupStep = 'welcome' | 'household' | 'context' | 'invite' | 'complete';

interface HouseholdSetupProps {
    onComplete?: () => void;
}

export function HouseholdSetup({ onComplete }: HouseholdSetupProps) {
    const { createHousehold, createContext, inviteMember } = useHousehold();
    const [step, setStep] = useState<SetupStep>('welcome');
    const [householdName, setHouseholdName] = useState('');
    const [householdType, setHouseholdType] = useState<'family' | 'couple' | 'roommates'>('family');
    const [wantsBusiness, setWantsBusiness] = useState(false);
    const [inviteEmails, setInviteEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const steps: SetupStep[] = ['welcome', 'household', 'context', 'invite', 'complete'];
    const currentIndex = steps.indexOf(step);

    const handleCreateHousehold = async () => {
        if (!householdName.trim()) return;

        setLoading(true);
        try {
            await createHousehold(householdName);

            // Create business context if selected
            if (wantsBusiness) {
                await createContext('Business', 'business');
            }

            setStep('context');
        } catch (error) {
            console.error('Failed to create household:', error);
        }
        setLoading(false);
    };

    const handleAddEmail = () => {
        if (newEmail && !inviteEmails.includes(newEmail)) {
            setInviteEmails([...inviteEmails, newEmail]);
            setNewEmail('');
        }
    };

    const handleSendInvites = async () => {
        setLoading(true);
        try {
            for (const email of inviteEmails) {
                await inviteMember(email, 'member');
            }
            setStep('complete');
        } catch (error) {
            console.error('Failed to send invites:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.slice(1, -1).map((s, i) => (
                        <div
                            key={s}
                            className={cn(
                                'h-1.5 w-12 rounded-full transition-colors',
                                i < currentIndex - 1 ? 'bg-sage-500' :
                                    i === currentIndex - 1 ? 'bg-sage-500' : 'bg-zinc-800'
                            )}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Welcome */}
                    {step === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sage-500 to-emerald-500 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-100 mb-3">
                                Welcome to MoneyLoop
                            </h1>
                            <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                                Let&apos;s set up your household for collaborative financial management
                            </p>
                            <button
                                onClick={() => setStep('household')}
                                className="px-8 py-3 rounded-xl bg-sage-500 text-zinc-900 font-semibold hover:bg-sage-400 transition-colors flex items-center gap-2 mx-auto"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* Household Setup */}
                    {step === 'household' && (
                        <motion.div
                            key="household"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <Home className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-100">Create Household</h2>
                                    <p className="text-sm text-zinc-500">Give your household a name</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Household Name</label>
                                    <input
                                        type="text"
                                        value={householdName}
                                        onChange={e => setHouseholdName(e.target.value)}
                                        placeholder="e.g., The Smith Family"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sage-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Household Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['family', 'couple', 'roommates'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setHouseholdType(type)}
                                                className={cn(
                                                    'p-3 rounded-xl border text-center transition-colors',
                                                    householdType === type
                                                        ? 'bg-sage-500/20 border-sage-500 text-sage-400'
                                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                )}
                                            >
                                                <Users className="w-5 h-5 mx-auto mb-1" />
                                                <span className="text-sm capitalize">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateHousehold}
                                    disabled={!householdName.trim() || loading}
                                    className="w-full py-3 rounded-xl bg-sage-500 text-zinc-900 font-semibold hover:bg-sage-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating...' : 'Continue'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Finance Contexts */}
                    {step === 'context' && (
                        <motion.div
                            key="context"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-purple-500/20">
                                    <Briefcase className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-100">Finance Separation</h2>
                                    <p className="text-sm text-zinc-500">Keep personal and business separate</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 rounded-xl bg-sage-500/10 border border-sage-500/30 flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-sage-500/20">
                                        <User className="w-5 h-5 text-sage-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-zinc-200">Personal</h3>
                                        <p className="text-sm text-zinc-500">Your personal finances</p>
                                    </div>
                                    <Check className="w-5 h-5 text-sage-400" />
                                </div>

                                <button
                                    onClick={() => setWantsBusiness(!wantsBusiness)}
                                    className={cn(
                                        'w-full p-4 rounded-xl border flex items-center gap-4 transition-colors',
                                        wantsBusiness
                                            ? 'bg-purple-500/10 border-purple-500/30'
                                            : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                                    )}
                                >
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        wantsBusiness ? 'bg-purple-500/20' : 'bg-zinc-700'
                                    )}>
                                        <Briefcase className={cn(
                                            'w-5 h-5',
                                            wantsBusiness ? 'text-purple-400' : 'text-zinc-400'
                                        )} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-medium text-zinc-200">Business</h3>
                                        <p className="text-sm text-zinc-500">Separate business expenses for tax</p>
                                    </div>
                                    {wantsBusiness && <Check className="w-5 h-5 text-purple-400" />}
                                </button>
                            </div>

                            <button
                                onClick={() => setStep('invite')}
                                className="w-full py-3 rounded-xl bg-sage-500 text-zinc-900 font-semibold hover:bg-sage-400 transition-colors flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* Invite Members */}
                    {step === 'invite' && (
                        <motion.div
                            key="invite"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-amber-500/20">
                                    <Users className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-100">Invite Members</h2>
                                    <p className="text-sm text-zinc-500">Add family or roommates</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sage-500"
                                        onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                                    />
                                    <button
                                        onClick={handleAddEmail}
                                        className="px-4 rounded-xl bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {inviteEmails.length > 0 && (
                                    <div className="space-y-2">
                                        {inviteEmails.map(email => (
                                            <div
                                                key={email}
                                                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm flex items-center justify-between"
                                            >
                                                {email}
                                                <button
                                                    onClick={() => setInviteEmails(inviteEmails.filter(e => e !== email))}
                                                    className="text-zinc-500 hover:text-zinc-300"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('complete')}
                                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                                >
                                    Skip for Now
                                </button>
                                <button
                                    onClick={handleSendInvites}
                                    disabled={inviteEmails.length === 0 || loading}
                                    className="flex-1 py-3 rounded-xl bg-sage-500 text-zinc-900 font-semibold hover:bg-sage-400 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Invites'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Complete */}
                    {step === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-sage-500 flex items-center justify-center">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-100 mb-3">
                                You&apos;re All Set!
                            </h1>
                            <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                                Your household is ready. Start adding accounts, tasks, and collaborating with your family.
                            </p>
                            <button
                                onClick={onComplete}
                                className="px-8 py-3 rounded-xl bg-sage-500 text-zinc-900 font-semibold hover:bg-sage-400 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default HouseholdSetup;
