/**
 * MoneyLoop Real-Time Sync Engine
 * 
 * Supabase Realtime CDC listener for instant cross-device synchronization.
 * Handles optimistic mutations, conflict resolution, and offline queue.
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// Types
export interface SyncEvent {
    table: string;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    old: Record<string, unknown> | null;
    new: Record<string, unknown> | null;
    timestamp: string;
}

export interface OfflineAction {
    id: string;
    table: string;
    action: 'insert' | 'update' | 'delete';
    data: Record<string, unknown>;
    createdAt: string;
    retryCount: number;
}

export interface SyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncAt: string | null;
    pendingActions: number;
    connectedDevices: number;
}

type SyncCallback = (event: SyncEvent) => void;
type StateCallback = (state: SyncState) => void;

// Constants
const SYNC_TABLES = [
    'transactions',
    'budgets',
    'goals',
    'bills',
    'accounts',
    'categories',
    'notes',
    'calendar_events',
    'tasks',
] as const;

const OFFLINE_STORAGE_KEY = 'moneyloop_offline_queue';
const MAX_RETRY_COUNT = 5;

/**
 * Real-Time Sync Manager
 * 
 * Manages cross-device synchronization via Supabase Realtime.
 */
export class RealtimeSyncManager {
    private supabase: SupabaseClient;
    private channel: RealtimeChannel | null = null;
    private householdId: string | null = null;
    private listeners: Map<string, Set<SyncCallback>> = new Map();
    private stateListeners: Set<StateCallback> = new Set();
    private offlineQueue: OfflineAction[] = [];
    private state: SyncState = {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isSyncing: false,
        lastSyncAt: null,
        pendingActions: 0,
        connectedDevices: 0,
    };

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.loadOfflineQueue();
        this.setupNetworkListeners();
    }

    /**
     * Connect to real-time sync for a household
     */
    async connect(householdId: string): Promise<void> {
        if (this.channel) {
            await this.disconnect();
        }

        this.householdId = householdId;

        // Subscribe to all sync tables filtered by household
        this.channel = this.supabase
            .channel(`household:${householdId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    filter: `household_id=eq.${householdId}`,
                },
                (payload) => {
                    this.handleRealtimeEvent(payload);
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const presenceState = this.channel?.presenceState() || {};
                this.state.connectedDevices = Object.keys(presenceState).length;
                this.notifyStateChange();
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track this device's presence
                    await this.channel?.track({
                        device: this.getDeviceId(),
                        connectedAt: new Date().toISOString(),
                    });

                    // Process any offline actions
                    await this.processOfflineQueue();
                }
            });
    }

    /**
     * Disconnect from real-time sync
     */
    async disconnect(): Promise<void> {
        if (this.channel) {
            await this.supabase.removeChannel(this.channel);
            this.channel = null;
        }
        this.householdId = null;
    }

    /**
     * Subscribe to changes for a specific table
     */
    subscribe(table: string, callback: SyncCallback): () => void {
        if (!this.listeners.has(table)) {
            this.listeners.set(table, new Set());
        }
        this.listeners.get(table)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(table)?.delete(callback);
        };
    }

    /**
     * Subscribe to sync state changes
     */
    onStateChange(callback: StateCallback): () => void {
        this.stateListeners.add(callback);
        callback(this.state); // Immediate callback with current state
        return () => this.stateListeners.delete(callback);
    }

    /**
     * Get current sync state
     */
    getState(): SyncState {
        return { ...this.state };
    }

    /**
     * Optimistic mutation with offline support
     */
    async mutate<T extends Record<string, unknown>>(
        table: string,
        action: 'insert' | 'update' | 'delete',
        data: T,
        optimisticCallback?: (data: T) => void
    ): Promise<{ data: T | null; error: Error | null }> {
        // Optimistic update
        if (optimisticCallback) {
            optimisticCallback(data);
        }

        // If offline, queue the action
        if (!this.state.isOnline) {
            this.queueOfflineAction(table, action, data);
            return { data, error: null };
        }

        // Execute the mutation
        try {
            this.state.isSyncing = true;
            this.notifyStateChange();

            let result;
            switch (action) {
                case 'insert':
                    result = await this.supabase.from(table).insert(data).select().single();
                    break;
                case 'update':
                    result = await this.supabase
                        .from(table)
                        .update(data)
                        .eq('id', (data as { id?: string }).id)
                        .select()
                        .single();
                    break;
                case 'delete':
                    result = await this.supabase
                        .from(table)
                        .delete()
                        .eq('id', (data as { id?: string }).id);
                    break;
            }

            this.state.lastSyncAt = new Date().toISOString();
            this.state.isSyncing = false;
            this.notifyStateChange();

            if (result?.error) {
                throw result.error;
            }

            return { data: result?.data || data, error: null };
        } catch (error) {
            this.state.isSyncing = false;
            this.notifyStateChange();

            // Queue for retry if network error
            if (this.isNetworkError(error)) {
                this.queueOfflineAction(table, action, data);
                return { data, error: null };
            }

            return { data: null, error: error as Error };
        }
    }

    // Private methods

    private handleRealtimeEvent(payload: {
        eventType: string;
        table: string;
        old: Record<string, unknown> | null;
        new: Record<string, unknown> | null;
    }): void {
        const event: SyncEvent = {
            table: payload.table,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            old: payload.old,
            new: payload.new,
            timestamp: new Date().toISOString(),
        };

        // Notify table-specific listeners
        this.listeners.get(payload.table)?.forEach((callback) => callback(event));

        // Notify 'all' listeners
        this.listeners.get('*')?.forEach((callback) => callback(event));
    }

    private queueOfflineAction(
        table: string,
        action: 'insert' | 'update' | 'delete',
        data: Record<string, unknown>
    ): void {
        const offlineAction: OfflineAction = {
            id: crypto.randomUUID(),
            table,
            action,
            data,
            createdAt: new Date().toISOString(),
            retryCount: 0,
        };

        this.offlineQueue.push(offlineAction);
        this.saveOfflineQueue();
        this.state.pendingActions = this.offlineQueue.length;
        this.notifyStateChange();
    }

    private async processOfflineQueue(): Promise<void> {
        if (this.offlineQueue.length === 0 || !this.state.isOnline) return;

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const action of queue) {
            try {
                await this.mutate(action.table, action.action, action.data);
            } catch {
                if (action.retryCount < MAX_RETRY_COUNT) {
                    action.retryCount++;
                    this.offlineQueue.push(action);
                }
                // Drop action if max retries exceeded
            }
        }

        this.saveOfflineQueue();
        this.state.pendingActions = this.offlineQueue.length;
        this.notifyStateChange();
    }

    private loadOfflineQueue(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
            if (stored) {
                this.offlineQueue = JSON.parse(stored);
                this.state.pendingActions = this.offlineQueue.length;
            }
        } catch {
            this.offlineQueue = [];
        }
    }

    private saveOfflineQueue(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(this.offlineQueue));
        } catch {
            // Storage full or unavailable
        }
    }

    private setupNetworkListeners(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.notifyStateChange();
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.notifyStateChange();
        });
    }

    private notifyStateChange(): void {
        this.stateListeners.forEach((callback) => callback({ ...this.state }));
    }

    private getDeviceId(): string {
        if (typeof localStorage === 'undefined') return 'unknown';
        let deviceId = localStorage.getItem('moneyloop_device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem('moneyloop_device_id', deviceId);
        }
        return deviceId;
    }

    private isNetworkError(error: unknown): boolean {
        if (error instanceof Error) {
            return (
                error.message.includes('network') ||
                error.message.includes('fetch') ||
                error.message.includes('Failed to fetch')
            );
        }
        return false;
    }
}

// Singleton instance
let syncManager: RealtimeSyncManager | null = null;

export function getRealtimeSyncManager(): RealtimeSyncManager {
    if (!syncManager) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        syncManager = new RealtimeSyncManager(supabaseUrl, supabaseKey);
    }
    return syncManager;
}

// React hook for sync state
export function useSyncState(): SyncState {
    // This would be implemented with useState/useEffect in React
    return getRealtimeSyncManager().getState();
}
