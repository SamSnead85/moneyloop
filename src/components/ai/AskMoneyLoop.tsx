'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Sparkles,
    User,
    Loader2,
    TrendingUp,
    PiggyBank,
    CreditCard,
    Receipt,
    Target,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Quick action suggestions
const quickActions = [
    { icon: TrendingUp, label: 'How am I doing this month?', color: 'emerald' },
    { icon: PiggyBank, label: 'How can I save more money?', color: 'blue' },
    { icon: CreditCard, label: 'What are my biggest expenses?', color: 'purple' },
    { icon: Receipt, label: 'Analyze my subscriptions', color: 'amber' },
    { icon: Target, label: "How's my goal progress?", color: 'rose' },
    { icon: HelpCircle, label: 'What can you help me with?', color: 'slate' },
];

export function AskMoneyLoop() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = async (query: string) => {
        if (!query.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: query.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim() }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || data.error || 'I apologize, but I encountered an error processing your request.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error asking MoneyLoop:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(input);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        {/* Welcome State */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Ask MoneyLoop</h2>
                            <p className="text-white/50 max-w-md">
                                I can help you understand your finances, find savings opportunities, and make smarter money decisions.
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSubmit(action.label)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-left group"
                                >
                                    <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                                            : 'bg-white/[0.05] border border-white/10'
                                        }`}>
                                        <p className="text-sm text-white/90 whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        <p className="text-xs text-white/30 mt-2">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-white/70" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Loading indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                        <span className="text-sm text-white/50">Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
                <div className="relative flex items-end gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3 focus-within:border-emerald-500/50 transition-colors">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about your finances..."
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none text-sm max-h-32"
                    />
                    <Button
                        size="sm"
                        onClick={() => handleSubmit(input)}
                        disabled={!input.trim() || isLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-white/30 text-center mt-2">
                    MoneyLoop AI analyzes your financial data to provide personalized insights
                </p>
            </div>
        </div>
    );
}

export default AskMoneyLoop;
