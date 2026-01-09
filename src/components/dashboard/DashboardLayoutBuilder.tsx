'use client';

import { useState, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import {
    LayoutGrid,
    Grip,
    Plus,
    X,
    Settings,
    Save,
    RotateCcw,
    Check,
    Maximize2,
    Minimize2,
    PieChart,
    TrendingUp,
    Wallet,
    Target,
    CreditCard,
    Calendar,
    Receipt,
    Lightbulb,
    Shield,
} from 'lucide-react';
import { Surface, Text, Badge, Divider } from '@/components/primitives';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export type WidgetType =
    | 'spending-chart'
    | 'income-vs-expense'
    | 'net-worth'
    | 'goals-progress'
    | 'upcoming-bills'
    | 'recent-transactions'
    | 'budget-status'
    | 'health-score'
    | 'insights'
    | 'accounts-summary';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    size: WidgetSize;
    title: string;
    visible: boolean;
}

interface DashboardLayoutBuilderProps {
    widgets: DashboardWidget[];
    onSave: (widgets: DashboardWidget[]) => void;
    onReset: () => void;
    isEditing: boolean;
    onEditToggle: () => void;
    className?: string;
}

// ===== WIDGET CONFIG =====

const widgetConfig: Record<WidgetType, {
    icon: typeof PieChart;
    label: string;
    description: string;
    defaultSize: WidgetSize;
}> = {
    'spending-chart': {
        icon: PieChart,
        label: 'Spending Breakdown',
        description: 'Category spending pie chart',
        defaultSize: 'medium',
    },
    'income-vs-expense': {
        icon: TrendingUp,
        label: 'Income vs Expenses',
        description: 'Monthly trend comparison',
        defaultSize: 'medium',
    },
    'net-worth': {
        icon: Wallet,
        label: 'Net Worth',
        description: 'Total assets minus liabilities',
        defaultSize: 'small',
    },
    'goals-progress': {
        icon: Target,
        label: 'Goals Progress',
        description: 'Savings goal tracking',
        defaultSize: 'medium',
    },
    'upcoming-bills': {
        icon: CreditCard,
        label: 'Upcoming Bills',
        description: 'Bills due this week',
        defaultSize: 'small',
    },
    'recent-transactions': {
        icon: Receipt,
        label: 'Recent Transactions',
        description: 'Latest activity',
        defaultSize: 'medium',
    },
    'budget-status': {
        icon: Calendar,
        label: 'Budget Status',
        description: 'Category budget progress',
        defaultSize: 'medium',
    },
    'health-score': {
        icon: Shield,
        label: 'Financial Health',
        description: 'Overall wellness score',
        defaultSize: 'small',
    },
    'insights': {
        icon: Lightbulb,
        label: 'AI Insights',
        description: 'Smart recommendations',
        defaultSize: 'medium',
    },
    'accounts-summary': {
        icon: Wallet,
        label: 'Accounts',
        description: 'Connected accounts overview',
        defaultSize: 'small',
    },
};

const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
};

// ===== COMPONENTS =====

function WidgetSelector({
    availableWidgets,
    onAdd,
    onClose,
}: {
    availableWidgets: WidgetType[];
    onAdd: (type: WidgetType) => void;
    onClose: () => void;
}) {
    return (
        <Surface elevation={2} className="p-6 max-w-lg">
            <div className="flex items-center justify-between mb-4">
                <Text variant="heading-md">Add Widget</Text>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {availableWidgets.map(type => {
                    const config = widgetConfig[type];
                    const Icon = config.icon;

                    return (
                        <button
                            key={type}
                            onClick={() => {
                                onAdd(type);
                                onClose();
                            }}
                            className="p-4 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)] text-left transition-colors"
                        >
                            <Icon className="w-6 h-6 mb-2 text-[var(--accent-primary)]" />
                            <Text variant="body-sm" className="font-medium">{config.label}</Text>
                            <Text variant="caption" color="tertiary">{config.description}</Text>
                        </button>
                    );
                })}
            </div>

            {availableWidgets.length === 0 && (
                <Text variant="body-sm" color="tertiary" className="text-center py-8">
                    All widgets have been added
                </Text>
            )}
        </Surface>
    );
}

