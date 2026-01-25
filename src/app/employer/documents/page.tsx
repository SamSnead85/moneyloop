'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Upload,
    Download,
    Search,
    Filter,
    MoreHorizontal,
    Folder,
    File,
    Users,
    Shield,
    Calendar,
    Clock,
    Check,
    Eye,
    Trash2,
    Plus,
    ChevronRight,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'xlsx' | 'image';
    category: 'policies' | 'compliance' | 'tax_forms' | 'payroll' | 'templates' | 'legal' | 'employee';
    size: string;
    uploadedBy: string;
    uploadedAt: string;
    employeeId?: string;
    employeeName?: string;
}

// Mock data
const mockDocuments: Document[] = [
    { id: '1', name: 'Employee Handbook 2026', type: 'pdf', category: 'policies', size: '2.4 MB', uploadedBy: 'John Smith', uploadedAt: '2026-01-01' },
    { id: '2', name: 'I-9 Employment Verification', type: 'pdf', category: 'compliance', size: '156 KB', uploadedBy: 'System', uploadedAt: '2026-01-15' },
    { id: '3', name: 'W-4 Tax Withholding Form', type: 'pdf', category: 'tax_forms', size: '98 KB', uploadedBy: 'System', uploadedAt: '2026-01-15' },
    { id: '4', name: 'Direct Deposit Authorization', type: 'pdf', category: 'payroll', size: '45 KB', uploadedBy: 'System', uploadedAt: '2025-12-01' },
    { id: '5', name: 'Offer Letter Template', type: 'docx', category: 'templates', size: '32 KB', uploadedBy: 'John Smith', uploadedAt: '2025-12-15' },
    { id: '6', name: 'NDA Agreement', type: 'pdf', category: 'legal', size: '128 KB', uploadedBy: 'John Smith', uploadedAt: '2025-10-01' },
    { id: '7', name: 'Sarah Chen - W-4', type: 'pdf', category: 'employee', size: '85 KB', uploadedBy: 'Sarah Chen', uploadedAt: '2024-03-15', employeeId: '1', employeeName: 'Sarah Chen' },
    { id: '8', name: 'Marcus Johnson - I-9', type: 'pdf', category: 'employee', size: '142 KB', uploadedBy: 'Marcus Johnson', uploadedAt: '2024-06-01', employeeId: '2', employeeName: 'Marcus Johnson' },
    { id: '9', name: 'Remote Work Policy', type: 'pdf', category: 'policies', size: '890 KB', uploadedBy: 'John Smith', uploadedAt: '2025-08-15' },
    { id: '10', name: 'Stock Option Agreement', type: 'pdf', category: 'legal', size: '256 KB', uploadedBy: 'John Smith', uploadedAt: '2025-06-01' },
];

const categories = [
    { id: 'all', label: 'All Documents', icon: Folder, count: mockDocuments.length },
    { id: 'policies', label: 'Policies', icon: FileText, count: 2 },
    { id: 'compliance', label: 'Compliance', icon: Shield, count: 1 },
    { id: 'tax_forms', label: 'Tax Forms', icon: FileText, count: 1 },
    { id: 'payroll', label: 'Payroll', icon: FileText, count: 1 },
    { id: 'templates', label: 'Templates', icon: File, count: 1 },
    { id: 'legal', label: 'Legal', icon: Shield, count: 2 },
    { id: 'employee', label: 'Employee Files', icon: Users, count: 2 },
];

// Document Row
function DocumentRow({ doc }: { doc: Document }) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return 'PDF';
            case 'docx': return 'DOC';
            case 'xlsx': return 'XLS';
            default: return 'FILE';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'policies': return 'bg-blue-500/10 text-blue-400';
            case 'compliance': return 'bg-amber-500/10 text-amber-400';
            case 'tax_forms': return 'bg-purple-500/10 text-purple-400';
            case 'legal': return 'bg-rose-500/10 text-rose-400';
            case 'employee': return 'bg-[#0ea5e9]/10 text-[#0ea5e9]';
            default: return 'bg-white/10 text-white/60';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <span className="text-xs font-medium text-white/60">{getTypeIcon(doc.type)}</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">{doc.size}</span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/40">{doc.uploadedAt}</span>
                        {doc.employeeName && (
                            <>
                                <span className="text-xs text-white/20">·</span>
                                <span className="text-xs text-[#0ea5e9]">{doc.employeeName}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(doc.category)}`}>
                    {doc.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-white/[0.05]">
                        <Eye className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.05]">
                        <Download className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.05]">
                        <Trash2 className="w-4 h-4 text-white/40" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Main Component
export default function DocumentsPage() {
    const [documents] = useState(mockDocuments);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredDocs = documents.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
                <Card className="p-3 bg-white/[0.02] border-white/[0.06]">
                    <nav className="space-y-1">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${selectedCategory === cat.id
                                        ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                        : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                </div>
                                <span className="text-xs text-white/30">{cat.count}</span>
                            </button>
                        ))}
                    </nav>
                </Card>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Documents</h1>
                        <p className="text-white/50">Manage HR documents and templates</p>
                    </div>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Upload className="w-4 h-4" />
                        Upload Document
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                    />
                </div>

                {/* Document List */}
                <Card className="bg-white/[0.02] border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {filteredDocs.map((doc) => (
                            <DocumentRow key={doc.id} doc={doc} />
                        ))}
                    </div>
                </Card>

                {filteredDocs.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/50">No documents found</p>
                    </div>
                )}

                {/* Quick Templates */}
                <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                    <h3 className="font-medium text-white mb-4">Quick Templates</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { name: 'Offer Letter', icon: FileText },
                            { name: 'NDA', icon: Shield },
                            { name: 'W-4 Form', icon: FileText },
                            { name: 'I-9 Form', icon: Users },
                        ].map((template) => (
                            <button
                                key={template.name}
                                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left group"
                            >
                                <template.icon className="w-6 h-6 text-[#0ea5e9] mb-2" />
                                <p className="text-sm font-medium text-white">{template.name}</p>
                                <p className="text-xs text-white/40">Download template</p>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
