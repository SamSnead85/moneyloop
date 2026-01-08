'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types
export interface Account {
    id: string;
    name: string;
    institution: string | null;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'property' | 'alternative' | 'other';
    subtype: string | null;
    balance: number;
    currency: string;
    last_synced: string | null;
}

export interface Transaction {
    id: string;
    name: string;
    amount: number;
    category: string | null;
    subcategory: string | null;
    date: string;
    pending: boolean;
    account_id: string | null;
}

export interface Goal {
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

export interface IncomeStream {
    id: string;
    name: string;
    source: string | null;
    amount: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually' | 'variable' | null;
    next_payment_date: string | null;
    active: boolean;
}

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier: 'free' | 'premium' | 'family';
    onboarding_completed: boolean | null;
    monthly_income: number | null;
}

export interface DashboardStats {
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    accountCount: number;
    goalsInProgress: number;
}

// Hook for dashboard data
export function useDashboardData() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [
                { data: profileData, error: profileError },
                { data: accountsData, error: accountsError },
                { data: transactionsData, error: transactionsError },
                { data: goalsData, error: goalsError },
                { data: incomeData, error: incomeError },
            ] = await Promise.all([
                supabase.from('profiles').select('*').single(),
                supabase.from('accounts').select('*').order('created_at', { ascending: false }),
                supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
                supabase.from('goals').select('*').order('created_at', { ascending: false }),
                supabase.from('income_streams').select('*').eq('active', true).order('amount', { ascending: false }),
            ]);

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile error:', profileError);
            }
            if (accountsError) console.error('Accounts error:', accountsError);
            if (transactionsError) console.error('Transactions error:', transactionsError);
            if (goalsError) console.error('Goals error:', goalsError);
            if (incomeError) console.error('Income error:', incomeError);

            setProfile(profileData);
            setAccounts(accountsData || []);
            setTransactions(transactionsData || []);
            setGoals(goalsData || []);
            setIncomeStreams(incomeData || []);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate stats
    const stats: DashboardStats = {
        netWorth: accounts.reduce((sum, acc) => {
            if (acc.type === 'credit') return sum - Math.abs(acc.balance);
            return sum + acc.balance;
        }, 0),
        monthlyIncome: (() => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return transactions
                .filter(t => new Date(t.date) >= startOfMonth && t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);
        })(),
        monthlyExpenses: (() => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return transactions
                .filter(t => new Date(t.date) >= startOfMonth && t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        })(),
        savingsRate: 0,
        accountCount: accounts.length,
        goalsInProgress: goals.filter(g => !g.completed).length,
    };

    // Calculate savings rate
    if (stats.monthlyIncome > 0) {
        stats.savingsRate = ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100;
    }

    // Get spending by category
    const spendingByCategory = (() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const spending: Record<string, number> = {};

        transactions
            .filter(t => new Date(t.date) >= startOfMonth && t.amount < 0)
            .forEach(t => {
                const cat = t.category || 'Uncategorized';
                spending[cat] = (spending[cat] || 0) + Math.abs(t.amount);
            });

        return Object.entries(spending)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    })();

    // Recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10);

    return {
        profile,
        accounts,
        transactions,
        goals,
        incomeStreams,
        stats,
        spendingByCategory,
        recentTransactions,
        loading,
        error,
        refresh: fetchData,
    };
}

// Hook for real-time updates
export function useRealtimeUpdates(onUpdate: () => void) {
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('dashboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, onUpdate)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, onUpdate)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, onUpdate)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'income_streams' }, onUpdate)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, onUpdate]);
}
