// Payroll Calculation Engine
// Handles gross-to-net calculations, tax withholdings, and deductions

import { Employee, EmployeePay, Compensation, TaxInfo, EmployeeBenefits } from './types';

// 2026 Tax Brackets (Federal)
const FEDERAL_TAX_BRACKETS_2026 = {
    single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 },
    ],
    married: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 },
    ],
    married_separate: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 365600, rate: 0.35 },
        { min: 365600, max: Infinity, rate: 0.37 },
    ],
    head_of_household: [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 },
    ],
};

// FICA Tax Rates (2026)
const SOCIAL_SECURITY_RATE = 0.062; // 6.2%
const SOCIAL_SECURITY_WAGE_BASE_2026 = 176100; // Max taxable earnings
const MEDICARE_RATE = 0.0145; // 1.45%
const ADDITIONAL_MEDICARE_RATE = 0.009; // Additional 0.9% for high earners
const ADDITIONAL_MEDICARE_THRESHOLD = 200000; // Single filer

// State Tax Rates (simplified - would need full state-by-state data)
const STATE_TAX_RATES: Record<string, number> = {
    CA: 0.0725, // California (simplified - actually progressive)
    NY: 0.0685, // New York
    TX: 0, // No state income tax
    FL: 0, // No state income tax
    WA: 0, // No state income tax
    NV: 0, // No state income tax
    TN: 0, // No state income tax
    WY: 0, // No state income tax
    AK: 0, // No state income tax
    SD: 0, // No state income tax
    NH: 0, // No state income tax (on wages)
    // Add more states as needed
};

// Pay frequency multipliers
const PAY_PERIODS_PER_YEAR = {
    weekly: 52,
    'bi-weekly': 26,
    'semi-monthly': 24,
    monthly: 12,
};

export interface PayrollCalculationInput {
    employee: {
        id: string;
        name: string;
        compensation: Compensation;
        taxInfo: TaxInfo;
        benefits?: EmployeeBenefits;
        state: string;
        ytdGross?: number; // Year-to-date gross for Social Security cap
        ytdSocialSecurity?: number;
    };
    payPeriod: {
        start: string;
        end: string;
    };
    hours?: {
        regular: number;
        overtime: number;
        pto: number;
        sick: number;
        holiday: number;
    };
    adjustments?: {
        bonus?: number;
        commission?: number;
        reimbursements?: number;
        additionalWithholding?: number;
    };
}

export interface PayrollCalculationResult {
    employeeId: string;
    employeeName: string;

    // Earnings
    earnings: {
        regular: number;
        overtime: number;
        pto: number;
        sick: number;
        holiday: number;
        bonus: number;
        commission: number;
        grossPay: number;
    };

    // Pre-tax deductions
    preTaxDeductions: {
        health: number;
        dental: number;
        vision: number;
        retirement401k: number;
        hsa: number;
        fsa: number;
        total: number;
    };

    // Taxable wages
    taxableWages: {
        federal: number;
        state: number;
        fica: number;
    };

    // Taxes
    taxes: {
        federalIncome: number;
        socialSecurity: number;
        medicare: number;
        additionalMedicare: number;
        stateIncome: number;
        localTax: number;
        totalEmployeeTax: number;
        // Employer taxes
        employerSocialSecurity: number;
        employerMedicare: number;
        futa: number; // Federal Unemployment
        suta: number; // State Unemployment
        totalEmployerTax: number;
    };

    // Post-tax deductions
    postTaxDeductions: {
        rothRetirement: number;
        garnishments: number;
        other: number;
        total: number;
    };

    // Reimbursements (non-taxable)
    reimbursements: number;

    // Net pay
    netPay: number;

    // Employer contributions
    employerContributions: {
        health: number;
        dental: number;
        vision: number;
        retirement401kMatch: number;
        hsa: number;
        total: number;
    };

    // Total cost to employer
    totalEmployerCost: number;
}

// Calculate federal income tax withholding
function calculateFederalTax(
    annualizedIncome: number,
    filingStatus: TaxInfo['filingStatus'],
    additionalWithholding: number = 0
): number {
    const brackets = FEDERAL_TAX_BRACKETS_2026[filingStatus];
    let tax = 0;
    let remainingIncome = annualizedIncome;

    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;

        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        tax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }

    return tax + additionalWithholding;
}

// Calculate Social Security tax
function calculateSocialSecurityTax(
    grossPay: number,
    ytdGross: number = 0
): { employeeTax: number; employerTax: number; } {
    const remainingWageBase = Math.max(0, SOCIAL_SECURITY_WAGE_BASE_2026 - ytdGross);
    const taxableWages = Math.min(grossPay, remainingWageBase);

    return {
        employeeTax: taxableWages * SOCIAL_SECURITY_RATE,
        employerTax: taxableWages * SOCIAL_SECURITY_RATE,
    };
}

