'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Table, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface FileUploadStepProps {
    onComplete: () => void;
    onSkip: () => void;
}

interface UploadedFile {
    name: string;
    size: number;
    type: 'pdf' | 'csv' | 'xlsx';
    status: 'uploading' | 'analyzing' | 'complete' | 'error';
}

export function FileUploadStep({ onComplete, onSkip }: FileUploadStepProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const type = ext === 'pdf' ? 'pdf' : ext === 'csv' ? 'csv' : 'xlsx';
            return {
                name: file.name,
                size: file.size,
                type,
                status: 'uploading' as const,
            };
        });

        setFiles((prev) => [...prev, ...newFiles]);

        // Simulate upload and analysis
        newFiles.forEach((file, index) => {
            setTimeout(() => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name ? { ...f, status: 'analyzing' } : f
                    )
                );
            }, 1000 + index * 500);

            setTimeout(() => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name ? { ...f, status: 'complete' } : f
                    )
                );
            }, 3000 + index * 500);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
    });

    const removeFile = (name: string) => {
        setFiles((prev) => prev.filter((f) => f.name !== name));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const allComplete = files.length > 0 && files.every((f) => f.status === 'complete');

    return (
        <div className="max-w-xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 rounded-2xl bg-[#c9b896]/10 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-[#c9b896]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    Upload Financial Documents
                </h1>
                <p className="text-slate-400">
                    Upload bank statements or expense spreadsheets for AI analysis.
                </p>
            </motion.div>

            {/* Dropzone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div
                    {...getRootProps()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all mb-6
                        ${isDragActive
                            ? 'border-[#c9b896] bg-[#c9b896]/5'
                            : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="text-center">
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-[#c9b896]' : 'text-slate-500'}`} />
                        <p className="text-lg font-medium mb-2">
                            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                        </p>
                        <p className="text-sm text-slate-500 mb-4">or click to browse</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                PDF Statements
                            </span>
                            <span className="flex items-center gap-1">
                                <Table className="w-4 h-4" />
                                CSV / Excel
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Uploaded Files */}
            {files.length > 0 && (
                <motion.div
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {files.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10"
                        >
                            <div
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center
                                    ${file.type === 'pdf' ? 'bg-red-500/10' : 'bg-green-500/10'}
                                `}
                            >
                                {file.type === 'pdf' ? (
                                    <FileText className="w-5 h-5 text-red-400" />
                                ) : (
                                    <Table className="w-5 h-5 text-green-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {file.status === 'uploading' && (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </div>
                                )}
                                {file.status === 'analyzing' && (
                                    <div className="flex items-center gap-2 text-[#c9b896] text-sm">
                                        <div className="w-4 h-4 border-2 border-[#c9b896] border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </div>
                                )}
                                {file.status === 'complete' && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                )}
                                {file.status === 'error' && (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Analysis Note */}
            {files.length > 0 && (
                <motion.div
                    className="p-4 rounded-xl bg-[#c9b896]/5 border border-[#c9b896]/20 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-sm text-slate-300">
                        <span className="text-[#c9b896] font-medium">AI Analysis:</span>{' '}
                        Our system will extract recurring expenses and categorize transactions from your documents.
                    </p>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {(files.length === 0 || allComplete) && (
                    <Button
                        onClick={onComplete}
                        className="w-full bg-[#c9b896] hover:bg-[#b8a785] text-[#0a0a0f] py-3"
                        icon={<ArrowRight className="w-5 h-5" />}
                    >
                        {files.length > 0 ? 'Continue' : 'Skip Upload'}
                    </Button>
                )}
                {files.length === 0 && (
                    <Button
                        variant="ghost"
                        onClick={onSkip}
                        className="w-full text-slate-500"
                    >
                        I&apos;ll do this later
                    </Button>
                )}
            </motion.div>
        </div>
    );
}

export default FileUploadStep;
