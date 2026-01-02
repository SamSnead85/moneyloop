'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    variant?: 'glass' | 'elevated' | 'bordered';
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'none';
    className?: string;
}

export function Card({
    children,
    variant = 'glass',
    hover = true,
    padding = 'md',
    className = '',
}: CardProps) {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variants = {
        glass:
            'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl',
        elevated: 'bg-[#12121a] border border-white/5 shadow-xl',
        bordered: 'bg-transparent border border-white/10',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover
        ? 'hover:bg-gradient-to-br hover:from-white/8 hover:to-white/[0.04] hover:border-white/15 hover:shadow-lg hover:-translate-y-0.5'
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
        >
            {children}
        </motion.div>
    );
}
