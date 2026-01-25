'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Calendar,
    Building2,
    DollarSign,
    FileText,
    Upload,
    Download,
    Check,
    X,
    Edit2,
    Trash2,
    Send,
    Heart,
    Wallet,
    Shield,
    Clock,
    ChevronDown,
    AlertCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    employmentType: 'full-time' | 'part-time' | 'contractor';
    status: 'active' | 'pending' | 'onboarding' | 'offboarding' | 'terminated';
    startDate: string;
    salary: number;
    payType: 'salary' | 'hourly';
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
    manager?: string;
    benefits: {
        health: boolean;
        dental: boolean;
        vision: boolean;
        retirement: boolean;
    };
    onboardingProgress?: number;
}

// Mock data
const mockTeam: TeamMember[] = [
    {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah@acme.com',
        phone: '(415) 555-0101',
        role: 'Senior Software Engineer',
        department: 'Engineering',
        employmentType: 'full-time',
        status: 'active',
        startDate: '2024-03-15',
        salary: 145000,
        payType: 'salary',
        payFrequency: 'bi-weekly',
        benefits: { health: true, dental: true, vision: true, retirement: true },
    },
    {
        id: '2',
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: 'marcus@acme.com',
        phone: '(415) 555-0102',
        role: 'Product Designer',
        department: 'Design',
        employmentType: 'full-time',
        status: 'active',
        startDate: '2024-06-01',
        salary: 125000,
        payType: 'salary',
        payFrequency: 'bi-weekly',
        benefits: { health: true, dental: true, vision: false, retirement: true },
    },
    {
        id: '3',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily@acme.com',
        phone: '(415) 555-0103',
        role: 'Marketing Manager',
        department: 'Marketing',
        employmentType: 'full-time',
        status: 'active',
        startDate: '2024-01-20',
        salary: 110000,
        payType: 'salary',
        payFrequency: 'bi-weekly',
        benefits: { health: true, dental: false, vision: false, retirement: true },
    },
    {
        id: '4',
        firstName: 'Alex',
        lastName: 'Kim',
        email: 'alex@contractor.io',
        phone: '(415) 555-0104',
        role: 'DevOps Consultant',
        department: 'Engineering',
        employmentType: 'contractor',
        status: 'active',
        startDate: '2025-09-01',
        salary: 85,
        payType: 'hourly',
        payFrequency: 'bi-weekly',
        benefits: { health: false, dental: false, vision: false, retirement: false },
    },
    {
        id: '5',
        firstName: 'Jordan',
        lastName: 'Taylor',
        email: 'jordan@acme.com',
        phone: '(415) 555-0105',
        role: 'Customer Success Manager',
        department: 'Operations',
        employmentType: 'full-time',
        status: 'onboarding',
        startDate: '2026-02-01',
        salary: 75000,
        payType: 'salary',
        payFrequency: 'bi-weekly',
        benefits: { health: true, dental: true, vision: true, retirement: false },
        onboardingProgress: 60,
    },
    {
        id: '6',
        firstName: 'Casey',
        lastName: 'Morgan',
        email: 'casey@acme.com',
        phone: '(415) 555-0106',
        role: 'Sales Representative',
        department: 'Sales',
        employmentType: 'full-time',
        status: 'pending',
        startDate: '2026-02-15',
        salary: 65000,
        payType: 'salary',
        payFrequency: 'bi-weekly',
        benefits: { health: true, dental: true, vision: true, retirement: true },
    },
];

const departments = ['All', 'Engineering', 'Design', 'Marketing', 'Operations', 'Sales'];
const statuses = ['All', 'Active', 'Onboarding', 'Pending', 'Offboarding'];

