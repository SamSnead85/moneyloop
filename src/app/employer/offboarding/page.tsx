'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserMinus,
    Calendar,
    FileText,
    Shield,
    CreditCard,
    Key,
    Laptop,
    Mail,
    Check,
    Clock,
    AlertCircle,
    ChevronRight,
    Plus,
    Users,
    X,
    Download,
    Settings,
    Building2,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface OffboardingCase {
    id: string;
    employeeId: string;
    employeeName: string;
    role: string;
    department: string;
    avatar: string;
    terminationType: 'voluntary' | 'involuntary' | 'layoff' | 'retirement';
    lastDay: string;
    noticeDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
    tasks: OffboardingTask[];
}

interface OffboardingTask {
    id: string;
    name: string;
    category: 'hr' | 'it' | 'payroll' | 'benefits' | 'security';
    status: 'pending' | 'in_progress' | 'completed';
    assignee?: string;
    dueDate?: string;
}

// Mock data
const mockCases: OffboardingCase[] = [
    {
        id: '1',
        employeeId: '6',
        employeeName: 'Alex Rivera',
        role: 'Product Manager',
        department: 'Product',
        avatar: 'AR',
        terminationType: 'voluntary',
        lastDay: '2026-02-15',
        noticeDate: '2026-01-15',
        status: 'in_progress',
        progress: 45,
        tasks: [
            { id: 't1', name: 'Exit interview scheduled', category: 'hr', status: 'completed' },
            { id: 't2', name: 'Knowledge transfer meeting', category: 'hr', status: 'in_progress', dueDate: '2026-02-10' },
            { id: 't3', name: 'Final paycheck calculation', category: 'payroll', status: 'pending', dueDate: '2026-02-15' },
            { id: 't4', name: 'COBRA notification sent', category: 'benefits', status: 'completed' },
            { id: 't5', name: 'Revoke system access', category: 'it', status: 'pending', dueDate: '2026-02-15' },
            { id: 't6', name: 'Collect company laptop', category: 'it', status: 'pending', dueDate: '2026-02-15' },
            { id: 't7', name: 'Remove building access', category: 'security', status: 'pending', dueDate: '2026-02-15' },
        ],
    },
    {
        id: '2',
        employeeId: '7',
        employeeName: 'Jamie Foster',
        role: 'Sales Representative',
        department: 'Sales',
        avatar: 'JF',
        terminationType: 'voluntary',
        lastDay: '2026-01-31',
        noticeDate: '2026-01-17',
        status: 'in_progress',
        progress: 70,
        tasks: [
            { id: 't1', name: 'Exit interview scheduled', category: 'hr', status: 'completed' },
            { id: 't2', name: 'Client handover', category: 'hr', status: 'completed' },
            { id: 't3', name: 'Final paycheck calculation', category: 'payroll', status: 'completed' },
            { id: 't4', name: 'Commission payout', category: 'payroll', status: 'in_progress' },
            { id: 't5', name: 'Revoke CRM access', category: 'it', status: 'pending' },
        ],
    },
];

