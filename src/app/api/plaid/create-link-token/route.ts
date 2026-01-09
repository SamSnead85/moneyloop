import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLinkToken } from '@/lib/plaid';

// Admin bypass email
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

export async function POST(request: NextRequest) {
    try {
        // Check for admin bypass cookie first
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');
        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            // Admin bypass - create link token with admin user ID
            const linkToken = await createLinkToken('admin-bypass-user');
            return NextResponse.json({
                link_token: linkToken.link_token,
                expiration: linkToken.expiration,
            });
        }

        // Regular Supabase auth flow
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Create Plaid link token for the authenticated user
        const linkToken = await createLinkToken(user.id);

        return NextResponse.json({
            link_token: linkToken.link_token,
            expiration: linkToken.expiration,
        });
    } catch (error) {
        console.error('Error creating link token:', error);
        return NextResponse.json(
            { error: 'Failed to create link token' },
            { status: 500 }
        );
    }
}
