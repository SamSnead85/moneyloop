'use client';

import { motion } from 'framer-motion';

// ===== ABSTRACT GEOMETRIC ILLUSTRATIONS =====
// Premium, institutional-grade visuals for onboarding and features
// Inspired by Linear, Stripe, Mercury aesthetic

interface IllustrationProps {
    className?: string;
    animate?: boolean;
}

// Financial Growth - Abstract ascending bars/lines
export function IllustrationGrowth({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 400 300"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="growthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Background grid */}
            <g opacity="0.1">
                {[0, 1, 2, 3, 4].map(i => (
                    <line key={`h${i}`} x1="40" y1={60 + i * 50} x2="360" y2={60 + i * 50} stroke="white" strokeWidth="1" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <line key={`v${i}`} x1={40 + i * 53} y1="60" x2={40 + i * 53} y2="260" stroke="white" strokeWidth="1" />
                ))}
            </g>

            {/* Area fill */}
            <motion.path
                d="M40 260 L93 220 L146 200 L199 180 L252 140 L305 100 L358 60 L360 260 Z"
                fill="url(#growthGradient)"
                initial={animate ? { opacity: 0 } : undefined}
                animate={animate ? { opacity: 1 } : undefined}
                transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Main trend line */}
            <motion.path
                d="M40 260 L93 220 L146 200 L199 180 L252 140 L305 100 L358 60"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Data points */}
            {[
                { x: 40, y: 260 },
                { x: 93, y: 220 },
                { x: 146, y: 200 },
                { x: 199, y: 180 },
                { x: 252, y: 140 },
                { x: 305, y: 100 },
                { x: 358, y: 60 },
            ].map((point, i) => (
                <motion.circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#09090b"
                    stroke="#10b981"
                    strokeWidth="2"
                    initial={animate ? { scale: 0, opacity: 0 } : undefined}
                    animate={animate ? { scale: 1, opacity: 1 } : undefined}
                    transition={{ duration: 0.3, delay: 0.2 * i }}
                />
            ))}

            {/* Glow on last point */}
            <motion.circle
                cx="358"
                cy="60"
                r="12"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                opacity="0.3"
                initial={animate ? { scale: 0 } : undefined}
                animate={animate ? { scale: [1, 1.5, 1] } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </svg>
    );
}

// Secure Connection - Abstract shield/lock
export function IllustrationSecurity({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
            </defs>

            {/* Outer ring pulse */}
            <motion.circle
                cx="100"
                cy="100"
                r="80"
                stroke="#10b981"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
                initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
                animate={animate ? { scale: [0.8, 1.1, 0.8], opacity: [0, 0.3, 0] } : undefined}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Shield shape */}
            <motion.path
                d="M100 30 L150 55 L150 100 C150 140 125 165 100 180 C75 165 50 140 50 100 L50 55 Z"
                fill="url(#shieldGradient)"
                stroke="#10b981"
                strokeWidth="2"
                initial={animate ? { scale: 0.9, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.5 }}
            />

            {/* Checkmark */}
            <motion.path
                d="M75 105 L90 120 L125 85"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.5 }}
            />

            {/* Corner accents */}
            <motion.path
                d="M25 25 L45 25 L45 35 M25 25 L25 45 L35 45"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
            />
            <motion.path
                d="M175 25 L155 25 L155 35 M175 25 L175 45 L165 45"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
            />
        </svg>
    );
}

