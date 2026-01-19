'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

// Life element categories and their triggers
export interface LifeBuilderState {
    income: number;
    housing: number;
    car: number;
    utilities: number;
    insurance: number;
    phone: number;
    shopping: number;
    groceries: number;
    gas: number;
}

interface LifeBuilderProps {
    state: Partial<LifeBuilderState>;
    onElementClick?: (category: keyof LifeBuilderState) => void;
    warnings?: Partial<Record<keyof LifeBuilderState, boolean>>;
    compact?: boolean;
    showLabels?: boolean;
}

// Premium animated SVG-based elements

const SceneBackground = () => (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a0a12] to-slate-900" />

        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#818cf8]/5 rounded-full blur-3xl" />

        {/* Ground line */}
        <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stars/particles */}
        {[...Array(12)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                    left: `${10 + (i * 7.5)}%`,
                    top: `${15 + (i % 3) * 10}%`,
                }}
                animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                    duration: 3 + (i % 2),
                    repeat: Infinity,
                    delay: i * 0.3,
                }}
            />
        ))}
    </div>
);

// Premium Money Stream with flowing particles
const MoneyStream = ({
    active,
    amount,
    warning,
    onClick
}: {
    active: boolean;
    amount: number;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, x: -30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            {/* Animated money particles */}
            {active && (
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-lg opacity-80"
                            initial={{ y: -24, x: 8 + i * 12, opacity: 0, rotate: -15 }}
                            animate={{
                                y: [null, 80],
                                opacity: [0, 1, 1, 0],
                                rotate: [-15, 15],
                            }}
                            transition={{
                                duration: 2.5,
                                delay: i * 0.4,
                                repeat: Infinity,
                                ease: "easeIn"
                            }}
                        >
                            💵
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Main icon with glow */}
            <motion.div
                className="relative z-10 text-4xl"
                animate={active ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            >
                💰
            </motion.div>

            {/* Active glow ring */}
            {active && (
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        boxShadow: warning
                            ? ['0 0 0 rgba(239,68,68,0)', '0 0 30px rgba(239,68,68,0.3)', '0 0 0 rgba(239,68,68,0)']
                            : ['0 0 0 rgba(16,185,129,0)', '0 0 30px rgba(16,185,129,0.3)', '0 0 0 rgba(16,185,129,0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>

        {/* Label */}
        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Income
            </p>
            {active && amount > 0 && (
                <motion.p
                    className="text-[10px] text-emerald-400 font-mono"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    ${amount.toLocaleString()}/mo
                </motion.p>
            )}
        </motion.div>
    </motion.div>
);

// Premium House with animated windows
const House = ({
    active,
    warning,
    lightsOn,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    lightsOn: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 40, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/10 border-blue-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            {/* House icon */}
            <span className="text-4xl relative z-10">🏠</span>

            {/* Animated window lights */}
            {active && lightsOn && (
                <>
                    <motion.div
                        className="absolute top-7 left-6 w-2.5 h-2.5 bg-amber-300 rounded-sm"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.6, 1, 0.6],
                            boxShadow: ['0 0 8px rgba(252,211,77,0.5)', '0 0 16px rgba(252,211,77,0.8)', '0 0 8px rgba(252,211,77,0.5)']
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                        className="absolute top-7 right-6 w-2.5 h-2.5 bg-amber-300 rounded-sm"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.6, 1, 0.6],
                            boxShadow: ['0 0 8px rgba(252,211,77,0.5)', '0 0 16px rgba(252,211,77,0.8)', '0 0 8px rgba(252,211,77,0.5)']
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                    />
                    {/* Warm glow from house */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-amber-400/20 blur-xl"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </>
            )}

            {/* Warning badge */}
            {warning && (
                <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <span className="text-xs">!</span>
                </motion.div>
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Housing
            </p>
            {!lightsOn && active && (
                <p className="text-[10px] text-slate-500">No utilities</p>
            )}
        </motion.div>
    </motion.div>
);

// Premium Car with boot/insurance animation
const Car = ({
    active,
    warning,
    hasInsurance,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    hasInsurance: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-purple-500/20 to-violet-600/10 border-purple-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            {/* Car icon */}
            <motion.span
                className="text-4xl relative z-10"
                animate={active && hasInsurance ? { x: [0, 2, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
                🚗
            </motion.span>

            {/* Wheel boot when no insurance */}
            <AnimatePresence>
                {active && !hasInsurance && (
                    <motion.div
                        className="absolute bottom-3 right-3 text-xl z-20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        🔒
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insurance protection glow */}
            {active && hasInsurance && (
                <motion.div
                    className="absolute -top-1 -right-1 text-lg z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    🛡️
                </motion.div>
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Car
            </p>
            {active && !hasInsurance && (
                <p className="text-[10px] text-orange-400">Needs insurance</p>
            )}
        </motion.div>
    </motion.div>
);

// Utilities with glowing effect
const Utilities = ({
    active,
    warning,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.3 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            <motion.span
                className="text-4xl relative z-10"
                animate={active ? {
                    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                💡
            </motion.span>

            {/* Glow effect */}
            {active && (
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        boxShadow: warning
                            ? ['0 0 0 rgba(239,68,68,0)', '0 0 25px rgba(239,68,68,0.4)', '0 0 0 rgba(239,68,68,0)']
                            : ['0 0 0 rgba(250,204,21,0)', '0 0 35px rgba(250,204,21,0.4)', '0 0 0 rgba(250,204,21,0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Utilities
            </p>
        </motion.div>
    </motion.div>
);

// Phone with connection status
const Phone = ({
    active,
    warning,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.4 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-cyan-500/20 to-sky-600/10 border-cyan-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            <span className="text-4xl relative z-10">
                {warning ? '📵' : '📱'}
            </span>

            {/* Signal indicator */}
            {active && !warning && (
                <motion.div
                    className="absolute top-3 right-3 flex gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[1, 2, 3].map((bar) => (
                        <motion.div
                            key={bar}
                            className="w-1 bg-green-400 rounded-full"
                            style={{ height: 4 + bar * 2 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: bar * 0.2 }}
                        />
                    ))}
                </motion.div>
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Phone
            </p>
            {warning && (
                <p className="text-[10px] text-red-400">Disconnected</p>
            )}
        </motion.div>
    </motion.div>
);

// Wardrobe/Shopping
const Wardrobe = ({
    active,
    warning,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.5 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-pink-500/20 to-rose-600/10 border-pink-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            <motion.span
                className="text-4xl relative z-10"
                animate={active ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
            >
                👔
            </motion.span>
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Clothes
            </p>
        </motion.div>
    </motion.div>
);

// Groceries with cart animation
const Groceries = ({
    active,
    warning,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.6 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            <span className="text-4xl relative z-10">🍎</span>

            {/* Shopping cart badge */}
            {active && (
                <motion.div
                    className="absolute -bottom-1 -right-1 text-xl"
                    initial={{ scale: 0, x: 10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ type: "spring", delay: 0.8 }}
                >
                    🛒
                </motion.div>
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Food
            </p>
        </motion.div>
    </motion.div>
);

// Gas with fuel gauge
const GasPump = ({
    active,
    warning,
    onClick
}: {
    active: boolean;
    warning?: boolean;
    onClick?: () => void;
}) => (
    <motion.div
        className={`relative cursor-pointer group z-10 ${active ? '' : 'opacity-30'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.7 }}
        onClick={onClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-2xl 
            flex items-center justify-center overflow-hidden
            ${warning
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40'
                : active
                    ? 'bg-gradient-to-br from-orange-500/20 to-amber-600/10 border-orange-500/30'
                    : 'bg-white/[0.03] border-white/10'}
            border-2 transition-all duration-500
            backdrop-blur-sm
        `}>
            <span className="text-4xl relative z-10">⛽</span>

            {/* Fuel gauge indicator */}
            {active && (
                <motion.div
                    className="absolute bottom-2 left-2 right-2 h-1.5 bg-white/10 rounded-full overflow-hidden"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: warning ? '20%' : '80%' }}
                        transition={{ duration: 1, delay: 1 }}
                    />
                </motion.div>
            )}
        </div>

        <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
        >
            <p className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Gas
            </p>
        </motion.div>
    </motion.div>
);

// Animated connector line between elements
const Connector = ({ active, delay = 0 }: { active: boolean; delay?: number }) => (
    <motion.div
        className="hidden md:flex items-center justify-center w-6 lg:w-10 -mx-1"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: active ? 1 : 0.2, scaleX: 1 }}
        transition={{ delay, duration: 0.4 }}
    >
        <motion.div
            className={`h-0.5 w-full rounded-full ${active ? 'bg-gradient-to-r from-emerald-500/60 via-cyan-500/40 to-purple-500/30' : 'bg-white/10'}`}
            animate={active ? {
                opacity: [0.4, 0.8, 0.4],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        />
    </motion.div>
);

// Main LifeBuilder Component
export function LifeBuilder({
    state,
    onElementClick,
    warnings = {},
    compact = false,
    showLabels = true
}: LifeBuilderProps) {
    const hasIncome = (state.income ?? 0) > 0;
    const hasHousing = (state.housing ?? 0) > 0;
    const hasCar = (state.car ?? 0) > 0;
    const hasUtilities = (state.utilities ?? 0) > 0;
    const hasInsurance = (state.insurance ?? 0) > 0;
    const hasPhone = (state.phone ?? 0) > 0;
    const hasShopping = (state.shopping ?? 0) > 0;
    const hasGroceries = (state.groceries ?? 0) > 0;
    const hasGas = (state.gas ?? 0) > 0;

    // Calculate overall progress
    const filledCategories = [hasIncome, hasHousing, hasCar, hasUtilities, hasPhone, hasShopping, hasGroceries, hasGas].filter(Boolean).length;
    const progress = (filledCategories / 8) * 100;

    // Compact mode for mobile
    if (compact) {
        return (
            <div className="p-4 bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-2xl border border-white/10 backdrop-blur-sm">
                {/* Compact progress bar */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{filledCategories}/8</span>
                </div>

                {/* Compact icons grid */}
                <div className="grid grid-cols-8 gap-1.5">
                    {[
                        { active: hasIncome, emoji: '💰', key: 'income', color: 'emerald' },
                        { active: hasHousing, emoji: '🏠', key: 'housing', color: 'blue' },
                        { active: hasCar, emoji: '🚗', key: 'car', color: 'purple' },
                        { active: hasUtilities, emoji: '💡', key: 'utilities', color: 'yellow' },
                        { active: hasPhone, emoji: warnings.phone ? '📵' : '📱', key: 'phone', color: 'cyan' },
                        { active: hasShopping, emoji: '👔', key: 'shopping', color: 'pink' },
                        { active: hasGroceries, emoji: '🍎', key: 'groceries', color: 'green' },
                        { active: hasGas, emoji: '⛽', key: 'gas', color: 'orange' },
                    ].map(({ active, emoji, key }) => (
                        <motion.button
                            key={key}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-lg
                                ${active ? 'bg-white/10' : 'bg-white/[0.02] opacity-40 grayscale'}
                                ${warnings[key as keyof LifeBuilderState] ? 'ring-2 ring-red-500 animate-pulse' : ''}
                                hover:bg-white/20 transition-all duration-300
                            `}
                            onClick={() => onElementClick?.(key as keyof LifeBuilderState)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // Full visual mode
    return (
        <div className="relative py-6 md:py-10">
            <SceneBackground />

            {/* Header with progress */}
            <div className="relative z-10 text-center mb-6 md:mb-8">
                <motion.p
                    className="text-sm text-slate-400 mb-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Your Life is Building...
                </motion.p>

                <motion.div
                    className="inline-flex items-center gap-4 px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-28 h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <span className="text-sm font-mono text-emerald-400 font-medium">{Math.round(progress)}%</span>
                </motion.div>
            </div>

            {/* Life elements flow - Horizontal scroll on mobile, flex on desktop */}
            <div className="relative z-10 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
                <div className="flex items-start justify-start md:justify-center gap-1 md:gap-0 min-w-max md:min-w-0">
                    <MoneyStream
                        active={hasIncome}
                        amount={state.income ?? 0}
                        warning={warnings.income}
                        onClick={() => onElementClick?.('income')}
                    />
                    <Connector active={hasIncome} delay={0.15} />

                    <House
                        active={hasHousing}
                        warning={warnings.housing}
                        lightsOn={hasUtilities}
                        onClick={() => onElementClick?.('housing')}
                    />
                    <Connector active={hasHousing} delay={0.25} />

                    <Car
                        active={hasCar}
                        warning={warnings.car}
                        hasInsurance={hasInsurance}
                        onClick={() => onElementClick?.('car')}
                    />
                    <Connector active={hasCar} delay={0.35} />

                    <Utilities
                        active={hasUtilities}
                        warning={warnings.utilities}
                        onClick={() => onElementClick?.('utilities')}
                    />
                    <Connector active={hasUtilities} delay={0.45} />

                    <Phone
                        active={hasPhone}
                        warning={warnings.phone}
                        onClick={() => onElementClick?.('phone')}
                    />
                    <Connector active={hasPhone} delay={0.55} />

                    <Wardrobe
                        active={hasShopping}
                        warning={warnings.shopping}
                        onClick={() => onElementClick?.('shopping')}
                    />
                    <Connector active={hasShopping} delay={0.65} />

                    <Groceries
                        active={hasGroceries}
                        warning={warnings.groceries}
                        onClick={() => onElementClick?.('groceries')}
                    />
                    <Connector active={hasGroceries} delay={0.75} />

                    <GasPump
                        active={hasGas}
                        warning={warnings.gas}
                        onClick={() => onElementClick?.('gas')}
                    />
                </div>
            </div>

            {/* Status messages */}
            <AnimatePresence mode="wait">
                {filledCategories === 0 && (
                    <motion.p
                        className="relative z-10 text-center text-slate-500 text-sm mt-6 px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        Start building your financial life by entering your income and expenses
                    </motion.p>
                )}
                {filledCategories === 8 && (
                    <motion.div
                        className="relative z-10 text-center mt-6"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm backdrop-blur-sm">
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: 3 }}
                            >
                                🎉
                            </motion.span>
                            <span className="font-medium">Your financial life is complete!</span>
                        </div>
                    </motion.div>
                )}
                {filledCategories > 0 && filledCategories < 8 && (
                    <motion.p
                        className="relative z-10 text-center text-slate-500 text-xs mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        Tap any element to view or edit details
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LifeBuilder;
