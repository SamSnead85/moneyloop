/**
 * Subscription Optimizer Agent
 * 
 * Detects duplicate, unused, and overpriced subscriptions.
 * Suggests alternatives and tracks free trial expirations.
 * 
 * Phase 6-10 of Sprint 1.1
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Subscription service categories and alternatives
const SERVICE_CATEGORIES: Record<string, {
    services: string[];
    alternatives: { name: string; price: number; features: string[] }[];
}> = {
    video_streaming: {
        services: ['netflix', 'hulu', 'disney+', 'disney plus', 'hbo', 'hbo max', 'max', 'amazon prime video', 'apple tv+', 'peacock', 'paramount+', 'paramount plus', 'discovery+', 'espn+'],
        alternatives: [
            { name: 'Netflix Basic with Ads', price: 6.99, features: ['Most content', 'Ad-supported'] },
            { name: 'Hulu Basic', price: 7.99, features: ['Current TV', 'Ad-supported'] },
            { name: 'Peacock Premium', price: 5.99, features: ['NBC content', 'Live sports'] },
        ],
    },
    music_streaming: {
        services: ['spotify', 'apple music', 'youtube music', 'amazon music', 'tidal', 'deezer', 'pandora'],
        alternatives: [
            { name: 'Spotify Free', price: 0, features: ['All music', 'Ad-supported'] },
            { name: 'YouTube Music Free', price: 0, features: ['Music videos', 'Ad-supported'] },
            { name: 'Amazon Music (with Prime)', price: 0, features: ['Limited selection', 'With Prime membership'] },
        ],
    },
    cloud_storage: {
        services: ['dropbox', 'google one', 'icloud', 'onedrive', 'box'],
        alternatives: [
            { name: 'Google Drive Free', price: 0, features: ['15GB free'] },
            { name: 'iCloud+ 50GB', price: 0.99, features: ['Apple ecosystem', '50GB'] },
            { name: 'OneDrive (Microsoft 365)', price: 6.99, features: ['1TB + Office apps'] },
        ],
    },
    productivity: {
        services: ['microsoft 365', 'microsoft office', 'notion', 'evernote', 'todoist', 'asana', 'monday', 'clickup'],
        alternatives: [
            { name: 'Google Workspace (Free)', price: 0, features: ['Docs, Sheets, Slides', 'Free'] },
            { name: 'Notion Free', price: 0, features: ['Notes and projects', 'Personal use'] },
            { name: 'Microsoft 365 Basic', price: 1.99, features: ['100GB OneDrive', 'Web apps only'] },
        ],
    },
    fitness: {
        services: ['peloton', 'apple fitness+', 'nike training', 'strava', 'myfitnesspal', 'calm', 'headspace'],
        alternatives: [
            { name: 'YouTube Fitness', price: 0, features: ['Free workouts', 'Vast selection'] },
            { name: 'Nike Training Club', price: 0, features: ['Free workouts', 'Expert trainers'] },
            { name: 'Apple Fitness+', price: 10.99, features: ['Apple Watch integration', 'Wide variety'] },
        ],
    },
    news_media: {
        services: ['new york times', 'washington post', 'wall street journal', 'wsj', 'the athletic', 'substack', 'medium'],
        alternatives: [
            { name: 'Apple News+', price: 12.99, features: ['Hundreds of publications', 'Magazines included'] },
            { name: 'Library Card', price: 0, features: ['Free digital access', 'Many publications'] },
        ],
    },
    gaming: {
        services: ['xbox game pass', 'playstation plus', 'ps plus', 'nintendo online', 'ea play', 'ubisoft+'],
        alternatives: [
            { name: 'Xbox Game Pass Core', price: 9.99, features: ['Online multiplayer', 'Limited games'] },
            { name: 'Free-to-play games', price: 0, features: ['Fortnite, Apex, etc.'] },
        ],
    },
    security: {
        services: ['norton', 'mcafee', 'lastpass', '1password', 'dashlane', 'nordvpn', 'expressvpn', 'surfshark'],
        alternatives: [
            { name: 'Bitwarden Free', price: 0, features: ['Password manager', 'Unlimited passwords'] },
            { name: 'Windows Defender', price: 0, features: ['Built into Windows', 'Good protection'] },
            { name: 'ProtonVPN Free', price: 0, features: ['VPN', 'Limited servers'] },
        ],
    },
};

// Known bundle opportunities
const BUNDLE_OPPORTUNITIES = [
    { services: ['disney+', 'hulu', 'espn+'], bundle: 'Disney Bundle', savings: 7 },
    { services: ['apple music', 'apple tv+', 'apple arcade', 'icloud'], bundle: 'Apple One', savings: 8 },
    { services: ['youtube music', 'youtube premium'], bundle: 'YouTube Premium', savings: 3 },
    { services: ['amazon prime video', 'amazon music'], bundle: 'Amazon Prime', savings: 10 },
];

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'yearly' | 'weekly';
    category?: string;
    lastUsed?: Date;
    signupDate?: Date;
    freeTrialEnd?: Date;
    isActive: boolean;
    autoRenew?: boolean;
}

export interface SubscriptionIssue {
    type: 'unused' | 'duplicate' | 'overpriced' | 'trial_expiring' | 'bundle_opportunity';
    severity: 'high' | 'medium' | 'low';
    subscriptionId: string;
    subscriptionName: string;
    description: string;
    potentialSavings: number;
    recommendation: string;
    actionUrl?: string;
}

export interface SubscriptionOptimizerResult {
    issues: SubscriptionIssue[];
    totalMonthlySpend: number;
    potentialMonthlySavings: number;
    potentialAnnualSavings: number;
    unusedCount: number;
    duplicateGroups: string[][];
    alternatives: {
        current: string;
        alternative: string;
        savings: number;
    }[];
    summary: string;
    timestamp: Date;
}

/**
 * Normalize subscription name for matching
 */
