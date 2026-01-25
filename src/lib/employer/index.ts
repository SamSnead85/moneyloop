// Employer Module - Barrel Export
// Following Gusto/Rippling/ADP industry standards

// Types
export * from './types';

// Mercury Bank Integration
export {
    default as MercuryAPI,
    getMercuryClient,
    processPayrollPayments,
    setupEmployeeAsRecipient,
    getAccountForPayroll,
    type MercuryAccount,
    type MercuryTransaction,
    type MercuryRecipient,
    type MercuryPayment,
    type CreateRecipientRequest,
    type CreatePaymentRequest,
} from './mercury';

// Payroll Calculation Engine
export {
    calculatePayroll,
    calculateCompanyPayroll,
    formatCurrency,
    calculateEffectiveTaxRate,
    type PayrollCalculationInput,
    type PayrollCalculationResult,
} from './payroll-engine';
