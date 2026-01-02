'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    icon?: ReactNode;
    loading?: boolean;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    loading,
    className = '',
    disabled,
    onClick,
    type = 'button',
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary:
            'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5',
        secondary:
            'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-sm rounded-xl',
        lg: 'px-8 py-4 text-base rounded-xl',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
        >
            {loading ? (
                <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : icon ? (
                icon
            ) : null}
            {children}
        </motion.button>
    );
}
