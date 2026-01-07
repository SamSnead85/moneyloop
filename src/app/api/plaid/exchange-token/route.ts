import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangePublicToken, getAccounts, getInstitution } from '@/lib/plaid';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { public_token, metadata } = await request.json();

        if (!public_token) {
            return NextResponse.json(
                { error: 'Missing public_token' },
                { status: 400 }
            );
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

        // Store the connection in Supabase
        // Note: In production, encrypt the access_token before storing
        const { data: institution, error: insertError } = await supabase
            .from('institutions')
            .insert({
                user_id: user.id,
                plaid_item_id: itemId,
                access_token: accessToken, // TODO: Encrypt this in production
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

        // Fetch accounts and store them
        const accountsData = await getAccounts(accessToken);

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

        return NextResponse.json({
            success: true,
            institution_name: institutionName,
            accounts_connected: accountsData.accounts.length,
        });
    } catch (error) {
        console.error('Error exchanging token:', error);
        return NextResponse.json(
            { error: 'Failed to exchange token' },
            { status: 500 }
        );
    }
}
