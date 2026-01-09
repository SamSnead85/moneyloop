'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook for keyboard accessibility - manages focus trap within a container
 */
export function useFocusTrap(isActive: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstFocusable?.focus();

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive]);

    return containerRef;
}

/**
 * Custom hook for escape key handling
 */
export function useEscapeKey(callback: () => void) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                callback();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [callback]);
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
    return (
        <a
            href={href}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
            {children}
        </a>
    );
}

/**
 * Visually hidden but screen reader accessible
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
    return (
        <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]">
            {children}
        </span>
    );
}

/**
 * Announce to screen readers (live region)
 */
export function Announcer({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
    return (
        <div
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
}

/**
 * Accessible icon button wrapper
 */
export function AccessibleIconButton({
    onClick,
    label,
    icon,
    className = '',
    disabled = false,
}: {
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c] ${className}`}
        >
            {icon}
        </button>
    );
}

/**
 * Keyboard-navigable list
 */
export function useKeyboardNavigation<T extends HTMLElement>(
    items: HTMLElement[],
    options: { orientation?: 'horizontal' | 'vertical'; loop?: boolean } = {}
) {
    const { orientation = 'vertical', loop = true } = options;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentIndex = items.findIndex(item => item === document.activeElement);
            if (currentIndex === -1) return;

            let nextIndex = currentIndex;
            const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
            const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

            if (e.key === prevKey) {
                e.preventDefault();
                nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = loop ? items.length - 1 : 0;
            } else if (e.key === nextKey) {
                e.preventDefault();
                nextIndex = currentIndex + 1;
                if (nextIndex >= items.length) nextIndex = loop ? 0 : items.length - 1;
            } else if (e.key === 'Home') {
                e.preventDefault();
                nextIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                nextIndex = items.length - 1;
            }

            items[nextIndex]?.focus();
        };

        items.forEach(item => item.addEventListener('keydown', handleKeyDown));
        return () => {
            items.forEach(item => item.removeEventListener('keydown', handleKeyDown));
        };
    }, [items, orientation, loop]);
}

export default { useFocusTrap, useEscapeKey, SkipLink, VisuallyHidden, Announcer, AccessibleIconButton };
