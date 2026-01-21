/**
 * Family Financial Features
 * 
 * Kid-friendly interface, chore/reward system,
 * and allowance automation.
 * 
 * Super-Sprint 17: Phases 1601-1650
 */

export interface FamilyMember {
    id: string;
    householdId: string;
    userId?: string; // If has account
    name: string;
    avatar?: string;
    role: 'parent' | 'child' | 'teen';
    birthDate?: Date;
    age?: number;
    settings: {
        spendingLimit?: number;
        requireApproval: boolean;
        canViewHouseholdBudget: boolean;
        allowedCategories?: string[];
    };
}

export interface Chore {
    id: string;
    householdId: string;
    name: string;
    description?: string;
    rewardAmount: number;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedMinutes: number;
    assignedTo?: string; // FamilyMember ID
    category: 'cleaning' | 'outdoor' | 'pet_care' | 'homework' | 'other';
    isActive: boolean;
    createdBy: string;
    icon?: string;
}

export interface ChoreCompletion {
    id: string;
    choreId: string;
    completedBy: string; // FamilyMember ID
    completedAt: Date;
    submittedPhoto?: string;
    notes?: string;
    status: 'pending_approval' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    rewardAmount: number;
    paidOut: boolean;
}

export interface Allowance {
    id: string;
    memberId: string;
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    isActive: boolean;
    fundingAccountId?: string;
    destinationAccountId?: string;
    nextPaymentDate: Date;
    lastPaymentDate?: Date;
    autoTransfer: boolean;
}

export interface KidWallet {
    memberId: string;
    balance: number;
    pendingRewards: number;
    savingsGoals: {
        id: string;
        name: string;
        targetAmount: number;
        currentAmount: number;
        icon?: string;
    }[];
    transactions: {
        id: string;
        type: 'allowance' | 'chore_reward' | 'gift' | 'spending' | 'savings';
        amount: number;
        description: string;
        date: Date;
    }[];
}

// In-memory stores
const members: Map<string, FamilyMember> = new Map();
const chores: Map<string, Chore> = new Map();
const completions: Map<string, ChoreCompletion> = new Map();
const allowances: Map<string, Allowance> = new Map();
const wallets: Map<string, KidWallet> = new Map();

// Default chore templates
export const CHORE_TEMPLATES: Omit<Chore, 'id' | 'householdId' | 'createdBy' | 'assignedTo'>[] = [
    { name: 'Make Bed', description: 'Make your bed neatly', rewardAmount: 1, frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, category: 'cleaning', isActive: true, icon: '🛏️' },
    { name: 'Clean Room', description: 'Tidy up your room', rewardAmount: 3, frequency: 'weekly', difficulty: 'medium', estimatedMinutes: 20, category: 'cleaning', isActive: true, icon: '🧹' },
    { name: 'Take Out Trash', description: 'Empty all trash bins', rewardAmount: 2, frequency: 'weekly', difficulty: 'easy', estimatedMinutes: 10, category: 'cleaning', isActive: true, icon: '🗑️' },
    { name: 'Feed Pet', description: 'Feed and water pet', rewardAmount: 1, frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, category: 'pet_care', isActive: true, icon: '🐕' },
    { name: 'Walk Dog', description: 'Take dog for a walk', rewardAmount: 3, frequency: 'daily', difficulty: 'medium', estimatedMinutes: 20, category: 'pet_care', isActive: true, icon: '🦮' },
    { name: 'Do Dishes', description: 'Wash or load dishwasher', rewardAmount: 2, frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, category: 'cleaning', isActive: true, icon: '🍽️' },
    { name: 'Mow Lawn', description: 'Mow the front/back lawn', rewardAmount: 10, frequency: 'weekly', difficulty: 'hard', estimatedMinutes: 45, category: 'outdoor', isActive: true, icon: '🌿' },
    { name: 'Homework Hour', description: 'Complete 1 hour of homework', rewardAmount: 2, frequency: 'daily', difficulty: 'medium', estimatedMinutes: 60, category: 'homework', isActive: true, icon: '📚' },
];

/**
 * Add family member
 */
