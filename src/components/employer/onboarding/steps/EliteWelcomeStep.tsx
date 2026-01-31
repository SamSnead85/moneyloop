'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Building2,
    Users,
    DollarSign,
    Shield,
    Zap,
    ChevronRight,
    Star,
    TrendingUp,
    Sparkles,
    Play,
    ArrowRight,
} from 'lucide-react';

interface EliteWelcomeStepProps {
    onNext: () => void;
}

// Premium Animated Background with Multiple Layers
function UltraPremiumBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Particle system
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            hue: number;
        }> = [];

        // Create particles
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() > 0.5 ? 160 : 270, // Emerald or Violet
            });
        }

        // Connection lines
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(52, 211, 153, ${0.1 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw and update particles
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
                ctx.fill();
            });

            drawConnections();
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
            style={{ opacity: 0.6 }}
        />
    );
}

// Animated Gradient Orbs
function AnimatedOrbs() {
    return (
        <>
            {/* Primary orb - Emerald */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                    top: '-20%',
                    left: '-10%',
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary orb - Violet */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
                    filter: 'blur(80px)',
                    top: '30%',
                    right: '-15%',
                }}
                animate={{
                    x: [0, -40, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />

            {/* Tertiary orb - Cyan accent */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 60%)',
                    filter: 'blur(100px)',
                    bottom: '-10%',
                    left: '40%',
                }}
                animate={{
                    x: [0, 60, 0],
                    y: [0, -40, 0],
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

// Pulsing Rings
function PulsingRings() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-emerald-500/10"
                    style={{
                        width: `${300 + i * 150}px`,
                        height: `${300 + i * 150}px`,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.5,
                    }}
                />
            ))}
        </div>
    );
}

// Feature card with premium styling
const features = [
    {
        icon: Users,
        title: 'Intelligent Team Management',
        description: 'AI-powered onboarding, performance tracking, and workforce analytics',
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/30',
    },
    {
        icon: DollarSign,
        title: 'Automated Payroll Engine',
        description: 'Run payroll in seconds with smart tax calculations and compliance',
        gradient: 'from-violet-500 to-purple-600',
        glow: 'shadow-violet-500/30',
    },
    {
        icon: Shield,
        title: 'Enterprise Compliance',
        description: 'Automatic Form 941, W-2, 1099 filing with audit-ready reporting',
        gradient: 'from-cyan-500 to-blue-600',
        glow: 'shadow-cyan-500/30',
    },
];

// Premium Stats
const stats = [
    { value: '50K+', label: 'Businesses', icon: Building2 },
    { value: '$2.8B', label: 'Processed', icon: DollarSign },
    { value: '99.99%', label: 'Uptime', icon: Zap },
    { value: '4.9★', label: 'Rating', icon: Star },
];

export function EliteWelcomeStep({ onNext }: EliteWelcomeStepProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-center"
        >
            {/* Multi-layer Premium Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#080810] to-[#050508]" />

                {/* Animated orbs */}
                <AnimatedOrbs />

                {/* Canvas particle network */}
                <UltraPremiumBackground />

                {/* Pulsing rings */}
                <PulsingRings />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                    }}
                />

                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    }}
                />

                {/* Radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                {/* Premium Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-cyan-500/10 border border-white/[0.08] backdrop-blur-xl mb-8"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    <span className="text-sm font-medium bg-gradient-to-r from-emerald-300 via-white to-violet-300 bg-clip-text text-transparent">
                        Enterprise-Grade Payroll Platform
                    </span>
                </motion.div>

                {/* Hero Icon with Glow */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
                    className="relative inline-block mb-8"
                >
                    {/* Multi-layer glow */}
                    <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-500 blur-3xl opacity-40" />
                    <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-500 blur-xl opacity-60" />

                    {/* Icon container */}
                    <motion.div
                        className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-500 to-violet-600 flex items-center justify-center shadow-2xl"
                        animate={{
                            boxShadow: isHovered
                                ? '0 0 60px rgba(52,211,153,0.4), 0 0 100px rgba(139,92,246,0.3)'
                                : '0 0 40px rgba(52,211,153,0.3), 0 0 60px rgba(139,92,246,0.2)'
                        }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                    >
                        <Building2 className="w-14 h-14 text-white" />

                        {/* Animated ring */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl border-2 border-white/20"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>

                    {/* Floating sparkles */}
                    <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                    </motion.div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                >
                    <span className="text-white">Welcome to </span>
                    <span className="relative">
                        <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent">
                            Employer Hub
                        </span>
                        {/* Underline glow */}
                        <motion.div
                            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        />
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                    Set up your business in minutes. Manage payroll, benefits,
                    and your team with <span className="text-emerald-400 font-medium">enterprise-grade</span> precision.
                </motion.p>

                {/* Feature Cards - Premium Glass Design */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl overflow-hidden cursor-pointer`}
                        >
                            {/* Hover gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />

                            {/* Top accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Icon */}
                            <motion.div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-xl ${feature.glow}`}
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <feature.icon className="w-7 h-7 text-white" />
                            </motion.div>

                            <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text transition-all">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">
                                {feature.description}
                            </p>

                            {/* Corner accent */}
                            <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${feature.gradient} opacity-0 group-hover:opacity-5 blur-2xl transition-all duration-500`} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats Bar - Ultra Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12 py-6 px-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="text-center group cursor-default"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <stat.icon className="w-4 h-4 text-emerald-500/70" />
                                <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                    {stat.value}
                                </span>
                            </div>
                            <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button - Maximum Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-col items-center"
                >
                    <motion.button
                        onClick={onNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white font-semibold text-xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/50 overflow-hidden"
                    >
                        {/* Animated shine */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />

                        {/* Button content */}
                        <span className="relative flex items-center gap-3">
                            <Play className="w-5 h-5 fill-white" />
                            Get Started
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </motion.span>
                        </span>
                    </motion.button>

                    {/* Sub-text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="mt-4 text-sm text-white/30 flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Setup takes about 5 minutes • No credit card required
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    );
}
