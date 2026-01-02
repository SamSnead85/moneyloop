'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Users,
    Target,
    Shield,
    Award,
    Sparkles,
    Globe,
    Heart,
    Zap,
    Building2,
    TrendingUp,
} from 'lucide-react';
import { Card, Button, AnimatedBackground } from '@/components/ui';

const values = [
    {
        icon: Target,
        title: 'Clarity First',
        description: 'We believe financial software should illuminate, not complicate. Every feature is designed to make your money easier to understand.',
    },
    {
        icon: Shield,
        title: 'Security Always',
        description: 'Bank-level encryption, read-only connections, and SOC 2 certification. Your financial data is sacred—we treat it that way.',
    },
    {
        icon: Heart,
        title: 'Human-Centered',
        description: 'Technology should serve people, not the other way around. Our AI explains, it doesn\'t lecture. Our interface calms, it doesn\'t overwhelm.',
    },
    {
        icon: Zap,
        title: 'Constantly Improving',
        description: 'We ship weekly. We listen daily. Your feedback directly shapes our roadmap. This is your platform.',
    },
];

const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-founder', bio: 'Former Goldman Sachs VP. MIT MBA.' },
    { name: 'Michael Torres', role: 'CTO & Co-founder', bio: 'Ex-Stripe engineering lead. Stanford CS.' },
    { name: 'Emily Park', role: 'Head of Product', bio: 'Former product lead at Plaid. Wharton MBA.' },
    { name: 'David Kim', role: 'Head of AI', bio: 'ML research scientist. PhD Stanford.' },
    { name: 'Jessica Wu', role: 'Head of Design', bio: 'Former Apple design team. RISD.' },
    { name: 'Marcus Johnson', role: 'Head of Security', bio: 'Ex-NSA. 15 years cybersecurity.' },
];

const stats = [
    { value: '$2.4B+', label: 'Assets under management' },
    { value: '10,000+', label: 'Active users' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '4.9★', label: 'App Store rating' },
];

const investors = [
    'Sequoia Capital',
    'Andreessen Horowitz',
    'Y Combinator',
    'Index Ventures',
];

export default function AboutPage() {
    return (
        <>
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
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
                <div className="max-w-5xl mx-auto">
                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                            About MoneyLoop
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
                            We're building the future of
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                personal finance
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            MoneyLoop was founded on a simple belief: understanding your money shouldn't require
                            a finance degree. We're combining beautiful design with powerful AI to make
                            financial clarity accessible to everyone.
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-24"
                    >
                        <Card padding="lg" hover={false} className="bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border-indigo-500/20">
                            <div className="text-center max-w-3xl mx-auto py-8">
                                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
                                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                                <p className="text-xl text-slate-300 leading-relaxed">
                                    To give every person and business the financial intelligence tools that were
                                    once reserved for the wealthy. We believe when people understand their money,
                                    they make better decisions—and better decisions compound into better lives.
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
                    >
                        {stats.map((stat) => (
                            <Card key={stat.label} className="text-center">
                                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </Card>
                        ))}
                    </motion.div>

                    {/* Values */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-24"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                            <p className="text-slate-400">The principles that guide everything we build</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <Card className="h-full">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                                <value.icon className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                                <p className="text-slate-400 leading-relaxed">{value.description}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Team */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-24"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
                            <p className="text-slate-400">World-class talent from the best companies in fintech</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {team.map((member, index) => (
                                <motion.div
                                    key={member.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                >
                                    <Card className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <h3 className="text-lg font-semibold">{member.name}</h3>
                                        <p className="text-sm text-indigo-400 mb-2">{member.role}</p>
                                        <p className="text-sm text-slate-500">{member.bio}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Investors */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-24"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Backed By The Best</h2>
                            <p className="text-slate-400">Investors who believe in our vision</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {investors.map((investor) => (
                                <div
                                    key={investor}
                                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-medium"
                                >
                                    {investor}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card padding="lg" hover={false} className="bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border-indigo-500/20 text-center">
                            <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                We're just getting started. Join thousands of users who are taking control
                                of their financial future with MoneyLoop.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/">
                                    <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                                        Start Free Trial
                                    </Button>
                                </Link>
                                <Link href="/insights">
                                    <Button variant="secondary" size="lg">
                                        Read Our Insights
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
