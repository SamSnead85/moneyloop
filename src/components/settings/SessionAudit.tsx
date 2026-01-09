'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Monitor,
    Smartphone,
    Globe,
    Clock,
    MapPin,
    LogOut,
    Shield,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

interface Session {
    id: string;
    device: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    location: string;
    ip: string;
    lastActive: Date;
    isCurrent: boolean;
}

export function SessionAudit() {
    const [sessions, setSessions] = useState<Session[]>([
        {
            id: '1',
            device: 'MacBook Pro',
            deviceType: 'desktop',
            browser: 'Chrome 120',
            location: 'Tampa, FL',
            ip: '73.xxx.xxx.xx',
            lastActive: new Date(),
            isCurrent: true,
        },
        {
            id: '2',
            device: 'iPhone 15 Pro',
            deviceType: 'mobile',
            browser: 'Safari',
            location: 'Tampa, FL',
            ip: '73.xxx.xxx.xx',
            lastActive: new Date(Date.now() - 3600000 * 2),
            isCurrent: false,
        },
        {
            id: '3',
            device: 'Windows PC',
            deviceType: 'desktop',
            browser: 'Edge 119',
            location: 'New York, NY',
            ip: '45.xxx.xxx.xx',
            lastActive: new Date(Date.now() - 86400000 * 3),
            isCurrent: false,
        },
    ]);
    const [revoking, setRevoking] = useState<string | null>(null);

    const getDeviceIcon = (type: Session['deviceType']) => {
        switch (type) {
            case 'mobile':
            case 'tablet':
                return Smartphone;
            default:
                return Monitor;
        }
    };

    const formatLastActive = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    };

    const revokeSession = async (sessionId: string) => {
        setRevoking(sessionId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setRevoking(null);
    };

    const revokeAllOthers = async () => {
        const otherSessions = sessions.filter(s => !s.isCurrent);
        for (const session of otherSessions) {
            await revokeSession(session.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
                        <p className="text-sm text-white/50">{sessions.length} devices signed in</p>
                    </div>
                </div>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={revokeAllOthers}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out all others
                    </Button>
                )}
            </div>

            {/* Sessions */}
            <div className="space-y-3">
                {sessions.map((session, index) => {
                    const Icon = getDeviceIcon(session.deviceType);
                    return (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border transition-colors ${session.isCurrent
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isCurrent ? 'bg-emerald-500/20' : 'bg-white/[0.05]'
                                        }`}>
                                        <Icon className={`w-5 h-5 ${session.isCurrent ? 'text-emerald-400' : 'text-white/70'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{session.device}</p>
                                            {session.isCurrent && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-white/50">
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3.5 h-3.5" />
                                                {session.browser}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {session.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatLastActive(session.lastActive)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/30 mt-1">IP: {session.ip}</p>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => revokeSession(session.id)}
                                        disabled={revoking === session.id}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        {revoking === session.id ? (
                                            <span className="animate-spin">⏳</span>
                                        ) : (
                                            <LogOut className="w-4 h-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Security tips */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">Security Tips</h4>
                <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Revoke sessions you don&apos;t recognize
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Use passkeys for stronger security
                    </li>
                    <li className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Unfamiliar location? Change your password immediately
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default SessionAudit;
