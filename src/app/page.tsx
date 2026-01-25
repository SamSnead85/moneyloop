'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
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
  Building2,
  Users,
  DollarSign,
  Clock,
  FileText,
  Heart,
  Calculator,
  BarChart3,
  Check,
  Play,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import DashboardPreview from '@/components/landing/DashboardPreview';
import { SecurityBadges, PartnerLogos, DataPromise } from '@/components/landing/TrustBadges';

// Types
type ProductMode = 'personal' | 'business';

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
function PremiumBackground({ mode }: { mode: ProductMode }) {
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

      {/* Animated mesh gradient orbs - color changes based on mode */}
      <motion.div
        className={`mesh-orb w-[600px] h-[600px] top-[-10%] left-[20%] transition-all duration-1000 ${mode === 'business' ? 'mesh-orb-gold' : 'mesh-orb-emerald'
          }`}
        style={{ animationDelay: '0s' }}
        animate={{ scale: mode === 'business' ? 1.2 : 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className={`mesh-orb w-[500px] h-[500px] top-[30%] right-[-10%] transition-all duration-1000 ${mode === 'business' ? 'mesh-orb-purple' : 'mesh-orb-gold'
          }`}
        style={{ animationDelay: '3s' }}
      />
      <motion.div
        className={`mesh-orb w-[400px] h-[400px] bottom-[20%] left-[5%] transition-all duration-1000 ${mode === 'business' ? 'mesh-orb-emerald' : 'mesh-orb-purple'
          }`}
        style={{ animationDelay: '6s' }}
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
    </div>
  );
}

// Build version for deployment verification
const BUILD_VERSION = 'v5.0';
const BUILD_DATE = 'Jan 24 2026';

// Product Mode Toggle
function ProductModeToggle({ mode, setMode }: { mode: ProductMode; setMode: (mode: ProductMode) => void }) {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
      <button
        onClick={() => setMode('personal')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'personal'
            ? 'bg-gradient-to-r from-[#34d399] to-[#2dd4bf] text-[#050508] shadow-lg shadow-[#34d399]/20'
            : 'text-white/50 hover:text-white'
          }`}
      >
        <Home className="w-4 h-4" />
        Personal
      </button>
      <button
        onClick={() => setMode('business')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'business'
            ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white shadow-lg shadow-[#0ea5e9]/20'
            : 'text-white/50 hover:text-white'
          }`}
      >
        <Building2 className="w-4 h-4" />
        Business
      </button>
    </div>
  );
}