function normalizeServiceName(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace('plus', '+');
}

/**
 * Get category for a subscription
 */
function getCategory(subscription: Subscription): string | null {
    const normalized = normalizeServiceName(subscription.name);

    for (const [category, { services }] of Object.entries(SERVICE_CATEGORIES)) {
        if (services.some(s => normalized.includes(normalizeServiceName(s)) ||
            normalizeServiceName(s).includes(normalized))) {
            return category;
        }
    }

    return null;
}

/**
 * Convert any frequency to monthly amount
 */
function toMonthlyAmount(amount: number, frequency: string): number {
    switch (frequency) {
        case 'yearly':
        case 'annually':
            return amount / 12;
        case 'weekly':
            return amount * 4.33;
        case 'quarterly':
            return amount / 3;
        default:
            return amount;
    }
}

/**
 * Detect unused subscriptions
 */
function findUnusedSubscriptions(subscriptions: Subscription[]): SubscriptionIssue[] {
    const issues: SubscriptionIssue[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const sub of subscriptions) {
        if (!sub.isActive || !sub.lastUsed) continue;

        const lastUsed = new Date(sub.lastUsed);
        const monthlyAmount = toMonthlyAmount(sub.amount, sub.frequency);

        if (lastUsed < sixtyDaysAgo) {
            issues.push({
                type: 'unused',
                severity: 'high',
                subscriptionId: sub.id,
                subscriptionName: sub.name,
                description: `You haven't used ${sub.name} in over 60 days`,
                potentialSavings: monthlyAmount * 12,
                recommendation: `Consider canceling ${sub.name} to save $${monthlyAmount.toFixed(2)}/month`,
            });
        } else if (lastUsed < thirtyDaysAgo) {
            issues.push({
                type: 'unused',
                severity: 'medium',
                subscriptionId: sub.id,
                subscriptionName: sub.name,
                description: `${sub.name} hasn't been used in over 30 days`,
                potentialSavings: monthlyAmount * 6,
                recommendation: `Review if you still need ${sub.name}`,
            });
        }
    }

    return issues;
}

/**
 * Find duplicate subscriptions in same category
 */
