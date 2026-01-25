'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    DollarSign,
    FileText,
    Heart,
    Calendar,
    User,
    Building2,
    Download,
    ChevronRight,
    Bell,
    Settings,
    LogOut,
    Palmtree,
    Check,
    AlertCircle,
    TrendingUp,
    CreditCard,
    Clock,
    Plus,
    Send,
    LayoutDashboard,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Mock Employee Data
const mockEmployee = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@acme.com',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    manager: 'John Smith',
    startDate: '2024-03-15',
    avatar: 'SC',
    employmentType: 'salary', // salary or hourly
    salary: 145000,
    payFrequency: 'Bi-weekly',
    nextPayDate: 'Feb 1, 2026',
    nextPayAmount: 4236.54,
    benefits: {
        health: { plan: 'Blue Cross PPO', enrolled: true },
        dental: { plan: 'Delta Dental', enrolled: true },
        vision: { plan: 'VSP Choice', enrolled: true },
        retirement: { plan: '401(k)', contribution: 6, matchPercent: 4 },
    },
    pto: {
        vacation: { used: 5, total: 15 },
        sick: { used: 2, total: 10 },
        personal: { used: 1, total: 3 },
    },
};

// Announcements
const announcements = [
    { id: '1', title: 'Open Enrollment Starts Nov 1', date: '2026-01-24', urgent: true },
    { id: '2', title: 'Office closed Jan 31 for maintenance', date: '2026-01-20', urgent: false },
];

// Recent Pay Stubs
const recentPayStubs = [
    { id: 'ps1', date: 'Jan 17, 2026', grossPay: 5576.92, netPay: 4236.54, period: 'Jan 1-15' },
    { id: 'ps2', date: 'Jan 3, 2026', grossPay: 5576.92, netPay: 4236.54, period: 'Dec 16-31' },
    { id: 'ps3', date: 'Dec 20, 2025', grossPay: 5576.92, netPay: 4236.54, period: 'Dec 1-15' },
];

// Simple Time Report Widget (for hourly employees)
function TimeReportWidget() {
    const [weekHours, setWeekHours] = useState([
        { day: 'Mon', hours: 8, project: 'Product Development' },
        { day: 'Tue', hours: 8, project: 'Product Development' },
        { day: 'Wed', hours: 7.5, project: 'Client Meetings' },
        { day: 'Thu', hours: 8, project: 'Product Development' },
        { day: 'Fri', hours: 6, project: 'Documentation' },
    ]);
    const [submitted, setSubmitted] = useState(false);

    const totalHours = weekHours.reduce((sum, d) => sum + d.hours, 0);

    if (mockEmployee.employmentType === 'salary') {
        return null; // Salary employees don't need time reports
    }

    return (
        <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-medium text-white">Weekly Time Report</h3>
                    <p className="text-sm text-white/40">Week of Jan 20 - Jan 24</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{totalHours}h</p>
                    <p className="text-xs text-white/40">Total Hours</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {weekHours.map((day, i) => (
                    <div key={day.day} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                        <span className="w-10 text-sm text-white/40">{day.day}</span>
                        <input
                            type="number"
                            value={day.hours}
                            onChange={(e) => {
                                const newHours = [...weekHours];
                                newHours[i].hours = parseFloat(e.target.value) || 0;
                                setWeekHours(newHours);
                            }}
                            disabled={submitted}
                            className="w-16 px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-center text-sm disabled:opacity-50"
                        />
                        <span className="text-xs text-white/30">hrs</span>
                        <span className="flex-1 text-sm text-white/50 truncate">{day.project}</span>
                    </div>
                ))}
            </div>

            {submitted ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Submitted for approval</span>
                </div>
            ) : (
                <Button
                    onClick={() => setSubmitted(true)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-white"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Time Report
                </Button>
            )}
        </Card>
    );
}

