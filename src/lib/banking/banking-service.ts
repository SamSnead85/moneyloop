/**
 * Enhanced Banking Services
 * 
 * Multi-institution support, account reconciliation,
 * balance monitoring, and transaction enrichment.
 * 
 * Super-Sprint 15: Phases 1401-1450
 */

export interface BankAccount {
    id: string;
    userId: string;
    institutionId: string;
    institutionName: string;
    institutionLogo?: string;
    accountType: 'checking' | 'savings' | 'credit' | 'loan' | 'investment' | 'other';
    name: string;
    mask: string; // Last 4 digits
    officialName?: string;
    currentBalance: number;
    availableBalance?: number;
    creditLimit?: number;
    apr?: number;
    currency: string;
    isHidden: boolean;
    isConnected: boolean;
    lastSynced: Date;
    plaidItemId?: string;
    plaidAccountId?: string;
}

export interface BalanceAlert {
    id: string;
    accountId: string;
    type: 'low_balance' | 'high_balance' | 'large_change' | 'approaching_limit';
    threshold: number;
    isEnabled: boolean;
    lastTriggered?: Date;
}

export interface ReconciliationRecord {
    id: string;
    accountId: string;
    date: Date;
    expectedBalance: number;
    actualBalance: number;
    difference: number;
    status: 'matched' | 'discrepancy' | 'pending';
    notes?: string;
    resolvedAt?: Date;
}

export interface EnrichedTransaction {
    id: string;
    originalMerchantName: string;
    cleanMerchantName: string;
    merchantLogo?: string;
    merchantCategory: string;
    isRecurring: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
    tags: string[];
}

export interface AccountAggregation {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    byType: Record<string, { count: number; balance: number }>;
    byInstitution: Record<string, { count: number; balance: number }>;
    lastUpdated: Date;
}

// In-memory stores
const accounts: Map<string, BankAccount> = new Map();
const balanceAlerts: Map<string, BalanceAlert> = new Map();
const reconciliations: Map<string, ReconciliationRecord> = new Map();

// Merchant enrichment database (simplified)
const MERCHANT_DATABASE: Record<string, { cleanName: string; logo?: string; category: string }> = {
    'amzn': { cleanName: 'Amazon', logo: '/logos/amazon.svg', category: 'shopping' },
    'amazon': { cleanName: 'Amazon', logo: '/logos/amazon.svg', category: 'shopping' },
    'target': { cleanName: 'Target', logo: '/logos/target.svg', category: 'shopping' },
    'walmart': { cleanName: 'Walmart', logo: '/logos/walmart.svg', category: 'shopping' },
    'costco': { cleanName: 'Costco', logo: '/logos/costco.svg', category: 'shopping' },
    'uber': { cleanName: 'Uber', logo: '/logos/uber.svg', category: 'transportation' },
    'lyft': { cleanName: 'Lyft', logo: '/logos/lyft.svg', category: 'transportation' },
    'netflix': { cleanName: 'Netflix', logo: '/logos/netflix.svg', category: 'entertainment' },
    'spotify': { cleanName: 'Spotify', logo: '/logos/spotify.svg', category: 'entertainment' },
    'starbucks': { cleanName: 'Starbucks', logo: '/logos/starbucks.svg', category: 'food_drink' },
    'doordash': { cleanName: 'DoorDash', logo: '/logos/doordash.svg', category: 'food_drink' },
    'grubhub': { cleanName: 'Grubhub', logo: '/logos/grubhub.svg', category: 'food_drink' },
    'shell': { cleanName: 'Shell', logo: '/logos/shell.svg', category: 'gas' },
    'chevron': { cleanName: 'Chevron', logo: '/logos/chevron.svg', category: 'gas' },
    'exxon': { cleanName: 'Exxon', logo: '/logos/exxon.svg', category: 'gas' },
};

/**
 * Add bank account
 */