// Calculate Medicare tax
function calculateMedicareTax(
    grossPay: number,
    ytdGross: number = 0
): { employeeTax: number; additionalTax: number; employerTax: number; } {
    const baseTax = grossPay * MEDICARE_RATE;

    // Additional Medicare tax for high earners
    let additionalTax = 0;
    if (ytdGross > ADDITIONAL_MEDICARE_THRESHOLD) {
        additionalTax = grossPay * ADDITIONAL_MEDICARE_RATE;
    } else if (ytdGross + grossPay > ADDITIONAL_MEDICARE_THRESHOLD) {
        const amountOverThreshold = (ytdGross + grossPay) - ADDITIONAL_MEDICARE_THRESHOLD;
        additionalTax = amountOverThreshold * ADDITIONAL_MEDICARE_RATE;
    }

    return {
        employeeTax: baseTax,
        additionalTax,
        employerTax: baseTax, // Employer doesn't pay additional Medicare
    };
}

// Calculate state income tax (simplified)
function calculateStateTax(
    annualizedIncome: number,
    state: string
): number {
    const rate = STATE_TAX_RATES[state.toUpperCase()] || 0.05; // Default 5%
    return annualizedIncome * rate;
}

// Main payroll calculation function
export function calculatePayroll(
    input: PayrollCalculationInput
): PayrollCalculationResult {
    const { employee, hours, adjustments } = input;
    const { compensation, taxInfo, benefits, state, ytdGross = 0 } = employee;

    const payPeriodsPerYear = PAY_PERIODS_PER_YEAR[compensation.payFrequency];

    // Calculate earnings
    let regularPay = 0;
    let overtimePay = 0;
    let ptoPay = 0;
    let sickPay = 0;
    let holidayPay = 0;

    if (compensation.type === 'salary') {
        // Salary employee
        regularPay = compensation.amount / payPeriodsPerYear;

        // PTO, sick, holiday are usually included in salary
        if (hours) {
            ptoPay = 0; // Already included
            sickPay = 0;
            holidayPay = 0;
        }
    } else {
        // Hourly employee
        const hourlyRate = compensation.amount;
        regularPay = (hours?.regular || 0) * hourlyRate;
        overtimePay = (hours?.overtime || 0) * hourlyRate * 1.5; // Time and a half
        ptoPay = (hours?.pto || 0) * hourlyRate;
        sickPay = (hours?.sick || 0) * hourlyRate;
        holidayPay = (hours?.holiday || 0) * hourlyRate * 1.5; // Often time and a half
    }

    const bonus = adjustments?.bonus || 0;
    const commission = adjustments?.commission || 0;

    const grossPay = regularPay + overtimePay + ptoPay + sickPay + holidayPay + bonus + commission;

    // Pre-tax deductions (reduce taxable income)
    const preTaxDeductions = {
        health: benefits?.health?.employeeContribution || 0,
        dental: benefits?.dental?.employeeContribution || 0,
        vision: benefits?.vision?.employeeContribution || 0,
        retirement401k: benefits?.retirement
            ? (grossPay * (benefits.retirement.contributionPercent / 100))
            : 0,
        hsa: 0, // Would come from benefits
        fsa: 0, // Would come from benefits
        total: 0,
    };
    preTaxDeductions.total =
        preTaxDeductions.health +
        preTaxDeductions.dental +
        preTaxDeductions.vision +
        preTaxDeductions.retirement401k +
        preTaxDeductions.hsa +
        preTaxDeductions.fsa;

    // Taxable wages
    const federalTaxableWages = grossPay - preTaxDeductions.total;
    const stateTaxableWages = federalTaxableWages; // Usually the same
    const ficaTaxableWages = grossPay; // FICA applies to gross, not reduced by 401k

    // Annualize for tax calculations
    const annualizedFederalWages = federalTaxableWages * payPeriodsPerYear;
    const annualizedStateWages = stateTaxableWages * payPeriodsPerYear;

    // Calculate taxes
    const annualFederalTax = calculateFederalTax(
        annualizedFederalWages,
        taxInfo.filingStatus,
        (taxInfo.federalWithholding || 0) * payPeriodsPerYear
    );
    const federalTaxPerPeriod = annualFederalTax / payPeriodsPerYear;

    const socialSecurity = calculateSocialSecurityTax(ficaTaxableWages, ytdGross);
    const medicare = calculateMedicareTax(ficaTaxableWages, ytdGross);

    const annualStateTax = calculateStateTax(annualizedStateWages, state);
    const stateTaxPerPeriod = annualStateTax / payPeriodsPerYear;

    const taxes = {
        federalIncome: Math.max(0, federalTaxPerPeriod),
        socialSecurity: socialSecurity.employeeTax,
        medicare: medicare.employeeTax,
        additionalMedicare: medicare.additionalTax,
        stateIncome: Math.max(0, stateTaxPerPeriod),
        localTax: 0, // Would need city/county data
        totalEmployeeTax: 0,
        employerSocialSecurity: socialSecurity.employerTax,
        employerMedicare: medicare.employerTax,
        futa: Math.min(grossPay, 7000) * 0.006, // 0.6% on first $7,000
        suta: Math.min(grossPay, 7000) * 0.03, // Varies by state, ~3% average
        totalEmployerTax: 0,
    };

    taxes.totalEmployeeTax =
        taxes.federalIncome +
        taxes.socialSecurity +
        taxes.medicare +
        taxes.additionalMedicare +
        taxes.stateIncome +
        taxes.localTax;

    taxes.totalEmployerTax =
        taxes.employerSocialSecurity +
        taxes.employerMedicare +
        taxes.futa +
        taxes.suta;

    // Post-tax deductions
    const postTaxDeductions = {
        rothRetirement: 0,
        garnishments: 0,
        other: 0,
        total: 0,
    };

    // Reimbursements (non-taxable)
    const reimbursements = adjustments?.reimbursements || 0;

    // Net pay
    const netPay = grossPay - preTaxDeductions.total - taxes.totalEmployeeTax - postTaxDeductions.total + reimbursements;

    // Employer contributions
    const employerContributions = {
        health: benefits?.health?.employerContribution || 0,
        dental: benefits?.dental?.employerContribution || 0,
        vision: benefits?.vision?.employerContribution || 0,
        retirement401kMatch: benefits?.retirement
            ? (grossPay * Math.min(benefits.retirement.contributionPercent, benefits.retirement.employerMatchPercent) / 100)
            : 0,
        hsa: 0,
        total: 0,
    };
    employerContributions.total =
        employerContributions.health +
        employerContributions.dental +
        employerContributions.vision +
        employerContributions.retirement401kMatch +
        employerContributions.hsa;

    // Total employer cost
    const totalEmployerCost = grossPay + taxes.totalEmployerTax + employerContributions.total;

    return {
        employeeId: employee.id,
        employeeName: employee.name,
        earnings: {
            regular: regularPay,
            overtime: overtimePay,
            pto: ptoPay,
            sick: sickPay,
            holiday: holidayPay,
            bonus,
            commission,
            grossPay,
        },
        preTaxDeductions,
        taxableWages: {
            federal: federalTaxableWages,
            state: stateTaxableWages,
            fica: ficaTaxableWages,
        },
        taxes,
        postTaxDeductions,
        reimbursements,
        netPay: Math.max(0, netPay),
        employerContributions,
        totalEmployerCost,
    };
}

