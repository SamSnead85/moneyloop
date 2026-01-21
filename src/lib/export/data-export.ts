/**
 * Data Export System
 * 
 * Tax export, accountant packages, and backup functionality.
 * Supports multiple formats and scheduled exports.
 * 
 * Super-Sprint 18: Phases 1701-1750
 */

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx' | 'qbo' | 'ofx';
export type ExportType =
    | 'transactions'
    | 'all_data'
    | 'tax_package'
    | 'accountant_package'
    | 'category_report'
    | 'net_worth_history'
    | 'backup';

export interface ExportConfig {
    type: ExportType;
    format: ExportFormat;
    dateRange?: { start: Date; end: Date };
    year?: number;
    includeAttachments: boolean;
    includeReceipts: boolean;
    categories?: string[];
    accounts?: string[];
}

export interface ExportResult {
    id: string;
    type: ExportType;
    format: ExportFormat;
    filename: string;
    size: number;
    downloadUrl: string;
    expiresAt: Date;
    createdAt: Date;
    config: ExportConfig;
}

export interface ScheduledExport {
    id: string;
    userId: string;
    config: ExportConfig;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    emailTo: string[];
    isEnabled: boolean;
    lastExportAt?: Date;
    nextExportAt: Date;
}

// In-memory stores
const exports: Map<string, ExportResult> = new Map();
const scheduledExports: Map<string, ScheduledExport> = new Map();

/**
 * Generate CSV content
 */
function generateCSV(headers: string[], rows: string[][]): string {
    const escapeCSV = (val: string) => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    };

    const headerLine = headers.map(escapeCSV).join(',');
    const dataLines = rows.map(row => row.map(escapeCSV).join(','));

    return [headerLine, ...dataLines].join('\n');
}

/**
 * Generate transactions export
 */
function exportTransactions(
    transactions: Array<{
        date: Date;
        description: string;
        category: string;
        amount: number;
        account: string;
        type: string;
        notes?: string;
    }>,
    format: ExportFormat
): string {
    if (format === 'json') {
        return JSON.stringify(transactions, null, 2);
    }

    if (format === 'csv') {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Account', 'Type', 'Notes'];
        const rows = transactions.map(t => [
            t.date.toISOString().split('T')[0],
            t.description,
            t.category,
            t.amount.toString(),
            t.account,
            t.type,
            t.notes || '',
        ]);
        return generateCSV(headers, rows);
    }

    // QBO format (QuickBooks)
    if (format === 'qbo') {
        return generateQBOFormat(transactions);
    }

    // OFX format (Open Financial Exchange)
    if (format === 'ofx') {
        return generateOFXFormat(transactions);
    }

    return JSON.stringify(transactions);
}

/**
 * Generate QuickBooks format
 */
function generateQBOFormat(transactions: Array<{
    date: Date;
    description: string;
    amount: number;
}>): string {
    const header = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
`;

    const stmtTrns = transactions.map(t => `
<STMTTRN>
<TRNTYPE>${t.amount >= 0 ? 'CREDIT' : 'DEBIT'}
<DTPOSTED>${t.date.toISOString().replace(/[-:]/g, '').split('.')[0]}
<TRNAMT>${t.amount}
<NAME>${t.description}
</STMTTRN>`).join('');

    return header + `<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
${stmtTrns}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}

/**
 * Generate OFX format
 */
