'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Sparkles,
    User,
    Loader2,
    X,
    Minimize2,
    Maximize2,
    RefreshCw,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    'How am I doing on my budgets this month?',
    'What subscriptions should I cancel?',
    'Where can I save money?',
    'Am I on track for my goals?',
];

export function AIChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'I apologize, but I encountered an error. Please try again.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const clearChat = () => {
        setMessages([]);
    };

    // Floating button when closed
    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => setIsOpen(true)}
            >
                <Sparkles className="w-6 h-6" />
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 ${isMinimized
                    ? 'bottom-6 right-6 w-72'
                    : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'
                }`}
        >
            <Card className="h-full flex flex-col overflow-hidden border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <motion.div
                                className="absolute -inset-1 bg-emerald-400/20 rounded-full blur-sm"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">MoneyLoop AI</h3>
                            <p className="text-[10px] text-slate-500">Your financial assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isMinimized && messages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                                title="Clear chat"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <Sparkles className="w-12 h-12 mx-auto text-emerald-400/50 mb-4" />
                                    <h4 className="font-medium mb-2">Ask me anything about your finances</h4>
                                    <p className="text-xs text-slate-500 mb-6">
                                        I can analyze spending, suggest savings, and help with budgets.
                                    </p>
                                    <div className="space-y-2">
                                        {suggestedQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(q)}
                                                className="block w-full text-left text-sm p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <AnimatePresence>
                                        {messages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`p-2 rounded-full ${msg.role === 'user'
                                                        ? 'bg-emerald-500/20'
                                                        : 'bg-white/[0.04]'
                                                    }`}>
                                                    {msg.role === 'user' ? (
                                                        <User className="w-4 h-4 text-emerald-400" />
                                                    ) : (
                                                        <Sparkles className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                                    <div
                                                        className={`inline-block p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                                ? 'bg-emerald-500/20 text-white'
                                                                : 'bg-white/[0.04] text-slate-300'
                                                            }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 mt-1">
                                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex gap-3"
                                        >
                                            <div className="p-2 rounded-full bg-white/[0.04]">
                                                <Sparkles className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="p-3 rounded-2xl bg-white/[0.04]">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your finances..."
                                    className="flex-1 px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2.5 rounded-xl bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </Card>
        </motion.div>
    );
}
