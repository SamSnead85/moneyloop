'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Play,
    Pause,
    StopCircle,
    Calendar,
    Users,
    Check,
    X,
    AlertCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Timer,
    MapPin,
    FileText,
    Download,
    Filter,
    MoreHorizontal,
    Edit2,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface TimeEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    clockIn: string;
    clockOut?: string;
    breakMinutes: number;
    totalHours?: number;
    status: 'in_progress' | 'pending_approval' | 'approved' | 'rejected';
    notes?: string;
    location?: string;
}

interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    todayStatus: 'clocked_in' | 'clocked_out' | 'on_break' | 'not_started';
    todayHours: number;
    weeklyHours: number;
}

// Mock data
const mockEmployees: Employee[] = [
    { id: '1', name: 'Sarah Chen', role: 'Senior Engineer', department: 'Engineering', avatar: 'SC', todayStatus: 'clocked_in', todayHours: 4.5, weeklyHours: 28.5 },
    { id: '2', name: 'Marcus Johnson', role: 'Product Designer', department: 'Design', avatar: 'MJ', todayStatus: 'on_break', todayHours: 3.2, weeklyHours: 25.0 },
    { id: '3', name: 'Emily Rodriguez', role: 'Marketing Manager', department: 'Marketing', avatar: 'ER', todayStatus: 'clocked_in', todayHours: 5.0, weeklyHours: 32.0 },
    { id: '4', name: 'Jordan Taylor', role: 'Customer Success', department: 'Operations', avatar: 'JT', todayStatus: 'not_started', todayHours: 0, weeklyHours: 20.0 },
    { id: '5', name: 'Casey Morgan', role: 'Sales Rep', department: 'Sales', avatar: 'CM', todayStatus: 'clocked_out', todayHours: 8.0, weeklyHours: 40.0 },
];

const mockTimeEntries: TimeEntry[] = [
    { id: 't1', employeeId: '1', employeeName: 'Sarah Chen', date: '2026-01-24', clockIn: '09:00', clockOut: undefined, breakMinutes: 30, status: 'in_progress', location: 'Remote' },
    { id: 't2', employeeId: '2', employeeName: 'Marcus Johnson', date: '2026-01-24', clockIn: '09:30', clockOut: undefined, breakMinutes: 45, status: 'in_progress', location: 'Office' },
    { id: 't3', employeeId: '3', employeeName: 'Emily Rodriguez', date: '2026-01-24', clockIn: '08:00', clockOut: undefined, breakMinutes: 30, status: 'in_progress', location: 'Remote' },
    { id: 't4', employeeId: '5', employeeName: 'Casey Morgan', date: '2026-01-24', clockIn: '07:00', clockOut: '15:30', breakMinutes: 30, totalHours: 8.0, status: 'pending_approval' },
    { id: 't5', employeeId: '1', employeeName: 'Sarah Chen', date: '2026-01-23', clockIn: '09:15', clockOut: '17:45', breakMinutes: 30, totalHours: 8.0, status: 'approved' },
    { id: 't6', employeeId: '2', employeeName: 'Marcus Johnson', date: '2026-01-23', clockIn: '10:00', clockOut: '18:00', breakMinutes: 60, totalHours: 7.0, status: 'approved' },
];

// Live Clock
function LiveClock() {
    const [time, setTime] = useState(new Date());

    useState(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    });

    return (
        <div className="text-4xl font-mono font-light text-white">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
    );
}

