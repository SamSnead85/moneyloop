'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Shield,
    Calendar,
    Clock,
    Check,
    AlertCircle,
    AlertTriangle,
    Download,
    Upload,
    ChevronRight,
    Building2,
    DollarSign,
    Users,
    Eye,
    Send,
    RefreshCw,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface TaxFiling {
    id: string;
    type: 'form_941' | 'form_940' | 'w2' | '1099_nec' | 'state_withholding' | 'state_unemployment' | 'local';
    name: string;
    period: string;
    dueDate: string;
    status: 'not_started' | 'in_progress' | 'filed' | 'accepted' | 'overdue';
    amount?: number;
    filedDate?: string;
    agency: string;
}

interface ComplianceItem {
    id: string;
    name: string;
    description: string;
    dueDate?: string;
    status: 'compliant' | 'action_needed' | 'overdue' | 'upcoming';
    category: 'federal' | 'state' | 'benefits' | 'hr';
}

// Mock Data
const mockFilings: TaxFiling[] = [
    { id: '1', type: 'form_941', name: 'Form 941', period: 'Q4 2025', dueDate: '2026-01-31', status: 'filed', amount: 15678.90, filedDate: '2026-01-25', agency: 'IRS' },
    { id: '2', type: 'form_940', name: 'Form 940 (FUTA)', period: '2025', dueDate: '2026-01-31', status: 'in_progress', amount: 2345.67, agency: 'IRS' },
    { id: '3', type: 'w2', name: 'W-2s', period: '2025', dueDate: '2026-01-31', status: 'filed', filedDate: '2026-01-15', agency: 'SSA' },
    { id: '4', type: '1099_nec', name: '1099-NEC', period: '2025', dueDate: '2026-01-31', status: 'filed', filedDate: '2026-01-15', agency: 'IRS' },
    { id: '5', type: 'state_withholding', name: 'CA State Withholding', period: 'Q4 2025', dueDate: '2026-01-31', status: 'in_progress', amount: 8234.56, agency: 'CA FTB' },
    { id: '6', type: 'state_unemployment', name: 'CA UI/ETT/SDI', period: 'Q4 2025', dueDate: '2026-01-31', status: 'not_started', amount: 1234.56, agency: 'CA EDD' },
    { id: '7', type: 'form_941', name: 'Form 941', period: 'Q1 2026', dueDate: '2026-04-30', status: 'not_started', agency: 'IRS' },
];

const mockCompliance: ComplianceItem[] = [
    { id: 'c1', name: 'I-9 Verification', description: 'All employees verified', status: 'compliant', category: 'federal' },
    { id: 'c2', name: 'Minimum Wage', description: 'Above federal & state minimum', status: 'compliant', category: 'federal' },
    { id: 'c3', name: 'ACA Reporting', description: 'Form 1095-C due March 2', status: 'upcoming', dueDate: '2026-03-02', category: 'benefits' },
    { id: 'c4', name: 'Workers Comp Insurance', description: 'Policy renewal due Feb 15', status: 'action_needed', dueDate: '2026-02-15', category: 'state' },
    { id: 'c5', name: 'OSHA Posting', description: 'Annual posting required', status: 'compliant', category: 'federal' },
    { id: 'c6', name: 'Harassment Training', description: '2 employees need training', status: 'action_needed', category: 'hr' },
    { id: 'c7', name: '401(k) 5500 Filing', description: 'Due July 31, 2026', status: 'upcoming', dueDate: '2026-07-31', category: 'benefits' },
];

