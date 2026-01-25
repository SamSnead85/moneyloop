'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Users,
    CreditCard,
    FileText,
    Check,
    ChevronRight,
    ArrowLeft,
    Briefcase,
    MapPin,
    Calendar,
    DollarSign,
    Shield,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface CompanyInfo {
    legalName: string;
    dba: string;
    entityType: 'llc' | 'corporation' | 's_corp' | 'partnership' | 'sole_proprietorship';
    industry: string;
    ein: string;
    address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phone: string;
    website: string;
}

interface PayrollSetup {
    payFrequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
    firstPayDate: string;
    employeeCount: string;
    hasContractors: boolean;
}

interface BankingInfo {
    bankName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string;
    accountNumber: string;
    useMercury: boolean;
}

// Step definitions
const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'company', title: 'Company Info', icon: Building2 },
    { id: 'payroll', title: 'Payroll Setup', icon: DollarSign },
    { id: 'banking', title: 'Banking', icon: CreditCard },
    { id: 'review', title: 'Review', icon: FileText },
];

// Welcome Step
function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center mx-auto mb-8">
                <Building2 className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
                Welcome to Employer Hub
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto">
                Set up your business account in minutes. We'll help you manage payroll,
                benefits, and your team all in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                    { icon: Users, title: 'Team Management', desc: 'Add and manage employees' },
                    { icon: DollarSign, title: 'Automated Payroll', desc: 'Run payroll in minutes' },
                    { icon: Shield, title: 'Tax Compliance', desc: 'Form 941, W-2, 1099' },
                ].map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <feature.icon className="w-8 h-8 text-[#0ea5e9] mb-3" />
                        <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-white/40">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>

            <Button
                onClick={onNext}
                className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white px-8 py-3 text-lg font-medium hover:opacity-90"
            >
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
        </motion.div>
    );
}

