'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '@/components/ui';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function DetailModal({ isOpen, onClose, title, children }: DetailModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl max-h-[80vh] overflow-y-auto"
                    >
                        <Card padding="lg" hover={false} className="relative">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                                <h2 className="text-xl font-semibold">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/40" />
                                </button>
                            </div>

                            {/* Content */}
                            {children}
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
