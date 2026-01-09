'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Key,
    Plus,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    prefix: string;
    createdAt: Date;
    lastUsed?: Date;
    permissions: string[];
}

export function ApiKeyManager() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Production App',
            key: 'ml_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            prefix: 'ml_live_sk_',
            createdAt: new Date('2026-01-01'),
            lastUsed: new Date('2026-01-08'),
            permissions: ['read:accounts', 'read:transactions'],
        },
        {
            id: '2',
            name: 'Development',
            key: 'ml_test_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            prefix: 'ml_test_sk_',
            createdAt: new Date('2025-12-15'),
            permissions: ['read:accounts', 'read:transactions', 'write:transactions'],
        },
    ]);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');

    const generateKey = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const createApiKey = () => {
        if (!newKeyName.trim()) return;

        const newKey: ApiKey = {
            id: crypto.randomUUID(),
            name: newKeyName,
            key: `ml_live_sk_${generateKey()}`,
            prefix: 'ml_live_sk_',
            createdAt: new Date(),
            permissions: ['read:accounts', 'read:transactions'],
        };

        setApiKeys(prev => [...prev, newKey]);
        setShowKey(prev => ({ ...prev, [newKey.id]: true }));
        setNewKeyName('');
        setIsCreating(false);
    };

    const deleteKey = (id: string) => {
        setApiKeys(prev => prev.filter(k => k.id !== id));
    };

    const copyKey = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const maskKey = (key: string, prefix: string) => {
        return prefix + '•'.repeat(key.length - prefix.length - 4) + key.slice(-4);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                        <Key className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">API Keys</h3>
                        <p className="text-sm text-white/50">Manage access to the MoneyLoop API</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-rose-500 hover:bg-rose-600"
                >
                    <Plus className="w-4 h-4" />
                    Create Key
                </Button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-400/90">
                    <p className="font-medium">Keep your API keys secure</p>
                    <p className="mt-1 text-amber-400/70">
                        Never share your API keys or commit them to version control.
                        Use environment variables instead.
                    </p>
                </div>
            </div>

            {/* Create form */}
            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                    <h4 className="text-sm font-medium text-white mb-3">Create new API key</h4>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Key name (e.g., Production, Mobile App)"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                        />
                        <Button onClick={createApiKey} disabled={!newKeyName.trim()}>
                            Create
                        </Button>
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* API Keys list */}
            <div className="space-y-3">
                {apiKeys.map((apiKey, index) => (
                    <motion.div
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-medium text-white">{apiKey.name}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Created {apiKey.createdAt.toLocaleDateString()}
                                    </span>
                                    {apiKey.lastUsed && (
                                        <span>Last used {apiKey.lastUsed.toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteKey(apiKey.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Key display */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 font-mono text-sm">
                            <code className="flex-1 text-white/70">
                                {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key, apiKey.prefix)}
                            </code>
                            <button
                                onClick={() => setShowKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                                className="p-1.5 rounded hover:bg-white/10"
                            >
                                {showKey[apiKey.id] ? (
                                    <EyeOff className="w-4 h-4 text-white/50" />
                                ) : (
                                    <Eye className="w-4 h-4 text-white/50" />
                                )}
                            </button>
                            <button
                                onClick={() => copyKey(apiKey.id, apiKey.key)}
                                className="p-1.5 rounded hover:bg-white/10"
                            >
                                {copied === apiKey.id ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-white/50" />
                                )}
                            </button>
                        </div>

                        {/* Permissions */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {apiKey.permissions.map(perm => (
                                <span
                                    key={perm}
                                    className="px-2 py-1 text-xs rounded-full bg-white/[0.05] text-white/60"
                                >
                                    {perm}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* API Docs link */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">API Documentation</h4>
                <p className="text-sm text-white/60 mb-3">
                    Learn how to integrate with the MoneyLoop API.
                </p>
                <div className="text-sm font-mono text-white/50 space-y-1">
                    <p><span className="text-emerald-400">GET</span> /api/v1/accounts</p>
                    <p><span className="text-emerald-400">GET</span> /api/v1/transactions</p>
                </div>
            </div>
        </div>
    );
}

export default ApiKeyManager;
