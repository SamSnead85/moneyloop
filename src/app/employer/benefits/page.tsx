'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Users,
    DollarSign,
    Calendar,
    Plus,
    Edit2,
    Check,
    ChevronRight,
    Building2,
    Wallet,
    Eye,
    Shield,
    TrendingUp,
    Clock,
    FileText,
    AlertCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface BenefitPlan {
    id: string;
    type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement';
    name: string;
    provider: string;
    planType?: string;
    enrolled: number;
    eligible: number;
    monthlyCost: number;
    employerContribution: number;
    employeeContribution: number;
    effectiveDate: string;
    renewalDate?: string;
    status: 'active' | 'pending' | 'expired';
}

// Mock data
const mockBenefitPlans: BenefitPlan[] = [
    {
        id: '1',
        type: 'health',
        name: 'Blue Cross Blue Shield PPO',
        provider: 'Blue Cross Blue Shield',
        planType: 'PPO',
        enrolled: 4,
        eligible: 5,
        monthlyCost: 2400,
        employerContribution: 1920,
        employeeContribution: 480,
        effectiveDate: '2026-01-01',
        renewalDate: '2027-01-01',
        status: 'active',
    },
    {
        id: '2',
        type: 'dental',
        name: 'Delta Dental Premier',
        provider: 'Delta Dental',
        planType: 'Premier',
        enrolled: 3,
        eligible: 5,
        monthlyCost: 450,
        employerContribution: 360,
        employeeContribution: 90,
        effectiveDate: '2026-01-01',
        renewalDate: '2027-01-01',
        status: 'active',
    },
    {
        id: '3',
        type: 'vision',
        name: 'VSP Choice',
        provider: 'VSP Vision',
        planType: 'Choice',
        enrolled: 2,
        eligible: 5,
        monthlyCost: 180,
        employerContribution: 120,
        employeeContribution: 60,
        effectiveDate: '2026-01-01',
        renewalDate: '2027-01-01',
        status: 'active',
    },
    {
        id: '4',
        type: 'retirement',
        name: 'Guideline 401(k)',
        provider: 'Guideline',
        enrolled: 4,
        eligible: 5,
        monthlyCost: 0,
        employerContribution: 1200, // Match contributions
        employeeContribution: 3000, // Employee contributions
        effectiveDate: '2025-01-01',
        status: 'active',
    },
    {
        id: '5',
        type: 'life',
        name: 'Basic Life & AD&D',
        provider: 'MetLife',
        planType: '1x Salary',
        enrolled: 5,
        eligible: 5,
        monthlyCost: 150,
        employerContribution: 150,
        employeeContribution: 0,
        effectiveDate: '2026-01-01',
        status: 'active',
    },
];