// Company Info Step
function CompanyStep({
    data,
    onChange,
    onNext,
    onBack,
}: {
    data: CompanyInfo;
    onChange: (data: CompanyInfo) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const entityTypes = [
        { value: 'llc', label: 'LLC' },
        { value: 'corporation', label: 'Corporation (C-Corp)' },
        { value: 's_corp', label: 'S Corporation' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    ];

    const states = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'DC', 'VT', 'WY'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
            <p className="text-white/50 mb-8">Tell us about your business</p>

            <div className="space-y-6">
                {/* Legal Name & DBA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Legal Business Name *</label>
                        <input
                            type="text"
                            value={data.legalName}
                            onChange={(e) => onChange({ ...data, legalName: e.target.value })}
                            placeholder="Acme Technologies Inc."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-2">DBA (if different)</label>
                        <input
                            type="text"
                            value={data.dba}
                            onChange={(e) => onChange({ ...data, dba: e.target.value })}
                            placeholder="Acme"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Entity Type & Industry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Entity Type *</label>
                        <select
                            value={data.entityType}
                            onChange={(e) => onChange({ ...data, entityType: e.target.value as CompanyInfo['entityType'] })}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        >
                            <option value="">Select entity type</option>
                            {entityTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Industry</label>
                        <input
                            type="text"
                            value={data.industry}
                            onChange={(e) => onChange({ ...data, industry: e.target.value })}
                            placeholder="Technology"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                </div>

                {/* EIN */}
                <div>
                    <label className="block text-sm text-white/60 mb-2">EIN (Employer Identification Number) *</label>
                    <input
                        type="text"
                        value={data.ein}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                            const formatted = value.length > 2 ? `${value.slice(0, 2)}-${value.slice(2)}` : value;
                            onChange({ ...data, ein: formatted });
                        }}
                        placeholder="XX-XXXXXXX"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors font-mono"
                    />
                    <p className="text-xs text-white/30 mt-1">Your 9-digit federal tax ID number</p>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm text-white/60 mb-2">Business Address *</label>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={data.address.street1}
                            onChange={(e) => onChange({ ...data, address: { ...data.address, street1: e.target.value } })}
                            placeholder="Street Address"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                        <input
                            type="text"
                            value={data.address.street2}
                            onChange={(e) => onChange({ ...data, address: { ...data.address, street2: e.target.value } })}
                            placeholder="Suite, Unit, etc. (optional)"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="text"
                                value={data.address.city}
                                onChange={(e) => onChange({ ...data, address: { ...data.address, city: e.target.value } })}
                                placeholder="City"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                            />
                            <select
                                value={data.address.state}
                                onChange={(e) => onChange({ ...data, address: { ...data.address, state: e.target.value } })}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                            >
                                <option value="">State</option>
                                {states.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={data.address.zipCode}
                                onChange={(e) => onChange({ ...data, address: { ...data.address, zipCode: e.target.value.slice(0, 10) } })}
                                placeholder="ZIP"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Business Phone</label>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => onChange({ ...data, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Website</label>
                        <input
                            type="url"
                            value={data.website}
                            onChange={(e) => onChange({ ...data, website: e.target.value })}
                            placeholder="https://acme.com"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
                <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!data.legalName || !data.entityType || !data.ein}
                    className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
}

// Payroll Setup Step
function PayrollStep({
    data,
    onChange,
    onNext,
    onBack,
}: {
    data: PayrollSetup;
    onChange: (data: PayrollSetup) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const frequencies = [
        { value: 'weekly', label: 'Weekly', desc: 'Every week (52 pay periods/year)' },
        { value: 'bi-weekly', label: 'Bi-weekly', desc: 'Every 2 weeks (26 pay periods/year)' },
        { value: 'semi-monthly', label: 'Semi-monthly', desc: '1st & 15th of month (24 pay periods/year)' },
        { value: 'monthly', label: 'Monthly', desc: 'Once per month (12 pay periods/year)' },
    ];

    const employeeCounts = [
        { value: '1-5', label: '1-5 employees' },
        { value: '6-10', label: '6-10 employees' },
        { value: '11-25', label: '11-25 employees' },
        { value: '26-50', label: '26-50 employees' },
        { value: '51-100', label: '51-100 employees' },
        { value: '100+', label: '100+ employees' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-white mb-2">Payroll Setup</h2>
            <p className="text-white/50 mb-8">Configure how you'll pay your team</p>

            <div className="space-y-8">
                {/* Pay Frequency */}
                <div>
                    <label className="block text-sm text-white/60 mb-3">Pay Frequency *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {frequencies.map((freq) => (
                            <button
                                key={freq.value}
                                onClick={() => onChange({ ...data, payFrequency: freq.value as PayrollSetup['payFrequency'] })}
                                className={`p-4 rounded-xl border text-left transition-all ${data.payFrequency === freq.value
                                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-white">{freq.label}</span>
                                    {data.payFrequency === freq.value && (
                                        <Check className="w-5 h-5 text-[#0ea5e9]" />
                                    )}
                                </div>
                                <p className="text-xs text-white/40">{freq.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* First Pay Date */}
                <div>
                    <label className="block text-sm text-white/60 mb-2">First Pay Date *</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="date"
                            value={data.firstPayDate}
                            onChange={(e) => onChange({ ...data, firstPayDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>
                    <p className="text-xs text-white/30 mt-1">When will you run your first payroll?</p>
                </div>

                {/* Employee Count */}
                <div>
                    <label className="block text-sm text-white/60 mb-3">Team Size *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {employeeCounts.map((count) => (
                            <button
                                key={count.value}
                                onClick={() => onChange({ ...data, employeeCount: count.value })}
                                className={`p-3 rounded-xl border text-center transition-all ${data.employeeCount === count.value
                                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className="text-sm font-medium">{count.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contractors */}
                <div>
                    <label className="block text-sm text-white/60 mb-3">Do you work with contractors?</label>
                    <div className="flex gap-3">
                        {[
                            { value: true, label: 'Yes, I have 1099 contractors' },
                            { value: false, label: 'No, only W-2 employees' },
                        ].map((option) => (
                            <button
                                key={String(option.value)}
                                onClick={() => onChange({ ...data, hasContractors: option.value })}
                                className={`flex-1 p-4 rounded-xl border text-center transition-all ${data.hasContractors === option.value
                                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50 text-white'
                                    : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className="text-sm font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
                <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!data.payFrequency || !data.firstPayDate || !data.employeeCount}
                    className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 disabled:opacity-50"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
}

// Banking Step
function BankingStep({
    data,
    onChange,
    onNext,
    onBack,
}: {
    data: BankingInfo;
    onChange: (data: BankingInfo) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-white mb-2">Banking Setup</h2>
            <p className="text-white/50 mb-8">Connect your business bank account for payroll</p>

            <div className="space-y-6">
                {/* Mercury Integration */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">Mercury Bank</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-medium">Recommended</span>
                            </div>
                            <p className="text-sm text-white/50 mb-3">
                                Connect your Mercury account for seamless payroll processing with automatic ACH transfers.
                            </p>
                            <Button
                                onClick={() => onChange({ ...data, useMercury: true })}
                                variant={data.useMercury ? 'primary' : 'secondary'}
                                className={data.useMercury ? 'bg-purple-500 text-white' : ''}
                            >
                                {data.useMercury ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Connected
                                    </>
                                ) : (
                                    'Connect Mercury'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-sm text-white/30">or add manually</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Manual Bank Entry */}
                <div className={`space-y-4 ${data.useMercury ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Bank Name</label>
                        <input
                            type="text"
                            value={data.bankName}
                            onChange={(e) => onChange({ ...data, bankName: e.target.value, useMercury: false })}
                            placeholder="Chase, Bank of America, etc."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-2">Account Type</label>
                        <div className="flex gap-3">
                            {['checking', 'savings'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onChange({ ...data, accountType: type as 'checking' | 'savings', useMercury: false })}
                                    className={`flex-1 p-3 rounded-xl border transition-all capitalize ${data.accountType === type
                                        ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50 text-white'
                                        : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Routing Number</label>
                            <input
                                type="text"
                                value={data.routingNumber}
                                onChange={(e) => onChange({ ...data, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9), useMercury: false })}
                                placeholder="9 digits"
                                maxLength={9}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Account Number</label>
                            <input
                                type="text"
                                value={data.accountNumber}
                                onChange={(e) => onChange({ ...data, accountNumber: e.target.value.replace(/\D/g, ''), useMercury: false })}
                                placeholder="Account number"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 transition-colors font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <Shield className="w-5 h-5 text-[#34d399] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-white/70">Bank-level security</p>
                        <p className="text-xs text-white/40">Your banking information is encrypted with 256-bit SSL and stored securely.</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
                <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!data.useMercury && (!data.bankName || !data.routingNumber || !data.accountNumber)}
                    className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 disabled:opacity-50"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
}

// Review Step
function ReviewStep({
    companyInfo,
    payrollSetup,
    bankingInfo,
    onBack,
    onComplete,
    isSubmitting,
}: {
    companyInfo: CompanyInfo;
    payrollSetup: PayrollSetup;
    bankingInfo: BankingInfo;
    onBack: () => void;
    onComplete: () => void;
    isSubmitting: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-white mb-2">Review Your Setup</h2>
            <p className="text-white/50 mb-8">Make sure everything looks correct</p>

            <div className="space-y-4">
                {/* Company Info */}
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="font-medium text-white">Company Information</h3>
                        </div>
                        <button className="text-sm text-[#0ea5e9] hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                            <p className="text-white/40">Legal Name</p>
                            <p className="text-white">{companyInfo.legalName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">Entity Type</p>
                            <p className="text-white capitalize">{companyInfo.entityType?.replace('_', ' ') || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">EIN</p>
                            <p className="text-white font-mono">{companyInfo.ein || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">Location</p>
                            <p className="text-white">{companyInfo.address.city}, {companyInfo.address.state}</p>
                        </div>
                    </div>
                </Card>

                {/* Payroll Setup */}
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="font-medium text-white">Payroll Configuration</h3>
                        </div>
                        <button className="text-sm text-[#0ea5e9] hover:underline">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                            <p className="text-white/40">Pay Frequency</p>
                            <p className="text-white capitalize">{payrollSetup.payFrequency?.replace('-', '-') || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">First Pay Date</p>
                            <p className="text-white">{payrollSetup.firstPayDate || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">Team Size</p>
                            <p className="text-white">{payrollSetup.employeeCount || '-'}</p>
                        </div>
                        <div>
                            <p className="text-white/40">Contractors</p>
                            <p className="text-white">{payrollSetup.hasContractors ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </Card>

                {/* Banking */}
                <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="font-medium text-white">Banking</h3>
                        </div>
                        <button className="text-sm text-[#0ea5e9] hover:underline">Edit</button>
                    </div>
                    <div className="text-sm">
                        {bankingInfo.useMercury ? (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white">Mercury Bank</p>
                                    <p className="text-white/40 text-xs">Connected</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-3">
                                <div>
                                    <p className="text-white/40">Bank</p>
                                    <p className="text-white">{bankingInfo.bankName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-white/40">Account</p>
                                    <p className="text-white capitalize">{bankingInfo.accountType} ****{bankingInfo.accountNumber?.slice(-4)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Terms */}
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-white/40">
                    By clicking "Complete Setup", you agree to our Terms of Service and authorize MoneyLoop to
                    initiate ACH debits and credits from your connected bank account for payroll processing.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={onComplete}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white px-6 hover:opacity-90 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up...
                        </>
                    ) : (
                        <>
                            Complete Setup
                            <Check className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}

// Main Onboarding Component
export default function EmployerOnboarding() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        legalName: '',
        dba: '',
        entityType: '' as CompanyInfo['entityType'],
        industry: '',
        ein: '',
        address: { street1: '', street2: '', city: '', state: '', zipCode: '' },
        phone: '',
        website: '',
    });

    const [payrollSetup, setPayrollSetup] = useState<PayrollSetup>({
        payFrequency: '' as PayrollSetup['payFrequency'],
        firstPayDate: '',
        employeeCount: '',
        hasContractors: false,
    });

    const [bankingInfo, setBankingInfo] = useState<BankingInfo>({
        bankName: '',
        accountType: 'checking',
        routingNumber: '',
        accountNumber: '',
        useMercury: false,
    });

    const handleComplete = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Navigate to employer dashboard
        router.push('/employer');
    };

    const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    return (
        <div className="min-h-screen bg-[#0a0a10] flex flex-col">
            {/* Header */}
            <header className="p-6 flex items-center justify-between border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-white">MoneyLoop</span>
                        <span className="block text-[10px] text-white/40">Employer Hub Setup</span>
                    </div>
                </div>

                {currentStep > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                        {steps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${i < currentStep
                                        ? 'bg-[#0ea5e9] text-white'
                                        : i === currentStep
                                            ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]'
                                            : 'bg-white/[0.05] text-white/30'
                                        }`}
                                >
                                    {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-[#0ea5e9]' : 'bg-white/[0.08]'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && <WelcomeStep key="welcome" onNext={goNext} />}
                    {currentStep === 1 && (
                        <CompanyStep
                            key="company"
                            data={companyInfo}
                            onChange={setCompanyInfo}
                            onNext={goNext}
                            onBack={goBack}
                        />
                    )}
                    {currentStep === 2 && (
                        <PayrollStep
                            key="payroll"
                            data={payrollSetup}
                            onChange={setPayrollSetup}
                            onNext={goNext}
                            onBack={goBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <BankingStep
                            key="banking"
                            data={bankingInfo}
                            onChange={setBankingInfo}
                            onNext={goNext}
                            onBack={goBack}
                        />
                    )}
                    {currentStep === 4 && (
                        <ReviewStep
                            key="review"
                            companyInfo={companyInfo}
                            payrollSetup={payrollSetup}
                            bankingInfo={bankingInfo}
                            onBack={goBack}
                            onComplete={handleComplete}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
