'use server';

import { createClient } from '@/lib/supabase/server';

// Types for dashboard data
export interface DashboardAccount {
    id: string;
    name: string;
    institution: string | null;
    type: string;
    subtype: string | null;
    balance: number;
    currency: string;
    last_synced: string | null;
}

export interface DashboardTransaction {
    id: string;
    name: string;
    amount: number;
    category: string | null;
    date: string;
    pending: boolean;
    account_id: string;
}

export interface DashboardGoal {
    id: string;
    name: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    color: string;
    icon: string | null;
    completed: boolean;
}

export interface DashboardIncomeStream {
    id: string;
    name: string;
    source: string | null;
    amount: number;
    frequency: string | null;
    next_payment_date: string | null;
    active: boolean;
}

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier: 'free' | 'premium' | 'family';
    onboarding_completed: boolean;
    onboarding_path: string | null;
    monthly_income: number;
}

export interface DashboardData {
    profile: UserProfile | null;
    accounts: DashboardAccount[];
    transactions: DashboardTransaction[];
    goals: DashboardGoal[];
    incomeStreams: DashboardIncomeStream[];
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    recentTransactions: DashboardTransaction[];
}

// Fetch user profile
export async function getUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

// Fetch all accounts
export async function getAccounts(): Promise<DashboardAccount[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }

    return data || [];
}

// Fetch transactions with optional limit
export async function getTransactions(limit?: number): Promise<DashboardTransaction[]> {
    const supabase = await createClient();

    let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return data || [];
}

// Fetch goals
export async function getGoals(): Promise<DashboardGoal[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching goals:', error);
        return [];
    }

    return data || [];
}

// Fetch income streams
export async function getIncomeStreams(): Promise<DashboardIncomeStream[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('income_streams')
        .select('*')
        .eq('active', true)
        .order('amount', { ascending: false });

    if (error) {
        console.error('Error fetching income streams:', error);
        return [];
    }

    return data || [];
}

// Calculate net worth from accounts
export function calculateNetWorth(accounts: DashboardAccount[]): number {
    return accounts.reduce((total, account) => {
        // Credit cards and loans are liabilities (negative)
        if (account.type === 'credit') {
            return total - Math.abs(account.balance);
        }
        return total + account.balance;
    }, 0);
}

// Calculate monthly totals from transactions
export function calculateMonthlyTotals(transactions: DashboardTransaction[]): {
    income: number;
    expenses: number;
} {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = transactions.filter(t =>
        new Date(t.date) >= startOfMonth
    );

    let income = 0;
    let expenses = 0;

    monthlyTransactions.forEach(t => {
        if (t.amount > 0) {
            income += t.amount;
        } else {
            expenses += Math.abs(t.amount);
        }
    });

    return { income, expenses };
}

// Get spending breakdown by category
export function getSpendingByCategory(transactions: DashboardTransaction[]): Record<string, number> {
    const spending: Record<string, number> = {};

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    transactions
        .filter(t => new Date(t.date) >= startOfMonth && t.amount < 0)
        .forEach(t => {
            const category = t.category || 'Uncategorized';
            spending[category] = (spending[category] || 0) + Math.abs(t.amount);
        });

    return spending;
}

// Fetch complete dashboard data
export async function getDashboardData(): Promise<DashboardData> {
    const [profile, accounts, transactions, goals, incomeStreams] = await Promise.all([
        getUserProfile(),
        getAccounts(),
        getTransactions(),
        getGoals(),
        getIncomeStreams(),
    ]);

    const netWorth = calculateNetWorth(accounts);
    const { income: monthlyIncome, expenses: monthlyExpenses } = calculateMonthlyTotals(transactions);
    const recentTransactions = transactions.slice(0, 10);

    return {
        profile,
        accounts,
        transactions,
        goals,
        incomeStreams,
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        recentTransactions,
    };
}

// Add account
export async function addAccount(account: Omit<DashboardAccount, 'id'>): Promise<DashboardAccount | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('accounts')
        .insert({ ...account, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error adding account:', error);
        return null;
    }

    return data;
}

// Add transaction
export async function addTransaction(transaction: Omit<DashboardTransaction, 'id'>): Promise<DashboardTransaction | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }

    return data;
}

// Add goal
export async function addGoal(goal: Omit<DashboardGoal, 'id' | 'completed'>): Promise<DashboardGoal | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error adding goal:', error);
        return null;
    }

    return data;
}

// Add income stream
export async function addIncomeStream(stream: Omit<DashboardIncomeStream, 'id' | 'active'>): Promise<DashboardIncomeStream | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('income_streams')
        .insert({ ...stream, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error adding income stream:', error);
        return null;
    }

    return data;
}

// Update profile after onboarding
export async function updateOnboardingComplete(
    path: 'ai_assisted' | 'manual' | 'skipped',
    monthlyIncome?: number
): Promise<boolean> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completed: true,
            onboarding_path: path,
            monthly_income: monthlyIncome || 0,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return false;
    }

    return true;
}
