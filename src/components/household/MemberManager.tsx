'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Mail,
    Copy,
    Check,
    X,
    Crown,
    Shield,
    User,
    Eye,
    MoreVertical,
    Trash2
} from 'lucide-react';
import { useHousehold, HouseholdMember } from './HouseholdProvider';
import { cn } from '@/lib/utils';

const roleIcons: Record<HouseholdMember['role'], typeof User> = {
    owner: Crown,
    admin: Shield,
    member: User,
    viewer: Eye,
};

const roleColors: Record<HouseholdMember['role'], string> = {
    owner: 'text-amber-400',
    admin: 'text-purple-400',
    member: 'text-blue-400',
    viewer: 'text-zinc-400',
};

interface MemberManagerProps {
    onClose?: () => void;
}

export function MemberManager({ onClose }: MemberManagerProps) {
    const {
        currentHousehold,
        members,
        currentMember,
        inviteMember
    } = useHousehold();

    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<HouseholdMember['role']>('member');
    const [copied, setCopied] = useState(false);
    const [inviting, setInviting] = useState(false);

    const canManageMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin';

    const handleCopyInviteCode = async () => {
        if (!currentHousehold?.invite_code) return;
        await navigator.clipboard.writeText(currentHousehold.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            await inviteMember(inviteEmail, inviteRole);
            setInviteEmail('');
            setShowInvite(false);
        } catch (error) {
            console.error('Failed to invite:', error);
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800">
                        <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-zinc-100">Household Members</h2>
                        <p className="text-sm text-zinc-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                )}
            </div>

            {/* Invite Code */}
            {currentHousehold?.invite_code && canManageMembers && (
                <div className="p-4 bg-zinc-800/30 border-b border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">Share Invite Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-zinc-800 rounded-lg font-mono text-sm text-zinc-300">
                            {currentHousehold.invite_code}
                        </code>
                        <button
                            onClick={handleCopyInviteCode}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                            )}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Member List */}
            <div className="divide-y divide-zinc-800">
                {members.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    const isCurrentUser = member.user_id === currentMember?.user_id;

                    return (
                        <div key={member.id} className="flex items-center gap-3 p-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium">
                                {(member.profile?.full_name || member.nickname || 'U')[0].toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-zinc-200 truncate">
                                        {member.profile?.full_name || member.nickname || 'Member'}
                                    </p>
                                    {isCurrentUser && (
                                        <span className="px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">
                                            You
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 truncate">
                                    {member.profile?.email}
                                </p>
                            </div>

                            {/* Role Badge */}
                            <div className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50',
                                roleColors[member.role]
                            )}>
                                <RoleIcon className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium capitalize">{member.role}</span>
                            </div>

                            {/* Actions */}
                            {canManageMembers && !isCurrentUser && member.role !== 'owner' && (
                                <button className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Invite Section */}
            {canManageMembers && (
                <div className="p-4 border-t border-zinc-800">
                    <AnimatePresence mode="wait">
                        {showInvite ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Email Address</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="spouse@email.com"
                                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as HouseholdMember['role'])}
                                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                                    >
                                        <option value="member">Member - Can claim and complete tasks</option>
                                        <option value="admin">Admin - Can manage members and settings</option>
                                        <option value="viewer">Viewer - View only access</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleInvite}
                                        disabled={inviting || !inviteEmail.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {inviting ? 'Sending...' : 'Send Invite'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setShowInvite(false)}
                                        className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowInvite(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="text-sm font-medium">Invite Member</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default MemberManager;
