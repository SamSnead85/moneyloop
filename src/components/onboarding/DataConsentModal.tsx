'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface DataConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const consentPoints = [
    {
        icon: Lock,
        title: 'Bank-Level Encryption',
        description: 'Your data is encrypted using 256-bit AES encryption, the same standard used by major banks.',
    },
    {
        icon: Eye,
        title: 'View-Only Access',
        description: 'We can only read your transaction data. We cannot move money or make changes to your accounts.',
    },
    {
        icon: Shield,
        title: 'Never Shared Without Consent',
        description: 'Your data is never sold, shared with third parties, or used for advertising without your explicit permission.',
    },
];

export function DataConsentModal({ isOpen, onClose, onConfirm }: DataConsentModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-lg bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-[#7dd3a8]/10">
                                        <Shield className="w-6 h-6 text-[#7dd3a8]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Your Data, Your Control</h2>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Before we connect your accounts, here&apos;s how we protect your information.
                                </p>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5 space-y-4">
                                {consentPoints.map((point, index) => (
                                    <motion.div
                                        key={point.title}
                                        className="flex gap-4"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <point.icon className="w-5 h-5 text-[#7dd3a8]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white mb-1">{point.title}</h3>
                                            <p className="text-sm text-slate-400">{point.description}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Powered by Plaid Badge */}
                                <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-500">
                                    <Lock className="w-3 h-3" />
                                    <span>Secure connection powered by Plaid</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className="flex-1 bg-[#7dd3a8] hover:bg-[#6bc497] text-[#0a0a0f]"
                                    icon={<CheckCircle className="w-4 h-4" />}
                                >
                                    I Understand, Continue
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default DataConsentModal;
