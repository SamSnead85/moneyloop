'use client';

import { HouseholdProvider } from '@/components/household/HouseholdProvider';
import { HouseholdDashboard } from '@/components/household/HouseholdDashboard';
import { MemberManager } from '@/components/household/MemberManager';
import { ActivityFeed } from '@/components/household/ActivityFeed';
import { ContextSwitcher } from '@/components/layout/ContextSwitcher';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Settings2 } from 'lucide-react';

type Tab = 'tasks' | 'members' | 'activity';

export default function HouseholdPage() {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');

    const tabs = [
        { id: 'tasks' as Tab, label: 'Tasks & Bills', icon: Users },
        { id: 'members' as Tab, label: 'Members', icon: Settings2 },
        { id: 'activity' as Tab, label: 'Activity', icon: Activity },
    ];

    return (
        <HouseholdProvider>
            <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">Household</h1>
                            <p className="text-zinc-500 mt-1">Manage your household finances together</p>
                        </div>
                        <ContextSwitcher />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all whitespace-nowrap
                    ${isActive
                                            ? 'bg-sage-500/20 text-sage-400 border border-sage-500/30'
                                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'tasks' && <HouseholdDashboard />}
                        {activeTab === 'members' && <MemberManager />}
                        {activeTab === 'activity' && <ActivityFeed />}
                    </motion.div>
                </div>
            </div>
        </HouseholdProvider>
    );
}
