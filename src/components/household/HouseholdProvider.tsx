'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Types
export interface Household {
    id: string;
    name: string;
    invite_code: string;
    created_by: string;
    settings: {
        allowMemberInvites: boolean;
        defaultMemberRole: string;
    };
    created_at: string;
}

export interface HouseholdMember {
    id: string;
    household_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    nickname: string | null;
    can_edit_tasks: boolean;
    can_claim_tasks: boolean;
    can_add_accounts: boolean;
    can_view_all_transactions: boolean;
    can_invite_members: boolean;
    joined_at: string;
    // Joined data
    profile?: {
        email: string;
        full_name: string;
        avatar_url: string;
    };
}

export interface FinanceContext {
    id: string;
    household_id: string;
    name: string;
    type: 'personal' | 'business' | 'investment' | 'other';
    is_default: boolean;
    color: string;
    icon: string;
    tax_separate: boolean;
}

export interface Task {
    id: string;
    household_id: string;
    context_id: string | null;
    created_by: string;
    assigned_to: string | null;
    claimed_by: string | null;
    title: string;
    description: string | null;
    type: 'bill' | 'action' | 'reminder' | 'goal' | 'tax' | 'investment' | 'property';
    priority: 'signal' | 'noise';
    amount: number | null;
    currency: string;
    due_date: string | null;
    reminder_date: string | null;
    recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
    claimed_at: string | null;
    completed_at: string | null;
    completion_notes: string | null;
    tags: string[];
    created_at: string;
    // Joined data
    claimer?: HouseholdMember;
    assignee?: HouseholdMember;
    context?: FinanceContext;
}

interface HouseholdContextType {
    // Data
    households: Household[];
    currentHousehold: Household | null;
    members: HouseholdMember[];
    contexts: FinanceContext[];
    currentContext: FinanceContext | null;
    tasks: Task[];
    currentUser: User | null;
    currentMember: HouseholdMember | null;

    // Loading states
    loading: boolean;

    // Actions
    setCurrentHousehold: (household: Household | null) => void;
    setCurrentContext: (context: FinanceContext | null) => void;
    refreshHouseholds: () => Promise<void>;
    refreshMembers: () => Promise<void>;
    refreshTasks: () => Promise<void>;
    refreshContexts: () => Promise<void>;

    // Task actions
    claimTask: (taskId: string) => Promise<void>;
    completeTask: (taskId: string, notes?: string) => Promise<void>;
    createTask: (task: Partial<Task>) => Promise<Task>;

    // Household actions
    createHousehold: (name: string) => Promise<Household>;
    inviteMember: (email: string, role: HouseholdMember['role']) => Promise<void>;

