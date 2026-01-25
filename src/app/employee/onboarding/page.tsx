'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    FileText,
    CreditCard,
    Phone,
    Shield,
    Check,
    ChevronRight,
    ChevronLeft,
    Upload,
    Building2,
    Heart,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface EmployeeOnboardingData {
    // Personal Info
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    phone: string;

    // Address
    address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
    };

    // Emergency Contact
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };

    // W-4 Information
    w4: {
        filingStatus: 'single' | 'married' | 'head_of_household';
        dependents: number;
        additionalWithholding: number;
        multipleJobs: boolean;
    };

    // Direct Deposit
    directDeposit: {
        bankName: string;
        accountType: 'checking' | 'savings';
        routingNumber: string;
        accountNumber: string;
        confirmAccountNumber: string;
    };

    // Documents
    documentsAcknowledged: boolean;
    i9Completed: boolean;
}

const initialData: EmployeeOnboardingData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    phone: '',
    address: { street1: '', street2: '', city: '', state: '', zipCode: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    w4: { filingStatus: 'single', dependents: 0, additionalWithholding: 0, multipleJobs: false },
    directDeposit: { bankName: '', accountType: 'checking', routingNumber: '', accountNumber: '', confirmAccountNumber: '' },
    documentsAcknowledged: false,
    i9Completed: false,
};

const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'tax', title: 'Tax Forms', icon: FileText },
    { id: 'banking', title: 'Direct Deposit', icon: CreditCard },
    { id: 'documents', title: 'Documents', icon: Shield },
    { id: 'complete', title: 'Complete', icon: CheckCircle2 },
];

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

// Mock company and employee info from invite
const inviteInfo = {
    companyName: 'Acme Technologies',
    employeeName: 'Jordan Taylor',
    employeeEmail: 'jordan@acme.com',
    jobTitle: 'Customer Success Manager',
    department: 'Operations',
    startDate: 'February 1, 2026',
    manager: 'Emily Rodriguez',
};

