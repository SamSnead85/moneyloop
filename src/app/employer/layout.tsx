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
    FileText,
    Settings,
    Building2,
    LogOut,
    Home,
    ChevronDown,
    ChevronRight,
    CreditCard,
    TrendingUp,
    Receipt,
    Palmtree,
    UserPlus,
    UserMinus,
} from 'lucide-react';

// Simplified, grouped navigation structure
const navigationGroups = [
    {
        id: 'main',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/employer' },
        ],
    },
    {
        id: 'people',
        label: 'People',
        items: [
            { icon: Users, label: 'Team', href: '/employer/team' },
            { icon: UserPlus, label: 'Onboarding', href: '/employer/onboarding' },
            { icon: UserMinus, label: 'Offboarding', href: '/employer/offboarding' },
        ],
    },
    {
        id: 'pay',
        label: 'Pay & Expenses',
        items: [
            { icon: Banknote, label: 'Payroll', href: '/employer/payroll' },
            { icon: Palmtree, label: 'Time Off', href: '/employer/pto' },
            { icon: Receipt, label: 'Expenses', href: '/employer/expenses' },
        ],
    },
    {
        id: 'company',
        label: 'Company',
        items: [
            { icon: Heart, label: 'Benefits', href: '/employer/benefits' },
            { icon: FileText, label: 'Documents', href: '/employer/documents' },
            { icon: TrendingUp, label: 'Reports', href: '/employer/reports' },
        ],
    },
    {
        id: 'admin',
        label: 'Admin',
        items: [
            { icon: CreditCard, label: 'Banking', href: '/employer/banking' },
            { icon: Settings, label: 'Settings', href: '/employer/settings' },
        ],
    },
];

function EmployerSidebar() {
    const pathname = usePathname();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    // Determine which group should be expanded based on current path
    const activeGroup = navigationGroups.find(group =>
        group.items.some(item =>
            pathname === item.href ||
            (item.href !== '/employer' && pathname.startsWith(item.href))
        )
    )?.id;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a10] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo & Company */}
            <div className="p-4 border-b border-white/[0.04]">
                <Link href="/employer" className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-white">MoneyLoop</span>
                        <span className="block text-[10px] text-white/40">Employer Hub</span>
                    </div>
                </Link>

                {/* Company Selector */}
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-[10px] font-medium text-white">
                            A
                        </div>
                        <span className="text-sm text-white/80">Acme Inc.</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                {navigationGroups.map((group) => (
                    <div key={group.id} className="mb-1">
                        {group.label && (
                            <p className="px-3 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/employer' && pathname.startsWith(item.href));
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 2 }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${isActive
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
                    </div>
                ))}
            </nav>

            {/* Switch to Personal */}
            <div className="p-3 border-t border-white/[0.04]">
                <Link href="/dashboard">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                            <Home className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white/80">Personal Finance</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="p-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-medium text-white">
                        SS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Sam Snead</p>
                        <p className="text-xs text-white/40 truncate">Owner</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors">
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

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Building2 className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <EmployerSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:ml-56">
                <main className="min-h-screen">{children}</main>
            </div>
        </div>
    );
}
