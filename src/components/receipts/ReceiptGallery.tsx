'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Receipt,
    Upload,
    Camera,
    Image,
    Trash2,
    X,
    Link2,
    Eye,
    ZoomIn,
    Download,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn, formatCurrency } from '@/lib/utils';

// ===== TYPES =====

export interface ReceiptImage {
    id: string;
    url: string;
    filename: string;
    uploadedAt: string;
    fileSize: number;
    linkedTransactionId?: string;
    linkedTransactionName?: string;
    extractedData?: {
        merchant?: string;
        amount?: number;
        date?: string;
    };
}

interface ReceiptGalleryProps {
    receipts: ReceiptImage[];
    onUpload: (files: File[]) => void;
    onDelete: (receiptId: string) => void;
    onLink: (receiptId: string) => void;
    onUnlink: (receiptId: string) => void;
    className?: string;
}

// ===== COMPONENT =====

export function ReceiptGallery({
    receipts,
    onUpload,
    onDelete,
    onLink,
    onUnlink,
    className,
}: ReceiptGalleryProps) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptImage | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files?.length) {
            onUpload(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            onUpload(Array.from(e.target.files));
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const unlinkedCount = receipts.filter(r => !r.linkedTransactionId).length;

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <Surface elevation={1} className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-6 h-6 text-[var(--accent-primary)]" />
                        <div>
                            <Text variant="heading-lg">Receipts</Text>
                            <Text variant="body-sm" color="tertiary">
                                {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} •
                                {unlinkedCount} unlinked
                            </Text>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={cn(
                                'p-2 rounded-lg',
                                view === 'grid' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                            )}
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                'p-2 rounded-lg',
                                view === 'list' ? 'bg-[var(--surface-elevated-2)]' : 'hover:bg-[var(--surface-elevated)]'
                            )}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Upload Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                        dragActive
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)]'
                            : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                    )}
                >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                    <Text variant="body-md" className="mb-2">
                        Drop receipts here or{' '}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[var(--accent-primary)] hover:underline"
                        >
                            browse
                        </button>
                    </Text>
                    <Text variant="body-sm" color="tertiary">
                        Supports JPG, PNG, PDF up to 10MB
                    </Text>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </Surface>

            {/* Gallery */}
            {receipts.length > 0 && (
                <Surface elevation={1} className="p-6">
                    {view === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {receipts.map(receipt => (
                                <div
                                    key={receipt.id}
                                    className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--surface-elevated)] cursor-pointer"
                                    onClick={() => setSelectedReceipt(receipt)}
                                >
                                    <img
                                        src={receipt.url}
                                        alt={receipt.filename}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30">
                                            <Eye className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                    {receipt.linkedTransactionId ? (
                                        <Badge variant="success" size="sm" className="absolute top-2 right-2">
                                            Linked
                                        </Badge>
                                    ) : (
                                        <Badge variant="warning" size="sm" className="absolute top-2 right-2">
                                            Unlinked
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {receipts.map(receipt => (
                                <div
                                    key={receipt.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] cursor-pointer"
                                    onClick={() => setSelectedReceipt(receipt)}
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--surface-base)] shrink-0">
                                        <img
                                            src={receipt.url}
                                            alt={receipt.filename}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text variant="body-sm" className="font-medium truncate">
                                            {receipt.filename}
                                        </Text>
                                        <Text variant="caption" color="tertiary">
                                            {formatFileSize(receipt.fileSize)} • {new Date(receipt.uploadedAt).toLocaleDateString()}
                                        </Text>
                                        {receipt.linkedTransactionName && (
                                            <Text variant="caption" className="text-[var(--accent-success)]">
                                                <Link2 className="w-3 h-3 inline mr-1" />
                                                {receipt.linkedTransactionName}
                                            </Text>
                                        )}
                                    </div>
                                    <Badge variant={receipt.linkedTransactionId ? 'success' : 'warning'} size="sm">
                                        {receipt.linkedTransactionId ? 'Linked' : 'Unlinked'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Surface>
            )}

            {/* Empty State */}
            {receipts.length === 0 && (
                <Surface elevation={1} className="p-12 text-center">
                    <Image className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                    <Text variant="heading-sm" className="mb-2">No receipts yet</Text>
                    <Text variant="body-sm" color="tertiary">
                        Upload receipts to keep track of your purchases
                    </Text>
                </Surface>
            )}

            {/* Receipt Viewer Modal */}
            <AnimatePresence>
                {selectedReceipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        onClick={() => setSelectedReceipt(null)}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20"
                            onClick={() => setSelectedReceipt(null)}
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="max-w-3xl max-h-[80vh] mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={selectedReceipt.url}
                                alt={selectedReceipt.filename}
                                className="max-w-full max-h-[70vh] rounded-xl object-contain"
                            />
                            <div className="flex items-center justify-center gap-3 mt-4">
                                {selectedReceipt.linkedTransactionId ? (
                                    <button
                                        onClick={() => {
                                            onUnlink(selectedReceipt.id);
                                            setSelectedReceipt(null);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        <Link2 className="w-4 h-4" />
                                        Unlink
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onLink(selectedReceipt.id);
                                            setSelectedReceipt(null);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white"
                                    >
                                        <Link2 className="w-4 h-4" />
                                        Link to Transaction
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onDelete(selectedReceipt.id);
                                        setSelectedReceipt(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ReceiptGallery;
