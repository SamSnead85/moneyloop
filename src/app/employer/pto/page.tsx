'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Palmtree,
    Heart,
    Baby,
    Briefcase,
    Clock,
    Plus,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    AlertCircle,
    FileText,
    Settings,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement' | 'jury_duty';
    startDate: string;
    endDate: string;
    totalDays: number;
    status: 'pending' | 'approved' | 'denied' | 'cancelled';
    reason?: string;
    createdAt: string;
}

interface EmployeeBalance {
    employeeId: string;
    employeeName: string;
    avatar: string;
    vacation: { used: number; total: number };
    sick: { used: number; total: number };
    personal: { used: number; total: number };
}

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
    { id: '1', employeeId: '1', employeeName: 'Sarah Chen', type: 'vacation', startDate: '2026-02-10', endDate: '2026-02-14', totalDays: 5, status: 'pending', reason: 'Family vacation', createdAt: '2026-01-24' },
    { id: '2', employeeId: '2', employeeName: 'Marcus Johnson', type: 'sick', startDate: '2026-01-27', endDate: '2026-01-27', totalDays: 1, status: 'pending', createdAt: '2026-01-24' },
    { id: '3', employeeId: '3', employeeName: 'Emily Rodriguez', type: 'personal', startDate: '2026-02-03', endDate: '2026-02-03', totalDays: 1, status: 'approved', reason: 'Appointment', createdAt: '2026-01-20' },
    { id: '4', employeeId: '5', employeeName: 'Casey Morgan', type: 'vacation', startDate: '2026-03-15', endDate: '2026-03-22', totalDays: 6, status: 'approved', reason: 'Spring break trip', createdAt: '2026-01-15' },
];

const mockBalances: EmployeeBalance[] = [
    { employeeId: '1', employeeName: 'Sarah Chen', avatar: 'SC', vacation: { used: 5, total: 15 }, sick: { used: 2, total: 10 }, personal: { used: 1, total: 3 } },
    { employeeId: '2', employeeName: 'Marcus Johnson', avatar: 'MJ', vacation: { used: 8, total: 15 }, sick: { used: 1, total: 10 }, personal: { used: 0, total: 3 } },
    { employeeId: '3', employeeName: 'Emily Rodriguez', avatar: 'ER', vacation: { used: 3, total: 15 }, sick: { used: 0, total: 10 }, personal: { used: 2, total: 3 } },
    { employeeId: '5', employeeName: 'Casey Morgan', avatar: 'CM', vacation: { used: 10, total: 15 }, sick: { used: 3, total: 10 }, personal: { used: 1, total: 3 } },
];

