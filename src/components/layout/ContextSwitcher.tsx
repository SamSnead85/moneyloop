'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Check,
    Briefcase,
    Home,
    TrendingUp,
    Layers,
    Plus
} from 'lucide-react';
import { useHousehold, FinanceContext } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

const contextIcons: Record<FinanceContext['type'], typeof Home> = {
    personal: Home,
    business: Briefcase,
    investment: TrendingUp,
    other: Layers,
};

interface ContextSwitcherProps {
    showAll?: boolean; // Whether to show "All Contexts" option
    className?: string;
}

export function ContextSwitcher({ showAll = true, className }: ContextSwitcherProps) {
    const { contexts, currentContext, setCurrentContext } = useHousehold();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const CurrentIcon = currentContext ? contextIcons[currentContext.type] : Layers;

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                    'bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50',
                    'text-sm font-medium text-zinc-200'
                )}
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentContext?.color || '#7dd3a8' }}
                />
                <CurrentIcon className="w-4 h-4 text-zinc-400" />
                <span>{currentContext?.name || 'All Contexts'}</span>
                <ChevronDown className={cn(
                    'w-4 h-4 text-zinc-500 transition-transform',
                    isOpen && 'rotate-180'
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute top-full left-0 mt-2 z-50 w-56',
                            'bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl'
                        )}
                    >
                        <div className="p-1">
                            <p className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                Finance Contexts
                            </p>

                            {showAll && (
                                <button
                                    onClick={() => {
                                        setCurrentContext(null);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                                        'hover:bg-zinc-800',
                                        !currentContext && 'bg-zinc-800'
                                    )}
                                >
                                    <Layers className="w-4 h-4 text-zinc-400" />
                                    <span className="flex-1 text-left text-sm">All Contexts</span>
                                    {!currentContext && (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    )}
                                </button>
                            )}

                            <div className="my-1 border-t border-zinc-800" />

                            {contexts.map((ctx) => {
                                const Icon = contextIcons[ctx.type];
                                const isSelected = currentContext?.id === ctx.id;

                                return (
                                    <button
                                        key={ctx.id}
                                        onClick={() => {
                                            setCurrentContext(ctx);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                                            'hover:bg-zinc-800',
                                            isSelected && 'bg-zinc-800'
                                        )}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: ctx.color }}
                                        />
                                        <Icon className="w-4 h-4 text-zinc-400" />
                                        <div className="flex-1 text-left">
                                            <p className="text-sm">{ctx.name}</p>
                                            {ctx.tax_separate && (
                                                <p className="text-xs text-zinc-500">Tax Separate</p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        )}
                                    </button>
                                );
                            })}

                            <div className="my-1 border-t border-zinc-800" />

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // TODO: Open create context modal
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Add Context</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ContextSwitcher;
