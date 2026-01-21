/**
 * Business Expense Categorization & Tax Tools
 * 
 * Automatic business expense detection, categorization,
 * and tax deduction tracking for self-employed users.
 * 
 * Super-Sprint 5: Phases 401-450
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// IRS expense categories for Schedule C
export const TAX_CATEGORIES = {
    advertising: { name: 'Advertising', line: '8', deductible: true },
    car_and_truck: { name: 'Car and truck expenses', line: '9', deductible: true },
    commissions: { name: 'Commissions and fees', line: '10', deductible: true },
    contract_labor: { name: 'Contract labor', line: '11', deductible: true },
    depreciation: { name: 'Depreciation', line: '13', deductible: true },
    insurance: { name: 'Insurance (other than health)', line: '15', deductible: true },
    interest_mortgage: { name: 'Interest: Mortgage', line: '16a', deductible: true },
    interest_other: { name: 'Interest: Other', line: '16b', deductible: true },
    legal_professional: { name: 'Legal and professional services', line: '17', deductible: true },
    office_expense: { name: 'Office expense', line: '18', deductible: true },
    pension_plans: { name: 'Pension and profit-sharing plans', line: '19', deductible: true },
    rent_equipment: { name: 'Rent: Vehicles, machinery, equipment', line: '20a', deductible: true },
    rent_property: { name: 'Rent: Business property', line: '20b', deductible: true },
    repairs: { name: 'Repairs and maintenance', line: '21', deductible: true },
    supplies: { name: 'Supplies', line: '22', deductible: true },
    taxes_licenses: { name: 'Taxes and licenses', line: '23', deductible: true },
    travel: { name: 'Travel', line: '24a', deductible: true },
    meals: { name: 'Meals (50% deductible)', line: '24b', deductible: true, partialRate: 0.5 },
    utilities: { name: 'Utilities', line: '25', deductible: true },
    wages: { name: 'Wages', line: '26', deductible: true },
    home_office: { name: 'Home office', line: '30', deductible: true },
    other: { name: 'Other expenses', line: '27', deductible: true },
    non_deductible: { name: 'Non-deductible', line: null, deductible: false },
};

export type TaxCategory = keyof typeof TAX_CATEGORIES;

export interface Transaction {
    id: string;
    merchantName: string;
    amount: number;
    date: Date;
    originalCategory?: string;
}

export interface BusinessExpense {
    transactionId: string;
    merchantName: string;
    amount: number;
    date: Date;
    taxCategory: TaxCategory;
    businessPercentage: number; // 0-100
    deductibleAmount: number;
    notes?: string;
    isVerified: boolean;
    confidence: number;
}

export interface TaxSummary {
    totalExpenses: number;
    totalDeductible: number;
    byCategory: {
        category: TaxCategory;
        name: string;
        amount: number;
        deductible: number;
        count: number;
        line: string | null;
    }[];
    estimatedTaxSavings: number;
    quarterlyEstimate: number;
    year: number;
    generatedAt: Date;
}

// Keywords for business expense detection
const BUSINESS_KEYWORDS: Record<TaxCategory, string[]> = {
    advertising: ['facebook ads', 'google ads', 'meta business', 'linkedin ads', 'advertisement', 'promotion'],
    car_and_truck: ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'car wash', 'parking'],
    commissions: ['stripe fees', 'paypal fees', 'square fees', 'merchant fees'],
    contract_labor: ['fiverr', 'upwork', 'freelancer', 'contractor', '1099'],
    depreciation: [],
    insurance: ['business insurance', 'liability insurance', 'e&o insurance'],
    interest_mortgage: [],
    interest_other: [],
    legal_professional: ['attorney', 'lawyer', 'accountant', 'cpa', 'bookkeeper', 'legal zoom'],
    office_expense: ['office depot', 'staples', 'paper', 'toner', 'printer'],
    pension_plans: [],
    rent_equipment: ['equipment rental', 'tool rental'],
    rent_property: ['coworking', 'wework', 'regus', 'office rent'],
    repairs: ['repair', 'maintenance', 'fix'],
    supplies: ['amazon business', 'wholesale', 'bulk'],
    taxes_licenses: ['license fee', 'business license', 'permit'],
    travel: ['united', 'delta', 'american airlines', 'southwest', 'hotel', 'marriott', 'hilton', 'airbnb', 'expedia'],
    meals: ['restaurant', 'grubhub', 'doordash', 'uber eats', 'lunch', 'dinner'],
    utilities: ['internet', 'phone', 'xfinity', 'verizon', 'at&t'],
    wages: ['payroll', 'gusto', 'adp'],
    home_office: [],
    other: [],
    non_deductible: ['personal', 'grocery', 'entertainment'],
};

/**
 * Detect if a transaction is likely a business expense
 */
export function detectBusinessExpense(transaction: Transaction): {
    isLikelyBusiness: boolean;
    suggestedCategory: TaxCategory;
    confidence: number;
} {
    const name = transaction.merchantName.toLowerCase();

    for (const [category, keywords] of Object.entries(BUSINESS_KEYWORDS)) {
        for (const keyword of keywords) {
            if (name.includes(keyword.toLowerCase())) {
                const taxCat = category as TaxCategory;
                // Non-deductible = not business
                if (taxCat === 'non_deductible') {
                    return { isLikelyBusiness: false, suggestedCategory: taxCat, confidence: 0.8 };
                }
                return { isLikelyBusiness: true, suggestedCategory: taxCat, confidence: 0.75 };
            }
        }
    }

    // Default to uncertain
    return { isLikelyBusiness: false, suggestedCategory: 'other', confidence: 0.3 };
}

