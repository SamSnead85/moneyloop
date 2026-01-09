'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowRight,
    CornerDownLeft,
    Command,
    Home,
    CreditCard,
    PieChart,
    Target,
    Settings,
    Plus,
    Receipt,
    TrendingUp,
    Bell,
    Calendar,
    Tag,
    FileText,
    HelpCircle,
    LogOut,
    User,
    Wallet,
    Zap,
    Clock,
    Star,
} from 'lucide-react';
import { Surface, Text, Badge, Avatar } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface CommandItem {
    id: string;
    type: 'navigation' | 'action' | 'search' | 'recent' | 'shortcut';
    icon?: typeof Home;
    title: string;
    subtitle?: string;
    shortcut?: string[];
    href?: string;
    action?: () => void;
    keywords?: string[];
    section?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (href: string) => void;
    recentSearches?: string[];
    onSearch?: (query: string) => void;
    customCommands?: CommandItem[];
}

// ===== DEFAULT COMMANDS =====

const defaultCommands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', type: 'navigation', icon: Home, title: 'Dashboard', subtitle: 'Overview of your finances', href: '/dashboard', section: 'Navigation', keywords: ['home', 'overview'] },
    { id: 'nav-transactions', type: 'navigation', icon: Receipt, title: 'Transactions', subtitle: 'View all transactions', href: '/dashboard/transactions', section: 'Navigation', keywords: ['payments', 'expenses', 'income'] },
    { id: 'nav-budgets', type: 'navigation', icon: PieChart, title: 'Budgets', subtitle: 'Manage your budgets', href: '/dashboard/budgets', section: 'Navigation', keywords: ['spending', 'limits'] },
    { id: 'nav-goals', type: 'navigation', icon: Target, title: 'Goals', subtitle: 'Track savings goals', href: '/dashboard/goals', section: 'Navigation', keywords: ['savings', 'targets'] },
    { id: 'nav-bills', type: 'navigation', icon: Calendar, title: 'Bills', subtitle: 'Upcoming payments', href: '/dashboard/bills', section: 'Navigation', keywords: ['recurring', 'payments', 'due'] },
    { id: 'nav-accounts', type: 'navigation', icon: Wallet, title: 'Accounts', subtitle: 'Connected accounts', href: '/dashboard/accounts', section: 'Navigation', keywords: ['banks', 'cards', 'connections'] },
    { id: 'nav-reports', type: 'navigation', icon: TrendingUp, title: 'Reports', subtitle: 'Financial reports', href: '/dashboard/reports', section: 'Navigation', keywords: ['analytics', 'charts', 'insights'] },
    { id: 'nav-settings', type: 'navigation', icon: Settings, title: 'Settings', subtitle: 'App preferences', href: '/dashboard/settings', section: 'Navigation', keywords: ['preferences', 'profile', 'account'] },

    // Quick Actions
    { id: 'action-add-transaction', type: 'action', icon: Plus, title: 'Add Transaction', subtitle: 'Record a new expense or income', shortcut: ['⌘', 'T'], section: 'Quick Actions', keywords: ['new', 'create', 'expense', 'income'] },
    { id: 'action-add-goal', type: 'action', icon: Target, title: 'Create Goal', subtitle: 'Set a new savings goal', shortcut: ['⌘', 'G'], section: 'Quick Actions', keywords: ['new', 'savings'] },
    { id: 'action-add-budget', type: 'action', icon: PieChart, title: 'Create Budget', subtitle: 'Set a new budget category', shortcut: ['⌘', 'B'], section: 'Quick Actions', keywords: ['new', 'limit', 'spending'] },
    { id: 'action-connect-account', type: 'action', icon: CreditCard, title: 'Connect Account', subtitle: 'Link a new bank account', section: 'Quick Actions', keywords: ['add', 'bank', 'plaid'] },

    // Shortcuts
    { id: 'shortcut-notifications', type: 'shortcut', icon: Bell, title: 'Notifications', subtitle: 'View alerts', shortcut: ['⌘', 'N'], section: 'Shortcuts', keywords: ['alerts', 'messages'] },
    { id: 'shortcut-search', type: 'shortcut', icon: Search, title: 'Search Transactions', subtitle: 'Find specific transactions', shortcut: ['⌘', 'F'], section: 'Shortcuts', keywords: ['find', 'filter'] },

    // Help
    { id: 'help-docs', type: 'navigation', icon: FileText, title: 'Documentation', subtitle: 'Learn how to use MoneyLoop', href: '/docs', section: 'Help', keywords: ['guide', 'tutorial', 'how to'] },
    { id: 'help-support', type: 'navigation', icon: HelpCircle, title: 'Support', subtitle: 'Get help from our team', href: '/support', section: 'Help', keywords: ['contact', 'assistance'] },
];

// ===== FUZZY SEARCH =====

function fuzzyMatch(query: string, text: string): number {
    const q = query.toLowerCase();
    const t = text.toLowerCase();

    if (t.includes(q)) return 100;
    if (t.startsWith(q)) return 90;

    let score = 0;
    let qIndex = 0;
    let consecutive = 0;

    for (let i = 0; i < t.length && qIndex < q.length; i++) {
        if (t[i] === q[qIndex]) {
            score += 10 + consecutive * 5;
            consecutive++;
            qIndex++;
        } else {
            consecutive = 0;
        }
    }

    return qIndex === q.length ? score : 0;
}

