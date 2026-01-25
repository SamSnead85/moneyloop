// Employer Payroll API Routes
import { NextRequest, NextResponse } from 'next/server';
import { calculatePayroll, calculateCompanyPayroll, type PayrollCalculationInput } from '@/lib/employer';

// GET /api/employer/payroll - Get payroll runs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '10');

        // In production, fetch from database
        // For now, return mock data
        const payrollRuns = [
            {
                id: 'pr-001',
                payPeriodStart: '2026-01-01',
                payPeriodEnd: '2026-01-15',
                payDate: '2026-01-17',
                totalGross: 23456.78,
                totalTaxes: 5678.90,
                totalDeductions: 1234.56,
                totalNet: 16543.32,
                employeeCount: 5,
                status: 'completed',
                createdAt: '2026-01-15T10:00:00Z',
            },
            {
                id: 'pr-002',
                payPeriodStart: '2026-01-16',
                payPeriodEnd: '2026-01-31',
                payDate: '2026-02-01',
                totalGross: 24123.45,
                totalTaxes: 5890.12,
                totalDeductions: 1289.45,
                totalNet: 16943.88,
                employeeCount: 5,
                status: 'draft',
                createdAt: '2026-01-25T10:00:00Z',
            },
        ].filter(run => !status || run.status === status).slice(0, limit);

        return NextResponse.json({
            success: true,
            data: payrollRuns,
        });
    } catch (error) {
        console.error('Error fetching payroll runs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch payroll runs' },
            { status: 500 }
        );
    }
}

// POST /api/employer/payroll - Calculate/create payroll run
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, employees, payPeriod } = body;

        if (action === 'calculate') {
            // Calculate payroll for preview
            if (!employees || !Array.isArray(employees)) {
                return NextResponse.json(
                    { success: false, error: 'Employees array is required' },
                    { status: 400 }
                );
            }

            const inputs: PayrollCalculationInput[] = employees.map((emp: any) => ({
                employee: {
                    id: emp.id,
                    name: emp.name,
                    compensation: emp.compensation,
                    taxInfo: emp.taxInfo,
                    benefits: emp.benefits,
                    state: emp.state || 'CA',
                    ytdGross: emp.ytdGross || 0,
                },
                payPeriod: payPeriod || {
                    start: new Date().toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                },
                hours: emp.hours,
                adjustments: emp.adjustments,
            }));

            const result = calculateCompanyPayroll(inputs);

            return NextResponse.json({
                success: true,
                data: {
                    preview: true,
                    employeePays: result.employeePays,
                    totals: result.totals,
                },
            });
        }

        if (action === 'create') {
            // Create a new payroll run (draft)
            const payrollRun = {
                id: `pr-${Date.now()}`,
                payPeriodStart: payPeriod?.start,
                payPeriodEnd: payPeriod?.end,
                payDate: body.payDate,
                status: 'draft',
                employeeCount: employees?.length || 0,
                createdAt: new Date().toISOString(),
            };

            // In production, save to database

            return NextResponse.json({
                success: true,
                data: payrollRun,
            });
        }

        if (action === 'submit') {
            // Submit payroll for processing
            const { payrollRunId } = body;

            if (!payrollRunId) {
                return NextResponse.json(
                    { success: false, error: 'Payroll run ID is required' },
                    { status: 400 }
                );
            }

            // In production:
            // 1. Validate all employee data
            // 2. Verify bank account has sufficient funds
            // 3. Create Mercury ACH payments
            // 4. Update payroll run status to 'processing'

            return NextResponse.json({
                success: true,
                data: {
                    payrollRunId,
                    status: 'processing',
                    message: 'Payroll submitted for processing. Payments will be sent via ACH.',
                },
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error processing payroll:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process payroll' },
            { status: 500 }
        );
    }
}
