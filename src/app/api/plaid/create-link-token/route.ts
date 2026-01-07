import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLinkToken } from '@/lib/plaid';

export async function POST() {
    try {
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
