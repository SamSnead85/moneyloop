/**
 * Bill Calendar & Payment Scheduling
 * 
 * Interactive bill calendar with payment scheduling,
 * vendor management, and autopay configuration.
 * 
 * Super-Sprint 16: Phases 1501-1550
 */

export interface Bill {
    id: string;
    userId: string;
    name: string;
    vendor: string;
    vendorLogo?: string;
    category: 'utilities' | 'rent' | 'insurance' | 'subscription' | 'loan' | 'credit_card' | 'phone' | 'internet' | 'other';
    amount: number;
    dueDate: number; // Day of month
    frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
    paymentMethod?: {
        type: 'bank_account' | 'credit_card' | 'manual';
        accountId?: string;
        last4?: string;
    };
    autopayEnabled: boolean;
    autopayDaysBefore: number; // Days before due date to pay
    reminderEnabled: boolean;
    reminderDays: number[]; // Days before due date to remind
    website?: string;
    customerServicePhone?: string;
    accountNumber?: string;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    history: PaymentRecord[];
}

export interface PaymentRecord {
    id: string;
    billId: string;
    amount: number;
    paidDate: Date;
    dueDate: Date;
    status: 'paid' | 'pending' | 'failed' | 'scheduled';
    paymentMethodUsed?: string;
    confirmationNumber?: string;
    wasLate: boolean;
}

export interface BillCalendarEntry {
    date: Date;
    bills: {
        billId: string;
        billName: string;
        amount: number;
        status: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'scheduled';
        daysUntilDue: number;
    }[];
    totalDue: number;
}

export interface MonthlyBillSummary {
    month: number;
    year: number;
    totalDue: number;
    totalPaid: number;
    totalOverdue: number;
    billCount: number;
    paidCount: number;
    upcomingBills: Bill[];
    overdueBills: Bill[];
}

// In-memory stores
const bills: Map<string, Bill> = new Map();

/**
 * Create a new bill
 */