export default function EmployeeOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<EmployeeOnboardingData>({
        ...initialData,
        firstName: inviteInfo.employeeName.split(' ')[0],
        lastName: inviteInfo.employeeName.split(' ')[1] || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const updateField = <K extends keyof EmployeeOnboardingData>(field: K, value: EmployeeOnboardingData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = <K extends keyof EmployeeOnboardingData>(
        parent: K,
        field: keyof EmployeeOnboardingData[K],
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev[parent] as object), [field]: value }
        }));
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsComplete(true);
        setCurrentStep(5);
    };

    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Company Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-1">{inviteInfo.companyName}</h1>
                    <p className="text-white/40">Employee Onboarding</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i === currentStep
                                        ? 'bg-cyan-500 text-white'
                                        : i < currentStep
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'bg-white/[0.05] text-white/30'
                                    }`}
                            >
                                {i < currentStep ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <step.icon className="w-4 h-4" />
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-cyan-500/50' : 'bg-white/[0.08]'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card Container */}
                <Card className="bg-[#0a0f1c] border border-white/[0.08] rounded-2xl overflow-hidden">
                    {/* Content */}
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {/* Step 0: Welcome */}
                            {currentStep === 0 && (
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">
                                        Welcome to {inviteInfo.companyName}! 🎉
                                    </h2>
                                    <p className="text-white/50 mb-8 max-w-md mx-auto">
                                        We're excited to have you join us as {inviteInfo.jobTitle}. Let's get you set up so you can get paid!
                                    </p>

                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-left mb-6">
                                        <h3 className="text-sm font-medium text-white/40 uppercase mb-3">Your Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/40">Position</span>
                                                <p className="text-white">{inviteInfo.jobTitle}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/40">Department</span>
                                                <p className="text-white">{inviteInfo.department}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/40">Start Date</span>
                                                <p className="text-white">{inviteInfo.startDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/40">Manager</span>
                                                <p className="text-white">{inviteInfo.manager}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/40 mb-4">
                                        This should only take about 10 minutes. You'll need:
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                                        {['SSN', 'Bank Account Info', 'Home Address'].map((item) => (
                                            <span key={item} className="px-3 py-1 rounded-full bg-white/[0.05] text-xs text-white/60">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Personal Information</h2>
                                        <p className="text-sm text-white/40">Confirm your personal details</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => updateField('firstName', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => updateField('lastName', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Social Security Number</label>
                                            <input
                                                type="password"
                                                value={formData.ssn}
                                                onChange={(e) => updateField('ssn', e.target.value)}
                                                placeholder="XXX-XX-XXXX"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            placeholder="(555) 123-4567"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Home Address</label>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={formData.address.street1}
                                                onChange={(e) => updateNestedField('address', 'street1', e.target.value)}
                                                placeholder="Street Address"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    value={formData.address.city}
                                                    onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                                                    placeholder="City"
                                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                                />
                                                <select
                                                    value={formData.address.state}
                                                    onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                                >
                                                    <option value="">State</option>
                                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={formData.address.zipCode}
                                                    onChange={(e) => updateNestedField('address', 'zipCode', e.target.value)}
                                                    placeholder="ZIP"
                                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Emergency Contact</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                value={formData.emergencyContact.name}
                                                onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                                                placeholder="Name"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <input
                                                type="text"
                                                value={formData.emergencyContact.relationship}
                                                onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
                                                placeholder="Relationship"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <input
                                                type="tel"
                                                value={formData.emergencyContact.phone}
                                                onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                                                placeholder="Phone"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Tax Forms (W-4) */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="tax"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Tax Information (W-4)</h2>
                                        <p className="text-sm text-white/40">This determines how much tax is withheld from your paycheck</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Filing Status</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { value: 'single', label: 'Single' },
                                                { value: 'married', label: 'Married' },
                                                { value: 'head_of_household', label: 'Head of Household' },
                                            ].map((status) => (
                                                <button
                                                    key={status.value}
                                                    onClick={() => updateNestedField('w4', 'filingStatus', status.value)}
                                                    className={`p-4 rounded-xl border text-center transition-all ${formData.w4.filingStatus === status.value
                                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                            : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    <span className="text-sm font-medium">{status.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Number of Dependents</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.w4.dependents}
                                            onChange={(e) => updateNestedField('w4', 'dependents', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <p className="text-xs text-white/30 mt-1">Enter the number of qualifying children and other dependents</p>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <input
                                            type="checkbox"
                                            id="multipleJobs"
                                            checked={formData.w4.multipleJobs}
                                            onChange={(e) => updateNestedField('w4', 'multipleJobs', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="multipleJobs">
                                            <span className="text-sm font-medium text-white">Multiple Jobs or Spouse Works</span>
                                            <p className="text-xs text-white/40">Check this if you have more than one job or your spouse also works</p>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Additional Withholding (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.w4.additionalWithholding || ''}
                                                onChange={(e) => updateNestedField('w4', 'additionalWithholding', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                        <p className="text-xs text-white/30 mt-1">Extra amount to withhold from each paycheck</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Your information is secure</p>
                                            <p className="text-xs text-white/50">We use bank-level encryption to protect your data</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Direct Deposit */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="banking"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Direct Deposit</h2>
                                        <p className="text-sm text-white/40">Set up where you'd like to receive your paycheck</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Bank Name</label>
                                        <input
                                            type="text"
                                            value={formData.directDeposit.bankName}
                                            onChange={(e) => updateNestedField('directDeposit', 'bankName', e.target.value)}
                                            placeholder="Chase, Wells Fargo, etc."
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Account Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['checking', 'savings'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateNestedField('directDeposit', 'accountType', type)}
                                                    className={`p-4 rounded-xl border text-center transition-all ${formData.directDeposit.accountType === type
                                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                            : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    <span className="text-sm font-medium capitalize">{type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Routing Number</label>
                                        <input
                                            type="text"
                                            value={formData.directDeposit.routingNumber}
                                            onChange={(e) => updateNestedField('directDeposit', 'routingNumber', e.target.value)}
                                            placeholder="9 digits"
                                            maxLength={9}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Account Number</label>
                                        <input
                                            type="password"
                                            value={formData.directDeposit.accountNumber}
                                            onChange={(e) => updateNestedField('directDeposit', 'accountNumber', e.target.value)}
                                            placeholder="Enter your account number"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Confirm Account Number</label>
                                        <input
                                            type="password"
                                            value={formData.directDeposit.confirmAccountNumber}
                                            onChange={(e) => updateNestedField('directDeposit', 'confirmAccountNumber', e.target.value)}
                                            placeholder="Re-enter your account number"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <p className="text-xs text-white/40">
                                            You can find your routing and account numbers at the bottom of a check, or in your bank's mobile app.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Documents */}
                            {currentStep === 4 && !isSubmitting && (
                                <motion.div
                                    key="documents"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Review & Sign Documents</h2>
                                        <p className="text-sm text-white/40">Acknowledge company policies and complete required documents</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'handbook', title: 'Employee Handbook', desc: 'Company policies and procedures', pages: 24 },
                                            { id: 'nda', title: 'Non-Disclosure Agreement', desc: 'Confidentiality agreement', pages: 3 },
                                            { id: 'ip', title: 'IP Assignment Agreement', desc: 'Intellectual property assignment', pages: 2 },
                                            { id: 'at-will', title: 'At-Will Employment', desc: 'Employment terms acknowledgment', pages: 1 },
                                        ].map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-cyan-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{doc.title}</p>
                                                        <p className="text-xs text-white/40">{doc.desc} · {doc.pages} pages</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-cyan-400">
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                        <input
                                            type="checkbox"
                                            id="acknowledge"
                                            checked={formData.documentsAcknowledged}
                                            onChange={(e) => updateField('documentsAcknowledged', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="acknowledge">
                                            <span className="text-sm font-medium text-white">I have read and agree to all documents</span>
                                            <p className="text-xs text-white/50">By checking this box, I acknowledge that I have read and agree to the above documents.</p>
                                        </label>
                                    </div>

                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-white">I-9 Form Required</p>
                                            <p className="text-xs text-white/50">
                                                You'll need to complete an I-9 form in person on your first day.
                                                Bring your passport or a driver's license + Social Security card.
                                            </p>
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
                                    className="flex flex-col items-center justify-center py-12"
                                >
                                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6" />
                                    <h3 className="text-xl font-semibold text-white mb-2">Saving Your Information...</h3>
                                    <p className="text-white/50">Please wait while we set up your account.</p>
                                </motion.div>
                            )}

                            {/* Step 5: Complete */}
                            {currentStep === 5 && isComplete && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
                                        className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6"
                                    >
                                        <Check className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">You're All Set! 🎉</h2>
                                    <p className="text-white/50 max-w-md mx-auto mb-8">
                                        Your onboarding is complete. We'll see you on {inviteInfo.startDate}!
                                    </p>

                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-left mb-6">
                                        <h3 className="text-sm font-medium text-white/40 uppercase mb-3">What's Next</h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Check your email for calendar invites',
                                                'Review the employee handbook',
                                                'Bring ID documents on your first day',
                                                'Complete any remaining benefits enrollment',
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                                                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                        <span className="text-cyan-400 text-xs font-semibold">{i + 1}</span>
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-white px-8">
                                        Go to Employee Portal
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation */}
                    {!isSubmitting && !isComplete && (
                        <div className="flex items-center justify-between p-6 border-t border-white/[0.06]">
                            <button
                                onClick={goBack}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            {currentStep < 4 ? (
                                <Button onClick={goNext} className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium">
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!formData.documentsAcknowledged}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Complete Onboarding
                                    <Check className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    )}
                </Card>

                {/* Help Text */}
                <p className="text-center text-sm text-white/30 mt-6">
                    Need help? Contact HR at <a href="mailto:hr@acme.com" className="text-cyan-400 hover:underline">hr@acme.com</a>
                </p>
            </motion.div>
        </div>
    );
}
