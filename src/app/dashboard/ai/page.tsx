'use client';

import { HouseholdProvider } from '@/components/household/HouseholdProvider';
import { AIAgentDashboard } from '@/components/ai/AIAgentDashboard';
import { AskMoneyLoop } from '@/components/ai/AskMoneyLoop';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Sparkles } from 'lucide-react';

type Tab = 'agents' | 'chat';

export default function AIPage() {
    const [activeTab, setActiveTab] = useState<Tab>('agents');

    const tabs = [
        { id: 'agents' as Tab, label: 'AI Agents', icon: Bot },
        { id: 'chat' as Tab, label: 'Ask MoneyLoop', icon: MessageSquare },
    ];

    return (
        <HouseholdProvider>
            <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-500/20">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">AI Assistant</h1>
                                <p className="text-zinc-500 mt-1">Intelligent financial insights and automation</p>
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
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
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
                        {activeTab === 'agents' && <AIAgentDashboard />}
                        {activeTab === 'chat' && (
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 min-h-[600px]">
                                <AskMoneyLoop />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </HouseholdProvider>
    );
}
