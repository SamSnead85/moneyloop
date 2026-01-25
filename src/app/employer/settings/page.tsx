'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Building2,
    Users,
    CreditCard,
    Bell,
    Shield,
    FileText,
    Globe,
    Moon,
    Sun,
    Check,
    ChevronRight,
    Edit2,
    Plus,
    Trash2,
    Key,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { TeamRolesManager } from '@/components/employer/TeamRolesManager';

type SettingsTab = 'company' | 'payroll' | 'team' | 'integrations' | 'notifications' | 'security';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'payroll', label: 'Payroll Settings', icon: DollarSign },
    { id: 'team', label: 'Team & Permissions', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

// Company Tab
function CompanyTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Company Information</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Legal Business Name</label>
                            <input
                                type="text"
                                defaultValue="Acme Technologies Inc."
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">DBA</label>
                            <input
                                type="text"
                                defaultValue="Acme"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">EIN</label>
                            <input
                                type="text"
                                defaultValue="12-3456789"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-mono focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Entity Type</label>
                            <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                <option value="llc">LLC</option>
                                <option value="corporation" selected>Corporation (C-Corp)</option>
                                <option value="s_corp">S Corporation</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-white/60 mb-2">Business Address</label>
                            <input
                                type="text"
                                defaultValue="123 Startup Way, San Francisco, CA 94105"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                    </div>
                    <Button className="mt-6 bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        Save Changes
                    </Button>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Primary Contact</label>
                            <input
                                type="text"
                                defaultValue="John Smith"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Email</label>
                            <input
                                type="email"
                                defaultValue="admin@acme.com"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Phone</label>
                            <input
                                type="tel"
                                defaultValue="(415) 555-0100"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Website</label>
                            <input
                                type="url"
                                defaultValue="https://acme.com"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Payroll Settings Tab
function PayrollTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Pay Schedule</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Pay Frequency</label>
                            <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                <option value="weekly">Weekly</option>
                                <option value="bi-weekly" selected>Bi-weekly</option>
                                <option value="semi-monthly">Semi-monthly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Next Pay Date</label>
                            <input
                                type="date"
                                defaultValue="2026-02-01"
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Tax Settings</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="space-y-4">
                        {[
                            { label: 'Auto-file federal taxes', description: 'Automatically file 941, 940, and W-2 forms', enabled: true },
                            { label: 'Auto-file state taxes', description: 'Automatically file state withholding and unemployment', enabled: true },
                            { label: 'Tax deposit schedule', description: 'Semi-weekly depositor (deposit within 1 day)', enabled: false },
                        ].map((setting) => (
                            <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <div>
                                    <p className="text-sm font-medium text-white">{setting.label}</p>
                                    <p className="text-xs text-white/40">{setting.description}</p>
                                </div>
                                <button
                                    className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-[#0ea5e9]' : 'bg-white/[0.1]'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Bank Account for Payroll</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Mercury Business Checking</p>
                                <p className="text-sm text-white/40">****4521 · Primary Account</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                            <span className="text-sm text-[#34d399]">Connected</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Team Tab - Use the comprehensive TeamRolesManager
function TeamTab() {
    return <TeamRolesManager />;
}

// Integrations Tab
function IntegrationsTab() {
    const integrations = [
        { name: 'Mercury', description: 'Business banking', icon: Building2, status: 'connected', color: 'from-purple-500 to-blue-500' },
        { name: 'QuickBooks', description: 'Accounting sync', icon: FileText, status: 'available', color: '' },
        { name: 'Slack', description: 'Notifications', icon: Bell, status: 'available', color: '' },
        { name: 'Google Workspace', description: 'Employee directory', icon: Globe, status: 'available', color: '' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Connected Apps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((int) => (
                    <Card key={int.name} className="p-5 bg-white/[0.02] border-white/[0.06]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.status === 'connected'
                                    ? `bg-gradient-to-br ${int.color}`
                                    : 'bg-white/[0.05]'
                                    }`}>
                                    <int.icon className={`w-6 h-6 ${int.status === 'connected' ? 'text-white' : 'text-white/40'}`} />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{int.name}</p>
                                    <p className="text-sm text-white/40">{int.description}</p>
                                </div>
                            </div>
                            {int.status === 'connected' ? (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                                    <span className="text-xs text-[#34d399]">Connected</span>
                                </div>
                            ) : (
                                <Button variant="secondary" size="sm" className="border-white/10">
                                    Connect
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Notifications Tab
function NotificationsTab() {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
            <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                <div className="space-y-4">
                    {[
                        { label: 'Payroll reminders', description: 'Get reminded before payroll deadlines', email: true, push: true },
                        { label: 'Tax filing alerts', description: 'Notifications for upcoming tax deadlines', email: true, push: true },
                        { label: 'New employee onboarding', description: 'When employees complete onboarding', email: true, push: false },
                        { label: 'Low balance alerts', description: 'When bank balance falls below threshold', email: true, push: true },
                        { label: 'Weekly summary', description: 'Weekly payroll and expense summary', email: true, push: false },
                    ].map((setting) => (
                        <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div>
                                <p className="text-sm font-medium text-white">{setting.label}</p>
                                <p className="text-xs text-white/40">{setting.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">Email</span>
                                    <button className={`w-8 h-5 rounded-full transition-colors ${setting.email ? 'bg-[#0ea5e9]' : 'bg-white/[0.1]'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${setting.email ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">Push</span>
                                    <button className={`w-8 h-5 rounded-full transition-colors ${setting.push ? 'bg-[#0ea5e9]' : 'bg-white/[0.1]'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${setting.push ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// Security Tab
function SecurityTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Authentication</h3>
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-[#34d399]" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Two-Factor Authentication</p>
                                    <p className="text-xs text-white/40">Add an extra layer of security</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[#34d399]">Enabled</span>
                                <Check className="w-4 h-4 text-[#34d399]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                                    <Key className="w-5 h-5 text-white/60" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Change Password</p>
                                    <p className="text-xs text-white/40">Last changed 30 days ago</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="border-white/10">
                                Update
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-medium text-white mb-4">Login History</h3>
                <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {[
                            { device: 'MacBook Pro - San Francisco, US', time: 'Now', current: true },
                            { device: 'iPhone 15 - San Francisco, US', time: '2 hours ago', current: false },
                            { device: 'Chrome - New York, US', time: 'Yesterday', current: false },
                        ].map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-white">{session.device}</p>
                                    <p className="text-xs text-white/40">{session.time}</p>
                                </div>
                                {session.current ? (
                                    <span className="px-2 py-1 rounded bg-[#34d399]/10 text-[#34d399] text-xs">Current</span>
                                ) : (
                                    <Button variant="ghost" size="sm" className="text-xs text-rose-400">
                                        Sign Out
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Main Component
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('company');

    const renderContent = () => {
        switch (activeTab) {
            case 'company': return <CompanyTab />;
            case 'payroll': return <PayrollTab />;
            case 'team': return <TeamTab />;
            case 'integrations': return <IntegrationsTab />;
            case 'notifications': return <NotificationsTab />;
            case 'security': return <SecurityTab />;
            default: return <CompanyTab />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
                <Card className="p-2 bg-white/[0.02] border-white/[0.06] lg:sticky lg:top-6">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                    : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </Card>
            </div>

            {/* Content */}
            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
}
