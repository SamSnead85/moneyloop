import { createClient } from '@/lib/supabase/client';

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    plaid_transaction_id?: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    subcategory?: string;
    merchant_name?: string;
    pending: boolean;
    logo_url?: string;
    account_name?: string;
    created_at: string;
}

export interface TransactionFilters {
    search?: string;
    category?: string;
    account?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    type?: 'all' | 'income' | 'expense';
    status?: 'all' | 'posted' | 'pending';
}

// Category mappings for Plaid categories
const categoryMappings: Record<string, { category: string; icon: string; color: string }> = {
    'FOOD_AND_DRINK': { category: 'Food & Dining', icon: 'utensils', color: '#f97316' },
    'TRAVEL': { category: 'Travel', icon: 'plane', color: '#06b6d4' },
    'TRANSPORTATION': { category: 'Transportation', icon: 'car', color: '#8b5cf6' },
    'RENT_AND_UTILITIES': { category: 'Utilities', icon: 'zap', color: '#eab308' },
    'GENERAL_MERCHANDISE': { category: 'Shopping', icon: 'shopping-bag', color: '#ec4899' },
    'ENTERTAINMENT': { category: 'Entertainment', icon: 'film', color: '#a855f7' },
    'PERSONAL_CARE': { category: 'Personal Care', icon: 'heart', color: '#f43f5e' },
    'MEDICAL': { category: 'Healthcare', icon: 'activity', color: '#14b8a6' },
    'INCOME': { category: 'Income', icon: 'dollar-sign', color: '#10b981' },
    'TRANSFER': { category: 'Transfer', icon: 'repeat', color: '#6b7280' },
    'LOAN_PAYMENTS': { category: 'Debt', icon: 'credit-card', color: '#ef4444' },
    'GOVERNMENT_AND_NON_PROFIT': { category: 'Government', icon: 'building-2', color: '#64748b' },
    'HOME_IMPROVEMENT': { category: 'Home', icon: 'home', color: '#84cc16' },
    'GENERAL_SERVICES': { category: 'Services', icon: 'briefcase', color: '#0ea5e9' },
    'OTHER': { category: 'Other', icon: 'circle', color: '#94a3b8' },
};

// Normalize Plaid category to app category
export function normalizeCategory(plaidCategory?: string): { category: string; icon: string; color: string } {
    if (!plaidCategory) return categoryMappings['OTHER'];

    // Check for direct match
    if (categoryMappings[plaidCategory]) {
        return categoryMappings[plaidCategory];
    }

    // Check for partial match
    const upperCategory = plaidCategory.toUpperCase();
    for (const [key, value] of Object.entries(categoryMappings)) {
        if (upperCategory.includes(key) || key.includes(upperCategory)) {
            return value;
        }
    }

    return categoryMappings['OTHER'];
}

// Fetch transactions from database
export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const supabase = createClient();

    let query = supabase
        .from('transactions')
        .select(`
            *,
            accounts:account_id (
                name,
                institution
            )
        `)
        .order('date', { ascending: false });

    // Apply filters
    if (filters?.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
    }

    if (filters?.status === 'pending') {
        query = query.eq('pending', true);
    } else if (filters?.status === 'posted') {
        query = query.eq('pending', false);
    }

    if (filters?.type === 'income') {
        query = query.gt('amount', 0);
    } else if (filters?.type === 'expense') {
        query = query.lt('amount', 0);
    }

    if (filters?.dateRange) {
        query = query
            .gte('date', filters.dateRange.start.toISOString())
            .lte('date', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query.limit(100);

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return (data || []).map(tx => ({
        ...tx,
        account_name: tx.accounts?.name || 'Unknown Account',
    }));
}

// Sync transactions from Plaid
export async function syncTransactionsFromPlaid(accessToken: string): Promise<{ count: number; error?: string }> {
    try {
        const response = await fetch('/api/plaid/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accessToken,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
                endDate: new Date().toISOString().split('T')[0],
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to sync transactions');
        }

        const data = await response.json();
        return { count: data.transactions?.length || 0 };
    } catch (error) {
        console.error('Error syncing transactions:', error);
        return { count: 0, error: String(error) };
    }
}

// Calculate transaction summary
export function calculateSummary(transactions: Transaction[]) {
    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(
        transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
    );

    const pending = transactions.filter(t => t.pending).length;

    return {
        income,
        expenses,
        netCashFlow: income - expenses,
        totalTransactions: transactions.length,
        pendingCount: pending,
    };
}

// Group transactions by category
export function groupByCategory(transactions: Transaction[]) {
    const groups: Record<string, { total: number; count: number; color: string }> = {};

    transactions.filter(t => t.amount < 0).forEach(tx => {
        const cat = tx.category || 'Other';
        const categoryInfo = Object.values(categoryMappings).find(c => c.category === cat) || categoryMappings['OTHER'];

        if (!groups[cat]) {
            groups[cat] = { total: 0, count: 0, color: categoryInfo.color };
        }
        groups[cat].total += Math.abs(tx.amount);
        groups[cat].count += 1;
    });

    return Object.entries(groups)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total);
}

// Get spending by day for charts
export function getSpendingByDay(transactions: Transaction[], days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyData: Record<string, { date: string; income: number; expenses: number }> = {};

    // Initialize all days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyData[dateKey] = { date: dateKey, income: 0, expenses: 0 };
    }

    // Fill in transaction data
    transactions.forEach(tx => {
        const dateKey = tx.date.split('T')[0];
        if (dailyData[dateKey]) {
            if (tx.amount > 0) {
                dailyData[dateKey].income += tx.amount;
            } else {
                dailyData[dateKey].expenses += Math.abs(tx.amount);
            }
        }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
}
