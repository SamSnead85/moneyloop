'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    DollarSign,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Send,
    UserPlus,
    Banknote,
    ChevronRight,
    Clock,
    Building2,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { AddEmployeeModal } from '@/components/employer/AddEmployeeModal';
import { RunPayrollModal } from '@/components/employer/RunPayrollModal';

// Types
interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    salary: number;
    status: 'active' | 'pending';
}

// Mock data - simplified
const mockEmployees: Employee[] = [
    { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Senior Engineer', department: 'Engineering', salary: 145000, status: 'active' },
    { id: '2', name: 'Marcus Johnson', email: 'marcus@company.com', role: 'Product Designer', department: 'Design', salary: 125000, status: 'active' },
    { id: '3', name: 'Emily Rodriguez', email: 'emily@company.com', role: 'Marketing Manager', department: 'Marketing', salary: 110000, status: 'active' },
    { id: '4', name: 'Alex Kim', email: 'alex@company.com', role: 'DevOps Engineer', department: 'Engineering', salary: 135000, status: 'active' },
    { id: '5', name: 'Jordan Taylor', email: 'jordan@company.com', role: 'Customer Success', department: 'Operations', salary: 75000, status: 'pending' },
];

const nextPayroll = {
    payPeriod: 'Jan 16 - Jan 31',
    payDate: 'Feb 1, 2026',
    daysUntil: 8,
    estimatedTotal: 24567.89,
    employeeCount: 5,
};

const lastPayroll = {
    payDate: 'Jan 17, 2026',
    totalNet: 16663.99,
    status: 'completed' as const,
};

export default function EmployerDashboard() {
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);

    const activeEmployees = mockEmployees.filter(e => e.status === 'active').length;
    const pendingOnboarding = mockEmployees.filter(e => e.status === 'pending').length;
    const monthlyPayroll = mockEmployees.reduce((sum, e) => sum + e.salary, 0) / 12;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddEmployeeModal && (
                    <AddEmployeeModal
                        isOpen={showAddEmployeeModal}
                        onClose={() => setShowAddEmployeeModal(false)}
                        onSubmit={(data) => console.log('New employee:', data)}
                    />
                )}
            </AnimatePresence>

            {/* Run Payroll Modal */}
            <AnimatePresence>
                {showRunPayrollModal && (
                    <RunPayrollModal
                        isOpen={showRunPayrollModal}
                        onClose={() => setShowRunPayrollModal(false)}
                        onComplete={() => console.log('Payroll completed')}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                    <p className="text-sm text-white/40">Manage your team and payroll</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddEmployeeModal(true)}
                        className="border-white/10"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Employee
                    </Button>
                    <Button
                        onClick={() => setShowRunPayrollModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white"
                    >
                        <Send className="w-4 h-4" />
                        Run Payroll
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-5 h-5 text-cyan-400" />
                        {pendingOnboarding > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-xs">
                                {pendingOnboarding} pending
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-semibold text-white">{activeEmployees}</p>
                    <p className="text-sm text-white/40">Active Employees</p>
                </Card>

                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-semibold text-white">
                        ${monthlyPayroll.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-white/40">Monthly Payroll</p>
                </Card>

                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-white/40">In {nextPayroll.daysUntil} days</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{nextPayroll.payDate.split(',')[0]}</p>
                    <p className="text-sm text-white/40">Next Pay Date</p>
                </Card>
            </div>

            {/* Next Payroll Banner */}
            <Card className="p-5 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border-emerald-500/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Banknote className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Upcoming Payroll</h3>
                            <p className="text-sm text-white/50">
                                {nextPayroll.payPeriod} · {nextPayroll.employeeCount} employees
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xl font-semibold text-white">
                                ${nextPayroll.estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-white/40">Estimated total</p>
                        </div>
                        <Button
                            onClick={() => setShowRunPayrollModal(true)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white"
                        >
                            Review & Run
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Overview */}
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white">Team</h3>
                        <Link href="/employer/team">
                            <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {mockEmployees.slice(0, 4).map((employee) => (
                            <div
                                key={employee.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xs font-medium text-white">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{employee.name}</p>
                                        <p className="text-xs text-white/40">{employee.role}</p>
                                    </div>
                                </div>
                                {employee.status === 'pending' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-xs">
                                        Onboarding
                                    </span>
                                ) : (
                                    <span className="text-xs text-white/30">{employee.department}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                icon: CheckCircle2,
                                iconColor: 'text-emerald-400',
                                iconBg: 'bg-emerald-400/10',
                                title: 'Payroll completed',
                                subtitle: `$${lastPayroll.totalNet.toLocaleString()} • ${lastPayroll.payDate}`,
                            },
                            {
                                icon: UserPlus,
                                iconColor: 'text-cyan-400',
                                iconBg: 'bg-cyan-400/10',
                                title: 'Jordan Taylor invited',
                                subtitle: 'Awaiting onboarding completion',
                            },
                            {
                                icon: Building2,
                                iconColor: 'text-purple-400',
                                iconBg: 'bg-purple-400/10',
                                title: 'Q4 941 filed',
                                subtitle: 'Accepted by IRS',
                            },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01]">
                                <div className={`w-8 h-8 rounded-lg ${activity.iconBg} flex items-center justify-center`}>
                                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-white">{activity.title}</p>
                                    <p className="text-xs text-white/40">{activity.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Action Items */}
            {pendingOnboarding > 0 && (
                <Card className="p-4 bg-amber-400/5 border-amber-400/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {pendingOnboarding} employee{pendingOnboarding > 1 ? 's' : ''} pending onboarding
                                </p>
                                <p className="text-xs text-white/50">Send a reminder or complete their setup</p>
                            </div>
                        </div>
                        <Link href="/employer/team">
                            <Button variant="ghost" size="sm" className="text-amber-400">
                                View <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}