export function addAccount(params: Omit<BankAccount, 'id'>): BankAccount {
    const id = `acct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const account: BankAccount = { id, ...params };
    accounts.set(id, account);
    return account;
}

/**
 * Get user accounts
 */
export function getUserAccounts(userId: string, includeHidden: boolean = false): BankAccount[] {
    return Array.from(accounts.values())
        .filter(a => a.userId === userId && (includeHidden || !a.isHidden))
        .sort((a, b) => {
            // Sort by type, then by balance
            const typeOrder = ['checking', 'savings', 'credit', 'investment', 'loan', 'other'];
            const aType = typeOrder.indexOf(a.accountType);
            const bType = typeOrder.indexOf(b.accountType);
            if (aType !== bType) return aType - bType;
            return b.currentBalance - a.currentBalance;
        });
}

/**
 * Calculate account aggregation
 */
export function aggregateAccounts(userId: string): AccountAggregation {
    const userAccounts = getUserAccounts(userId, false);

    let totalAssets = 0;
    let totalLiabilities = 0;
    const byType: Record<string, { count: number; balance: number }> = {};
    const byInstitution: Record<string, { count: number; balance: number }> = {};

    for (const account of userAccounts) {
        const balance = account.currentBalance;

        // Assets vs Liabilities
        if (['checking', 'savings', 'investment'].includes(account.accountType)) {
            totalAssets += balance;
        } else if (['credit', 'loan'].includes(account.accountType)) {
            totalLiabilities += Math.abs(balance);
        }

        // By type
        if (!byType[account.accountType]) {
            byType[account.accountType] = { count: 0, balance: 0 };
        }
        byType[account.accountType].count++;
        byType[account.accountType].balance += balance;

        // By institution
        if (!byInstitution[account.institutionName]) {
            byInstitution[account.institutionName] = { count: 0, balance: 0 };
        }
        byInstitution[account.institutionName].count++;
        byInstitution[account.institutionName].balance += balance;
    }

    return {
        totalAssets: Math.round(totalAssets * 100) / 100,
        totalLiabilities: Math.round(totalLiabilities * 100) / 100,
        netWorth: Math.round((totalAssets - totalLiabilities) * 100) / 100,
        byType,
        byInstitution,
        lastUpdated: new Date(),
    };
}

/**
 * Update account balance
 */
export function updateAccountBalance(
    accountId: string,
    newBalance: number,
    availableBalance?: number
): { account: BankAccount; alerts: BalanceAlert[] } {
    const account = accounts.get(accountId);
    if (!account) throw new Error('Account not found');

    const previousBalance = account.currentBalance;
    const change = newBalance - previousBalance;
    const changePercent = previousBalance !== 0 ? Math.abs(change / previousBalance) * 100 : 0;

    account.currentBalance = newBalance;
    if (availableBalance !== undefined) {
        account.availableBalance = availableBalance;
    }
    account.lastSynced = new Date();

    // Check balance alerts
    const triggeredAlerts: BalanceAlert[] = [];
    const accountAlerts = Array.from(balanceAlerts.values())
        .filter(a => a.accountId === accountId && a.isEnabled);

    for (const alert of accountAlerts) {
        let shouldTrigger = false;

        switch (alert.type) {
            case 'low_balance':
                shouldTrigger = newBalance <= alert.threshold;
                break;
            case 'high_balance':
                shouldTrigger = newBalance >= alert.threshold;
                break;
            case 'large_change':
                shouldTrigger = changePercent >= alert.threshold;
                break;
            case 'approaching_limit':
                if (account.creditLimit) {
                    const utilizationPercent = (Math.abs(newBalance) / account.creditLimit) * 100;
                    shouldTrigger = utilizationPercent >= alert.threshold;
                }
                break;
        }

        if (shouldTrigger) {
            alert.lastTriggered = new Date();
            triggeredAlerts.push(alert);
        }
    }

    return { account, alerts: triggeredAlerts };
}

/**
 * Create balance alert
 */
export function createBalanceAlert(params: Omit<BalanceAlert, 'id'>): BalanceAlert {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const alert: BalanceAlert = { id, ...params };
    balanceAlerts.set(id, alert);
    return alert;
}

/**
 * Enrich transaction with merchant data
 */
export function enrichTransaction(merchantName: string): EnrichedTransaction {
    const normalized = merchantName.toLowerCase().trim();

    // Find matching merchant
    let enrichment: { cleanName: string; logo?: string; category: string } | undefined;
    for (const [key, value] of Object.entries(MERCHANT_DATABASE)) {
        if (normalized.includes(key)) {
            enrichment = value;
            break;
        }
    }

    // Extract location if present (e.g., "Starbucks #1234 New York NY")
    const locationMatch = normalized.match(/([a-z\s]+),?\s*([a-z]{2})$/);
    const location = locationMatch ? {
        city: locationMatch[1].trim(),
        state: locationMatch[2].toUpperCase(),
        country: 'US',
    } : undefined;

    return {
        id: `enrich_${Date.now()}`,
        originalMerchantName: merchantName,
        cleanMerchantName: enrichment?.cleanName || cleanMerchantName(merchantName),
        merchantLogo: enrichment?.logo,
        merchantCategory: enrichment?.category || 'unknown',
        isRecurring: false,
        location,
        tags: [],
    };
}

/**
 * Clean up merchant name
 */
function cleanMerchantName(name: string): string {
    return name
        // Remove common suffixes
        .replace(/\s*#\d+/g, '')
        .replace(/\s*\d{5,}/g, '')
        .replace(/\s*(llc|inc|corp|ltd)\.?$/i, '')
        // Remove location codes
        .replace(/\s+[a-z]{2}$/i, '')
        // Clean up
        .replace(/\s+/g, ' ')
        .trim()
        // Title case
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Create reconciliation record
 */
export function createReconciliation(
    accountId: string,
    expectedBalance: number,
    actualBalance: number,
    notes?: string
): ReconciliationRecord {
    const difference = actualBalance - expectedBalance;
    const status: ReconciliationRecord['status'] =
        Math.abs(difference) < 0.01 ? 'matched' : 'discrepancy';

    const record: ReconciliationRecord = {
        id: `recon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        accountId,
        date: new Date(),
        expectedBalance,
        actualBalance,
        difference: Math.round(difference * 100) / 100,
        status,
        notes,
    };

    reconciliations.set(record.id, record);
    return record;
}

