/**
 * Bill Negotiator Agent
 * 
 * Analyzes recurring bills and identifies negotiation opportunities.
 * Uses AI to suggest negotiation strategies and potential savings.
 * 
 * Phase 1-5 of Sprint 1.1
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Known negotiable bill categories with typical savings ranges
const NEGOTIABLE_CATEGORIES: Record<string, { averageSavings: number; maxSavings: number; difficulty: 'easy' | 'medium' | 'hard' }> = {
    'cable_internet': { averageSavings: 20, maxSavings: 50, difficulty: 'easy' },
    'phone_mobile': { averageSavings: 15, maxSavings: 40, difficulty: 'easy' },
    'insurance_auto': { averageSavings: 100, maxSavings: 300, difficulty: 'medium' },
    'insurance_home': { averageSavings: 80, maxSavings: 250, difficulty: 'medium' },
    'utilities': { averageSavings: 10, maxSavings: 30, difficulty: 'hard' },
    'gym_fitness': { averageSavings: 10, maxSavings: 25, difficulty: 'easy' },
    'streaming': { averageSavings: 3, maxSavings: 10, difficulty: 'easy' },
    'credit_card_fees': { averageSavings: 50, maxSavings: 150, difficulty: 'medium' },
    'bank_fees': { averageSavings: 12, maxSavings: 30, difficulty: 'easy' },
    'medical_bills': { averageSavings: 100, maxSavings: 500, difficulty: 'medium' },
};

// Vendor competitor mapping for price comparison
const VENDOR_COMPETITORS: Record<string, string[]> = {
    'comcast': ['Verizon Fios', 'AT&T', 'T-Mobile Home Internet', 'Starlink'],
    'xfinity': ['Verizon Fios', 'AT&T', 'T-Mobile Home Internet', 'Starlink'],
    'spectrum': ['AT&T', 'Verizon', 'T-Mobile Home Internet', 'Starlink'],
    'att': ['Verizon', 'T-Mobile', 'Xfinity', 'Spectrum'],
    'verizon': ['AT&T', 'T-Mobile', 'Xfinity'],
    't-mobile': ['AT&T', 'Verizon', 'US Cellular'],
    'state_farm': ['Geico', 'Progressive', 'Liberty Mutual', 'Allstate'],
    'geico': ['State Farm', 'Progressive', 'Liberty Mutual', 'USAA'],
    'progressive': ['Geico', 'State Farm', 'Allstate', 'Liberty Mutual'],
    'netflix': ['Hulu', 'Disney+', 'HBO Max', 'Amazon Prime Video'],
    'hulu': ['Netflix', 'Disney+', 'Peacock', 'Paramount+'],
    'planet_fitness': ['YMCA', 'Anytime Fitness', 'LA Fitness'],
};

export interface Bill {
    id: string;
    name: string;
    vendor: string;
    amount: number;
    category: string;
    frequency: 'monthly' | 'quarterly' | 'annually';
    dueDate?: string;
    lastPaymentDate?: string;
    accountAge?: number; // months as customer
    autoPayEnabled?: boolean;
}

export interface NegotiationOpportunity {
    billId: string;
    billName: string;
    vendor: string;
    currentAmount: number;
    estimatedSavings: {
        low: number;
        high: number;
        monthly: number;
        annual: number;
    };
    confidence: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    competitors: string[];
    negotiationScript: string;
    bestTimeToCall: string;
    keyPoints: string[];
    successRate: number; // percentage
}

export interface BillNegotiatorResult {
    opportunities: NegotiationOpportunity[];
    totalPotentialSavings: {
        monthly: number;
        annual: number;
    };
    prioritizedActions: string[];
    timestamp: Date;
}

/**
 * Categorize a bill based on its name and vendor
 */
