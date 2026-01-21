/**
 * Document & Receipt Management System
 * 
 * Handles receipt scanning, document storage, and OCR extraction.
 * Supports categorization and linking to transactions.
 * 
 * Super-Sprint 13: Phases 1201-1250
 */

export interface Document {
    id: string;
    userId: string;
    type: 'receipt' | 'invoice' | 'statement' | 'tax_form' | 'contract' | 'other';
    filename: string;
    mimeType: string;
    size: number;
    storagePath: string;
    thumbnailPath?: string;
    extractedData?: ExtractedDocumentData;
    transactionId?: string;
    categoryId?: string;
    tags: string[];
    year?: number;
    month?: number;
    isProcessed: boolean;
    uploadedAt: Date;
    processedAt?: Date;
}

export interface ExtractedDocumentData {
    vendor?: string;
    amount?: number;
    currency?: string;
    date?: Date;
    items?: { description: string; quantity?: number; amount: number }[];
    taxAmount?: number;
    subtotal?: number;
    total?: number;
    paymentMethod?: string;
    receiptNumber?: string;
    category?: string;
    rawText?: string;
    confidence: number;
}

export interface DocumentUploadResult {
    document: Document;
    extractedData?: ExtractedDocumentData;
    matchedTransaction?: { id: string; merchant: string; amount: number };
    suggestedCategory?: string;
}

export interface DocumentSearchParams {
    userId: string;
    type?: Document['type'];
    tags?: string[];
    year?: number;
    month?: number;
    transactionId?: string;
    query?: string;
    limit?: number;
    offset?: number;
}

// In-memory store (production would use cloud storage + database)
const documents: Map<string, Document> = new Map();

/**
 * Common receipt patterns for extraction
 */
const VENDOR_PATTERNS = [
    { pattern: /walmart/i, vendor: 'Walmart', category: 'shopping' },
    { pattern: /target/i, vendor: 'Target', category: 'shopping' },
    { pattern: /amazon/i, vendor: 'Amazon', category: 'shopping' },
    { pattern: /starbucks/i, vendor: 'Starbucks', category: 'food_drink' },
    { pattern: /mcdonald/i, vendor: "McDonald's", category: 'food_drink' },
    { pattern: /uber eats/i, vendor: 'Uber Eats', category: 'food_drink' },
    { pattern: /doordash/i, vendor: 'DoorDash', category: 'food_drink' },
    { pattern: /gas|shell|chevron|exxon|bp/i, vendor: 'Gas Station', category: 'transportation' },
    { pattern: /cvs|walgreens/i, vendor: 'Pharmacy', category: 'healthcare' },
];

/**
 * Extract amount from text
 */
function extractAmount(text: string): { amount: number; currency: string } | null {
    // Match various currency formats
    const patterns = [
        /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
        /amount[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    ];

    let maxAmount = 0;
    for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (amount > maxAmount) {
                maxAmount = amount;
            }
        }
    }

    return maxAmount > 0 ? { amount: maxAmount, currency: 'USD' } : null;
}

/**
 * Extract date from text
 */
function extractDate(text: string): Date | null {
    const patterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        /(\w{3,9})\s+(\d{1,2}),?\s+(\d{4})/i,
        /(\d{1,2})\s+(\w{3,9})\s+(\d{4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                const date = new Date(match[0]);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            } catch {
                continue;
            }
        }
    }

    return null;
}

/**
 * Extract vendor from text
 */
function extractVendor(text: string): { vendor: string; category: string } | null {
    for (const { pattern, vendor, category } of VENDOR_PATTERNS) {
        if (pattern.test(text)) {
            return { vendor, category };
        }
    }

    // Try to extract from first line (often contains store name)
    const firstLine = text.split('\n')[0]?.trim();
    if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
        return { vendor: firstLine, category: 'other' };
    }

    return null;
}

/**
 * Extract line items from receipt text
 */
function extractLineItems(text: string): { description: string; amount: number }[] {
    const items: { description: string; amount: number }[] = [];
    const lines = text.split('\n');

    const itemPattern = /^(.{3,40})\s+\$?(\d+\.\d{2})\s*$/;

    for (const line of lines) {
        const match = line.trim().match(itemPattern);
        if (match) {
            const description = match[1].trim();
            const amount = parseFloat(match[2]);

            // Skip totals, subtotals, tax lines
            if (!/total|subtotal|tax|change|cash|credit|debit/i.test(description)) {
                items.push({ description, amount });
            }
        }
    }

    return items;
}

/**
 * Process document and extract data (simulated OCR)
 */
