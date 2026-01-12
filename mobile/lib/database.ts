import * as SQLite from 'expo-sqlite';

// Initialize local SQLite database for offline support
let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('moneyloop.db');

    // Create tables
    await db.execAsync(`
    -- Sync queue for offline changes
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
      data TEXT, -- JSON data
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced_at TEXT,
      error TEXT,
      retry_count INTEGER DEFAULT 0
    );

    -- Local cache of tasks
    CREATE TABLE IF NOT EXISTS tasks_cache (
      id TEXT PRIMARY KEY,
      household_id TEXT NOT NULL,
      context_id TEXT,
      created_by TEXT NOT NULL,
      assigned_to TEXT,
      claimed_by TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'noise',
      amount REAL,
      currency TEXT DEFAULT 'USD',
      due_date TEXT,
      status TEXT DEFAULT 'open',
      claimed_at TEXT,
      completed_at TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced_at TEXT
    );

    -- Local cache of accounts
    CREATE TABLE IF NOT EXISTS accounts_cache (
      id TEXT PRIMARY KEY,
      household_id TEXT,
      context_id TEXT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      institution TEXT,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      last_synced TEXT,
      synced_at TEXT
    );

    -- Local cache of transactions
    CREATE TABLE IF NOT EXISTS transactions_cache (
      id TEXT PRIMARY KEY,
      household_id TEXT,
      context_id TEXT,
      account_id TEXT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date TEXT,
      pending INTEGER DEFAULT 0,
      synced_at TEXT
    );

    -- Sync metadata
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

    return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        return initDatabase();
    }
    return db;
}

// Sync Queue Operations
export interface SyncQueueItem {
    id: number;
    table_name: string;
    record_id: string;
    action: 'insert' | 'update' | 'delete';
    data: string | null;
    created_at: string;
    synced_at: string | null;
    error: string | null;
    retry_count: number;
}

export async function addToSyncQueue(
    tableName: string,
    recordId: string,
    action: SyncQueueItem['action'],
    data?: Record<string, unknown>
): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
        `INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)`,
        [tableName, recordId, action, data ? JSON.stringify(data) : null]
    );
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const database = await getDatabase();
    return database.getAllAsync<SyncQueueItem>(
        `SELECT * FROM sync_queue WHERE synced_at IS NULL ORDER BY created_at ASC LIMIT 50`
    );
}

export async function markSynced(id: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
        `UPDATE sync_queue SET synced_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
    );
}

export async function markSyncError(id: number, error: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
        `UPDATE sync_queue SET error = ?, retry_count = retry_count + 1 WHERE id = ?`,
        [error, id]
    );
}

// Task Cache Operations
export interface CachedTask {
    id: string;
    household_id: string;
    context_id: string | null;
    created_by: string;
    assigned_to: string | null;
    claimed_by: string | null;
    title: string;
    description: string | null;
    type: string;
    priority: string;
    amount: number | null;
    currency: string;
    due_date: string | null;
    status: string;
    claimed_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    synced_at: string;
}

export async function getCachedTasks(householdId: string): Promise<CachedTask[]> {
    const database = await getDatabase();
    return database.getAllAsync<CachedTask>(
        `SELECT * FROM tasks_cache WHERE household_id = ? ORDER BY due_date ASC`,
        [householdId]
    );
}

export async function upsertCachedTask(task: Partial<CachedTask>): Promise<void> {
    const database = await getDatabase();
    const columns = Object.keys(task).join(', ');
    const placeholders = Object.keys(task).map(() => '?').join(', ');
    const values = Object.values(task);

    await database.runAsync(
        `INSERT OR REPLACE INTO tasks_cache (${columns}, synced_at) VALUES (${placeholders}, CURRENT_TIMESTAMP)`,
        values
    );
}

export async function deleteCachedTask(taskId: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM tasks_cache WHERE id = ?`, [taskId]);
}

// Account Cache Operations
export async function getCachedAccounts(householdId?: string): Promise<Record<string, unknown>[]> {
    const database = await getDatabase();
    if (householdId) {
        return database.getAllAsync(
            `SELECT * FROM accounts_cache WHERE household_id = ? ORDER BY balance DESC`,
            [householdId]
        );
    }
    return database.getAllAsync(`SELECT * FROM accounts_cache ORDER BY balance DESC`);
}

export async function upsertCachedAccount(account: Record<string, unknown>): Promise<void> {
    const database = await getDatabase();
    const columns = Object.keys(account).join(', ');
    const placeholders = Object.keys(account).map(() => '?').join(', ');
    const values = Object.values(account);

    await database.runAsync(
        `INSERT OR REPLACE INTO accounts_cache (${columns}, synced_at) VALUES (${placeholders}, CURRENT_TIMESTAMP)`,
        values
    );
}

// Sync Metadata
export async function getLastSyncTime(table: string): Promise<string | null> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ value: string }>(
        `SELECT value FROM sync_metadata WHERE key = ?`,
        [`last_sync_${table}`]
    );
    return result?.value || null;
}

export async function setLastSyncTime(table: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
        `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [`last_sync_${table}`]
    );
}

// Clear all cached data
export async function clearCache(): Promise<void> {
    const database = await getDatabase();
    await database.execAsync(`
    DELETE FROM tasks_cache;
    DELETE FROM accounts_cache;
    DELETE FROM transactions_cache;
    DELETE FROM sync_metadata;
  `);
}
