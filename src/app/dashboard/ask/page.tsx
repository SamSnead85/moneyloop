'use client';

import { AskMoneyLoop } from '@/components/ai';

export default function AskPage() {
    return (
        <div className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Ask MoneyLoop</h1>
                    <p className="text-white/50 mt-1">Your AI financial assistant</p>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
                <AskMoneyLoop />
            </div>
        </div>
    );
}
