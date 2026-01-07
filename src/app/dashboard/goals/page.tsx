'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    Target,
    TrendingUp,
    Calendar,
    Edit3,
    Trash2,
    ChevronRight,
    DollarSign,
    PiggyBank,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Goal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string | null;
    color: string;
    status: string;
    created_at: string;
}

const colorOptions = [
    { name: 'emerald', class: 'bg-emerald-500', hex: '#10b981' },
    { name: 'blue', class: 'bg-blue-500', hex: '#3b82f6' },
    { name: 'purple', class: 'bg-purple-500', hex: '#a855f7' },
    { name: 'rose', class: 'bg-rose-500', hex: '#f43f5e' },
    { name: 'amber', class: 'bg-amber-500', hex: '#f59e0b' },
    { name: 'cyan', class: 'bg-cyan-500', hex: '#06b6d4' },
];

const mockGoals: Goal[] = [
    { id: '1', name: 'Emergency Fund', target_amount: 25000, current_amount: 15000, target_date: '2026-06-30', color: 'emerald', status: 'active', created_at: '2025-01-01' },
    { id: '2', name: 'House Down Payment', target_amount: 100000, current_amount: 42000, target_date: '2027-12-31', color: 'blue', status: 'active', created_at: '2025-01-01' },
    { id: '3', name: 'Vacation Fund', target_amount: 5000, current_amount: 2800, target_date: '2026-08-01', color: 'purple', status: 'active', created_at: '2025-01-01' },
    { id: '4', name: 'New Car', target_amount: 35000, current_amount: 8500, target_date: '2027-06-30', color: 'amber', status: 'active', created_at: '2025-02-01' },
];

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
        color: 'emerald',
    });

    useEffect(() => {
        async function fetchGoals() {
            const supabase = createClient();
            const { data } = await supabase
                .from('goals')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (data) setGoals(data);
            setLoading(false);
        }
        fetchGoals();
    }, []);

    const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

    const handleAddGoal = async () => {
        const newGoal: Goal = {
            id: Date.now().toString(),
            name: formData.name,
            target_amount: parseFloat(formData.target_amount) || 0,
            current_amount: parseFloat(formData.current_amount) || 0,
            target_date: formData.target_date || null,
            color: formData.color,
            status: 'active',
            created_at: new Date().toISOString(),
        };

        setGoals([...goals, newGoal]);
        setShowAddModal(false);
        setFormData({ name: '', target_amount: '', current_amount: '', target_date: '', color: 'emerald' });

        // Save to database
        const supabase = createClient();
        await supabase.from('goals').insert(newGoal);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Financial Goals</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your progress toward financial milestones</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add Goal
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Target className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Active Goals</p>
                            <p className="text-xl font-semibold">{goals.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Target</p>
                            <p className="text-xl font-semibold">${totalTargetAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <PiggyBank className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Current Savings</p>
                            <p className="text-xl font-semibold">${totalCurrentAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Overall Progress</p>
                            <p className="text-xl font-semibold">{overallProgress.toFixed(0)}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Goals Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal, index) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    const remaining = goal.target_amount - goal.current_amount;
                    const colorHex = colorOptions.find(c => c.name === goal.color)?.hex || '#10b981';

                    // Calculate days remaining
                    let daysRemaining = null;
                    if (goal.target_date) {
                        const targetDate = new Date(goal.target_date);
                        const today = new Date();
                        daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    }

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-5 hover:border-white/10 transition-colors cursor-pointer group">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-10 rounded-full"
                                            style={{ backgroundColor: colorHex }}
                                        />
                                        <div>
                                            <h3 className="font-medium">{goal.name}</h3>
                                            {goal.target_date && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    {daysRemaining && daysRemaining > 0 && (
                                                        <span className="text-slate-600">({daysRemaining} days)</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEditingGoal(goal)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
                                    >
                                        <Edit3 className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-mono">${goal.current_amount.toLocaleString()}</span>
                                        <span className="text-slate-500">${goal.target_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(progress, 100)}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: colorHex }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="text-slate-500">{progress.toFixed(0)}% complete</span>
                                        <span style={{ color: colorHex }}>${remaining.toLocaleString()} to go</span>
                                    </div>
                                </div>

                                {/* Quick contribution suggestion */}
                                {daysRemaining && daysRemaining > 0 && (
                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                        <p className="text-xs text-slate-500">
                                            Save <span className="text-white font-medium">${(remaining / (daysRemaining / 30)).toFixed(0)}/month</span> to reach goal on time
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}

                {/* Add Goal Card */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: goals.length * 0.05 }}
                    onClick={() => setShowAddModal(true)}
                    className="p-5 rounded-2xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.01] transition-all flex flex-col items-center justify-center min-h-[200px]"
                >
                    <PlusCircle className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-sm text-slate-500">Add New Goal</span>
                </motion.button>
            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <Card className="relative z-10 w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Goal Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Emergency Fund"
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 block mb-1.5">Target Amount</label>
                                    <input
                                        type="number"
                                        value={formData.target_amount}
                                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                        placeholder="10000"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 block mb-1.5">Current Amount</label>
                                    <input
                                        type="number"
                                        value={formData.current_amount}
                                        onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Target Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.target_date}
                                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1.5">Color</label>
                                <div className="flex gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setFormData({ ...formData, color: color.name })}
                                            className={`w-8 h-8 rounded-full ${color.class} ${formData.color === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddGoal} className="flex-1">
                                    Add Goal
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
