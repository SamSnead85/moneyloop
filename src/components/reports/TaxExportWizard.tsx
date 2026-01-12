'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    FileText,
    Calendar,
    Filter,
    Check,
    ChevronDown,
    FileSpreadsheet,
    AlertCircle,
    Building2,
    Home,
    Briefcase,
} from 'lucide-react';
import { useHousehold, FinanceContext } from '../household/HouseholdProvider';
import { cn } from '@/lib/utils';

type ExportFormat = 'csv' | 'pdf' | 'json';
type DateRange = 'ytd' | 'last-year' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom';

interface TaxExportWizardProps {
    onExport?: (config: TaxExportConfig) => Promise<void>;
}

interface TaxExportConfig {
    format: ExportFormat;
    dateRange: DateRange;
    customStartDate?: string;
    customEndDate?: string;
    contexts: string[]; // context IDs to include
    separateByContext: boolean;
    includeCategories: boolean;
    includeTags: boolean;
    includeNotes: boolean;
}

const dateRangeLabels: Record<DateRange, string> = {
    'ytd': 'Year to Date',
    'last-year': 'Last Year (2025)',
    'q1': 'Q1 (Jan - Mar)',
    'q2': 'Q2 (Apr - Jun)',
    'q3': 'Q3 (Jul - Sep)',
    'q4': 'Q4 (Oct - Dec)',
    'custom': 'Custom Range',
};

export function TaxExportWizard({ onExport }: TaxExportWizardProps) {
    const { contexts } = useHousehold();

    const [step, setStep] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [config, setConfig] = useState<TaxExportConfig>({
        format: 'csv',
        dateRange: 'last-year',
        contexts: contexts.map(c => c.id),
        separateByContext: true,
        includeCategories: true,
        includeTags: true,
        includeNotes: false,
    });

    const updateConfig = (updates: Partial<TaxExportConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const toggleContext = (contextId: string) => {
        setConfig(prev => ({
            ...prev,
            contexts: prev.contexts.includes(contextId)
                ? prev.contexts.filter(id => id !== contextId)
                : [...prev.contexts, contextId],
        }));
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            if (onExport) {
                await onExport(config);
            } else {
                // Default export behavior - generate and download
                await generateExport(config);
            }
        } finally {
            setExporting(false);
        }
    };

    const generateExport = async (cfg: TaxExportConfig) => {
        // Placeholder for actual export logic
        console.log('Exporting with config:', cfg);

        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In production, this would:
        // 1. Fetch transactions for selected contexts and date range
        // 2. Format data according to selected format
        // 3. If separateByContext, create separate files/sections
        // 4. Trigger download
    };

    const getContextIcon = (type: FinanceContext['type']) => {
        switch (type) {
            case 'personal': return Home;
            case 'business': return Briefcase;
            case 'investment': return Building2;
            default: return FileText;
        }
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                        <FileSpreadsheet className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-100">Tax Export Wizard</h2>
                        <p className="text-sm text-zinc-500">
                            Export your financial data with personal/business separation
                        </p>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-6">
                {/* Step 1: Select Contexts */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                            step >= 1 ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'
                        )}>
                            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                        </div>
                        <span className="font-medium text-zinc-200">Select Finance Contexts</span>
                    </div>

                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pl-8 space-y-3"
                        >
                            <p className="text-sm text-zinc-500">
                                Choose which contexts to include in your export. Personal and business will be separated.
                            </p>

                            <div className="space-y-2">
                                {contexts.map(ctx => {
                                    const Icon = getContextIcon(ctx.type);
                                    const isSelected = config.contexts.includes(ctx.id);

                                    return (
                                        <button
                                            key={ctx.id}
                                            onClick={() => toggleContext(ctx.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                                                isSelected
                                                    ? 'bg-zinc-800 border-emerald-500/50'
                                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                            )}
                                        >
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${ctx.color}20` }}
                                            >
                                                <Icon className="w-4 h-4" style={{ color: ctx.color }} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-zinc-200">{ctx.name}</p>
                                                <p className="text-xs text-zinc-500 capitalize">{ctx.type}</p>
                                            </div>
                                            {ctx.tax_separate && (
                                                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded">
                                                    Tax Separate
                                                </span>
                                            )}
                                            {isSelected && (
                                                <Check className="w-5 h-5 text-emerald-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="separate-contexts"
                                    checked={config.separateByContext}
                                    onChange={e => updateConfig({ separateByContext: e.target.checked })}
                                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                                />
                                <label htmlFor="separate-contexts" className="text-sm text-zinc-400">
                                    Generate separate files for each context
                                </label>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={config.contexts.length === 0}
                                className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Continue
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Step 2: Date Range */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                            step >= 2 ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'
                        )}>
                            {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                        </div>
                        <span className={cn(
                            'font-medium',
                            step >= 2 ? 'text-zinc-200' : 'text-zinc-500'
                        )}>
                            Select Date Range
                        </span>
                    </div>

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pl-8 space-y-3"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(dateRangeLabels) as DateRange[]).map(range => (
                                    <button
                                        key={range}
                                        onClick={() => updateConfig({ dateRange: range })}
                                        className={cn(
                                            'p-3 rounded-lg border text-left transition-colors',
                                            config.dateRange === range
                                                ? 'bg-zinc-800 border-emerald-500/50'
                                                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                        )}
                                    >
                                        <p className="text-sm font-medium text-zinc-200">
                                            {dateRangeLabels[range]}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {config.dateRange === 'custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={config.customStartDate || ''}
                                            onChange={e => updateConfig({ customStartDate: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">End Date</label>
                                        <input
                                            type="date"
                                            value={config.customEndDate || ''}
                                            onChange={e => updateConfig({ customEndDate: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Step 3: Export Options */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                            step >= 3 ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'
                        )}>
                            3
                        </div>
                        <span className={cn(
                            'font-medium',
                            step >= 3 ? 'text-zinc-200' : 'text-zinc-500'
                        )}>
                            Export Options
                        </span>
                    </div>

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pl-8 space-y-4"
                        >
                            {/* Format Selection */}
                            <div>
                                <p className="text-sm text-zinc-400 mb-2">Export Format</p>
                                <div className="flex gap-2">
                                    {(['csv', 'pdf', 'json'] as ExportFormat[]).map(format => (
                                        <button
                                            key={format}
                                            onClick={() => updateConfig({ format })}
                                            className={cn(
                                                'flex-1 py-2 px-4 rounded-lg border uppercase text-sm font-medium transition-colors',
                                                config.format === format
                                                    ? 'bg-zinc-800 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            )}
                                        >
                                            {format}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Include Options */}
                            <div className="space-y-2">
                                <p className="text-sm text-zinc-400">Include in Export</p>
                                {[
                                    { key: 'includeCategories', label: 'Transaction Categories' },
                                    { key: 'includeTags', label: 'Tags' },
                                    { key: 'includeNotes', label: 'Notes & Descriptions' },
                                ].map(option => (
                                    <label
                                        key={option.key}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={config[option.key as keyof TaxExportConfig] as boolean}
                                            onChange={e => updateConfig({ [option.key]: e.target.checked })}
                                            className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                                        />
                                        <span className="text-sm text-zinc-300">{option.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Tax Notice */}
                            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5" />
                                    <p className="text-sm text-orange-300">
                                        This export separates personal and business transactions for tax preparation.
                                        Consult with your tax professional for proper filing.
                                    </p>
                                </div>
                            </div>

                            {/* Export Button */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                >
                                    {exporting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Export for Tax Prep
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaxExportWizard;
