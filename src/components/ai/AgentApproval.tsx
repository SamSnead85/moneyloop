'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    CreditCard,
    ShoppingCart,
    Zap,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

export interface AgentProposal {
    id: string;
    agentType: 'bill' | 'subscription' | 'grocery' | 'budget' | 'transfer';
    actionType: string;
    title: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, string | number>;
    impact?: {
        type: 'savings' | 'cost' | 'neutral';
        amount?: number;
        period?: string;
    };
    expiresAt?: string;
    createdAt: string;
}

interface AgentApprovalCardProps {
    proposal: AgentProposal;
    onApprove: (id: string) => Promise<void>;
    onDecline: (id: string) => Promise<void>;
    onSchedule?: (id: string, date: Date) => Promise<void>;
}

const agentConfig = {
    bill: { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    subscription: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    grocery: { icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/10' },
    budget: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    transfer: { icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

const riskConfig = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Low Risk' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium Risk' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High Risk' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical - Confirm Carefully' },
};

export function AgentApprovalCard({
    proposal,
    onApprove,
    onDecline,
    onSchedule,
}: AgentApprovalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');

    const agent = agentConfig[proposal.agentType];
    const risk = riskConfig[proposal.riskLevel];
    const Icon = agent.icon;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(proposal.id);
            setStatus('approved');
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        try {
            await onDecline(proposal.id);
            setStatus('declined');
        } catch (error) {
            console.error('Decline failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (status !== 'pending') {
        return (
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.6 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
                <div className="flex items-center gap-3">
                    {status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm text-slate-400">
                        {proposal.title} - {status === 'approved' ? 'Approved' : 'Declined'}
                    </span>
                </div>
            </motion.div>
        );
    }

    return (
        <Card className={`overflow-hidden border-l-4 ${proposal.riskLevel === 'critical' ? 'border-l-red-500' :
                proposal.riskLevel === 'high' ? 'border-l-orange-500' :
                    proposal.riskLevel === 'medium' ? 'border-l-yellow-500' :
                        'border-l-emerald-500'
            }`}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${agent.bg}`}>
                            <Icon className={`w-5 h-5 ${agent.color}`} />
                        </div>
                        <div>
                            <h4 className="font-medium">{proposal.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{proposal.description}</p>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-medium ${risk.bg} ${risk.color}`}>
                        {risk.label}
                    </div>
                </div>

                {/* Impact */}
                {proposal.impact && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium mb-3 ${proposal.impact.type === 'savings' ? 'bg-emerald-500/10 text-emerald-400' :
                            proposal.impact.type === 'cost' ? 'bg-red-500/10 text-red-400' :
                                'bg-white/[0.04] text-slate-400'
                        }`}>
                        {proposal.impact.type === 'savings' ? '+' : proposal.impact.type === 'cost' ? '-' : ''}
                        ${proposal.impact.amount?.toLocaleString()}
                        {proposal.impact.period && <span className="text-xs opacity-70">/{proposal.impact.period}</span>}
                    </div>
                )}

                {/* Expandable Details */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors mb-3"
                >
                    {isExpanded ? 'Hide' : 'Show'} Details
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 rounded-lg bg-white/[0.02] mb-3 space-y-2">
                                {Object.entries(proposal.details).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className="font-medium">
                                            {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                        {isProcessing ? 'Processing...' : 'Approve'}
                    </Button>
                    {onSchedule && (
                        <Button
                            variant="secondary"
                            onClick={() => onSchedule(proposal.id, new Date())}
                            disabled={isProcessing}
                            className="gap-1"
                        >
                            <Clock className="w-4 h-4" />
                            Later
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleDecline}
                        disabled={isProcessing}
                        className="text-red-400 hover:text-red-300"
                    >
                        Decline
                    </Button>
                </div>

                {/* Expiration warning */}
                {proposal.expiresAt && (
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                        Expires {new Date(proposal.expiresAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </Card>
    );
}

// Pending Actions Dashboard Widget
export function PendingActionsWidget({ proposals = [] }: { proposals?: AgentProposal[] }) {
    const handleApprove = async (id: string) => {
        // API call to approve action
        await fetch(`/api/agent/actions/${id}/approve`, { method: 'POST' });
    };

    const handleDecline = async (id: string) => {
        // API call to decline action
        await fetch(`/api/agent/actions/${id}/decline`, { method: 'POST' });
    };

    if (proposals.length === 0) {
        return (
            <Card className="p-5 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-slate-400">No pending actions</p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {proposals.map((proposal) => (
                <AgentApprovalCard
                    key={proposal.id}
                    proposal={proposal}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                />
            ))}
        </div>
    );
}