/**
 * Get account reconciliation history
 */
export function getReconciliationHistory(accountId: string): ReconciliationRecord[] {
    return Array.from(reconciliations.values())
        .filter(r => r.accountId === accountId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Calculate credit utilization
 */
export function calculateCreditUtilization(userId: string): {
    totalLimit: number;
    totalUsed: number;
    utilizationPercent: number;
    byAccount: { accountId: string; name: string; limit: number; used: number; percent: number }[];
} {
    const creditAccounts = getUserAccounts(userId)
        .filter(a => a.accountType === 'credit' && a.creditLimit);

    const byAccount = creditAccounts.map(a => ({
        accountId: a.id,
        name: a.name,
        limit: a.creditLimit!,
        used: Math.abs(a.currentBalance),
        percent: (Math.abs(a.currentBalance) / a.creditLimit!) * 100,
    }));

    const totalLimit = byAccount.reduce((s, a) => s + a.limit, 0);
    const totalUsed = byAccount.reduce((s, a) => s + a.used, 0);

    return {
        totalLimit: Math.round(totalLimit * 100) / 100,
        totalUsed: Math.round(totalUsed * 100) / 100,
        utilizationPercent: totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 10000) / 100 : 0,
        byAccount,
    };
}

/**
 * Sync account with Plaid (stub)
 */
export async function syncAccountWithPlaid(accountId: string): Promise<{
    success: boolean;
    transactionsAdded: number;
    balanceUpdated: boolean;
}> {
    const account = accounts.get(accountId);
    if (!account || !account.plaidItemId) {
        return { success: false, transactionsAdded: 0, balanceUpdated: false };
    }

    // In production, this would call Plaid API
    account.lastSynced = new Date();

    return { success: true, transactionsAdded: 0, balanceUpdated: true };
}

export default {
    addAccount,
    getUserAccounts,
    aggregateAccounts,
    updateAccountBalance,
    createBalanceAlert,
    enrichTransaction,
    createReconciliation,
    getReconciliationHistory,
    calculateCreditUtilization,
    syncAccountWithPlaid,
};