// Data Analysis - Abstract flowing data streams
export function IllustrationAnalysis({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 300 200"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="streamGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="streamGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="streamGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Flowing data streams */}
            <motion.path
                d="M0 60 Q75 40 150 60 T300 60"
                stroke="url(#streamGradient1)"
                strokeWidth="2"
                fill="none"
                initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
                animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 1.5 }}
            />
            <motion.path
                d="M0 100 Q75 80 150 100 T300 100"
                stroke="url(#streamGradient2)"
                strokeWidth="2"
                fill="none"
                initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
                animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 1.5, delay: 0.2 }}
            />
            <motion.path
                d="M0 140 Q75 120 150 140 T300 140"
                stroke="url(#streamGradient3)"
                strokeWidth="2"
                fill="none"
                initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
                animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 1.5, delay: 0.4 }}
            />

            {/* Central node */}
            <motion.circle
                cx="150"
                cy="100"
                r="30"
                fill="#09090b"
                stroke="#10b981"
                strokeWidth="2"
                initial={animate ? { scale: 0 } : undefined}
                animate={animate ? { scale: 1 } : undefined}
                transition={{ duration: 0.5, delay: 1 }}
            />

            {/* AI brain icon in center */}
            <motion.path
                d="M140 95 C140 88 145 85 150 85 C155 85 160 88 160 95 C160 98 158 100 155 102 L155 110 M145 110 L155 110 M150 102 L150 110"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={animate ? { opacity: 0 } : undefined}
                animate={animate ? { opacity: 1 } : undefined}
                transition={{ delay: 1.3 }}
            />

            {/* Floating data particles */}
            {[
                { x: 50, y: 60, delay: 0 },
                { x: 80, y: 100, delay: 0.3 },
                { x: 110, y: 140, delay: 0.6 },
                { x: 190, y: 60, delay: 0.2 },
                { x: 220, y: 100, delay: 0.5 },
                { x: 250, y: 140, delay: 0.8 },
            ].map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#10b981"
                    initial={animate ? { scale: 0, opacity: 0 } : undefined}
                    animate={animate ? {
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [p.x, 150, 150]
                    } : undefined}
                    transition={{
                        duration: 2,
                        delay: p.delay,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                />
            ))}
        </svg>
    );
}

// Wallet/Account Connection
export function IllustrationConnect({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 240 160"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {/* Left card */}
            <motion.g
                initial={animate ? { x: -20, opacity: 0 } : undefined}
                animate={animate ? { x: 0, opacity: 1 } : undefined}
                transition={{ duration: 0.5 }}
            >
                <rect x="20" y="40" width="80" height="50" rx="8" fill="url(#cardGradient)" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
                <rect x="30" y="50" width="20" height="14" rx="2" fill="#10b981" opacity="0.6" />
                <line x1="30" y1="75" x2="60" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                <line x1="65" y1="75" x2="85" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            </motion.g>

            {/* Right card */}
            <motion.g
                initial={animate ? { x: 20, opacity: 0 } : undefined}
                animate={animate ? { x: 0, opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <rect x="140" y="40" width="80" height="50" rx="8" fill="url(#cardGradient)" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
                <rect x="150" y="50" width="20" height="14" rx="2" fill="#8b5cf6" opacity="0.6" />
                <line x1="150" y1="75" x2="180" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                <line x1="185" y1="75" x2="205" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
            </motion.g>

            {/* Connection line */}
            <motion.path
                d="M100 65 L140 65"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.4 }}
            />

            {/* Center connection node */}
            <motion.circle
                cx="120"
                cy="65"
                r="10"
                fill="#09090b"
                stroke="#10b981"
                strokeWidth="2"
                initial={animate ? { scale: 0 } : undefined}
                animate={animate ? { scale: 1 } : undefined}
                transition={{ duration: 0.3, delay: 0.6 }}
            />
            <motion.path
                d="M116 65 L119 68 L124 63"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.3, delay: 0.8 }}
            />

            {/* Bottom text placeholder lines */}
            <motion.g
                initial={animate ? { opacity: 0, y: 10 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 1 }}
            >
                <rect x="70" y="115" width="100" height="4" rx="2" fill="white" opacity="0.1" />
                <rect x="90" y="125" width="60" height="3" rx="1.5" fill="white" opacity="0.05" />
            </motion.g>
        </svg>
    );
}

// Success/Completion
export function IllustrationSuccess({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="successRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* Outer rings */}
            <motion.circle
                cx="100"
                cy="100"
                r="90"
                stroke="url(#successRing)"
                strokeWidth="1"
                fill="none"
                initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.5 }}
            />
            <motion.circle
                cx="100"
                cy="100"
                r="75"
                stroke="#10b981"
                strokeWidth="1"
                strokeOpacity="0.2"
                fill="none"
                initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.1 }}
            />

            {/* Main circle */}
            <motion.circle
                cx="100"
                cy="100"
                r="55"
                fill="#10b981"
                fillOpacity="0.1"
                stroke="#10b981"
                strokeWidth="2"
                initial={animate ? { scale: 0 } : undefined}
                animate={animate ? { scale: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            />

            {/* Checkmark */}
            <motion.path
                d="M70 100 L90 120 L130 80"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.5 }}
            />

            {/* Sparkle particles */}
            {[
                { x: 50, y: 50, delay: 0.7 },
                { x: 150, y: 50, delay: 0.8 },
                { x: 50, y: 150, delay: 0.9 },
                { x: 150, y: 150, delay: 1.0 },
            ].map((p, i) => (
                <motion.g key={i}>
                    <motion.line
                        x1={p.x - 5} y1={p.y}
                        x2={p.x + 5} y2={p.y}
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={animate ? { scale: 0, opacity: 0 } : undefined}
                        animate={animate ? { scale: 1, opacity: [0, 1, 0] } : undefined}
                        transition={{ duration: 0.5, delay: p.delay }}
                    />
                    <motion.line
                        x1={p.x} y1={p.y - 5}
                        x2={p.x} y2={p.y + 5}
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={animate ? { scale: 0, opacity: 0 } : undefined}
                        animate={animate ? { scale: 1, opacity: [0, 1, 0] } : undefined}
                        transition={{ duration: 0.5, delay: p.delay }}
                    />
                </motion.g>
            ))}
        </svg>
    );
}

