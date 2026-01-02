'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Zap,
  PieChart,
  TrendingUp,
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Play,
  Menu,
  X,
  BookOpen,
  Users,
  BarChart3,
  Layers,
  Globe,
  Award,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { AnimatedBackground, Button, Card } from '@/components/ui';

// Premium Navigation with mega menu
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      label: 'Platform',
      href: '#platform',
      children: [
        { label: 'Dashboard', description: 'Real-time financial overview', href: '/dashboard', icon: BarChart3 },
        { label: 'AI Insights', description: 'Intelligent spending analysis', href: '/dashboard/insights', icon: Sparkles },
        { label: 'Subscriptions', description: 'Track recurring expenses', href: '/dashboard/subscriptions', icon: CreditCard },
        { label: 'Business', description: 'Cash flow & runway', href: '/dashboard/business', icon: Building2 },
      ],
    },
    {
      label: 'Insights',
      href: '/insights',
      children: [
        { label: 'All Articles', description: 'Latest financial insights', href: '/insights', icon: BookOpen },
        { label: 'Money Management', description: 'Tips & strategies', href: '/insights#money', icon: TrendingUp },
        { label: 'Market Trends', description: 'Economic analysis', href: '/insights#trends', icon: Globe },
      ],
    },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur transition-opacity" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">MoneyLoop</span>
                <span className="hidden sm:block text-[10px] text-slate-500 uppercase tracking-widest">Financial Intelligence</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronRight className={`w-3 h-3 transition-transform ${activeDropdown === item.label ? 'rotate-90' : ''}`} />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl bg-[#12121a]/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                              <child.icon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{child.label}</p>
                              <p className="text-xs text-slate-500">{child.description}</p>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" className="text-sm">
                Sign In
              </Button>
              <Button size="sm" className="text-sm">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#0a0a0f]"
            >
              <div className="p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block py-2 text-slate-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Button variant="secondary" className="w-full">Sign In</Button>
                  <Button className="w-full">Start Free Trial</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

// Premium Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm mb-10"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-medium">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm text-slate-300">
            Trusted by <span className="text-white font-semibold">10,000+</span> users worldwide
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
        >
          The future of
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              financial intelligence
            </span>
            <motion.svg
              className="absolute -bottom-2 left-0 w-full h-3"
              viewBox="0 0 300 12"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.path
                d="M2 10C50 4 100 4 150 7C200 10 250 6 298 3"
                stroke="url(#underline-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </motion.svg>
          </span>
          <br />
          is here.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Connect all your accounts. Understand your money with AI-powered insights.
          Make smarter decisions with the most elegant financial platform ever built.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button size="lg" className="text-base px-8 py-4" icon={<ArrowRight className="w-5 h-5" />}>
            Start Free — No Credit Card
          </Button>
          <Button variant="secondary" size="lg" className="text-base px-8 py-4" icon={<Play className="w-4 h-4" />}>
            Watch 2-min Demo
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {[
            { icon: Shield, text: 'Bank-level encryption' },
            { icon: Zap, text: 'Real-time sync' },
            { icon: Sparkles, text: 'AI-powered insights' },
            { icon: Globe, text: '12,000+ institutions' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400"
            >
              <item.icon className="w-4 h-4 text-indigo-400" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Stats section
function StatsSection() {
  const stats = [
    { value: '$2.4B+', label: 'Assets tracked' },
    { value: '10,000+', label: 'Active users' },
    { value: '12,000+', label: 'Connected institutions' },
    { value: '99.9%', label: 'Uptime SLA' },
  ];

  return (
    <section className="py-20 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features section
const features = [
  {
    icon: BarChart3,
    title: 'Unified Dashboard',
    description: 'See all your accounts, investments, and spending in one beautiful real-time view. No more switching between apps.',
    color: 'indigo',
  },
  {
    icon: Sparkles,
    title: 'AI Financial Advisor',
    description: 'Ask questions in plain English. Get personalized insights about your spending patterns and savings opportunities.',
    color: 'purple',
  },
  {
    icon: CreditCard,
    title: 'Subscription Intelligence',
    description: 'Automatically detect subscriptions, track renewals, and get alerts about price increases or unused services.',
    color: 'pink',
  },
  {
    icon: Building2,
    title: 'Business & Personal',
    description: 'Seamlessly switch between personal and business finances. Track burn rate, runway, and tax-relevant expenses.',
    color: 'emerald',
  },
  {
    icon: TrendingUp,
    title: 'Smart Forecasting',
    description: 'Simulate financial scenarios. See how changes in income, savings, or spending affect your future net worth.',
    color: 'amber',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level 256-bit encryption, SOC 2 certification, and read-only connections. Your data never leaves your control.',
    color: 'blue',
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6" id="platform">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            Platform Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Everything you need.
            <br />
            <span className="text-slate-500">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Built for clarity, not complexity. Every feature designed to help you
            understand and grow your wealth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colorMap = {
              indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
              purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
              pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
              emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
              amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
              blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
            };
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full group" hover>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap]} border mb-5`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Thought Leadership / Insights Section
const articles = [
  {
    title: 'The Psychology of Spending: Why We Overspend and How to Stop',
    excerpt: 'Understanding the behavioral triggers behind impulsive purchases can transform your relationship with money.',
    category: 'Money Mindset',
    readTime: '8 min read',
    image: '/api/placeholder/600/400',
    featured: true,
  },
  {
    title: '2026 Economic Outlook: What Smart Investors Are Watching',
    excerpt: 'Key market indicators and trends that will shape investment opportunities in the coming year.',
    category: 'Market Trends',
    readTime: '6 min read',
    image: '/api/placeholder/600/400',
  },
  {
    title: 'The Subscription Economy: Managing Recurring Expenses',
    excerpt: 'The average household spends $273/month on subscriptions. Here&apos;s how to audit and optimize.',
    category: 'Practical Tips',
    readTime: '5 min read',
    image: '/api/placeholder/600/400',
  },
  {
    title: 'Building an Emergency Fund in a High-Inflation Environment',
    excerpt: 'Traditional savings advice needs updating. Modern strategies for maintaining purchasing power.',
    category: 'Financial Planning',
    readTime: '7 min read',
    image: '/api/placeholder/600/400',
  },
];

function InsightsSection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              Insights & Research
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Financial thought leadership
            </h2>
            <p className="text-xl text-slate-400 max-w-xl">
              Expert perspectives on money management, market trends, and building lasting wealth.
            </p>
          </div>
          <Link
            href="/insights"
            className="mt-6 lg:mt-0 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all articles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/insights/psychology-of-spending">
              <Card className="h-full group overflow-hidden" padding="none" hover>
                <div className="aspect-[16/10] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/api/placeholder/600/400')] bg-cover bg-center opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-indigo-400/50" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                      {articles[0].category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {articles[0].readTime}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-indigo-400 transition-colors">
                    {articles[0].title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{articles[0].excerpt}</p>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Other articles */}
          <div className="space-y-6">
            {articles.slice(1).map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/insights/${article.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="group" hover>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-medium">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing section with enhanced design
const plans = [
  {
    name: 'Personal',
    planId: 'personal',
    price: '$9',
    period: '/month',
    description: 'Perfect for managing your personal finances',
    features: [
      'Unlimited account connections',
      'Real-time dashboard',
      'AI spending insights',
      'Subscription tracking',
      'Monthly forecasting',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    planId: 'professional',
    price: '$29',
    period: '/month',
    description: 'For freelancers and small business owners',
    features: [
      'Everything in Personal',
      'Business & personal views',
      'Tax-relevant categorization',
      'Burn rate & runway tracking',
      'Vendor expense management',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    planId: 'business',
    price: '$79',
    period: '/month',
    description: 'For growing teams and companies',
    features: [
      'Everything in Professional',
      'Multi-user access',
      'Advanced forecasting',
      'Custom integrations',
      'API access',
      'Dedicated success manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

function PricingSection() {
  const handleCheckout = async (planId: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <section className="py-32 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            Pricing
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-400">
            Start free for 14 days. No credit card required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}
            >
              <Card
                className={`h-full flex flex-col relative ${plan.popular
                    ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent'
                    : ''
                  }`}
                padding="lg"
                hover={false}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => handleCheckout(plan.planId)}
                >
                  {plan.cta}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA
function CTASection() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative p-16 rounded-[2rem] bg-gradient-to-br from-indigo-950/80 to-purple-950/50 border border-indigo-500/20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex mb-8"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Start your financial transformation
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of users who finally understand their money.
              Your 14-day free trial starts today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-10" icon={<ArrowRight className="w-5 h-5" />}>
                Get Started Free
              </Button>
              <p className="text-sm text-slate-500">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Security', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Resources: ['Documentation', 'API Reference', 'Community', 'Support'],
    Legal: ['Privacy', 'Terms', 'Cookies', 'GDPR'],
  };

  return (
    <footer className="border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">MoneyLoop</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The most elegant financial platform for people who want to understand
              and grow their wealth.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-500" />
                SOC 2 Type II
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-xs text-slate-500">256-bit encryption</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-sm">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 MoneyLoop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function HomePage() {
  return (
    <>
      <AnimatedBackground />
      <Navigation />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <InsightsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
