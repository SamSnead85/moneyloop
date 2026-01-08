'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Home,
    Wallet,
    Target,
    Bot,
    Settings,
    PieChart,
    Receipt,
    CreditCard
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet },
    { href: '/dashboard/budgets', label: 'Budgets', icon: PieChart },
    { href: '/dashboard/goals', label: 'Goals', icon: Target },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center min-w-[60px] py-2 transition-colors"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute -top-0.5 w-8 h-1 rounded-full bg-emerald-500"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <Icon className={`w-5 h-5 mb-1 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'
                                }`} />
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// Quick Action FAB for mobile
export function QuickActionFAB({
    onPress
}: {
    onPress: () => void;
}) {
    return (
        <motion.button
            onClick={onPress}
            className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
        >
            <span className="text-2xl font-light">+</span>
        </motion.button>
    );
}

// Mobile-specific page header
export function MobileHeader({
    title,
    subtitle,
    rightAction
}: {
    title: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
}) {
    return (
        <div className="sticky top-0 z-30 md:hidden bg-[#050508]/95 backdrop-blur-xl pt-safe-top">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <div>
                    <h1 className="text-lg font-semibold">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                </div>
                {rightAction}
            </div>
        </div>
    );
}

// Pull to refresh indicator
export function PullToRefreshIndicator({
    refreshing
}: {
    refreshing: boolean;
}) {
    if (!refreshing) return null;

    return (
        <motion.div
            className="flex items-center justify-center py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <motion.div
                className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </motion.div>
    );
}

// Swipeable card for mobile actions
export function SwipeableCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction,
    rightAction
}: {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
}) {
    return (
        <motion.div
            className="relative"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.x < -100 && onSwipeLeft) {
                    onSwipeLeft();
                } else if (info.offset.x > 100 && onSwipeRight) {
                    onSwipeRight();
                }
            }}
        >
            {/* Background Actions */}
            <div className="absolute inset-y-0 left-0 right-0 flex">
                {leftAction && (
                    <div className="flex-1 bg-emerald-500/20 flex items-center justify-start pl-4">
                        {leftAction}
                    </div>
                )}
                {rightAction && (
                    <div className="flex-1 bg-red-500/20 flex items-center justify-end pr-4">
                        {rightAction}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="bg-[#0d0d12]">
                {children}
            </div>
        </motion.div>
    );
}

export default MobileBottomNav;
