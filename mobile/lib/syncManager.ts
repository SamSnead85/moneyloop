import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { supabase } from './supabase';
import {
    initDatabase,
    getPendingSyncItems,
    markSynced,
    markSyncError,
    addToSyncQueue,
    upsertCachedTask,
    upsertCachedAccount,
    setLastSyncTime,
    getLastSyncTime,
    SyncQueueItem,
} from './database';

// Sync state
let isSyncing = false;
let syncInterval: NodeJS.Timeout | null = null;

// Initialize sync manager
export async function initSyncManager(): Promise<void> {
    await initDatabase();

    // Listen for network changes
    NetInfo.addEventListener(handleConnectivityChange);

    // Start periodic sync
    startPeriodicSync();

    // Initial sync if online
    const state = await NetInfo.fetch();
    if (state.isConnected) {
        await syncAll();
    }
}

function handleConnectivityChange(state: NetInfoState): void {
    if (state.isConnected && !isSyncing) {
        // Back online - sync pending changes
        syncPendingChanges();
    }
}

function startPeriodicSync(): void {
    // Sync every 30 seconds when online
    syncInterval = setInterval(async () => {
        const state = await NetInfo.fetch();
        if (state.isConnected && !isSyncing) {
            await syncAll();
        }
    }, 30000);
}

export function stopPeriodicSync(): void {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Main sync function
export async function syncAll(): Promise<void> {
    if (isSyncing) return;
    isSyncing = true;

    try {
        // 1. Push local changes first
        await syncPendingChanges();

        // 2. Pull remote changes
        await pullRemoteData();
    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        isSyncing = false;
    }
}

// Push local changes to server
async function syncPendingChanges(): Promise<void> {
    const pendingItems = await getPendingSyncItems();

    for (const item of pendingItems) {
        try {
            await processSyncItem(item);
            await markSynced(item.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await markSyncError(item.id, message);
        }
    }
}

async function processSyncItem(item: SyncQueueItem): Promise<void> {
    const data = item.data ? JSON.parse(item.data) : null;

    switch (item.action) {
        case 'insert':
            if (item.table_name === 'tasks') {
                await supabase.from('tasks').insert(data);
            } else if (item.table_name === 'accounts') {
                await supabase.from('accounts').insert(data);
            }
            break;

        case 'update':
            if (item.table_name === 'tasks') {
                await supabase.from('tasks').update(data).eq('id', item.record_id);
            } else if (item.table_name === 'accounts') {
                await supabase.from('accounts').update(data).eq('id', item.record_id);
            }
            break;

        case 'delete':
            if (item.table_name === 'tasks') {
                await supabase.from('tasks').delete().eq('id', item.record_id);
            } else if (item.table_name === 'accounts') {
                await supabase.from('accounts').delete().eq('id', item.record_id);
            }
            break;
    }
}

// Pull remote data to local cache
async function pullRemoteData(): Promise<void> {
    await pullTasks();
    await pullAccounts();
}

async function pullTasks(): Promise<void> {
    const lastSync = await getLastSyncTime('tasks');

    let query = supabase
        .from('tasks')
        .select('*')
        .order('updated_at', { ascending: false });

    // Incremental sync if we have a last sync time
    if (lastSync) {
        query = query.gt('updated_at', lastSync);
    }

    const { data, error } = await query.limit(500);

    if (error) throw error;

    if (data) {
        for (const task of data) {
            await upsertCachedTask(task);
        }
        await setLastSyncTime('tasks');
    }
}

async function pullAccounts(): Promise<void> {
    const lastSync = await getLastSyncTime('accounts');

    let query = supabase
        .from('accounts')
        .select('*')
        .order('updated_at', { ascending: false });

    if (lastSync) {
        query = query.gt('updated_at', lastSync);
    }

    const { data, error } = await query.limit(200);

    if (error) throw error;

    if (data) {
        for (const account of data) {
            await upsertCachedAccount(account);
        }
        await setLastSyncTime('accounts');
    }
}

// Offline-first operations
export async function createTaskOffline(task: Record<string, unknown>): Promise<string> {
    // Generate a temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskWithId = { ...task, id: tempId };

    // Save to local cache
    await upsertCachedTask(taskWithId as Parameters<typeof upsertCachedTask>[0]);

    // Add to sync queue
    await addToSyncQueue('tasks', tempId, 'insert', taskWithId);

    // Try to sync immediately if online
    const state = await NetInfo.fetch();
    if (state.isConnected) {
        syncPendingChanges();
    }

    return tempId;
}

export async function updateTaskOffline(
    taskId: string,
    updates: Record<string, unknown>
): Promise<void> {
    // Update local cache
    await upsertCachedTask({ id: taskId, ...updates } as Parameters<typeof upsertCachedTask>[0]);

    // Add to sync queue
    await addToSyncQueue('tasks', taskId, 'update', updates);

    // Try to sync immediately if online
    const state = await NetInfo.fetch();
    if (state.isConnected) {
        syncPendingChanges();
    }
}

export async function claimTaskOffline(taskId: string, userId: string): Promise<void> {
    await updateTaskOffline(taskId, {
        claimed_by: userId,
        claimed_at: new Date().toISOString(),
        status: 'claimed',
    });
}

export async function completeTaskOffline(taskId: string): Promise<void> {
    await updateTaskOffline(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
    });
}

// Conflict resolution strategy
export type ConflictResolution = 'local' | 'remote' | 'merge';

export interface Conflict {
    table: string;
    recordId: string;
    localData: Record<string, unknown>;
    remoteData: Record<string, unknown>;
}

export function resolveConflict(
    conflict: Conflict,
    strategy: ConflictResolution = 'remote'
): Record<string, unknown> {
    switch (strategy) {
        case 'local':
            return conflict.localData;
        case 'remote':
            return conflict.remoteData;
        case 'merge':
            // Last-write-wins based on updated_at
            const localTime = new Date(conflict.localData.updated_at as string).getTime();
            const remoteTime = new Date(conflict.remoteData.updated_at as string).getTime();
            return localTime > remoteTime ? conflict.localData : conflict.remoteData;
    }
}
