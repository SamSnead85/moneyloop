'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone,
    Bell,
    Calendar,
    Users,
    Pin,
    Plus,
    Edit2,
    Trash2,
    Eye,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Info,
    Star,
    Send,
    X,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Types
interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    createdAt: string;
    publishedAt?: string;
    expiresAt?: string;
    status: 'draft' | 'published' | 'scheduled' | 'expired';
    priority: 'normal' | 'important' | 'urgent';
    audience: 'all' | 'department' | 'role';
    departmentFilter?: string;
    pinned: boolean;
    views: number;
    acknowledgments: number;
    requiresAck: boolean;
}

// Mock data
const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Open Enrollment Period Starting February 1st',
        content: 'Our annual benefits open enrollment period begins February 1st and runs through February 28th. During this time, you can make changes to your health, dental, vision, and 401(k) elections. Please review your current elections and make any necessary changes by the deadline.',
        author: 'John Smith',
        authorAvatar: 'JS',
        createdAt: '2026-01-24',
        publishedAt: '2026-01-24',
        status: 'published',
        priority: 'urgent',
        audience: 'all',
        pinned: true,
        views: 18,
        acknowledgments: 12,
        requiresAck: true,
    },
    {
        id: '2',
        title: 'Q1 2026 Company All-Hands Meeting',
        content: 'Join us for our quarterly all-hands meeting on February 15th at 2:00 PM PST. We will be discussing company performance, new initiatives, and Q2 goals.',
        author: 'John Smith',
        authorAvatar: 'JS',
        createdAt: '2026-01-22',
        publishedAt: '2026-01-22',
        status: 'published',
        priority: 'important',
        audience: 'all',
        pinned: false,
        views: 22,
        acknowledgments: 0,
        requiresAck: false,
    },
    {
        id: '3',
        title: 'New Expense Policy Effective February 1st',
        content: 'Please review the updated expense policy in the Documents section. Key changes include new meal limits and a simplified approval process for travel under $500.',
        author: 'Emily Rodriguez',
        authorAvatar: 'ER',
        createdAt: '2026-01-20',
        publishedAt: '2026-01-20',
        status: 'published',
        priority: 'normal',
        audience: 'all',
        pinned: false,
        views: 15,
        acknowledgments: 8,
        requiresAck: true,
    },
    {
        id: '4',
        title: 'Engineering Team: Sprint Planning for Q1',
        content: 'Engineering team members, please complete your sprint planning surveys by EOD Friday.',
        author: 'Sarah Chen',
        authorAvatar: 'SC',
        createdAt: '2026-01-18',
        publishedAt: '2026-01-18',
        status: 'published',
        priority: 'normal',
        audience: 'department',
        departmentFilter: 'Engineering',
        pinned: false,
        views: 8,
        acknowledgments: 0,
        requiresAck: false,
    },
    {
        id: '5',
        title: 'Office Closure - Maintenance',
        content: 'The San Francisco office will be closed on January 31st for scheduled maintenance. Remote work is expected for all SF-based employees.',
        author: 'John Smith',
        authorAvatar: 'JS',
        createdAt: '2026-01-15',
        publishedAt: '2026-01-20',
        status: 'scheduled',
        priority: 'important',
        audience: 'all',
        pinned: false,
        views: 0,
        acknowledgments: 0,
        requiresAck: false,
    },
];

// Priority config
const priorityConfig = {
    normal: { label: 'Normal', color: 'bg-white/10 text-white/40', icon: Info },
    important: { label: 'Important', color: 'bg-amber-400/10 text-amber-400', icon: AlertCircle },
    urgent: { label: 'Urgent', color: 'bg-rose-400/10 text-rose-400', icon: AlertCircle },
};