// Benefit Plan Card
function BenefitPlanCard({ plan }: { plan: BenefitPlan }) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'health': return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10', gradient: 'from-rose-500 to-pink-500' };
            case 'dental': return { icon: Heart, color: 'text-blue-400', bg: 'bg-blue-400/10', gradient: 'from-blue-500 to-cyan-500' };
            case 'vision': return { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10', gradient: 'from-purple-500 to-indigo-500' };
            case 'life': return { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10', gradient: 'from-amber-500 to-orange-500' };
            case 'disability': return { icon: Shield, color: 'text-teal-400', bg: 'bg-teal-400/10', gradient: 'from-teal-500 to-cyan-500' };
            case 'retirement': return { icon: Wallet, color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', gradient: 'from-[#34d399] to-[#0ea5e9]' };
            default: return { icon: Heart, color: 'text-white/40', bg: 'bg-white/10', gradient: 'from-gray-500 to-gray-600' };
        }
    };

    const config = getTypeConfig(plan.type);
    const Icon = config.icon;
    const enrollmentPercent = (plan.enrolled / plan.eligible) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">{plan.name}</h3>
                        <p className="text-sm text-white/40">{plan.provider}</p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                    <Edit2 className="w-4 h-4 text-white/40" />
                </button>
            </div>

            {/* Enrollment */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/50">Enrollment</span>
                    <span className="text-sm text-white">{plan.enrolled} of {plan.eligible} eligible</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${enrollmentPercent}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                    />
                </div>
            </div>

            {/* Costs */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                <div>
                    <p className="text-xs text-white/40 mb-1">Employer Pays</p>
                    <p className="text-lg font-medium text-white">
                        ${plan.employerContribution.toLocaleString()}<span className="text-sm text-white/40">/mo</span>
                    </p>
                </div>
                <div>
                    <p className="text-xs text-white/40 mb-1">Employee Pays</p>
                    <p className="text-lg font-medium text-white/70">
                        ${plan.employeeContribution.toLocaleString()}<span className="text-sm text-white/40">/mo</span>
                    </p>
                </div>
            </div>

            {/* Renewal */}
            {plan.renewalDate && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <span className="text-xs text-white/40">Renews {plan.renewalDate}</span>
                </div>
            )}
        </motion.div>
    );
}

// Main Component
export default function BenefitsPage() {
    const [plans] = useState(mockBenefitPlans);

    // Calculate totals
    const totalMonthlyEmployerCost = plans.reduce((sum, p) => sum + p.employerContribution, 0);
    const totalEnrolled = plans.reduce((sum, p) => sum + p.enrolled, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Benefits</h1>
                    <p className="text-white/50">Manage health, retirement, and other benefit plans</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <FileText className="w-4 h-4" />
                        Open Enrollment
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Plus className="w-4 h-4" />
                        Add Plan
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Active Plans', value: plans.length, icon: Heart, color: 'text-rose-400' },
                    { label: 'Total Enrolled', value: `${totalEnrolled}`, icon: Users, color: 'text-[#0ea5e9]' },
                    { label: 'Monthly Cost', value: `$${totalMonthlyEmployerCost.toLocaleString()}`, icon: DollarSign, color: 'text-[#34d399]' },
                    { label: 'Annual Cost', value: `$${(totalMonthlyEmployerCost * 12).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400' },
                ].map((stat) => (
                    <Card key={stat.label} className="p-4 bg-white/[0.02] border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-semibold text-white">{stat.value}</p>
                                <p className="text-xs text-white/40">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Open Enrollment Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-[#0ea5e9]/10 to-[#8b5cf6]/10 border border-[#0ea5e9]/20"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white mb-1">Open Enrollment Coming Up</h3>
                            <p className="text-sm text-white/50">
                                Open enrollment for 2027 benefits begins November 1, 2026.
                                Start reviewing plan options now.
                            </p>
                        </div>
                    </div>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 whitespace-nowrap">
                        Configure Enrollment
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>

            {/* Benefit Plans Grid */}
            <div>
                <h2 className="text-lg font-medium text-white mb-4">Active Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <BenefitPlanCard key={plan.id} plan={plan} />
                    ))}

                    {/* Add Plan Card */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 transition-all flex flex-col items-center justify-center min-h-[200px] group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] group-hover:bg-[#0ea5e9]/20 flex items-center justify-center mb-3 transition-colors">
                            <Plus className="w-6 h-6 text-white/30 group-hover:text-[#0ea5e9]" />
                        </div>
                        <p className="text-sm font-medium text-white/50 group-hover:text-white">Add New Plan</p>
                        <p className="text-xs text-white/30">Health, Dental, 401(k), etc.</p>
                    </motion.button>
                </div>
            </div>

            {/* 401(k) Insights */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">401(k) Insights</h3>
                            <p className="text-xs text-white/40">Powered by Guideline</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-[#0ea5e9]">
                        View Details <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Participation Rate', value: '80%' },
                        { label: 'Avg. Contribution', value: '6.2%' },
                        { label: 'Employer Match', value: '4%' },
                        { label: 'YTD Match Cost', value: '$4,800' },
                    ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02]">
                            <p className="text-lg font-medium text-white">{stat.value}</p>
                            <p className="text-xs text-white/40">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Compliance */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Compliance Checklist</h3>
                <div className="space-y-3">
                    {[
                        { task: 'ACA Reporting (Form 1095-C)', status: 'complete', due: 'Filed Jan 31' },
                        { task: 'ERISA Summary Plan Descriptions', status: 'complete', due: 'On file' },
                        { task: 'COBRA Notices', status: 'complete', due: 'Automated' },
                        { task: '5500 Filing (401k)', status: 'upcoming', due: 'Due Jul 31' },
                    ].map((item) => (
                        <div
                            key={item.task}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                            <div className="flex items-center gap-3">
                                {item.status === 'complete' ? (
                                    <div className="w-6 h-6 rounded-full bg-[#34d399]/10 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-[#34d399]" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                    </div>
                                )}
                                <span className="text-sm text-white">{item.task}</span>
                            </div>
                            <span className={`text-xs ${item.status === 'complete' ? 'text-[#34d399]' : 'text-amber-400'}`}>
                                {item.due}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
