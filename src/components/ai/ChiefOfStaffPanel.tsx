'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Send,
    Calendar,
    FileText,
    Mail,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronUp,
    ChevronDown,
    Clock,
    Brain,
    Zap
} from 'lucide-react';
import {
    ChiefOfStaff,
    getChiefOfStaff,
    type ConversationMessage,
    type PendingAction,
    type ChiefOfStaffState
} from '@/lib/ai/chief-of-staff';

// Quick action suggestions
const QUICK_ACTIONS = [
    { icon: Calendar, label: 'Schedule meeting', prompt: 'Help me schedule a meeting for tomorrow' },
    { icon: FileText, label: 'Quick note', prompt: 'I want to capture a quick thought' },
    { icon: Mail, label: 'Draft email', prompt: 'Help me draft an email' },
    { icon: TrendingUp, label: 'Analyze spending', prompt: 'Analyze my spending this month' },
];

export function ChiefOfStaffPanel() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [state, setState] = useState<ChiefOfStaffState | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chiefRef = useRef<ChiefOfStaff | null>(null);

    // Initialize Chief of Staff
    useEffect(() => {
        chiefRef.current = getChiefOfStaff({
            primaryProvider: 'claude',
            fallbackProvider: 'gemini',
            enableAutonomousActions: true,
            requireApprovalForHighRisk: true,
        });

        setState(chiefRef.current.getState());

        const unsubscribe = chiefRef.current.subscribe((newState) => {
            setState(newState);
        });
        setIsSubscribed(true);

        return () => {
            unsubscribe();
        };
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current && isExpanded) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [state?.conversationHistory, isExpanded]);

    // Handle send message
    const handleSend = useCallback(async () => {
        if (!input.trim() || !chiefRef.current || state?.isProcessing) return;

        const message = input.trim();
        setInput('');

        await chiefRef.current.chat(message);
    }, [input, state?.isProcessing]);

    // Handle quick action
    const handleQuickAction = useCallback((prompt: string) => {
        setInput(prompt);
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // Handle action approval
    const handleApproveAction = useCallback(async (actionId: string) => {
        if (!chiefRef.current) return;
        await chiefRef.current.approveAction(actionId);
    }, []);

    // Handle action rejection
    const handleRejectAction = useCallback((actionId: string) => {
        if (!chiefRef.current) return;
        chiefRef.current.rejectAction(actionId);
    }, []);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    if (!isSubscribed) return null;

    const pendingActions = state?.pendingActions.filter(a => a.status === 'pending') || [];

    return (
        <>
            {/* Floating Button (collapsed state) */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsExpanded(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full 
                       bg-gradient-to-br from-[#34d399] to-[#5fb891]
                       shadow-lg shadow-[#34d399]/20 hover:shadow-xl hover:shadow-[#34d399]/30
                       flex items-center justify-center
                       transition-all duration-300 hover:scale-105"
                    >
                        <Sparkles className="w-7 h-7 text-[#08080c]" />

                        {/* Notification badge */}
                        {pendingActions.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                             flex items-center justify-center text-xs font-bold text-white">
                                {pendingActions.length}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] 
                       bg-[#0c0c12] border border-white/10 
                       rounded-2xl shadow-2xl shadow-black/50
                       flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 
                          border-b border-white/5 bg-[#08080c]/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34d399] to-[#818cf8]
                              flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-[#08080c]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Chief of Staff</h3>
                                    <p className="text-[#8e8e93] text-xs flex items-center gap-1">
                                        {state?.isProcessing ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Thinking...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-3 h-3" />
                                                Ready to help
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <ChevronDown className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        {/* Pending Actions */}
                        {pendingActions.length > 0 && (
                            <div className="px-4 py-3 border-b border-white/5 bg-amber-500/5">
                                <p className="text-xs font-medium text-amber-400 mb-2">
                                    Pending Actions ({pendingActions.length})
                                </p>
                                <div className="space-y-2">
                                    {pendingActions.slice(0, 2).map((action) => (
                                        <PendingActionCard
                                            key={action.id}
                                            action={action}
                                            onApprove={() => handleApproveAction(action.id)}
                                            onReject={() => handleRejectAction(action.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {state?.conversationHistory.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl 
                                bg-gradient-to-br from-[#34d399]/20 to-[#818cf8]/20
                                flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-[#34d399]" />
                                    </div>
                                    <h4 className="text-white font-medium mb-2">How can I help you today?</h4>
                                    <p className="text-[#8e8e93] text-sm">
                                        I can help with scheduling, notes, finances, and more.
                                    </p>
                                </div>
                            )}

                            {state?.conversationHistory.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {state?.isProcessing && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34d399] to-[#818cf8]
                                flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-4 h-4 text-[#08080c]" />
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#34d399]" />
                                            <span className="text-[#8e8e93] text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {state?.conversationHistory.length === 0 && (
                            <div className="px-4 py-3 border-t border-white/5">
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {QUICK_ACTIONS.map((action) => (
                                        <button
                                            key={action.label}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            className="flex items-center gap-2 px-3 py-2 
                               bg-white/5 hover:bg-white/10 
                               rounded-full whitespace-nowrap
                               transition-colors text-sm text-[#8e8e93] hover:text-white"
                                        >
                                            <action.icon className="w-4 h-4" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-white/5">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything..."
                                    rows={1}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl 
                           px-4 py-3 text-white text-sm placeholder:text-[#636366]
                           resize-none focus:outline-none focus:border-[#34d399]/50
                           max-h-32 min-h-[48px]"
                                    style={{
                                        height: 'auto',
                                        minHeight: '48px',
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || state?.isProcessing}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34d399] to-[#5fb891]
                           flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:shadow-lg hover:shadow-[#34d399]/20
                           transition-all duration-200"
                                >
                                    <Send className="w-5 h-5 text-[#08080c]" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Message Bubble Component
function MessageBubble({ message }: { message: ConversationMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34d399] to-[#818cf8]
                      flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-[#08080c]" />
                </div>
            )}
            <div
                className={`flex-1 max-w-[85%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-[#34d399] text-[#08080c] rounded-tr-sm'
                        : 'bg-white/5 text-white rounded-tl-sm'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${isUser ? 'text-[#08080c]/60' : 'text-[#636366]'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
    );
}

// Pending Action Card Component
function PendingActionCard({
    action,
    onApprove,
    onReject,
}: {
    action: PendingAction;
    onApprove: () => void;
    onReject: () => void;
}) {
    const IconMap = {
        calendar: Calendar,
        email: Mail,
        transaction: TrendingUp,
        reminder: Clock,
        note: FileText,
    };
    const Icon = IconMap[action.type] || Sparkles;

    return (
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{action.description}</p>
                <p className="text-xs text-[#636366]">{action.type}</p>
            </div>
            <div className="flex gap-1">
                <button
                    onClick={onApprove}
                    className="p-1.5 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                </button>
                <button
                    onClick={onReject}
                    className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                    <XCircle className="w-4 h-4 text-red-400" />
                </button>
            </div>
        </div>
    );
}

export default ChiefOfStaffPanel;