export async function processDocument(
    document: Document,
    rawText: string
): Promise<ExtractedDocumentData> {
    const amountData = extractAmount(rawText);
    const dateData = extractDate(rawText);
    const vendorData = extractVendor(rawText);
    const items = extractLineItems(rawText);

    // Calculate subtotal and tax if possible
    const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
    const total = amountData?.amount || 0;
    const taxAmount = total > itemsTotal ? total - itemsTotal : undefined;

    // Calculate confidence based on what was extracted
    let confidence = 0.5;
    if (amountData) confidence += 0.2;
    if (dateData) confidence += 0.15;
    if (vendorData) confidence += 0.1;
    if (items.length > 0) confidence += 0.05;

    return {
        vendor: vendorData?.vendor,
        amount: amountData?.amount,
        currency: amountData?.currency || 'USD',
        date: dateData || undefined,
        items: items.length > 0 ? items : undefined,
        taxAmount,
        subtotal: itemsTotal > 0 ? itemsTotal : undefined,
        total,
        category: vendorData?.category,
        rawText,
        confidence: Math.min(1, confidence),
    };
}

/**
 * Upload and process a document
 */
export async function uploadDocument(params: {
    userId: string;
    filename: string;
    mimeType: string;
    size: number;
    type: Document['type'];
    tags?: string[];
    rawText?: string;
}): Promise<DocumentUploadResult> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const document: Document = {
        id,
        userId: params.userId,
        type: params.type,
        filename: params.filename,
        mimeType: params.mimeType,
        size: params.size,
        storagePath: `/documents/${params.userId}/${id}/${params.filename}`,
        tags: params.tags || [],
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        isProcessed: false,
        uploadedAt: now,
    };

    documents.set(id, document);

    let extractedData: ExtractedDocumentData | undefined;
    let suggestedCategory: string | undefined;

    // Process if text is provided (from OCR)
    if (params.rawText) {
        extractedData = await processDocument(document, params.rawText);
        document.extractedData = extractedData;
        document.isProcessed = true;
        document.processedAt = new Date();
        suggestedCategory = extractedData.category;

        // Update year/month from extracted date if available
        if (extractedData.date) {
            document.year = extractedData.date.getFullYear();
            document.month = extractedData.date.getMonth() + 1;
        }
    }

    return {
        document,
        extractedData,
        suggestedCategory,
    };
}

/**
 * Link document to transaction
 */
export function linkToTransaction(documentId: string, transactionId: string): boolean {
    const document = documents.get(documentId);
    if (!document) return false;

    document.transactionId = transactionId;
    return true;
}

/**
 * Search documents
 */
export function searchDocuments(params: DocumentSearchParams): Document[] {
    let results = Array.from(documents.values())
        .filter(d => d.userId === params.userId);

    if (params.type) {
        results = results.filter(d => d.type === params.type);
    }
    if (params.year) {
        results = results.filter(d => d.year === params.year);
    }
    if (params.month) {
        results = results.filter(d => d.month === params.month);
    }
    if (params.transactionId) {
        results = results.filter(d => d.transactionId === params.transactionId);
    }
    if (params.tags && params.tags.length > 0) {
        results = results.filter(d =>
            params.tags!.some(tag => d.tags.includes(tag))
        );
    }
    if (params.query) {
        const q = params.query.toLowerCase();
        results = results.filter(d =>
            d.filename.toLowerCase().includes(q) ||
            d.extractedData?.vendor?.toLowerCase().includes(q) ||
            d.extractedData?.rawText?.toLowerCase().includes(q) ||
            d.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    results.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    const offset = params.offset || 0;
    const limit = params.limit || 50;
    return results.slice(offset, offset + limit);
}

/**
 * Get document by ID
 */
export function getDocument(documentId: string): Document | null {
    return documents.get(documentId) || null;
}

/**
 * Delete document
 */
export function deleteDocument(documentId: string): boolean {
    return documents.delete(documentId);
}

/**
 * Get documents for tax year
 */
export function getTaxYearDocuments(userId: string, year: number): Document[] {
    return Array.from(documents.values())
        .filter(d =>
            d.userId === userId &&
            d.year === year &&
            ['receipt', 'invoice', 'tax_form', 'statement'].includes(d.type)
        )
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/**
 * Get document statistics
 */
export function getDocumentStats(userId: string): {
    total: number;
    byType: Record<string, number>;
    byYear: Record<number, number>;
    totalSize: number;
    processedCount: number;
} {
    const userDocs = Array.from(documents.values())
        .filter(d => d.userId === userId);

    const byType: Record<string, number> = {};
    const byYear: Record<number, number> = {};
    let totalSize = 0;
    let processedCount = 0;

    for (const doc of userDocs) {
        byType[doc.type] = (byType[doc.type] || 0) + 1;
        if (doc.year) {
            byYear[doc.year] = (byYear[doc.year] || 0) + 1;
        }
        totalSize += doc.size;
        if (doc.isProcessed) processedCount++;
    }

    return {
        total: userDocs.length,
        byType,
        byYear,
        totalSize,
        processedCount,
    };
}

export default {
    uploadDocument,
    processDocument,
    linkToTransaction,
    searchDocuments,
    getDocument,
    deleteDocument,
    getTaxYearDocuments,
    getDocumentStats,
};