// Calculate payroll for entire company
export function calculateCompanyPayroll(
    employees: PayrollCalculationInput[]
): {
    employeePays: PayrollCalculationResult[];
    totals: {
        totalGross: number;
        totalNetPay: number;
        totalEmployeeTaxes: number;
        totalEmployerTaxes: number;
        totalPreTaxDeductions: number;
        totalEmployerContributions: number;
        totalEmployerCost: number;
    };
} {
    const employeePays = employees.map(calculatePayroll);

    const totals = employeePays.reduce(
        (acc, pay) => ({
            totalGross: acc.totalGross + pay.earnings.grossPay,
            totalNetPay: acc.totalNetPay + pay.netPay,
            totalEmployeeTaxes: acc.totalEmployeeTaxes + pay.taxes.totalEmployeeTax,
            totalEmployerTaxes: acc.totalEmployerTaxes + pay.taxes.totalEmployerTax,
            totalPreTaxDeductions: acc.totalPreTaxDeductions + pay.preTaxDeductions.total,
            totalEmployerContributions: acc.totalEmployerContributions + pay.employerContributions.total,
            totalEmployerCost: acc.totalEmployerCost + pay.totalEmployerCost,
        }),
        {
            totalGross: 0,
            totalNetPay: 0,
            totalEmployeeTaxes: 0,
            totalEmployerTaxes: 0,
            totalPreTaxDeductions: 0,
            totalEmployerContributions: 0,
            totalEmployerCost: 0,
        }
    );

    return { employeePays, totals };
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// Calculate effective tax rate
export function calculateEffectiveTaxRate(result: PayrollCalculationResult): {
    federal: number;
    state: number;
    fica: number;
    total: number;
} {
    const gross = result.earnings.grossPay;
    if (gross === 0) return { federal: 0, state: 0, fica: 0, total: 0 };

    return {
        federal: (result.taxes.federalIncome / gross) * 100,
        state: (result.taxes.stateIncome / gross) * 100,
        fica: ((result.taxes.socialSecurity + result.taxes.medicare + result.taxes.additionalMedicare) / gross) * 100,
        total: (result.taxes.totalEmployeeTax / gross) * 100,
    };
}
