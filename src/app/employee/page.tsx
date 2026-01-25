'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Clock,
    DollarSign,
    FileText,
    Heart,
    Calendar,
    User,
    Building2,
    Play,
    Pause,
    Coffee,
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
    clockedIn: true,
    currentShiftStart: '09:00 AM',
    todayHours: 4.5,
    weekHours: 32.5,
    salary: 145000,
    payFrequency: 'Bi-weekly',
    nextPayDate: '2026-02-01',
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
    { id: '3', title: 'New expense policy effective Feb 1', date: '2026-01-15', urgent: false },
];

// Recent Pay Stubs
const recentPayStubs = [
    { id: 'ps1', date: '2026-01-17', grossPay: 5576.92, netPay: 4236.54, period: 'Jan 1-15' },
    { id: 'ps2', date: '2026-01-03', grossPay: 5576.92, netPay: 4236.54, period: 'Dec 16-31' },
    { id: 'ps3', date: '2025-12-20', grossPay: 5576.92, netPay: 4236.54, period: 'Dec 1-15' },
];

// Time Clock Widget
function TimeClockWidget() {
    const [isClockedIn, setIsClockedIn] = useState(mockEmployee.clockedIn);
    const [isOnBreak, setIsOnBreak] = useState(false);

    return (
        <Card className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#8b5cf6]/10 border-[#0ea5e9]/20">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-white">Time Clock</h3>
                    <p className="text-sm text-white/40">
                        {isClockedIn ? `Started at ${mockEmployee.currentShiftStart}` : 'Not clocked in'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-mono font-light text-white">{mockEmployee.todayHours.toFixed(1)}h</p>
                    <p className="text-xs text-white/40">Today</p>
                </div>
            </div>

            <div className="flex gap-3">
                {!isClockedIn ? (
                    <Button
                        onClick={() => setIsClockedIn(true)}
                        className="flex-1 bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90"
                    >
                        <Play className="w-4 h-4" />
                        Clock In
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setIsOnBreak(!isOnBreak)}
                            variant="secondary"
                            className={`flex-1 border-white/10 ${isOnBreak ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : ''}`}
                        >
                            <Coffee className="w-4 h-4" />
                            {isOnBreak ? 'End Break' : 'Break'}
                        </Button>
                        <Button
                            onClick={() => setIsClockedIn(false)}
                            variant="secondary"
                            className="flex-1 border-rose-400/30 text-rose-400 hover:bg-rose-400/10"
                        >
                            <Pause className="w-4 h-4" />
                            Clock Out
                        </Button>
                    </>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.08] flex justify-between text-sm">
                <span className="text-white/40">This week</span>
                <span className="text-white font-medium">{mockEmployee.weekHours}h / 40h</span>
            </div>
        </Card>
    );
}

// Navigation
function EmployeeSidebar() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', href: '/employee' },
        { icon: Clock, label: 'Time & Attendance', href: '/employee/time' },
        { icon: DollarSign, label: 'Pay', href: '/employee/pay' },
        { icon: Palmtree, label: 'Time Off', href: '/employee/pto' },
        { icon: Heart, label: 'Benefits', href: '/employee/benefits' },
        { icon: FileText, label: 'Documents', href: '/employee/documents' },
        { icon: User, label: 'My Profile', href: '/employee/profile' },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0a0a10] border-r border-white/[0.04] flex flex-col z-50">
            {/* Logo */}
            <div className="p-5 border-b border-white/[0.04]">
                <Link href="/employee" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center">
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
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all text-sm"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium">{item.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                        {mockEmployee.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{mockEmployee.firstName} {mockEmployee.lastName}</p>
                        <p className="text-xs text-slate-600 truncate">{mockEmployee.role}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 p-2 rounded-lg hover:bg-white/[0.03] text-white/40 hover:text-white transition-colors">
                        <Settings className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 rounded-lg hover:bg-white/[0.03] text-white/40 hover:text-white transition-colors">
                        <Bell className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 rounded-lg hover:bg-white/[0.03] text-white/40 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4 mx-auto" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

// Missing import
import { LayoutDashboard } from 'lucide-react';

// Main Component
export default function EmployeePortalPage() {
    return (
        <div className="min-h-screen bg-[#0a0a10]">
            {/* Sidebar */}
            <div className="hidden lg:block">
                <EmployeeSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:ml-60">
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-[#0a0a10]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-lg font-medium text-white">Welcome back, {mockEmployee.firstName}!</h1>
                        <p className="text-sm text-white/40">Here's your overview for today</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                            <Bell className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 space-y-6">
                    {/* Announcements */}
                    {announcements.filter(a => a.urgent).length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    {announcements.find(a => a.urgent)?.title}
                                </p>
                                <p className="text-xs text-white/40">Posted {announcements.find(a => a.urgent)?.date}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-amber-400">
                                View <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Top Row: Time Clock + Quick Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TimeClockWidget />

                        {/* Next Paycheck */}
                        <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">Next Paycheck</h3>
                                <DollarSign className="w-5 h-5 text-[#34d399]" />
                            </div>
                            <p className="text-3xl font-semibold text-[#34d399] mb-1">
                                ${mockEmployee.nextPayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-white/40 mb-4">{mockEmployee.nextPayDate} · {mockEmployee.payFrequency}</p>
                            <Link href="/employee/pay">
                                <Button variant="ghost" size="sm" className="text-[#0ea5e9] p-0">
                                    View pay history <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </Card>

                        {/* PTO Balance */}
                        <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">Time Off Balance</h3>
                                <Palmtree className="w-5 h-5 text-[#0ea5e9]" />
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Vacation', used: mockEmployee.pto.vacation.used, total: mockEmployee.pto.vacation.total, color: 'bg-[#0ea5e9]' },
                                    { label: 'Sick', used: mockEmployee.pto.sick.used, total: mockEmployee.pto.sick.total, color: 'bg-rose-400' },
                                    { label: 'Personal', used: mockEmployee.pto.personal.used, total: mockEmployee.pto.personal.total, color: 'bg-purple-400' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white/40">{item.label}</span>
                                            <span className="text-white">{item.total - item.used} days left</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{ width: `${(item.used / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/employee/pto">
                                <Button variant="ghost" size="sm" className="text-[#0ea5e9] p-0 mt-4">
                                    Request time off <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </Card>
                    </div>

                    {/* Recent Pay Stubs + Benefits */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Pay Stubs */}
                        <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">Recent Pay Stubs</h3>
                                <Link href="/employee/pay">
                                    <Button variant="ghost" size="sm" className="text-[#0ea5e9]">
                                        View all <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentPayStubs.map((stub) => (
                                    <div key={stub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-white">{stub.period}</p>
                                            <p className="text-xs text-white/40">Paid {stub.date}</p>
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

                        {/* Benefits Overview */}
                        <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">My Benefits</h3>
                                <Link href="/employee/benefits">
                                    <Button variant="ghost" size="sm" className="text-[#0ea5e9]">
                                        View details <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { type: 'Health', plan: mockEmployee.benefits.health.plan, enrolled: mockEmployee.benefits.health.enrolled, icon: Heart, color: 'text-rose-400' },
                                    { type: 'Dental', plan: mockEmployee.benefits.dental.plan, enrolled: mockEmployee.benefits.dental.enrolled, icon: Heart, color: 'text-blue-400' },
                                    { type: 'Vision', plan: mockEmployee.benefits.vision.plan, enrolled: mockEmployee.benefits.vision.enrolled, icon: Heart, color: 'text-purple-400' },
                                    { type: '401(k)', plan: `${mockEmployee.benefits.retirement.contribution}% contribution`, enrolled: true, icon: TrendingUp, color: 'text-[#34d399]' },
                                ].map((benefit) => (
                                    <div key={benefit.type} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
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
                                            <span className="flex items-center gap-1 text-xs text-[#34d399]">
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
                    <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                        <h3 className="font-medium text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: FileText, label: 'Download W-2', desc: '2025', href: '#' },
                                { icon: CreditCard, label: 'Update Direct Deposit', desc: 'Bank info', href: '#' },
                                { icon: User, label: 'Edit Profile', desc: 'Personal info', href: '/employee/profile' },
                                { icon: Calendar, label: 'Request Time Off', desc: 'Submit request', href: '/employee/pto' },
                            ].map((action) => (
                                <Link key={action.label} href={action.href}>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#0ea5e9]/30 transition-all group cursor-pointer">
                                        <action.icon className="w-6 h-6 text-[#0ea5e9] mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-sm font-medium text-white">{action.label}</p>
                                        <p className="text-xs text-white/40">{action.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
