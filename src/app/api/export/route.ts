import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    createExport,
    createBackup,
    getUserExports,
    type ExportConfig,
} from '@/lib/export/data-export';

/**
 * Export API Routes
 * 
 * Endpoints for data export, tax packages, and backups.
 */

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'list':
                const limit = parseInt(searchParams.get('limit') || '20');
                const exports = getUserExports(user.id, limit);
                return NextResponse.json({ exports });

            default:
                return NextResponse.json({ exports: getUserExports(user.id) });
        }
    } catch (error) {
        console.error('Export API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exports' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case 'transactions':
                const txConfig: ExportConfig = {
                    type: 'transactions',
                    format: params.format || 'csv',
                    dateRange: params.dateRange ? {
                        start: new Date(params.dateRange.start),
                        end: new Date(params.dateRange.end),
                    } : undefined,
                    includeAttachments: params.includeAttachments || false,
                    includeReceipts: params.includeReceipts || false,
                    categories: params.categories,
                    accounts: params.accounts,
                };

                // In production, would fetch actual transactions
                const mockTransactions = [
                    { date: new Date(), description: 'Sample', category: 'shopping', amount: -50, account: 'Checking', type: 'debit' },
                ];

                const txExport = await createExport(user.id, txConfig, mockTransactions);
                return NextResponse.json({ export: txExport }, { status: 201 });

            case 'tax-package':
                const taxConfig: ExportConfig = {
                    type: 'tax_package',
                    format: 'json',
                    year: params.year || new Date().getFullYear(),
                    includeAttachments: true,
                    includeReceipts: true,
                };

                const mockTaxData = {
                    year: params.year || new Date().getFullYear(),
                    income: [],
                    deductions: [],
                    summary: { totalIncome: 0, totalDeductions: 0, taxableIncome: 0 },
                };

                const taxExport = await createExport(user.id, taxConfig, mockTaxData);
                return NextResponse.json({ export: taxExport }, { status: 201 });

            case 'backup':
                const mockBackupData = {
                    profile: { id: user.id },
                    accounts: [],
                    transactions: [],
                    budgets: [],
                    goals: [],
                    bills: [],
                    documents: [],
                    settings: {},
                };

                const backup = await createBackup(user.id, mockBackupData);
                return NextResponse.json({ export: backup }, { status: 201 });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: transactions, tax-package, backup' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Export API error:', error);
        return NextResponse.json(
            { error: 'Failed to create export' },
            { status: 500 }
        );
    }
}
