'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    Check,
    X,
    AlertTriangle,
    ChevronRight,
    Download,
    HelpCircle,
    Loader2,
    CheckCircle,
    XCircle,
    File,
} from 'lucide-react';
import { Surface, Text, Badge, Progress, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface ImportMapping {
    sourceColumn: string;
    targetField: string;
    preview?: string[];
}

export interface ImportResult {
    total: number;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
}

interface DataImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: unknown[], mappings: ImportMapping[]) => Promise<ImportResult>;
    targetFields: Array<{ id: string; label: string; required?: boolean }>;
    className?: string;
}

// ===== COMPONENT =====

export function DataImportWizard({
    isOpen,
    onClose,
    onImport,
    targetFields,
    className,
}: DataImportWizardProps) {
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
    const [sourceColumns, setSourceColumns] = useState<string[]>([]);
    const [mappings, setMappings] = useState<ImportMapping[]>([]);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const parseCSV = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return { headers: [], data: [] };

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
                row[h] = values[i] || '';
            });
            return row;
        });

        return { headers, data };
    };

    const handleFile = async (uploadedFile: File) => {
        setFile(uploadedFile);

        const text = await uploadedFile.text();
        const { headers, data } = parseCSV(text);

        setSourceColumns(headers);
        setParsedData(data);

        // Auto-map matching columns
        const autoMappings = targetFields
            .map(field => {
                const match = headers.find(h =>
                    h.toLowerCase().replace(/[_\s]/g, '') ===
                    field.id.toLowerCase().replace(/[_\s]/g, '')
                );
                return {
                    sourceColumn: match || '',
                    targetField: field.id,
                    preview: match ? data.slice(0, 3).map(row => row[match]) : [],
                };
            });

        setMappings(autoMappings);
        setStep('mapping');
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const updateMapping = (targetField: string, sourceColumn: string) => {
        setMappings(prev => prev.map(m =>
            m.targetField === targetField
                ? {
                    ...m,
                    sourceColumn,
                    preview: sourceColumn ? parsedData.slice(0, 3).map(row => row[sourceColumn]) : []
                }
                : m
        ));
    };

    const handleImport = async () => {
        setStep('importing');

        try {
            const transformedData = parsedData.map(row => {
                const transformed: Record<string, string> = {};
                mappings.forEach(m => {
                    if (m.sourceColumn) {
                        transformed[m.targetField] = row[m.sourceColumn];
                    }
                });
                return transformed;
            });

            const importResult = await onImport(transformedData, mappings);
            setResult(importResult);
            setStep('complete');
        } catch (error) {
            setResult({
                total: parsedData.length,
                imported: 0,
                skipped: 0,
                errors: [{ row: 0, message: 'Import failed. Please try again.' }],
            });
            setStep('complete');
        }
    };

    const requiredFields = targetFields.filter(f => f.required);
    const allRequiredMapped = requiredFields.every(f =>
        mappings.find(m => m.targetField === f.id)?.sourceColumn
    );

    const resetWizard = () => {
        setStep('upload');
        setFile(null);
        setParsedData([]);
        setSourceColumns([]);
        setMappings([]);
        setResult(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn('relative w-full max-w-2xl mx-4', className)}
            >
                <Surface elevation={2} className="p-0 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Upload className="w-6 h-6 text-[var(--accent-primary)]" />
                            <Text variant="heading-lg">Import Data</Text>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 p-4 bg-[var(--surface-elevated)]">
                        {['upload', 'mapping', 'preview', 'importing', 'complete'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                                    step === s ? 'bg-[var(--accent-primary)] text-white' :
                                        ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > i
                                            ? 'bg-[var(--accent-success)] text-white'
                                            : 'bg-[var(--surface-base)] text-[var(--text-tertiary)]'
                                )}>
                                    {['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > i
                                        ? <Check className="w-4 h-4" />
                                        : i + 1}
                                </div>
                                {i < 4 && <ChevronRight className="w-4 h-4 text-[var(--text-quaternary)]" />}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {/* Upload Step */}
                            {step === 'upload' && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={cn(
                                            'border-2 border-dashed rounded-xl p-12 text-center transition-colors',
                                            dragActive
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)]'
                                                : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                                        )}
                                    >
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                                        <Text variant="heading-sm" className="mb-2">
                                            Drop your CSV file here
                                        </Text>
                                        <Text variant="body-sm" color="tertiary" className="mb-4">
                                            or click to browse
                                        </Text>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white cursor-pointer hover:brightness-110"
                                        >
                                            <FileText className="w-5 h-5" />
                                            Select CSV File
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* Mapping Step */}
                            {step === 'mapping' && (
                                <motion.div
                                    key="mapping"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <Text variant="heading-sm">Map Columns</Text>
                                            <Text variant="body-sm" color="tertiary">
                                                Match your CSV columns to our fields
                                            </Text>
                                        </div>
                                        <Badge variant="info" size="sm">
                                            {parsedData.length} rows detected
                                        </Badge>
                                    </div>

                                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                        {targetFields.map(field => {
                                            const mapping = mappings.find(m => m.targetField === field.id);
                                            return (
                                                <div key={field.id} className="p-4 rounded-xl bg-[var(--surface-elevated)]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Text variant="body-sm" className="font-medium">
                                                                    {field.label}
                                                                </Text>
                                                                {field.required && (
                                                                    <Badge variant="warning" size="sm">Required</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-[var(--text-quaternary)]" />
                                                        <div className="flex-1">
                                                            <select
                                                                value={mapping?.sourceColumn || ''}
                                                                onChange={(e) => updateMapping(field.id, e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]"
                                                            >
                                                                <option value="">Select column...</option>
                                                                {sourceColumns.map(col => (
                                                                    <option key={col} value={col}>{col}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {mapping?.preview && mapping.preview.length > 0 && (
                                                        <div className="mt-2 flex gap-2">
                                                            <Text variant="caption" color="tertiary">Preview:</Text>
                                                            {mapping.preview.map((p, i) => (
                                                                <Badge key={i} variant="default" size="sm">{p}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Importing Step */}
                            {step === 'importing' && (
                                <motion.div
                                    key="importing"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center py-12"
                                >
                                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-[var(--accent-primary)] animate-spin" />
                                    <Text variant="heading-sm" className="mb-2">Importing your data...</Text>
                                    <Text variant="body-sm" color="tertiary">
                                        This may take a moment
                                    </Text>
                                </motion.div>
                            )}

                            {/* Complete Step */}
                            {step === 'complete' && result && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center py-8"
                                >
                                    {result.imported > 0 ? (
                                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[var(--accent-success)]" />
                                    ) : (
                                        <XCircle className="w-16 h-16 mx-auto mb-4 text-[var(--accent-danger)]" />
                                    )}

                                    <Text variant="heading-md" className="mb-2">
                                        {result.imported > 0 ? 'Import Complete!' : 'Import Failed'}
                                    </Text>

                                    <div className="flex justify-center gap-8 my-6">
                                        <div className="text-center">
                                            <Text variant="heading-lg" className="text-[var(--accent-success)]">
                                                {result.imported}
                                            </Text>
                                            <Text variant="body-sm" color="tertiary">Imported</Text>
                                        </div>
                                        <div className="text-center">
                                            <Text variant="heading-lg" className="text-[var(--accent-warning)]">
                                                {result.skipped}
                                            </Text>
                                            <Text variant="body-sm" color="tertiary">Skipped</Text>
                                        </div>
                                        <div className="text-center">
                                            <Text variant="heading-lg" className="text-[var(--accent-danger)]">
                                                {result.errors.length}
                                            </Text>
                                            <Text variant="body-sm" color="tertiary">Errors</Text>
                                        </div>
                                    </div>

                                    {result.errors.length > 0 && (
                                        <div className="text-left mt-6 p-4 rounded-xl bg-[var(--accent-danger-subtle)]">
                                            <Text variant="body-sm" color="danger" className="font-medium mb-2">
                                                Errors encountered:
                                            </Text>
                                            <div className="max-h-[100px] overflow-y-auto space-y-1">
                                                {result.errors.slice(0, 5).map((err, i) => (
                                                    <Text key={i} variant="caption" color="tertiary">
                                                        Row {err.row}: {err.message}
                                                    </Text>
                                                ))}
                                                {result.errors.length > 5 && (
                                                    <Text variant="caption" color="tertiary">
                                                        ...and {result.errors.length - 5} more
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                        <button
                            onClick={step === 'complete' ? resetWizard : () => setStep('upload')}
                            className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-base)] rounded-xl"
                        >
                            {step === 'complete' ? 'Import More' : 'Back'}
                        </button>

                        {step === 'mapping' && (
                            <button
                                onClick={handleImport}
                                disabled={!allRequiredMapped}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white disabled:opacity-50 hover:brightness-110"
                            >
                                Import {parsedData.length} Records
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}

                        {step === 'complete' && (
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </Surface>
            </motion.div>
        </div>
    );
}

export default DataImportWizard;
