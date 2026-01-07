'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    Minimize2,
    Bot,
    User,
    Loader2,
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    'How much did I spend last month?',
    'Where can I save money?',
    'What\'s my tax situation?',
    'Am I on track for retirement?',
];

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hi! I\'m your AI financial assistant. I can help you understand your spending, find savings opportunities, optimize taxes, and plan for your goals. What would you like to know?',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMessage.content }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || 'I apologize, but I encountered an issue. Please try again.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I\'m having trouble connecting right now. Please try again in a moment.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuestionClick = (question: string) => {
        setInputValue(question);
        handleSendMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white hover:shadow-emerald-500/40 transition-shadow"
                    >
                        <Sparkles className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : 500,
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-[#0c0c12] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">MoneyLoop AI</h3>
                                    <p className="text-xs text-emerald-400">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4 text-slate-400" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${message.role === 'assistant'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                                    : 'bg-white/[0.08]'
                                                }`}>
                                                {message.role === 'assistant' ? (
                                                    <Bot className="w-4 h-4 text-white" />
                                                ) : (
                                                    <User className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                                <div className={`px-4 py-3 rounded-2xl text-sm ${message.role === 'user'
                                                        ? 'bg-emerald-500/20 text-white rounded-br-md'
                                                        : 'bg-white/[0.04] text-slate-200 rounded-bl-md'
                                                    }`}>
                                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-white/[0.04] px-4 py-3 rounded-2xl rounded-bl-md">
                                                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Suggested Questions */}
                                {messages.length <= 2 && (
                                    <div className="px-4 pb-3">
                                        <p className="text-xs text-slate-500 mb-2">Try asking:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedQuestions.map((question, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setInputValue(question);
                                                        setTimeout(() => {
                                                            const userMessage: Message = {
                                                                id: Date.now().toString(),
                                                                role: 'user',
                                                                content: question,
                                                                timestamp: new Date(),
                                                            };
                                                            setMessages((prev) => [...prev, userMessage]);
                                                            setInputValue('');
                                                            setIsLoading(true);
                                                            fetch('/api/ai-insights', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ question }),
                                                            })
                                                                .then(res => res.json())
                                                                .then(data => {
                                                                    setMessages(prev => [...prev, {
                                                                        id: (Date.now() + 1).toString(),
                                                                        role: 'assistant',
                                                                        content: data.response,
                                                                        timestamp: new Date(),
                                                                    }]);
                                                                })
                                                                .finally(() => setIsLoading(false));
                                                        }, 0);
                                                    }}
                                                    className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input */}
                                <div className="p-4 border-t border-white/[0.06]">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask me anything..."
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!inputValue.trim() || isLoading}
                                            className="p-2.5 rounded-xl bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