// Navigation
function Navigation({ mode, setMode }: { mode: ProductMode; setMode: (mode: ProductMode) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = mode === 'business'
    ? [
      { href: '#features', label: 'Features' },
      { href: '#payroll', label: 'Payroll' },
      { href: '#pricing', label: 'Pricing' },
    ]
    : [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#pricing', label: 'Pricing' },
    ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/60 backdrop-blur-2xl border-b border-white/[0.03]">
      {/* Deployment Verification Banner */}
      <div className={`text-center py-1.5 text-xs font-medium ${mode === 'business'
          ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white'
          : 'bg-[#34d399] text-[#050508]'
        }`}>
        🚀 Build {BUILD_VERSION} | Deployed {BUILD_DATE} | ✓ Latest changes active
      </div>
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

          {/* Mode Toggle - Desktop */}
          <div className="hidden lg:block">
            <ProductModeToggle mode={mode} setMode={setMode} />
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href={mode === 'business' ? '/employer' : '/auth'}>
              <Button variant="ghost" className="text-sm text-white/50 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href={mode === 'business' ? '/employer/onboarding' : '/auth'}>
              <Button size="sm" className={`text-sm font-medium border backdrop-blur-sm ${mode === 'business'
                  ? 'bg-gradient-to-r from-[#0ea5e9]/20 to-[#8b5cf6]/20 text-white hover:from-[#0ea5e9]/30 hover:to-[#8b5cf6]/30 border-[#0ea5e9]/30'
                  : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border-white/[0.1]'
                }`}>
                {mode === 'business' ? 'Start Free Trial' : 'Get Started'}
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
          <div className="mb-4">
            <ProductModeToggle mode={mode} setMode={setMode} />
          </div>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block py-2 text-white/60">{link.label}</a>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link href={mode === 'business' ? '/employer' : '/auth'}>
              <Button variant="secondary" className="w-full">Sign In</Button>
            </Link>
            <Link href={mode === 'business' ? '/employer/onboarding' : '/auth'}>
              <Button className={`w-full ${mode === 'business'
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white'
                  : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]'
                }`}>
                {mode === 'business' ? 'Start Free Trial' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Personal Hero Section
function PersonalHeroSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      {/* Left column - Text */}
      <div className="text-center lg:text-left">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-6 sm:mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]/80 animate-pulse" />
          <span className="text-[10px] sm:text-xs text-white/60 font-medium tracking-widest uppercase">Trusted by 2,800+ Startups</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-4 sm:mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Your complete
          <br />
          <span className="shimmer-text">wealth picture.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="text-base sm:text-lg text-white/50 max-w-md mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0"
        >
          Track every asset. See all income streams.
          Discover hidden savings. Build wealth with clarity.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 px-2 sm:px-0"
        >
          <Link href="/auth" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-8 sm:px-10 py-4 sm:py-5 bg-white/[0.08] text-white hover:bg-white/[0.12] font-medium shadow-2xl shadow-black/40 border border-white/[0.1] backdrop-blur-sm">
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 text-white/60 hover:text-white border border-white/10 hover:border-white/20">
              See Features
            </Button>
          </Link>
        </motion.div>

        {/* Asset types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-white/40 text-sm px-2 sm:px-0"
        >
          {[
            { icon: Wallet, text: 'Bank Accounts' },
            { icon: TrendingUp, text: 'Investments' },
            { icon: Coins, text: 'Gold & Silver' },
            { icon: Home, text: 'Real Estate' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/5">
              <item.icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 opacity-60" />
              <span className="text-[10px] sm:text-xs whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right column - Dashboard Preview */}
      <div className="hidden lg:block">
        <DashboardPreview />
      </div>
    </div>
  );
}

// Business Hero Section
function BusinessHeroSection() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 backdrop-blur-sm mb-8"
      >
        <Building2 className="w-4 h-4 text-[#0ea5e9]" />
        <span className="text-xs text-[#0ea5e9] font-medium tracking-widest uppercase">Employer Hub</span>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]"
        style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
      >
        Payroll & HR
        <br />
        <span className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] bg-clip-text text-transparent">that just works.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35 }}
        className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Run payroll in minutes. Automate onboarding. Manage benefits.
        All-in-one platform that&apos;s 10x easier than Gusto.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
      >
        <Link href="/employer/onboarding">
          <Button size="lg" className="px-10 py-5 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white hover:opacity-90 font-medium shadow-2xl shadow-[#0ea5e9]/20">
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="#demo">
          <Button variant="ghost" size="lg" className="px-8 py-5 text-white/60 hover:text-white border border-white/10 hover:border-white/20">
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </Link>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.7 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { icon: DollarSign, text: 'Auto Payroll', desc: 'Run in 2 clicks' },
          { icon: Users, text: 'Team Onboarding', desc: 'Self-service portal' },
          { icon: Heart, text: 'Benefits Admin', desc: 'Health, 401k, etc.' },
          { icon: FileText, text: 'Tax Filing', desc: '941, W-2, 1099' },
        ].map((item) => (
          <div key={item.text} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#0ea5e9]/30 transition-all">
            <item.icon className="w-6 h-6 text-[#0ea5e9] mx-auto mb-2" />
            <p className="text-sm font-medium text-white">{item.text}</p>
            <p className="text-xs text-white/40">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Hero Section with Mode Toggle
function HeroSection({ mode }: { mode: ProductMode }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-[#050508]/50" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {mode === 'personal' ? (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <PersonalHeroSection />
            </motion.div>
          ) : (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <BusinessHeroSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Business Stats Section
function BusinessStatsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: 15000, suffix: '+', label: 'Companies' },
            { value: 250000, suffix: '+', label: 'Employees Paid' },
            { value: 99.99, suffix: '%', label: 'Uptime' },
            { value: 2, prefix: '<', suffix: ' min', label: 'Payroll Run' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-[#0ea5e9]/20 transition-all duration-300"
            >
              <p className="text-2xl lg:text-3xl font-semibold text-white mb-1 font-mono">
                {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Business Features Section
function BusinessFeaturesSection() {
  const features = [
    {
      icon: DollarSign,
      title: 'Automated Payroll',
      description: 'Run payroll in 2 clicks. Automatic tax calculations, deductions, and direct deposit.',
      color: 'text-[#0ea5e9]',
      bg: 'bg-[#0ea5e9]/10',
    },
    {
      icon: Users,
      title: 'Employee Onboarding',
      description: 'Self-service portal for I-9, W-4, direct deposit, and benefits enrollment.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      icon: Clock,
      title: 'Time & Attendance',
      description: 'Clock in/out, PTO tracking, timesheet approvals, and overtime calculations.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      icon: Heart,
      title: 'Benefits Administration',
      description: 'Health, dental, vision, 401(k), and custom benefit plans with open enrollment.',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
    },
    {
      icon: FileText,
      title: 'Tax Compliance',
      description: 'Automatic Form 941, 940, W-2, 1099-NEC filing. State and local tax support.',
      color: 'text-[#34d399]',
      bg: 'bg-[#34d399]/10',
    },
    {
      icon: BarChart3,
      title: 'HR Analytics',
      description: 'Workforce insights, compensation analysis, turnover tracking, and custom reports.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] bg-clip-text text-transparent">run your business</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Replace 5+ tools with one unified platform
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
              <div className="group p-7 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#0ea5e9]/20 transition-all duration-300 h-full">
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
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

// Business Pricing Section
function BusinessPricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$40',
      period: '/mo + $6/employee',
      description: 'For small teams getting started',
      features: [
        'Unlimited payroll runs',
        'Employee self-service',
        'Direct deposit',
        'Basic reporting',
        'Email support',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Plus',
      price: '$80',
      period: '/mo + $12/employee',
      description: 'For growing businesses',
      features: [
        'Everything in Starter',
        'Time & attendance',
        'PTO management',
        'Benefits administration',
        'HR toolkit',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Premium',
      price: '$135',
      period: '/mo + $22/employee',
      description: 'For established companies',
      features: [
        'Everything in Plus',
        'Performance reviews',
        'Custom workflows',
        'Advanced analytics',
        'API access',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="pricing">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime.
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
              <div className={`h-full flex flex-col p-8 rounded-3xl border transition-all duration-500 ${plan.popular
                  ? 'bg-gradient-to-b from-[#0ea5e9]/10 to-[#8b5cf6]/10 border-[#0ea5e9]/30'
                  : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#0ea5e9] uppercase tracking-wider mb-4">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-1">{plan.name}</h3>
                  <p className="text-sm text-white/40">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-white/40 ml-1 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-[#0ea5e9]' : 'text-white/30'}`} />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/employer/onboarding">
                  <Button className={`w-full ${plan.popular
                      ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white'
                      : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]'
                    }`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust elements */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SOC 2 certified
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              256-bit encryption
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              99.99% uptime
            </span>
          </div>
        </motion.div>
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

// Personal Stats Section
function PersonalStatsSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: 47, prefix: '$', suffix: 'M+', label: 'Assets Tracked' },
            { value: 2847, suffix: '+', label: 'Active Users' },
            { value: 312, prefix: '$', suffix: '', label: 'Avg. Savings' },
            { value: 99.9, suffix: '%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-5 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-[#34d399]/20 transition-all duration-300"
            >
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-1 font-mono">
                {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[11px] sm:text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Personal Features
const personalFeatures = [
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

function PersonalFeaturesSection() {
  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Everything you need
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            A complete view of your financial life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="group p-7 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#34d399]/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#34d399]/10 flex items-center justify-center mb-5 group-hover:bg-[#34d399]/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#34d399]" />
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

// How it works (Personal)
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
          <h2 className="text-4xl sm:text-5xl font-semibold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
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
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5 group-hover:border-[#34d399]/30 group-hover:bg-[#34d399]/5 transition-all">
                <step.icon className="w-6 h-6 text-white/40 group-hover:text-[#34d399] transition-colors" />
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

// Personal Pricing
function PersonalPricingSection() {
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

  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="pricing">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            We&apos;re Your Financial Allies
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            We only get paid when you&apos;re saving. Our subscription starts after we find you real savings—
            not before. Cancel anytime with no penalty.
          </p>

          {/* Savings Guarantee Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#34d399]/8 border border-[#34d399]/15">
            <Shield className="w-5 h-5 text-[#34d399]" />
            <span className="text-sm text-[#34d399]/90 font-medium">
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
                ? 'bg-gradient-to-b from-[#34d399]/5 to-transparent border-[#34d399]/20'
                : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#34d399] uppercase tracking-wider mb-4">
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
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-[#34d399]/60' : 'text-white/30'}`} />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth">
                  <Button className={`w-full ${plan.popular ? 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]' : ''}`}>
                    {plan.cta}
                  </Button>
                </Link>
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
function CTASection({ mode }: { mode: ProductMode }) {
  return (
    <section className="py-32 px-6 border-t border-white/[0.03]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-semibold mb-6" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          {mode === 'business' ? 'Ready to simplify HR?' : 'See your wealth clearly.'}
        </h2>
        <p className="text-lg text-white/40 mb-12">
          {mode === 'business'
            ? 'Join thousands of companies running smarter payroll.'
            : 'Join thousands building wealth with clarity.'
          }
        </p>
        <Link href={mode === 'business' ? '/employer/onboarding' : '/auth'}>
          <Button size="lg" className={`text-base px-12 py-5 font-medium rounded-xl ${mode === 'business'
              ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white'
              : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]'
            }`}>
            {mode === 'business' ? 'Start Free Trial' : 'Get Started Free'}
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
    <footer className="border-t border-white/[0.03] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="MoneyLoop" width={32} height={32} className="rounded-lg mix-blend-screen brightness-110" />
            <span className="text-sm text-white/50 font-medium">MoneyLoop</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 sm:gap-8 text-sm text-white/30">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-white/30">© 2026 MoneyLoop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function HomePage() {
  const [mode, setMode] = useState<ProductMode>('personal');

  return (
    <>
      <PremiumBackground mode={mode} />
      <Navigation mode={mode} setMode={setMode} />
      <main className="relative z-10">
        <HeroSection mode={mode} />
        <TrustSection />

        {mode === 'business' ? (
          <>
            <BusinessStatsSection />
            <BusinessFeaturesSection />
            <BusinessPricingSection />
          </>
        ) : (
          <>
            <PersonalStatsSection />
            <PersonalFeaturesSection />
            <HowItWorksSection />
            <PersonalPricingSection />
          </>
        )}

        <CTASection mode={mode} />
      </main>
      <Footer />
    </>
  );
}
