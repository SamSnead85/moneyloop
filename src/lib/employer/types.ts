// Employer Module Types
// Following industry standards from Gusto, Rippling, and ADP

export type EmploymentType = 'full-time' | 'part-time' | 'contractor';
export type PayFrequency = 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
export type EmployeeStatus = 'active' | 'pending' | 'offboarding' | 'terminated';
export type PayrollStatus = 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
export type FilingStatus = 'single' | 'married' | 'married_separate' | 'head_of_household';

// Employee
export interface Employee {
    id: string;
    userId?: string; // Link to MoneyLoop user

    // Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    ssn?: string; // Encrypted, last 4 visible
    address?: Address;

    // Employment Info
    employmentType: EmploymentType;
    status: EmployeeStatus;
    department: string;
    title: string;
    managerId?: string;
    startDate: string;
    terminationDate?: string;

    // Compensation
    compensation: Compensation;

    // Tax Info
    taxInfo: TaxInfo;

    // Payment Info
    paymentMethod: PaymentMethod;

    // Benefits
    benefits?: EmployeeBenefits;

    // Documents
    onboardingComplete: boolean;
    documentsComplete: boolean;

    // Metadata
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Compensation {
    type: 'salary' | 'hourly';
    amount: number; // Annual salary or hourly rate
    payFrequency: PayFrequency;
    effectiveDate: string;
    currency: string;
}

export interface TaxInfo {
    filingStatus: FilingStatus;
    federalWithholding: number; // Additional withholding
    stateWithholding?: number;
    allowances: number;
    w4Submitted: boolean;
    i9Verified: boolean;
}

export interface PaymentMethod {
    type: 'direct_deposit' | 'check';
    bankName?: string;
    accountType?: 'checking' | 'savings';
    routingNumber?: string; // Encrypted
    accountNumber?: string; // Encrypted, last 4 visible
    verified: boolean;
}

export interface EmployeeBenefits {
    health?: BenefitEnrollment;
    dental?: BenefitEnrollment;
    vision?: BenefitEnrollment;
    retirement?: RetirementEnrollment;
    pto?: PTOPolicy;
}

export interface BenefitEnrollment {
    planId: string;
    planName: string;
    coverageLevel: 'employee' | 'employee_spouse' | 'employee_children' | 'family';
    employeeContribution: number; // Per paycheck
    employerContribution: number;
    effectiveDate: string;
    dependents?: Dependent[];
}

export interface Dependent {
    id: string;
    firstName: string;
    lastName: string;
    relationship: 'spouse' | 'child' | 'domestic_partner';
    dateOfBirth: string;
}

export interface RetirementEnrollment {
    planId: string;
    contributionPercent: number;
    employerMatchPercent: number;
    vestingSchedule?: string;
}

export interface PTOPolicy {
    policyId: string;
    accruedDays: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
}

// Contractor (for 1099)
export interface Contractor {
    id: string;
    type: 'individual' | 'business';

    // Business Info (if applicable)
    businessName?: string;
    ein?: string;

    // Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: Address;

    // Payment Info
    hourlyRate?: number;
    projectRate?: number;
    paymentMethod: PaymentMethod;

    // Tax Info
    w9Submitted: boolean;
    tin?: string; // Tax ID Number

    // Contract Info
    contractStartDate: string;
    contractEndDate?: string;
    status: 'active' | 'inactive';

    // YTD
    ytdPayments: number;

    createdAt: string;
    updatedAt: string;
}

// Payroll
export interface PayrollRun {
    id: string;
    companyId: string;

    // Pay Period
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    checkDate: string;

    // Totals
    totalGrossPay: number;
    totalNetPay: number;
    totalEmployeeTaxes: number;
    totalEmployerTaxes: number;
    totalDeductions: number;
    totalReimbursements: number;
    totalEmployerContributions: number;

    // Counts
    employeeCount: number;
    contractorCount: number;

    // Status
    status: PayrollStatus;
    approvedBy?: string;
    approvedAt?: string;
    processedAt?: string;

    // Employee Pay
    employeePays: EmployeePay[];
    contractorPays: ContractorPay[];

    // Errors
    errors?: PayrollError[];

    createdAt: string;
    updatedAt: string;
}

export interface EmployeePay {
    employeeId: string;
    employeeName: string;

    // Hours (for hourly employees)
    regularHours?: number;
    overtimeHours?: number;
    ptoHours?: number;
    sickHours?: number;
    holidayHours?: number;

    // Earnings
    regularPay: number;
    overtimePay: number;
    bonusPay?: number;
    commissionPay?: number;
    ptoPay?: number;
    sickPay?: number;
    holidayPay?: number;
    otherEarnings?: OtherEarning[];
    grossPay: number;

    // Taxes
    federalIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    stateIncomeTax?: number;
    localTax?: number;
    totalTaxes: number;

    // Deductions
    healthInsurance?: number;
    dentalInsurance?: number;
    visionInsurance?: number;
    retirement401k?: number;
    hsa?: number;
    fsa?: number;
    otherDeductions?: Deduction[];
    totalDeductions: number;

    // Reimbursements
    reimbursements?: Reimbursement[];
    totalReimbursements: number;

