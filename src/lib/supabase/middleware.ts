import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/onboarding', '/settings'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth'];

// Admin bypass email for when Supabase has issues
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

export async function updateSession(request: NextRequest) {
    // === ADMIN BYPASS CHECK ===
    // Check for admin bypass cookie (set via client-side bypass login)
    const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');
    if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
        // Allow access without Supabase validation
        return NextResponse.next({ request });
    }
    // === END ADMIN BYPASS ===

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if the current route is an auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    // Protected routes - redirect to auth if not logged in
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        // Store the intended destination for redirect after login
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If logged in and trying to access auth page, redirect appropriately
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();

        // Check for a redirect parameter
        const redirect = request.nextUrl.searchParams.get('redirect');
        if (redirect && redirect.startsWith('/')) {
            url.pathname = redirect;
            url.searchParams.delete('redirect');
        } else {
            url.pathname = '/dashboard';
        }

        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
