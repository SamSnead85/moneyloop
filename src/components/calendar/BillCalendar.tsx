'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    List,
    Grid3X3,
    CreditCard,
    AlertTriangle,
    Check,
    X,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface CalendarBill {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    category: string;
    status: 'pending' | 'paid' | 'overdue';
    recurring?: boolean;
    autopay?: boolean;
}

interface BillCalendarProps {
    bills: CalendarBill[];
    onSelectBill?: (bill: CalendarBill) => void;
    onMarkPaid?: (billId: string) => void;
    className?: string;
}

// ===== HELPERS =====

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const statusColors = {
    pending: 'var(--chart-3)',
    paid: 'var(--accent-success)',
    overdue: 'var(--accent-danger)',
};

// ===== MAIN COMPONENT =====

export function BillCalendar({
    bills,
    onSelectBill,
    onMarkPaid,
    className,
}: BillCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<'calendar' | 'timeline'>('calendar');

    const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

    // Group bills by date
    const billsByDate = useMemo(() => {
        const map = new Map<string, CalendarBill[]>();
        bills.forEach(bill => {
            const dateKey = bill.dueDate.slice(0, 10);
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)!.push(bill);
        });
        return map;
    }, [bills]);

    // Current month bills for timeline
    const monthBills = useMemo(() => {
        return bills
            .filter(b => {
                const d = new Date(b.dueDate);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [bills, currentMonth, currentYear]);

    // Monthly totals
    const monthlyTotal = monthBills.reduce((sum, b) => sum + b.amount, 0);
    const pendingTotal = monthBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
    const paidTotal = monthBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(y => y - 1);
            } else {
                setCurrentMonth(m => m - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(y => y + 1);
            } else {
                setCurrentMonth(m => m + 1);
            }
        }
        setSelectedDate(null);
    };

    const getBillsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return billsByDate.get(dateStr) || [];
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 rounded-xl hover:bg-[var(--surface-elevated)]"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <Text variant="heading-lg" className="min-w-[200px] text-center">
                            {monthLabel}
                        </Text>
                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 rounded-xl hover:bg-[var(--surface-elevated)]"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('calendar')}
                            className={cn(
                                'p-2 rounded-lg',
                                view === 'calendar' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                            )}
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('timeline')}
                            className={cn(
                                'p-2 rounded-lg',
                                view === 'timeline' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                            )}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                        <Text variant="body-sm" color="tertiary">Total Due</Text>
                        <Text variant="heading-md" className="font-mono">{formatCurrency(monthlyTotal)}</Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--accent-warning-subtle)]">
                        <Text variant="body-sm" color="tertiary">Pending</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-warning)]">
                            {formatCurrency(pendingTotal)}
                        </Text>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--accent-success-subtle)]">
                        <Text variant="body-sm" color="tertiary">Paid</Text>
                        <Text variant="heading-md" className="font-mono text-[var(--accent-success)]">
                            {formatCurrency(paidTotal)}
                        </Text>
                    </div>
                </div>
            </Surface>

            {/* Calendar View */}
            {view === 'calendar' && (
                <Surface elevation={1} className="p-6">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center py-2">
                                <Text variant="caption" color="tertiary">{day}</Text>
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for offset */}
                        {Array.from({ length: firstDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayDate = new Date(currentYear, currentMonth, day);
                            const isToday = isSameDay(dayDate, today);
                            const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
                            const dayBills = getBillsForDay(day);
                            const hasOverdue = dayBills.some(b => b.status === 'overdue');
                            const hasPending = dayBills.some(b => b.status === 'pending');

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dayDate)}
                                    className={cn(
                                        'aspect-square p-1 rounded-xl relative transition-colors',
                                        isSelected ? 'bg-[var(--accent-primary)] text-white' :
                                            isToday ? 'bg-[var(--accent-primary-subtle)]' :
                                                'hover:bg-[var(--surface-elevated)]'
                                    )}
                                >
                                    <Text variant="body-sm" className={cn(
                                        'font-medium',
                                        isSelected && 'text-white'
                                    )}>
                                        {day}
                                    </Text>

                                    {dayBills.length > 0 && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {dayBills.slice(0, 3).map((bill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: statusColors[bill.status] }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Surface>
            )}

            {/* Timeline View */}
            {view === 'timeline' && (
                <Surface elevation={1} className="p-6">
                    <div className="space-y-4">
                        {monthBills.length === 0 ? (
                            <div className="py-12 text-center">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                                <Text variant="body-md" color="tertiary">No bills this month</Text>
                            </div>
                        ) : (
                            monthBills.map(bill => {
                                const dueDate = new Date(bill.dueDate);
                                const isPast = dueDate < today;

                                return (
                                    <div
                                        key={bill.id}
                                        onClick={() => onSelectBill?.(bill)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] cursor-pointer transition-colors"
                                    >
                                        {/* Date */}
                                        <div className="w-14 text-center shrink-0">
                                            <Text variant="heading-md">
                                                {dueDate.getDate()}
                                            </Text>
                                            <Text variant="caption" color="tertiary">
                                                {dueDate.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </Text>
                                        </div>

                                        <div className="w-px h-12 bg-[var(--border-subtle)]" />

                                        {/* Bill info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Text variant="body-md" className="font-medium">{bill.name}</Text>
                                                {bill.autopay && (
                                                    <Badge variant="info" size="sm">Autopay</Badge>
                                                )}
                                            </div>
                                            <Text variant="body-sm" color="tertiary">{bill.category}</Text>
                                        </div>

                                        {/* Amount & Status */}
                                        <div className="text-right">
                                            <Text variant="mono-md">{formatCurrency(bill.amount)}</Text>
                                            <Badge
                                                variant={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'danger' : 'warning'}
                                                size="sm"
                                            >
                                                {bill.status}
                                            </Badge>
                                        </div>

                                        {/* Quick action */}
                                        {bill.status === 'pending' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMarkPaid?.(bill.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-[var(--accent-success-subtle)] text-[var(--accent-success)]"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Surface>
            )}

            {/* Selected Date Detail */}
            <AnimatePresence>
                {selectedDate && view === 'calendar' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <Surface elevation={1} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Text variant="heading-md">
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {getBillsForDay(selectedDate.getDate()).length === 0 ? (
                                <Text variant="body-sm" color="tertiary">No bills due on this day</Text>
                            ) : (
                                <div className="space-y-3">
                                    {getBillsForDay(selectedDate.getDate()).map(bill => (
                                        <div
                                            key={bill.id}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-[var(--surface-elevated)]"
                                        >
                                            <div className="flex-1">
                                                <Text variant="body-sm" className="font-medium">{bill.name}</Text>
                                                <Text variant="caption" color="tertiary">{bill.category}</Text>
                                            </div>
                                            <Text variant="mono-sm">{formatCurrency(bill.amount)}</Text>
                                            <Badge variant={bill.status === 'paid' ? 'success' : 'warning'} size="sm">
                                                {bill.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Surface>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BillCalendar;