function generateOFXFormat(transactions: Array<{
    date: Date;
    description: string;
    amount: number;
}>): string {
    // Simplified OFX 2.0 XML
    const stmtTrns = transactions.map(t => `
    <STMTTRN>
      <TRNTYPE>${t.amount >= 0 ? 'CREDIT' : 'DEBIT'}</TRNTYPE>
      <DTPOSTED>${t.date.toISOString().replace(/[-:]/g, '').split('.')[0]}</DTPOSTED>
      <TRNAMT>${t.amount}</TRNAMT>
      <NAME>${t.description}</NAME>
    </STMTTRN>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>${stmtTrns}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
}

/**
 * Generate tax package export
 */
function exportTaxPackage(data: {
    year: number;
    income: { source: string; amount: number; form: string }[];
    deductions: { category: string; amount: number; description: string }[];
    summary: { totalIncome: number; totalDeductions: number; taxableIncome: number };
}): string {
    return JSON.stringify({
        taxYear: data.year,
        generatedAt: new Date().toISOString(),
        income: data.income,
        deductions: data.deductions,
        summary: data.summary,
        disclaimer: 'This export is for informational purposes only. Consult a tax professional.',
    }, null, 2);
}

/**
 * Generate accountant package
 */
function exportAccountantPackage(data: {
    clientInfo: { name: string; email: string };
    period: { start: Date; end: Date };
    accounts: { name: string; type: string; balance: number }[];
    transactions: Array<{ date: Date; description: string; category: string; amount: number }>;
    categories: { category: string; total: number }[];
    notes?: string;
}): string {
    return JSON.stringify({
        exportType: 'accountant_package',
        generatedAt: new Date().toISOString(),
        client: data.clientInfo,
        period: {
            start: data.period.start.toISOString(),
            end: data.period.end.toISOString(),
        },
        accounts: data.accounts,
        transactionCount: data.transactions.length,
        transactions: data.transactions.slice(0, 1000), // Limit for JSON
        categoryBreakdown: data.categories,
        notes: data.notes,
    }, null, 2);
}

/**
 * Create export
 */
export async function createExport(
    userId: string,
    config: ExportConfig,
    data: unknown
): Promise<ExportResult> {
    const id = `export_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let content: string;

    switch (config.type) {
        case 'transactions':
            content = exportTransactions(data as Array<{
                date: Date;
                description: string;
                category: string;
                amount: number;
                account: string;
                type: string;
                notes?: string;
            }>, config.format);
            break;
        case 'tax_package':
            content = exportTaxPackage(data as {
                year: number;
                income: { source: string; amount: number; form: string }[];
                deductions: { category: string; amount: number; description: string }[];
                summary: { totalIncome: number; totalDeductions: number; taxableIncome: number };
            });
            break;
        case 'accountant_package':
            content = exportAccountantPackage(data as {
                clientInfo: { name: string; email: string };
                period: { start: Date; end: Date };
                accounts: { name: string; type: string; balance: number }[];
                transactions: Array<{ date: Date; description: string; category: string; amount: number }>;
                categories: { category: string; total: number }[];
                notes?: string;
            });
            break;
        default:
            content = JSON.stringify(data, null, 2);
    }

    const formatExtensions: Record<ExportFormat, string> = {
        csv: 'csv',
        json: 'json',
        pdf: 'pdf',
        xlsx: 'xlsx',
        qbo: 'qbo',
        ofx: 'ofx',
    };

    const filename = `moneyloop_${config.type}_${Date.now()}.${formatExtensions[config.format]}`;

    const result: ExportResult = {
        id,
        type: config.type,
        format: config.format,
        filename,
        size: content.length,
        downloadUrl: `/api/exports/${id}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
        config,
    };

    exports.set(id, result);
    return result;
}

/**
 * Create scheduled export
 */
export function scheduleExport(params: Omit<ScheduledExport, 'id' | 'nextExportAt'>): ScheduledExport {
    const id = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const nextExportAt = calculateNextExportDate(params.frequency, params.dayOfWeek, params.dayOfMonth);

    const scheduled: ScheduledExport = {
        id,
        ...params,
        nextExportAt,
    };

    scheduledExports.set(id, scheduled);
    return scheduled;
}

/**
 * Calculate next export date
 */
function calculateNextExportDate(
    frequency: ScheduledExport['frequency'],
    dayOfWeek?: number,
    dayOfMonth?: number
): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(6, 0, 0, 0); // 6 AM

    switch (frequency) {
        case 'daily':
            if (next <= now) next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            const targetDay = dayOfWeek || 1; // Monday
            while (next.getDay() !== targetDay || next <= now) {
                next.setDate(next.getDate() + 1);
            }
            break;
        case 'monthly':
            next.setDate(dayOfMonth || 1);
            if (next <= now) next.setMonth(next.getMonth() + 1);
            break;
        case 'quarterly':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            next.setMonth((currentQuarter + 1) * 3);
            next.setDate(dayOfMonth || 1);
            break;
        case 'yearly':
            next.setMonth(0);
            next.setDate(dayOfMonth || 1);
            if (next <= now) next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
}

/**
 * Get user exports
 */
export function getUserExports(userId: string, limit: number = 20): ExportResult[] {
    return Array.from(exports.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
}

/**
 * Get scheduled exports
 */
export function getScheduledExports(userId: string): ScheduledExport[] {
    return Array.from(scheduledExports.values())
        .filter(s => s.userId === userId);
}

/**
 * Create full backup
 */
export async function createBackup(userId: string, data: {
    profile: unknown;
    accounts: unknown[];
    transactions: unknown[];
    budgets: unknown[];
    goals: unknown[];
    bills: unknown[];
    documents: unknown[];
    settings: unknown;
}): Promise<ExportResult> {
    const backupData = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        userId,
        ...data,
    };

    return createExport(userId, {
        type: 'backup',
        format: 'json',
        includeAttachments: false,
        includeReceipts: true,
    }, backupData);
}

/**
 * Restore from backup
 */
export function parseBackup(content: string): {
    version: string;
    createdAt: string;
    profile: unknown;
    accounts: unknown[];
    transactions: unknown[];
    budgets: unknown[];
    goals: unknown[];
    bills: unknown[];
    documents: unknown[];
    settings: unknown;
} {
    return JSON.parse(content);
}

export default {
    createExport,
    scheduleExport,
    getUserExports,
    getScheduledExports,
    createBackup,
    parseBackup,
};
