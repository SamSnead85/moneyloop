'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    Receipt,
    Settings,
    LogOut,
    Target,
    ArrowLeftRight,
    PieChart,
    Wallet,
    Building2,
    CreditCard,
    Heart,
    Sparkles,
    FileText,
    ShoppingCart,
    CalendarCheck,
    MessageSquare,
    Users,
    Bot,
    Baby,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: MessageSquare, label: 'Ask MoneyLoop', href: '/dashboard/ask' },
    { icon: Users, label: 'Household', href: '/dashboard/household' },
    { icon: Bot, label: 'AI Agents', href: '/dashboard/ai' },
    { icon: Baby, label: 'Family', href: '/dashboard/family' },
    { icon: Wallet, label: 'Accounts', href: '/dashboard/accounts' },
    { icon: ArrowLeftRight, label: 'Transactions', href: '/dashboard/transactions' },
    { icon: PieChart, label: 'Budgets', href: '/dashboard/budgets' },
    { icon: Target, label: 'Goals', href: '/dashboard/goals' },
    { icon: CalendarCheck, label: 'Bills', href: '/dashboard/bills' },
    { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { icon: ShoppingCart, label: 'Grocery', href: '/dashboard/grocery' },
    { icon: TrendingUp, label: 'Investments', href: '/dashboard/investments' },
    { icon: Receipt, label: 'Tax Center', href: '/dashboard/tax-optimizer' },
    { icon: Building2, label: 'Business', href: '/dashboard/business' },
    { icon: Heart, label: 'Healthcare', href: '/dashboard/healthcare' },
    { icon: Sparkles, label: 'AI Insights', href: '/dashboard/insights' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
];


export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#08080c] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo */}
            <div className="p-5 border-b border-white/[0.04]">
                <Link href="/" className="flex items-center gap-2.5">
                    <img
                        src="/logo.png"
                        alt="MoneyLoop"
                        className="w-8 h-8 rounded-lg"
                    />
                    <span className="text-base font-medium">MoneyLoop</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 pt-4">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom actions */}
            <div className="p-3 border-t border-white/[0.04]">
                <Link href="/dashboard/settings">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 transition-all text-sm">
                        <Settings className="w-4 h-4" />
                        <span className="font-medium">Settings</span>
                    </div>
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 transition-all text-sm">
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

            {/* User */}
            <div className="p-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-medium">
                        JS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">John Smith</p>
                        <p className="text-xs text-slate-600 truncate">Premium</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