export function addFamilyMember(params: Omit<FamilyMember, 'id'>): FamilyMember {
    const id = `member_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const member: FamilyMember = { id, ...params };
    members.set(id, member);

    // Create wallet for children
    if (member.role === 'child' || member.role === 'teen') {
        wallets.set(id, {
            memberId: id,
            balance: 0,
            pendingRewards: 0,
            savingsGoals: [],
            transactions: [],
        });
    }

    return member;
}

/**
 * Create chore
 */
export function createChore(params: Omit<Chore, 'id'>): Chore {
    const id = `chore_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chore: Chore = { id, ...params };
    chores.set(id, chore);
    return chore;
}

/**
 * Get household chores
 */
export function getHouseholdChores(householdId: string): Chore[] {
    return Array.from(chores.values())
        .filter(c => c.householdId === householdId && c.isActive);
}

/**
 * Get member's assigned chores
 */
export function getMemberChores(memberId: string): Chore[] {
    return Array.from(chores.values())
        .filter(c => c.assignedTo === memberId && c.isActive);
}

/**
 * Submit chore completion
 */
export function submitChoreCompletion(params: {
    choreId: string;
    completedBy: string;
    submittedPhoto?: string;
    notes?: string;
}): ChoreCompletion {
    const chore = chores.get(params.choreId);
    if (!chore) throw new Error('Chore not found');

    const completion: ChoreCompletion = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        choreId: params.choreId,
        completedBy: params.completedBy,
        completedAt: new Date(),
        submittedPhoto: params.submittedPhoto,
        notes: params.notes,
        status: 'pending_approval',
        rewardAmount: chore.rewardAmount,
        paidOut: false,
    };

    completions.set(completion.id, completion);

    // Update pending rewards in wallet
    const wallet = wallets.get(params.completedBy);
    if (wallet) {
        wallet.pendingRewards += chore.rewardAmount;
    }

    return completion;
}

/**
 * Approve chore completion
 */
export function approveChoreCompletion(completionId: string, approvedBy: string): ChoreCompletion {
    const completion = completions.get(completionId);
    if (!completion) throw new Error('Completion not found');

    completion.status = 'approved';
    completion.approvedBy = approvedBy;
    completion.approvedAt = new Date();

    // Move from pending to balance
    const wallet = wallets.get(completion.completedBy);
    if (wallet) {
        wallet.pendingRewards -= completion.rewardAmount;
        wallet.balance += completion.rewardAmount;
        wallet.transactions.unshift({
            id: `tx_${Date.now()}`,
            type: 'chore_reward',
            amount: completion.rewardAmount,
            description: `Chore completed: ${chores.get(completion.choreId)?.name}`,
            date: new Date(),
        });
        completion.paidOut = true;
    }

    return completion;
}

/**
 * Reject chore completion
 */
export function rejectChoreCompletion(completionId: string, approvedBy: string): ChoreCompletion {
    const completion = completions.get(completionId);
    if (!completion) throw new Error('Completion not found');

    completion.status = 'rejected';
    completion.approvedBy = approvedBy;
    completion.approvedAt = new Date();

    // Remove from pending
    const wallet = wallets.get(completion.completedBy);
    if (wallet) {
        wallet.pendingRewards -= completion.rewardAmount;
    }

    return completion;
}

/**
 * Set up allowance
 */
