'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    CreditCard,
    TrendingUp,
    Sparkles,
    Building2,
    Settings,
    LogOut,
    ChevronDown,
    Wallet,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { icon: TrendingUp, label: 'Investments', href: '/dashboard/investments' },
    { icon: Sparkles, label: 'AI Insights', href: '/dashboard/insights' },
    { icon: Building2, label: 'Business', href: '/dashboard/business' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                    </div>
                    <span className="text-xl font-bold">MoneyLoop</span>
                </Link>
            </div>

            {/* Account Selector */}
            <div className="p-4">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium">Personal</p>
                            <p className="text-xs text-slate-500">3 accounts</p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-white/5 space-y-1">
                <Link href="/dashboard/settings">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium text-sm">Settings</span>
                    </div>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Log Out</span>
                </button>
            </div>

            {/* User profile */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-medium">
                        JS
                    </div>
                    <div>
                        <p className="text-sm font-medium">John Smith</p>
                        <p className="text-xs text-slate-500">john@example.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
