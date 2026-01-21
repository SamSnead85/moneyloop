/**
 * Privacy & Compliance System
 * 
 * GDPR data export, consent management, data retention,
 * and privacy controls.
 * 
 * Super-Sprint 29: Phases 2801-2850
 */

export interface ConsentRecord {
    id: string;
    userId: string;
    consentType: ConsentType;
    granted: boolean;
    grantedAt?: Date;
    revokedAt?: Date;
    version: string;
    ipAddress?: string;
    userAgent?: string;
}

export type ConsentType =
    | 'terms_of_service'
    | 'privacy_policy'
    | 'data_processing'
    | 'marketing_emails'
    | 'analytics'
    | 'third_party_sharing'
    | 'plaid_access'
    | 'ai_features';

export interface DataExportRequest {
    id: string;
    userId: string;
    type: 'full' | 'partial';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestedAt: Date;
    completedAt?: Date;
    downloadUrl?: string;
    expiresAt?: Date;
    categories?: DataCategory[];
}

export type DataCategory =
    | 'profile'
    | 'accounts'
    | 'transactions'
    | 'budgets'
    | 'goals'
    | 'bills'
    | 'documents'
    | 'settings'
    | 'activity_logs'
    | 'ai_conversations';

export interface DataDeletionRequest {
    id: string;
    userId: string;
    type: 'full' | 'partial';
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    requestedAt: Date;
    confirmedAt?: Date;
    scheduledDeletionAt?: Date;
    completedAt?: Date;
    categories?: DataCategory[];
    retentionExceptions?: string[];
}

export interface DataRetentionPolicy {
    category: DataCategory;
    retentionDays: number;
    legalBasis: string;
    autoDelete: boolean;
}

export interface PrivacySettings {
    userId: string;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
    thirdPartyConsent: boolean;
    aiFeatures: boolean;
    dataRetentionPeriod: 'default' | '1_year' | '2_years' | '5_years' | 'indefinite';
    exportFormat: 'json' | 'csv';
    updatedAt: Date;
}

// In-memory stores
const consents: Map<string, ConsentRecord[]> = new Map();
const exportRequests: Map<string, DataExportRequest> = new Map();
const deletionRequests: Map<string, DataDeletionRequest> = new Map();
const privacySettings: Map<string, PrivacySettings> = new Map();

// Default retention policies (days)
const DEFAULT_RETENTION_POLICIES: DataRetentionPolicy[] = [
    { category: 'transactions', retentionDays: 2555, legalBasis: 'tax_compliance', autoDelete: false }, // 7 years
    { category: 'documents', retentionDays: 2555, legalBasis: 'tax_compliance', autoDelete: false },
    { category: 'activity_logs', retentionDays: 365, legalBasis: 'security', autoDelete: true },
    { category: 'ai_conversations', retentionDays: 90, legalBasis: 'service_improvement', autoDelete: true },
    { category: 'profile', retentionDays: -1, legalBasis: 'contract', autoDelete: false }, // Until deletion
    { category: 'accounts', retentionDays: -1, legalBasis: 'contract', autoDelete: false },
    { category: 'budgets', retentionDays: -1, legalBasis: 'contract', autoDelete: false },
    { category: 'goals', retentionDays: -1, legalBasis: 'contract', autoDelete: false },
    { category: 'bills', retentionDays: -1, legalBasis: 'contract', autoDelete: false },
    { category: 'settings', retentionDays: -1, legalBasis: 'contract', autoDelete: false },
];

// Consent text versions
export const CONSENT_VERSIONS: Record<ConsentType, { version: string; summary: string }> = {
    terms_of_service: { version: '2.0', summary: 'Agreement to use MoneyLoop services' },
    privacy_policy: { version: '2.0', summary: 'How we collect, use, and protect your data' },
    data_processing: { version: '1.0', summary: 'Processing of financial data for app features' },
    marketing_emails: { version: '1.0', summary: 'Receive tips, updates, and promotional content' },
    analytics: { version: '1.0', summary: 'Help improve MoneyLoop with anonymized usage data' },
    third_party_sharing: { version: '1.0', summary: 'Share data with partners for enhanced features' },
    plaid_access: { version: '1.0', summary: 'Connect bank accounts via Plaid' },
    ai_features: { version: '1.0', summary: 'Use AI for insights and recommendations' },
};

/**
 * Record user consent
 */
export function recordConsent(params: {
    userId: string;
    consentType: ConsentType;
    granted: boolean;
    ipAddress?: string;
    userAgent?: string;
}): ConsentRecord {
    const record: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId,
        consentType: params.consentType,
        granted: params.granted,
        grantedAt: params.granted ? new Date() : undefined,
        revokedAt: params.granted ? undefined : new Date(),
        version: CONSENT_VERSIONS[params.consentType].version,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
    };

    const userConsents = consents.get(params.userId) || [];
    userConsents.push(record);
    consents.set(params.userId, userConsents);

    return record;
}

/**
 * Get current consent status
 */
export function getConsentStatus(userId: string): Record<ConsentType, { granted: boolean; version: string; date?: Date }> {
    const userConsents = consents.get(userId) || [];
    const status: Record<string, { granted: boolean; version: string; date?: Date }> = {};

    for (const type of Object.keys(CONSENT_VERSIONS) as ConsentType[]) {
        const latestConsent = userConsents
            .filter(c => c.consentType === type)
            .sort((a, b) => (b.grantedAt?.getTime() || b.revokedAt?.getTime() || 0) - (a.grantedAt?.getTime() || a.revokedAt?.getTime() || 0))[0];

        status[type] = {
            granted: latestConsent?.granted || false,
            version: latestConsent?.version || CONSENT_VERSIONS[type].version,
            date: latestConsent?.grantedAt || latestConsent?.revokedAt,
        };
    }

    return status as Record<ConsentType, { granted: boolean; version: string; date?: Date }>;
}