function categorizeBill(bill: Bill): string {
    const name = bill.name.toLowerCase();
    const vendor = bill.vendor.toLowerCase();
    const combined = `${name} ${vendor}`;

    if (combined.includes('internet') || combined.includes('cable') || combined.includes('wifi') ||
        combined.includes('comcast') || combined.includes('xfinity') || combined.includes('spectrum')) {
        return 'cable_internet';
    }
    if (combined.includes('phone') || combined.includes('mobile') || combined.includes('wireless') ||
        combined.includes('verizon') || combined.includes('at&t') || combined.includes('t-mobile')) {
        return 'phone_mobile';
    }
    if (combined.includes('auto insurance') || combined.includes('car insurance')) {
        return 'insurance_auto';
    }
    if (combined.includes('home insurance') || combined.includes('homeowner') || combined.includes('renters')) {
        return 'insurance_home';
    }
    if (combined.includes('electric') || combined.includes('gas') || combined.includes('water') ||
        combined.includes('utility')) {
        return 'utilities';
    }
    if (combined.includes('gym') || combined.includes('fitness') || combined.includes('planet') ||
        combined.includes('ymca')) {
        return 'gym_fitness';
    }
    if (combined.includes('netflix') || combined.includes('hulu') || combined.includes('disney') ||
        combined.includes('hbo') || combined.includes('streaming')) {
        return 'streaming';
    }
    if (combined.includes('credit card') || combined.includes('annual fee')) {
        return 'credit_card_fees';
    }
    if (combined.includes('bank') || combined.includes('checking') || combined.includes('savings fee')) {
        return 'bank_fees';
    }
    if (combined.includes('medical') || combined.includes('hospital') || combined.includes('doctor')) {
        return 'medical_bills';
    }

    return 'other';
}

/**
 * Get competitors for a vendor
 */
function getCompetitors(vendor: string): string[] {
    const normalizedVendor = vendor.toLowerCase().replace(/[^a-z]/g, '_');

    for (const [key, competitors] of Object.entries(VENDOR_COMPETITORS)) {
        if (normalizedVendor.includes(key) || key.includes(normalizedVendor)) {
            return competitors;
        }
    }

    return [];
}

/**
 * Calculate confidence score for negotiation success
 */
function calculateConfidence(bill: Bill, category: string): { confidence: 'high' | 'medium' | 'low'; successRate: number } {
    let score = 50; // Base score

    // Long-term customers have more leverage
    if (bill.accountAge) {
        if (bill.accountAge > 24) score += 20;
        else if (bill.accountAge > 12) score += 10;
    }

    // Category difficulty affects success rate
    const categoryInfo = NEGOTIABLE_CATEGORIES[category];
    if (categoryInfo) {
        if (categoryInfo.difficulty === 'easy') score += 15;
        else if (categoryInfo.difficulty === 'medium') score += 5;
        else score -= 10;
    }

    // Having competitors increases leverage
    const competitors = getCompetitors(bill.vendor);
    if (competitors.length > 3) score += 15;
    else if (competitors.length > 0) score += 10;

    // Calculate final confidence
    const successRate = Math.min(95, Math.max(20, score));
    let confidence: 'high' | 'medium' | 'low';

    if (successRate >= 70) confidence = 'high';
    else if (successRate >= 50) confidence = 'medium';
    else confidence = 'low';

    return { confidence, successRate };
}

/**
 * Generate AI-powered negotiation script
 */
async function generateNegotiationScript(bill: Bill, competitors: string[]): Promise<string> {
    const prompt = `Generate a concise, friendly negotiation script for calling ${bill.vendor} to lower a ${bill.name} bill currently at $${bill.amount}/month. 
  
Key points to include:
- Mention being a loyal customer
- Reference competitor prices: ${competitors.join(', ')}
- Ask about retention offers or promotions
- Be polite but firm

Keep the script under 150 words and focus on the key phrases to use.`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 256,
            },
        });

        const response = await result.response;
        return response.text() || getDefaultScript(bill, competitors);
    } catch (error) {
        console.error('Failed to generate script:', error);
        return getDefaultScript(bill, competitors);
    }
}

/**
 * Fallback negotiation script
 */
function getDefaultScript(bill: Bill, competitors: string[]): string {
    return `Hi, I've been a loyal ${bill.vendor} customer and I'm reviewing my monthly expenses. I noticed that ${competitors[0] || 'other providers'} is offering competitive rates. I'd like to see if there are any promotions or loyalty discounts available to help lower my current $${bill.amount}/month bill. Can you connect me with your retention department or check for any available offers?`;
}

/**
 * Get best time to call based on vendor type
 */
function getBestTimeToCall(category: string): string {
    switch (category) {
        case 'cable_internet':
        case 'phone_mobile':
            return 'Tuesday-Thursday, 10am-12pm or 2pm-4pm (avoid Mondays and end of month)';
        case 'insurance_auto':
        case 'insurance_home':
            return 'Mid-week mornings, avoid month-end and policy renewal dates';
        case 'bank_fees':
        case 'credit_card_fees':
            return 'Early morning right when customer service opens';
        default:
            return 'Tuesday-Thursday, mid-morning for shortest wait times';
    }
}

