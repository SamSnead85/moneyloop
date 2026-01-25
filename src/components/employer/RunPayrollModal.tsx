'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    DollarSign,
    Calendar,
    Users,
    Check,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Clock,
    FileText,
    Send,
    CheckCircle2,
    Edit2,
    Loader2,
    Building2,
    CreditCard,
    Shield,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface RunPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

interface EmployeePayrollData {
    id: string;
    name: string;
    department: string;
    type: 'salary' | 'hourly';
    regularHours: number;
    overtimeHours: number;
    grossPay: number;
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    deductions: number;
    netPay: number;
    status: 'pending' | 'approved' | 'excluded';
}

const mockEmployeePayroll: EmployeePayrollData[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        department: 'Engineering',
        type: 'salary',
        regularHours: 80,
        overtimeHours: 0,
        grossPay: 5576.92,
        federalTax: 892.31,
        stateTax: 446.15,
        socialSecurity: 345.77,
        medicare: 80.87,
        deductions: 312.50,
        netPay: 3499.32,
        status: 'approved',
    },
    {
        id: '2',
        name: 'Marcus Johnson',
        department: 'Design',
        type: 'salary',
        regularHours: 80,
        overtimeHours: 0,
        grossPay: 4807.69,
        federalTax: 769.23,
        stateTax: 384.62,
        socialSecurity: 298.08,
        medicare: 69.71,
        deductions: 287.50,
        netPay: 2998.55,
        status: 'approved',
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        department: 'Marketing',
        type: 'salary',
        regularHours: 80,
        overtimeHours: 0,
        grossPay: 4230.77,
        federalTax: 677.12,
        stateTax: 338.46,
        socialSecurity: 262.31,
        medicare: 61.35,
        deductions: 225.00,
        netPay: 2666.53,
        status: 'approved',
    },
    {
        id: '4',
        name: 'Alex Kim',
        department: 'Engineering',
        type: 'hourly',
        regularHours: 76,
        overtimeHours: 8,
        grossPay: 7140.00,
        federalTax: 1142.40,
        stateTax: 571.20,
        socialSecurity: 442.68,
        medicare: 103.53,
        deductions: 0,
        netPay: 4880.19,
        status: 'pending',
    },
    {
        id: '5',
        name: 'Jordan Taylor',
        department: 'Operations',
        type: 'salary',
        regularHours: 80,
        overtimeHours: 0,
        grossPay: 2884.62,
        federalTax: 461.54,
        stateTax: 230.77,
        socialSecurity: 178.85,
        medicare: 41.83,
        deductions: 175.00,
        netPay: 1796.63,
        status: 'approved',
    },
];

const steps = [
    { id: 'review', title: 'Review', icon: Users },
    { id: 'taxes', title: 'Taxes', icon: FileText },
    { id: 'confirm', title: 'Confirm', icon: Check },
    { id: 'complete', title: 'Complete', icon: CheckCircle2 },
];