function findDuplicateSubscriptions(subscriptions: Subscription[]): {
    issues: SubscriptionIssue[];
    duplicateGroups: string[][];
} {
    const issues: SubscriptionIssue[] = [];
    const duplicateGroups: string[][] = [];
    const categoryMap: Record<string, Subscription[]> = {};

    // Group by category
    for (const sub of subscriptions) {
        if (!sub.isActive) continue;
        const category = getCategory(sub);
        if (category) {
            if (!categoryMap[category]) categoryMap[category] = [];
            categoryMap[category].push(sub);
        }
    }

    // Find duplicates
    for (const [category, subs] of Object.entries(categoryMap)) {
        if (subs.length > 1) {
            // Video streaming: 3+ is excessive
            // Others: 2+ is duplicate
            const threshold = category === 'video_streaming' ? 3 : 2;

            if (subs.length >= threshold) {
                const names = subs.map(s => s.name);
                duplicateGroups.push(names);

                // Calculate savings from keeping only the cheapest
                const monthlyAmounts = subs.map(s => toMonthlyAmount(s.amount, s.frequency));
                const cheapest = Math.min(...monthlyAmounts);
                const totalSpend = monthlyAmounts.reduce((a, b) => a + b, 0);
                const savings = totalSpend - cheapest;

                issues.push({
                    type: 'duplicate',
                    severity: 'high',
                    subscriptionId: subs[0].id,
                    subscriptionName: names.join(', '),
                    description: `You have ${subs.length} ${category.replace('_', ' ')} subscriptions`,
                    potentialSavings: savings * 12,
                    recommendation: `Consider keeping only your most-used service to save $${savings.toFixed(2)}/month`,
                });
            }
        }
    }

    return { issues, duplicateGroups };
}

/**
 * Find bundle opportunities
 */
function findBundleOpportunities(subscriptions: Subscription[]): SubscriptionIssue[] {
    const issues: SubscriptionIssue[] = [];
    const activeNames = subscriptions
        .filter(s => s.isActive)
        .map(s => normalizeServiceName(s.name));

    for (const bundle of BUNDLE_OPPORTUNITIES) {
        const matchedServices = bundle.services.filter(s =>
            activeNames.some(name => name.includes(normalizeServiceName(s)))
        );

        if (matchedServices.length >= 2) {
            issues.push({
                type: 'bundle_opportunity',
                severity: 'medium',
                subscriptionId: 'bundle',
                subscriptionName: matchedServices.join(' + '),
                description: `You could bundle ${matchedServices.join(', ')} into ${bundle.bundle}`,
                potentialSavings: bundle.savings * 12,
                recommendation: `Switch to ${bundle.bundle} to save approximately $${bundle.savings}/month`,
            });
        }
    }

    return issues;
}

/**
 * Find expiring free trials
 */