/**
 * Request data export (GDPR)
 */
export function requestDataExport(
    userId: string,
    type: 'full' | 'partial' = 'full',
    categories?: DataCategory[]
): DataExportRequest {
    const request: DataExportRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        type,
        status: 'pending',
        requestedAt: new Date(),
        categories: type === 'partial' ? categories : undefined,
    };

    exportRequests.set(request.id, request);

    // In production, queue export job
    processExportRequest(request.id);

    return request;
}

/**
 * Process export request (async)
 */
async function processExportRequest(requestId: string): Promise<void> {
    const request = exportRequests.get(requestId);
    if (!request) return;

    request.status = 'processing';

    // Simulate export (in production, gather all data)
    setTimeout(() => {
        request.status = 'completed';
        request.completedAt = new Date();
        request.downloadUrl = `/api/exports/${requestId}/download`;
        request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }, 5000);
}

/**
 * Get export request status
 */
export function getExportStatus(requestId: string): DataExportRequest | null {
    return exportRequests.get(requestId) || null;
}

/**
 * Get user's export requests
 */
export function getUserExportRequests(userId: string): DataExportRequest[] {
    return Array.from(exportRequests.values())
        .filter(r => r.userId === userId)
        .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}

/**
 * Request data deletion (GDPR Right to Erasure)
 */
export function requestDataDeletion(
    userId: string,
    type: 'full' | 'partial' = 'full',
    categories?: DataCategory[]
): DataDeletionRequest {
    const request: DataDeletionRequest = {
        id: `delete_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        type,
        status: 'pending',
        requestedAt: new Date(),
        categories: type === 'partial' ? categories : undefined,
        // Data with legal retention requirements
        retentionExceptions: type === 'full' ? ['transactions', 'documents'] : undefined,
    };

    deletionRequests.set(request.id, request);
    return request;
}

/**
 * Confirm deletion request
 */
export function confirmDeletionRequest(requestId: string): DataDeletionRequest | null {
    const request = deletionRequests.get(requestId);
    if (!request || request.status !== 'pending') return null;

    request.status = 'confirmed';
    request.confirmedAt = new Date();
    request.scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days grace period

    return request;
}

/**
 * Cancel deletion request
 */
export function cancelDeletionRequest(requestId: string): boolean {
    const request = deletionRequests.get(requestId);
    if (!request || request.status === 'processing' || request.status === 'completed') {
        return false;
    }

    request.status = 'cancelled';
    return true;
}

/**
 * Get/update privacy settings
 */
export function getPrivacySettings(userId: string): PrivacySettings {
    let settings = privacySettings.get(userId);

    if (!settings) {
        settings = {
            userId,
            dataProcessingConsent: false,
            marketingConsent: false,
            analyticsConsent: false,
            thirdPartyConsent: false,
            aiFeatures: true,
            dataRetentionPeriod: 'default',
            exportFormat: 'json',
            updatedAt: new Date(),
        };
        privacySettings.set(userId, settings);
    }

    return settings;
}

export function updatePrivacySettings(
    userId: string,
    updates: Partial<Omit<PrivacySettings, 'userId' | 'updatedAt'>>
): PrivacySettings {
    const current = getPrivacySettings(userId);
    const updated: PrivacySettings = {
        ...current,
        ...updates,
        updatedAt: new Date(),
    };

    privacySettings.set(userId, updated);
    return updated;
}

/**
 * Get data retention policies
 */
export function getRetentionPolicies(): DataRetentionPolicy[] {
    return [...DEFAULT_RETENTION_POLICIES];
}

/**
 * Check if data category has legal retention requirement
 */
export function hasRetentionRequirement(category: DataCategory): boolean {
    const policy = DEFAULT_RETENTION_POLICIES.find(p => p.category === category);
    return policy?.legalBasis === 'tax_compliance' || policy?.legalBasis === 'security';
}

/**
 * Generate GDPR data export bundle
 */
export function generateDataBundle(userId: string, data: {
    profile: unknown;
    accounts: unknown[];
    transactions: unknown[];
    budgets: unknown[];
    goals: unknown[];
    settings: unknown;
}): { format: 'json'; content: string } {
    const bundle = {
        exportedAt: new Date().toISOString(),
        userId,
        dataCategories: Object.keys(data),
        disclaimer: 'This is a complete export of your data stored in MoneyLoop as required by GDPR Article 20.',
        ...data,
    };

    return {
        format: 'json',
        content: JSON.stringify(bundle, null, 2),
    };
}

/**
 * Anonymize user data (for analytics retention)
 */
export function anonymizeData<T extends Record<string, unknown>>(
    data: T,
    fieldsToAnonymize: (keyof T)[]
): T {
    const anonymized = { ...data };

    for (const field of fieldsToAnonymize) {
        if (typeof anonymized[field] === 'string') {
            (anonymized[field] as unknown) = 'ANONYMIZED';
        } else if (typeof anonymized[field] === 'number') {
            (anonymized[field] as unknown) = 0;
        } else {
            (anonymized[field] as unknown) = null;
        }
    }

    return anonymized;
}

export default {
    recordConsent,
    getConsentStatus,
    requestDataExport,
    getExportStatus,
    getUserExportRequests,
    requestDataDeletion,
    confirmDeletionRequest,
    cancelDeletionRequest,
    getPrivacySettings,
    updatePrivacySettings,
    getRetentionPolicies,
    hasRetentionRequirement,
    generateDataBundle,
    anonymizeData,
    CONSENT_VERSIONS,
};
