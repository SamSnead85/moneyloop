'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Bell,
    CreditCard,
    Link2,
    Download,
    Moon,
    Sun,
    Smartphone,
    Key,
    Mail,
    ChevronRight,
    Check,
    AlertCircle,
    ExternalLink,
    LogOut,
    Trash2,
    Database,
    Code,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import DataBackupManager from '@/components/settings/DataBackupManager';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import { PasskeyManager } from '@/components/settings';
import { NotificationSettings } from '@/components/settings';
import { SessionAudit } from '@/components/settings';

const settingsSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'accounts', name: 'Connected Accounts', icon: Link2 },
    { id: 'billing', name: 'Billing & Subscription', icon: CreditCard },
    { id: 'data', name: 'Data & Privacy', icon: Download },
    { id: 'developer', name: 'Developer API', icon: Code },
];

const connectedAccounts = [
    { name: 'Chase Bank', accounts: 3, lastSync: '2 min ago', status: 'connected' },
    { name: 'Fidelity', accounts: 2, lastSync: '1 hr ago', status: 'connected' },
    { name: 'American Express', accounts: 1, lastSync: '10 min ago', status: 'connected' },
    { name: 'Vanguard', accounts: 1, lastSync: '1 hr ago', status: 'connected' },
    { name: 'Nelnet', accounts: 1, lastSync: '3 days ago', status: 'needs-reauth' },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        budgetAlerts: true,
        billReminders: true,
        weeklyDigest: true,
        marketingEmails: false,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="lg:col-span-1 p-2 h-fit">
                    <nav className="space-y-1">
                        {settingsSections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.name}
                                </button>
                            );
                        })}
                    </nav>
                </Card>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h2 className="text-lg font-medium mb-6">Profile Information</h2>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl font-semibold text-emerald-400">
                                        JS
                                    </div>
                                    <div>
                                        <Button variant="secondary" size="sm">Change Photo</Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue="John Smith"
                                            className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            defaultValue="john@example.com"
                                            className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                                        <input
                                            type="tel"
                                            defaultValue="+1 (555) 123-4567"
                                            className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Time Zone</label>
                                        <select className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-emerald-500/50">
                                            <option className="bg-[#0a0a0f]">Eastern Time (ET)</option>
                                            <option className="bg-[#0a0a0f]">Pacific Time (PT)</option>
                                            <option className="bg-[#0a0a0f]">Central Time (CT)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/[0.04] flex justify-end">
                                    <Button>Save Changes</Button>
                                </div>
                            </Card>

                            <Card className="p-6 mt-6">
                                <h2 className="text-lg font-medium mb-4">Appearance</h2>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'dark', icon: Moon, label: 'Dark' },
                                        { id: 'light', icon: Sun, label: 'Light' },
                                        { id: 'system', icon: Smartphone, label: 'System' },
                                    ].map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => setTheme(option.id as 'dark' | 'light' | 'system')}
                                                className={`flex-1 p-4 rounded-xl border transition-all ${theme === option.id
                                                    ? 'border-emerald-500/50 bg-emerald-500/[0.05]'
                                                    : 'border-white/[0.06] hover:border-white/[0.1]'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 mx-auto mb-2 ${theme === option.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                <span className={`text-sm ${theme === option.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h2 className="text-lg font-medium mb-6">Security Settings</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Key className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="font-medium">Password</p>
                                                <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" size="sm">Change</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="font-medium">Two-Factor Authentication</p>
                                                <p className="text-sm text-emerald-400 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Enabled
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" size="sm">Manage</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="font-medium">Login Alerts</p>
                                                <p className="text-sm text-slate-500">Get notified of new logins</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/[0.04]">
                                    <h3 className="font-medium mb-4">Active Sessions</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">MacBook Pro - Chrome</p>
                                                <p className="text-xs text-slate-500">New York, US • Current session</p>
                                            </div>
                                            <span className="text-xs text-emerald-400">Active now</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">iPhone 15 Pro - Safari</p>
                                                <p className="text-xs text-slate-500">New York, US • Last seen 2h ago</p>
                                            </div>
                                            <Button variant="ghost" size="sm">Revoke</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h2 className="text-lg font-medium mb-6">Notification Preferences</h2>

                                <div className="space-y-4">
                                    {[
                                        { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits' },
                                        { key: 'billReminders', label: 'Bill Reminders', description: 'Reminder before bills are due' },
                                        { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of your finances' },
                                        { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                                        { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                                        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Tips, updates, and offers' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                            <div>
                                                <p className="font-medium">{item.label}</p>
                                                <p className="text-sm text-slate-500">{item.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[item.key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Connected Accounts Section */}
                    {activeSection === 'accounts' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-medium">Connected Accounts</h2>
                                    <Button size="sm">Add Account</Button>
                                </div>

                                <div className="space-y-3">
                                    {connectedAccounts.map((account, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                                    <Link2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{account.name}</p>
                                                        {account.status === 'needs-reauth' && (
                                                            <AlertCircle className="w-4 h-4 text-amber-400" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500">
                                                        {account.accounts} accounts • Last sync: {account.lastSync}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {account.status === 'needs-reauth' ? (
                                                    <Button variant="secondary" size="sm">Reconnect</Button>
                                                ) : (
                                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                        <Check className="w-3 h-3" /> Connected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Billing Section */}
                    {activeSection === 'billing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h2 className="text-lg font-medium mb-6">Subscription</h2>

                                <div className="p-5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">PREMIUM</span>
                                            <p className="text-xl font-semibold mt-2">$29/month</p>
                                            <p className="text-sm text-slate-400">Renews on Feb 4, 2026</p>
                                        </div>
                                        <Button variant="secondary">Manage Plan</Button>
                                    </div>
                                </div>

                                <h3 className="font-medium mb-4">Payment Method</h3>
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-8 rounded bg-white/[0.04] flex items-center justify-center text-xs font-bold">
                                            VISA
                                        </div>
                                        <div>
                                            <p className="font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-slate-500">Expires 12/27</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm">Update</Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Data & Privacy Section */}
                    {activeSection === 'data' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <h2 className="text-lg font-medium mb-6">Data & Privacy</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                        <div>
                                            <p className="font-medium">Export Your Data</p>
                                            <p className="text-sm text-slate-500">Download all your financial data</p>
                                        </div>
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <Download className="w-4 h-4" />
                                            Export
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                                        <div>
                                            <p className="font-medium">Privacy Policy</p>
                                            <p className="text-sm text-slate-500">Review how we handle your data</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            View <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/[0.04]">
                                    <h3 className="font-medium text-red-400 mb-4">Danger Zone</h3>
                                    <div className="flex items-center justify-between p-4 bg-red-500/[0.05] border border-red-500/20 rounded-xl">
                                        <div>
                                            <p className="font-medium">Delete Account</p>
                                            <p className="text-sm text-slate-500">Permanently delete your account and data</p>
                                        </div>
                                        <Button variant="secondary" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {/* Data Backup Manager */}
                                <div className="mt-8 pt-6 border-t border-white/[0.04]">
                                    <DataBackupManager />
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Developer API Section */}
                    {activeSection === 'developer' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-6">
                                <ApiKeyManager />
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
