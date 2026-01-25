'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronRight,
    Grid3X3,
    List,
    Filter,
    MessageSquare,
    User,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    department: string;
    location: string;
    avatar: string;
    startDate: string;
    managerId?: string;
    managerName?: string;
    directReports?: number;
}

// Mock data with hierarchy
const mockEmployees: Employee[] = [
    { id: '0', firstName: 'John', lastName: 'Smith', email: 'john@acme.com', phone: '(415) 555-0100', role: 'CEO', department: 'Executive', location: 'San Francisco', avatar: 'JS', startDate: '2020-01-01', directReports: 3 },

    { id: '1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@acme.com', phone: '(415) 555-0101', role: 'VP Engineering', department: 'Engineering', location: 'San Francisco', avatar: 'SC', startDate: '2021-06-15', managerId: '0', managerName: 'John Smith', directReports: 4 },
    { id: '2', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus@acme.com', phone: '(415) 555-0102', role: 'VP Design', department: 'Design', location: 'Remote', avatar: 'MJ', startDate: '2021-08-01', managerId: '0', managerName: 'John Smith', directReports: 2 },
    { id: '3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily@acme.com', phone: '(415) 555-0103', role: 'VP Marketing', department: 'Marketing', location: 'New York', avatar: 'ER', startDate: '2022-01-10', managerId: '0', managerName: 'John Smith', directReports: 3 },

    { id: '4', firstName: 'Jordan', lastName: 'Taylor', email: 'jordan@acme.com', role: 'Senior Engineer', department: 'Engineering', location: 'San Francisco', avatar: 'JT', startDate: '2022-03-01', managerId: '1', managerName: 'Sarah Chen' },
    { id: '5', firstName: 'Casey', lastName: 'Morgan', email: 'casey@acme.com', role: 'Senior Engineer', department: 'Engineering', location: 'Remote', avatar: 'CM', startDate: '2022-05-15', managerId: '1', managerName: 'Sarah Chen' },
    { id: '6', firstName: 'Alex', lastName: 'Rivera', email: 'alex@acme.com', role: 'Engineer', department: 'Engineering', location: 'San Francisco', avatar: 'AR', startDate: '2023-01-10', managerId: '1', managerName: 'Sarah Chen' },
    { id: '7', firstName: 'Jamie', lastName: 'Foster', email: 'jamie@acme.com', role: 'Junior Engineer', department: 'Engineering', location: 'Remote', avatar: 'JF', startDate: '2024-06-01', managerId: '1', managerName: 'Sarah Chen' },

    { id: '8', firstName: 'Taylor', lastName: 'Kim', email: 'taylor@acme.com', role: 'Senior Designer', department: 'Design', location: 'San Francisco', avatar: 'TK', startDate: '2022-02-01', managerId: '2', managerName: 'Marcus Johnson' },
    { id: '9', firstName: 'Morgan', lastName: 'Lee', email: 'morgan@acme.com', role: 'Designer', department: 'Design', location: 'Remote', avatar: 'ML', startDate: '2023-04-15', managerId: '2', managerName: 'Marcus Johnson' },

    { id: '10', firstName: 'Riley', lastName: 'Brown', email: 'riley@acme.com', role: 'Marketing Manager', department: 'Marketing', location: 'New York', avatar: 'RB', startDate: '2022-07-01', managerId: '3', managerName: 'Emily Rodriguez' },
    { id: '11', firstName: 'Quinn', lastName: 'Davis', email: 'quinn@acme.com', role: 'Content Specialist', department: 'Marketing', location: 'Remote', avatar: 'QD', startDate: '2023-02-15', managerId: '3', managerName: 'Emily Rodriguez' },
    { id: '12', firstName: 'Avery', lastName: 'Wilson', email: 'avery@acme.com', role: 'Marketing Coordinator', department: 'Marketing', location: 'New York', avatar: 'AW', startDate: '2024-01-08', managerId: '3', managerName: 'Emily Rodriguez' },
];

// Department color config
const departmentColors: Record<string, { color: string; bg: string }> = {
    Executive: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
    Engineering: { color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10' },
    Design: { color: 'text-purple-400', bg: 'bg-purple-400/10' },
    Marketing: { color: 'text-rose-400', bg: 'bg-rose-400/10' },
    Sales: { color: 'text-[#34d399]', bg: 'bg-[#34d399]/10' },
    Operations: { color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
};

// Employee Card (Grid View)
function EmployeeCard({ employee }: { employee: Employee }) {
    const deptConfig = departmentColors[employee.department] || { color: 'text-white/40', bg: 'bg-white/10' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-xl font-medium text-white mb-3">
                    {employee.avatar}
                </div>
                <h3 className="font-medium text-white">{employee.firstName} {employee.lastName}</h3>
                <p className="text-sm text-white/40">{employee.role}</p>
                <span className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${deptConfig.bg} ${deptConfig.color}`}>
                    {employee.department}
                </span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/40">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{employee.location}</span>
                </div>
                {employee.managerName && (
                    <div className="flex items-center gap-2 text-white/40">
                        <User className="w-3.5 h-3.5" />
                        <span>Reports to {employee.managerName}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" className="flex-1 border-white/10 text-xs">
                    <Mail className="w-3 h-3" />
                    Email
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 border-white/10 text-xs">
                    <MessageSquare className="w-3 h-3" />
                    Message
                </Button>
            </div>
        </motion.div>
    );
}

// Employee Row (List View)
function EmployeeRow({ employee }: { employee: Employee }) {
    const deptConfig = departmentColors[employee.department] || { color: 'text-white/40', bg: 'bg-white/10' };

    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                    {employee.avatar}
                </div>
                <div>
                    <p className="font-medium text-white">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-white/40">{employee.role}</p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-8">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${deptConfig.bg} ${deptConfig.color}`}>
                    {employee.department}
                </span>
                <span className="text-sm text-white/40 w-28">{employee.location}</span>
                <span className="text-sm text-white/40 w-40">{employee.email}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}

// Org Node
function OrgNode({ employee, depth = 0 }: { employee: Employee; depth?: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const directReports = mockEmployees.filter(e => e.managerId === employee.id);
    const hasReports = directReports.length > 0;
    const deptConfig = departmentColors[employee.department] || { color: 'text-white/40', bg: 'bg-white/10' };

    return (
        <div className="relative">
            {/* Connector line */}
            {depth > 0 && (
                <div className="absolute left-[-24px] top-0 bottom-0 w-px bg-white/[0.08]" />
            )}

            <div className="flex items-start gap-3">
                {hasReports && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 w-5 h-5 rounded border border-white/10 flex items-center justify-center hover:bg-white/[0.05]"
                    >
                        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                    </button>
                )}
                {!hasReports && depth > 0 && <div className="w-5" />}

                <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                            {employee.avatar}
                        </div>
                        <div>
                            <p className="font-medium text-white text-sm">{employee.firstName} {employee.lastName}</p>
                            <p className="text-xs text-white/40">{employee.role}</p>
                        </div>
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-medium ${deptConfig.bg} ${deptConfig.color}`}>
                            {employee.department}
                        </span>
                    </div>
                </div>
            </div>

            {/* Direct reports */}
            {expanded && hasReports && (
                <div className="ml-8 pl-4 border-l border-white/[0.08]">
                    {directReports.map((report) => (
                        <OrgNode key={report.id} employee={report} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Main Component
export default function DirectoryPage() {
    const [employees] = useState(mockEmployees);
    const [view, setView] = useState<'grid' | 'list' | 'org'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');

    const departments = [...new Set(employees.map(e => e.department))];

    const filteredEmployees = employees.filter(e => {
        const matchesSearch =
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = filterDepartment === 'all' || e.department === filterDepartment;
        return matchesSearch && matchesDept;
    });

    const ceo = employees.find(e => e.id === '0');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Company Directory</h1>
                    <p className="text-white/50">Find and connect with your team</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl">
                    {[
                        { id: 'grid', icon: Grid3X3, label: 'Grid' },
                        { id: 'list', icon: List, label: 'List' },
                        { id: 'org', icon: Building2, label: 'Org Chart' },
                    ].map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setView(v.id as typeof view)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === v.id
                                    ? 'bg-[#0ea5e9] text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                                }`}
                        >
                            <v.icon className="w-4 h-4" />
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <p className="text-2xl font-semibold text-white">{employees.length}</p>
                    <p className="text-xs text-white/40">Total Team</p>
                </Card>
                {departments.slice(0, 4).map((dept) => {
                    const count = employees.filter(e => e.department === dept).length;
                    const config = departmentColors[dept] || { color: 'text-white/40', bg: 'bg-white/10' };
                    return (
                        <Card key={dept} className="p-4 bg-white/[0.02] border-white/[0.06]">
                            <p className={`text-2xl font-semibold ${config.color}`}>{count}</p>
                            <p className="text-xs text-white/40">{dept}</p>
                        </Card>
                    );
                })}
            </div>

            {/* Filters */}
            {view !== 'org' && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                        >
                            <option value="all">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Content */}
            {view === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEmployees.map((employee) => (
                        <EmployeeCard key={employee.id} employee={employee} />
                    ))}
                </div>
            )}

            {view === 'list' && (
                <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {filteredEmployees.map((employee) => (
                            <EmployeeRow key={employee.id} employee={employee} />
                        ))}
                    </div>
                </Card>
            )}

            {view === 'org' && ceo && (
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <OrgNode employee={ceo} />
                </Card>
            )}

            {filteredEmployees.length === 0 && view !== 'org' && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No employees found</p>
                </div>
            )}
        </div>
    );
}
