'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Send,
    Lightbulb,
    Target,
    AlertCircle,
    ArrowRight,
    Zap,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

const aiInsights = [
    {
        id: 1,
        type: 'savings',
        icon: DollarSign,
        title: 'Potential Savings Found',
        summary: "You could save $127/month without changing your lifestyle.",
        details: [
            'Switch 2 subscriptions to annual billing (-$47/mo)',
            'Refinance auto insurance (-$35/mo)',
            'Cancel unused gym membership (-$45/mo)',
        ],
        action: 'See Savings Plan',
        priority: 'high',
    },
    {
        id: 2,
        type: 'pattern',
        icon: TrendingUp,
        title: 'Spending Pattern Detected',
        summary: 'Your dining expenses increase 40% on weekends.',
        details: [
            'Weekend dining: $380/month average',
            'Weekday dining: $220/month average',
            "That's $160 more on weekends",
        ],
        action: 'View Pattern',
        priority: 'medium',
    },
    {
        id: 3,
        type: 'forecast',
        icon: Target,
        title: 'Goal Progress Update',
        summary: "You're on track to hit your $10K emergency fund by March.",
        details: [
            'Current balance: $7,400',
            'Monthly contribution: $850',
            'Projected completion: March 15',
        ],
        action: 'Adjust Goal',
        priority: 'low',
    },
    {
        id: 4,
        type: 'alert',
        icon: AlertCircle,
        title: 'Unusual Activity',
        summary: 'Your utilities bill was 28% higher than usual.',
        details: [
            'December: $186 (vs $145 average)',
            'Possible cause: Holiday season usage',
            'Comparison to neighbors: 12% above average',
        ],
        action: 'Investigate',
        priority: 'medium',
    },
];

const chatMessages = [
    {
        role: 'assistant',
        content:
            "Hi! I'm your financial AI assistant. I can help you understand your spending, find savings opportunities, and plan for the future. What would you like to know?",
    },
];

const suggestedQuestions = [
    'Why did my expenses spike last month?',
    'Where can I save without changing my lifestyle?',
    'How am I doing compared to last year?',
    "What's my projected savings by December?",
];

export default function InsightsPage() {
    const [messages, setMessages] = useState(chatMessages);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages([...messages, userMessage]);
        setInputValue('');

        // Call AI insights API
        try {
            const response = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: inputValue }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: "I'd be happy to help with that! I can analyze your spending patterns, identify savings opportunities, or help you plan for future goals. Could you provide more details?"
                }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment."
            }]);
        }
    };

    const handleQuestionClick = (question: string) => {
        setInputValue(question);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                        AI Insights
                    </h1>
                    <p className="text-slate-400">
                        Personalized financial intelligence powered by AI
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Insights Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Insights</h2>
                    {aiInsights.map((insight, index) => (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card
                                className={`${insight.type === 'savings'
                                    ? 'border-emerald-500/30'
                                    : insight.type === 'alert'
                                        ? 'border-amber-500/30'
                                        : 'border-white/10'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`p-3 rounded-xl ${insight.type === 'savings'
                                            ? 'bg-emerald-500/20'
                                            : insight.type === 'alert'
                                                ? 'bg-amber-500/20'
                                                : insight.type === 'pattern'
                                                    ? 'bg-indigo-500/20'
                                                    : 'bg-blue-500/20'
                                            }`}
                                    >
                                        <insight.icon
                                            className={`w-5 h-5 ${insight.type === 'savings'
                                                ? 'text-emerald-400'
                                                : insight.type === 'alert'
                                                    ? 'text-amber-400'
                                                    : insight.type === 'pattern'
                                                        ? 'text-indigo-400'
                                                        : 'text-blue-400'
                                                }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold">{insight.title}</h3>
                                            {insight.priority === 'high' && (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> High Impact
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 mb-3">{insight.summary}</p>
                                        <ul className="space-y-1 mb-4">
                                            {insight.details.map((detail, i) => (
                                                <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                                                    <span className="text-slate-600">•</span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                                            {insight.action}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Chat Interface */}
                <div className="flex flex-col h-[600px]">
                    <Card padding="none" hover={false} className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/20">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Financial Assistant</h3>
                                <p className="text-xs text-slate-500">Ask me anything about your money</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-indigo-500 text-white rounded-br-sm'
                                            : 'bg-white/5 border border-white/10 rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Suggested Questions */}
                        {messages.length === 1 && (
                            <div className="p-4 border-t border-white/5">
                                <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-3 h-3" />
                                    Suggested questions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedQuestions.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleQuestionClick(q)}
                                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-white/5">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about your finances..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                                <Button onClick={handleSendMessage} icon={<Send className="w-4 h-4" />}>
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
