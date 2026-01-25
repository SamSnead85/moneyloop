'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Users,
    Settings,
    DollarSign,
    FileText,
    Heart,
    Eye,
    Edit2,
    Trash2,
    Plus,
    Check,
    X,
    ChevronDown,
    Crown,
    User,
    Briefcase,
    Clock,
    AlertCircle,
    Mail,
    Search,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Role definitions with permissions
export const ROLES = {
    owner: {
        id: 'owner',
        name: 'Owner',
        description: 'Full access to all features. Can manage roles and billing.',
        icon: Crown,
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        permissions: ['all'],
    },
    admin: {
        id: 'admin',
        name: 'Admin',
        description: 'Full access except billing and role management.',
        icon: Shield,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        permissions: ['employees', 'payroll', 'benefits', 'documents', 'reports', 'settings'],
    },
    hr_manager: {
        id: 'hr_manager',
        name: 'HR Manager',
        description: 'Manage employees, onboarding, performance, and offboarding.',
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        permissions: ['employees', 'onboarding', 'performance', 'offboarding', 'documents', 'directory', 'announcements'],
    },
    payroll_manager: {
        id: 'payroll_manager',
        name: 'Payroll Manager',
        description: 'Run payroll, manage tax filings, and view reports.',
        icon: DollarSign,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        permissions: ['payroll', 'tax', 'reports', 'banking', 'expenses'],
    },
    benefits_admin: {
        id: 'benefits_admin',
        name: 'Benefits Admin',
        description: 'Manage employee benefits and enrollment.',
        icon: Heart,
        color: 'text-rose-400',
        bgColor: 'bg-rose-400/10',
        permissions: ['benefits', 'employees_view'],
    },
    manager: {
        id: 'manager',
        name: 'Team Manager',
        description: 'View and approve time, PTO, and expenses for direct reports.',
        icon: Briefcase,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10',
        permissions: ['team_view', 'time_approve', 'pto_approve', 'expenses_approve', 'performance_view'],
    },
    employee: {
        id: 'employee',
        name: 'Employee',
        description: 'View own pay stubs, benefits, time off, and profile.',
        icon: User,
        color: 'text-white/60',
        bgColor: 'bg-white/10',
        permissions: ['self_service'],
    },
} as const;

type RoleId = keyof typeof ROLES;

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: RoleId;
    department: string;
    avatar?: string;
    status: 'active' | 'invited' | 'inactive';
    lastLogin?: string;
}

const mockTeamMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Sam Snead',
        email: 'sam@company.com',
        role: 'owner',
        department: 'Executive',
        status: 'active',
        lastLogin: '2 hours ago',
    },
    {
        id: '2',
        name: 'Lisa Martinez',
        email: 'lisa@company.com',
        role: 'hr_manager',
        department: 'Human Resources',
        status: 'active',
        lastLogin: '1 day ago',
    },
    {
        id: '3',
        name: 'David Chen',
        email: 'david@company.com',
        role: 'payroll_manager',
        department: 'Finance',
        status: 'active',
        lastLogin: '3 hours ago',
    },
    {
        id: '4',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'manager',
        department: 'Engineering',
        status: 'active',
        lastLogin: '5 hours ago',
    },
    {
        id: '5',
        name: 'Mike Thompson',
        email: 'mike@company.com',
        role: 'employee',
        department: 'Engineering',
        status: 'active',
        lastLogin: '1 week ago',
    },
];

// Permission categories for display
const permissionCategories = [
    {
        name: 'Employee Management',
        permissions: [
            { id: 'employees', label: 'View & edit employees' },
            { id: 'employees_view', label: 'View employees only' },
            { id: 'onboarding', label: 'Manage onboarding' },
            { id: 'offboarding', label: 'Manage offboarding' },
            { id: 'directory', label: 'Company directory' },
        ],
    },
    {
        name: 'Payroll & Finance',
        permissions: [
            { id: 'payroll', label: 'Run payroll' },
            { id: 'tax', label: 'Tax filings' },
            { id: 'banking', label: 'Banking settings' },
            { id: 'expenses', label: 'Expense reports' },
            { id: 'expenses_approve', label: 'Approve expenses' },
        ],
    },
    {
        name: 'HR & Benefits',
        permissions: [
            { id: 'benefits', label: 'Benefits admin' },
            { id: 'performance', label: 'Performance reviews' },
            { id: 'performance_view', label: 'View performance' },
            { id: 'announcements', label: 'Announcements' },
        ],
    },
    {
        name: 'Time & Attendance',
        permissions: [
            { id: 'time_approve', label: 'Approve timesheets' },
            { id: 'pto_approve', label: 'Approve PTO' },
            { id: 'team_view', label: 'View team data' },
        ],
    },
    {
        name: 'Admin',
        permissions: [
            { id: 'reports', label: 'View reports' },
            { id: 'documents', label: 'Manage documents' },
            { id: 'settings', label: 'Company settings' },
        ],
    },
];

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: RoleId) => void;
}