// Task category config
const taskCategoryConfig = {
    hr: { label: 'HR', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    it: { label: 'IT', icon: Laptop, color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10' },
    payroll: { label: 'Payroll', icon: CreditCard, color: 'text-[#34d399]', bg: 'bg-[#34d399]/10' },
    benefits: { label: 'Benefits', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    security: { label: 'Security', icon: Key, color: 'text-rose-400', bg: 'bg-rose-400/10' },
};

// Termination type config
const terminationTypeConfig = {
    voluntary: { label: 'Resignation', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' },
    involuntary: { label: 'Termination', color: 'bg-rose-400/10 text-rose-400' },
    layoff: { label: 'Layoff', color: 'bg-amber-400/10 text-amber-400' },
    retirement: { label: 'Retirement', color: 'bg-purple-400/10 text-purple-400' },
};

// Offboarding Case Card
function OffboardingCaseCard({ case: offCase, onClick }: { case: OffboardingCase; onClick: () => void }) {
    const typeConfig = terminationTypeConfig[offCase.terminationType];
    const completedTasks = offCase.tasks.filter(t => t.status === 'completed').length;
    const daysRemaining = Math.ceil((new Date(offCase.lastDay).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400/20 to-amber-400/20 flex items-center justify-center text-lg font-medium text-white">
                        {offCase.avatar}
                    </div>
                    <div>
                        <h3 className="font-medium text-white">{offCase.employeeName}</h3>
                        <p className="text-sm text-white/40">{offCase.role} · {offCase.department}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${typeConfig.color}`}>
                    {typeConfig.label}
                </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">Progress</span>
                    <span className="text-white">{completedTasks}/{offCase.tasks.length} tasks</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${offCase.progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <span className="text-white/50">Last day: {offCase.lastDay}</span>
                </div>
                <span className={`text-xs ${daysRemaining <= 3 ? 'text-amber-400' : 'text-white/40'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Past due'}
                </span>
            </div>
        </div>
    );
}

// Task Item
function TaskItem({ task, onComplete }: { task: OffboardingTask; onComplete: () => void }) {
    const config = taskCategoryConfig[task.category];
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onComplete(); }}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${task.status === 'completed'
                        ? 'bg-[#34d399] border-[#34d399]'
                        : 'border-white/20 hover:border-[#34d399]/50'
                        }`}
                >
                    {task.status === 'completed' && <Check className="w-4 h-4 text-[#050508]" />}
                </button>
                <div>
                    <p className={`text-sm ${task.status === 'completed' ? 'text-white/40 line-through' : 'text-white'}`}>
                        {task.name}
                    </p>
                    {task.dueDate && task.status !== 'completed' && (
                        <p className="text-xs text-white/30">Due {task.dueDate}</p>
                    )}
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-medium ${config.bg} ${config.color}`}>
                {config.label}
            </span>
        </div>
    );
}

// Main Component
export default function OffboardingPage() {
    const [cases, setCases] = useState(mockCases);
    const [selectedCase, setSelectedCase] = useState<OffboardingCase | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);

    const inProgressCases = cases.filter(c => c.status === 'in_progress');
    const completedCases = cases.filter(c => c.status === 'completed');

    const handleCompleteTask = (caseId: string, taskId: string) => {
        setCases(prev => prev.map(c => {
            if (c.id === caseId) {
                const updatedTasks = c.tasks.map(t =>
                    t.id === taskId ? { ...t, status: 'completed' as const } : t
                );
                const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
                return {
                    ...c,
                    tasks: updatedTasks,
                    progress: Math.round((completedCount / updatedTasks.length) * 100),
                };
            }
            return c;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Offboarding</h1>
                    <p className="text-white/50">Manage employee departures and transitions</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Settings className="w-4 h-4" />
                        Templates
                    </Button>
                    <Button
                        onClick={() => setShowNewModal(true)}
                        className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                    >
                        <Plus className="w-4 h-4" />
                        New Offboarding
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{inProgressCases.length}</p>
                            <p className="text-xs text-white/40">In Progress</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{completedCases.length}</p>
                            <p className="text-xs text-white/40">Completed (YTD)</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <UserMinus className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">2</p>
                            <p className="text-xs text-white/40">This Month</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">5</p>
                            <p className="text-xs text-white/40">Pending Tasks</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Cases */}
                <div>
                    <h2 className="text-lg font-medium text-white mb-4">Active Cases</h2>
                    <div className="space-y-4">
                        {inProgressCases.map((c) => (
                            <OffboardingCaseCard
                                key={c.id}
                                case={c}
                                onClick={() => setSelectedCase(c)}
                            />
                        ))}
                        {inProgressCases.length === 0 && (
                            <Card className="p-8 bg-white/[0.02] border-white/[0.06] text-center">
                                <Check className="w-10 h-10 text-[#34d399] mx-auto mb-3" />
                                <p className="text-white/50">No active offboarding cases</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Case Detail / Checklist */}
                <div>
                    <h2 className="text-lg font-medium text-white mb-4">
                        {selectedCase ? `${selectedCase.employeeName}'s Checklist` : 'Select a Case'}
                    </h2>
                    {selectedCase ? (
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="space-y-3">
                                {selectedCase.tasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onComplete={() => handleCompleteTask(selectedCase.id, task.id)}
                                    />
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-8 bg-white/[0.02] border-white/[0.06] text-center">
                            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50">Select a case to view tasks</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Offboarding Checklist Template */}
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <h3 className="font-medium text-white mb-4">Standard Offboarding Checklist</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(taskCategoryConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <div key={key} className={`p-4 rounded-xl ${config.bg}`}>
                                <Icon className={`w-6 h-6 ${config.color} mb-2`} />
                                <p className="text-sm font-medium text-white">{config.label}</p>
                                <p className="text-xs text-white/40">
                                    {key === 'hr' && 'Exit interview, feedback'}
                                    {key === 'it' && 'Access, equipment'}
                                    {key === 'payroll' && 'Final pay, PTO payout'}
                                    {key === 'benefits' && 'COBRA, 401k rollover'}
                                    {key === 'security' && 'Badges, keys'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
