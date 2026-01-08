'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Target,
    Calendar,
    DollarSign,
    Trash2,
    Edit3,
    Check,
    Loader2
} from 'lucide-react';

interface Goal {
    id: string;
    name: string;
    description: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    color: string;
    icon: string | null;
    completed: boolean;
}

interface GoalManagerProps {
    goals: Goal[];
    onAdd: (goal: Omit<Goal, 'id' | 'completed'>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Goal>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onContribute: (id: string, amount: number) => Promise<void>;
}

const colorOptions = [
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
];

export function GoalCard({
    goal,
    onEdit,
    onDelete,
    onContribute
}: {
    goal: Goal;
    onEdit: () => void;
    onDelete: () => void;
    onContribute: (amount: number) => void;
}) {
    const [showContribute, setShowContribute] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const progress = goal.target_amount > 0
        ? (goal.current_amount / goal.target_amount) * 100
        : 0;

    const remaining = goal.target_amount - goal.current_amount;

    const handleContribute = async () => {
        const value = parseFloat(amount);
        if (value > 0) {
            setLoading(true);
            await onContribute(value);
            setLoading(false);
            setAmount('');
            setShowContribute(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.color === 'emerald' ? 'bg-emerald-500/20' :
                                goal.color === 'blue' ? 'bg-blue-500/20' :
                                    goal.color === 'purple' ? 'bg-purple-500/20' :
                                        goal.color === 'amber' ? 'bg-amber-500/20' :
                                            goal.color === 'rose' ? 'bg-rose-500/20' :
                                                'bg-cyan-500/20'
                            }`}
                    >
                        <Target className={`w-5 h-5 ${goal.color === 'emerald' ? 'text-emerald-400' :
                                goal.color === 'blue' ? 'text-blue-400' :
                                    goal.color === 'purple' ? 'text-purple-400' :
                                        goal.color === 'amber' ? 'text-amber-400' :
                                            goal.color === 'rose' ? 'text-rose-400' :
                                                'text-cyan-400'
                            }`} />
                    </div>
                    <div>
                        <h3 className="font-medium">{goal.name}</h3>
                        {goal.description && (
                            <p className="text-xs text-slate-500">{goal.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-mono text-lg">${goal.current_amount.toLocaleString()}</span>
                    <span className="text-slate-500">of ${goal.target_amount.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${goal.color === 'emerald' ? 'bg-emerald-500' :
                                goal.color === 'blue' ? 'bg-blue-500' :
                                    goal.color === 'purple' ? 'bg-purple-500' :
                                        goal.color === 'amber' ? 'bg-amber-500' :
                                            goal.color === 'rose' ? 'bg-rose-500' :
                                                'bg-cyan-500'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>{Math.round(progress)}% complete</span>
                    {goal.deadline && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Contribute Section */}
            <AnimatePresence mode="wait">
                {!showContribute ? (
                    <motion.button
                        key="add-button"
                        onClick={() => setShowContribute(true)}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add contribution
                    </motion.button>
                ) : (
                    <motion.div
                        key="contribute-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-2"
                    >
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none text-sm font-mono"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleContribute}
                            disabled={loading || !amount}
                            className="px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setShowContribute(false)}
                            className="px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remaining */}
            {remaining > 0 && (
                <p className="text-center text-xs text-slate-500 mt-3">
                    ${remaining.toLocaleString()} remaining to reach goal
                </p>
            )}
            {goal.completed && (
                <motion.div
                    className="text-center text-xs text-emerald-400 mt-3 flex items-center justify-center gap-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <Check className="w-3 h-3" />
                    Goal completed! 🎉
                </motion.div>
            )}
        </motion.div>
    );
}

export function AddGoalModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (goal: Omit<Goal, 'id' | 'completed'>) => Promise<void>;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [color, setColor] = useState('emerald');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        setLoading(true);
        await onAdd({
            name,
            description,
            target_amount: parseFloat(targetAmount),
            current_amount: parseFloat(currentAmount) || 0,
            deadline: deadline || null,
            color,
            icon: null,
        });
        setLoading(false);
        onClose();

        // Reset form
        setName('');
        setDescription('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        setColor('emerald');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl bg-[#0d0d12] border border-white/[0.08] overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                            <h2 className="text-lg font-semibold">Create New Goal</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04]">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Goal Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Emergency Fund"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Target Amount *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            value={targetAmount}
                                            onChange={(e) => setTargetAmount(e.target.value)}
                                            placeholder="10,000"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Starting Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="number"
                                            value={currentAmount}
                                            onChange={(e) => setCurrentAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">Target Date</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Color</label>
                                <div className="flex gap-2">
                                    {colorOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setColor(opt.value)}
                                            className={`w-8 h-8 rounded-lg ${opt.class} transition-transform ${color === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d0d12] scale-110' : 'opacity-60 hover:opacity-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name || !targetAmount}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Create Goal
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Main Goal Manager Component
export function GoalManager({
    goals,
    onAdd,
    onUpdate,
    onDelete,
    onContribute
}: GoalManagerProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Financial Goals</h2>
                    <p className="text-sm text-slate-500">Track and achieve your savings goals</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Goal
                </button>
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {activeGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={() => setEditingGoal(goal)}
                                onDelete={() => onDelete(goal.id)}
                                onContribute={(amount) => onContribute(goal.id, amount)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No active goals</h3>
                    <p className="text-sm text-slate-500 mb-4">Create your first financial goal to start tracking</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-sm"
                    >
                        Create Goal
                    </button>
                </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-slate-400 mb-4">Completed Goals</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                        {completedGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={() => setEditingGoal(goal)}
                                onDelete={() => onDelete(goal.id)}
                                onContribute={() => { }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <AddGoalModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={onAdd}
            />
        </div>
    );
}

export default GoalManager;
