'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  Wallet,
  Home,
  Coins,
  Receipt,
  Sparkles,
  Zap,
  LineChart,
  PiggyBank,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import DashboardPreview from '@/components/landing/DashboardPreview';
import { SecurityBadges, PartnerLogos, DataPromise } from '@/components/landing/TrustBadges';

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

// Premium Elegant Background with Animated Mesh
function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Premium background image */}
      <div className="absolute inset-0">
        <Image
          src="/premium-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
          quality={95}
        />
      </div>

      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-[#050508]/50" />

      {/* Animated mesh gradient orbs */}
      <div
        className="mesh-orb mesh-orb-emerald w-[600px] h-[600px] top-[-10%] left-[20%]"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="mesh-orb mesh-orb-gold w-[500px] h-[500px] top-[30%] right-[-10%]"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="mesh-orb mesh-orb-purple w-[400px] h-[400px] bottom-[20%] left-[5%]"
        style={{ animationDelay: '6s' }}
      />
      <div
        className="mesh-orb mesh-orb-emerald w-[350px] h-[350px] bottom-[-5%] right-[30%]"
        style={{ animationDelay: '9s' }}
      />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, #050508 85%)',
        }}
      />

      {/* Top-to-bottom gradient for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/20 via-transparent to-[#050508]/90" />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
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
          <Link href="/" className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="MoneyLoop"
                width={40}
                height={40}
                className="rounded-xl mix-blend-screen brightness-110"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">MoneyLoop</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/40 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/40 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" className="text-sm text-white/50 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="text-sm bg-white/[0.08] text-white hover:bg-white/[0.12] font-medium border border-white/[0.1] backdrop-blur-sm">
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
            <Link href="/auth">
              <Button variant="secondary" className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button className="w-full bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]">Get Started</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Hero Section with Dashboard Preview
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
      {/* Refined gradient overlays for premium depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-[#050508]/50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text */}
          <div className="text-center lg:text-left">
            {/* Badge - Premium Subtle Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#7dd3a8]/80" />
              <span className="text-xs text-white/60 font-medium tracking-widest uppercase">Free Forever</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-premium-display mb-6"
            >
              Your complete
              <br />
              <span className="shimmer-text">wealth picture.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="text-lg text-white/50 max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Track every asset. See all income streams.
              Discover hidden savings. Build wealth with clarity.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
            >
              <Link href="/auth">
                <Button size="lg" className="text-base px-10 py-5 bg-white/[0.08] text-white hover:bg-white/[0.12] font-medium shadow-2xl shadow-black/40 border border-white/[0.1] backdrop-blur-sm">
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg" className="text-base px-8 py-5 text-white/60 hover:text-white border border-white/10 hover:border-white/20">
                  See Features
                </Button>
              </Link>
            </motion.div>

            {/* Asset types */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-white/40 text-sm"
            >
              {[
                { icon: Wallet, text: 'Bank Accounts' },
                { icon: TrendingUp, text: 'Investments' },
                { icon: Coins, text: 'Gold & Silver' },
                { icon: Home, text: 'Real Estate' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <item.icon className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-xs">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Dashboard Preview */}
          <div className="hidden lg:block">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Section
function TrustSection() {
  return (
    <section className="py-16 px-6 border-y border-white/[0.03] bg-white/[0.01]">
      <div className="max-w-5xl mx-auto space-y-10">
        <SecurityBadges />
        <PartnerLogos />
      </div>
    </section>
  );
}

// Stats
function StatsSection() {
  return (
    <section className="py-24 px-6">
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
    description: 'Connect checking, savings, credit cards, and investment accounts in one unified view.',
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Stocks, ETFs, mutual funds, and retirement accounts with full portfolio analytics.',
  },
  {
    icon: Coins,
    title: 'Alternative Assets',
    description: 'Track gold, silver, and other precious metals with live market pricing.',
  },
  {
    icon: Home,
    title: 'Real Estate',
    description: 'Property values, rental income, mortgage tracking, and equity growth visualization.',
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
    <section className="py-32 px-6 border-t border-white/[0.03]" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-premium-headline mb-5">
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
              <div className="group p-7 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7dd3a8]/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#7dd3a8]/10 flex items-center justify-center mb-5 group-hover:bg-[#7dd3a8]/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#7dd3a8]" />
                </div>
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
    { step: '1', title: 'Connect', description: 'Link accounts securely in seconds', icon: Zap },
    { step: '2', title: 'See', description: 'View your complete wealth picture', icon: LineChart },
    { step: '3', title: 'Discover', description: 'Find hidden savings opportunities', icon: Sparkles },
    { step: '4', title: 'Grow', description: 'Make smarter decisions', icon: PiggyBank },
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
          <h2 className="text-premium-headline">
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
              className="text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5 group-hover:border-[#7dd3a8]/30 group-hover:bg-[#7dd3a8]/5 transition-all">
                <step.icon className="w-6 h-6 text-white/40 group-hover:text-[#7dd3a8] transition-colors" />
              </div>
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
    planId: 'premium',
    price: '$39',
    period: '/mo',
    features: [
      'Unlimited accounts',
      'Real-time sync',
      'AI savings finder',
      'Subscription optimizer',
      'Investment analytics',
      'Tax insights',
      'Priority support',
    ],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Family',
    planId: 'family',
    price: '$79',
    period: '/mo',
    features: [
      'Everything in Premium',
      'Up to 5 members',
      'Shared dashboards',
      'Family goals',
      'Estate planning',
    ],
    cta: 'Start Trial',
  },
];

function PricingSection() {
  const handleCheckout = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/auth';
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
          className="text-center mb-16"
        >
          <h2 className="text-premium-headline mb-5">
            We&apos;re Your Financial Allies
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            We only get paid when you&apos;re saving. Our subscription starts after we find you real savings—
            not before. Cancel anytime with no penalty.
          </p>

          {/* Savings Guarantee Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#7dd3a8]/8 border border-[#7dd3a8]/15">
            <Shield className="w-5 h-5 text-[#7dd3a8]" />
            <span className="text-sm text-[#7dd3a8]/90 font-medium">
              Savings Guarantee: If we don&apos;t save you at least your subscription cost each month, we&apos;ll refund you. Period.
            </span>
          </div>
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
              <div className={`h-full flex flex-col p-8 rounded-3xl border transition-all duration-500 ${plan.popular
                ? 'luxury-card'
                : 'premium-card'
                }`}>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#7dd3a8] uppercase tracking-wider mb-4">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
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
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-[#7dd3a8]/60' : 'text-white/30'}`} />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className={`w-full ${plan.popular ? 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]' : ''}`}
                  onClick={() => handleCheckout(plan.planId)}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data promise */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <DataPromise />
        </motion.div>
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
        <h2 className="text-premium-headline mb-6">
          See your wealth clearly.
        </h2>
        <p className="text-lg text-white/40 mb-12">
          Join thousands building wealth with clarity.
        </p>
        <Link href="/auth">
          <Button size="lg" className="btn-premium text-base px-12 py-5 text-white font-medium rounded-xl">
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
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="MoneyLoop" width={32} height={32} className="rounded-lg mix-blend-screen brightness-110" />
            <span className="text-sm text-white/50 font-medium">MoneyLoop</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/30">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
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
        <TrustSection />
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
