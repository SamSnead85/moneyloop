'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import {
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    Shield,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    KeyRound,
    ArrowLeft
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

// User-friendly error messages - order matters! More specific matches first
const getErrorMessage = (error: string): string => {
    // Exact matches first (case-insensitive)
    const lowerError = error.toLowerCase();

    // Invalid credentials (most common)
    if (lowerError.includes('invalid login credentials') ||
        lowerError.includes('invalid password') ||
        lowerError.includes('invalid email') ||
        lowerError.includes('invalid credentials')) {
        return 'Incorrect email or password. Please try again.';
    }

    // User not found
    if (lowerError.includes('user not found') ||
        lowerError.includes('no user found')) {
        return 'No account found with this email. Please sign up first.';
    }

    // Email not confirmed
    if (lowerError.includes('email not confirmed') ||
        lowerError.includes('email confirmation')) {
        return 'Please verify your email before signing in. Check your inbox.';
    }

    // User already exists
    if (lowerError.includes('user already registered') ||
        lowerError.includes('already exists')) {
        return 'An account with this email already exists. Try signing in instead.';
    }

    // Password requirements
    if (lowerError.includes('password') && lowerError.includes('6 characters')) {
        return 'Password must be at least 6 characters long.';
    }

    // Rate limiting
    if (lowerError.includes('too many requests') ||
        lowerError.includes('rate limit')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }

    // Provider errors (Google/Apple OAuth)
    if (lowerError.includes('provider not enabled')) {
        return 'This sign-in method is not currently available. Please use email sign-in.';
    }

    // API key issues (actual service error)
    if (lowerError.includes('invalid api key') ||
        lowerError.includes('api key')) {
        return 'Authentication service error. Please try again later.';
    }

    // Network/service errors
    if (lowerError.includes('network') ||
        lowerError.includes('fetch') ||
        lowerError.includes('timeout')) {
        return 'Network error. Please check your connection and try again.';
    }

    // Generic auth error
    if (lowerError.includes('authapierror')) {
        return 'Authentication error. Please try again.';
    }

    // Return original if no match (but clean it up)
    return error.length > 100 ? 'An error occurred. Please try again.' : error;
};

// Wrapper component to export as default
export default function AuthPage() {
    return (
        <Suspense fallback={<AuthPageLoading />}>
            <AuthPageContent />
        </Suspense>
    );
}

function AuthPageLoading() {
    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
    );
}

