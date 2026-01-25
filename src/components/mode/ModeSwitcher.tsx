'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Home,
    Building2,
    ChevronDown,
    Check,
    Plus,
    Users,
    Wallet,
} from 'lucide-react';

// Types
export type AppMode = 'personal' | 'business';

export interface Account {
    id: string;
    type: AppMode;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

interface ModeContextType {
    currentMode: AppMode;
    setMode: (mode: AppMode) => void;
    accounts: Account[];
    currentAccount: Account | null;
    switchAccount: (accountId: string) => void;
}

// Default accounts
const defaultAccounts: Account[] = [
    {
        id: 'personal-1',
        type: 'personal',
        name: 'Personal Finance',
        description: 'Household & Family',
        icon: Home,
        color: 'from-[#34d399] to-[#818cf8]',
    },
    {
        id: 'business-1',
        type: 'business',
        name: 'Acme Inc.',
        description: '5 employees',
        icon: Building2,
        color: 'from-[#0ea5e9] to-[#8b5cf6]',
    },
];

// Context
const ModeContext = createContext<ModeContextType | null>(null);

export function useAppMode() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useAppMode must be used within ModeProvider');
    }
    return context;
}

// Provider Component
export function ModeProvider({ children }: { children: React.ReactNode }) {
    const [currentMode, setCurrentMode] = useState<AppMode>('personal');
    const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
    const [currentAccountId, setCurrentAccountId] = useState<string>('personal-1');
    const router = useRouter();

    const currentAccount = accounts.find(a => a.id === currentAccountId) || null;

    const setMode = (mode: AppMode) => {
        setCurrentMode(mode);
        // Find the first account of this type
        const account = accounts.find(a => a.type === mode);
        if (account) {
            setCurrentAccountId(account.id);
        }

        // Navigate to the appropriate dashboard
        if (mode === 'personal') {
            router.push('/dashboard');
        } else {
            router.push('/employer');
        }
    };

    const switchAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) {
            setCurrentAccountId(accountId);
            setCurrentMode(account.type);

            if (account.type === 'personal') {
                router.push('/dashboard');
            } else {
                router.push('/employer');
            }
        }
    };

    return (
        <ModeContext.Provider value={{
            currentMode,
            setMode,
            accounts,
            currentAccount,
            switchAccount,
        }}>
            {children}
        </ModeContext.Provider>
    );
}

// Mode Switcher Component (for sidebar)
export function ModeSwitcher({ compact = false }: { compact?: boolean }) {
    const { currentMode, accounts, currentAccount, switchAccount } = useAppMode();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentAccount) return null;

    const Icon = currentAccount.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group ${isOpen ? 'bg-white/[0.05] border-white/[0.1]' : ''}`}
            >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentAccount.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {!compact && (
                    <>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{currentAccount.name}</p>
                            <p className="text-[10px] text-white/40">{currentAccount.description}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-2 z-50 p-2 rounded-xl bg-[#12121a] border border-white/[0.08] shadow-2xl shadow-black/40"
                        >
                            {/* Personal Section */}
                            <div className="mb-2">
                                <p className="px-3 py-1.5 text-[10px] font-medium text-white/30 uppercase tracking-wider">
                                    Personal
                                </p>
                                {accounts.filter(a => a.type === 'personal').map((account) => {
                                    const AccountIcon = account.icon;
                                    const isActive = account.id === currentAccount.id;
                                    return (
                                        <button
                                            key={account.id}
                                            onClick={() => {
                                                switchAccount(account.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                                    ? 'bg-[#34d399]/10 text-white'
                                                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center`}>
                                                <AccountIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium">{account.name}</p>
                                                <p className="text-[10px] text-white/40">{account.description}</p>
                                            </div>
                                            {isActive && <Check className="w-4 h-4 text-[#34d399]" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Business Section */}
                            <div className="pt-2 border-t border-white/[0.06]">
                                <p className="px-3 py-1.5 text-[10px] font-medium text-white/30 uppercase tracking-wider">
                                    Business
                                </p>
                                {accounts.filter(a => a.type === 'business').map((account) => {
                                    const AccountIcon = account.icon;
                                    const isActive = account.id === currentAccount.id;
                                    return (
                                        <button
                                            key={account.id}
                                            onClick={() => {
                                                switchAccount(account.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                                    ? 'bg-[#0ea5e9]/10 text-white'
                                                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center`}>
                                                <AccountIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium">{account.name}</p>
                                                <p className="text-[10px] text-white/40">{account.description}</p>
                                            </div>
                                            {isActive && <Check className="w-4 h-4 text-[#0ea5e9]" />}
                                        </button>
                                    );
                                })}

                                {/* Add Business Account */}
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:bg-white/[0.05] hover:text-white/60 transition-all mt-1">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-dashed border-white/20 flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Add Business Account</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Quick Mode Toggle (for header)
export function QuickModeToggle() {
    const { currentMode, setMode } = useAppMode();

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <button
                onClick={() => setMode('personal')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentMode === 'personal'
                        ? 'bg-[#34d399]/20 text-[#34d399]'
                        : 'text-white/40 hover:text-white/60'
                    }`}
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Personal</span>
            </button>
            <button
                onClick={() => setMode('business')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentMode === 'business'
                        ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]'
                        : 'text-white/40 hover:text-white/60'
                    }`}
            >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Business</span>
            </button>
        </div>
    );
}
