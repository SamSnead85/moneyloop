import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        const errorUrl = new URL('/auth', process.env.NEXT_PUBLIC_SITE_URL || 'https://moneyloop.ai');
        errorUrl.searchParams.set('error', error);
        if (errorDescription) {
            errorUrl.searchParams.set('error_description', errorDescription);
        }
        return NextResponse.redirect(errorUrl.toString());
    }

    // Use production URL if available, otherwise use origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moneyloop.ai';

    if (code) {
        const supabase = await createClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            // Successful authentication - redirect to dashboard
            return NextResponse.redirect(`${baseUrl}${next}`);
        }

        console.error('Session exchange error:', sessionError);
    }

    // Return to auth page on error
    return NextResponse.redirect(`${baseUrl}/auth?error=auth_callback_error`);
}

