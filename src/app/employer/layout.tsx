'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Banknote,
    Heart,
    Settings,
    Building2,
    LogOut,
    Home,
    ChevronDown,
    ChevronRight,
    CreditCard,
    Menu,
    X,
} from 'lucide-react';

// Essential navigation only - what you actually need to run payroll
const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/employer' },
    { icon: Users, label: 'Team', href: '/employer/team' },
    { icon: Banknote, label: 'Payroll', href: '/employer/payroll' },
    { icon: Heart, label: 'Benefits', href: '/employer/benefits' },
    { icon: CreditCard, label: 'Banking', href: '/employer/banking' },
    { icon: Settings, label: 'Settings', href: '/employer/settings' },
];

function EmployerSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a10] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo */}
            <div className="p-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                    <Link href="/employer" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white">MoneyLoop</span>
                    </Link>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-white/10">
                            <X className="w-5 h-5 text-white/50" />
                        </button>
                    )}
                </div>

                {/* Company Selector */}
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-[10px] font-medium text-white">
                            A
                        </div>
                        <span className="text-sm text-white/80">Acme Inc.</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-0.5">
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/employer' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
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

            {/* Switch to Personal Finance */}
            <div className="p-3 border-t border-white/[0.04]">
                <Link href="/dashboard">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                            <Home className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-white/60">Personal Finance</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="p-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-medium text-white">
                        SS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Sam Snead</p>
                        <p className="text-xs text-white/40 truncate">Owner</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050508]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <EmployerSidebar />
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 h-14 bg-[#0a0a10]/95 backdrop-blur border-b border-white/[0.04] flex items-center justify-between px-4">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/[0.05]"
                >
                    <Menu className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">MoneyLoop</span>
                </div>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'tween', duration: 0.2 }}
                            className="lg:hidden fixed inset-y-0 left-0 z-50 w-56"
                        >
                            <EmployerSidebar onClose={() => setMobileMenuOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="lg:ml-56">
                <main className="min-h-screen p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
