'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Banknote,
    Heart,
    FileText,
    Settings,
    Building2,
    ArrowLeftRight,
    Receipt,
    TrendingUp,
    LogOut,
    Home,
    ChevronDown,
    CreditCard,
    Clock,
    Palmtree,
    Calendar,
    UserMinus,
    Star,
    Network,
    Megaphone,
} from 'lucide-react';

const employerNavItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/employer' },
    { icon: Network, label: 'Directory', href: '/employer/directory' },
    { icon: Megaphone, label: 'Announcements', href: '/employer/announcements' },
    { icon: Users, label: 'Team', href: '/employer/team' },
    { icon: Clock, label: 'Time Tracking', href: '/employer/time' },
    { icon: Palmtree, label: 'Time Off', href: '/employer/pto' },
    { icon: Banknote, label: 'Payroll', href: '/employer/payroll' },
    { icon: Heart, label: 'Benefits', href: '/employer/benefits' },
    { icon: Star, label: 'Performance', href: '/employer/performance' },
    { icon: ArrowLeftRight, label: 'Expenses', href: '/employer/expenses' },
    { icon: Receipt, label: 'Tax & Compliance', href: '/employer/tax' },
    { icon: UserMinus, label: 'Offboarding', href: '/employer/offboarding' },
    { icon: TrendingUp, label: 'Reports', href: '/employer/reports' },
    { icon: FileText, label: 'Documents', href: '/employer/documents' },
    { icon: CreditCard, label: 'Banking', href: '/employer/banking' },
    { icon: Settings, label: 'Settings', href: '/employer/settings' },
];

function EmployerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0a0a10] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo & Company Switcher */}
            <div className="p-5 border-b border-white/[0.04]">
                <Link href="/employer" className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34d399] to-[#0ea5e9] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-white">Employer Hub</span>
                        <span className="block text-[10px] text-white/40 uppercase tracking-wider">Business</span>
                    </div>
                </Link>

                {/* Company Selector */}
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-medium text-white">
                            A
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white/90">Acme Inc.</p>
                            <p className="text-[10px] text-white/40">5 employees</p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 pt-4 overflow-y-auto">
                <div className="space-y-1">
                    {employerNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/employer' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive
                                        ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20'
                                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
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

            {/* Switch to Personal */}
            <div className="p-3 border-t border-white/[0.04]">
                <Link href="/dashboard">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-[#34d399]/5 to-[#818cf8]/5 border border-[#34d399]/20 hover:border-[#34d399]/40 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34d399] to-[#818cf8] flex items-center justify-center">
                            <Home className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">Personal</p>
                            <p className="text-[10px] text-white/40">Switch to Household</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Bottom actions */}
            <div className="p-3 border-t border-white/[0.04]">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 transition-all text-sm">
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

            {/* User */}
            <div className="p-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34d399]/20 to-[#0ea5e9]/20 flex items-center justify-center text-xs font-medium text-white">
                        JS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">John Smith</p>
                        <p className="text-xs text-slate-600 truncate">Admin</p>
                    </div>
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
        <div className="min-h-screen bg-[#0a0a10]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <EmployerSidebar />
            </div>

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Building2 className="w-5 h-5 text-[#34d399]" />
            </button>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <EmployerSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:ml-60">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-[#0a0a10]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-medium text-white">Employer Hub</h1>
                        <span className="px-2 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399] text-xs font-medium">
                            Business
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm text-white/70">Current Period</p>
                            <p className="text-xs text-white/40">Jan 16 - Jan 31, 2026</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
