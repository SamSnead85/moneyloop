'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Wallet,
    Home,
    Link2,
    Check,
    ExternalLink,
    RefreshCw,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: typeof Calendar;
    status: 'connected' | 'disconnected' | 'pending';
    lastSync?: string;
    provider?: string;
}

const integrations: Integration[] = [
    {
        id: 'google_calendar',
        name: 'Google Calendar',
        description: 'Sync bills and tasks to your calendar with reminders',
        icon: Calendar,
        status: 'disconnected',
        provider: 'google',
    },
    {
        id: 'crypto_wallet',
        name: 'Crypto Wallets',
        description: 'Track Ethereum, Bitcoin, and exchange holdings',
        icon: Wallet,
        status: 'disconnected',
    },
    {
        id: 'smart_home',
        name: 'Smart Home',
        description: 'Estimate utility bills from thermostat and device usage',
        icon: Home,
        status: 'disconnected',
        provider: 'google_home',
    },
];

export function IntegrationsPanel() {
    const [connecting, setConnecting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [integrationStatus, setIntegrationStatus] = useState<Record<string, Integration['status']>>({});

    const handleConnect = async (integrationId: string) => {
        setConnecting(integrationId);

        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIntegrationStatus(prev => ({
            ...prev,
            [integrationId]: 'connected',
        }));
        setConnecting(null);
    };

    const handleSync = async (integrationId: string) => {
        setSyncing(integrationId);

        // Call sync API
        try {
            const response = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: integrationId === 'google_calendar' ? 'calendar_sync' :
                        integrationId === 'crypto_wallet' ? 'crypto_holdings' : 'utility_estimates',
                }),
            });

            if (!response.ok) throw new Error('Sync failed');
        } catch (error) {
            console.error('Sync error:', error);
        }

        setSyncing(null);
    };

    const getStatus = (id: string) => integrationStatus[id] || 'disconnected';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/20">
                    <Link2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-zinc-100">Integrations</h2>
                    <p className="text-sm text-zinc-500">Connect external services to enhance your financial visibility</p>
                </div>
            </div>

            <div className="space-y-4">
                {integrations.map((integration) => {
                    const Icon = integration.icon;
                    const status = getStatus(integration.id);
                    const isConnecting = connecting === integration.id;
                    const isSyncing = syncing === integration.id;

                    return (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'p-5 rounded-xl border transition-colors',
                                status === 'connected'
                                    ? 'bg-emerald-500/5 border-emerald-500/30'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    'p-3 rounded-xl',
                                    status === 'connected' ? 'bg-emerald-500/20' : 'bg-zinc-800'
                                )}>
                                    <Icon className={cn(
                                        'w-6 h-6',
                                        status === 'connected' ? 'text-emerald-400' : 'text-zinc-400'
                                    )} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-zinc-200">{integration.name}</h3>
                                        {status === 'connected' && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                                <Check className="w-3 h-3" />
                                                Connected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">{integration.description}</p>

                                    {integration.lastSync && status === 'connected' && (
                                        <p className="text-xs text-zinc-600 mt-2">
                                            Last synced: {integration.lastSync}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {status === 'connected' ? (
                                        <button
                                            onClick={() => handleSync(integration.id)}
                                            disabled={isSyncing}
                                            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
                                            {isSyncing ? 'Syncing...' : 'Sync'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(integration.id)}
                                            disabled={isConnecting}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="w-4 h-4" />
                                                    Connect
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Coming Soon */}
            <div className="mt-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <p className="text-sm text-zinc-500">
                    Apple Calendar, Outlook, Amazon Alexa, Tesla, and more integrations are on the roadmap.
                </p>
            </div>
        </div>
    );
}

export default IntegrationsPanel;