export function createBill(params: Omit<Bill, 'id' | 'createdAt' | 'history'>): Bill {
    const id = `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const bill: Bill = {
        id,
        ...params,
        createdAt: new Date(),
        history: [],
    };

    bills.set(id, bill);
    return bill;
}

/**
 * Get user bills
 */
export function getUserBills(userId: string, activeOnly: boolean = true): Bill[] {
    return Array.from(bills.values())
        .filter(b => b.userId === userId && (!activeOnly || b.isActive))
        .sort((a, b) => a.dueDate - b.dueDate);
}

/**
 * Calculate next due date for a bill
 */
function getNextDueDate(bill: Bill, from: Date = new Date()): Date {
    const next = new Date(from);
    next.setDate(bill.dueDate);
    next.setHours(23, 59, 59, 999);

    // If already past this month's due date, move to next period
    if (next <= from) {
        switch (bill.frequency) {
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'quarterly':
                next.setMonth(next.getMonth() + 3);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
    }

    return next;
}

/**
 * Get bill status
 */
function getBillStatus(bill: Bill, lastPayment?: PaymentRecord): 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'scheduled' {
    const now = new Date();
    const dueDate = getNextDueDate(bill);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check if paid for current period
    if (lastPayment) {
        const paymentMonth = lastPayment.dueDate.getMonth();
        const currentDueMonth = dueDate.getMonth();
        if (paymentMonth === currentDueMonth && lastPayment.status === 'paid') {
            return 'paid';
        }
        if (lastPayment.status === 'scheduled') {
            return 'scheduled';
        }
    }

    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'due_soon';
    return 'upcoming';
}

/**
 * Get bill calendar for a date range
 */
export function getBillCalendar(
    userId: string,
    startDate: Date,
    endDate: Date
): BillCalendarEntry[] {
    const userBills = getUserBills(userId);
    const entries: Map<string, BillCalendarEntry> = new Map();

    for (const bill of userBills) {
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dueDate = getNextDueDate(bill, currentDate);

            if (dueDate >= startDate && dueDate <= endDate) {
                const dateKey = dueDate.toISOString().split('T')[0];
                const lastPayment = bill.history.find(h =>
                    h.dueDate.getMonth() === dueDate.getMonth() &&
                    h.dueDate.getFullYear() === dueDate.getFullYear()
                );

                const status = getBillStatus(bill, lastPayment);
                const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                if (!entries.has(dateKey)) {
                    entries.set(dateKey, {
                        date: new Date(dueDate),
                        bills: [],
                        totalDue: 0,
                    });
                }

                const entry = entries.get(dateKey)!;
                entry.bills.push({
                    billId: bill.id,
                    billName: bill.name,
                    amount: bill.amount,
                    status,
                    daysUntilDue,
                });

                if (status !== 'paid') {
                    entry.totalDue += bill.amount;
                }
            }

            // Move to next occurrence
            switch (bill.frequency) {
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    currentDate.setMonth(currentDate.getMonth() + 3);
                    break;
                case 'yearly':
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                    break;
                case 'one_time':
                    currentDate = new Date(endDate.getTime() + 1); // Exit loop
                    break;
            }
        }
    }

    return Array.from(entries.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get monthly bill summary
 */
export function getMonthlyBillSummary(userId: string, month: number, year: number): MonthlyBillSummary {
    const userBills = getUserBills(userId);

    let totalDue = 0;
    let totalPaid = 0;
    let totalOverdue = 0;
    let paidCount = 0;
    const upcomingBills: Bill[] = [];
    const overdueBills: Bill[] = [];

    for (const bill of userBills) {
        const dueDate = new Date(year, month, bill.dueDate);
        const payment = bill.history.find(h =>
            h.dueDate.getMonth() === month &&
            h.dueDate.getFullYear() === year
        );

        totalDue += bill.amount;

        if (payment?.status === 'paid') {
            totalPaid += payment.amount;
            paidCount++;
        } else {
            const status = getBillStatus(bill, payment);
            if (status === 'overdue') {
                overdueBills.push(bill);
                totalOverdue += bill.amount;
            } else {
                upcomingBills.push(bill);
            }
        }
    }

    return {
        month,
        year,
        totalDue: Math.round(totalDue * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalOverdue: Math.round(totalOverdue * 100) / 100,
        billCount: userBills.length,
        paidCount,
        upcomingBills,
        overdueBills,
    };
}

/**
 * Record a payment
 */
export function recordPayment(params: {
    billId: string;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    paymentMethodUsed?: string;
    confirmationNumber?: string;
}): PaymentRecord {
    const bill = bills.get(params.billId);
    if (!bill) throw new Error('Bill not found');

    const now = new Date();
    const paidDate = params.paidDate || now;
    const wasLate = paidDate > params.dueDate;

    const record: PaymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        billId: params.billId,
        amount: params.amount,
        paidDate,
        dueDate: params.dueDate,
        status: 'paid',
        paymentMethodUsed: params.paymentMethodUsed,
        confirmationNumber: params.confirmationNumber,
        wasLate,
    };

    bill.history.unshift(record);
    return record;
}

/**
 * Schedule a payment
 */
export function schedulePayment(params: {
    billId: string;
    amount: number;
    dueDate: Date;
    scheduledDate: Date;
    paymentMethodUsed?: string;
}): PaymentRecord {
    const bill = bills.get(params.billId);
    if (!bill) throw new Error('Bill not found');

    const record: PaymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        billId: params.billId,
        amount: params.amount,
        paidDate: params.scheduledDate,
        dueDate: params.dueDate,
        status: 'scheduled',
        paymentMethodUsed: params.paymentMethodUsed,
        wasLate: false,
    };

    bill.history.unshift(record);
    return record;
}

/**
 * Get bills due soon (next 7 days)
 */
export function getBillsDueSoon(userId: string, days: number = 7): Bill[] {
    const userBills = getUserBills(userId);
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + days);

    return userBills.filter(bill => {
        const dueDate = getNextDueDate(bill);
        return dueDate >= now && dueDate <= cutoff;
    });
}

/**
 * Get overdue bills
 */
export function getOverdueBills(userId: string): Bill[] {
    const userBills = getUserBills(userId);

    return userBills.filter(bill => {
        const lastPayment = bill.history[0];
        const status = getBillStatus(bill, lastPayment);
        return status === 'overdue';
    });
}

/**
 * Calculate annual bill total
 */
export function calculateAnnualBillTotal(userId: string): {
    annual: number;
    monthly: number;
    byCategory: Record<string, number>;
} {
    const userBills = getUserBills(userId);

    let annual = 0;
    const byCategory: Record<string, number> = {};

    for (const bill of userBills) {
        let yearlyAmount = bill.amount;

        switch (bill.frequency) {
            case 'monthly':
                yearlyAmount = bill.amount * 12;
                break;
            case 'quarterly':
                yearlyAmount = bill.amount * 4;
                break;
            case 'yearly':
                yearlyAmount = bill.amount;
                break;
        }

        annual += yearlyAmount;
        byCategory[bill.category] = (byCategory[bill.category] || 0) + yearlyAmount;
    }

    return {
        annual: Math.round(annual * 100) / 100,
        monthly: Math.round((annual / 12) * 100) / 100,
        byCategory,
    };
}

export default {
    createBill,
    getUserBills,
    getBillCalendar,
    getMonthlyBillSummary,
    recordPayment,
    schedulePayment,
    getBillsDueSoon,
    getOverdueBills,
    calculateAnnualBillTotal,
};