export function RunPayrollModal({ isOpen, onClose, onComplete }: RunPayrollModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [employees, setEmployees] = useState(mockEmployeePayroll);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const payPeriod = {
        start: 'Jan 16, 2026',
        end: 'Jan 31, 2026',
        payDate: 'Feb 1, 2026',
    };

    const totals = employees.reduce(
        (acc, emp) => {
            if (emp.status !== 'excluded') {
                acc.grossPay += emp.grossPay;
                acc.federalTax += emp.federalTax;
                acc.stateTax += emp.stateTax;
                acc.socialSecurity += emp.socialSecurity;
                acc.medicare += emp.medicare;
                acc.deductions += emp.deductions;
                acc.netPay += emp.netPay;
                acc.employeeCount++;
            }
            return acc;
        },
        { grossPay: 0, federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, deductions: 0, netPay: 0, employeeCount: 0 }
    );

    const employerTaxes = {
        socialSecurity: totals.socialSecurity, // Employer matches SS
        medicare: totals.medicare, // Employer matches Medicare
        futa: totals.grossPay * 0.006, // FUTA (0.6%)
        suta: totals.grossPay * 0.027, // SUTA (varies by state, ~2.7%)
    };

    const totalEmployerTaxes = Object.values(employerTaxes).reduce((a, b) => a + b, 0);

    const toggleEmployeeStatus = (id: string) => {
        setEmployees(prev =>
            prev.map(emp =>
                emp.id === id
                    ? { ...emp, status: emp.status === 'excluded' ? 'approved' : 'excluded' }
                    : emp
            )
        );
    };

    const goNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsSubmitting(false);
        setIsComplete(true);
        setCurrentStep(3);
    };

    const handleClose = () => {
        if (isComplete) {
            onComplete();
        }
        onClose();
        setCurrentStep(0);
        setIsComplete(false);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0a0f1c] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Run Payroll</h2>
                        <p className="text-sm text-white/40">Pay period: {payPeriod.start} – {payPeriod.end}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                {!isComplete && (
                    <div className="flex items-center justify-center gap-2 p-4 border-b border-white/[0.04]">
                        {steps.slice(0, 3).map((step, i) => {
                            const StepIcon = step.icon;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${i === currentStep
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : i < currentStep
                                                    ? 'text-cyan-400/60'
                                                    : 'text-white/30'
                                            }`}
                                    >
                                        {i < currentStep ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <StepIcon className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">{step.title}</span>
                                    </div>
                                    {i < 2 && (
                                        <ChevronRight className={`w-4 h-4 mx-1 ${i < currentStep ? 'text-cyan-400/40' : 'text-white/20'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Review Employees */}
                        {currentStep === 0 && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-xs mb-1">Employees</p>
                                        <p className="text-2xl font-semibold text-white">{totals.employeeCount}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-xs mb-1">Gross Pay</p>
                                        <p className="text-2xl font-semibold text-white">${totals.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                        <p className="text-cyan-400 text-xs mb-1">Net Pay</p>
                                        <p className="text-2xl font-semibold text-white">${totals.netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>

                                {/* Employee List */}
                                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                                    <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 p-4 bg-white/[0.02] text-xs text-white/40 font-medium">
                                        <span>Employee</span>
                                        <span className="text-right">Hours</span>
                                        <span className="text-right">Gross</span>
                                        <span className="text-right">Net Pay</span>
                                        <span className="text-right">Status</span>
                                    </div>
                                    {employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className={`grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 p-4 border-t border-white/[0.04] items-center ${emp.status === 'excluded' ? 'opacity-40' : ''
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-white">{emp.name}</p>
                                                <p className="text-xs text-white/40">{emp.department} · {emp.type === 'salary' ? 'Salary' : 'Hourly'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white">{emp.regularHours}</p>
                                                {emp.overtimeHours > 0 && (
                                                    <p className="text-xs text-amber-400">+{emp.overtimeHours} OT</p>
                                                )}
                                            </div>
                                            <p className="text-sm text-white text-right">${emp.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            <p className="text-sm font-medium text-white text-right">${emp.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            <div className="text-right">
                                                <button
                                                    onClick={() => toggleEmployeeStatus(emp.id)}
                                                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${emp.status === 'excluded'
                                                            ? 'bg-white/10 text-white/50 hover:bg-white/20'
                                                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                        }`}
                                                >
                                                    {emp.status === 'excluded' ? 'Excluded' : 'Included'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Tax Summary */}
                        {currentStep === 1 && (
                            <motion.div
                                key="taxes"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Employee Taxes */}
                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-400" />
                                        Employee Withholdings
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Federal Income Tax', value: totals.federalTax },
                                            { label: 'State Income Tax', value: totals.stateTax },
                                            { label: 'Social Security (6.2%)', value: totals.socialSecurity },
                                            { label: 'Medicare (1.45%)', value: totals.medicare },
                                            { label: 'Benefits Deductions', value: totals.deductions },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm text-white/60">{item.label}</span>
                                                <span className="text-sm text-white">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                            <span className="font-medium text-white">Total Employee Withholdings</span>
                                            <span className="font-medium text-white">
                                                ${(totals.federalTax + totals.stateTax + totals.socialSecurity + totals.medicare + totals.deductions).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Employer Taxes */}
                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-cyan-400" />
                                        Employer Contributions
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Social Security Match (6.2%)', value: employerTaxes.socialSecurity },
                                            { label: 'Medicare Match (1.45%)', value: employerTaxes.medicare },
                                            { label: 'Federal Unemployment (FUTA)', value: employerTaxes.futa },
                                            { label: 'State Unemployment (SUTA)', value: employerTaxes.suta },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm text-white/60">{item.label}</span>
                                                <span className="text-sm text-white">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                            <span className="font-medium text-white">Total Employer Taxes</span>
                                            <span className="font-medium text-white">
                                                ${totalEmployerTaxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-white">Total Payroll Cost</p>
                                            <p className="text-sm text-white/50">Wages + Employer Taxes</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            ${(totals.grossPay + totalEmployerTaxes).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Confirm */}
                        {currentStep === 2 && !isSubmitting && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Submit Payroll</h3>
                                    <p className="text-white/50 max-w-md mx-auto">
                                        Please review the details below. Once submitted, direct deposits will be initiated.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-sm mb-1">Pay Date</p>
                                        <p className="text-lg font-semibold text-white">{payPeriod.payDate}</p>
                                    </div>
                                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-sm mb-1">Employees</p>
                                        <p className="text-lg font-semibold text-white">{totals.employeeCount}</p>
                                    </div>
                                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-sm mb-1">Net Pay (Direct Deposit)</p>
                                        <p className="text-lg font-semibold text-white">
                                            ${totals.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-white/40 text-sm mb-1">Total Debit</p>
                                        <p className="text-lg font-semibold text-white">
                                            ${(totals.grossPay + totalEmployerTaxes).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Ensure sufficient funds</p>
                                        <p className="text-xs text-white/50">
                                            The total amount will be debited from your connected bank account on the pay date.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-white">Secure processing</p>
                                        <p className="text-xs text-white/40">256-bit encryption · NACHA compliant</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Submitting State */}
                        {isSubmitting && (
                            <motion.div
                                key="submitting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16"
                            >
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6" />
                                <h3 className="text-xl font-semibold text-white mb-2">Processing Payroll...</h3>
                                <p className="text-white/50">Please wait while we submit your payroll.</p>
                            </motion.div>
                        )}

                        {/* Step 4: Complete */}
                        {currentStep === 3 && isComplete && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
                                    className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6"
                                >
                                    <Check className="w-10 h-10 text-white" />
                                </motion.div>
                                <h3 className="text-2xl font-semibold text-white mb-2">Payroll Submitted! 🎉</h3>
                                <p className="text-white/50 text-center max-w-md mb-8">
                                    Your payroll has been successfully submitted. Employees will receive their direct deposits on {payPeriod.payDate}.
                                </p>

                                <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                        <p className="text-2xl font-semibold text-white">{totals.employeeCount}</p>
                                        <p className="text-xs text-white/40">Employees Paid</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                        <p className="text-2xl font-semibold text-emerald-400">
                                            ${totals.netPay.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-xs text-white/40">Total Net Pay</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                                        <p className="text-2xl font-semibold text-white">{payPeriod.payDate.split(',')[0]}</p>
                                        <p className="text-xs text-white/40">Pay Date</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {!isSubmitting && (
                    <div className="flex items-center justify-between p-6 border-t border-white/[0.06]">
                        {isComplete ? (
                            <>
                                <div />
                                <Button onClick={handleClose} className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium px-8">
                                    Done
                                </Button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={goBack}
                                    disabled={currentStep === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>

                                {currentStep < 2 ? (
                                    <Button onClick={goNext} className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium">
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium"
                                    >
                                        Submit Payroll
                                        <Send className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default RunPayrollModal;