// Status Badge
function StatusBadge({ status }: { status: Employee['todayStatus'] }) {
    const configs = {
        clocked_in: { label: 'Working', color: 'bg-[#34d399] text-[#050508]', dot: 'bg-[#050508]' },
        clocked_out: { label: 'Clocked Out', color: 'bg-white/10 text-white/60', dot: 'bg-white/40' },
        on_break: { label: 'On Break', color: 'bg-amber-400/20 text-amber-400', dot: 'bg-amber-400' },
        not_started: { label: 'Not Started', color: 'bg-white/5 text-white/40', dot: 'bg-white/20' },
    };

    const config = configs[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'clocked_in' ? 'animate-pulse' : ''}`} />
            {config.label}
        </span>
    );
}

// Employee Time Card
function EmployeeTimeCard({ employee }: { employee: Employee }) {
    return (
        <Card className="p-4 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                        {employee.avatar}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm">{employee.name}</p>
                            <StatusBadge status={employee.todayStatus} />
                        </div>
                        <p className="text-xs text-white/40">{employee.role}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-white">{employee.todayHours.toFixed(1)}h</p>
                    <p className="text-xs text-white/40">{employee.weeklyHours}h this week</p>
                </div>
            </div>
        </Card>
    );
}

// Timesheet Entry Row
function TimesheetRow({ entry, onApprove, onReject }: { entry: TimeEntry; onApprove: () => void; onReject: () => void }) {
    const getStatusConfig = (status: TimeEntry['status']) => {
        switch (status) {
            case 'in_progress': return { label: 'In Progress', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' };
            case 'pending_approval': return { label: 'Pending', color: 'bg-amber-400/10 text-amber-400' };
            case 'approved': return { label: 'Approved', color: 'bg-[#34d399]/10 text-[#34d399]' };
            case 'rejected': return { label: 'Rejected', color: 'bg-rose-400/10 text-rose-400' };
        }
    };

    const statusConfig = getStatusConfig(entry.status);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-sm font-medium text-white">
                    {entry.employeeName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{entry.employeeName}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{entry.date}</span>
                        <span>·</span>
                        <span>{entry.clockIn} - {entry.clockOut || 'Now'}</span>
                        {entry.location && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    {entry.totalHours !== undefined ? (
                        <p className="text-sm font-medium text-white">{entry.totalHours.toFixed(1)}h</p>
                    ) : (
                        <p className="text-sm font-medium text-[#0ea5e9]">Active</p>
                    )}
                    <p className="text-xs text-white/40">{entry.breakMinutes}m break</p>
                </div>

                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>

                {entry.status === 'pending_approval' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onApprove}
                            className="p-1.5 rounded-lg bg-[#34d399]/10 hover:bg-[#34d399]/20 transition-colors"
                        >
                            <Check className="w-4 h-4 text-[#34d399]" />
                        </button>
                        <button
                            onClick={onReject}
                            className="p-1.5 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-rose-400" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Quick Clock In/Out Panel
function QuickClockPanel() {
    const [isClockingIn, setIsClockingIn] = useState(false);

    return (
        <Card className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#8b5cf6]/10 border-[#0ea5e9]/20">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-medium text-white mb-1">Quick Clock In</h3>
                    <p className="text-sm text-white/40">For walk-in employees</p>
                </div>
                <LiveClock />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                    <Play className="w-4 h-4" />
                    Clock In
                </Button>
                <Button variant="secondary" className="border-white/10">
                    <StopCircle className="w-4 h-4" />
                    Clock Out
                </Button>
            </div>
        </Card>
    );
}

// Main Component
export default function TimePage() {
    const [employees] = useState(mockEmployees);
    const [timeEntries, setTimeEntries] = useState(mockTimeEntries);
    const [view, setView] = useState<'today' | 'week' | 'approvals'>('today');
    const [selectedWeek, setSelectedWeek] = useState('Jan 20 - Jan 26, 2026');

    const pendingApprovals = timeEntries.filter(e => e.status === 'pending_approval');
    const todayEntries = timeEntries.filter(e => e.date === '2026-01-24');

    const handleApprove = (id: string) => {
        setTimeEntries(prev => prev.map(e =>
            e.id === id ? { ...e, status: 'approved' as const } : e
        ));
    };

    const handleReject = (id: string) => {
        setTimeEntries(prev => prev.map(e =>
            e.id === id ? { ...e, status: 'rejected' as const } : e
        ));
    };

    // Stats
    const stats = {
        activeNow: employees.filter(e => e.todayStatus === 'clocked_in' || e.todayStatus === 'on_break').length,
        onBreak: employees.filter(e => e.todayStatus === 'on_break').length,
        totalHoursToday: employees.reduce((sum, e) => sum + e.todayHours, 0),
        pendingCount: pendingApprovals.length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Time & Attendance</h1>
                    <p className="text-white/50">Track hours, manage timesheets, approve entries</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Calendar className="w-4 h-4" />
                        Add Entry
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.activeNow}</p>
                            <p className="text-xs text-white/40">Clocked In</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.onBreak}</p>
                            <p className="text-xs text-white/40">On Break</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <Timer className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.totalHoursToday.toFixed(1)}h</p>
                            <p className="text-xs text-white/40">Today Total</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{stats.pendingCount}</p>
                            <p className="text-xs text-white/40">Pending Approval</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Clock Panel */}
            <QuickClockPanel />

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl w-fit">
                {[
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'approvals', label: `Approvals (${pendingApprovals.length})` },
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

            {/* Content based on view */}
            {view === 'today' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-white">Team Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {employees.map((employee) => (
                            <EmployeeTimeCard key={employee.id} employee={employee} />
                        ))}
                    </div>
                </div>
            )}

            {view === 'week' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                                <ChevronLeft className="w-5 h-5 text-white/40" />
                            </button>
                            <span className="text-sm font-medium text-white">{selectedWeek}</span>
                            <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                                <ChevronRight className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                    </div>

                    <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                        <div className="divide-y divide-white/[0.04]">
                            {timeEntries.map((entry) => (
                                <TimesheetRow
                                    key={entry.id}
                                    entry={entry}
                                    onApprove={() => handleApprove(entry.id)}
                                    onReject={() => handleReject(entry.id)}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {view === 'approvals' && (
                <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                        <Card className="p-12 bg-white/[0.02] border-white/[0.06] text-center">
                            <Check className="w-12 h-12 text-[#34d399] mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                            <p className="text-sm text-white/40">No timesheets pending approval</p>
                        </Card>
                    ) : (
                        <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                            <div className="divide-y divide-white/[0.04]">
                                {pendingApprovals.map((entry) => (
                                    <TimesheetRow
                                        key={entry.id}
                                        entry={entry}
                                        onApprove={() => handleApprove(entry.id)}
                                        onReject={() => handleReject(entry.id)}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" className="border-white/10">
                            Reject All
                        </Button>
                        <Button className="bg-[#34d399] text-[#050508] hover:bg-[#34d399]/90">
                            <Check className="w-4 h-4" />
                            Approve All
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
