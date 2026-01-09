'use client';

import { useState } from 'react';
import { Bell, Search, Plus, X, Building2, CreditCard, Landmark, PiggyBank, TrendingUp, Home, Wallet } from 'lucide-react';
import { Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaidLinkButton } from '@/components/PlaidLink';

// Account type options for the modal
const accountTypes = [
    { id: 'checking', name: 'Checking Account', icon: Wallet, color: 'emerald' },
    { id: 'savings', name: 'Savings Account', icon: PiggyBank, color: 'blue' },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'purple' },
    { id: 'investment', name: 'Investment Account', icon: TrendingUp, color: 'amber' },
    { id: 'mortgage', name: 'Mortgage / Loan', icon: Landmark, color: 'rose' },
    { id: 'property', name: 'Real Estate', icon: Home, color: 'cyan' },
];

export function Header() {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            <header className="h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
                {/* Search */}
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search transactions, accounts, insights..."
                            className="w-full h-10 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Account
                    </Button>

                    <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
                    </button>
                </div>
            </header>

            {/* Add Account Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setShowAddModal(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
                        >
                            <div className="bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Add Account</h2>
                                        <p className="text-sm text-white/50 mt-1">Connect your financial accounts securely</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/50" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Plaid Connect - Primary Action */}
                                    <div className="mb-6">
                                        <PlaidLinkButton
                                            onSuccess={() => {
                                                setShowAddModal(false);
                                                // Optionally refresh the page or trigger a data refetch
                                                window.location.reload();
                                            }}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 text-base font-semibold shadow-lg shadow-emerald-500/20"
                                        >
                                            Connect with Plaid
                                        </PlaidLinkButton>
                                        <p className="text-center text-xs text-white/40 mt-3">
                                            🔒 256-bit encryption • Read-only access • 12,000+ institutions
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-[#0d0d12] text-white/40">or add manually</span>
                                        </div>
                                    </div>

                                    {/* Manual Account Types */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {accountTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-left group"
                                                onClick={() => {
                                                    // TODO: Implement manual account entry
                                                    alert(`Manual ${type.name} entry coming soon!`);
                                                }}
                                            >
                                                <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/10 flex items-center justify-center`}>
                                                    <type.icon className={`w-5 h-5 text-${type.color}-400`} />
                                                </div>
                                                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                                                    {type.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10">
                                    <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                                        <Building2 className="w-4 h-4" />
                                        <span>Secure connection powered by Plaid</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
