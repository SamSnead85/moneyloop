'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Clock,
    Users,
    TrendingUp,
    BookOpen,
    Lightbulb,
    Target,
    DollarSign,
    PiggyBank,
    BarChart3,
    ArrowUpRight,
    Search,
} from 'lucide-react';
import { Card, Button, AnimatedBackground } from '@/components/ui';

const categories = [
    { name: 'All', icon: BookOpen, count: 12 },
    { name: 'Money Mindset', icon: Lightbulb, count: 4 },
    { name: 'Market Trends', icon: TrendingUp, count: 3 },
    { name: 'Practical Tips', icon: Target, count: 3 },
    { name: 'Financial Planning', icon: PiggyBank, count: 2 },
];

const articles = [
    {
        id: 'psychology-of-spending',
        title: 'The Psychology of Spending: Why We Overspend and How to Stop',
        excerpt: 'Understanding the behavioral triggers behind impulsive purchases can transform your relationship with money. Learn the science-backed strategies that actually work.',
        category: 'Money Mindset',
        readTime: '8 min read',
        author: 'Sarah Chen',
        authorRole: 'Behavioral Economist',
        date: 'Dec 28, 2025',
        featured: true,
    },
    {
        id: '2026-economic-outlook',
        title: '2026 Economic Outlook: What Smart Investors Are Watching',
        excerpt: 'Key market indicators and trends that will shape investment opportunities in the coming year. A comprehensive analysis from our research team.',
        category: 'Market Trends',
        readTime: '6 min read',
        author: 'Michael Torres',
        authorRole: 'Chief Market Analyst',
        date: 'Dec 26, 2025',
        featured: true,
    },
    {
        id: 'subscription-economy',
        title: 'The Subscription Economy: Managing Recurring Expenses',
        excerpt: 'The average household spends $273/month on subscriptions. Here&apos;s how to audit and optimize your recurring costs without sacrificing value.',
        category: 'Practical Tips',
        readTime: '5 min read',
        author: 'Emily Park',
        authorRole: 'Personal Finance Editor',
        date: 'Dec 24, 2025',
    },
    {
        id: 'emergency-fund-inflation',
        title: 'Building an Emergency Fund in a High-Inflation Environment',
        excerpt: 'Traditional savings advice needs updating. Modern strategies for maintaining purchasing power while building your financial safety net.',
        category: 'Financial Planning',
        readTime: '7 min read',
        author: 'David Kim',
        authorRole: 'CFP®, Financial Planner',
        date: 'Dec 22, 2025',
    },
    {
        id: '50-30-20-rule-evolved',
        title: 'The 50/30/20 Rule Has Evolved: A Modern Budgeting Framework',
        excerpt: 'Why the classic budgeting rule needs an update for 2026, and how to create a flexible spending plan that actually works.',
        category: 'Practical Tips',
        readTime: '6 min read',
        author: 'Sarah Chen',
        authorRole: 'Behavioral Economist',
        date: 'Dec 20, 2025',
    },
    {
        id: 'ai-personal-finance',
        title: 'How AI is Revolutionizing Personal Finance',
        excerpt: 'From automated budgeting to predictive insights, artificial intelligence is changing how we manage money. Here&apos;s what you need to know.',
        category: 'Market Trends',
        readTime: '9 min read',
        author: 'Michael Torres',
        authorRole: 'Chief Market Analyst',
        date: 'Dec 18, 2025',
    },
    {
        id: 'wealth-building-20s',
        title: 'Wealth Building in Your 20s: The Compound Effect',
        excerpt: 'Why starting early matters more than starting big. A practical guide to building wealth when you feel like you have nothing to spare.',
        category: 'Money Mindset',
        readTime: '7 min read',
        author: 'Emily Park',
        authorRole: 'Personal Finance Editor',
        date: 'Dec 16, 2025',
    },
    {
        id: 'side-hustle-taxes',
        title: 'Side Hustle Taxes: What Every Freelancer Needs to Know',
        excerpt: 'Quarterly payments, deductions, and documentation—demystifying tax obligations for the growing gig economy workforce.',
        category: 'Practical Tips',
        readTime: '8 min read',
        author: 'David Kim',
        authorRole: 'CFP®, Financial Planner',
        date: 'Dec 14, 2025',
    },
];

export default function InsightsPage() {
    const featuredArticles = articles.filter(a => a.featured);
    const regularArticles = articles.filter(a => !a.featured);

    return (
        <>
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="MoneyLoop" className="w-10 h-10 rounded-2xl" />
                        <span className="text-xl font-bold">MoneyLoop</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                            Insights & Research
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                            Financial Thought Leadership
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Expert perspectives on money management, market trends, and building lasting wealth
                            from our team of analysts and certified financial planners.
                        </p>
                    </motion.div>

                    {/* Search & Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col lg:flex-row gap-6 mb-16"
                    >
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>

                        {/* Category filters */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat, index) => (
                                <button
                                    key={cat.name}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${index === 0
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.name}
                                    <span className="text-xs opacity-60">({cat.count})</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Featured Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-semibold mb-8">Featured</h2>
                        <div className="grid lg:grid-cols-2 gap-8">
                            {featuredArticles.map((article) => (
                                <Link key={article.id} href={`/insights/${article.id}`}>
                                    <Card className="h-full group" padding="lg" hover>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                                                {article.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {article.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-4 group-hover:text-indigo-400 transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed mb-6">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-medium">
                                                    {article.author.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{article.author}</p>
                                                    <p className="text-xs text-slate-500">{article.authorRole}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-slate-500">{article.date}</span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* All Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-semibold mb-8">All Articles</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regularArticles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                >
                                    <Link href={`/insights/${article.id}`}>
                                        <Card className="h-full group" hover>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-medium">
                                                    {article.category}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {article.readTime}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-medium">
                                                    {article.author.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-slate-500">{article.author}</span>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Newsletter CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-24"
                    >
                        <Card padding="lg" hover={false} className="bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border-indigo-500/20">
                            <div className="text-center max-w-2xl mx-auto">
                                <h3 className="text-2xl font-semibold mb-4">Stay Ahead of the Curve</h3>
                                <p className="text-slate-400 mb-8">
                                    Get weekly insights on money management, market trends, and financial strategies
                                    delivered to your inbox.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                    <Button className="shrink-0">
                                        Subscribe
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-4">
                                    No spam. Unsubscribe anytime.
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