/**
 * Get key negotiation points for a category
 */
function getKeyPoints(category: string, bill: Bill): string[] {
    const basePoints = [
        'Ask for the retention or loyalty department',
        'Mention you\'re considering switching providers',
        'Ask what promotions are available for existing customers',
    ];

    switch (category) {
        case 'cable_internet':
            return [
                ...basePoints,
                'Ask about promotional rates for new customers (request the same)',
                'Consider downgrading speed if you don\'t need maximum tier',
                'Ask about bundling discounts',
            ];
        case 'phone_mobile':
            return [
                ...basePoints,
                'Inquire about family plans or multi-line discounts',
                'Ask about autopay discounts',
                'Consider prepaid options for significant savings',
            ];
        case 'insurance_auto':
        case 'insurance_home':
            return [
                ...basePoints,
                'Get quotes from 3+ competitors before calling',
                'Ask about bundling auto and home insurance',
                'Inquire about safe driver or claims-free discounts',
                'Check if professional affiliations qualify for discounts',
            ];
        case 'gym_fitness':
            return [
                'Ask about annual prepay discounts (often 20-30% off)',
                'Mention you\'re considering freezing or canceling',
                'Ask about corporate partnership rates',
            ];
        default:
            return basePoints;
    }
}

/**
 * Main function to analyze bills and find negotiation opportunities
 */
export async function analyzeBillsForNegotiation(bills: Bill[]): Promise<BillNegotiatorResult> {
    const opportunities: NegotiationOpportunity[] = [];
    let totalMonthly = 0;
    let totalAnnual = 0;

    for (const bill of bills) {
        const category = categorizeBill(bill);
        const categoryInfo = NEGOTIABLE_CATEGORIES[category];

        // Skip non-negotiable categories
        if (!categoryInfo) continue;

        const competitors = getCompetitors(bill.vendor);
        const { confidence, successRate } = calculateConfidence(bill, category);

        // Calculate potential savings
        const lowSavings = Math.round(bill.amount * (categoryInfo.averageSavings / 100));
        const highSavings = Math.min(
            Math.round(bill.amount * (categoryInfo.maxSavings / 100)),
            bill.amount * 0.5 // Cap at 50% reduction
        );

        // Generate negotiation script (in parallel for performance)
        const script = await generateNegotiationScript(bill, competitors);

        const opportunity: NegotiationOpportunity = {
            billId: bill.id,
            billName: bill.name,
            vendor: bill.vendor,
            currentAmount: bill.amount,
            estimatedSavings: {
                low: lowSavings,
                high: highSavings,
                monthly: Math.round((lowSavings + highSavings) / 2),
                annual: Math.round((lowSavings + highSavings) / 2) * 12,
            },
            confidence,
            difficulty: categoryInfo.difficulty,
            competitors,
            negotiationScript: script,
            bestTimeToCall: getBestTimeToCall(category),
            keyPoints: getKeyPoints(category, bill),
            successRate,
        };

        opportunities.push(opportunity);
        totalMonthly += opportunity.estimatedSavings.monthly;
        totalAnnual += opportunity.estimatedSavings.annual;
    }

    // Sort by potential savings (highest first)
    opportunities.sort((a, b) => b.estimatedSavings.annual - a.estimatedSavings.annual);

    // Generate prioritized action list
    const prioritizedActions = opportunities
        .filter(o => o.confidence !== 'low')
        .slice(0, 3)
        .map((o, i) => `${i + 1}. Call ${o.vendor} about your ${o.billName} - potential savings: $${o.estimatedSavings.monthly}/mo`);

    return {
        opportunities,
        totalPotentialSavings: {
            monthly: totalMonthly,
            annual: totalAnnual,
        },
        prioritizedActions,
        timestamp: new Date(),
    };
}

/**
 * Get a quick summary of negotiation opportunities
 */
export async function getQuickNegotiationSummary(bills: Bill[]): Promise<{
    opportunityCount: number;
    potentialMonthlySavings: number;
    topOpportunity: string | null;
}> {
    const result = await analyzeBillsForNegotiation(bills);

    return {
        opportunityCount: result.opportunities.length,
        potentialMonthlySavings: result.totalPotentialSavings.monthly,
        topOpportunity: result.opportunities.length > 0
            ? `${result.opportunities[0].vendor} - up to $${result.opportunities[0].estimatedSavings.high}/mo`
            : null,
    };
}

export default {
    analyzeBillsForNegotiation,
    getQuickNegotiationSummary,
};