    // Context actions
    createContext: (name: string, type: FinanceContext['type']) => Promise<FinanceContext>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function useHousehold() {
    const context = useContext(HouseholdContext);
    if (!context) {
        throw new Error('useHousehold must be used within a HouseholdProvider');
    }
    return context;
}

interface HouseholdProviderProps {
    children: ReactNode;
}

export function HouseholdProvider({ children }: HouseholdProviderProps) {
    const supabase = createClient();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
    const [members, setMembers] = useState<HouseholdMember[]>([]);
    const [contexts, setContexts] = useState<FinanceContext[]>([]);
    const [currentContext, setCurrentContext] = useState<FinanceContext | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Current user's membership in active household
    const currentMember = members.find(m => m.user_id === currentUser?.id) || null;

    // Initialize
    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                await refreshHouseholds();
            }
            setLoading(false);
        }
        init();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setCurrentUser(session?.user || null);
            if (session?.user) {
                refreshHouseholds();
            } else {
                setHouseholds([]);
                setCurrentHousehold(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load members, contexts, and tasks when household changes
    useEffect(() => {
        if (currentHousehold) {
            refreshMembers();
            refreshContexts();
            refreshTasks();

            // Subscribe to real-time task updates
            const channel = supabase
                .channel(`household-${currentHousehold.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'tasks',
                        filter: `household_id=eq.${currentHousehold.id}`,
                    },
                    () => refreshTasks()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentHousehold?.id]);

    // Set default context when contexts load
    useEffect(() => {
        if (contexts.length > 0 && !currentContext) {
            const defaultCtx = contexts.find(c => c.is_default) || contexts[0];
            setCurrentContext(defaultCtx);
        }
    }, [contexts]);

    async function refreshHouseholds() {
        const { data, error } = await supabase
            .from('households')
            .select('*')
            .order('created_at', { ascending: true });

        if (!error && data) {
            setHouseholds(data);
            if (data.length > 0 && !currentHousehold) {
                setCurrentHousehold(data[0]);
            }
        }
    }

    async function refreshMembers() {
        if (!currentHousehold) return;

        const { data, error } = await supabase
            .from('household_members')
            .select(`
        *,
        profile:profiles(email, full_name, avatar_url)
      `)
            .eq('household_id', currentHousehold.id)
            .order('joined_at', { ascending: true });

        if (!error && data) {
            setMembers(data);
        }
    }

    async function refreshContexts() {
        if (!currentHousehold) return;

        const { data, error } = await supabase
            .from('finance_contexts')
            .select('*')
            .eq('household_id', currentHousehold.id)
            .order('is_default', { ascending: false });

        if (!error && data) {
            setContexts(data);
        }
    }

    async function refreshTasks() {
        if (!currentHousehold) return;

        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        claimer:household_members!claimed_by(*),
        assignee:household_members!assigned_to(*),
        context:finance_contexts(*)
      `)
            .eq('household_id', currentHousehold.id)
            .order('due_date', { ascending: true, nullsFirst: false });

        if (!error && data) {
            setTasks(data);
        }
    }

    async function claimTask(taskId: string) {
        const { error } = await supabase.rpc('claim_task', { task_id: taskId });
        if (error) throw error;
        await refreshTasks();
    }

    async function completeTask(taskId: string, notes?: string) {
        const { error } = await supabase.rpc('complete_task', {
            task_id: taskId,
            notes: notes || null
        });
        if (error) throw error;
        await refreshTasks();
    }

    async function createTask(task: Partial<Task>): Promise<Task> {
        if (!currentHousehold || !currentUser) throw new Error('No household selected');

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                household_id: currentHousehold.id,
                context_id: currentContext?.id || null,
                created_by: currentUser.id,
                title: task.title,
                description: task.description,
                type: task.type || 'action',
                priority: task.priority || 'noise',
                amount: task.amount,
                due_date: task.due_date,
                assigned_to: task.assigned_to,
                tags: task.tags || [],
            })
            .select()
            .single();

        if (error) throw error;
        await refreshTasks();
        return data;
    }

    async function createHousehold(name: string): Promise<Household> {
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('households')
            .insert({ name, created_by: currentUser.id })
            .select()
            .single();

        if (error) throw error;

        // Add self as owner
        await supabase.from('household_members').insert({
            household_id: data.id,
            user_id: currentUser.id,
            role: 'owner',
            can_add_accounts: true,
            can_invite_members: true,
        });

        await refreshHouseholds();
        return data;
    }

    async function inviteMember(email: string, role: HouseholdMember['role']) {
        if (!currentHousehold || !currentUser) throw new Error('No household selected');

        const { error } = await supabase.from('household_invitations').insert({
            household_id: currentHousehold.id,
            invited_by: currentUser.id,
            email,
            role,
        });

        if (error) throw error;
        // TODO: Send email invitation
    }

    async function createContext(name: string, type: FinanceContext['type']): Promise<FinanceContext> {
        if (!currentHousehold) throw new Error('No household selected');

        const { data, error } = await supabase
            .from('finance_contexts')
            .insert({
                household_id: currentHousehold.id,
                name,
                type,
            })
            .select()
            .single();

        if (error) throw error;
        await refreshContexts();
        return data;
    }

    const value: HouseholdContextType = {
        households,
        currentHousehold,
        members,
        contexts,
        currentContext,
        tasks,
        currentUser,
        currentMember,
        loading,
        setCurrentHousehold,
        setCurrentContext,
        refreshHouseholds,
        refreshMembers,
        refreshTasks,
        refreshContexts,
        claimTask,
        completeTask,
        createTask,
        createHousehold,
        inviteMember,
        createContext,
    };

    return (
        <HouseholdContext.Provider value={value}>
            {children}
        </HouseholdContext.Provider>
    );
}
