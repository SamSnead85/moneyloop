import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangePublicToken, getAccounts, getInstitution } from '@/lib/plaid';

// Admin bypass email
const ADMIN_BYPASS_EMAIL = 'sam.sweilem85@gmail.com';

export async function POST(request: NextRequest) {
    try {
        const { public_token, metadata } = await request.json();

        if (!public_token) {
            return NextResponse.json(
                { error: 'Missing public_token' },
                { status: 400 }
            );
        }

        // Determine user ID - check for admin bypass first
        let userId: string;
        const adminBypassCookie = request.cookies.get('moneyloop_admin_bypass');

        if (adminBypassCookie?.value === ADMIN_BYPASS_EMAIL) {
            userId = 'admin-bypass-user';
        } else {
            // Regular Supabase auth flow
            const supabase = await createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            userId = user.id;
        }

        // Exchange public token for access token
        const exchangeResponse = await exchangePublicToken(public_token);
        const accessToken = exchangeResponse.access_token;
        const itemId = exchangeResponse.item_id;

        // Get institution info
        const institutionId = metadata?.institution?.institution_id;
        let institutionName = metadata?.institution?.name || 'Unknown Institution';

        if (institutionId) {
            try {
                const institutionData = await getInstitution(institutionId);
                institutionName = institutionData.institution.name;
            } catch (e) {
                console.error('Failed to get institution info:', e);
            }
        }

        // Fetch accounts
        const accountsData = await getAccounts(accessToken);

        // For bypass user, store in localStorage instead of Supabase
        // For regular users, store in Supabase
        if (userId !== 'admin-bypass-user') {
            const supabase = await createClient();

            // Store the connection in Supabase
            const { data: institution, error: insertError } = await supabase
                .from('institutions')
                .insert({
                    user_id: userId,
                    plaid_item_id: itemId,
                    access_token: accessToken,
                    institution_name: institutionName,
                    status: 'active',
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error storing institution:', insertError);
                return NextResponse.json(
                    { error: 'Failed to store connection' },
                    { status: 500 }
                );
            }

            // Store accounts
            const accountsToInsert = accountsData.accounts.map((account) => ({
                institution_id: institution.id,
                plaid_account_id: account.account_id,
                name: account.name,
                official_name: account.official_name,
                type: account.type,
                subtype: account.subtype,
                current_balance: account.balances.current,
                available_balance: account.balances.available,
                currency: account.balances.iso_currency_code || 'USD',
            }));

            const { error: accountsError } = await supabase
                .from('accounts')
                .insert(accountsToInsert);

            if (accountsError) {
                console.error('Error storing accounts:', accountsError);
            }
        }

        // Return success with account data for client-side storage
        return NextResponse.json({
            success: true,
            institution_name: institutionName,
            accounts_connected: accountsData.accounts.length,
            accounts: accountsData.accounts.map(acc => ({
                id: acc.account_id,
                name: acc.name,
                type: acc.type,
                subtype: acc.subtype,
                balance: acc.balances.current,
                currency: acc.balances.iso_currency_code || 'USD',
            })),
        });
    } catch (error) {
        console.error('Error exchanging token:', error);
        return NextResponse.json(
            { error: 'Failed to exchange token' },
            { status: 500 }
        );
    }
}
