'use client';

import { forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

// ===== SURFACE COMPONENT =====
// Elevated surfaces with consistent styling

interface SurfaceProps {
    elevation?: 0 | 1 | 2;
    variant?: 'default' | 'interactive' | 'glass';
    className?: string;
    children?: React.ReactNode;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps & ComponentPropsWithoutRef<'div'>>(
    ({ elevation = 1, variant = 'default', className, children, ...props }, ref) => {
        const baseStyles = 'rounded-xl border transition-colors';

        const elevationStyles = {
            0: 'bg-[var(--surface-base)] border-[var(--border-subtle)]',
            1: 'bg-[var(--surface-elevated)] border-[var(--border-default)]',
            2: 'bg-[var(--surface-elevated-2)] border-[var(--border-emphasis)]',
        };

        const variantStyles = {
            default: '',
            interactive: 'hover:bg-[var(--surface-hover)] hover:border-[var(--border-emphasis)] cursor-pointer',
            glass: 'bg-[rgba(15,15,18,0.8)] backdrop-blur-xl border-[var(--border-subtle)]',
        };

        return (
            <div
                ref={ref}
                className={cn(baseStyles, elevationStyles[elevation], variantStyles[variant], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Surface.displayName = 'Surface';

// ===== TYPOGRAPHY COMPONENTS =====

type TextVariant =
    | 'display-xl'
    | 'display-lg'
    | 'heading-lg'
    | 'heading-md'
    | 'heading-sm'
    | 'body-lg'
    | 'body-md'
    | 'body-sm'
    | 'caption'
    | 'mono-xl'
    | 'mono-lg'
    | 'mono-md'
    | 'mono-sm';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warning' | 'danger' | 'inherit';

interface TextProps {
    variant?: TextVariant;
    color?: TextColor;
    as?: ElementType;
    className?: string;
    children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
    'display-xl': 'text-5xl font-bold tracking-tight leading-none',
    'display-lg': 'text-4xl font-semibold tracking-tight leading-tight',
    'heading-lg': 'text-2xl font-semibold leading-snug',
    'heading-md': 'text-xl font-semibold leading-snug',
    'heading-sm': 'text-lg font-medium leading-snug',
    'body-lg': 'text-base font-normal leading-relaxed',
    'body-md': 'text-sm font-normal leading-relaxed',
    'body-sm': 'text-xs font-normal leading-relaxed',
    'caption': 'text-xs font-medium uppercase tracking-wide',
    'mono-xl': 'text-3xl font-medium font-mono tabular-nums',
    'mono-lg': 'text-2xl font-medium font-mono tabular-nums',
    'mono-md': 'text-base font-medium font-mono tabular-nums',
    'mono-sm': 'text-sm font-medium font-mono tabular-nums',
};

const colorStyles: Record<TextColor, string> = {
    primary: 'text-[var(--text-primary)]',
    secondary: 'text-[var(--text-secondary)]',
    tertiary: 'text-[var(--text-tertiary)]',
    accent: 'text-[var(--accent-primary)]',
    warning: 'text-[var(--accent-warning)]',
    danger: 'text-[var(--accent-danger)]',
    inherit: 'text-inherit',
};

export function Text({
    variant = 'body-md',
    color = 'primary',
    as: Component = 'span',
    className,
    children,
    ...props
}: TextProps & ComponentPropsWithoutRef<'span'>) {
    return (
        <Component
            className={cn(variantStyles[variant], colorStyles[color], className)}
            {...props}
        >
            {children}
        </Component>
    );
}

// Convenience components
export function Heading({
    level = 2,
    ...props
}: TextProps & { level?: 1 | 2 | 3 | 4 }) {
    const tags: Record<number, ElementType> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' };
    const variants: Record<number, TextVariant> = {
        1: 'display-lg',
        2: 'heading-lg',
        3: 'heading-md',
        4: 'heading-sm'
    };
    return <Text as={tags[level]} variant={props.variant || variants[level]} {...props} />;
}

export function Label({ className, ...props }: TextProps) {
    return <Text variant="caption" color="tertiary" className={cn('mb-1.5 block', className)} {...props} />;
}

export function MoneyAmount({
    value,
    size = 'md',
    showSign = false,
    className
}: {
    value: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showSign?: boolean;
    className?: string;
}) {
    const isPositive = value >= 0;
    const sizeVariants: Record<string, TextVariant> = {
        sm: 'mono-sm',
        md: 'mono-md',
        lg: 'mono-lg',
        xl: 'mono-xl',
    };

    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(value));

    return (
        <Text
            variant={sizeVariants[size]}
            color={isPositive ? 'accent' : 'danger'}
            className={className}
        >
            {showSign && (isPositive ? '+' : '-')}
            {formatted}
        </Text>
    );
}

// ===== DIVIDER COMPONENT =====

interface DividerProps {
    variant?: 'subtle' | 'default' | 'gradient';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export function Divider({
    variant = 'default',
    orientation = 'horizontal',
    className
}: DividerProps) {
    const isHorizontal = orientation === 'horizontal';

    const baseStyles = isHorizontal ? 'w-full h-px' : 'h-full w-px';

    const variantStyles = {
        subtle: 'bg-[var(--border-subtle)]',
        default: 'bg-[var(--border-default)]',
        gradient: 'bg-gradient-to-r from-transparent via-[var(--border-emphasis)] to-transparent',
    };

    return <div className={cn(baseStyles, variantStyles[variant], className)} />;
}

// ===== BADGE COMPONENT =====

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
    size?: 'sm' | 'md';
    children?: React.ReactNode;
    className?: string;
}

export function Badge({
    variant = 'default',
    size = 'md',
    children,
    className
}: BadgeProps) {
    const sizeStyles = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
    };

    const variantStyles = {
        default: 'bg-[var(--surface-elevated-2)] text-[var(--text-secondary)] border-[var(--border-default)]',
        success: 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] border-[var(--accent-primary-muted)]',
        warning: 'bg-[var(--accent-warning-subtle)] text-[var(--accent-warning)] border-[var(--accent-warning-muted)]',
        danger: 'bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)] border-[var(--accent-danger-muted)]',
        info: 'bg-[var(--accent-tertiary-subtle)] text-[var(--accent-tertiary)] border-[var(--accent-tertiary-muted)]',
        premium: 'bg-[var(--accent-gold-muted)] text-[var(--accent-gold)] border-[var(--accent-gold-muted)]',
    };

    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-md font-medium border',
            sizeStyles[size],
            variantStyles[variant],
            className
        )}>
            {children}
        </span>
    );
}

// ===== SKELETON COMPONENT =====

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function Skeleton({
    variant = 'rectangular',
    width,
    height,
    className
}: SkeletonProps) {
    const variantStyles = {
        text: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={cn(
                'shimmer',
                variantStyles[variant],
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
}

// ===== AVATAR COMPONENT =====

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
    const sizeStyles = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'Avatar'}
                className={cn(
                    'rounded-full object-cover',
                    sizeStyles[size],
                    className
                )}
            />
        );
    }

    return (
        <div className={cn(
            'rounded-full flex items-center justify-center font-semibold',
            'bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]',
            sizeStyles[size],
            className
        )}>
            {name ? getInitials(name) : '?'}
        </div>
    );
}

// ===== PROGRESS COMPONENT =====

interface ProgressProps {
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function Progress({
    value,
    max = 100,
    variant = 'default',
    size = 'md',
    showLabel = false,
    className
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeStyles = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    const variantStyles = {
        default: 'bg-[var(--accent-primary)]',
        success: 'bg-[var(--accent-primary)]',
        warning: 'bg-[var(--accent-warning)]',
        danger: 'bg-[var(--accent-danger)]',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className={cn(
                'w-full rounded-full bg-[var(--surface-elevated-2)] overflow-hidden',
                sizeStyles[size]
            )}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variantStyles[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <Text variant="body-sm" color="secondary" className="mt-1">
                    {Math.round(percentage)}%
                </Text>
            )}
        </div>
    );
}

// Export all
export default {
    Surface,
    Text,
    Heading,
    Label,
    MoneyAmount,
    Divider,
    Badge,
    Skeleton,
    Avatar,
    Progress,
};
