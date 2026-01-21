'use client';

/**
 * Global Error Boundary Component
 * 
 * Catches React errors and provides graceful fallback UI.
 * Includes error reporting and recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // Report to analytics (production would use actual service)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            console.log('Would report error to monitoring service');
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-[var(--text-secondary)] mb-6">
                            We encountered an unexpected error. This has been reported to our team.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-[var(--text-tertiary)] cursor-pointer mb-2">
                                    Error Details
                                </summary>
                                <pre className="text-xs bg-[var(--surface-secondary)] p-4 rounded-lg overflow-auto max-h-40 text-red-400">
                                    {this.state.error.message}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </button>
                        </div>

                        <button
                            onClick={() => window.open('mailto:support@moneyloop.ai', '_blank')}
                            className="mt-4 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] flex items-center justify-center gap-1"
                        >
                            <MessageCircle className="w-3 h-3" />
                            Contact Support
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Async Error Boundary for Server Components
 */
export function AsyncErrorBoundary({
    children,
    fallback,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <ErrorBoundary fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
}

/**
 * API Error Handler
 */
export class APIError extends Error {
    status: number;
    code?: string;
    details?: Record<string, unknown>;

    constructor(
        message: string,
        status: number = 500,
        code?: string,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.code = code;
        this.details = details;
    }

    toJSON() {
        return {
            error: this.message,
            status: this.status,
            code: this.code,
            details: this.details,
        };
    }
}

/**
 * Create API error response
 */
export function createErrorResponse(error: unknown): Response {
    if (error instanceof APIError) {
        return Response.json(error.toJSON(), { status: error.status });
    }

    if (error instanceof Error) {
        return Response.json(
            { error: error.message, status: 500 },
            { status: 500 }
        );
    }

    return Response.json(
        { error: 'An unexpected error occurred', status: 500 },
        { status: 500 }
    );
}

/**
 * Retry utility with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        baseDelay?: number;
        maxDelay?: number;
        onRetry?: (error: Error, attempt: number) => void;
    } = {}
): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            onRetry?.(lastError, attempt + 1);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

export default ErrorBoundary;
