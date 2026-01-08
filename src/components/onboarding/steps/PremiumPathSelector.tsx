'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    ClipboardEdit,
    Shield,
    Clock,
    ArrowRight,
    Building2,
    User,
    CheckCircle2
} from 'lucide-react';
import { Surface, Text, Badge } from '@/components/primitives';
import { IllustrationConnect, IllustrationAnalysis } from '@/components/illustrations';
import type { OnboardingPath } from '../OnboardingWizard';

interface PremiumPathSelectorProps {
    onSelect: (path: OnboardingPath) => void;
    onSkip: () => void;
}

interface PathOption {
    id: OnboardingPath;
    title: string;
    description: string;
    icon: typeof Zap;
    features: string[];
    duration: string;
    recommended?: boolean;
}

const pathOptions: PathOption[] = [
    {
        id: 'ai_assisted',
        title: 'Instant Setup',
        description: 'Connect your accounts and we automatically import your financial data.',
        icon: Zap,
        features: [
            'Bank-level encrypted connection',
            'Automatic transaction categorization',
            'Real-time balance sync',
        ],
        duration: '2 min',
        recommended: true,
    },
    {
        id: 'manual',
        title: 'Manual Entry',
        description: 'Enter your financial information through a guided questionnaire.',
        icon: ClipboardEdit,
        features: [
            'Step-by-step guidance',
            'Upload statements (optional)',
            'Full control over data',
        ],
        duration: '5-8 min',
    },
];

export function PremiumPathSelector({ onSelect, onSkip }: PremiumPathSelectorProps) {
    const [hoveredPath, setHoveredPath] = useState<OnboardingPath | null>(null);

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <Text variant="caption" color="tertiary" className="mb-3">
                        STEP 1 OF 4
                    </Text>
                    <Text variant="display-lg" as="h1" className="mb-4">
                        Let&apos;s set up your
                        <br />
                        <span className="text-[var(--accent-primary)]">financial overview</span>
                    </Text>
                    <Text variant="body-lg" color="secondary" className="max-w-lg">
                        Choose how you&apos;d like to import your financial data. You can always add more accounts later.
                    </Text>
                </motion.div>

                {/* Path Options */}
                <div className="space-y-4 mb-12">
                    {pathOptions.map((path, index) => (
                        <motion.button
                            key={path.id}
                            onClick={() => onSelect(path.id)}
                            onMouseEnter={() => setHoveredPath(path.id)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className="w-full text-left group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Surface
                                elevation={hoveredPath === path.id ? 2 : 1}
                                variant="interactive"
                                className={`p-6 ${path.recommended
                                        ? 'ring-1 ring-[var(--accent-primary)]/30'
                                        : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                        ${path.recommended
                                            ? 'bg-[var(--accent-primary-muted)]'
                                            : 'bg-[var(--surface-elevated-2)]'
                                        }
                                    `}>
                                        <path.icon className={`w-6 h-6 ${path.recommended
                                                ? 'text-[var(--accent-primary)]'
                                                : 'text-[var(--text-secondary)]'
                                            }`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Text variant="heading-sm" as="h3">
                                                {path.title}
                                            </Text>
                                            {path.recommended && (
                                                <Badge variant="success" size="sm">
                                                    Recommended
                                                </Badge>
                                            )}
                                        </div>

                                        <Text variant="body-md" color="secondary" className="mb-4">
                                            {path.description}
                                        </Text>

                                        {/* Features */}
                                        <div className="space-y-1.5">
                                            {path.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-[var(--text-quaternary)]" />
                                                    <Text variant="body-sm" color="tertiary">
                                                        {feature}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration & Arrow */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-1.5 text-[var(--text-quaternary)]">
                                            <Clock className="w-4 h-4" />
                                            <Text variant="body-sm" color="tertiary">
                                                {path.duration}
                                            </Text>
                                        </div>
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            transition-all duration-200
                                            ${hoveredPath === path.id
                                                ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]'
                                                : 'bg-[var(--surface-elevated-2)] text-[var(--text-tertiary)]'
                                            }
                                        `}>
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Surface>
                        </motion.button>
                    ))}
                </div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-6 flex-wrap"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                        <Text variant="body-sm" color="tertiary">
                            Bank-level encryption
                        </Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--text-quaternary)]" />
                        <Text variant="body-sm" color="tertiary">
                            10,000+ institutions
                        </Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--text-quaternary)]" />
                        <Text variant="body-sm" color="tertiary">
                            Read-only access
                        </Text>
                    </div>
                </motion.div>

                {/* Skip Option */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <button
                        onClick={onSkip}
                        className="text-[var(--text-quaternary)] hover:text-[var(--text-secondary)] text-sm transition-colors"
                    >
                        Skip setup — explore the dashboard first
                    </button>
                </motion.div>
            </div>

            {/* Right Panel - Illustration (hidden on mobile) */}
            <div className="hidden lg:flex w-[45%] bg-[var(--surface-elevated)] items-center justify-center relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5" />

                {/* Animated illustration based on hover state */}
                <motion.div
                    key={hoveredPath || 'default'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 w-full max-w-md p-8"
                >
                    {hoveredPath === 'ai_assisted' ? (
                        <IllustrationConnect className="w-full h-auto" animate />
                    ) : hoveredPath === 'manual' ? (
                        <IllustrationAnalysis className="w-full h-auto" animate />
                    ) : (
                        <IllustrationConnect className="w-full h-auto" animate />
                    )}
                </motion.div>

                {/* Background grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(var(--border-subtle) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>
        </div>
    );
}

export default PremiumPathSelector;