    // Net
    netPay: number;

    // Payment
    paymentMethod: 'direct_deposit' | 'check';
    paymentStaus: 'pending' | 'processing' | 'paid' | 'failed';
}

export interface ContractorPay {
    contractorId: string;
    contractorName: string;

    // Payment
    hours?: number;
    rate?: number;
    amount: number;
    description?: string;
    invoiceNumber?: string;

    // Payment
    paymentMethod: 'direct_deposit' | 'check';
    paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
}

export interface OtherEarning {
    type: string;
    description: string;
    amount: number;
}

export interface Deduction {
    type: string;
    description: string;
    amount: number;
    preTax: boolean;
}

export interface Reimbursement {
    type: string;
    description: string;
    amount: number;
}

export interface PayrollError {
    employeeId?: string;
    field: string;
    message: string;
    severity: 'warning' | 'error';
}

// Tax Filing
export interface TaxFiling {
    id: string;
    companyId: string;
    filingType: 'form_941' | 'form_940' | 'w2' | '1099_nec' | 'state_unemployment';
    period: string; // Q1 2026, 2025, etc.
    dueDate: string;
    filedDate?: string;
    status: 'upcoming' | 'due' | 'filed' | 'accepted' | 'rejected';
    amount?: number;
    confirmationNumber?: string;

    createdAt: string;
    updatedAt: string;
}

// Benefits Plan
export interface BenefitPlan {
    id: string;
    companyId: string;
    type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement';
    name: string;
    provider: string;
    groupNumber?: string;

    // Coverage
    coverageLevels: CoverageLevel[];

    // Contributions
    employerContributionType: 'fixed' | 'percentage';
    employerContribution: number;

    // Eligibility
    eligibilityWaitingDays: number;
    eligibleEmploymentTypes: EmploymentType[];

    // Dates
    planYearStart: string;
    planYearEnd: string;
    openEnrollmentStart?: string;
    openEnrollmentEnd?: string;

    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface CoverageLevel {
    type: 'employee' | 'employee_spouse' | 'employee_children' | 'family';
    monthlyCost: number;
    employerPays: number;
    employeePays: number;
}

// Company (Employer)
export interface Company {
    id: string;
    ownerId: string; // MoneyLoop user ID

    // Basic Info
    legalName: string;
    dba?: string; // Doing Business As
    entityType: 'llc' | 'corporation' | 's_corp' | 'partnership' | 'sole_proprietorship';
    industry?: string;

    // Tax Info
    ein: string;
    stateId?: string;
    suiRate?: number; // State Unemployment Insurance rate

    // Address
    address: Address;

    // Payroll Settings
    payFrequency: PayFrequency;
    payDay: number; // Day of week (0-6) or day of month (1-31)

    // Bank Account
    bankAccount?: BankAccount;

    // Settings
    settings: CompanySettings;

    createdAt: string;
    updatedAt: string;
}

export interface BankAccount {
    id: string;
    provider: 'mercury' | 'chase' | 'bank_of_america' | 'wells_fargo' | 'other';
    bankName: string;
    accountType: 'checking' | 'savings';
    accountNumber: string; // Last 4 only
    routingNumber: string; // Last 4 only
    verified: boolean;
    connectedAt: string;

    // Mercury-specific
    mercuryAccountId?: string;
}

export interface CompanySettings {
    autoPayroll: boolean;
    payrollReminders: boolean;
    taxFilingReminders: boolean;
    newEmployeeNotifications: boolean;

    // Defaults
    defaultDepartment?: string;
    defaultBenefitsEnrollment?: boolean;
}

// Onboarding
export interface OnboardingChecklist {
    employeeId: string;

    // Personal Info
    personalInfoComplete: boolean;
    addressComplete: boolean;
    emergencyContactComplete: boolean;

    // Tax & Compliance
    w4Submitted: boolean;
    i9Submitted: boolean;
    i9Verified: boolean;
    stateW4Submitted?: boolean;

    // Payment
    directDepositSetup: boolean;

    // Benefits
    benefitsEnrolled: boolean;
    benefitsWaived: boolean;

    // Documents
    offerLetterSigned: boolean;
    handbookAcknowledged: boolean;
    ndaSigned?: boolean;

    // IT
    loginCreated: boolean;
    equipmentAssigned?: boolean;

    // Training
    orientationCompleted?: boolean;

    completedAt?: string;
    updatedAt: string;
}

// Time Tracking (for hourly employees)
export interface TimeEntry {
    id: string;
    employeeId: string;
    date: string;

    clockIn: string;
    clockOut?: string;
    breakMinutes?: number;

    regularHours: number;
    overtimeHours: number;

    notes?: string;
    approved: boolean;
    approvedBy?: string;

    createdAt: string;
    updatedAt: string;
}

// PTO Request
export interface PTORequest {
    id: string;
    employeeId: string;
    type: 'vacation' | 'sick' | 'personal' | 'bereavement' | 'jury_duty' | 'other';

    startDate: string;
    endDate: string;
    totalDays: number;

    reason?: string;
    status: 'pending' | 'approved' | 'denied' | 'cancelled';

    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;

    createdAt: string;
    updatedAt: string;
}
