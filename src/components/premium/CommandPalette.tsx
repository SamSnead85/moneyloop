'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    LayoutDashboard,
    CreditCard,
    Target,
    PiggyBank,
    Receipt,
    Settings,
    HelpCircle,
    LogOut,
    Command,
    ArrowRight,
    Sparkles,
    Calendar,
    FileText,
    TrendingUp,
    User,
    Bell,
} from 'lucide-react';

// Command types
type CommandCategory = 'navigation' | 'action' | 'ai' | 'settings';

interface Command {
    id: string;
    label: string;
    description?: string;
    icon: typeof Search;
    category: CommandCategory;
    keywords: string[];
    action: () => void;
    shortcut?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Define commands
    const commands: Command[] = useMemo(() => [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            icon: LayoutDashboard,
            category: 'navigation',
            keywords: ['home', 'overview', 'main'],
            action: () => router.push('/dashboard'),
            shortcut: '⌘1',
        },
        {
            id: 'nav-transactions',
            label: 'Go to Transactions',
            icon: CreditCard,
            category: 'navigation',
            keywords: ['payments', 'history', 'spending'],
            action: () => router.push('/dashboard/transactions'),
            shortcut: '⌘2',
        },
        {
            id: 'nav-budgets',
            label: 'Go to Budgets',
            icon: PiggyBank,
            category: 'navigation',
            keywords: ['budget', 'spending limits'],
            action: () => router.push('/dashboard/budgets'),
            shortcut: '⌘3',
        },
        {
            id: 'nav-goals',
            label: 'Go to Goals',
            icon: Target,
            category: 'navigation',
            keywords: ['savings', 'targets', 'objectives'],
            action: () => router.push('/dashboard/goals'),
            shortcut: '⌘4',
        },
        {
            id: 'nav-bills',
            label: 'Go to Bills',
            icon: Receipt,
            category: 'navigation',
            keywords: ['recurring', 'subscriptions', 'payments'],
            action: () => router.push('/dashboard/bills'),
        },
        {
            id: 'nav-insights',
            label: 'Go to Insights',
            icon: TrendingUp,
            category: 'navigation',
            keywords: ['analytics', 'reports', 'trends'],
            action: () => router.push('/insights'),
        },

        // Actions
        {
            id: 'action-add-transaction',
            label: 'Add Transaction',
            description: 'Record a new expense or income',
            icon: CreditCard,
            category: 'action',
            keywords: ['new', 'expense', 'income', 'add', 'create'],
            action: () => {
                // Dispatch event to open transaction modal
                window.dispatchEvent(new CustomEvent('open-add-transaction'));
            },
        },
        {
            id: 'action-add-goal',
            label: 'Create Goal',
            description: 'Set a new savings target',
            icon: Target,
            category: 'action',
            keywords: ['new', 'savings', 'target', 'create'],
            action: () => {
                window.dispatchEvent(new CustomEvent('open-add-goal'));
            },
        },
        {
            id: 'action-quick-note',
            label: 'Quick Note',
            description: 'Capture a thought',
            icon: FileText,
            category: 'action',
            keywords: ['note', 'thought', 'capture', 'write'],
            action: () => {
                window.dispatchEvent(new CustomEvent('open-quick-note'));
            },
            shortcut: '⌘.',
        },

        // AI Commands
        {
            id: 'ai-chat',
            label: 'Ask Chief of Staff',
            description: 'Get AI-powered assistance',
            icon: Sparkles,
            category: 'ai',
            keywords: ['ai', 'assistant', 'help', 'chat', 'ask'],
            action: () => {
                window.dispatchEvent(new CustomEvent('open-chief-of-staff'));
            },
        },
        {
            id: 'ai-analyze',
            label: 'Analyze Spending',
            description: 'AI analysis of your finances',
            icon: TrendingUp,
            category: 'ai',
            keywords: ['analyze', 'spending', 'insights', 'report'],
            action: () => {
                window.dispatchEvent(new CustomEvent('ai-analyze-spending'));
            },
        },
        {
            id: 'ai-schedule',
            label: 'Smart Schedule',
            description: 'AI-powered calendar management',
            icon: Calendar,
            category: 'ai',
            keywords: ['schedule', 'calendar', 'meeting', 'event'],
            action: () => {
                window.dispatchEvent(new CustomEvent('open-smart-schedule'));
            },
        },

        // Settings
        {
            id: 'settings-profile',
            label: 'Profile Settings',
            icon: User,
            category: 'settings',
            keywords: ['profile', 'account', 'personal'],
            action: () => router.push('/dashboard/settings/profile'),
        },
        {
            id: 'settings-notifications',
            label: 'Notification Settings',
            icon: Bell,
            category: 'settings',
            keywords: ['notifications', 'alerts'],
            action: () => router.push('/dashboard/settings/notifications'),
        },
        {
            id: 'settings-general',
            label: 'General Settings',
            icon: Settings,
            category: 'settings',
            keywords: ['settings', 'preferences', 'config'],
            action: () => router.push('/dashboard/settings'),
        },
        {
            id: 'help',
            label: 'Help & Support',
            icon: HelpCircle,
            category: 'settings',
            keywords: ['help', 'support', 'faq', 'contact'],
            action: () => window.open('https://moneyloop.app/help', '_blank'),
        },
        {
            id: 'logout',
            label: 'Sign Out',
            icon: LogOut,
            category: 'settings',
            keywords: ['logout', 'signout', 'exit'],
            action: () => router.push('/auth/logout'),
        },
    ], [router]);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return commands;

        const lowerQuery = query.toLowerCase();
        return commands.filter((command) => {
            const searchText = `${command.label} ${command.description || ''} ${command.keywords.join(' ')}`.toLowerCase();
            return searchText.includes(lowerQuery);
        });
    }, [query, commands]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: Record<CommandCategory, Command[]> = {
            navigation: [],
            action: [],
            ai: [],
            settings: [],
        };

        for (const command of filteredCommands) {
            groups[command.category].push(command);
        }

        return groups;
    }, [filteredCommands]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    // Setup keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Category labels
    const categoryLabels: Record<CommandCategory, string> = {
        navigation: 'Navigation',
        action: 'Actions',
        ai: 'AI Assistant',
        settings: 'Settings',
    };

    // Flatten for index calculation
    let currentIndex = -1;
    const getGlobalIndex = () => ++currentIndex;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-[20%] z-[101] w-full max-w-[600px] -translate-x-1/2
                     bg-[#0c0c12] border border-white/10 rounded-2xl shadow-2xl shadow-black/50
                     overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                            <Search className="w-5 h-5 text-[#8e8e93]" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search commands..."
                                className="flex-1 bg-transparent text-white text-base 
                         placeholder:text-[#636366] focus:outline-none"
                            />
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[#636366] text-xs">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </div>

                        {/* Commands List */}
                        <div className="max-h-[400px] overflow-y-auto py-2">
                            {filteredCommands.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-[#8e8e93]">No commands found</p>
                                </div>
                            ) : (
                                Object.entries(groupedCommands).map(([category, categoryCommands]) => {
                                    if (categoryCommands.length === 0) return null;

                                    return (
                                        <div key={category} className="mb-2">
                                            <p className="px-4 py-2 text-xs font-medium text-[#636366] uppercase tracking-wider">
                                                {categoryLabels[category as CommandCategory]}
                                            </p>
                                            {categoryCommands.map((command) => {
                                                const index = getGlobalIndex();
                                                const isSelected = index === selectedIndex;

                                                return (
                                                    <button
                                                        key={command.id}
                                                        onClick={() => {
                                                            command.action();
                                                            onClose();
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 
                                      text-left transition-colors
                                      ${isSelected ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                          ${isSelected
                                                                ? 'bg-[#34d399]/20 text-[#34d399]'
                                                                : 'bg-white/5 text-[#8e8e93]'}`}>
                                                            <command.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#f5f5f7]'}`}>
                                                                {command.label}
                                                            </p>
                                                            {command.description && (
                                                                <p className="text-xs text-[#636366] truncate">
                                                                    {command.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {command.shortcut && (
                                                            <span className="px-2 py-1 rounded-md bg-white/5 text-[#636366] text-xs font-mono">
                                                                {command.shortcut}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <ArrowRight className="w-4 h-4 text-[#34d399]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 
                          text-xs text-[#636366]">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 rounded bg-white/5">↑↓</span>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 rounded bg-white/5">↵</span>
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 rounded bg-white/5">esc</span>
                                    Close
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI-powered
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook to manage command palette state
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
    };
}

export default CommandPalette;
