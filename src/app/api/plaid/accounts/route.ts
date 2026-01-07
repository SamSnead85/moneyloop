import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAccounts } from '@/lib/plaid';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all user's connected institutions
        const { data: institutions, error: institutionsError } = await supabase
            .from('institutions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (institutionsError) {
            return NextResponse.json(
                { error: 'Failed to fetch institutions' },
                { status: 500 }
            );
        }

        // Get all accounts for each institution
        const allAccounts = [];

        for (const institution of institutions || []) {
            try {
                // Fetch fresh data from Plaid
                const plaidAccounts = await getAccounts(institution.access_token);

                // Update balances in database
                for (const account of plaidAccounts.accounts) {
                    await supabase
                        .from('accounts')
                        .update({
                            current_balance: account.balances.current,
                            available_balance: account.balances.available,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('plaid_account_id', account.account_id);
                }

                // Get updated accounts from database
                const { data: dbAccounts } = await supabase
                    .from('accounts')
                    .select('*')
                    .eq('institution_id', institution.id);

                allAccounts.push({
                    institution: institution.institution_name,
                    accounts: dbAccounts || [],
                });
            } catch (e) {
                console.error(`Error fetching accounts for ${institution.institution_name}:`, e);
                // Still include the institution with cached data
                const { data: dbAccounts } = await supabase
                    .from('accounts')
                    .select('*')
                    .eq('institution_id', institution.id);

                allAccounts.push({
                    institution: institution.institution_name,
                    accounts: dbAccounts || [],
                    error: 'Failed to sync - showing cached data',
                });
            }
        }

        return NextResponse.json({
            institutions: allAccounts,
            total_accounts: allAccounts.reduce((sum, i) => sum + i.accounts.length, 0),
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}
