'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CreditCard,
    DollarSign,
    TrendingDown,
    Sparkles,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface CreditCard {
    id: string;
    name: string;
    balance: number;
    apr: number;
    minPayment: number;
}

interface TransferOffer {
    id: string;
    issuer: string;
    cardName: string;
    introApr: number;
    introPeriodMonths: number;
    transferFee: number;
    regularApr: number;
    estimatedSavings: number;
}

// Demo high-APR cards
const DEMO_CARDS: CreditCard[] = [
    { id: '1', name: 'Chase Sapphire', balance: 8500, apr: 24.99, minPayment: 170 },
    { id: '2', name: 'Capital One Quicksilver', balance: 4200, apr: 19.99, minPayment: 84 },
    { id: '3', name: 'Citi Double Cash', balance: 3100, apr: 22.49, minPayment: 62 },
];

// Demo balance transfer offers
const TRANSFER_OFFERS: TransferOffer[] = [
    {
        id: '1',
        issuer: 'Discover',
        cardName: 'Discover it® Balance Transfer',
        introApr: 0,
        introPeriodMonths: 18,
        transferFee: 3,
        regularApr: 17.24,
        estimatedSavings: 0,
    },
    {
        id: '2',
        issuer: 'Wells Fargo',
        cardName: 'Wells Fargo Reflect®',
        introApr: 0,
        introPeriodMonths: 21,
        transferFee: 3,
        regularApr: 18.24,
        estimatedSavings: 0,
    },
    {
        id: '3',
        issuer: 'Citi',
        cardName: 'Citi Simplicity®',
        introApr: 0,
        introPeriodMonths: 21,
        transferFee: 5,
        regularApr: 19.24,
        estimatedSavings: 0,
    },
];

function calculateSavings(cards: CreditCard[], offer: TransferOffer): number {
    const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
    const weightedApr = cards.reduce((sum, c) => sum + (c.balance * c.apr), 0) / totalBalance;

    // Interest paid in intro period if kept at current APR
    const currentInterest = (totalBalance * (weightedApr / 100) / 12) * offer.introPeriodMonths;

    // Interest paid with 0% offer (just the transfer fee)
    const transferCost = totalBalance * (offer.transferFee / 100);

    return Math.round(currentInterest - transferCost);
}

export function BalanceTransferRecommendations() {
    const [cards] = useState<CreditCard[]>(DEMO_CARDS);
    const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

    const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0);
    const avgApr = cards.reduce((sum, c) => sum + (c.balance * c.apr), 0) / totalDebt;
    const monthlyInterest = (totalDebt * (avgApr / 100)) / 12;

    const offersWithSavings = useMemo(() =>
        TRANSFER_OFFERS.map(offer => ({
            ...offer,
            estimatedSavings: calculateSavings(cards, offer),
        })).sort((a, b) => b.estimatedSavings - a.estimatedSavings),
        [cards]
    );

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    if (avgApr < 15) {
        return (
            <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Your rates are great!</h3>
                <p className="text-white/50">Your average APR is {avgApr.toFixed(1)}%. No balance transfer needed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* High Interest Warning */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-400">High Interest Alert</h4>
                        <p className="text-sm text-amber-400/80 mt-1">
                            You&apos;re paying {formatCurrency(monthlyInterest)}/month in interest across{' '}
                            {cards.length} cards with an average APR of {avgApr.toFixed(1)}%.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cards Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <CreditCard className="w-5 h-5 text-rose-400 mb-2" />
                    <p className="text-sm text-white/50">Total Balance</p>
                    <p className="text-xl font-semibold text-white font-mono">{formatCurrency(totalDebt)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <TrendingDown className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-sm text-white/50">Avg APR</p>
                    <p className="text-xl font-semibold text-white font-mono">{avgApr.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <DollarSign className="w-5 h-5 text-red-400 mb-2" />
                    <p className="text-sm text-white/50">Monthly Interest</p>
                    <p className="text-xl font-semibold text-white font-mono">{formatCurrency(monthlyInterest)}</p>
                </div>
            </div>

            {/* Transfer Offers */}
            <div>
                <h4 className="text-sm font-medium text-white/70 mb-4">Recommended Balance Transfer Cards</h4>
                <div className="space-y-3">
                    {offersWithSavings.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedOffer === offer.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                                        {offer.issuer.slice(0, 3).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{offer.cardName}</p>
                                        <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                                            <span>{offer.introApr}% APR for {offer.introPeriodMonths} months</span>
                                            <span>•</span>
                                            <span>{offer.transferFee}% fee</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-emerald-400 font-mono">
                                        Save {formatCurrency(offer.estimatedSavings)}
                                    </p>
                                    <p className="text-xs text-white/40">over intro period</p>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {selectedOffer === offer.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-4 pt-4 border-t border-white/10"
                                >
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-white/50">Transfer Fee</p>
                                            <p className="text-white font-mono">
                                                {formatCurrency(totalDebt * offer.transferFee / 100)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/50">Regular APR (after intro)</p>
                                            <p className="text-white font-mono">{offer.regularApr}%</p>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600">
                                        Learn More
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-white/30 text-center">
                These recommendations are for informational purposes only. Please review the full terms
                and conditions before applying for any credit card.
            </p>
        </div>
    );
}

export default BalanceTransferRecommendations;
