'use client';

import { motion } from 'framer-motion';
import {
    Building2,
    ChevronRight,
    ArrowLeft,
    MapPin,
    Check,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { CompanyInfo } from '../EliteOnboardingWizard';

interface EliteCompanyStepProps {
    data: CompanyInfo;
    onChange: (data: CompanyInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

// Entity type options with descriptions
const entityTypes = [
    { value: 'llc', label: 'LLC', desc: 'Limited Liability Company' },
    { value: 'corporation', label: 'C-Corp', desc: 'C Corporation' },
    { value: 's_corp', label: 'S-Corp', desc: 'S Corporation' },
    { value: 'partnership', label: 'Partnership', desc: 'General/Limited Partnership' },
    { value: 'sole_proprietorship', label: 'Sole Prop', desc: 'Sole Proprietorship' },
    { value: 'nonprofit', label: 'Nonprofit', desc: '501(c)(3) Organization' },
];

// US States
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

// Popular industries
const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
    'Professional Services', 'Construction', 'Restaurant & Food',
    'Real Estate', 'Education', 'Media & Entertainment', 'Other'
];

// Elite input component
function EliteInput({
    label,
    value,
    onChange,
    placeholder,
    required,
    type = 'text',
    error,
    className = '',
    mono = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    type?: string;
    error?: string;
    className?: string;
    mono?: boolean;
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-white/70 mb-2">
                {label} {required && <span className="text-emerald-400">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 bg-white/[0.03] border ${error ? 'border-red-500/50' : 'border-white/[0.08]'
                        } rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-200 ${mono ? 'font-mono tracking-wide' : ''
                        }`}
                />
                {error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}

export function EliteCompanyStep({ data, onChange, onNext, onBack }: EliteCompanyStepProps) {
    // Format EIN as XX-XXXXXXX
    const handleEinChange = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 9);
        const formatted = cleaned.length > 2 ? `${cleaned.slice(0, 2)}-${cleaned.slice(2)}` : cleaned;
        onChange({ ...data, ein: formatted });
    };

    // Validate for next
    const canProceed = data.legalName && data.entityType && data.ein.length === 10 &&
        data.address.street1 && data.address.city && data.address.state && data.address.zipCode;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4"
                >
                    <Building2 className="w-3 h-3" />
                    Step 1 of 5
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Company Information
                </h2>
                <p className="text-white/50">
                    Tell us about your business to get started
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Legal Name & DBA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EliteInput
                        label="Legal Business Name"
                        value={data.legalName}
                        onChange={(v) => onChange({ ...data, legalName: v })}
                        placeholder="Acme Technologies Inc."
                        required
                    />
                    <EliteInput
                        label="DBA (if different)"
                        value={data.dba}
                        onChange={(v) => onChange({ ...data, dba: v })}
                        placeholder="Acme"
                    />
                </div>

                {/* Entity Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-3">
                        Entity Type <span className="text-emerald-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {entityTypes.map((type) => (
                            <motion.button
                                key={type.value}
                                type="button"
                                onClick={() => onChange({ ...data, entityType: type.value as CompanyInfo['entityType'] })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${data.entityType === type.value
                                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]'
                                    }`}
                            >
                                {data.entityType === type.value && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}
                                <div className="font-semibold text-white">{type.label}</div>
                                <div className="text-xs text-white/40">{type.desc}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* EIN & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            EIN <span className="text-emerald-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.ein}
                            onChange={(e) => handleEinChange(e.target.value)}
                            placeholder="XX-XXXXXXX"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 transition-all font-mono tracking-widest"
                        />
                        <p className="text-xs text-white/30 mt-1">9-digit federal tax ID</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Industry
                        </label>
                        <select
                            value={data.industry}
                            onChange={(e) => onChange({ ...data, industry: e.target.value })}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        >
                            <option value="">Select industry</option>
                            {industries.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        Business Address <span className="text-emerald-400">*</span>
                    </div>

                    <EliteInput
                        label="Street Address"
                        value={data.address.street1}
                        onChange={(v) => onChange({ ...data, address: { ...data.address, street1: v } })}
                        placeholder="123 Main Street"
                        required
                    />
                    <EliteInput
                        label="Suite, Unit, etc."
                        value={data.address.street2}
                        onChange={(v) => onChange({ ...data, address: { ...data.address, street2: v } })}
                        placeholder="Suite 100 (optional)"
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <EliteInput
                            label="City"
                            value={data.address.city}
                            onChange={(v) => onChange({ ...data, address: { ...data.address, city: v } })}
                            placeholder="City"
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                State <span className="text-emerald-400">*</span>
                            </label>
                            <select
                                value={data.address.state}
                                onChange={(e) => onChange({ ...data, address: { ...data.address, state: e.target.value } })}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            >
                                <option value="">State</option>
                                {states.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>
                        <EliteInput
                            label="ZIP"
                            value={data.address.zipCode}
                            onChange={(v) => onChange({ ...data, address: { ...data.address, zipCode: v.slice(0, 10) } })}
                            placeholder="12345"
                            required
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EliteInput
                        label="Business Phone"
                        value={data.phone}
                        onChange={(v) => onChange({ ...data, phone: v })}
                        placeholder="(555) 123-4567"
                        type="tel"
                    />
                    <EliteInput
                        label="Website"
                        value={data.website}
                        onChange={(v) => onChange({ ...data, website: v })}
                        placeholder="https://example.com"
                        type="url"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                <motion.button
                    onClick={onNext}
                    disabled={!canProceed}
                    whileHover={canProceed ? { scale: 1.02 } : {}}
                    whileTap={canProceed ? { scale: 0.98 } : {}}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${canProceed
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}
