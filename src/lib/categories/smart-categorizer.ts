/**
 * Smart Category Engine
 * 
 * ML-based transaction categorization with learning,
 * custom rules, and category insights.
 * 
 * Super-Sprint 22: Phases 2101-2150
 */

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    parentId?: string;
    isSystem: boolean;
    keywords: string[];
    rules: CategoryRule[];
}

export interface CategoryRule {
    id: string;
    categoryId: string;
    type: 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'amount_range' | 'merchant';
    value: string;
    priority: number;
    isEnabled: boolean;
}

export interface CategorizationResult {
    categoryId: string;
    categoryName: string;
    confidence: number;
    matchedRule?: string;
    alternatives: { categoryId: string; categoryName: string; confidence: number }[];
}

export interface CategoryInsight {
    categoryId: string;
    categoryName: string;
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    trend: 'up' | 'down' | 'stable';
    trendPercent: number;
    topMerchants: { name: string; amount: number; count: number }[];
    monthlyBreakdown: { month: string; amount: number }[];
}

export interface LearningFeedback {
    transactionId: string;
    originalCategoryId: string;
    correctedCategoryId: string;
    merchantName: string;
    timestamp: Date;
}

// System categories
export const SYSTEM_CATEGORIES: Category[] = [
    { id: 'income', name: 'Income', icon: '💰', color: '#10b981', isSystem: true, keywords: ['salary', 'payroll', 'deposit', 'direct dep'], rules: [] },
    { id: 'housing', name: 'Housing', icon: '🏠', color: '#6366f1', isSystem: true, keywords: ['rent', 'mortgage', 'hoa', 'property'], rules: [] },
    { id: 'utilities', name: 'Utilities', icon: '💡', color: '#f59e0b', isSystem: true, keywords: ['electric', 'gas', 'water', 'internet', 'phone'], rules: [] },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#22c55e', isSystem: true, keywords: ['grocery', 'supermarket', 'whole foods', 'trader joe'], rules: [] },
    { id: 'dining', name: 'Dining Out', icon: '🍽️', color: '#ef4444', isSystem: true, keywords: ['restaurant', 'cafe', 'coffee', 'doordash', 'grubhub', 'uber eats'], rules: [] },
    { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#3b82f6', isSystem: true, keywords: ['gas', 'uber', 'lyft', 'parking', 'toll', 'metro'], rules: [] },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899', isSystem: true, keywords: ['amazon', 'target', 'walmart', 'costco', 'best buy'], rules: [] },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6', isSystem: true, keywords: ['netflix', 'spotify', 'hulu', 'movie', 'concert', 'game'], rules: [] },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#14b8a6', isSystem: true, keywords: ['pharmacy', 'doctor', 'hospital', 'medical', 'dental', 'cvs', 'walgreens'], rules: [] },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#64748b', isSystem: true, keywords: ['insurance', 'geico', 'state farm', 'allstate', 'progressive'], rules: [] },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📱', color: '#a855f7', isSystem: true, keywords: ['subscription', 'membership', 'monthly'], rules: [] },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4', isSystem: true, keywords: ['airline', 'hotel', 'airbnb', 'booking', 'expedia'], rules: [] },
    { id: 'education', name: 'Education', icon: '📚', color: '#84cc16', isSystem: true, keywords: ['tuition', 'school', 'course', 'udemy', 'coursera'], rules: [] },
    { id: 'personal', name: 'Personal Care', icon: '💇', color: '#f97316', isSystem: true, keywords: ['salon', 'spa', 'gym', 'fitness'], rules: [] },
    { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', color: '#e11d48', isSystem: true, keywords: ['gift', 'donation', 'charity'], rules: [] },
    { id: 'fees', name: 'Fees & Charges', icon: '📋', color: '#78716c', isSystem: true, keywords: ['fee', 'charge', 'interest', 'atm'], rules: [] },
    { id: 'transfer', name: 'Transfer', icon: '↔️', color: '#94a3b8', isSystem: true, keywords: ['transfer', 'venmo', 'zelle', 'paypal'], rules: [] },
    { id: 'other', name: 'Other', icon: '📦', color: '#71717a', isSystem: true, keywords: [], rules: [] },
];

// In-memory stores
const customCategories: Map<string, Category> = new Map();
const learningData: Map<string, LearningFeedback[]> = new Map(); // merchant -> feedbacks
const customRules: Map<string, CategoryRule[]> = new Map(); // userId -> rules

/**
 * Categorize a transaction
 */
export function categorizeTransaction(
    merchantName: string,
    amount: number,
    userId?: string
): CategorizationResult {
    const normalized = merchantName.toLowerCase().trim();
    const alternatives: { categoryId: string; categoryName: string; confidence: number }[] = [];

    // 1. Check user's custom rules first
    if (userId) {
        const userRules = customRules.get(userId) || [];
        for (const rule of userRules.sort((a, b) => b.priority - a.priority)) {
            if (!rule.isEnabled) continue;

            const match = matchRule(rule, normalized, amount);
            if (match) {
                const category = getCategory(rule.categoryId);
                if (category) {
                    return {
                        categoryId: rule.categoryId,
                        categoryName: category.name,
                        confidence: 0.95,
                        matchedRule: rule.id,
                        alternatives,
                    };
                }
            }
        }
    }

    // 2. Check learning data (user corrections)
    const learning = learningData.get(normalized);
    if (learning && learning.length > 0) {
        const mostRecent = learning[learning.length - 1];
        const category = getCategory(mostRecent.correctedCategoryId);
        if (category) {
            return {
                categoryId: mostRecent.correctedCategoryId,
                categoryName: category.name,
                confidence: 0.9,
                alternatives,
            };
        }
    }

    // 3. Keyword matching against all categories
    const scores: { categoryId: string; score: number }[] = [];
    const allCategories = [...SYSTEM_CATEGORIES, ...Array.from(customCategories.values())];

    for (const category of allCategories) {
        let score = 0;

        for (const keyword of category.keywords) {
            if (normalized.includes(keyword.toLowerCase())) {
                // Longer keyword matches = higher confidence
                score += keyword.length / normalized.length;
            }
        }

        if (score > 0) {
            scores.push({ categoryId: category.id, score });
        }
    }

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // Build alternatives
    for (let i = 1; i < Math.min(4, scores.length); i++) {
        const cat = getCategory(scores[i].categoryId);
        if (cat) {
            alternatives.push({
                categoryId: scores[i].categoryId,
                categoryName: cat.name,
                confidence: Math.max(0.1, 0.8 - i * 0.2) * scores[i].score,
            });
        }
    }

    if (scores.length > 0) {
        const bestMatch = scores[0];
        const category = getCategory(bestMatch.categoryId);
        if (category) {
            return {
                categoryId: bestMatch.categoryId,
                categoryName: category.name,
                confidence: Math.min(0.85, bestMatch.score),
                alternatives,
            };
        }
    }

    // Default to 'other'
    return {
        categoryId: 'other',
        categoryName: 'Other',
        confidence: 0.3,
        alternatives,
    };
}

/**
 * Match a rule against transaction
 */
function matchRule(rule: CategoryRule, merchantName: string, amount: number): boolean {
    switch (rule.type) {
        case 'contains':
            return merchantName.includes(rule.value.toLowerCase());
        case 'starts_with':
            return merchantName.startsWith(rule.value.toLowerCase());
        case 'ends_with':
            return merchantName.endsWith(rule.value.toLowerCase());
        case 'merchant':
            return merchantName === rule.value.toLowerCase();
        case 'regex':
            try {
                return new RegExp(rule.value, 'i').test(merchantName);
            } catch {
                return false;
            }
        case 'amount_range':
            const [min, max] = rule.value.split('-').map(Number);
            return amount >= min && amount <= max;
        default:
            return false;
    }
}

/**
 * Get category by ID
 */
export function getCategory(categoryId: string): Category | null {
    const system = SYSTEM_CATEGORIES.find(c => c.id === categoryId);
    if (system) return system;
    return customCategories.get(categoryId) || null;
}

/**
 * Get all categories
 */
export function getAllCategories(userId?: string): Category[] {
    const userCustom = userId
        ? Array.from(customCategories.values()).filter(c => c.id.startsWith(`${userId}_`))
        : [];
    return [...SYSTEM_CATEGORIES, ...userCustom];
}

/**
 * Create custom category
 */
export function createCustomCategory(
    userId: string,
    params: { name: string; icon: string; color: string; keywords?: string[]; parentId?: string }
): Category {
    const id = `${userId}_cat_${Date.now()}`;
    const category: Category = {
        id,
        name: params.name,
        icon: params.icon,
        color: params.color,
        parentId: params.parentId,
        isSystem: false,
        keywords: params.keywords || [],
        rules: [],
    };

    customCategories.set(id, category);
    return category;
}

/**
 * Create categorization rule
 */
export function createCategoryRule(
    userId: string,
    params: { categoryId: string; type: CategoryRule['type']; value: string; priority?: number }
): CategoryRule {
    const rule: CategoryRule = {
        id: `rule_${Date.now()}`,
        categoryId: params.categoryId,
        type: params.type,
        value: params.value,
        priority: params.priority || 50,
        isEnabled: true,
    };

    const userRules = customRules.get(userId) || [];
    userRules.push(rule);
    customRules.set(userId, userRules);

    return rule;
}

/**
 * Learn from user correction
 */
export function learnFromCorrection(
    transactionId: string,
    merchantName: string,
    originalCategoryId: string,
    correctedCategoryId: string
): void {
    const normalized = merchantName.toLowerCase().trim();
    const feedback: LearningFeedback = {
        transactionId,
        originalCategoryId,
        correctedCategoryId,
        merchantName: normalized,
        timestamp: new Date(),
    };

    const existing = learningData.get(normalized) || [];
    existing.push(feedback);
    learningData.set(normalized, existing);
}

/**
 * Get category insights
 */
export function getCategoryInsights(
    transactions: { categoryId: string; merchant: string; amount: number; date: Date }[],
    months: number = 3
): CategoryInsight[] {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const filtered = transactions.filter(t => t.date >= cutoff && t.amount < 0);
    const insights: Map<string, CategoryInsight> = new Map();

    for (const tx of filtered) {
        const category = getCategory(tx.categoryId);
        if (!category) continue;

        let insight = insights.get(tx.categoryId);
        if (!insight) {
            insight = {
                categoryId: tx.categoryId,
                categoryName: category.name,
                totalSpent: 0,
                transactionCount: 0,
                averageTransaction: 0,
                trend: 'stable',
                trendPercent: 0,
                topMerchants: [],
                monthlyBreakdown: [],
            };
            insights.set(tx.categoryId, insight);
        }

        insight.totalSpent += Math.abs(tx.amount);
        insight.transactionCount++;
    }

    // Calculate averages and finalize
    for (const insight of insights.values()) {
        insight.averageTransaction = insight.transactionCount > 0
            ? insight.totalSpent / insight.transactionCount
            : 0;
        insight.totalSpent = Math.round(insight.totalSpent * 100) / 100;
        insight.averageTransaction = Math.round(insight.averageTransaction * 100) / 100;
    }

    return Array.from(insights.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Bulk categorize transactions
 */
export function bulkCategorize(
    transactions: { id: string; merchantName: string; amount: number }[],
    userId?: string
): { transactionId: string; result: CategorizationResult }[] {
    return transactions.map(tx => ({
        transactionId: tx.id,
        result: categorizeTransaction(tx.merchantName, tx.amount, userId),
    }));
}

export default {
    categorizeTransaction,
    bulkCategorize,
    getCategory,
    getAllCategories,
    createCustomCategory,
    createCategoryRule,
    learnFromCorrection,
    getCategoryInsights,
    SYSTEM_CATEGORIES,
};