function searchCommands(query: string, commands: CommandItem[]): CommandItem[] {
    if (!query.trim()) return commands;

    const scored = commands
        .map(cmd => {
            const titleScore = fuzzyMatch(query, cmd.title);
            const subtitleScore = cmd.subtitle ? fuzzyMatch(query, cmd.subtitle) * 0.5 : 0;
            const keywordScore = cmd.keywords?.reduce((max, kw) => Math.max(max, fuzzyMatch(query, kw)), 0) || 0;
            return { cmd, score: Math.max(titleScore, subtitleScore, keywordScore * 0.8) };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.map(x => x.cmd);
}

// ===== COMPONENT =====

export function CommandPalette({
    isOpen,
    onClose,
    onNavigate,
    recentSearches = [],
    onSearch,
    customCommands = [],
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const allCommands = useMemo(() => [...defaultCommands, ...customCommands], [customCommands]);

    const filteredCommands = useMemo(() => searchCommands(query, allCommands), [query, allCommands]);

    // Group by section
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};

        if (!query && recentSearches.length > 0) {
            groups['Recent'] = recentSearches.slice(0, 3).map((s, i) => ({
                id: `recent-${i}`,
                type: 'recent' as const,
                icon: Clock,
                title: s,
                section: 'Recent',
            }));
        }

        filteredCommands.forEach(cmd => {
            const section = cmd.section || 'Other';
            if (!groups[section]) groups[section] = [];
            groups[section].push(cmd);
        });

        return groups;
    }, [filteredCommands, query, recentSearches]);

    const flatCommands = useMemo(() =>
        Object.values(groupedCommands).flat(),
        [groupedCommands]
    );

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, flatCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                const selected = flatCommands[selectedIndex];
                if (selected) executeCommand(selected);
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [isOpen, flatCommands, selectedIndex, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Scroll selected into view
    useEffect(() => {
        if (listRef.current) {
            const selected = listRef.current.children[selectedIndex] as HTMLElement;
            selected?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const executeCommand = (cmd: CommandItem) => {
        if (cmd.type === 'recent') {
            setQuery(cmd.title);
            onSearch?.(cmd.title);
        } else if (cmd.href) {
            onNavigate?.(cmd.href);
            onClose();
        } else if (cmd.action) {
            cmd.action();
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-full max-w-2xl mx-4"
                    onClick={e => e.stopPropagation()}
                >
                    <Surface elevation={2} className="overflow-hidden p-0">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-subtle)]">
                            <Search className="w-5 h-5 text-[var(--text-quaternary)]" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Search commands, pages, or transactions..."
                                className="flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--text-quaternary)]"
                            />
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[var(--surface-elevated)] text-xs text-[var(--text-tertiary)]">
                                <span>esc</span>
                            </kbd>
                        </div>

                        {/* Results */}
                        <div
                            ref={listRef}
                            className="max-h-[50vh] overflow-y-auto py-2"
                        >
                            {Object.entries(groupedCommands).map(([section, items]) => (
                                <div key={section}>
                                    <div className="px-4 py-2">
                                        <Text variant="caption" color="tertiary" className="uppercase tracking-wider">
                                            {section}
                                        </Text>
                                    </div>
                                    {items.map((cmd) => {
                                        const globalIndex = flatCommands.indexOf(cmd);
                                        const isSelected = globalIndex === selectedIndex;
                                        const Icon = cmd.icon || Search;

                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => executeCommand(cmd)}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                                                    isSelected
                                                        ? 'bg-[var(--accent-primary-subtle)]'
                                                        : 'hover:bg-[var(--surface-elevated)]'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                                    isSelected
                                                        ? 'bg-[var(--accent-primary)] text-white'
                                                        : 'bg-[var(--surface-elevated-2)] text-[var(--text-tertiary)]'
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <Text variant="body-md" className={cn(isSelected && 'text-[var(--accent-primary)]')}>
                                                        {cmd.title}
                                                    </Text>
                                                    {cmd.subtitle && (
                                                        <Text variant="body-sm" color="tertiary" className="truncate">
                                                            {cmd.subtitle}
                                                        </Text>
                                                    )}
                                                </div>
                                                {cmd.shortcut && (
                                                    <div className="hidden sm:flex items-center gap-1">
                                                        {cmd.shortcut.map((key, i) => (
                                                            <kbd
                                                                key={i}
                                                                className="px-2 py-1 rounded bg-[var(--surface-elevated)] text-xs text-[var(--text-tertiary)]"
                                                            >
                                                                {key}
                                                            </kbd>
                                                        ))}
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <CornerDownLeft className="w-4 h-4 text-[var(--accent-primary)]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}

                            {flatCommands.length === 0 && (
                                <div className="px-4 py-12 text-center">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                                    <Text variant="body-md" color="tertiary">
                                        No results found for &quot;{query}&quot;
                                    </Text>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                            <div className="flex items-center gap-4 text-xs text-[var(--text-quaternary)]">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-base)]">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-base)]">↓</kbd>
                                    navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-base)]">↵</kbd>
                                    select
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[var(--text-quaternary)]">
                                <Command className="w-3 h-3" />
                                <span>K to toggle</span>
                            </div>
                        </div>
                    </Surface>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

// ===== HOOK =====

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev),
    };
}

export default CommandPalette;
