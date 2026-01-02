'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { AnimatedBackground, Button, Card } from '@/components/ui';

// Hero section with animated gradient and flow visualization
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
      <div className="absolute inset-0 overflow-hidden">
        {/* Money flow visualization */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Animated flow paths */}
          <motion.path
            d="M 0 400 Q 300 300 600 400 T 1200 400"
            fill="none"
            stroke="url(#flowGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0 450 Q 400 350 700 450 T 1200 400"
            fill="none"
            stroke="url(#flowGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2.5, delay: 0.3, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0 350 Q 250 280 500 380 T 1200 350"
            fill="none"
            stroke="url(#flowGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3, delay: 0.6, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-slate-300">AI-Powered Financial Intelligence</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Finally{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            understand
          </span>
          <br />
          your money.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Connect all your accounts. See where money flows. Get AI insights that
          actually make sense. Personal and business finance in one elegant command center.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
            Start Free Trial
          </Button>
          <Button variant="secondary" size="lg" icon={<Play className="w-4 h-4" />}>
            Watch Demo
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>SOC 2 Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>10K+ Users</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Features section
const features = [
  {
    icon: PieChart,
    title: 'Real-Time Dashboard',
    description:
      'See your complete financial picture at a glance. Beautiful visualizations that make complex data instantly readable.',
  },
  {
    icon: TrendingUp,
    title: 'AI Insights',
    description:
      'Natural language explanations of your spending patterns. Ask questions, get answers that actually help.',
  },
  {
    icon: CreditCard,
    title: 'Subscription Intelligence',
    description:
      'Automatically detect subscriptions, renewals, and forgotten charges. Never overpay again.',
  },
  {
    icon: Building2,
    title: 'Personal & Business',
    description:
      'Switch between personal and business views instantly. Track burn rate, runway, and tax-relevant expenses.',
  },
  {
    icon: Zap,
    title: 'Forecasting',
    description:
      'Simulate changes and see the impact on your future. Model savings goals, large purchases, or income changes.',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description:
      'Read-only connections, 256-bit encryption, and SOC 2 certification. Your data stays yours.',
  },
];

function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need.{' '}
            <span className="text-slate-500">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Built for people who want clarity, not complexity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works section
const steps = [
  {
    number: '01',
    title: 'Connect Your Accounts',
    description:
      'Securely link your banks, credit cards, investments, and subscriptions. Read-only access means we can never move your money.',
  },
  {
    number: '02',
    title: 'See the Full Picture',
    description:
      'Watch money flow from income to expenses in real-time. Understand patterns you never saw before.',
  },
  {
    number: '03',
    title: 'Get Smart Insights',
    description:
      'Our AI explains your finances in plain language and suggests optimizations tailored to your goals.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-slate-400">Three steps to financial clarity.</p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="flex flex-col md:flex-row items-start gap-6" padding="lg">
                <div className="text-5xl font-bold bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Integrations section
function IntegrationsSection() {
  const integrations = [
    'Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One',
    'Fidelity', 'Schwab', 'Vanguard', 'Robinhood', 'Coinbase',
    'Stripe', 'QuickBooks', 'Plaid', 'Gusto', 'Venmo'
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connects to everything you use
          </h2>
          <p className="text-xl text-slate-400">
            12,000+ financial institutions and growing
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {integrations.map((name) => (
            <div
              key={name}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Pricing section
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
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-400">
            Start free for 14 days. No credit card required.
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
            >
              <Card
                className={`h-full flex flex-col ${plan.popular ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : ''
                  }`}
                padding="lg"
              >
                {plan.popular && (
                  <div className="inline-flex self-start px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-money">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
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

// Final CTA section
function CTASection() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border border-indigo-500/20 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to see your money clearly?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of people who finally understand where their money goes.
              Start your free trial today.
            </p>
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Get Started — It&apos;s Free
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold">MoneyLoop</span>
            </div>
            <p className="text-slate-500 text-sm">
              Finally understand your money.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 MoneyLoop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              SOC 2 Type II Certified
            </span>
            <span>·</span>
            <span>256-bit Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Navigation
function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MoneyLoop</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Log In
          </Button>
          <Button size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}

// Main page component
export default function HomePage() {
  return (
    <>
      <AnimatedBackground />
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <IntegrationsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
