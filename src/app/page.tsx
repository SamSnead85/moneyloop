'use client';

import { useState, useEffect, useRef } from 'react';
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
  Lock,
  Award,
  Globe,
  Briefcase,
  CreditCard,
  ChevronRight,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import DashboardPreview from '@/components/landing/DashboardPreview';
import { SecurityBadges, PartnerLogos, DataPromise } from '@/components/landing/TrustBadges';

// Types
type ProductMode = 'personal' | 'business';

// Build version for deployment verification
const BUILD_VERSION = 'v6.0';
const BUILD_DATE = 'Jan 25 2026';

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

// Professional Background for Business Mode
function ProfessionalBackground({ mode }: { mode: ProductMode }) {
  if (mode === 'personal') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
        <div className="absolute inset-0 bg-[#050508]/50" />
        <motion.div className="mesh-orb mesh-orb-emerald w-[600px] h-[600px] top-[-10%] left-[20%]" />
        <motion.div className="mesh-orb mesh-orb-gold w-[500px] h-[500px] top-[30%] right-[-10%]" style={{ animationDelay: '3s' }} />
        <motion.div className="mesh-orb mesh-orb-purple w-[400px] h-[400px] bottom-[20%] left-[5%]" style={{ animationDelay: '6s' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, #050508 85%)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/20 via-transparent to-[#050508]/90" />
      </div>
    );
  }

  // Institutional Premium Business Background - Mercury/Stripe Standard
  // NO animated orbs, NO particles, NO AI-coded effects
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep institutional navy base */}
      <div className="absolute inset-0 bg-[#0a1628]" />

      {/* Premium photography layer - boardroom environment */}
      <div className="absolute inset-0">
        <Image
          src="/images/premium/boardroom.png"
          alt=""
          fill
          className="object-cover object-center"
          style={{ opacity: 0.35 }}
          priority
        />
        {/* Professional gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/85 to-[#0a1628]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-[#0a1628]/50" />
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a1628] to-transparent" />
    </div>
  );
}

// Product Mode Toggle - Institutional
function ProductModeToggle({ mode, setMode }: { mode: ProductMode; setMode: (mode: ProductMode) => void }) {
  return (
    <div className="inline-flex items-center p-1 rounded-lg bg-slate-800/50 border border-slate-700">
      <button
        onClick={() => setMode('personal')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'personal'
          ? 'bg-emerald-600 text-white'
          : 'text-slate-400 hover:text-white'
          }`}
      >
        <Home className="w-4 h-4" />
        Personal
      </button>
      <button
        onClick={() => setMode('business')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'business'
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white'
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
      { href: '#platform', label: 'Platform' },
      { href: '#features', label: 'Solutions' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#customers', label: 'Customers' },
    ]
    : [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#pricing', label: 'Pricing' },
    ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${mode === 'business'
      ? 'bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-white/[0.05]'
      : 'bg-[#050508]/60 backdrop-blur-2xl border-b border-white/[0.03]'
      }`}>
      {/* Simple status banner */}
      <div className={`text-center py-1.5 text-xs font-medium ${mode === 'business'
        ? 'bg-slate-800 text-slate-400 border-b border-slate-700'
        : 'bg-emerald-600 text-white'
        }`}>
        ✓ Build {BUILD_VERSION} · Live
      </div>
      <div className="max-w-7xl mx-auto px-6">
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
              <a key={link.href} href={link.href} className="text-sm text-white/40 hover:text-white transition-colors font-medium">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href={mode === 'business' ? '/employer' : '/auth'}>
              <Button variant="ghost" className="text-sm text-white/50 hover:text-white font-medium">
                Sign In
              </Button>
            </Link>
            <Link href={mode === 'business' ? '/employer/onboarding' : '/auth'}>
              <Button size="sm" className={`text-sm font-medium ${mode === 'business'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.1]'
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
          className="lg:hidden border-t border-white/5 bg-[#0a0f1c] p-6 space-y-4"
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
                ? 'bg-cyan-500 text-white'
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

// Personal Hero Section (unchanged)
function PersonalHeroSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <div className="text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-6 sm:mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          <span className="text-[10px] sm:text-xs text-white/60 font-medium tracking-widest uppercase">Trusted by 2,800+ Users</span>
        </motion.div>

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

      <div className="hidden lg:block">
        <DashboardPreview />
      </div>
    </div>
  );
}

// Institutional Business Hero Section - Mercury/Stripe Standard
// NO gradient text, NO animated CTAs, NO glow effects
function BusinessHeroSection() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Trust Badges - Subtle, professional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-8 mb-12"
      >
        {[
          { icon: Shield, text: 'SOC 2 Type II' },
          { icon: Lock, text: 'Bank-Level Encryption' },
          { icon: Award, text: 'IRS Authorized' },
        ].map((badge) => (
          <div key={badge.text} className="flex items-center gap-2 text-slate-400 text-sm">
            <badge.icon className="w-4 h-4 text-slate-500" />
            <span>{badge.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Main Hero Content - Typography-driven */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-semibold tracking-tight mb-6 leading-[1.1] text-white"
        >
          The modern platform for
          <br />
          payroll, HR & benefits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Trusted by 15,000+ companies to automate payroll, streamline HR operations,
          and manage employee benefits. Built for scale.
        </motion.p>

        {/* CTAs - Clean, solid colors, NO animations */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/employer/onboarding">
            <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-base flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="#demo">
            <button className="px-8 py-3.5 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 font-medium rounded-lg transition-colors text-base flex items-center gap-2">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </Link>
        </motion.div>

        {/* Social Proof - Restrained */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
            ))}
            <span className="ml-2 text-slate-400 text-sm">4.9/5 from 2,400+ reviews</span>
          </div>
          <p className="text-slate-500 text-sm">No credit card required · Free for first 2 employees</p>
        </motion.div>
      </div>

      {/* Product Preview - Premium dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-16 relative"
      >
        {/* Clean shadow - no glow */}
        <div className="absolute inset-0 bg-black/20 blur-3xl rounded-3xl translate-y-4" />

        {/* Dashboard image */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
          <Image
            src="/images/premium/dashboard-mockup.png"
            alt="MoneyLoop Dashboard"
            width={1200}
            height={700}
            className="w-full h-auto"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}

// Hero Section with Mode Toggle
function HeroSection({ mode }: { mode: ProductMode }) {
  return (
    <section className={`relative min-h-screen flex items-center justify-center pt-28 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden ${mode === 'business' ? 'pt-32' : ''
      }`}>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-[#050508]/50" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
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

// Business Logos Section - Enterprise Clients
function EnterpriseLogosSection() {
  return (
    <section className="py-16 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-white/30 text-sm font-medium mb-10 tracking-wider uppercase">
          Trusted by Leading Companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'Loom'].map((company) => (
            <div key={company} className="text-white/20 text-xl font-semibold tracking-tight hover:text-white/40 transition-colors">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Business Stats Section - More Professional
function BusinessStatsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: 15000, suffix: '+', label: 'Companies Trust Us', icon: Building2 },
            { value: 250000, suffix: '+', label: 'Employees Paid', icon: Users },
            { value: 99.99, suffix: '%', label: 'Uptime Guarantee', icon: Shield },
            { value: 2, prefix: '<', suffix: ' min', label: 'To Run Payroll', icon: Clock },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-3xl lg:text-4xl font-semibold text-white mb-2">
                {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Platform Features Section - Corporate Design
function PlatformFeaturesSection() {
  const capabilities = [
    {
      category: 'Payroll',
      icon: DollarSign,
      color: 'from-cyan-500 to-blue-600',
      features: [
        'Unlimited payroll runs',
        'Multi-state tax filing',
        'Direct deposit & checks',
        'Garnishment handling',
        'Contractor payments (1099)',
      ],
    },
    {
      category: 'HR & Onboarding',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      features: [
        'Employee self-service portal',
        'Digital I-9 & W-4',
        'Org chart & directory',
        'Performance reviews',
        'Offboarding workflows',
      ],
    },
    {
      category: 'Benefits',
      icon: Heart,
      color: 'from-indigo-500 to-violet-600',
      features: [
        'Health, dental & vision',
        '401(k) administration',
        'HSA/FSA management',
        'Open enrollment tools',
        'COBRA compliance',
      ],
    },
    {
      category: 'Compliance',
      icon: Shield,
      color: 'from-violet-500 to-purple-600',
      features: [
        'Automatic tax deposits',
        'Year-end W-2 & 1099 filing',
        'ACA reporting',
        'New hire reporting',
        'Audit-ready records',
      ],
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.04]" id="platform">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-5 text-white">
            One Platform. Complete Control.
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Everything you need to pay your team, stay compliant, and build a great workplace—all in one unified platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center mb-5`}>
                <cap.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">{cap.category}</h3>
              <ul className="space-y-3">
                {cap.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-white/50">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Business Features Section - More Professional
function BusinessFeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: '2-Click Payroll',
      description: 'Review and approve payroll in under two minutes. Automatic calculations for taxes, deductions, and overtime.',
    },
    {
      icon: Globe,
      title: 'Multi-State Support',
      description: 'Hire anywhere in the US. We handle state and local tax registrations, withholding, and filings.',
    },
    {
      icon: CreditCard,
      title: 'Next-Day Direct Deposit',
      description: 'Pay your team faster with next-day direct deposit. No more waiting for paycheck clearance.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Workforce insights, compensation benchmarks, and custom reports to make smarter decisions.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified. 256-bit encryption. Role-based access controls. Audit logging.',
    },
    {
      icon: Briefcase,
      title: 'Dedicated Support',
      description: 'US-based support team available via chat, email, and phone. Average response time under 2 hours.',
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.04]" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Why MoneyLoop</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-5 text-white">
            Built for Modern Businesses
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Whether you have 5 employees or 500, MoneyLoop scales with your business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/20 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section - Professional
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "MoneyLoop cut our payroll processing time by 80%. What used to take all day now takes 15 minutes.",
      author: "Sarah Chen",
      role: "VP of Operations",
      company: "Acme Technologies",
    },
    {
      quote: "Finally, a payroll platform that doesn't feel like it was built in 2005. Clean, fast, and actually enjoyable to use.",
      author: "Marcus Johnson",
      role: "CFO",
      company: "Horizon Labs",
    },
    {
      quote: "The compliance features alone are worth it. We used to stress about tax deadlines. Now it's all automated.",
      author: "Emily Rodriguez",
      role: "HR Director",
      company: "Summit Group",
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.04]" id="customers">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Customer Stories</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
            Loved by Finance Teams
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-white/70 mb-6 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-sm text-white/40">{testimonial.role}, {testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Business Pricing Section - Professional
function BusinessPricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$40',
      period: '/mo',
      perEmployee: '+ $6/employee',
      description: 'For growing teams getting started with payroll',
      features: [
        'Unlimited payroll runs',
        'Direct deposit',
        'Tax filing (federal & state)',
        'Employee self-service',
        'Basic reporting',
        'Email support',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$80',
      period: '/mo',
      perEmployee: '+ $12/employee',
      description: 'For teams that need HR and benefits',
      features: [
        'Everything in Starter',
        'HR onboarding workflows',
        'Time & attendance',
        'PTO management',
        'Benefits administration',
        'Priority support',
        'Custom reports',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      perEmployee: '',
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        'Advanced security (SSO)',
        'SLA guarantees',
        'On-site training',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.04]" id="pricing">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-5 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl ${plan.highlighted
                ? 'bg-gradient-to-b from-cyan-500/10 to-transparent border-2 border-cyan-500/30'
                : 'bg-white/[0.02] border border-white/[0.06]'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40">{plan.period}</span>
              </div>
              {plan.perEmployee && (
                <p className="text-sm text-cyan-400 mb-4">{plan.perEmployee}</p>
              )}
              <p className="text-sm text-white/40 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.cta === 'Contact Sales' ? '#' : '/employer/onboarding'}>
                <Button className={`w-full ${plan.highlighted
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]'
                  }`}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section - Professional
function BusinessCTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 text-white">
            Ready to simplify payroll?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Join 15,000+ companies using MoneyLoop to pay their teams and stay compliant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/employer/onboarding">
              <Button size="lg" className="px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-xl shadow-cyan-500/25">
                Start Your Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#">
              <Button variant="ghost" size="lg" className="px-8 py-5 text-white/60 hover:text-white border border-white/10">
                Schedule a Demo
              </Button>
            </Link>
          </div>
          <p className="text-white/30 text-sm mt-6">Free for first 2 employees · No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer - Professional
function Footer({ mode }: { mode: ProductMode }) {
  return (
    <footer className="py-16 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="MoneyLoop" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-semibold text-white">MoneyLoop</span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              The modern platform for payroll, HR, and benefits. Trusted by 15,000+ companies.
            </p>
          </div>

          {[
            { title: 'Product', links: ['Payroll', 'HR', 'Benefits', 'Time Tracking', 'Reports'] },
            { title: 'Company', links: ['About', 'Careers', 'Press', 'Security'] },
            { title: 'Resources', links: ['Help Center', 'API Docs', 'Webinars', 'Blog'] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04]">
          <p className="text-sm text-white/30">© 2026 MoneyLoop. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-sm text-white/30 hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-white/30 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-white/30 hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Personal Features Section (condensed)
function PersonalFeaturesSection() {
  const features = [
    { icon: Wallet, title: 'Bank Accounts', description: 'Connect all your accounts in one dashboard' },
    { icon: TrendingUp, title: 'Investments', description: 'Track stocks, crypto, and retirement accounts' },
    { icon: Home, title: 'Real Estate', description: 'Monitor property values and equity' },
    { icon: PiggyBank, title: 'Savings Goals', description: 'Set and achieve financial goals' },
    { icon: Receipt, title: 'Bill Tracking', description: 'Never miss a payment again' },
    { icon: LineChart, title: 'Net Worth', description: 'See your complete financial picture' },
  ];

  return (
    <section className="py-32 px-6 border-t border-white/[0.03]" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Everything you need to
            <br />
            <span className="shimmer-text">build wealth</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Track every asset, see all income streams, and discover hidden savings
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
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
            >
              <feature.icon className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-white/40">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Page Component
export default function LandingPage() {
  const [mode, setMode] = useState<ProductMode>('business');

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      <ProfessionalBackground mode={mode} />
      <Navigation mode={mode} setMode={setMode} />
      <HeroSection mode={mode} />

      <AnimatePresence mode="wait">
        {mode === 'business' ? (
          <motion.div
            key="business-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnterpriseLogosSection />
            <BusinessStatsSection />
            <PlatformFeaturesSection />
            <BusinessFeaturesSection />
            <TestimonialsSection />
            <BusinessPricingSection />
            <BusinessCTASection />
          </motion.div>
        ) : (
          <motion.div
            key="personal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PersonalFeaturesSection />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer mode={mode} />
    </div>
  );
}
