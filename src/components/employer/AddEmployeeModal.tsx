'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Briefcase,
    Building2,
    CreditCard,
    MapPin,
    Clock,
    Check,
    ChevronRight,
    ChevronLeft,
    Users,
    Send,
    AlertCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeFormData) => void;
}

interface EmployeeFormData {
    // Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;

    // Address
    address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
    };

    // Employment
    employmentType: 'full-time' | 'part-time' | 'contractor';
    department: string;
    jobTitle: string;
    manager: string;
    startDate: string;
    workLocation: 'remote' | 'office' | 'hybrid';

    // Compensation
    compensationType: 'salary' | 'hourly';
    amount: number;
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';

    // Invite
    sendInvite: boolean;
}

const initialFormData: EmployeeFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
    },
    employmentType: 'full-time',
    department: '',
    jobTitle: '',
    manager: '',
    startDate: '',
    workLocation: 'office',
    compensationType: 'salary',
    amount: 0,
    payFrequency: 'bi-weekly',
    sendInvite: true,
};

const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'employment', title: 'Employment', icon: Briefcase },
    { id: 'compensation', title: 'Compensation', icon: DollarSign },
    { id: 'review', title: 'Review', icon: Check },
];

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Legal'];
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

export function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateAddress = (field: keyof EmployeeFormData['address'], value: string) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSubmit(formData);
        setIsSubmitting(false);
        onClose();
        setFormData(initialFormData);
        setCurrentStep(0);
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0f1c] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
                        <p className="text-sm text-white/40">Step {currentStep + 1} of {steps.length}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 p-4 border-b border-white/[0.04]">
                    {steps.map((step, i) => {
                        const StepIcon = step.icon;
                        return (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => i < currentStep && setCurrentStep(i)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${i === currentStep
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : i < currentStep
                                                ? 'text-cyan-400/60 hover:bg-white/[0.05]'
                                                : 'text-white/30'
                                        }`}
                                >
                                    <StepIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                                </button>
                                {i < steps.length - 1 && (
                                    <ChevronRight className={`w-4 h-4 mx-1 ${i < currentStep ? 'text-cyan-400/40' : 'text-white/20'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {currentStep === 0 && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateField('firstName', e.target.value)}
                                            placeholder="John"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateField('lastName', e.target.value)}
                                            placeholder="Doe"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Work Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            placeholder="john@company.com"
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            placeholder="(555) 123-4567"
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Home Address</label>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={formData.address.street1}
                                            onChange={(e) => updateAddress('street1', e.target.value)}
                                            placeholder="Street Address"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                value={formData.address.city}
                                                onChange={(e) => updateAddress('city', e.target.value)}
                                                placeholder="City"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <select
                                                value={formData.address.state}
                                                onChange={(e) => updateAddress('state', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                            >
                                                <option value="">State</option>
                                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <input
                                                type="text"
                                                value={formData.address.zipCode}
                                                onChange={(e) => updateAddress('zipCode', e.target.value)}
                                                placeholder="ZIP"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Employment */}
                        {currentStep === 1 && (
                            <motion.div
                                key="employment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Employment Type *</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['full-time', 'part-time', 'contractor'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateField('employmentType', type)}
                                                className={`p-4 rounded-xl border text-center transition-all ${formData.employmentType === type
                                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {type === 'full-time' ? 'W-2 Employee' : type === 'part-time' ? 'W-2 Part-time' : '1099 Contractor'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Department *</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => updateField('department', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                        >
                                            <option value="">Select department</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Job Title *</label>
                                        <input
                                            type="text"
                                            value={formData.jobTitle}
                                            onChange={(e) => updateField('jobTitle', e.target.value)}
                                            placeholder="Software Engineer"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Start Date *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => updateField('startDate', e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Work Location</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['office', 'remote', 'hybrid'] as const).map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => updateField('workLocation', loc)}
                                                className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${formData.workLocation === loc
                                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                    }`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Compensation */}
                        {currentStep === 2 && (
                            <motion.div
                                key="compensation"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Compensation Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['salary', 'hourly'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateField('compensationType', type)}
                                                className={`p-4 rounded-xl border text-center transition-all ${formData.compensationType === type
                                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                    }`}
                                            >
                                                <DollarSign className="w-5 h-5 mx-auto mb-2" />
                                                <span className="text-sm font-medium capitalize">{type}</span>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {type === 'salary' ? 'Annual amount' : 'Per hour rate'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        {formData.compensationType === 'salary' ? 'Annual Salary' : 'Hourly Rate'} *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                        <input
                                            type="number"
                                            value={formData.amount || ''}
                                            onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                                            placeholder={formData.compensationType === 'salary' ? '75000' : '45'}
                                            className="w-full pl-8 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                                            {formData.compensationType === 'salary' ? '/year' : '/hour'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Pay Frequency *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {([
                                            { value: 'weekly', label: 'Weekly', desc: '52 pay periods' },
                                            { value: 'bi-weekly', label: 'Bi-weekly', desc: '26 pay periods' },
                                            { value: 'semi-monthly', label: 'Semi-monthly', desc: '24 pay periods' },
                                            { value: 'monthly', label: 'Monthly', desc: '12 pay periods' },
                                        ] as const).map((freq) => (
                                            <button
                                                key={freq.value}
                                                onClick={() => updateField('payFrequency', freq.value)}
                                                className={`p-3 rounded-xl border text-left transition-all ${formData.payFrequency === freq.value
                                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{freq.label}</span>
                                                <p className="text-xs text-white/40">{freq.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="sendInvite"
                                            checked={formData.sendInvite}
                                            onChange={(e) => updateField('sendInvite', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="sendInvite">
                                            <span className="text-sm font-medium text-white block">Send onboarding invite</span>
                                            <span className="text-xs text-white/50">
                                                Employee will receive an email to complete their W-4, direct deposit, and emergency contact info.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 3 && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4 text-cyan-400" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-white/40">Name</span>
                                            <p className="text-white">{formData.firstName} {formData.lastName}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Email</span>
                                            <p className="text-white">{formData.email || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Phone</span>
                                            <p className="text-white">{formData.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Location</span>
                                            <p className="text-white">{formData.address.city}, {formData.address.state}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-cyan-400" />
                                        Employment Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-white/40">Type</span>
                                            <p className="text-white capitalize">{formData.employmentType.replace('-', ' ')}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Department</span>
                                            <p className="text-white">{formData.department || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Title</span>
                                            <p className="text-white">{formData.jobTitle || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Start Date</span>
                                            <p className="text-white">{formData.startDate || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-cyan-400" />
                                        Compensation
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-white/40">
                                                {formData.compensationType === 'salary' ? 'Annual Salary' : 'Hourly Rate'}
                                            </span>
                                            <p className="text-white text-lg font-semibold">
                                                ${formData.amount.toLocaleString()}{formData.compensationType === 'hourly' ? '/hr' : '/yr'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-white/40">Pay Frequency</span>
                                            <p className="text-white capitalize">{formData.payFrequency.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                </div>

                                {formData.sendInvite && (
                                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3">
                                        <Send className="w-5 h-5 text-cyan-400" />
                                        <div>
                                            <p className="text-sm text-white">Onboarding invite will be sent</p>
                                            <p className="text-xs text-white/50">{formData.email}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
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

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={goNext} className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium">
                            Continue
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Employee'}
                            <Check className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default AddEmployeeModal;
