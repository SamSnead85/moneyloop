'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    Users,
    Calendar,
    Clock,
    Check,
    ChevronRight,
    Plus,
    Target,
    TrendingUp,
    MessageSquare,
    Award,
    BarChart3,
    Edit2,
    Send,
    AlertCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface Review {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    employeeAvatar: string;
    reviewerId: string;
    reviewerName: string;
    type: 'annual' | 'quarterly' | 'probation' | '360' | 'self';
    status: 'draft' | 'in_progress' | 'pending_review' | 'completed';
    dueDate: string;
    completedDate?: string;
    overallRating?: number;
    goals?: Goal[];
}

interface Goal {
    id: string;
    title: string;
    progress: number;
    status: 'on_track' | 'at_risk' | 'completed';
}

interface ReviewCycle {
    id: string;
    name: string;
    type: 'annual' | 'quarterly';
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'completed';
    completionRate: number;
}

// Mock data
const mockReviews: Review[] = [
    {
        id: '1', employeeId: '4', employeeName: 'Jordan Taylor', employeeRole: 'Senior Engineer', employeeAvatar: 'JT', reviewerId: '1', reviewerName: 'Sarah Chen', type: 'annual', status: 'in_progress', dueDate: '2026-02-01', goals: [
            { id: 'g1', title: 'Complete microservices migration', progress: 80, status: 'on_track' },
            { id: 'g2', title: 'Mentor 2 junior developers', progress: 100, status: 'completed' },
            { id: 'g3', title: 'Improve test coverage to 85%', progress: 45, status: 'at_risk' },
        ]
    },
    { id: '2', employeeId: '5', employeeName: 'Casey Morgan', employeeRole: 'Senior Engineer', employeeAvatar: 'CM', reviewerId: '1', reviewerName: 'Sarah Chen', type: 'annual', status: 'pending_review', dueDate: '2026-02-01', overallRating: 4 },
    { id: '3', employeeId: '6', employeeName: 'Alex Rivera', employeeRole: 'Engineer', employeeAvatar: 'AR', reviewerId: '1', reviewerName: 'Sarah Chen', type: 'probation', status: 'draft', dueDate: '2026-02-15' },
    { id: '4', employeeId: '8', employeeName: 'Taylor Kim', employeeRole: 'Senior Designer', employeeAvatar: 'TK', reviewerId: '2', reviewerName: 'Marcus Johnson', type: 'annual', status: 'completed', dueDate: '2026-01-15', completedDate: '2026-01-14', overallRating: 5 },
    { id: '5', employeeId: '9', employeeName: 'Morgan Lee', employeeRole: 'Designer', employeeAvatar: 'ML', reviewerId: '2', reviewerName: 'Marcus Johnson', type: 'quarterly', status: 'completed', dueDate: '2026-01-15', completedDate: '2026-01-13', overallRating: 4 },
];

const mockCycles: ReviewCycle[] = [
    { id: 'c1', name: 'Q1 2026 Performance Review', type: 'quarterly', startDate: '2026-01-15', endDate: '2026-02-15', status: 'active', completionRate: 40 },
    { id: 'c2', name: '2025 Annual Review', type: 'annual', startDate: '2025-12-01', endDate: '2026-01-31', status: 'active', completionRate: 75 },
];

// Review type config
const reviewTypeConfig = {
    annual: { label: 'Annual', color: 'bg-purple-400/10 text-purple-400' },
    quarterly: { label: 'Quarterly', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' },
    probation: { label: 'Probation', color: 'bg-amber-400/10 text-amber-400' },
    '360': { label: '360°', color: 'bg-rose-400/10 text-rose-400' },
    self: { label: 'Self', color: 'bg-[#34d399]/10 text-[#34d399]' },
};

// Status config
const statusConfig = {
    draft: { label: 'Draft', color: 'bg-white/10 text-white/40', icon: Edit2 },
    in_progress: { label: 'In Progress', color: 'bg-amber-400/10 text-amber-400', icon: Clock },
    pending_review: { label: 'Pending Review', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]', icon: MessageSquare },
    completed: { label: 'Completed', color: 'bg-[#34d399]/10 text-[#34d399]', icon: Check },
};

// Rating Stars
function RatingStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                />
            ))}
        </div>
    );
}