function AuthPageContent() {
    const searchParams = useSearchParams();
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check for OAuth errors in URL params
    useEffect(() => {
        const errorParam = searchParams.get('error');
        const errorDesc = searchParams.get('error_description');
        if (errorParam) {
            setError(getErrorMessage(errorDesc || errorParam));
        }
    }, [searchParams]);

    // Lazily create Supabase client only on client-side
    const supabase = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return createClient();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // === ADMIN BYPASS LOGIN ===
        // Direct login for admin account when Supabase has issues
        if (authMode === 'signin' &&
            email.toLowerCase() === 'sam.sweilem85@gmail.com' &&
            password === 'Winter2022$') {
            // Set a bypass session flag and redirect
            if (typeof window !== 'undefined') {
                // Set localStorage for client-side checks
                localStorage.setItem('moneyloop_admin_session', JSON.stringify({
                    user: {
                        id: 'admin-bypass-user',
                        email: 'sam.sweilem85@gmail.com',
                        name: 'Sam Sweilem',
                    },
                    expires: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
                }));
                // Set cookie for server-side middleware check
                document.cookie = `moneyloop_admin_bypass=sam.sweilem85@gmail.com; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
                window.location.href = '/dashboard';
            }
            return;
        }
        // === END ADMIN BYPASS ===

        if (!supabase) {
            setError('Authentication service not available. Please refresh and try again.');
            return;
        }

        try {
            if (authMode === 'forgot') {
                // Password reset request
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth?mode=reset`,
                });
                if (error) throw error;
                setSuccess('Password reset link sent! Check your email inbox.');
                return;
            }

            if (authMode === 'signup') {
                // Validate passwords match
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setSuccess('Account created! Check your email for a confirmation link.');
            } else {
                // Sign in
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Redirect to dashboard
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            // Log actual error for debugging
            console.error('[Auth Error]', err.message, err);
            setError(getErrorMessage(err.message || 'An error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!supabase) {
            setError('Authentication service not available');
            return;
        }
        setGoogleLoading(true);
        setError(null);

        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${siteUrl}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setError(getErrorMessage(err.message || 'Google sign-in failed'));
            setGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        if (!supabase) {
            setError('Authentication service not available');
            return;
        }
        setAppleLoading(true);
        setError(null);

        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${siteUrl}/auth/callback`,
                },
            });
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setError(getErrorMessage(err.message || 'Apple sign-in failed'));
            setAppleLoading(false);
        }
    };

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setError(null);
        setSuccess(null);
    };

    const isAnyLoading = loading || googleLoading || appleLoading;

    return (
        <div className="min-h-screen bg-[#050508] flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(30, 30, 50, 0.4) 0%, transparent 70%)',
                            filter: 'blur(100px)',
                        }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                            filter: 'blur(80px)',
                        }}
                    />
                </div>
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-xl">M</span>
                        </div>
                        <span className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MoneyLoop</span>
                    </Link>

                    <h1 className="text-5xl font-bold mb-4 leading-tight">
                        Your complete
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">wealth picture.</span>
                    </h1>

                    <p className="text-white/50 mb-12 max-w-md text-lg">
                        Track every asset, see all income streams, and build wealth with AI-powered insights.
                    </p>

                    <div className="space-y-4">
                        {[
                            { text: 'Bank-level 256-bit encryption', icon: '🔐' },
                            { text: 'Read-only bank connections', icon: '🏦' },
                            { text: 'Your data is never sold or shared', icon: '🛡️' },
                            { text: 'AI-powered financial insights', icon: '🤖' },
                        ].map((item) => (
                            <motion.div
                                key={item.text}
                                className="flex items-center gap-3 text-white/60"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-sm">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold">M</span>
                            </div>
                            <span className="text-xl font-semibold">MoneyLoop</span>
                        </Link>
                    </div>

                    <Card padding="lg" hover={false} className="bg-white/[0.02] backdrop-blur-sm border-white/10">
                        {/* Back button for forgot password */}
                        {authMode === 'forgot' && (
                            <button
                                onClick={() => switchMode('signin')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to sign in
                            </button>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={authMode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold mb-2 text-center">
                                    {authMode === 'signin' && 'Welcome back'}
                                    {authMode === 'signup' && 'Create your account'}
                                    {authMode === 'forgot' && 'Reset password'}
                                </h2>
                                <p className="text-white/40 text-center mb-6">
                                    {authMode === 'signin' && 'Sign in to continue to your dashboard'}
                                    {authMode === 'signup' && 'Start tracking your wealth for free'}
                                    {authMode === 'forgot' && "Enter your email and we'll send a reset link"}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p>{error}</p>
                                        {error.includes('email sign-in') && (
                                            <p className="mt-2 text-red-400/80">
                                                Try signing in with your email and password below.
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Message */}
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* OAuth Buttons - Only show for signin/signup */}
                        {(authMode === 'signin' || authMode === 'signup') && (
                            <>
                                <div className="space-y-3 mb-6">
                                    {/* Google Sign In */}
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={isAnyLoading}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {googleLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        )}
                                        <span className="font-medium">Continue with Google</span>
                                    </button>

                                    {/* Apple Sign In */}
                                    <button
                                        onClick={handleAppleSignIn}
                                        disabled={isAnyLoading}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {appleLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                            </svg>
                                        )}
                                        <span className="font-medium">Continue with Apple</span>
                                    </button>
                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/[0.08]" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-4 bg-[#0d0d12] text-white/40">or continue with email</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2 font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="you@example.com"
                                        required
                                        disabled={isAnyLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Field - Not shown for forgot password */}
                            {authMode !== 'forgot' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm text-white/60 font-medium">Password</label>
                                        {authMode === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={() => switchMode('forgot')}
                                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            disabled={isAnyLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password - Only for signup */}
                            {authMode === 'signup' && (
                                <div>
                                    <label className="block text-sm text-white/60 mb-2 font-medium">Confirm Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            disabled={isAnyLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Remember Me - Only for signin */}
                            {authMode === 'signin' && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </button>
                                    <label className="text-sm text-white/60">Remember me for 30 days</label>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isAnyLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3.5 font-semibold shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {authMode === 'signin' && 'Sign In'}
                                        {authMode === 'signup' && 'Create Account'}
                                        {authMode === 'forgot' && 'Send Reset Link'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Mode Toggle */}
                        <p className="text-center text-sm text-white/40 mt-6">
                            {authMode === 'signin' && (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button
                                        onClick={() => switchMode('signup')}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </>
                            )}
                            {authMode === 'signup' && (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => switchMode('signin')}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </Card>

                    {/* Terms */}
                    <p className="text-center text-xs text-white/30 mt-6">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-white/60 transition-colors">Terms</Link> and{' '}
                        <Link href="/privacy" className="underline hover:text-white/60 transition-colors">Privacy Policy</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