/**
 * Use AI to categorize a business expense
 */
async function aiCategorizeExpense(transaction: Transaction): Promise<{
    category: TaxCategory;
    confidence: number;
    reasoning: string;
}> {
    const categories = Object.entries(TAX_CATEGORIES)
        .filter(([, v]) => v.deductible)
        .map(([k, v]) => `${k}: ${v.name}`)
        .join('\n');

    const prompt = `Categorize this business expense for tax purposes:
Merchant: ${transaction.merchantName}
Amount: $${transaction.amount}
Date: ${transaction.date}

Available categories:
${categories}

Respond in JSON format: {"category": "category_key", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 150 },
        });

        const text = result.response.text() || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                category: parsed.category as TaxCategory || 'other',
                confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
                reasoning: parsed.reasoning || '',
            };
        }
    } catch (error) {
        console.error('AI categorization failed:', error);
    }

    // Fallback
    const detection = detectBusinessExpense(transaction);
    return {
        category: detection.suggestedCategory,
        confidence: detection.confidence,
        reasoning: 'Categorized by keyword matching',
    };
}

/**
 * Process transactions and categorize as business expenses
 */
export async function categorizeBusinessExpenses(
    transactions: Transaction[],
    useAI: boolean = true
): Promise<BusinessExpense[]> {
    const expenses: BusinessExpense[] = [];

    for (const tx of transactions) {
        const detection = detectBusinessExpense(tx);

        let category: TaxCategory;
        let confidence: number;

        if (useAI && detection.confidence < 0.7) {
            const aiResult = await aiCategorizeExpense(tx);
            category = aiResult.category;
            confidence = aiResult.confidence;
        } else {
            category = detection.suggestedCategory;
            confidence = detection.confidence;
        }

        if (category === 'non_deductible') continue;

        const taxInfo = TAX_CATEGORIES[category] as { partialRate?: number };
        const partialRate = taxInfo.partialRate || 1;
        const deductibleAmount = Math.abs(tx.amount) * partialRate;

        expenses.push({
            transactionId: tx.id,
            merchantName: tx.merchantName,
            amount: Math.abs(tx.amount),
            date: new Date(tx.date),
            taxCategory: category,
            businessPercentage: 100,
            deductibleAmount: Math.round(deductibleAmount * 100) / 100,
            isVerified: false,
            confidence,
        });
    }

    return expenses;
}

/**
 * Generate tax summary
 */
export function generateTaxSummary(
    expenses: BusinessExpense[],
    year: number,
    taxBracket: number = 0.24
): TaxSummary {
    const byCategory: Map<TaxCategory, { amount: number; deductible: number; count: number }> = new Map();

    let totalExpenses = 0;
    let totalDeductible = 0;

    for (const expense of expenses) {
        if (new Date(expense.date).getFullYear() !== year) continue;

        totalExpenses += expense.amount;
        totalDeductible += expense.deductibleAmount;

        const current = byCategory.get(expense.taxCategory) || { amount: 0, deductible: 0, count: 0 };
        current.amount += expense.amount;
        current.deductible += expense.deductibleAmount;
        current.count++;
        byCategory.set(expense.taxCategory, current);
    }

    const categorySummary = Array.from(byCategory.entries()).map(([cat, data]) => ({
        category: cat,
        name: TAX_CATEGORIES[cat].name,
        amount: Math.round(data.amount * 100) / 100,
        deductible: Math.round(data.deductible * 100) / 100,
        count: data.count,
        line: TAX_CATEGORIES[cat].line,
    })).sort((a, b) => b.deductible - a.deductible);

    const estimatedTaxSavings = Math.round(totalDeductible * taxBracket * 100) / 100;
    const quarterlyEstimate = Math.round(estimatedTaxSavings / 4 * 100) / 100;

    return {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalDeductible: Math.round(totalDeductible * 100) / 100,
        byCategory: categorySummary,
        estimatedTaxSavings,
        quarterlyEstimate,
        year,
        generatedAt: new Date(),
    };
}

/**
 * Calculate quarterly estimated tax payment
 */
export function calculateQuarterlyEstimate(
    annualIncome: number,
    totalDeductions: number,
    taxBracket: number = 0.24,
    selfEmploymentRate: number = 0.153
): {
    taxableIncome: number;
    incomeTax: number;
    selfEmploymentTax: number;
    totalTax: number;
    quarterlyPayment: number;
} {
    const taxableIncome = Math.max(0, annualIncome - totalDeductions);
    const incomeTax = taxableIncome * taxBracket;
    const selfEmploymentTax = annualIncome * selfEmploymentRate;
    const totalTax = incomeTax + selfEmploymentTax;
    const quarterlyPayment = totalTax / 4;

    return {
        taxableIncome: Math.round(taxableIncome),
        incomeTax: Math.round(incomeTax),
        selfEmploymentTax: Math.round(selfEmploymentTax),
        totalTax: Math.round(totalTax),
        quarterlyPayment: Math.round(quarterlyPayment),
    };
}

export default {
    detectBusinessExpense,
    categorizeBusinessExpenses,
    generateTaxSummary,
    calculateQuarterlyEstimate,
    TAX_CATEGORIES,
};