// Review Card
function ReviewCard({ review }: { review: Review }) {
    const typeConfig = reviewTypeConfig[review.type];
    const stConfig = statusConfig[review.status];
    const StatusIcon = stConfig.icon;

    return (
        <Card className="p-5 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 flex items-center justify-center text-sm font-medium text-white">
                        {review.employeeAvatar}
                    </div>
                    <div>
                        <h3 className="font-medium text-white">{review.employeeName}</h3>
                        <p className="text-xs text-white/40">{review.employeeRole}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${stConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {stConfig.label}
                    </span>
                </div>
            </div>

            {review.overallRating && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-white/40">Overall:</span>
                    <RatingStars rating={review.overallRating} />
                </div>
            )}

            {review.goals && review.goals.length > 0 && (
                <div className="mb-4 space-y-2">
                    {review.goals.slice(0, 2).map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between">
                            <span className="text-xs text-white/50 truncate flex-1">{goal.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${goal.status === 'completed' ? 'bg-[#34d399]/10 text-[#34d399]' :
                                    goal.status === 'at_risk' ? 'bg-rose-400/10 text-rose-400' :
                                        'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                }`}>
                                {goal.progress}%
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/40">
                    <Calendar className="w-4 h-4" />
                    <span>{review.status === 'completed' ? `Completed ${review.completedDate}` : `Due ${review.dueDate}`}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-[#0ea5e9]">
                    {review.status === 'completed' ? 'View' : 'Continue'}
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}

// Cycle Card
function CycleCard({ cycle }: { cycle: ReviewCycle }) {
    return (
        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-medium text-white">{cycle.name}</h3>
                    <p className="text-xs text-white/40">{cycle.startDate} - {cycle.endDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${cycle.status === 'active' ? 'bg-[#34d399]/10 text-[#34d399]' :
                        cycle.status === 'upcoming' ? 'bg-amber-400/10 text-amber-400' :
                            'bg-white/10 text-white/40'
                    }`}>
                    {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                </span>
            </div>

            <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/40">Completion</span>
                <span className="text-white">{cycle.completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cycle.completionRate}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]"
                />
            </div>
        </Card>
    );
}

// Main Component
export default function PerformancePage() {
    const [reviews] = useState(mockReviews);
    const [cycles] = useState(mockCycles);
    const [activeTab, setActiveTab] = useState<'reviews' | 'goals' | 'cycles'>('reviews');

    // Stats
    const pendingReviews = reviews.filter(r => r.status !== 'completed').length;
    const completedReviews = reviews.filter(r => r.status === 'completed').length;
    const avgRating = reviews.filter(r => r.overallRating).reduce((sum, r) => sum + (r.overallRating || 0), 0) /
        reviews.filter(r => r.overallRating).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Performance Reviews</h1>
                    <p className="text-white/50">Manage reviews, goals, and employee development</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-white/10">
                        <Target className="w-4 h-4" />
                        Set Goals
                    </Button>
                    <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Plus className="w-4 h-4" />
                        New Review
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{pendingReviews}</p>
                            <p className="text-xs text-white/40">Pending</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{completedReviews}</p>
                            <p className="text-xs text-white/40">Completed</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <Star className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{avgRating.toFixed(1)}</p>
                            <p className="text-xs text-white/40">Avg. Rating</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{cycles.filter(c => c.status === 'active').length}</p>
                            <p className="text-xs text-white/40">Active Cycles</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl w-fit">
                {[
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'goals', label: 'Goals' },
                    { id: 'cycles', label: 'Cycles' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'reviews' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}

            {activeTab === 'goals' && (
                <div className="space-y-4">
                    <Card className="p-6 bg-white/[0.02] border-white/[0.06]">
                        <h3 className="font-medium text-white mb-4">Goal Progress Overview</h3>
                        <div className="space-y-4">
                            {reviews.filter(r => r.goals).flatMap(r => r.goals!).map((goal) => (
                                <div key={goal.id} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-white mb-1">{goal.title}</p>
                                        <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${goal.progress}%` }}
                                                className={`h-full rounded-full ${goal.status === 'completed' ? 'bg-[#34d399]' :
                                                        goal.status === 'at_risk' ? 'bg-rose-400' :
                                                            'bg-[#0ea5e9]'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-medium ${goal.status === 'completed' ? 'bg-[#34d399]/10 text-[#34d399]' :
                                            goal.status === 'at_risk' ? 'bg-rose-400/10 text-rose-400' :
                                                'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                        }`}>
                                        {goal.progress}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'cycles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cycles.map((cycle) => (
                        <CycleCard key={cycle.id} cycle={cycle} />
                    ))}
                </div>
            )}

            {/* Quick Tips */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-[#0ea5e9]/10 border-purple-500/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white mb-2">Performance Best Practices</h3>
                        <div className="text-sm text-white/50 space-y-1">
                            <p>• Schedule regular 1:1s to discuss progress</p>
                            <p>• Set SMART goals with clear success metrics</p>
                            <p>• Provide continuous feedback, not just during reviews</p>
                            <p>• Recognize achievements publicly when appropriate</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
