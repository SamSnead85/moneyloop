'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Transaction,
    TransactionFilters,
    getTransactions,
    calculateSummary,
    groupByCategory,
    getSpendingByDay,
} from '@/lib/transactions';

export function useTransactions(initialFilters?: TransactionFilters) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {});

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getTransactions(filters);
            setTransactions(data);
        } catch (err) {
            setError('Failed to load transactions');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const summary = calculateSummary(transactions);
    const categoryBreakdown = groupByCategory(transactions);
    const dailySpending = getSpendingByDay(transactions);

    const updateFilters = (newFilters: Partial<TransactionFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const refetch = () => {
        fetchTransactions();
    };

    return {
        transactions,
        isLoading,
        error,
        filters,
        updateFilters,
        refetch,
        summary,
        categoryBreakdown,
        dailySpending,
    };
}

export function useAccounts() {
    const [accounts, setAccounts] = useState<Array<{
        id: string;
        name: string;
        institution: string;
        type: string;
        balance: number;
        last_synced: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAccounts() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching accounts:', error);
            } else {
                setAccounts(data || []);
            }
            setIsLoading(false);
        }

        fetchAccounts();
    }, []);

    return { accounts, isLoading };
}

export function useOnboardingStatus() {
    const [status, setStatus] = useState<{
        completed: boolean;
        path: 'ai_assisted' | 'manual' | 'skipped' | null;
        currentStep: string | null;
    }>({ completed: false, path: null, currentStep: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkStatus() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data } = await supabase
                .from('onboarding_progress')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setStatus({
                    completed: !!data.completed_at,
                    path: data.onboarding_path,
                    currentStep: data.current_step,
                });
            }
            setIsLoading(false);
        }

        checkStatus();
    }, []);

    return { ...status, isLoading };
}

export function useNetWorth() {
    const { accounts, isLoading } = useAccounts();

    if (isLoading) {
        return { netWorth: 0, isLoading: true, breakdown: [] };
    }

    const breakdown = accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance || 0,
    }));

    const netWorth = breakdown.reduce((sum, acc) => sum + acc.balance, 0);

    return { netWorth, isLoading: false, breakdown };
}
