'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

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
}

// Individual life element components
const MoneyStream = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            {/* Money falling animation */}
            {active && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-2xl"
                            initial={{ y: -20, x: 20 + i * 15, opacity: 0 }}
                            animate={{
                                y: 60,
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            💵
                        </motion.div>
                    ))}
                </div>
            )}
            <span className="text-3xl relative z-10">💰</span>
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Income
        </p>
    </motion.div>
);

const House = ({ active, warning, lightsOn, onClick }: { active: boolean; warning?: boolean; lightsOn: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-blue-500/20 border-blue-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">🏠</span>
            {/* Window lights */}
            {active && lightsOn && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-amber-300 rounded-full blur-[2px] animate-pulse" />
                    <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-amber-300 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '0.5s' }} />
                </motion.div>
            )}
            {warning && (
                <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    ⚠️
                </motion.div>
            )}
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Housing
        </p>
    </motion.div>
);

const Car = ({ active, warning, hasInsurance, onClick }: { active: boolean; warning?: boolean; hasInsurance: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-purple-500/20 border-purple-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">🚗</span>
            {/* Boot clamp when no insurance */}
            {active && !hasInsurance && (
                <motion.div
                    className="absolute bottom-2 right-2 text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    🔒
                </motion.div>
            )}
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Car
        </p>
    </motion.div>
);

const Utilities = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-yellow-500/20 border-yellow-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">💡</span>
            {active && (
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        boxShadow: warning
                            ? ['0 0 0px rgba(239,68,68,0)', '0 0 15px rgba(239,68,68,0.3)', '0 0 0px rgba(239,68,68,0)']
                            : ['0 0 0px rgba(250,204,21,0)', '0 0 20px rgba(250,204,21,0.4)', '0 0 0px rgba(250,204,21,0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Utilities
        </p>
    </motion.div>
);

const Phone = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">{warning ? '📵' : '📱'}</span>
            {active && !warning && (
                <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Phone
        </p>
    </motion.div>
);

const Wardrobe = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-pink-500/20 border-pink-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">👔</span>
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Clothes
        </p>
    </motion.div>
);

const Groceries = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-green-500/20 border-green-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">🍎</span>
            {active && (
                <motion.div
                    className="absolute -bottom-1 -right-1 text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    🛒
                </motion.div>
            )}
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Food
        </p>
    </motion.div>
);

const GasPump = ({ active, warning, onClick }: { active: boolean; warning?: boolean; onClick?: () => void }) => (
    <motion.div
        className={`relative cursor-pointer group ${active ? '' : 'opacity-30 grayscale'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
            ${warning ? 'bg-red-500/20 border-red-500/40' : active ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/5 border-white/10'}
            border-2 transition-all duration-500`}
        >
            <span className="text-3xl">⛽</span>
        </div>
        <p className="text-[10px] md:text-xs text-center mt-2 text-slate-400 group-hover:text-white transition-colors">
            Gas
        </p>
    </motion.div>
);

// Connector arrow between elements
const Connector = ({ active, delay = 0 }: { active: boolean; delay?: number }) => (
    <motion.div
        className="hidden md:flex items-center justify-center w-8"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: active ? 0.5 : 0.1, scaleX: 1 }}
        transition={{ delay, duration: 0.3 }}
    >
        <div className={`h-0.5 w-full ${active ? 'bg-gradient-to-r from-emerald-500/50 to-transparent' : 'bg-white/10'}`} />
    </motion.div>
);

export function LifeBuilder({ state, onElementClick, warnings = {}, compact = false }: LifeBuilderProps) {
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

    if (compact) {
        return (
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                {/* Compact progress bar */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-xs text-slate-400">{filledCategories}/8</span>
                </div>
                {/* Compact icons grid */}
                <div className="grid grid-cols-8 gap-1">
                    {[
                        { active: hasIncome, emoji: '💰', key: 'income' },
                        { active: hasHousing, emoji: '🏠', key: 'housing' },
                        { active: hasCar, emoji: '🚗', key: 'car' },
                        { active: hasUtilities, emoji: '💡', key: 'utilities' },
                        { active: hasPhone, emoji: '📱', key: 'phone' },
                        { active: hasShopping, emoji: '👔', key: 'shopping' },
                        { active: hasGroceries, emoji: '🍎', key: 'groceries' },
                        { active: hasGas, emoji: '⛽', key: 'gas' },
                    ].map(({ active, emoji, key }) => (
                        <motion.button
                            key={key}
                            className={`aspect-square rounded-lg flex items-center justify-center text-lg
                                ${active ? 'bg-white/10' : 'bg-white/[0.02] opacity-30 grayscale'}
                                ${warnings[key as keyof LifeBuilderState] ? 'ring-2 ring-red-500' : ''}
                                hover:bg-white/20 transition-colors`}
                            onClick={() => onElementClick?.(key as keyof LifeBuilderState)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative py-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 rounded-3xl" />

            {/* Progress indicator */}
            <div className="text-center mb-6">
                <p className="text-sm text-slate-400 mb-2">Your Life is Building...</p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.02] rounded-full border border-white/10">
                    <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <span className="text-sm font-mono text-emerald-400">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Life elements flow */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-0 px-4">
                <MoneyStream
                    active={hasIncome}
                    warning={warnings.income}
                    onClick={() => onElementClick?.('income')}
                />
                <Connector active={hasIncome} delay={0.1} />

                <House
                    active={hasHousing}
                    warning={warnings.housing}
                    lightsOn={hasUtilities}
                    onClick={() => onElementClick?.('housing')}
                />
                <Connector active={hasHousing} delay={0.2} />

                <Car
                    active={hasCar}
                    warning={warnings.car}
                    hasInsurance={hasInsurance}
                    onClick={() => onElementClick?.('car')}
                />
                <Connector active={hasCar} delay={0.3} />

                <Utilities
                    active={hasUtilities}
                    warning={warnings.utilities}
                    onClick={() => onElementClick?.('utilities')}
                />
                <Connector active={hasUtilities} delay={0.4} />

                <Phone
                    active={hasPhone}
                    warning={warnings.phone}
                    onClick={() => onElementClick?.('phone')}
                />
                <Connector active={hasPhone} delay={0.5} />

                <Wardrobe
                    active={hasShopping}
                    warning={warnings.shopping}
                    onClick={() => onElementClick?.('shopping')}
                />
                <Connector active={hasShopping} delay={0.6} />

                <Groceries
                    active={hasGroceries}
                    warning={warnings.groceries}
                    onClick={() => onElementClick?.('groceries')}
                />
                <Connector active={hasGroceries} delay={0.7} />

                <GasPump
                    active={hasGas}
                    warning={warnings.gas}
                    onClick={() => onElementClick?.('gas')}
                />
            </div>

            {/* Message for users */}
            <AnimatePresence>
                {filledCategories === 0 && (
                    <motion.p
                        className="text-center text-slate-500 text-sm mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        Start building your financial life by entering your income and expenses
                    </motion.p>
                )}
                {filledCategories === 8 && (
                    <motion.div
                        className="text-center mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm">
                            <span>🎉</span>
                            <span>Your financial life is complete!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LifeBuilder;
