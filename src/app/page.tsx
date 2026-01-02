'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Wallet,
  PiggyBank,
  Home,
  Gem,
  Coins,
  BarChart3,
  Receipt,
  Clock,
  Users,
  Star,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Animated counter for stats
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue}{suffix}</span>;
}

// Premium floating diamond/gold animation
function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />

      {/* Animated golden orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(185, 156, 107, 0.06) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -70, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0
              ? 'rgba(212, 175, 55, 0.4)'
              : i % 3 === 1
                ? 'rgba(192, 192, 192, 0.3)'
                : 'rgba(255, 255, 255, 0.2)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Navigation
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Gem className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-semibold tracking-tight">MoneyLoop</span>
              <span className="hidden sm:block text-[10px] text-amber-500/70 uppercase tracking-widest font-medium">Wealth Intelligence</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-medium">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <button
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="lg:hidden border-t border-white/5 bg-[#0a0a0f] p-6 space-y-4"
        >
          <a href="#features" className="block py-2 text-slate-300">Features</a>
          <a href="#how-it-works" className="block py-2 text-slate-300">How It Works</a>
          <a href="#pricing" className="block py-2 text-slate-300">Pricing</a>
          <Link href="/about" className="block py-2 text-slate-300">About</Link>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Button variant="secondary" className="w-full">Sign In</Button>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black">Get Started Free</Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Hero Section - Clean and Premium
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6">
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-medium"
              >
                {String.fromCharCode(74 + i)}S
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm text-slate-400">Trusted by 10,000+ users</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
        >
          Your complete
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            wealth picture.
          </span>
          <br />
          One place.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Track every asset—cash, stocks, crypto, real estate, precious metals.
          See all income streams. Discover hidden savings. Build wealth with clarity.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/dashboard">
            <Button size="lg" className="text-base px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold shadow-xl shadow-amber-500/20">
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Asset types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Wallet, text: 'Bank Accounts' },
            { icon: TrendingUp, text: 'Stocks & ETFs' },
            { icon: Coins, text: 'Gold & Silver' },
            { icon: Home, text: 'Real Estate' },
            { icon: Receipt, text: 'Income Streams' },
            { icon: CreditCard, text: 'Credit Cards' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400"
            >
              <item.icon className="w-4 h-4 text-amber-400/70" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Stats
function StatsSection() {
  return (
    <section className="py-20 px-6 border-y border-white/5 bg-black/20">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: 2400000000, prefix: '$', suffix: '+', label: 'Assets Tracked' },
            { value: 10000, suffix: '+', label: 'Active Users' },
            { value: 347, prefix: '$', suffix: '', label: 'Avg. Monthly Savings Found' },
            { value: 99.9, suffix: '%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent mb-2 font-mono">
                {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// What you can track
const trackingCategories = [
  {
    icon: Wallet,
    title: 'Bank Accounts',
    description: 'Checking, savings, money market—see all balances and transactions in real-time.',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Investments',
    description: 'Stocks, ETFs, mutual funds, retirement accounts. Full portfolio analytics.',
    color: 'emerald',
  },
  {
    icon: Coins,
    title: 'Precious Metals',
    description: 'Gold, silver, platinum holdings with live spot price integration.',
    color: 'yellow',
  },
  {
    icon: Home,
    title: 'Real Estate',
    description: 'Property values, rental income, mortgage tracking, and equity growth.',
    color: 'blue',
  },
  {
    icon: Receipt,
    title: 'Income Streams',
    description: 'Salary, freelance, dividends, rental income, Stripe payments—all unified.',
    color: 'purple',
  },
  {
    icon: CreditCard,
    title: 'Debts & Credit',
    description: 'Credit cards, loans, mortgages. Track payoff progress and interest costs.',
    color: 'rose',
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Track <span className="text-amber-400">everything</span> you own.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Finally see your complete financial picture. Every asset, every income stream,
            every expense—beautifully organized.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackingCategories.map((cat, index) => {
            const colorMap = {
              amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
              emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
              yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
              blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
              purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
              rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
            };
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full" hover>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${colorMap[cat.color as keyof typeof colorMap]} border mb-5`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{cat.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{cat.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// How it works
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Connect Your Accounts',
      description: 'Securely link banks, brokerages, and property. We never store credentials.',
    },
    {
      step: '02',
      title: 'See Your Full Picture',
      description: 'All assets, income, and expenses in one elegant dashboard. Updated in real-time.',
    },
    {
      step: '03',
      title: 'Discover Hidden Savings',
      description: 'Our intelligence finds unused subscriptions, better rates, and optimization opportunities.',
    },
    {
      step: '04',
      title: 'Grow With Confidence',
      description: 'Make smarter decisions with personalized insights and scenario planning.',
    },
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Simple to start.
            <br />
            <span className="text-slate-500">Powerful once you do.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full" hover>
                <span className="text-5xl font-bold text-amber-500/20 mb-4 block">{step.step}</span>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing
const plans = [
  {
    name: 'Free',
    planId: 'free',
    price: '$0',
    period: 'forever',
    description: 'Perfect to get started',
    features: [
      'Up to 3 connected accounts',
      'Basic net worth tracking',
      'Monthly insights digest',
      'Mobile app access',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Premium',
    planId: 'professional',
    price: '$12',
    period: '/month',
    description: 'For serious wealth builders',
    features: [
      'Unlimited accounts',
      'Real-time sync',
      'Subscription optimizer',
      'Investment analytics',
      'Tax optimization insights',
      'Priority support',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Family',
    planId: 'business',
    price: '$29',
    period: '/month',
    description: 'For households and families',
    features: [
      'Everything in Premium',
      'Up to 5 family members',
      'Shared dashboards',
      'Family goals tracking',
      'Estate planning tools',
      'Dedicated advisor',
    ],
    cta: 'Start Trial',
    popular: false,
  },
];

function PricingSection() {
  const handleCheckout = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard';
      return;
    }
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <section className="py-32 px-6" id="pricing">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Start free. Upgrade when ready.
          </h2>
          <p className="text-xl text-slate-400">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}
            >
              <Card
                className={`h-full flex flex-col relative ${plan.popular
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent'
                    : ''
                  }`}
                padding="lg"
                hover={false}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-semibold">
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
                      <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700' : ''}`}
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
        className="max-w-3xl mx-auto text-center"
      >
        <Gem className="w-16 h-16 text-amber-400 mx-auto mb-8" />
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          See your wealth clearly.
          <br />
          <span className="text-amber-400">Grow it confidently.</span>
        </h2>
        <p className="text-xl text-slate-400 mb-10">
          Join thousands who finally understand their complete financial picture.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="text-lg px-12 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold shadow-xl shadow-amber-500/20">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-sm text-slate-500 mt-6">No credit card required</p>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">MoneyLoop</span>
            </div>
            <p className="text-slate-500 text-sm mb-4 max-w-sm">
              The complete wealth tracking platform for people who want clarity
              and control over their financial future.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" />
                Bank-level security
              </span>
              <span>•</span>
              <span>256-bit encryption</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Blog</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 text-center text-sm text-slate-500">
          © 2026 MoneyLoop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function HomePage() {
  return (
    <>
      <PremiumBackground />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