// Leave Type Config
const leaveTypes = {
    vacation: { label: 'Vacation', icon: Palmtree, color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10' },
    sick: { label: 'Sick', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    personal: { label: 'Personal', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    parental: { label: 'Parental', icon: Baby, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    bereavement: { label: 'Bereavement', icon: Heart, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    jury_duty: { label: 'Jury Duty', icon: Briefcase, color: 'text-teal-400', bg: 'bg-teal-400/10' },
};

// Leave Request Card
function LeaveRequestCard({
    request,
    onApprove,
    onDeny
}: {
    request: LeaveRequest;
    onApprove: () => void;
    onDeny: () => void;
}) {
    const typeConfig = leaveTypes[request.type];
    const Icon = typeConfig.icon;

    const getStatusConfig = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'pending': return { label: 'Pending', color: 'bg-amber-400/10 text-amber-400' };
            case 'approved': return { label: 'Approved', color: 'bg-[#34d399]/10 text-[#34d399]' };
            case 'denied': return { label: 'Denied', color: 'bg-rose-400/10 text-rose-400' };
            case 'cancelled': return { label: 'Cancelled', color: 'bg-white/10 text-white/40' };
        }
    };

    const statusConfig = getStatusConfig(request.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{request.employeeName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-white/40">{typeConfig.label}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-white">{request.totalDays} day{request.totalDays > 1 ? 's' : ''}</p>
                    <p className="text-xs text-white/40">{request.startDate} - {request.endDate}</p>
                </div>
            </div>

            {request.reason && (
                <p className="text-sm text-white/50 mb-4 bg-white/[0.02] p-3 rounded-lg">
                    "{request.reason}"
                </p>
            )}

            {request.status === 'pending' && (
                <div className="flex gap-3">
                    <Button onClick={onApprove} className="flex-1 bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                        <Check className="w-4 h-4" />
                        Approve
                    </Button>
                    <Button onClick={onDeny} variant="secondary" className="flex-1 border-rose-400/30 text-rose-400 hover:bg-rose-400/10">
                        <X className="w-4 h-4" />
                        Deny
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

// Balance Card
function BalanceCard({ balance }: { balance: EmployeeBalance }) {
    const BalanceBar = ({ label, used, total, color }: { label: string; used: number; total: number; color: string }) => {
        const percent = (used / total) * 100;
        return (
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-white/40">{label}</span>
                    <span className="text-white/60">{total - used} left</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                    {balance.avatar}
                </div>
                <p className="font-medium text-white">{balance.employeeName}</p>
            </div>
            <div className="space-y-3">
                <BalanceBar label="Vacation" used={balance.vacation.used} total={balance.vacation.total} color="bg-[#0ea5e9]" />
                <BalanceBar label="Sick" used={balance.sick.used} total={balance.sick.total} color="bg-rose-400" />
                <BalanceBar label="Personal" used={balance.personal.used} total={balance.personal.total} color="bg-purple-400" />
            </div>
        </Card>
    );
}

// Calendar Day
function CalendarDay({ day, events }: { day: number; events: LeaveRequest[] }) {
    const today = day === 24; // Mock today
    const hasEvents = events.length > 0;

    return (
        <div className={`p-2 min-h-[80px] border border-white/[0.04] rounded-lg ${today ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/30' : 'bg-white/[0.01]'
            }`}>
            <p className={`text-xs font-medium mb-1 ${today ? 'text-[#0ea5e9]' : 'text-white/40'}`}>
                {day}
            </p>
            {events.slice(0, 2).map((event) => {
                const typeConfig = leaveTypes[event.type];
                return (
                    <div key={event.id} className={`text-[10px] px-1.5 py-0.5 rounded ${typeConfig.bg} ${typeConfig.color} mb-0.5 truncate`}>
                        {event.employeeName.split(' ')[0]}
                    </div>
                );
            })}
            {events.length > 2 && (
                <p className="text-[10px] text-white/30">+{events.length - 2} more</p>
            )}
        </div>
    );
}

// Main Component
export default function PTOPage() {
    const [requests, setRequests] = useState(mockLeaveRequests);
    const [balances] = useState(mockBalances);
    const [view, setView] = useState<'requests' | 'calendar' | 'balances'>('requests');
    const [currentMonth, setCurrentMonth] = useState('January 2026');

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const upcomingApproved = requests.filter(r => r.status === 'approved');

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    };

    const handleDeny = (id: string) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' as const } : r));
    };

    // Stats
    const stats = {
        pending: pendingRequests.length,
        upcomingDays: upcomingApproved.reduce((sum, r) => sum + r.totalDays, 0),
        outToday: 0,
        outThisWeek: 1,
    };

    // Calendar days for January 2026
    const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Time Off</h1>
                    <p className="text-white/50">Manage PTO, sick leave, and time-off requests</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Settings className="w-4 h-4" />
                        Policies
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Plus className="w-4 h-4" />
                        Add Request
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.pending}</p>
                            <p className="text-xs text-white/40">Pending</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.upcomingDays}</p>
                            <p className="text-xs text-white/40">Days Scheduled</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.outToday}</p>
                            <p className="text-xs text-white/40">Out Today</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.outThisWeek}</p>
                            <p className="text-xs text-white/40">Out This Week</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl w-fit">
                {[
                    { id: 'requests', label: 'Requests' },
                    { id: 'calendar', label: 'Calendar' },
                    { id: 'balances', label: 'Balances' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as typeof view)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === tab.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {view === 'requests' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending */}
                    <div>
                        <h2 className="text-lg font-medium text-white mb-4">Pending Requests ({pendingRequests.length})</h2>
                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <Card className="p-8 bg-white/[0.02] border-white/[0.06] text-center">
                                    <Check className="w-10 h-10 text-[#34d399] mx-auto mb-3" />
                                    <p className="text-white/50">No pending requests</p>
                                </Card>
                            ) : (
                                pendingRequests.map((request) => (
                                    <LeaveRequestCard
                                        key={request.id}
                                        request={request}
                                        onApprove={() => handleApprove(request.id)}
                                        onDeny={() => handleDeny(request.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div>
                        <h2 className="text-lg font-medium text-white mb-4">Upcoming Approved</h2>
                        <div className="space-y-4">
                            {upcomingApproved.map((request) => (
                                <LeaveRequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={() => { }}
                                    onDeny={() => { }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {view === 'calendar' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-lg hover:bg-white/[0.05]">
                                <ChevronLeft className="w-5 h-5 text-white/40" />
                            </button>
                            <h2 className="text-lg font-medium text-white">{currentMonth}</h2>
                            <button className="p-2 rounded-lg hover:bg-white/[0.05]">
                                <ChevronRight className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            {Object.entries(leaveTypes).slice(0, 3).map(([key, config]) => (
                                <span key={key} className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${config.bg.replace('/10', '')}`} />
                                    {config.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-xs text-white/40 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Empty cells for offset (Jan 2026 starts on Thursday) */}
                            {[...Array(4)].map((_, i) => (
                                <div key={`empty-${i}`} className="p-2 min-h-[80px]" />
                            ))}
                            {calendarDays.map((day) => (
                                <CalendarDay
                                    key={day}
                                    day={day}
                                    events={requests.filter(r => {
                                        const start = parseInt(r.startDate.split('-')[2]);
                                        const end = parseInt(r.endDate.split('-')[2]);
                                        return day >= start && day <= end && r.status === 'approved';
                                    })}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {view === 'balances' && (
                <div>
                    <h2 className="text-lg font-medium text-white mb-4">Employee Balances</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {balances.map((balance) => (
                            <BalanceCard key={balance.employeeId} balance={balance} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
