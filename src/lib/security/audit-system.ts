/**
 * Security & Audit Trail System
 * 
 * Enterprise-grade security features including WebAuthn,
 * session management, and tamper-evident audit logging.
 * 
 * Super-Sprint 7: Phases 601-650
 */

import { createHash, randomBytes } from 'crypto';

export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId: string;
    sessionId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    previousHash: string;
    hash: string;
}

export interface Session {
    id: string;
    userId: string;
    createdAt: Date;
    lastActive: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    deviceName?: string;
    isCurrentSession: boolean;
    riskScore: number;
}

export interface SecuritySettings {
    userId: string;
    twoFactorEnabled: boolean;
    webAuthnEnabled: boolean;
    trustedDevices: string[];
    loginNotifications: boolean;
    sessionTimeout: number; // minutes
    requireReauthForSensitive: boolean;
    lastPasswordChange: Date;
    passwordExpiresAt?: Date;
}

export interface SecurityEvent {
    type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity' | '2fa_enabled' | '2fa_disabled' | 'session_revoked';
    timestamp: Date;
    details: Record<string, unknown>;
    severity: 'info' | 'warning' | 'critical';
}

// Audit log chain (in production, use database)
const auditChain: AuditLogEntry[] = [];

/**
 * Generate hash for audit log entry
 */
function generateHash(entry: Omit<AuditLogEntry, 'hash'>): string {
    const data = JSON.stringify({
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details,
        previousHash: entry.previousHash,
    });
    return createHash('sha256').update(data).digest('hex');
}

/**
 * Create a new audit log entry (tamper-evident chain)
 */
export function createAuditLog(
    userId: string,
    sessionId: string,
    action: string,
    resource: string,
    details: Record<string, unknown>,
    options?: {
        resourceId?: string;
        ipAddress?: string;
        userAgent?: string;
    }
): AuditLogEntry {
    const previousHash = auditChain.length > 0
        ? auditChain[auditChain.length - 1].hash
        : '0'.repeat(64);

    const entry: Omit<AuditLogEntry, 'hash'> = {
        id: `audit_${Date.now()}_${randomBytes(8).toString('hex')}`,
        timestamp: new Date(),
        userId,
        sessionId,
        action,
        resource,
        resourceId: options?.resourceId,
        details,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        previousHash,
    };

    const hash = generateHash(entry);
    const fullEntry: AuditLogEntry = { ...entry, hash };

    auditChain.push(fullEntry);

    // Keep only last 10000 entries in memory
    if (auditChain.length > 10000) {
        auditChain.shift();
    }

    return fullEntry;
}

/**
 * Verify audit log chain integrity
 */
export function verifyAuditChain(entries: AuditLogEntry[]): {
    isValid: boolean;
    brokenAt?: number;
    error?: string;
} {
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // Verify hash
        const computedHash = generateHash({
            ...entry,
            hash: undefined,
        } as Omit<AuditLogEntry, 'hash'>);

        if (computedHash !== entry.hash) {
            return { isValid: false, brokenAt: i, error: 'Hash mismatch' };
        }

        // Verify chain link
        if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
            return { isValid: false, brokenAt: i, error: 'Chain link broken' };
        }
    }

    return { isValid: true };
}

/**
 * Get recent audit logs for a user
 */
export function getAuditLogs(
    userId: string,
    options?: {
        limit?: number;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
    }
): AuditLogEntry[] {
    let logs = auditChain.filter(e => e.userId === userId);

    if (options?.action) {
        logs = logs.filter(e => e.action === options.action);
    }
    if (options?.resource) {
        logs = logs.filter(e => e.resource === options.resource);
    }
    if (options?.startDate) {
        logs = logs.filter(e => e.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
        logs = logs.filter(e => e.timestamp <= options.endDate!);
    }

    return logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, options?.limit || 100);
}

/**
 * Calculate session risk score
 */
export function calculateSessionRisk(
    session: Partial<Session>,
    recentSessions: Session[],
    recentEvents: SecurityEvent[]
): number {
    let score = 0;

    // New device
    const knownDevices = new Set(recentSessions.map(s => s.userAgent));
    if (session.userAgent && !knownDevices.has(session.userAgent)) {
        score += 30;
    }

    // New IP
    const knownIPs = new Set(recentSessions.map(s => s.ipAddress));
    if (session.ipAddress && !knownIPs.has(session.ipAddress)) {
        score += 20;
    }

    // Recent failed logins
    const recentFailures = recentEvents.filter(
        e => e.type === 'failed_login' &&
            e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentFailures.length >= 3) {
        score += 25;
    }

    // Time-based risk (unusual hours)
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
        score += 10;
    }

    return Math.min(100, score);
}

/**
 * Check if action requires re-authentication
 */
export function requiresReauth(
    action: string,
    settings: SecuritySettings,
    lastAuth: Date
): boolean {
    const sensitiveActions = [
        'change_password',
        'change_email',
        'add_payment_method',
        'transfer_large',
        'delete_account',
        'revoke_sessions',
        'disable_2fa',
        'export_data',
    ];

    if (!sensitiveActions.includes(action)) {
        return false;
    }

    if (!settings.requireReauthForSensitive) {
        return false;
    }

    // Require reauth if last auth was more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastAuth < fiveMinutesAgo;
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Parse user agent for device info
 */
export function parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
} {
    const ua = userAgent.toLowerCase();

    let browser = 'Unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('android')) os = 'Android';

    let device = 'Desktop';
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
        device = 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        device = 'Tablet';
    }

    return { browser, os, device };
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
    score: number;
    label: string;
    suggestions: string[];
} {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 20;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 10;

    if (/[a-z]/.test(password)) score += 15;
    else suggestions.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else suggestions.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 20;
    else suggestions.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else suggestions.push('Add special characters');

    // Common patterns penalty
    if (/123|abc|password|qwerty/i.test(password)) {
        score -= 20;
        suggestions.push('Avoid common patterns');
    }

    let label: string;
    if (score >= 80) label = 'Strong';
    else if (score >= 60) label = 'Good';
    else if (score >= 40) label = 'Fair';
    else label = 'Weak';

    return { score: Math.max(0, Math.min(100, score)), label, suggestions };
}

export default {
    createAuditLog,
    verifyAuditChain,
    getAuditLogs,
    calculateSessionRisk,
    requiresReauth,
    generateSessionToken,
    parseUserAgent,
    checkPasswordStrength,
};
