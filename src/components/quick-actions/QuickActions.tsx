'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Receipt,
    Target,
    PieChart,
    CreditCard,
    ChevronUp,
    Keyboard,
    Command,
} from 'lucide-react';
import { Surface, Text, Badge } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface QuickAction {
    id: string;
    icon: typeof Plus;
    label: string;
    shortcut?: string;
    action: () => void;
    color?: string;
}

interface FloatingActionButtonProps {
    actions: QuickAction[];
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
    className?: string;
}

// ===== FLOATING ACTION BUTTON =====

export function FloatingActionButton({
    actions,
    position = 'bottom-right',
    className,
}: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
        'bottom-right': 'right-6 bottom-6',
        'bottom-left': 'left-6 bottom-6',
        'bottom-center': 'left-1/2 -translate-x-1/2 bottom-6',
    };

    return (
        <div className={cn('fixed z-50', positionClasses[position], className)}>
            {/* Action Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-16 right-0 min-w-[200px] mb-2"
                    >
                        <Surface elevation={2} className="p-2 space-y-1">
                            {actions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={action.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => {
                                            action.action();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors group"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                backgroundColor: action.color
                                                    ? `color-mix(in srgb, ${action.color} 15%, transparent)`
                                                    : 'var(--surface-elevated-2)',
                                            }}
                                        >
                                            <Icon
                                                className="w-5 h-5"
                                                style={{ color: action.color || 'var(--text-tertiary)' }}
                                            />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <Text variant="body-sm" className="font-medium">
                                                {action.label}
                                            </Text>
                                        </div>
                                        {action.shortcut && (
                                            <kbd className="px-2 py-1 rounded bg-[var(--surface-base)] text-xs text-[var(--text-quaternary)]">
                                                {action.shortcut}
                                            </kbd>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </Surface>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-colors',
                    isOpen
                        ? 'bg-[var(--surface-elevated-2)] rotate-45'
                        : 'bg-[var(--accent-primary)] text-white'
                )}
            >
                <Plus className={cn('w-6 h-6 transition-transform', isOpen && 'rotate-45')} />
            </motion.button>
        </div>
    );
}

// ===== QUICK EXPENSE ENTRY =====

interface QuickExpenseEntryProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { amount: number; description: string; category: string }) => void;
    categories?: string[];
}

export function QuickExpenseEntry({
    isOpen,
    onClose,
    onSubmit,
    categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Other'],
}: QuickExpenseEntryProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        onSubmit({
            amount: parseFloat(amount),
            description: description.trim() || selectedCategory,
            category: selectedCategory,
        });

        setAmount('');
        setDescription('');
        onClose();
    };

    // Focus on open
    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => {
                document.getElementById('quick-expense-amount')?.focus();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="relative w-full sm:max-w-md mx-4 mb-4 sm:mb-0"
            >
                <Surface elevation={2} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Text variant="heading-md">Quick Expense</Text>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Amount */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-[var(--text-tertiary)]">$</span>
                            <input
                                id="quick-expense-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                step="0.01"
                                className="w-full pl-12 pr-4 py-4 text-4xl font-mono bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] outline-none"
                            />
                        </div>

                        {/* Description */}
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-4 py-3 bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl focus:border-[var(--accent-primary)] outline-none"
                        />

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                                        selectedCategory === cat
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!amount || parseFloat(amount) <= 0}
                            className="w-full py-4 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                            Add Expense
                        </button>
                    </form>
                </Surface>
            </motion.div>
        </div>,
        document.body
    );
}

// ===== KEYBOARD SHORTCUTS SYSTEM =====

interface Shortcut {
    key: string;
    modifiers?: ('ctrl' | 'meta' | 'alt' | 'shift')[];
    action: () => void;
    description?: string;
    scope?: string;
}

interface ShortcutsContextType {
    register: (id: string, shortcut: Shortcut) => void;
    unregister: (id: string) => void;
    shortcuts: Map<string, Shortcut>;
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
    const [shortcuts, setShortcuts] = useState(new Map<string, Shortcut>());

    const register = useCallback((id: string, shortcut: Shortcut) => {
        setShortcuts((prev) => new Map(prev).set(id, shortcut));
    }, []);

    const unregister = useCallback((id: string) => {
        setShortcuts((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    // Global keyboard handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if in input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            shortcuts.forEach((shortcut) => {
                const modMatch =
                    (!shortcut.modifiers?.includes('ctrl') || e.ctrlKey) &&
                    (!shortcut.modifiers?.includes('meta') || e.metaKey) &&
                    (!shortcut.modifiers?.includes('alt') || e.altKey) &&
                    (!shortcut.modifiers?.includes('shift') || e.shiftKey);

                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

                if (modMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return (
        <ShortcutsContext.Provider value={{ register, unregister, shortcuts }}>
            {children}
        </ShortcutsContext.Provider>
    );
}

export function useShortcuts() {
    const context = useContext(ShortcutsContext);
    if (!context) throw new Error('useShortcuts must be used within ShortcutsProvider');
    return context;
}

export function useShortcut(id: string, shortcut: Shortcut, deps: unknown[] = []) {
    const { register, unregister } = useShortcuts();

    useEffect(() => {
        register(id, shortcut);
        return () => unregister(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, ...deps]);
}

// ===== KEYBOARD SHORTCUTS MODAL =====

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
    const { shortcuts } = useShortcuts();

    // Group by scope
    const grouped = Array.from(shortcuts.entries()).reduce((acc, [id, s]) => {
        const scope = s.scope || 'General';
        if (!acc[scope]) acc[scope] = [];
        acc[scope].push({ id, ...s });
        return acc;
    }, {} as Record<string, (Shortcut & { id: string })[]>);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg mx-4"
            >
                <Surface elevation={2} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Keyboard className="w-6 h-6 text-[var(--text-tertiary)]" />
                            <Text variant="heading-lg">Keyboard Shortcuts</Text>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                        {Object.entries(grouped).map(([scope, items]) => (
                            <div key={scope}>
                                <Text variant="caption" color="tertiary" className="uppercase tracking-wider mb-3 block">
                                    {scope}
                                </Text>
                                <div className="space-y-2">
                                    {items.map((shortcut) => (
                                        <div
                                            key={shortcut.id}
                                            className="flex items-center justify-between py-2"
                                        >
                                            <Text variant="body-sm">{shortcut.description || shortcut.id}</Text>
                                            <div className="flex items-center gap-1">
                                                {shortcut.modifiers?.map((mod) => (
                                                    <kbd key={mod} className="px-2 py-1 rounded bg-[var(--surface-elevated)] text-xs">
                                                        {mod === 'meta' ? '⌘' : mod === 'ctrl' ? 'Ctrl' : mod === 'alt' ? 'Alt' : 'Shift'}
                                                    </kbd>
                                                ))}
                                                <kbd className="px-2 py-1 rounded bg-[var(--surface-elevated)] text-xs uppercase">
                                                    {shortcut.key}
                                                </kbd>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
                        <Text variant="caption" color="tertiary">
                            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-xs">?</kbd> to toggle this menu
                        </Text>
                    </div>
                </Surface>
            </motion.div>
        </div>,
        document.body
    );
}

export default FloatingActionButton;