function DraggableWidget({
    widget,
    isEditing,
    onRemove,
    onResize,
}: {
    widget: DashboardWidget;
    isEditing: boolean;
    onRemove: () => void;
    onResize: (size: WidgetSize) => void;
}) {
    const dragControls = useDragControls();
    const config = widgetConfig[widget.type];
    const Icon = config.icon;

    return (
        <Reorder.Item
            value={widget}
            dragListener={false}
            dragControls={dragControls}
            className={cn(sizeClasses[widget.size])}
        >
            <Surface
                elevation={1}
                className={cn(
                    'p-4 h-full min-h-[150px] relative',
                    isEditing && 'ring-2 ring-dashed ring-[var(--border-emphasis)]'
                )}
            >
                {isEditing && (
                    <>
                        {/* Drag handle */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="absolute top-2 left-2 p-1 cursor-grab active:cursor-grabbing"
                        >
                            <Grip className="w-5 h-5 text-[var(--text-tertiary)]" />
                        </div>

                        {/* Controls */}
                        <div className="absolute top-2 right-2 flex gap-1">
                            {/* Size toggle */}
                            <button
                                onClick={() => {
                                    const sizes: WidgetSize[] = ['small', 'medium', 'large'];
                                    const currentIdx = sizes.indexOf(widget.size);
                                    onResize(sizes[(currentIdx + 1) % sizes.length]);
                                }}
                                className="p-1 rounded hover:bg-[var(--surface-elevated)] text-[var(--text-tertiary)]"
                                title="Change size"
                            >
                                {widget.size === 'small' && <Minimize2 className="w-4 h-4" />}
                                {widget.size === 'medium' && <LayoutGrid className="w-4 h-4" />}
                                {widget.size === 'large' && <Maximize2 className="w-4 h-4" />}
                            </button>

                            {/* Remove */}
                            <button
                                onClick={onRemove}
                                className="p-1 rounded hover:bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)]"
                                title="Remove widget"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* Widget Content Placeholder */}
                <div className={cn('flex items-center gap-3', isEditing && 'mt-6')}>
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <Text variant="body-sm" className="font-medium">{widget.title}</Text>
                        <Text variant="caption" color="tertiary">
                            {widget.size.charAt(0).toUpperCase() + widget.size.slice(1)} widget
                        </Text>
                    </div>
                </div>

                {/* Placeholder content area */}
                <div className="mt-4 flex-1 rounded-xl bg-[var(--surface-elevated)] min-h-[60px] flex items-center justify-center">
                    <Text variant="caption" color="tertiary">Widget content</Text>
                </div>
            </Surface>
        </Reorder.Item>
    );
}

// ===== MAIN COMPONENT =====

export function DashboardLayoutBuilder({
    widgets: initialWidgets,
    onSave,
    onReset,
    isEditing,
    onEditToggle,
    className,
}: DashboardLayoutBuilderProps) {
    const [widgets, setWidgets] = useState(initialWidgets);
    const [showSelector, setShowSelector] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const visibleWidgets = widgets.filter(w => w.visible);
    const usedTypes = new Set(visibleWidgets.map(w => w.type));
    const availableTypes = (Object.keys(widgetConfig) as WidgetType[]).filter(t => !usedTypes.has(t));

    const handleReorder = useCallback((newOrder: DashboardWidget[]) => {
        setWidgets(current => {
            const hidden = current.filter(w => !w.visible);
            return [...newOrder, ...hidden];
        });
        setHasChanges(true);
    }, []);

    const handleAdd = useCallback((type: WidgetType) => {
        const config = widgetConfig[type];
        const newWidget: DashboardWidget = {
            id: Date.now().toString(),
            type,
            size: config.defaultSize,
            title: config.label,
            visible: true,
        };
        setWidgets(prev => [...prev, newWidget]);
        setHasChanges(true);
    }, []);

    const handleRemove = useCallback((id: string) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: false } : w));
        setHasChanges(true);
    }, []);

    const handleResize = useCallback((id: string, size: WidgetSize) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
        setHasChanges(true);
    }, []);

    const handleSave = () => {
        onSave(widgets);
        setHasChanges(false);
        onEditToggle();
    };

    const handleReset = () => {
        onReset();
        setWidgets(initialWidgets);
        setHasChanges(false);
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Edit Mode Header */}
            {isEditing && (
                <Surface elevation={1} className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
                            <Text variant="body-md" className="font-medium">Customize Dashboard</Text>
                            <Badge variant="info" size="sm">Editing</Badge>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSelector(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated-2)]"
                            >
                                <Plus className="w-4 h-4" />
                                Add Widget
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white disabled:opacity-50 hover:brightness-110"
                            >
                                <Save className="w-4 h-4" />
                                Save Layout
                            </button>
                        </div>
                    </div>
                </Surface>
            )}

            {/* Dashboard Grid */}
            <Reorder.Group
                axis="y"
                values={visibleWidgets}
                onReorder={handleReorder}
                className="grid grid-cols-3 gap-4"
            >
                {visibleWidgets.map(widget => (
                    <DraggableWidget
                        key={widget.id}
                        widget={widget}
                        isEditing={isEditing}
                        onRemove={() => handleRemove(widget.id)}
                        onResize={(size) => handleResize(widget.id, size)}
                    />
                ))}
            </Reorder.Group>

            {/* Empty state */}
            {visibleWidgets.length === 0 && isEditing && (
                <Surface elevation={1} className="p-12 text-center">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                    <Text variant="heading-sm" className="mb-2">No widgets added</Text>
                    <Text variant="body-sm" color="tertiary" className="mb-6">
                        Add widgets to customize your dashboard
                    </Text>
                    <button
                        onClick={() => setShowSelector(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white hover:brightness-110"
                    >
                        <Plus className="w-5 h-5" />
                        Add Widget
                    </button>
                </Surface>
            )}

            {/* Widget Selector Modal */}
            {showSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <WidgetSelector
                            availableWidgets={availableTypes}
                            onAdd={handleAdd}
                            onClose={() => setShowSelector(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default DashboardLayoutBuilder;
