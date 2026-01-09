'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Fingerprint,
    Key,
    Plus,
    Trash2,
    Shield,
    Smartphone,
    Laptop,
    CheckCircle,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

interface Passkey {
    id: string;
    name: string;
    createdAt: Date;
    lastUsed?: Date;
    deviceType: 'phone' | 'computer' | 'security-key';
}

// WebAuthn helpers
const isWebAuthnSupported = typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined;

export function PasskeyManager() {
    const [passkeys, setPasskeys] = useState<Passkey[]>([
        // Demo passkeys
        {
            id: '1',
            name: 'MacBook Pro',
            createdAt: new Date('2026-01-01'),
            lastUsed: new Date('2026-01-08'),
            deviceType: 'computer',
        },
        {
            id: '2',
            name: 'iPhone 15 Pro',
            createdAt: new Date('2025-12-15'),
            lastUsed: new Date('2026-01-07'),
            deviceType: 'phone',
        },
    ]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const getDeviceIcon = (type: Passkey['deviceType']) => {
        switch (type) {
            case 'phone': return Smartphone;
            case 'computer': return Laptop;
            default: return Key;
        }
    };

    const registerPasskey = async () => {
        if (!isWebAuthnSupported) {
            setError('WebAuthn is not supported in this browser');
            return;
        }

        setIsRegistering(true);
        setError(null);

        try {
            // In production, fetch challenge from server
            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const userId = crypto.getRandomValues(new Uint8Array(16));

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: {
                        name: 'MoneyLoop',
                        id: window.location.hostname,
                    },
                    user: {
                        id: userId,
                        name: 'user@moneyloop.ai',
                        displayName: 'MoneyLoop User',
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: 'public-key' },
                        { alg: -257, type: 'public-key' },
                    ],
                    timeout: 60000,
                    attestation: 'none',
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                        residentKey: 'required',
                    },
                },
            });

            if (credential) {
                // In production, send credential to server
                const newPasskey: Passkey = {
                    id: crypto.randomUUID(),
                    name: detectDeviceName(),
                    createdAt: new Date(),
                    deviceType: detectDeviceType(),
                };

                setPasskeys(prev => [...prev, newPasskey]);
                setSuccess('Passkey registered successfully!');
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            console.error('Passkey registration error:', err);
            setError('Failed to register passkey. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    const removePasskey = (id: string) => {
        setPasskeys(prev => prev.filter(p => p.id !== id));
        setSuccess('Passkey removed');
        setTimeout(() => setSuccess(null), 3000);
    };

    const detectDeviceName = (): string => {
        const ua = navigator.userAgent;
        if (ua.includes('Mac')) return 'MacBook';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('iPad')) return 'iPad';
        if (ua.includes('Android')) return 'Android Device';
        if (ua.includes('Windows')) return 'Windows PC';
        return 'New Device';
    };

    const detectDeviceType = (): Passkey['deviceType'] => {
        const ua = navigator.userAgent;
        if (ua.includes('iPhone') || ua.includes('Android')) return 'phone';
        return 'computer';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                        <Fingerprint className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Passkeys</h3>
                        <p className="text-sm text-white/50">Secure, passwordless authentication</p>
                    </div>
                </div>
                <Button
                    onClick={registerPasskey}
                    disabled={isRegistering || !isWebAuthnSupported}
                    className="bg-purple-500 hover:bg-purple-600"
                >
                    {isRegistering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    Add Passkey
                </Button>
            </div>

            {/* Status messages */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{success}</span>
                </div>
            )}

            {/* WebAuthn not supported warning */}
            {!isWebAuthnSupported && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">
                        Passkeys are not supported in this browser. Try Chrome, Safari, or Edge.
                    </span>
                </div>
            )}

            {/* Passkey list */}
            <div className="space-y-3">
                {passkeys.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                        <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>No passkeys registered</p>
                        <p className="text-sm">Add a passkey for faster, more secure logins</p>
                    </div>
                ) : (
                    passkeys.map((passkey, index) => {
                        const Icon = getDeviceIcon(passkey.deviceType);
                        return (
                            <motion.div
                                key={passkey.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white/70" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{passkey.name}</p>
                                        <p className="text-sm text-white/50">
                                            Created {passkey.createdAt.toLocaleDateString()}
                                            {passkey.lastUsed && (
                                                <span> · Last used {passkey.lastUsed.toLocaleDateString()}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePasskey(passkey.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Security info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">Why use passkeys?</h4>
                <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Phishing-resistant - can&apos;t be stolen by fake websites
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        No passwords to remember or type
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Uses your device&apos;s biometrics (Face ID, fingerprint)
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default PasskeyManager;
