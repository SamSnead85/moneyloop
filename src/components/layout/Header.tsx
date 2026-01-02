'use client';

import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

export function Header() {
    return (
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
                <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                    Add Account
                </Button>

                <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
                </button>
            </div>
        </header>
    );
}