export function setupAllowance(params: Omit<Allowance, 'id' | 'nextPaymentDate' | 'lastPaymentDate'>): Allowance {
    const id = `allow_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Calculate next payment date
    const nextPaymentDate = calculateNextAllowanceDate(params.frequency, params.dayOfWeek, params.dayOfMonth);

    const allowance: Allowance = {
        id,
        ...params,
        nextPaymentDate,
    };

    allowances.set(id, allowance);
    return allowance;
}

/**
 * Calculate next allowance date
 */
function calculateNextAllowanceDate(
    frequency: Allowance['frequency'],
    dayOfWeek?: number,
    dayOfMonth?: number
): Date {
    const now = new Date();
    const next = new Date(now);

    if (frequency === 'weekly') {
        const targetDay = dayOfWeek || 0; // Default to Sunday
        const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
    } else if (frequency === 'biweekly') {
        const targetDay = dayOfWeek || 0;
        const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil + 7);
    } else {
        const targetDate = dayOfMonth || 1;
        next.setDate(targetDate);
        if (next <= now) {
            next.setMonth(next.getMonth() + 1);
        }
    }

    next.setHours(0, 0, 0, 0);
    return next;
}

/**
 * Process allowance payment
 */
export function processAllowancePayment(allowanceId: string): {
    success: boolean;
    wallet?: KidWallet;
} {
    const allowance = allowances.get(allowanceId);
    if (!allowance || !allowance.isActive) {
        return { success: false };
    }

    const wallet = wallets.get(allowance.memberId);
    if (!wallet) {
        return { success: false };
    }

    wallet.balance += allowance.amount;
    wallet.transactions.unshift({
        id: `tx_${Date.now()}`,
        type: 'allowance',
        amount: allowance.amount,
        description: 'Weekly allowance',
        date: new Date(),
    });

    allowance.lastPaymentDate = new Date();
    allowance.nextPaymentDate = calculateNextAllowanceDate(
        allowance.frequency,
        allowance.dayOfWeek,
        allowance.dayOfMonth
    );

    return { success: true, wallet };
}

/**
 * Get kid wallet
 */
export function getKidWallet(memberId: string): KidWallet | null {
    return wallets.get(memberId) || null;
}

/**
 * Add savings goal for kid
 */
export function addKidSavingsGoal(memberId: string, params: {
    name: string;
    targetAmount: number;
    icon?: string;
}): KidWallet | null {
    const wallet = wallets.get(memberId);
    if (!wallet) return null;

    wallet.savingsGoals.push({
        id: `goal_${Date.now()}`,
        name: params.name,
        targetAmount: params.targetAmount,
        currentAmount: 0,
        icon: params.icon,
    });

    return wallet;
}

/**
 * Contribute to kid savings goal
 */
export function contributeToKidGoal(memberId: string, goalId: string, amount: number): {
    success: boolean;
    wallet?: KidWallet;
} {
    const wallet = wallets.get(memberId);
    if (!wallet || wallet.balance < amount) {
        return { success: false };
    }

    const goal = wallet.savingsGoals.find(g => g.id === goalId);
    if (!goal) return { success: false };

    wallet.balance -= amount;
    goal.currentAmount += amount;

    wallet.transactions.unshift({
        id: `tx_${Date.now()}`,
        type: 'savings',
        amount: -amount,
        description: `Saved for: ${goal.name}`,
        date: new Date(),
    });

    return { success: true, wallet };
}

/**
 * Get family dashboard data
 */
export function getFamilyDashboard(householdId: string): {
    members: FamilyMember[];
    pendingApprovals: ChoreCompletion[];
    todayChores: Chore[];
    weeklyEarnings: Record<string, number>;
} {
    const householdMembers = Array.from(members.values())
        .filter(m => m.householdId === householdId);

    const memberIds = new Set(householdMembers.map(m => m.id));

    const pendingApprovals = Array.from(completions.values())
        .filter(c => memberIds.has(c.completedBy) && c.status === 'pending_approval');

    const todayChores = Array.from(chores.values())
        .filter(c => c.householdId === householdId && c.isActive &&
            (c.frequency === 'daily' || c.frequency === 'once'));

    // Weekly earnings per member
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyEarnings: Record<string, number> = {};
    for (const member of householdMembers) {
        const wallet = wallets.get(member.id);
        if (wallet) {
            weeklyEarnings[member.id] = wallet.transactions
                .filter(t => t.date >= weekAgo && t.amount > 0)
                .reduce((s, t) => s + t.amount, 0);
        }
    }

    return {
        members: householdMembers,
        pendingApprovals,
        todayChores,
        weeklyEarnings,
    };
}

export default {
    addFamilyMember,
    createChore,
    getHouseholdChores,
    getMemberChores,
    submitChoreCompletion,
    approveChoreCompletion,
    rejectChoreCompletion,
    setupAllowance,
    processAllowancePayment,
    getKidWallet,
    addKidSavingsGoal,
    contributeToKidGoal,
    getFamilyDashboard,
    CHORE_TEMPLATES,
};
