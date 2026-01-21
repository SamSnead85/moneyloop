'use client';

/**
 * React Hooks for MoneyLoop Data
 * 
 * Custom hooks for fetching and managing financial data
 * with loading states, error handling, and caching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Generic fetch hook
interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFetch<T>(
    url: string,
    options?: RequestInit
): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// Goals hook
interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    status: string;
}

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/goals?action=list');
            const data = await response.json();
            setGoals(data.goals || []);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch goals');
        } finally {
            setLoading(false);
        }
    }, []);

    const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...goal }),
        });
        const data = await response.json();
        if (data.goal) {
            setGoals(prev => [...prev, data.goal]);
        }
        return data.goal;
    }, []);

    const updateProgress = useCallback(async (goalId: string, amount: number) => {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-progress', goalId, amount }),
        });
        const data = await response.json();
        if (data.goal) {
            setGoals(prev => prev.map(g => g.id === goalId ? data.goal : g));
        }
        return data;
    }, []);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    return { goals, loading, error, refetch: fetchGoals, createGoal, updateProgress };
}

// Notifications hook
interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications?action=list');
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark-read', notificationId }),
        });
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark-all-read' }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return { notifications, unreadCount, loading, refetch: fetchNotifications, markAsRead, markAllAsRead };
}

// AI Chat hook
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const sendMessage = useCallback(async (message: string) => {
        setLoading(true);

        // Add user message immediately
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, message }),
            });

            const data = await response.json();

            if (data.conversationId) {
                setConversationId(data.conversationId);
            }

            if (data.response) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: data.response.message,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            }

            return data.response;
        } catch (e) {
            console.error('Chat error:', e);
            return null;
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setConversationId(null);
    }, []);

    return { messages, loading, sendMessage, clearChat, conversationId };
}

// Credit Score hook
interface CreditScore {
    score: number;
    rating: string;
    factors: { name: string; impact: string; status: string }[];
}

export function useCreditScore() {
    const [score, setScore] = useState<CreditScore | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchScore = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/credit?action=score');
            const data = await response.json();
            setScore(data.score);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch credit score');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    return { score, loading, error, refetch: fetchScore };
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T) => {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key]);

    return [storedValue, setValue];
}

export default {
    useFetch,
    useGoals,
    useNotifications,
    useChat,
    useCreditScore,
    useDebounce,
    usePrevious,
    useLocalStorage,
};