// Filing Card
function FilingCard({ filing }: { filing: TaxFiling }) {
    const getStatusConfig = (status: TaxFiling['status']) => {
        switch (status) {
            case 'filed': return { label: 'Filed', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]', icon: Check };
            case 'accepted': return { label: 'Accepted', color: 'bg-[#34d399]/10 text-[#34d399]', icon: Check };
            case 'in_progress': return { label: 'In Progress', color: 'bg-amber-400/10 text-amber-400', icon: Clock };
            case 'not_started': return { label: 'Not Started', color: 'bg-white/10 text-white/40', icon: Clock };
            case 'overdue': return { label: 'Overdue', color: 'bg-rose-400/10 text-rose-400', icon: AlertCircle };
        }
    };

    const statusConfig = getStatusConfig(filing.status);
    const StatusIcon = statusConfig.icon;
    const isDue = new Date(filing.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
        <Card className={`p-5 transition-all border ${filing.status === 'overdue'
                ? 'bg-rose-400/5 border-rose-400/20'
                : isDue && filing.status !== 'filed' && filing.status !== 'accepted'
                    ? 'bg-amber-400/5 border-amber-400/20'
                    : 'bg-white/[0.02] border-white/[0.06]'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{filing.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                    <p className="text-sm text-white/40">{filing.period} · {filing.agency}</p>
                </div>
                {filing.amount !== undefined && (
                    <p className="text-lg font-medium text-white">${filing.amount.toLocaleString()}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <span className={`${isDue && filing.status !== 'filed' && filing.status !== 'accepted' ? 'text-amber-400' : 'text-white/40'}`}>
                        Due {filing.dueDate}
                    </span>
                    {filing.filedDate && (
                        <span className="text-white/30">· Filed {filing.filedDate}</span>
                    )}
                </div>

                {filing.status !== 'filed' && filing.status !== 'accepted' && (
                    <Button variant="ghost" size="sm" className="text-[#0ea5e9]">
                        {filing.status === 'not_started' ? 'Start' : 'Continue'}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </Card>
    );
}

// Compliance Item Card
function ComplianceCard({ item }: { item: ComplianceItem }) {
    const getStatusConfig = (status: ComplianceItem['status']) => {
        switch (status) {
            case 'compliant': return { label: 'Compliant', color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', icon: Check };
            case 'action_needed': return { label: 'Action Needed', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle };
            case 'overdue': return { label: 'Overdue', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: AlertCircle };
            case 'upcoming': return { label: 'Upcoming', color: 'text-[#0ea5e9]', bg: 'bg-[#0ea5e9]/10', icon: Clock };
        }
    };

    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {item.dueDate && (
                    <span className="text-xs text-white/30">Due {item.dueDate}</span>
                )}
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>
        </div>
    );
}

// Main Component
export default function TaxCompliancePage() {
    const [filings] = useState(mockFilings);
    const [compliance] = useState(mockCompliance);
    const [activeTab, setActiveTab] = useState<'filings' | 'compliance'>('filings');

    // Stats
    const dueSoon = filings.filter(f =>
        new Date(f.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
        f.status !== 'filed' && f.status !== 'accepted'
    ).length;
    const pendingAmount = filings
        .filter(f => f.status !== 'filed' && f.status !== 'accepted' && f.amount)
        .reduce((sum, f) => sum + (f.amount || 0), 0);
    const compliantCount = compliance.filter(c => c.status === 'compliant').length;
    const actionNeeded = compliance.filter(c => c.status === 'action_needed' || c.status === 'overdue').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tax & Compliance</h1>
                    <p className="text-white/50">Manage tax filings, deadlines, and regulatory compliance</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <RefreshCw className="w-4 h-4" />
                        Sync Status
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{dueSoon}</p>
                            <p className="text-xs text-white/40">Due Within 7 Days</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">${(pendingAmount / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-white/40">Pending Taxes</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{compliantCount}/{compliance.length}</p>
                            <p className="text-xs text-white/40">Compliant</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{actionNeeded}</p>
                            <p className="text-xs text-white/40">Action Needed</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl w-fit">
                {[
                    { id: 'filings', label: 'Tax Filings' },
                    { id: 'compliance', label: 'Compliance' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'filings' && (
                <div className="space-y-6">
                    {/* Current Quarter */}
                    <div>
                        <h2 className="text-lg font-medium text-white mb-4">Current Quarter (Q1 2026)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filings.filter(f => f.period.includes('2026') || f.period.includes('Q4 2025')).map((filing) => (
                                <FilingCard key={filing.id} filing={filing} />
                            ))}
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div>
                        <h2 className="text-lg font-medium text-white mb-4">Upcoming Filings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filings.filter(f => f.period.includes('Q1 2026') && f.status === 'not_started').map((filing) => (
                                <FilingCard key={filing.id} filing={filing} />
                            ))}
                        </div>
                    </div>

                    {/* Auto-file Info */}
                    <Card className="p-6 bg-gradient-to-br from-[#34d399]/10 to-[#0ea5e9]/10 border-[#34d399]/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#34d399]/20 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-[#34d399]" />
                            </div>
                            <div>
                                <h3 className="font-medium text-white mb-1">Auto-Filing Enabled</h3>
                                <p className="text-sm text-white/50 mb-3">
                                    MoneyLoop automatically files your Form 941, state withholdings, and year-end forms (W-2, 1099).
                                    All tax deposits are made on schedule.
                                </p>
                                <Button variant="ghost" size="sm" className="text-[#34d399] p-0">
                                    Manage auto-file settings <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-6">
                    {/* By Category */}
                    {['federal', 'state', 'benefits', 'hr'].map((category) => {
                        const items = compliance.filter(c => c.category === category);
                        if (items.length === 0) return null;

                        return (
                            <div key={category}>
                                <h2 className="text-lg font-medium text-white mb-4 capitalize">{category} Compliance</h2>
                                <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                                    <div className="divide-y divide-white/[0.04]">
                                        {items.map((item) => (
                                            <ComplianceCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
