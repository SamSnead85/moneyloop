/**
 * Household Permissions System
 * 
 * Granular role-based access control for household members.
 * Supports Admin, Member, Viewer, and Child roles with feature-level permissions.
 * 
 * Super-Sprint 2: Phases 101-125
 */

export type HouseholdRole = 'owner' | 'admin' | 'member' | 'viewer' | 'child';

export interface Permission {
    feature: string;
    actions: ('view' | 'create' | 'edit' | 'delete' | 'approve')[];
}

export interface RolePermissions {
    role: HouseholdRole;
    permissions: Permission[];
    limits?: {
        maxTransactionAmount?: number;
        requireApprovalAbove?: number;
        dailySpendingLimit?: number;
    };
}

// Default role permission configurations
export const ROLE_PERMISSIONS: Record<HouseholdRole, RolePermissions> = {
    owner: {
        role: 'owner',
        permissions: [
            { feature: '*', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
        ],
    },
    admin: {
        role: 'admin',
        permissions: [
            { feature: 'accounts', actions: ['view', 'create', 'edit'] },
            { feature: 'transactions', actions: ['view', 'create', 'edit', 'delete'] },
            { feature: 'budgets', actions: ['view', 'create', 'edit', 'delete'] },
            { feature: 'goals', actions: ['view', 'create', 'edit', 'delete'] },
            { feature: 'bills', actions: ['view', 'create', 'edit', 'delete'] },
            { feature: 'members', actions: ['view', 'create', 'edit'] },
            { feature: 'settings', actions: ['view', 'edit'] },
            { feature: 'reports', actions: ['view', 'create'] },
            { feature: 'automations', actions: ['view', 'create', 'edit', 'delete'] },
        ],
    },
    member: {
        role: 'member',
        permissions: [
            { feature: 'accounts', actions: ['view'] },
            { feature: 'transactions', actions: ['view', 'create'] },
            { feature: 'budgets', actions: ['view'] },
            { feature: 'goals', actions: ['view', 'create', 'edit'] },
            { feature: 'bills', actions: ['view'] },
            { feature: 'tasks', actions: ['view', 'create', 'edit'] },
            { feature: 'reports', actions: ['view'] },
        ],
    },
    viewer: {
        role: 'viewer',
        permissions: [
            { feature: 'accounts', actions: ['view'] },
            { feature: 'transactions', actions: ['view'] },
            { feature: 'budgets', actions: ['view'] },
            { feature: 'goals', actions: ['view'] },
            { feature: 'reports', actions: ['view'] },
        ],
    },
    child: {
        role: 'child',
        permissions: [
            { feature: 'allowance', actions: ['view'] },
            { feature: 'goals', actions: ['view', 'create'] },
            { feature: 'tasks', actions: ['view', 'edit'] },
            { feature: 'spending_requests', actions: ['view', 'create'] },
        ],
        limits: {
            maxTransactionAmount: 50,
            requireApprovalAbove: 20,
            dailySpendingLimit: 25,
        },
    },
};

export interface HouseholdMember {
    id: string;
    householdId: string;
    userId: string;
    name: string;
    email: string;
    role: HouseholdRole;
    joinedAt: Date;
    invitedBy: string;
    isActive: boolean;
    customPermissions?: Permission[];
    limits?: RolePermissions['limits'];
}

export interface Household {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    members: HouseholdMember[];
    settings: {
        defaultCurrency: string;
        timezone: string;
        fiscalMonthStart: number;
        requireApprovalForLargeTransactions: boolean;
        largeTransactionThreshold: number;
    };
}

/**
 * Check if a member has permission for an action
 */
export function hasPermission(
    member: HouseholdMember,
    feature: string,
    action: Permission['actions'][number]
): boolean {
    // Check custom permissions first
    if (member.customPermissions) {
        const customPerm = member.customPermissions.find(p => p.feature === feature || p.feature === '*');
        if (customPerm) {
            return customPerm.actions.includes(action);
        }
    }

    // Fall back to role permissions
    const rolePerms = ROLE_PERMISSIONS[member.role];
    if (!rolePerms) return false;

    for (const perm of rolePerms.permissions) {
        if (perm.feature === '*' || perm.feature === feature) {
            if (perm.actions.includes(action)) return true;
        }
    }

    return false;
}

/**
 * Check if transaction requires approval
 */
export function requiresApproval(
    member: HouseholdMember,
    amount: number,
    household: Household
): boolean {
    // Check member-specific limits
    const memberLimit = member.limits?.requireApprovalAbove;
    if (memberLimit !== undefined && amount > memberLimit) {
        return true;
    }

    // Check role-based limits
    const roleLimit = ROLE_PERMISSIONS[member.role].limits?.requireApprovalAbove;
    if (roleLimit !== undefined && amount > roleLimit) {
        return true;
    }

    // Check household settings
    if (household.settings.requireApprovalForLargeTransactions) {
        if (amount > household.settings.largeTransactionThreshold) {
            return true;
        }
    }

    return false;
}

/**
 * Check daily spending limit
 */
export function checkDailyLimit(
    member: HouseholdMember,
    todaySpending: number,
    newAmount: number
): { allowed: boolean; remaining: number } {
    const limit = member.limits?.dailySpendingLimit ||
        ROLE_PERMISSIONS[member.role].limits?.dailySpendingLimit;

    if (limit === undefined) {
        return { allowed: true, remaining: Infinity };
    }

    const remaining = limit - todaySpending;
    return {
        allowed: newAmount <= remaining,
        remaining: Math.max(0, remaining),
    };
}

/**
 * Generate invitation token
 */
export function generateInviteToken(householdId: string, role: HouseholdRole): string {
    const payload = {
        householdId,
        role,
        timestamp: Date.now(),
        random: Math.random().toString(36).substring(2),
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Validate invitation token
 */
export function validateInviteToken(token: string): {
    valid: boolean;
    householdId?: string;
    role?: HouseholdRole;
    expired?: boolean;
} {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        const age = Date.now() - payload.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (age > maxAge) {
            return { valid: false, expired: true };
        }

        return {
            valid: true,
            householdId: payload.householdId,
            role: payload.role,
        };
    } catch {
        return { valid: false };
    }
}

/**
 * Get visible features for a role
 */
export function getVisibleFeatures(role: HouseholdRole): string[] {
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return [];

    const features = new Set<string>();
    for (const perm of perms.permissions) {
        if (perm.feature !== '*') {
            features.add(perm.feature);
        }
    }

    // If wildcard, return all features
    if (perms.permissions.some(p => p.feature === '*')) {
        return [
            'accounts', 'transactions', 'budgets', 'goals', 'bills',
            'members', 'settings', 'reports', 'automations', 'tasks',
            'allowance', 'spending_requests', 'insights', 'analytics',
        ];
    }

    return Array.from(features);
}

export default {
    hasPermission,
    requiresApproval,
    checkDailyLimit,
    generateInviteToken,
    validateInviteToken,
    getVisibleFeatures,
    ROLE_PERMISSIONS,
};