// Add Employee Modal
function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-[#12121a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Add Team Member</h2>
                            <p className="text-sm text-white/40 mt-1">Step {step} of 3</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#0ea5e9]' : 'bg-white/[0.08]'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-white mb-4">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Work Email *</label>
                                <input
                                    type="email"
                                    placeholder="john@company.com"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-white mb-4">Employment Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Job Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Software Engineer"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Department *</label>
                                    <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                        <option value="">Select department</option>
                                        {departments.slice(1).map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Employment Type *</label>
                                    <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                        <option value="full-time">Full-time (W-2)</option>
                                        <option value="part-time">Part-time (W-2)</option>
                                        <option value="contractor">Contractor (1099)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Reports To</label>
                                <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                    <option value="">Select manager (optional)</option>
                                    <option value="sarah">Sarah Chen</option>
                                    <option value="marcus">Marcus Johnson</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-white mb-4">Compensation</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Pay Type *</label>
                                    <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                        <option value="salary">Salary (Annual)</option>
                                        <option value="hourly">Hourly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Amount *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="number"
                                            placeholder="75,000"
                                            className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm text-white/60 mb-3">Benefits Enrollment</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'health', label: 'Health Insurance', icon: Heart },
                                        { id: 'dental', label: 'Dental', icon: Heart },
                                        { id: 'vision', label: 'Vision', icon: Heart },
                                        { id: 'retirement', label: '401(k)', icon: Wallet },
                                    ].map((benefit) => (
                                        <label
                                            key={benefit.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] cursor-pointer hover:bg-white/[0.04] transition-colors"
                                        >
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-[#0ea5e9] peer-checked:border-[#0ea5e9] flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-white/70">{benefit.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 mt-4">
                                <div className="flex items-start gap-3">
                                    <Send className="w-5 h-5 text-[#0ea5e9] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-white">Onboarding Invite</p>
                                        <p className="text-xs text-white/40 mt-1">
                                            An email will be sent to the employee to complete their onboarding,
                                            including W-4, I-9, and direct deposit setup.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/[0.06] flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="text-white/60"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={() => step < 3 ? setStep(step + 1) : onClose()}
                        className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    >
                        {step < 3 ? 'Continue' : 'Add Employee'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// Team Member Card
function TeamMemberCard({ member, onSelect }: { member: TeamMember; onSelect: () => void }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-[#34d399]/10 text-[#34d399]';
            case 'onboarding': return 'bg-[#0ea5e9]/10 text-[#0ea5e9]';
            case 'pending': return 'bg-amber-400/10 text-amber-400';
            case 'offboarding': return 'bg-rose-400/10 text-rose-400';
            default: return 'bg-white/10 text-white/60';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer group"
            onClick={onSelect}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                            {member.firstName[0]}{member.lastName[0]}
                        </span>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{member.firstName} {member.lastName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${getStatusColor(member.status)}`}>
                                {member.status}
                            </span>
                        </div>
                        <p className="text-sm text-white/50">{member.role}</p>
                        <p className="text-xs text-white/30 mt-0.5">{member.department}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Compensation */}
                    <div className="hidden md:block text-right">
                        <p className="text-sm text-white/70">
                            {member.payType === 'hourly'
                                ? `$${member.salary}/hr`
                                : `$${member.salary.toLocaleString()}/yr`
                            }
                        </p>
                        <p className="text-xs text-white/40">
                            {member.employmentType === 'contractor' ? '1099' : 'W-2'}
                        </p>
                    </div>

                    {/* Benefits */}
                    {member.employmentType !== 'contractor' && (
                        <div className="hidden lg:flex items-center gap-1">
                            {member.benefits.health && (
                                <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center" title="Health">
                                    <Heart className="w-3 h-3 text-rose-400" />
                                </div>
                            )}
                            {member.benefits.retirement && (
                                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center" title="401k">
                                    <Wallet className="w-3 h-3 text-purple-400" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onboarding Progress */}
                    {member.status === 'onboarding' && member.onboardingProgress && (
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 rounded-full bg-white/[0.08]">
                                    <div
                                        className="h-full rounded-full bg-[#0ea5e9]"
                                        style={{ width: `${member.onboardingProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-white/40">{member.onboardingProgress}%</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <button className="p-2 rounded-lg hover:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-5 h-5 text-white/40" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Main Component
export default function TeamPage() {
    const [team] = useState(mockTeam);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredTeam = team.filter((member) => {
        const matchesSearch =
            member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = departmentFilter === 'All' || member.department === departmentFilter;
        const matchesStatus = statusFilter === 'All' || member.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const stats = {
        total: team.length,
        active: team.filter((m) => m.status === 'active').length,
        onboarding: team.filter((m) => m.status === 'onboarding' || m.status === 'pending').length,
        contractors: team.filter((m) => m.employmentType === 'contractor').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Team</h1>
                    <p className="text-white/50">Manage your employees and contractors</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Upload className="w-4 h-4" />
                        Import
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Team', value: stats.total, icon: Users, color: 'text-[#0ea5e9]' },
                    { label: 'Active', value: stats.active, icon: Check, color: 'text-[#34d399]' },
                    { label: 'Onboarding', value: stats.onboarding, icon: Clock, color: 'text-amber-400' },
                    { label: 'Contractors', value: stats.contractors, icon: FileText, color: 'text-purple-400' },
                ].map((stat) => (
                    <Card key={stat.label} className="p-4 bg-white/[0.02] border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                                <p className="text-xs text-white/40">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                    />
                </div>

                {/* Department Filter */}
                <div className="relative">
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                    >
                        {departments.map((d) => (
                            <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                    >
                        {statuses.map((s) => (
                            <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
            </div>

            {/* Onboarding Alert */}
            {stats.onboarding > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{stats.onboarding} team members need attention</p>
                            <p className="text-sm text-white/50">Complete onboarding or send reminders</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10">
                        View Pending
                    </Button>
                </motion.div>
            )}

            {/* Team List */}
            <div className="space-y-3">
                {filteredTeam.map((member) => (
                    <TeamMemberCard
                        key={member.id}
                        member={member}
                        onSelect={() => console.log('Selected:', member.id)}
                    />
                ))}
            </div>

            {filteredTeam.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No team members found</p>
                    <p className="text-sm text-white/30">Try adjusting your filters</p>
                </div>
            )}

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddEmployeeModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