function InviteAdminModal({ isOpen, onClose, onInvite }: InviteAdminModalProps) {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<RoleId>('hr_manager');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const handleInvite = () => {
        onInvite(email, selectedRole);
        setEmail('');
        setSelectedRole('hr_manager');
        onClose();
    };

    if (!isOpen) return null;

    const role = ROLES[selectedRole];
    const RoleIcon = role.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/[0.08] rounded-2xl shadow-2xl"
            >
                <div className="p-6 border-b border-white/[0.06]">
                    <h2 className="text-xl font-semibold text-white">Invite Admin</h2>
                    <p className="text-sm text-white/40">Invite someone to help manage your company</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-2">Role</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${role.bgColor} flex items-center justify-center`}>
                                        <RoleIcon className={`w-4 h-4 ${role.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{role.name}</p>
                                        <p className="text-xs text-white/40">{role.description}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showRoleDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[#0d1425] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-10"
                                    >
                                        {Object.values(ROLES).filter(r => r.id !== 'owner' && r.id !== 'employee').map((r) => {
                                            const Icon = r.icon;
                                            return (
                                                <button
                                                    key={r.id}
                                                    onClick={() => {
                                                        setSelectedRole(r.id as RoleId);
                                                        setShowRoleDropdown(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-4 hover:bg-white/[0.05] transition-colors ${selectedRole === r.id ? 'bg-cyan-500/10' : ''
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg ${r.bgColor} flex items-center justify-center`}>
                                                        <Icon className={`w-4 h-4 ${r.color}`} />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-medium text-white">{r.name}</p>
                                                        <p className="text-xs text-white/40">{r.description}</p>
                                                    </div>
                                                    {selectedRole === r.id && (
                                                        <Check className="w-4 h-4 text-cyan-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-white">Admin access</p>
                            <p className="text-xs text-white/50">
                                This person will have access to sensitive company and employee data based on their role.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-white/60">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleInvite}
                        disabled={!email}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white"
                    >
                        Send Invite
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

interface ChangeRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember | null;
    onChangeRole: (memberId: string, newRole: RoleId) => void;
}

function ChangeRoleModal({ isOpen, onClose, member, onChangeRole }: ChangeRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState<RoleId>(member?.role || 'employee');

    if (!isOpen || !member) return null;

    const handleSave = () => {
        onChangeRole(member.id, selectedRole);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/[0.08] rounded-2xl shadow-2xl"
            >
                <div className="p-6 border-b border-white/[0.06]">
                    <h2 className="text-xl font-semibold text-white">Change Role</h2>
                    <p className="text-sm text-white/40">Update role for {member.name}</p>
                </div>

                <div className="p-6 space-y-3">
                    {Object.values(ROLES).filter(r => r.id !== 'owner').map((r) => {
                        const Icon = r.icon;
                        return (
                            <button
                                key={r.id}
                                onClick={() => setSelectedRole(r.id as RoleId)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${selectedRole === r.id
                                    ? 'bg-cyan-500/10 border-cyan-500/30'
                                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${r.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${r.color}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-medium text-white">{r.name}</p>
                                    <p className="text-xs text-white/40">{r.description}</p>
                                </div>
                                {selectedRole === r.id && (
                                    <Check className="w-5 h-5 text-cyan-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="text-white/60">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-400 text-white">
                        Save Changes
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function TeamRolesManager() {
    const [members, setMembers] = useState(mockTeamMembers);
    const [searchQuery, setSearchQuery] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [activeRoleFilter, setActiveRoleFilter] = useState<RoleId | 'all'>('all');

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = activeRoleFilter === 'all' || m.role === activeRoleFilter;
        return matchesSearch && matchesRole;
    });

    const handleInvite = (email: string, role: RoleId) => {
        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role,
            department: 'Pending',
            status: 'invited',
        };
        setMembers(prev => [...prev, newMember]);
    };

    const handleChangeRole = (memberId: string, newRole: RoleId) => {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    };

    const handleRemoveAccess = (memberId: string) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-medium text-white">Team Roles & Permissions</h2>
                    <p className="text-sm text-white/40">Manage who can access what in your company</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)} className="bg-cyan-500 hover:bg-cyan-400 text-white">
                    <Plus className="w-4 h-4" />
                    Invite Admin
                </Button>
            </div>

            {/* Role Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(ROLES).filter(r => r.id !== 'employee').slice(0, 4).map((role) => {
                    const Icon = role.icon;
                    const count = members.filter(m => m.role === role.id).length;
                    return (
                        <button
                            key={role.id}
                            onClick={() => setActiveRoleFilter(activeRoleFilter === role.id ? 'all' : role.id as RoleId)}
                            className={`p-4 rounded-xl border transition-all ${activeRoleFilter === role.id
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${role.bgColor} flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${role.color}`} />
                            </div>
                            <p className="font-medium text-white text-left">{role.name}</p>
                            <p className="text-sm text-white/40 text-left">{count} {count === 1 ? 'member' : 'members'}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
            </div>

            {/* Members List */}
            <Card className="overflow-hidden bg-white/[0.02] border-white/[0.06]">
                <div className="divide-y divide-white/[0.04]">
                    {filteredMembers.map((member) => {
                        const role = ROLES[member.role];
                        const RoleIcon = role.icon;
                        return (
                            <div key={member.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                            <span className="text-lg font-medium text-white">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-white">{member.name}</h4>
                                                {member.status === 'invited' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-xs">Invited</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-white/40">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:block text-right">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-md ${role.bgColor} flex items-center justify-center`}>
                                                    <RoleIcon className={`w-3 h-3 ${role.color}`} />
                                                </div>
                                                <span className="text-sm font-medium text-white">{role.name}</span>
                                            </div>
                                            <p className="text-xs text-white/30">{member.lastLogin ? `Last login: ${member.lastLogin}` : 'Never logged in'}</p>
                                        </div>

                                        {member.role !== 'owner' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowChangeRoleModal(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                                                    title="Change role"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveAccess(member.id)}
                                                    className="p-2 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-colors"
                                                    title="Remove access"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Role Permissions Reference */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Role Permissions Reference</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left py-3 pr-4 text-white/40 font-medium">Permission</th>
                                {Object.values(ROLES).filter(r => r.id !== 'employee').map(role => (
                                    <th key={role.id} className="text-center py-3 px-2 text-white/40 font-medium">
                                        {role.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionCategories.map(category => (
                                <>
                                    <tr key={category.name}>
                                        <td colSpan={6} className="pt-4 pb-2 text-xs text-white/30 font-semibold uppercase">
                                            {category.name}
                                        </td>
                                    </tr>
                                    {category.permissions.map(perm => (
                                        <tr key={perm.id} className="border-b border-white/[0.04]">
                                            <td className="py-2 pr-4 text-white/60">{perm.label}</td>
                                            {Object.values(ROLES).filter(r => r.id !== 'employee').map(role => {
                                                const permissions = role.permissions as readonly string[];
                                                const hasPermission = permissions.includes('all') || permissions.includes(perm.id);
                                                return (
                                                    <td key={role.id} className="text-center py-2 px-2">
                                                        {hasPermission ? (
                                                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-white/20 mx-auto" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modals */}
            <AnimatePresence>
                {showInviteModal && (
                    <InviteAdminModal
                        isOpen={showInviteModal}
                        onClose={() => setShowInviteModal(false)}
                        onInvite={handleInvite}
                    />
                )}
                {showChangeRoleModal && (
                    <ChangeRoleModal
                        isOpen={showChangeRoleModal}
                        onClose={() => setShowChangeRoleModal(false)}
                        member={selectedMember}
                        onChangeRole={handleChangeRole}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default TeamRolesManager;
