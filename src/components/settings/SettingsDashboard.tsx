'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    CreditCard,
    Link2,
    Download,
    Trash2,
    Moon,
    Sun,
    Monitor,
    Palette,
    Globe,
    Lock,
    Key,
    Smartphone,
    Mail,
    LogOut,
    ChevronRight,
    Check,
    AlertTriangle,
    ExternalLink,
} from 'lucide-react';
import { Surface, Text, Badge, Divider, Avatar } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    subscription?: 'free' | 'pro' | 'enterprise';
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    language: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    weekStartsOn: 'sunday' | 'monday';
    notifications: {
        email: boolean;
        push: boolean;
        budgetAlerts: boolean;
        billReminders: boolean;
        weeklyDigest: boolean;
        insightAlerts: boolean;
    };
    privacy: {
        showBalance: boolean;
        twoFactorEnabled: boolean;
    };
}

interface SettingsDashboardProps {
    user: UserProfile;
    preferences: UserPreferences;
    connectedAccounts?: Array<{ provider: string; email: string }>;
    onUpdateProfile?: (profile: Partial<UserProfile>) => void;
    onUpdatePreferences?: (prefs: Partial<UserPreferences>) => void;
    onDisconnectAccount?: (provider: string) => void;
    onExportData?: () => void;
    onDeleteAccount?: () => void;
    onLogout?: () => void;
}

// ===== COMPONENT =====

