// Employer Employees API Routes
import { NextRequest, NextResponse } from 'next/server';

// Mock employee data (in production, fetch from database)
const mockEmployees = [
    {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah@company.com',
        title: 'Senior Engineer',
        department: 'Engineering',
        employmentType: 'full-time',
        startDate: '2024-03-15',
        status: 'active',
        compensation: {
            type: 'salary',
            amount: 145000,
            payFrequency: 'bi-weekly',
            currency: 'USD',
        },
        taxInfo: {
            filingStatus: 'single',
            federalWithholding: 0,
            allowances: 1,
            w4Submitted: true,
            i9Verified: true,
        },
        benefits: {
            health: { enrolled: true, planId: 'bcbs-ppo' },
            dental: { enrolled: true, planId: 'delta-basic' },
            vision: { enrolled: true, planId: 'vsp-standard' },
            retirement: { enrolled: true, contributionPercent: 6, employerMatch: 4 },
        },
        paymentMethod: {
            type: 'direct_deposit',
            bankName: 'Chase',
            accountType: 'checking',
            accountNumber: '****4521',
            verified: true,
        },
        onboardingComplete: true,
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2026-01-15T14:30:00Z',
    },
    {
        id: '2',
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: 'marcus@company.com',
        title: 'Product Designer',
        department: 'Design',
        employmentType: 'full-time',
        startDate: '2024-06-01',
        status: 'active',
        compensation: {
            type: 'salary',
            amount: 125000,
            payFrequency: 'bi-weekly',
            currency: 'USD',
        },
        taxInfo: {
            filingStatus: 'married',
            federalWithholding: 0,
            allowances: 2,
            w4Submitted: true,
            i9Verified: true,
        },
        benefits: {
            health: { enrolled: true, planId: 'bcbs-ppo' },
            dental: { enrolled: true, planId: 'delta-basic' },
            retirement: { enrolled: true, contributionPercent: 4, employerMatch: 4 },
        },
        paymentMethod: {
            type: 'direct_deposit',
            bankName: 'Bank of America',
            accountType: 'checking',
            accountNumber: '****7832',
            verified: true,
        },
        onboardingComplete: true,
        createdAt: '2024-05-25T10:00:00Z',
        updatedAt: '2026-01-10T09:15:00Z',
    },
    {
        id: '3',
        firstName: 'Alex',
        lastName: 'Kim',
        email: 'alex@contractor.com',
        title: 'DevOps Consultant',
        department: 'Engineering',
        employmentType: 'contractor',
        startDate: '2025-09-01',
        status: 'active',
        compensation: {
            type: 'hourly',
            amount: 85,
            payFrequency: 'bi-weekly',
            currency: 'USD',
        },
        taxInfo: {
            w9Submitted: true,
        },
        paymentMethod: {
            type: 'direct_deposit',
            bankName: 'Mercury',
            accountType: 'checking',
            accountNumber: '****9123',
            verified: true,
        },
        onboardingComplete: true,
        createdAt: '2025-08-28T10:00:00Z',
        updatedAt: '2026-01-20T11:45:00Z',
    },
];

// GET /api/employer/employees - Get all employees
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const department = searchParams.get('department');
        const search = searchParams.get('search')?.toLowerCase();

        let employees = [...mockEmployees];

        // Filter by status
        if (status) {
            employees = employees.filter(e => e.status === status);
        }

        // Filter by employment type
        if (type) {
            employees = employees.filter(e => e.employmentType === type);
        }

        // Filter by department
        if (department) {
            employees = employees.filter(e => e.department === department);
        }

        // Search
        if (search) {
            employees = employees.filter(e =>
                e.firstName.toLowerCase().includes(search) ||
                e.lastName.toLowerCase().includes(search) ||
                e.email.toLowerCase().includes(search) ||
                e.title.toLowerCase().includes(search)
            );
        }

        return NextResponse.json({
            success: true,
            data: employees,
            meta: {
                total: employees.length,
                active: employees.filter(e => e.status === 'active').length,
                contractors: employees.filter(e => e.employmentType === 'contractor').length,
            },
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

// POST /api/employer/employees - Create new employee
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'employmentType', 'startDate'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Create new employee
        const newEmployee = {
            id: `emp-${Date.now()}`,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            title: body.title || '',
            department: body.department || 'General',
            employmentType: body.employmentType,
            startDate: body.startDate,
            status: 'pending', // New employees start as pending until onboarding is complete
            compensation: body.compensation || {
                type: 'salary',
                amount: 0,
                payFrequency: 'bi-weekly',
                currency: 'USD',
            },
            taxInfo: {
                filingStatus: 'single',
                federalWithholding: 0,
                allowances: 1,
                w4Submitted: false,
                i9Verified: false,
            },
            onboardingComplete: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // In production, save to database

        return NextResponse.json({
            success: true,
            data: newEmployee,
            message: 'Employee created. Onboarding email will be sent.',
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}
