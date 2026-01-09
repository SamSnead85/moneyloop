'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import {
    Tag,
    Plus,
    X,
    Edit2,
    Check,
    Palette,
    Search,
} from 'lucide-react';

interface TagData {
    id: string;
    name: string;
    color: string;
    count: number;
}

const PRESET_COLORS = [
    '#7dd3a8', // emerald
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#fbbf24', // amber
    '#f87171', // red
    '#fb923c', // orange
    '#34d399', // green
    '#f472b6', // pink
];

const DEMO_TAGS: TagData[] = [
    { id: '1', name: 'Tax Deductible', color: '#60a5fa', count: 45 },
    { id: '2', name: 'Work Expenses', color: '#a78bfa', count: 23 },
    { id: '3', name: 'Recurring', color: '#7dd3a8', count: 18 },
    { id: '4', name: 'Needs Review', color: '#fbbf24', count: 12 },
    { id: '5', name: 'Reimbursable', color: '#fb923c', count: 8 },
    { id: '6', name: 'Business', color: '#34d399', count: 156 },
];

export function TagManager() {
    const [tags, setTags] = useState<TagData[]>(DEMO_TAGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTag, setNewTag] = useState({ name: '', color: PRESET_COLORS[0] });
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const createTag = () => {
        if (!newTag.name.trim()) return;

        const tag: TagData = {
            id: crypto.randomUUID(),
            name: newTag.name.trim(),
            color: newTag.color,
            count: 0,
        };

        setTags(prev => [...prev, tag]);
        setNewTag({ name: '', color: PRESET_COLORS[0] });
        setIsCreating(false);
    };

    const deleteTag = (id: string) => {
        setTags(prev => prev.filter(t => t.id !== id));
    };

    const updateTag = (id: string, updates: Partial<TagData>) => {
        setTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Tags</h3>
                        <p className="text-sm text-white/50">{tags.length} tags created</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setIsCreating(true);
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="bg-violet-500 hover:bg-violet-600"
                >
                    <Plus className="w-4 h-4" />
                    New Tag
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
                />
            </div>

            {/* Create Tag Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-violet-500/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: newTag.color }}
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Tag name..."
                                value={newTag.name}
                                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && createTag()}
                                className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
                            />
                        </div>

                        {/* Color picker */}
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-4 h-4 text-white/40" />
                            <div className="flex gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewTag(prev => ({ ...prev, color }))}
                                        className={`w-6 h-6 rounded-full transition-transform ${newTag.color === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreating(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={createTag}
                                disabled={!newTag.name.trim()}
                            >
                                Create Tag
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tags Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <AnimatePresence>
                    {filteredTags.map((tag, index) => (
                        <motion.div
                            key={tag.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                        >
                            {editingId === tag.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        defaultValue={tag.name}
                                        onBlur={(e) => updateTag(tag.id, { name: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateTag(tag.id, { name: e.currentTarget.value });
                                            }
                                        }}
                                        className="flex-1 bg-transparent text-white focus:outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 rounded hover:bg-white/10"
                                    >
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="font-medium text-white truncate">{tag.name}</span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-2 ml-7">
                                        {tag.count} transaction{tag.count !== 1 ? 's' : ''}
                                    </p>

                                    {/* Hover actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            onClick={() => setEditingId(tag.id)}
                                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                                        >
                                            <Edit2 className="w-3 h-3 text-white/70" />
                                        </button>
                                        <button
                                            onClick={() => deleteTag(tag.id)}
                                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30"
                                        >
                                            <X className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredTags.length === 0 && (
                <div className="text-center py-12 text-white/50">
                    <Tag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>{searchQuery ? 'No tags match your search' : 'No tags created yet'}</p>
                </div>
            )}
        </div>
    );
}

export default TagManager;
