import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Use production URL if available, otherwise use origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moneyloop.ai';

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        const errorUrl = new URL('/auth', baseUrl);
        errorUrl.searchParams.set('error', error);
        if (errorDescription) {
            errorUrl.searchParams.set('error_description', errorDescription);
        }
        return NextResponse.redirect(errorUrl.toString());
    }

    if (code) {
        const supabase = await createClient();

        try {
            const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) {
                console.error('Session exchange error:', sessionError);
                const errorUrl = new URL('/auth', baseUrl);
                errorUrl.searchParams.set('error', 'session_error');
                errorUrl.searchParams.set('error_description', sessionError.message);
                return NextResponse.redirect(errorUrl.toString());
            }

            // Session created successfully
            if (data.user) {
                // Check if this is a new user (first login)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, onboarding_completed')
                    .eq('id', data.user.id)
                    .single();

                // Create profile if it doesn't exist
                if (!profile) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            email: data.user.email,
                            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
                            onboarding_completed: false,
                            created_at: new Date().toISOString(),
                        });

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        // Continue anyway - profile can be created later
                    }

                    // New user - redirect to onboarding
                    return NextResponse.redirect(`${baseUrl}/onboarding`);
                }

                // Existing user - check if they need to complete onboarding
                if (!profile.onboarding_completed) {
                    return NextResponse.redirect(`${baseUrl}/onboarding`);
                }

                // Existing user with completed onboarding - go to dashboard
                return NextResponse.redirect(`${baseUrl}${next}`);
            }

            // Fallback - go to dashboard
            return NextResponse.redirect(`${baseUrl}${next}`);
        } catch (err) {
            console.error('Callback error:', err);
            const errorUrl = new URL('/auth', baseUrl);
            errorUrl.searchParams.set('error', 'callback_error');
            return NextResponse.redirect(errorUrl.toString());
        }
    }

    // No code provided - return to auth page
    return NextResponse.redirect(`${baseUrl}/auth?error=no_code`);
}