// Dashboard Preview
export function IllustrationDashboard({ className, animate = true }: IllustrationProps) {
    return (
        <svg
            viewBox="0 0 320 200"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Window frame */}
            <motion.rect
                x="20"
                y="20"
                width="280"
                height="160"
                rx="12"
                fill="#0f0f12"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="1"
                initial={animate ? { opacity: 0, y: 20 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5 }}
            />

            {/* Window dots */}
            <circle cx="40" cy="35" r="4" fill="#ef4444" opacity="0.6" />
            <circle cx="55" cy="35" r="4" fill="#f59e0b" opacity="0.6" />
            <circle cx="70" cy="35" r="4" fill="#10b981" opacity="0.6" />

            {/* Sidebar */}
            <motion.rect
                x="30"
                y="50"
                width="60"
                height="120"
                rx="6"
                fill="white"
                fillOpacity="0.02"
                initial={animate ? { opacity: 0, x: -10 } : undefined}
                animate={animate ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.3, delay: 0.3 }}
            />
            {[0, 1, 2, 3].map(i => (
                <motion.rect
                    key={i}
                    x="40"
                    y={65 + i * 25}
                    width="40"
                    height="8"
                    rx="2"
                    fill={i === 0 ? "#10b981" : "white"}
                    fillOpacity={i === 0 ? 0.4 : 0.1}
                    initial={animate ? { opacity: 0, x: -5 } : undefined}
                    animate={animate ? { opacity: 1, x: 0 } : undefined}
                    transition={{ delay: 0.4 + i * 0.1 }}
                />
            ))}

            {/* Main content area - stat cards */}
            {[0, 1, 2].map(i => (
                <motion.rect
                    key={i}
                    x={105 + i * 60}
                    y="55"
                    width="55"
                    height="40"
                    rx="6"
                    fill="white"
                    fillOpacity="0.03"
                    stroke="white"
                    strokeOpacity="0.06"
                    initial={animate ? { opacity: 0, y: 10 } : undefined}
                    animate={animate ? { opacity: 1, y: 0 } : undefined}
                    transition={{ delay: 0.5 + i * 0.1 }}
                />
            ))}

            {/* Chart area */}
            <motion.rect
                x="105"
                y="105"
                width="120"
                height="60"
                rx="6"
                fill="white"
                fillOpacity="0.03"
                stroke="white"
                strokeOpacity="0.06"
                initial={animate ? { opacity: 0, y: 10 } : undefined}
                animate={animate ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.8 }}
            />

            {/* Mini chart line */}
            <motion.path
                d="M115 150 L135 140 L155 145 L175 125 L195 130 L215 115"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.8, delay: 1 }}
            />

            {/* Right sidebar */}
            <motion.rect
                x="235"
                y="105"
                width="55"
                height="60"
                rx="6"
                fill="white"
                fillOpacity="0.03"
                stroke="white"
                strokeOpacity="0.06"
                initial={animate ? { opacity: 0, x: 10 } : undefined}
                animate={animate ? { opacity: 1, x: 0 } : undefined}
                transition={{ delay: 0.9 }}
            />
        </svg>
    );
}

// Export all illustrations
export const Illustrations = {
    Growth: IllustrationGrowth,
    Security: IllustrationSecurity,
    Analysis: IllustrationAnalysis,
    Connect: IllustrationConnect,
    Success: IllustrationSuccess,
    Dashboard: IllustrationDashboard,
};

export default Illustrations;
