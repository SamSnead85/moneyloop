'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    GripVertical,
    ChevronRight,
    Check,
    X,
    Palette,
    Home,
    Car,
    Zap,
    ShoppingBag,
    Utensils,
    Tv,
    Heart,
    Plane,
    GraduationCap,
    Briefcase,
    Gift,
    CreditCard,
    DollarSign,
    TrendingUp,
    Circle,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    budget?: number;
    parentId?: string;
    isSystem?: boolean;
}

interface CategoryManagerProps {
    categories: Category[];
    onAdd: (category: Omit<Category, 'id'>) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onReorder: (categories: Category[]) => void;
}

// ===== ICONS MAP =====

const iconMap: Record<string, typeof Home> = {
    home: Home,
    car: Car,
    zap: Zap,
    shopping: ShoppingBag,
    food: Utensils,
    entertainment: Tv,
    health: Heart,
    travel: Plane,
    education: GraduationCap,
    work: Briefcase,
    gift: Gift,
    bills: CreditCard,
    income: DollarSign,
    investment: TrendingUp,
    other: Circle,
};

const iconOptions = Object.keys(iconMap);

const colorOptions = [
    'var(--chart-1)', // Emerald
    'var(--chart-2)', // Red
    'var(--chart-3)', // Blue
    'var(--chart-4)', // Amber
    'var(--chart-5)', // Violet
    'var(--chart-6)', // Cyan
    'var(--chart-7)', // Pink
    'var(--chart-8)', // Orange
];

// ===== COMPONENT =====

export function CategoryManager({
    categories,
    onAdd,
    onEdit,
    onDelete,
    onReorder,
}: CategoryManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: 'other',
        color: colorOptions[0],
    });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newCategory.name.trim()) return;
        onAdd({ ...newCategory, name: newCategory.name.trim() });
        setNewCategory({ name: '', icon: 'other', color: colorOptions[0] });
        setIsAdding(false);
    };

    const handleEdit = (category: Category, updates: Partial<Category>) => {
        onEdit({ ...category, ...updates });
    };

    const renderIcon = (iconName: string, className?: string) => {
        const IconComponent = iconMap[iconName] || Circle;
        return <IconComponent className={className} />;
    };

    return (
        <Surface elevation={1} className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                    <Text variant="heading-sm">Categories</Text>
                    <Text variant="body-sm" color="tertiary">
                        Manage your spending categories
                    </Text>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Add New Category Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-4">
                                {/* Icon Picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowIconPicker(showIconPicker ? null : 'new')}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `color-mix(in srgb, ${newCategory.color} 20%, transparent)` }}
                                    >
                                        {renderIcon(newCategory.icon, 'w-6 h-6')}
                                    </button>

                                    {showIconPicker === 'new' && (
                                        <div className="absolute top-full left-0 mt-2 z-50 p-3 rounded-xl bg-[var(--surface-elevated-2)] border border-[var(--border-default)] shadow-lg grid grid-cols-5 gap-2">
                                            {iconOptions.map((icon) => (
                                                <button
                                                    key={icon}
                                                    onClick={() => {
                                                        setNewCategory({ ...newCategory, icon });
                                                        setShowIconPicker(null);
                                                    }}
                                                    className={cn(
                                                        'p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors',
                                                        newCategory.icon === icon && 'bg-[var(--accent-primary-subtle)]'
                                                    )}
                                                >
                                                    {renderIcon(icon, 'w-5 h-5')}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Name Input */}
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="Category name"
                                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-base)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] outline-none"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />

                                {/* Color Picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowColorPicker(showColorPicker ? null : 'new')}
                                        className="p-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-emphasis)] transition-colors"
                                    >
                                        <Palette className="w-5 h-5" style={{ color: newCategory.color }} />
                                    </button>

                                    {showColorPicker === 'new' && (
                                        <div className="absolute top-full right-0 mt-2 z-50 p-3 rounded-xl bg-[var(--surface-elevated-2)] border border-[var(--border-default)] shadow-lg grid grid-cols-4 gap-2">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => {
                                                        setNewCategory({ ...newCategory, color });
                                                        setShowColorPicker(null);
                                                    }}
                                                    className="w-8 h-8 rounded-lg"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewCategory({ name: '', icon: 'other', color: colorOptions[0] });
                                    }}
                                    className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors"
                                >
                                    <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!newCategory.name.trim()}
                                    className="p-2 rounded-lg bg-[var(--accent-primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category List */}
            <Reorder.Group
                axis="y"
                values={categories}
                onReorder={onReorder}
                className="divide-y divide-[var(--border-subtle)]"
            >
                {categories.map((category) => (
                    <Reorder.Item
                        key={category.id}
                        value={category}
                        className="relative"
                    >
                        <div className={cn(
                            'flex items-center gap-4 p-4 hover:bg-[var(--surface-elevated)] transition-colors',
                            deleteConfirmId === category.id && 'bg-[var(--accent-danger-subtle)]'
                        )}>
                            {/* Drag Handle */}
                            <button className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-[var(--text-quaternary)]" />
                            </button>

                            {/* Icon */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `color-mix(in srgb, ${category.color} 20%, transparent)` }}
                            >
                                {renderIcon(category.icon, 'w-5 h-5')}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                {editingId === category.id ? (
                                    <input
                                        type="text"
                                        defaultValue={category.name}
                                        onBlur={(e) => {
                                            handleEdit(category, { name: e.target.value });
                                            setEditingId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEdit(category, { name: e.currentTarget.value });
                                                setEditingId(null);
                                            }
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-base)] border border-[var(--accent-primary)] outline-none"
                                        autoFocus
                                    />
                                ) : (
                                    <Text variant="body-md">{category.name}</Text>
                                )}
                                {category.budget && (
                                    <Text variant="body-sm" color="tertiary">
                                        Budget: ${category.budget.toLocaleString()}/mo
                                    </Text>
                                )}
                            </div>

                            {/* System Badge */}
                            {category.isSystem && (
                                <Badge variant="info" size="sm">System</Badge>
                            )}

                            {/* Actions */}
                            {deleteConfirmId === category.id ? (
                                <div className="flex items-center gap-2">
                                    <Text variant="body-sm" color="danger">Delete?</Text>
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(category.id);
                                            setDeleteConfirmId(null);
                                        }}
                                        className="p-2 rounded-lg bg-[var(--accent-danger)] text-white"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingId(category.id)}
                                        className="p-2 rounded-lg hover:bg-[var(--surface-elevated-2)] transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                                    </button>
                                    {!category.isSystem && (
                                        <button
                                            onClick={() => setDeleteConfirmId(category.id)}
                                            className="p-2 rounded-lg hover:bg-[var(--accent-danger-subtle)] transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {/* Empty State */}
            {categories.length === 0 && (
                <div className="p-12 text-center">
                    <Circle className="w-12 h-12 mx-auto mb-4 text-[var(--text-quaternary)]" />
                    <Text variant="body-md" color="tertiary">No categories yet</Text>
                    <Text variant="body-sm" color="tertiary">Add your first category to organize transactions</Text>
                </div>
            )}
        </Surface>
    );
}

export default CategoryManager;