export function SettingsDashboard({
    user,
    preferences,
    connectedAccounts = [],
    onUpdateProfile,
    onUpdatePreferences,
    onDisconnectAccount,
    onExportData,
    onDeleteAccount,
    onLogout,
}: SettingsDashboardProps) {
    const [activeSection, setActiveSection] = useState<string>('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(user.name);

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'connected', label: 'Connected Accounts', icon: Link2 },
        { id: 'data', label: 'Data & Privacy', icon: Download },
    ];

    const handleNotificationToggle = (key: keyof UserPreferences['notifications']) => {
        onUpdatePreferences?.({
            notifications: {
                ...preferences.notifications,
                [key]: !preferences.notifications[key],
            },
        });
    };

    const ThemeButton = ({ theme, icon: Icon, label }: { theme: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }) => (
        <button
            onClick={() => onUpdatePreferences?.({ theme })}
            className={cn(
                'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                preferences.theme === theme
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)]'
                    : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
            )}
        >
            <Icon className={cn(
                'w-6 h-6',
                preferences.theme === theme ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
            )} />
            <Text variant="body-sm" color={preferences.theme === theme ? 'accent' : 'secondary'}>
                {label}
            </Text>
        </button>
    );

    const ToggleRow = ({
        label,
        description,
        enabled,
        onChange
    }: {
        label: string;
        description?: string;
        enabled: boolean;
        onChange: () => void;
    }) => (
        <div className="flex items-center justify-between py-4">
            <div>
                <Text variant="body-md">{label}</Text>
                {description && (
                    <Text variant="body-sm" color="tertiary">{description}</Text>
                )}
            </div>
            <button
                onClick={onChange}
                className={cn(
                    'w-12 h-7 rounded-full transition-colors relative shrink-0',
                    enabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-elevated-2)]'
                )}
            >
                <motion.div
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );

    return (
        <div className="flex gap-6">
            {/* Sidebar */}
            <Surface elevation={1} className="w-64 p-4 shrink-0 h-fit sticky top-24">
                <nav className="space-y-1">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                                    activeSection === section.id
                                        ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {section.label}
                            </button>
                        );
                    })}
                </nav>

                <Divider className="my-4" />

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log out
                </button>
            </Surface>

            {/* Content */}
            <div className="flex-1 space-y-6">
                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Profile</Text>

                        <div className="flex items-start gap-6 mb-8">
                            <Avatar name={user.name} size="xl" />
                            <div className="flex-1">
                                {editingName ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="text-xl font-semibold bg-transparent border-b border-[var(--accent-primary)] outline-none"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                onUpdateProfile?.({ name: tempName });
                                                setEditingName(false);
                                            }}
                                            className="p-1.5 rounded-lg bg-[var(--accent-primary)] text-white"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingName(true)}
                                        className="group flex items-center gap-2 mb-2"
                                    >
                                        <Text variant="heading-lg">{user.name}</Text>
                                        <ChevronRight className="w-5 h-5 text-[var(--text-quaternary)] group-hover:text-[var(--text-tertiary)]" />
                                    </button>
                                )}
                                <Text variant="body-md" color="tertiary">{user.email}</Text>
                                <div className="flex items-center gap-2 mt-3">
                                    <Badge
                                        variant={user.subscription === 'pro' ? 'premium' : user.subscription === 'enterprise' ? 'success' : 'default'}
                                    >
                                        {user.subscription === 'pro' ? 'Pro' : user.subscription === 'enterprise' ? 'Enterprise' : 'Free'} Plan
                                    </Badge>
                                    {user.subscription === 'free' && (
                                        <button className="text-sm text-[var(--accent-primary)] hover:underline">
                                            Upgrade
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Text variant="body-sm" color="tertiary">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                    </Surface>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Appearance</Text>

                        <Text variant="body-sm" color="tertiary" className="mb-4">Theme</Text>
                        <div className="flex gap-4 mb-8">
                            <ThemeButton theme="light" icon={Sun} label="Light" />
                            <ThemeButton theme="dark" icon={Moon} label="Dark" />
                            <ThemeButton theme="system" icon={Monitor} label="System" />
                        </div>

                        <Divider className="my-6" />

                        <Text variant="body-sm" color="tertiary" className="mb-4">Regional</Text>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text variant="body-sm" className="mb-2">Currency</Text>
                                <select
                                    value={preferences.currency}
                                    onChange={(e) => onUpdatePreferences?.({ currency: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                            </div>
                            <div>
                                <Text variant="body-sm" className="mb-2">Date Format</Text>
                                <select
                                    value={preferences.dateFormat}
                                    onChange={(e) => onUpdatePreferences?.({ dateFormat: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </Surface>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Notifications</Text>

                        <div className="divide-y divide-[var(--border-subtle)]">
                            <ToggleRow
                                label="Email notifications"
                                description="Receive updates via email"
                                enabled={preferences.notifications.email}
                                onChange={() => handleNotificationToggle('email')}
                            />
                            <ToggleRow
                                label="Push notifications"
                                description="Browser and mobile push alerts"
                                enabled={preferences.notifications.push}
                                onChange={() => handleNotificationToggle('push')}
                            />
                            <ToggleRow
                                label="Budget alerts"
                                description="When you're approaching budget limits"
                                enabled={preferences.notifications.budgetAlerts}
                                onChange={() => handleNotificationToggle('budgetAlerts')}
                            />
                            <ToggleRow
                                label="Bill reminders"
                                description="Upcoming bill due dates"
                                enabled={preferences.notifications.billReminders}
                                onChange={() => handleNotificationToggle('billReminders')}
                            />
                            <ToggleRow
                                label="Weekly digest"
                                description="Summary of your weekly spending"
                                enabled={preferences.notifications.weeklyDigest}
                                onChange={() => handleNotificationToggle('weeklyDigest')}
                            />
                            <ToggleRow
                                label="Insight alerts"
                                description="AI-powered financial insights"
                                enabled={preferences.notifications.insightAlerts}
                                onChange={() => handleNotificationToggle('insightAlerts')}
                            />
                        </div>
                    </Surface>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Security</Text>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated-2)] flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    </div>
                                    <div>
                                        <Text variant="body-md">Password</Text>
                                        <Text variant="body-sm" color="tertiary">Last changed 3 months ago</Text>
                                    </div>
                                </div>
                                <button className="px-4 py-2 rounded-xl text-sm bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)] transition-colors">
                                    Change
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated-2)] flex items-center justify-center">
                                        <Key className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    </div>
                                    <div>
                                        <Text variant="body-md">Two-factor authentication</Text>
                                        <Text variant="body-sm" color={preferences.privacy.twoFactorEnabled ? 'accent' : 'tertiary'}>
                                            {preferences.privacy.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                                        </Text>
                                    </div>
                                </div>
                                <button className="px-4 py-2 rounded-xl text-sm bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all">
                                    {preferences.privacy.twoFactorEnabled ? 'Manage' : 'Enable'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated-2)] flex items-center justify-center">
                                        <Smartphone className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    </div>
                                    <div>
                                        <Text variant="body-md">Active sessions</Text>
                                        <Text variant="body-sm" color="tertiary">2 devices</Text>
                                    </div>
                                </div>
                                <button className="px-4 py-2 rounded-xl text-sm bg-[var(--surface-base)] hover:bg-[var(--surface-elevated-2)] transition-colors">
                                    Manage
                                </button>
                            </div>
                        </div>
                    </Surface>
                )}

                {/* Connected Accounts Section */}
                {activeSection === 'connected' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Connected Accounts</Text>

                        {connectedAccounts.length > 0 ? (
                            <div className="space-y-3">
                                {connectedAccounts.map((account) => (
                                    <div
                                        key={account.provider}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                                <Text variant="body-md">{account.provider[0]}</Text>
                                            </div>
                                            <div>
                                                <Text variant="body-md">{account.provider}</Text>
                                                <Text variant="body-sm" color="tertiary">{account.email}</Text>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDisconnectAccount?.(account.provider)}
                                            className="px-4 py-2 rounded-xl text-sm text-[var(--accent-danger)] hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Text variant="body-md" color="tertiary">No connected accounts</Text>
                        )}
                    </Surface>
                )}

                {/* Data & Privacy Section */}
                {activeSection === 'data' && (
                    <Surface elevation={1} className="p-6">
                        <Text variant="heading-lg" className="mb-6">Data & Privacy</Text>

                        <div className="space-y-4">
                            <button
                                onClick={onExportData}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Download className="w-5 h-5 text-[var(--text-tertiary)]" />
                                    <div className="text-left">
                                        <Text variant="body-md">Export your data</Text>
                                        <Text variant="body-sm" color="tertiary">Download all your financial data</Text>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                            </button>

                            <ToggleRow
                                label="Hide balances by default"
                                description="Require click to reveal account balances"
                                enabled={!preferences.privacy.showBalance}
                                onChange={() => onUpdatePreferences?.({
                                    privacy: { ...preferences.privacy, showBalance: !preferences.privacy.showBalance }
                                })}
                            />

                            <Divider />

                            {showDeleteConfirm ? (
                                <div className="p-4 rounded-xl bg-[var(--accent-danger-subtle)] border border-[var(--accent-danger)]/20">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-[var(--accent-danger)] shrink-0 mt-0.5" />
                                        <div>
                                            <Text variant="body-md" color="danger" className="font-medium">
                                                Delete your account?
                                            </Text>
                                            <Text variant="body-sm" color="tertiary">
                                                This action cannot be undone. All your data will be permanently deleted.
                                            </Text>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={onDeleteAccount}
                                            className="flex-1 py-2 rounded-lg text-sm bg-[var(--accent-danger)] text-white"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--accent-danger-subtle)] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <Trash2 className="w-5 h-5 text-[var(--accent-danger)]" />
                                        <div className="text-left">
                                            <Text variant="body-md" color="danger">Delete account</Text>
                                            <Text variant="body-sm" color="tertiary">Permanently delete your account and data</Text>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-danger)]" />
                                </button>
                            )}
                        </div>
                    </Surface>
                )}
            </div>
        </div>
    );
}

export default SettingsDashboard;