// Status config
const statusConfig = {
    draft: { label: 'Draft', color: 'bg-white/10 text-white/40' },
    published: { label: 'Published', color: 'bg-[#34d399]/10 text-[#34d399]' },
    scheduled: { label: 'Scheduled', color: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' },
    expired: { label: 'Expired', color: 'bg-white/10 text-white/40' },
};

// Announcement Card
function AnnouncementCard({ announcement, onView }: { announcement: Announcement; onView: () => void }) {
    const priConfig = priorityConfig[announcement.priority];
    const PriorityIcon = priConfig.icon;
    const statConfig = statusConfig[announcement.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${announcement.pinned
                    ? 'bg-gradient-to-br from-amber-400/5 to-transparent border-amber-400/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
            onClick={onView}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    {announcement.pinned && (
                        <Pin className="w-4 h-4 text-amber-400 mt-1" />
                    )}
                    <div>
                        <h3 className="font-medium text-white line-clamp-1">{announcement.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/40">{announcement.author}</span>
                            <span className="text-xs text-white/20">·</span>
                            <span className="text-xs text-white/40">{announcement.publishedAt || announcement.createdAt}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${priConfig.color}`}>
                        <PriorityIcon className="w-3 h-3" />
                        {priConfig.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statConfig.color}`}>
                        {statConfig.label}
                    </span>
                </div>
            </div>

            <p className="text-sm text-white/50 line-clamp-2 mb-4">{announcement.content}</p>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-white/30">
                    <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {announcement.views}
                    </span>
                    {announcement.requiresAck && (
                        <span className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {announcement.acknowledgments}
                        </span>
                    )}
                    {announcement.audience !== 'all' && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {announcement.departmentFilter || announcement.audience}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="text-[#0ea5e9] p-0">
                    Read more <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}

// Create/Edit Modal would go here (simplified)
function CreateAnnouncementModal({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0a0a10] border border-white/[0.08] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">New Announcement</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05]">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Title</label>
                        <input
                            type="text"
                            placeholder="Announcement title"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Content</label>
                        <textarea
                            placeholder="Write your announcement..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/50 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Priority</label>
                            <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                <option value="normal">Normal</option>
                                <option value="important">Important</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Audience</label>
                            <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0ea5e9]/50">
                                <option value="all">All Employees</option>
                                <option value="department">Specific Department</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-white/60">
                            <input type="checkbox" className="rounded" />
                            Pin to top
                        </label>
                        <label className="flex items-center gap-2 text-sm text-white/60">
                            <input type="checkbox" className="rounded" />
                            Require acknowledgment
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" className="flex-1 border-white/10" onClick={onClose}>
                        Save Draft
                    </Button>
                    <Button className="flex-1 bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
                        <Send className="w-4 h-4" />
                        Publish Now
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Main Component
export default function AnnouncementsPage() {
    const [announcements] = useState(mockAnnouncements);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');

    const publishedAnnouncements = announcements.filter(a => a.status === 'published');
    const pinnedAnnouncements = publishedAnnouncements.filter(a => a.pinned);
    const regularAnnouncements = publishedAnnouncements.filter(a => !a.pinned);

    const filteredAnnouncements = filter === 'all'
        ? announcements
        : announcements.filter(a => a.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Announcements</h1>
                    <p className="text-white/50">Communicate updates to your team</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                >
                    <Plus className="w-4 h-4" />
                    New Announcement
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-[#34d399]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{publishedAnnouncements.length}</p>
                            <p className="text-xs text-white/40">Published</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <Pin className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{pinnedAnnouncements.length}</p>
                            <p className="text-xs text-white/40">Pinned</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{announcements.filter(a => a.status === 'scheduled').length}</p>
                            <p className="text-xs text-white/40">Scheduled</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white/[0.02] border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-white">{announcements.reduce((sum, a) => sum + a.views, 0)}</p>
                            <p className="text-xs text-white/40">Total Views</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl w-fit">
                {['all', 'published', 'scheduled', 'draft'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {/* Pinned */}
                {filter === 'all' && pinnedAnnouncements.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-white/40 mb-3 flex items-center gap-2">
                            <Pin className="w-4 h-4" /> Pinned
                        </h2>
                        <div className="space-y-3">
                            {pinnedAnnouncements.map((a) => (
                                <AnnouncementCard
                                    key={a.id}
                                    announcement={a}
                                    onView={() => setSelectedAnnouncement(a)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular */}
                <div>
                    {filter === 'all' && pinnedAnnouncements.length > 0 && (
                        <h2 className="text-sm font-medium text-white/40 mb-3">Recent</h2>
                    )}
                    <div className="space-y-3">
                        {(filter === 'all' ? regularAnnouncements : filteredAnnouncements).map((a) => (
                            <AnnouncementCard
                                key={a.id}
                                announcement={a}
                                onView={() => setSelectedAnnouncement(a)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {filteredAnnouncements.length === 0 && (
                <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No announcements found</p>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateAnnouncementModal onClose={() => setShowCreateModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
