'use client';

import { AllowanceManager } from '@/components/family/AllowanceManager';
import { ChoreRewards } from '@/components/family/ChoreRewards';
import { HouseholdProvider } from '@/components/household/HouseholdProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Star, Users } from 'lucide-react';

type Tab = 'allowances' | 'chores';

export default function FamilyPage() {
    const [activeTab, setActiveTab] = useState<Tab>('allowances');

    const tabs = [
        { id: 'allowances' as Tab, label: 'Allowances', icon: Wallet },
        { id: 'chores' as Tab, label: 'Chores & Rewards', icon: Star },
    ];

    return (
        <HouseholdProvider>
            <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/20">
                                <Users className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">Family</h1>
                                <p className="text-zinc-500 mt-1">Manage allowances and teach financial responsibility</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all
                    ${isActive
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
                        {activeTab === 'allowances' && <AllowanceManager />}
                        {activeTab === 'chores' && <ChoreRewards />}
                    </motion.div>
                </div>
            </div>
        </HouseholdProvider>
    );
}
