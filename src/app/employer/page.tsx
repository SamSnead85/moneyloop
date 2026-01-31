'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Users,
    DollarSign,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Send,
    UserPlus,
    Banknote,
    ChevronRight,
    Clock,
    Building2,
    Zap,
    Shield,
    TrendingUp,
    Sparkles,
    Play,
    Star,
    ArrowRight,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { AddEmployeeModal } from '@/components/employer/AddEmployeeModal';
import { RunPayrollModal } from '@/components/employer/RunPayrollModal';

// ============================================================
// ULTRA-PREMIUM HERO SECTION
// ============================================================

// Canvas Particle Network
function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = 600;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            hue: number;
        }> = [];

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() > 0.5 ? 160 : 270,
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw and update particles
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.7 }}
        />
    );
}

// Animated Gradient Orbs
function AnimatedOrbs() {
    return (
        <>
            <motion.div
                className="absolute w-[700px] h-[700px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.03) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                    top: '-30%',
                    left: '-10%',
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                    top: '20%',
                    right: '-5%',
                }}
                animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 60%)',
                    filter: 'blur(100px)',
                    bottom: '10%',
                    left: '50%',
                }}
                animate={{
                    x: [0, 40, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
            />
        </>
    );
}

// Premium Hero Section
function PremiumHeroSection({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[520px] -mx-6 -mt-6 mb-8 overflow-hidden rounded-b-3xl"
        >
            {/* Multi-layer background */}
            <div className="absolute inset-0">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0a0a12] to-[#050510]" />

                {/* Hero image with overlay */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/employer-hero.png"
                        alt=""
                        fill
                        className="object-cover object-center opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/80 to-transparent" />
                </div>

                {/* Animated orbs */}
                <AnimatedOrbs />

                {/* Particle network */}
                <ParticleNetwork />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center px-8 md:px-12">
                <div className="max-w-2xl">
                    {/* Premium Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-cyan-500/10 border border-white/[0.08] backdrop-blur-xl mb-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                        <span className="text-sm font-medium text-white/70">Enterprise Payroll Platform</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
                    >
                        Your
                        <span className="relative mx-3">
                            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                                Command Center
                            </span>
                            <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-white/50 mb-8 max-w-lg"
                    >
                        Manage your team, run payroll, and handle compliance—all from one
                        <span className="text-emerald-400 font-medium"> powerful dashboard</span>.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <motion.button
                            onClick={onGetStarted}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/25 overflow-hidden"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-200%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            />
                            <Send className="w-4 h-4 relative" />
                            <span className="relative">Run Payroll</span>
                            <motion.span
                                className="relative"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </motion.span>
                        </motion.button>

                        <Link href="/employer/onboarding">
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-medium hover:border-white/[0.2] transition-all"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Employees
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center gap-6 mt-8"
                    >
                        {[
                            { icon: Shield, label: 'Bank-level security' },
                            { icon: Zap, label: 'Instant payroll' },
                            { icon: Star, label: '4.9★ rated' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                                <item.icon className="w-3.5 h-3.5 text-emerald-500/60" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}

// ============================================================
// DASHBOARD CONTENT
// ============================================================

// Types
interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    salary: number;
    status: 'active' | 'pending';
}

// Mock data
const mockEmployees: Employee[] = [
    { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Senior Engineer', department: 'Engineering', salary: 145000, status: 'active' },
    { id: '2', name: 'Marcus Johnson', email: 'marcus@company.com', role: 'Product Designer', department: 'Design', salary: 125000, status: 'active' },
    { id: '3', name: 'Emily Rodriguez', email: 'emily@company.com', role: 'Marketing Manager', department: 'Marketing', salary: 110000, status: 'active' },
    { id: '4', name: 'Alex Kim', email: 'alex@company.com', role: 'DevOps Engineer', department: 'Engineering', salary: 135000, status: 'active' },
    { id: '5', name: 'Jordan Taylor', email: 'jordan@company.com', role: 'Customer Success', department: 'Operations', salary: 75000, status: 'pending' },
];

const nextPayroll = {
    payPeriod: 'Jan 16 - Jan 31',
    payDate: 'Feb 1, 2026',
    daysUntil: 8,
    estimatedTotal: 24567.89,
    employeeCount: 5,
};

const lastPayroll = {
    payDate: 'Jan 17, 2026',
    totalNet: 16663.99,
    status: 'completed' as const,
};

export default function EmployerDashboard() {
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);

    const activeEmployees = mockEmployees.filter(e => e.status === 'active').length;
    const pendingOnboarding = mockEmployees.filter(e => e.status === 'pending').length;
    const monthlyPayroll = mockEmployees.reduce((sum, e) => sum + e.salary, 0) / 12;

    return (
        <div className="relative">
            {/* Modals */}
            <AnimatePresence>
                {showAddEmployeeModal && (
                    <AddEmployeeModal
                        isOpen={showAddEmployeeModal}
                        onClose={() => setShowAddEmployeeModal(false)}
                        onSubmit={(data) => console.log('New employee:', data)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRunPayrollModal && (
                    <RunPayrollModal
                        isOpen={showRunPayrollModal}
                        onClose={() => setShowRunPayrollModal(false)}
                        onComplete={() => console.log('Payroll completed')}
                    />
                )}
            </AnimatePresence>

            {/* Premium Hero */}
            <PremiumHeroSection onGetStarted={() => setShowRunPayrollModal(true)} />

            {/* Dashboard Content */}
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Key Metrics - Premium Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="group p-5 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-cyan-400" />
                                </div>
                                {pendingOnboarding > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-xs">
                                        {pendingOnboarding} pending
                                    </span>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{activeEmployees}</p>
                            <p className="text-sm text-white/40">Active Employees</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="group p-5 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                </div>
                                <TrendingUp className="w-4 h-4 text-emerald-400/50" />
                            </div>
                            <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                ${monthlyPayroll.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-sm text-white/40">Monthly Payroll</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="group p-5 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-violet-400" />
                                </div>
                                <span className="text-xs text-white/40">In {nextPayroll.daysUntil} days</span>
                            </div>
                            <p className="text-3xl font-bold text-white group-hover:text-violet-400 transition-colors">{nextPayroll.payDate.split(',')[0]}</p>
                            <p className="text-sm text-white/40">Next Pay Date</p>
                        </Card>
                    </motion.div>
                </div>

                {/* Next Payroll Banner - Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-6 bg-gradient-to-r from-emerald-500/5 via-emerald-500/[0.03] to-cyan-500/5 border-emerald-500/20 overflow-hidden relative">
                        {/* Animated glow */}
                        <motion.div
                            className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Banknote className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">Upcoming Payroll</h3>
                                    <p className="text-sm text-white/50">
                                        {nextPayroll.payPeriod} · {nextPayroll.employeeCount} employees
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">
                                        ${nextPayroll.estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-white/40">Estimated total</p>
                                </div>
                                <Button
                                    onClick={() => setShowRunPayrollModal(true)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                >
                                    Review & Run
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">Team</h3>
                                <Link href="/employer/team">
                                    <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                                        View All <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {mockEmployees.slice(0, 4).map((employee, i) => (
                                    <motion.div
                                        key={employee.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-sm font-medium text-white group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">
                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{employee.name}</p>
                                                <p className="text-xs text-white/40">{employee.role}</p>
                                            </div>
                                        </div>
                                        {employee.status === 'pending' ? (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-xs">
                                                Onboarding
                                            </span>
                                        ) : (
                                            <span className="text-xs text-white/30">{employee.department}</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-5 bg-white/[0.02] border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">Recent Activity</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {
                                        icon: CheckCircle2,
                                        iconColor: 'text-emerald-400',
                                        gradient: 'from-emerald-500/20 to-teal-500/20',
                                        title: 'Payroll completed',
                                        subtitle: `$${lastPayroll.totalNet.toLocaleString()} • ${lastPayroll.payDate}`,
                                    },
                                    {
                                        icon: UserPlus,
                                        iconColor: 'text-cyan-400',
                                        gradient: 'from-cyan-500/20 to-blue-500/20',
                                        title: 'Jordan Taylor invited',
                                        subtitle: 'Awaiting onboarding completion',
                                    },
                                    {
                                        icon: Building2,
                                        iconColor: 'text-violet-400',
                                        gradient: 'from-violet-500/20 to-purple-500/20',
                                        title: 'Q4 941 filed',
                                        subtitle: 'Accepted by IRS',
                                    },
                                ].map((activity, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center`}>
                                            <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">{activity.title}</p>
                                            <p className="text-xs text-white/40">{activity.subtitle}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Action Items */}
                {pendingOnboarding > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Card className="p-4 bg-amber-400/5 border-amber-400/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {pendingOnboarding} employee{pendingOnboarding > 1 ? 's' : ''} pending onboarding
                                        </p>
                                        <p className="text-xs text-white/50">Send a reminder or complete their setup</p>
                                    </div>
                                </div>
                                <Link href="/employer/team">
                                    <Button variant="ghost" size="sm" className="text-amber-400">
                                        View <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