// Navigation
function EmployeeSidebar() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/employee', active: true },
        { icon: DollarSign, label: 'Pay', href: '/employee/pay' },
        { icon: Palmtree, label: 'Time Off', href: '/employee/pto' },
        { icon: Heart, label: 'Benefits', href: '/employee/benefits' },
        { icon: FileText, label: 'Documents', href: '/employee/documents' },
    ];

    // Only show time reports for hourly employees
    if (mockEmployee.employmentType === 'hourly') {
        navItems.splice(2, 0, { icon: Clock, label: 'Time Reports', href: '/employee/time' });
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a10] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo */}
            <div className="p-4 border-b border-white/[0.04]">
                <Link href="/employee" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-white">Acme Inc.</span>
                        <span className="block text-[10px] text-white/40">Employee Portal</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 pt-4 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 2 }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${item.active
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium">{item.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/[0.04]">
                    <Link href="/employee/profile">
                        <motion.div
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/[0.03] hover:text-white text-sm transition-all"
                        >
                            <User className="w-4 h-4" />
                            <span className="font-medium">My Profile</span>
                        </motion.div>
                    </Link>
                    <Link href="/employee/settings">
                        <motion.div
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/[0.03] hover:text-white text-sm transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Settings</span>
                        </motion.div>
                    </Link>
                </div>
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-sm font-medium text-white">
                        {mockEmployee.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{mockEmployee.firstName} {mockEmployee.lastName}</p>
                        <p className="text-xs text-white/40 truncate">{mockEmployee.department}</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

// Main Component
export default function EmployeePortalPage() {
    return (
        <div className="min-h-screen bg-[#050508]">
            {/* Sidebar */}
            <div className="hidden lg:block">
                <EmployeeSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:ml-56">
                {/* Header */}
                <header className="sticky top-0 z-30 h-14 bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-base font-medium text-white">Welcome back, {mockEmployee.firstName}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 space-y-6 max-w-5xl">
                    {/* Announcements */}
                    {announcements.filter(a => a.urgent).length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    {announcements.find(a => a.urgent)?.title}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-amber-400">
                                View <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Next Paycheck */}
                        <Card className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-white/50">Next Paycheck</span>
                                <DollarSign className="w-4 h-4 text-cyan-400" />
                            </div>
                            <p className="text-2xl font-semibold text-white mb-1">
                                ${mockEmployee.nextPayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-white/40">{mockEmployee.nextPayDate}</p>
                        </Card>

                        {/* PTO Balance */}
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-white/50">Time Off Available</span>
                                <Palmtree className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-semibold text-white mb-1">
                                {mockEmployee.pto.vacation.total - mockEmployee.pto.vacation.used} days
                            </p>
                            <p className="text-xs text-white/40">
                                {mockEmployee.pto.vacation.used} used of {mockEmployee.pto.vacation.total}
                            </p>
                        </Card>

                        {/* 401(k) */}
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-white/50">401(k) Contribution</span>
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-2xl font-semibold text-white mb-1">
                                {mockEmployee.benefits.retirement.contribution}%
                            </p>
                            <p className="text-xs text-white/40">
                                +{mockEmployee.benefits.retirement.matchPercent}% employer match
                            </p>
                        </Card>
                    </div>

                    {/* Time Reports (only for hourly) */}
                    <TimeReportWidget />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Pay Stubs */}
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">Recent Pay Stubs</h3>
                                <Link href="/employee/pay">
                                    <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {recentPayStubs.map((stub) => (
                                    <div key={stub.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-white">{stub.period}</p>
                                            <p className="text-xs text-white/40">{stub.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">${stub.netPay.toLocaleString()}</p>
                                                <p className="text-xs text-white/40">Net</p>
                                            </div>
                                            <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Benefits Summary */}
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">My Benefits</h3>
                                <Link href="/employee/benefits">
                                    <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { type: 'Health', plan: mockEmployee.benefits.health.plan, enrolled: mockEmployee.benefits.health.enrolled, icon: Heart, color: 'text-rose-400' },
                                    { type: 'Dental', plan: mockEmployee.benefits.dental.plan, enrolled: mockEmployee.benefits.dental.enrolled, icon: Heart, color: 'text-blue-400' },
                                    { type: '401(k)', plan: `${mockEmployee.benefits.retirement.contribution}% contribution`, enrolled: true, icon: TrendingUp, color: 'text-emerald-400' },
                                ].map((benefit) => (
                                    <div key={benefit.type} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center ${benefit.color}`}>
                                                <benefit.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{benefit.type}</p>
                                                <p className="text-xs text-white/40">{benefit.plan}</p>
                                            </div>
                                        </div>
                                        {benefit.enrolled && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                <Check className="w-3 h-3" />
                                                Enrolled
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: Calendar, label: 'Request Time Off', href: '/employee/pto' },
                            { icon: CreditCard, label: 'Update Direct Deposit', href: '/employee/pay' },
                            { icon: FileText, label: 'Download W-2', href: '/employee/documents' },
                            { icon: User, label: 'Edit Profile', href: '/employee/profile' },
                        ].map((action) => (
                            <Link key={action.label} href={action.href}>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all group cursor-pointer">
                                    <action.icon className="w-5 h-5 text-cyan-400 mb-2" />
                                    <p className="text-sm text-white">{action.label}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
