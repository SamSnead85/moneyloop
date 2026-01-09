'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Download,
    Upload,
    Cloud,
    Database,
    CheckCircle,
    Clock,
    AlertTriangle,
    Loader2,
    HardDrive,
} from 'lucide-react';

interface BackupRecord {
    id: string;
    date: Date;
    size: string;
    type: 'full' | 'incremental';
    status: 'completed' | 'pending' | 'failed';
}

const DEMO_BACKUPS: BackupRecord[] = [
    { id: '1', date: new Date('2026-01-08T12:00:00'), size: '2.4 MB', type: 'full', status: 'completed' },
    { id: '2', date: new Date('2026-01-07T12:00:00'), size: '1.2 MB', type: 'incremental', status: 'completed' },
    { id: '3', date: new Date('2026-01-06T12:00:00'), size: '1.1 MB', type: 'incremental', status: 'completed' },
    { id: '4', date: new Date('2026-01-05T12:00:00'), size: '2.3 MB', type: 'full', status: 'completed' },
];

export function DataBackupManager() {
    const [backups] = useState<BackupRecord[]>(DEMO_BACKUPS);
    const [isExporting, setIsExporting] = useState(false);
    const [lastBackup] = useState<Date>(new Date('2026-01-08T12:00:00'));

    const handleExport = async (format: 'json' | 'csv') => {
        setIsExporting(true);

        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In production, this would fetch all user data and create a download
        const demoData = {
            exportedAt: new Date().toISOString(),
            accounts: [{ id: '1', name: 'Demo Account', balance: 10000 }],
            transactions: [{ id: '1', amount: -50, description: 'Demo Transaction' }],
            budgets: [{ id: '1', category: 'Food', limit: 500 }],
            goals: [{ id: '1', name: 'Emergency Fund', target: 10000 }],
        };

        const blob = format === 'json'
            ? new Blob([JSON.stringify(demoData, null, 2)], { type: 'application/json' })
            : new Blob([
                'type,id,name,amount\n' +
                'account,1,Demo Account,10000\n' +
                'transaction,1,Demo Transaction,-50'
            ], { type: 'text/csv' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneyloop-backup-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExporting(false);
    };

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const daysSinceBackup = Math.floor((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                        <Database className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Data Backup</h3>
                        <p className="text-sm text-white/50">Export and protect your financial data</p>
                    </div>
                </div>
            </div>

            {/* Backup Status */}
            <div className={`p-4 rounded-xl border ${daysSinceBackup <= 1
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : daysSinceBackup <= 7
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                }`}>
                <div className="flex items-center gap-3">
                    {daysSinceBackup <= 1 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : daysSinceBackup <= 7 ? (
                        <Clock className="w-5 h-5 text-amber-400" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                        <p className={`font-medium ${daysSinceBackup <= 1 ? 'text-emerald-400' :
                                daysSinceBackup <= 7 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                            {daysSinceBackup === 0
                                ? 'Backed up today'
                                : `Last backup ${daysSinceBackup} day${daysSinceBackup > 1 ? 's' : ''} ago`
                            }
                        </p>
                        <p className="text-sm text-white/50">{formatDate(lastBackup)}</p>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all text-left group"
                >
                    <HardDrive className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-white mb-1">Export as JSON</h4>
                    <p className="text-sm text-white/50">Full data export with all details. Best for re-importing.</p>
                    {isExporting && <Loader2 className="w-4 h-4 animate-spin mt-2 text-cyan-400" />}
                </button>

                <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all text-left group"
                >
                    <Download className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-white mb-1">Export as CSV</h4>
                    <p className="text-sm text-white/50">Spreadsheet format. Best for Excel or Google Sheets.</p>
                    {isExporting && <Loader2 className="w-4 h-4 animate-spin mt-2 text-emerald-400" />}
                </button>
            </div>

            {/* Backup History */}
            <div>
                <h4 className="text-sm font-medium text-white/70 mb-4">Backup History</h4>
                <div className="space-y-2">
                    {backups.map((backup, index) => (
                        <motion.div
                            key={backup.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${backup.status === 'completed' ? 'bg-emerald-500/20' :
                                        backup.status === 'pending' ? 'bg-amber-500/20' : 'bg-red-500/20'
                                    }`}>
                                    {backup.status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    ) : backup.status === 'pending' ? (
                                        <Clock className="w-4 h-4 text-amber-400" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {backup.type === 'full' ? 'Full Backup' : 'Incremental'}
                                    </p>
                                    <p className="text-xs text-white/50">{formatDate(backup.date)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-white/70 font-mono">{backup.size}</p>
                                <p className="text-xs text-white/40 capitalize">{backup.status}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Cloud Sync Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start gap-3">
                    <Cloud className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-white">Automatic Cloud Backup</h4>
                        <p className="text-sm text-white/50 mt-1">
                            Your data is automatically encrypted and backed up to the cloud daily.
                            Manual exports allow you to keep a local copy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataBackupManager;