function findExpiringTrials(subscriptions: Subscription[]): SubscriptionIssue[] {
    const issues: SubscriptionIssue[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    for (const sub of subscriptions) {
        if (!sub.freeTrialEnd || !sub.isActive) continue;

        const trialEnd = new Date(sub.freeTrialEnd);
        if (trialEnd > now && trialEnd <= sevenDaysFromNow) {
            const monthlyAmount = toMonthlyAmount(sub.amount, sub.frequency);
            const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            issues.push({
                type: 'trial_expiring',
                severity: daysLeft <= 2 ? 'high' : 'medium',
                subscriptionId: sub.id,
                subscriptionName: sub.name,
                description: `${sub.name} free trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
                potentialSavings: monthlyAmount * 12,
                recommendation: `Cancel before ${trialEnd.toLocaleDateString()} to avoid charges of $${monthlyAmount.toFixed(2)}/month`,
            });
        }
    }

    return issues;
}

/**
 * Find cheaper alternatives
 */
function findCheaperAlternatives(subscriptions: Subscription[]): {
    current: string;
    alternative: string;
    savings: number;
}[] {
    const alternatives: { current: string; alternative: string; savings: number }[] = [];

    for (const sub of subscriptions) {
        if (!sub.isActive) continue;

        const category = getCategory(sub);
        if (!category) continue;

        const categoryInfo = SERVICE_CATEGORIES[category];
        if (!categoryInfo?.alternatives) continue;

        const monthlyAmount = toMonthlyAmount(sub.amount, sub.frequency);

        for (const alt of categoryInfo.alternatives) {
            if (alt.price < monthlyAmount - 2) { // At least $2 savings
                alternatives.push({
                    current: sub.name,
                    alternative: `${alt.name} ($${alt.price}/mo)`,
                    savings: monthlyAmount - alt.price,
                });
                break; // Only suggest one alternative per subscription
            }
        }
    }

    return alternatives;
}

/**
 * Generate AI summary of subscription issues
 */
async function generateSummary(
    totalSpend: number,
    potentialSavings: number,
    issueCount: number
): Promise<string> {
    if (issueCount === 0) {
        return `Your subscriptions look optimized! You're spending $${totalSpend.toFixed(2)}/month with no obvious issues.`;
    }

    const prompt = `Write a single sentence summary (max 30 words) about someone spending $${totalSpend.toFixed(2)}/month on subscriptions with potential savings of $${potentialSavings.toFixed(2)}/month across ${issueCount} issues. Be encouraging and actionable.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 64 },
        });
        return result.response.text() || `Found ${issueCount} opportunities to save $${potentialSavings.toFixed(2)}/month.`;
    } catch {
        return `Found ${issueCount} opportunities to save $${potentialSavings.toFixed(2)}/month on your subscriptions.`;
    }
}

/**
 * Main optimization function
 */
export async function optimizeSubscriptions(
    subscriptions: Subscription[]
): Promise<SubscriptionOptimizerResult> {
    // Calculate total spend
    const totalMonthlySpend = subscriptions
        .filter(s => s.isActive)
        .reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.frequency), 0);

    // Find all issues
    const unusedIssues = findUnusedSubscriptions(subscriptions);
    const { issues: duplicateIssues, duplicateGroups } = findDuplicateSubscriptions(subscriptions);
    const bundleIssues = findBundleOpportunities(subscriptions);
    const trialIssues = findExpiringTrials(subscriptions);
    const alternatives = findCheaperAlternatives(subscriptions);

    // Combine and sort issues
    const allIssues = [...unusedIssues, ...duplicateIssues, ...bundleIssues, ...trialIssues]
        .sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity] ||
                b.potentialSavings - a.potentialSavings;
        });

    // Calculate total potential savings
    const potentialAnnualSavings = allIssues.reduce((sum, i) => sum + i.potentialSavings, 0);
    const potentialMonthlySavings = potentialAnnualSavings / 12;

    // Generate summary
    const summary = await generateSummary(totalMonthlySpend, potentialMonthlySavings, allIssues.length);

    return {
        issues: allIssues,
        totalMonthlySpend,
        potentialMonthlySavings,
        potentialAnnualSavings,
        unusedCount: unusedIssues.length,
        duplicateGroups,
        alternatives,
        summary,
        timestamp: new Date(),
    };
}

/**
 * Quick subscription health check
 */
export async function getSubscriptionHealthScore(
    subscriptions: Subscription[]
): Promise<{ score: number; label: string; topIssue: string | null }> {
    const result = await optimizeSubscriptions(subscriptions);

    // Calculate health score (0-100)
    let score = 100;
    for (const issue of result.issues) {
        if (issue.severity === 'high') score -= 15;
        else if (issue.severity === 'medium') score -= 8;
        else score -= 3;
    }
    score = Math.max(0, Math.min(100, score));

    let label: string;
    if (score >= 90) label = 'Excellent';
    else if (score >= 70) label = 'Good';
    else if (score >= 50) label = 'Needs Attention';
    else label = 'Critical';

    const topIssue = result.issues.length > 0 ? result.issues[0].description : null;

    return { score, label, topIssue };
}

export default {
    optimizeSubscriptions,
    getSubscriptionHealthScore,
};
