'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Wallet,
  Home,
  Coins,
  BarChart3,
  Receipt,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

// Animated counter
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

// Premium Dynamic Background - Similar to ScaledNative
function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#050508]" />

      {/* Large animated gradient orbs */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px]"
        style={{
          background: 'radial-gradient(circle, rgba(30, 30, 50, 0.4) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 120, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/2 -right-1/4 w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px]"
        style={{
          background: 'radial-gradient(circle, rgba(40, 35, 55, 0.35) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 100, -60, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-1/4 left-1/3 w-[60vw] h-[60vw] max-w-[900px] max-h-[900px]"
        style={{
          background: 'radial-gradient(circle, rgba(25, 30, 45, 0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -40, 80, 0],
          scale: [1, 1.05, 0.92, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px rounded-full bg-white/20"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
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
    </div>
  );
}

// Navigation
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/60 backdrop-blur-2xl border-b border-white/[0.03]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">M</span>
            </div>
            <span className="text-lg font-medium tracking-tight">MoneyLoop</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/40 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/40 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm text-white/50 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-sm bg-white text-black hover:bg-white/90 font-medium">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg bg-white/5"
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
          className="lg:hidden border-t border-white/5 bg-[#050508] p-6 space-y-4"
        >
          <a href="#features" className="block py-2 text-white/60">Features</a>
          <a href="#how-it-works" className="block py-2 text-white/60">How It Works</a>
          <a href="#pricing" className="block py-2 text-white/60">Pricing</a>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Button variant="secondary" className="w-full">Sign In</Button>
            <Button className="w-full bg-white text-black">Get Started</Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 pb-20 px-6">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl lg:text-[5.5rem] font-medium tracking-[-0.02em] mb-8 leading-[1.05]"
        >
          Your complete
          <br />
          <span className="text-white/40">wealth picture.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="text-lg text-white/40 max-w-xl mx-auto mb-14 leading-relaxed"
        >
          Track every asset. See all income streams.
          Discover hidden savings. Build wealth with clarity.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/dashboard">
            <Button size="lg" className="text-base px-10 py-5 bg-white text-black hover:bg-white/90 font-medium shadow-2xl shadow-white/10">
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Asset types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-white/30 text-sm"
        >
          {[
            { icon: Wallet, text: 'Bank Accounts' },
            { icon: TrendingUp, text: 'Investments' },
            { icon: Coins, text: 'Gold & Silver' },
            { icon: Home, text: 'Real Estate' },
            { icon: Receipt, text: 'Income' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 opacity-60" />
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
    <section className="py-24 px-6 border-y border-white/[0.03]">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { value: 2400000000, prefix: '$', suffix: '+', label: 'Assets Tracked' },
            { value: 10000, suffix: '+', label: 'Users' },
            { value: 347, prefix: '$', label: 'Avg. Savings Found' },
            { value: 99.9, suffix: '%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <p className="text-3xl lg:text-4xl font-medium text-white mb-2 font-mono">
                {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-white/30">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features
const features = [
  {
    icon: Wallet,
    title: 'All Your Accounts',
    description: 'Connect checking, savings, credit cards, and investment accounts in one place.',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Stocks, ETFs, mutual funds, and retirement accounts with full portfolio analytics.',
  },
  {
    icon: Coins,
    title: 'Alternative Assets',
    description: 'Track gold, silver, and other precious metals with live pricing.',
  },
  {
    icon: Home,
    title: 'Real Estate',
    description: 'Property values, rental income, mortgage tracking, and equity growth.',
  },
  {
    icon: Receipt,
    title: 'All Income Streams',
    description: 'Salary, freelance, dividends, rental income, and business revenue unified.',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: '256-bit encryption, read-only access, and SOC 2 Type II certification.',
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 px-6" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl lg:text-5xl font-medium mb-5 tracking-tight">
            Everything you need
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            A complete view of your financial life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="group p-7 rounded-2xl border border-white/[0.03] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-300">
                <feature.icon className="w-6 h-6 text-white/40 mb-5" />
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works
function HowItWorksSection() {
  const steps = [
    { step: '1', title: 'Connect', description: 'Link your accounts securely.' },
    { step: '2', title: 'See', description: 'View your complete wealth picture.' },
    { step: '3', title: 'Discover', description: 'Find savings opportunities.' },
    { step: '4', title: 'Grow', description: 'Make smarter decisions.' },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="how-it-works">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl lg:text-5xl font-medium tracking-tight">
            How it works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-light text-white/10 mb-4">{step.step}</div>
              <h3 className="text-lg font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-white/40">{step.description}</p>
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
    period: '',
    features: ['3 connected accounts', 'Basic net worth tracking', 'Monthly insights'],
    cta: 'Start Free',
  },
  {
    name: 'Premium',
    planId: 'professional',
    price: '$12',
    period: '/mo',
    features: ['Unlimited accounts', 'Real-time sync', 'Subscription optimizer', 'Investment analytics', 'Tax insights', 'Priority support'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Family',
    planId: 'business',
    price: '$29',
    period: '/mo',
    features: ['Everything in Premium', 'Up to 5 members', 'Shared dashboards', 'Family goals', 'Estate planning'],
    cta: 'Start Trial',
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
    <section className="py-32 px-6 border-t border-white/[0.03]" id="pricing">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl lg:text-5xl font-medium mb-5 tracking-tight">
            Simple pricing
          </h2>
          <p className="text-white/40">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`h-full flex flex-col p-8 rounded-2xl border ${plan.popular
                  ? 'border-white/20 bg-white/[0.03]'
                  : 'border-white/[0.03] bg-white/[0.01]'
                }`}>
                {plan.popular && (
                  <span className="text-xs text-white/40 uppercase tracking-wider mb-4">Most Popular</span>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-medium">{plan.price}</span>
                    <span className="text-white/40 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className={`w-full ${plan.popular ? 'bg-white text-black hover:bg-white/90' : ''}`}
                  onClick={() => handleCheckout(plan.planId)}
                >
                  {plan.cta}
                </Button>
              </div>
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
    <section className="py-32 px-6 border-t border-white/[0.03]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl lg:text-5xl font-medium mb-6 tracking-tight">
          See your wealth clearly.
        </h2>
        <p className="text-lg text-white/40 mb-12">
          Join thousands building wealth with clarity.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="text-base px-12 py-5 bg-white text-black hover:bg-white/90 font-medium shadow-2xl shadow-white/10">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-white/[0.03] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center">
              <span className="text-white font-medium text-xs">M</span>
            </div>
            <span className="text-sm text-white/40">MoneyLoop</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <p className="text-sm text-white/30">© 2026 MoneyLoop</p>
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
