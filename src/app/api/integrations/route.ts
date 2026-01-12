import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    syncToGoogleCalendar,
    importFromGoogleCalendar,
    getGoogleCalendarAuthUrl,
    exchangeGoogleCalendarCode,
} from '@/lib/integrations/calendarSync';
import {
    getHouseholdUtilityEstimates
} from '@/lib/integrations/smartHome';
import {
    aggregateCryptoHoldings,
    getRecentTransactions,
} from '@/lib/integrations/cryptoWallets';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, provider, ...params } = body;

    try {
        switch (action) {
            // Calendar Integration
            case 'calendar_auth_url':
                const authUrl = await getGoogleCalendarAuthUrl(params.redirectUri);
                return NextResponse.json({ authUrl });

            case 'calendar_exchange_code':
                const tokens = await exchangeGoogleCalendarCode(params.code, params.redirectUri);
                // Store tokens in user's profile
                await supabase
                    .from('profiles')
                    .update({
                        google_calendar_token: tokens.access_token,
                        google_calendar_refresh: tokens.refresh_token,
                    })
                    .eq('id', user.id);
                return NextResponse.json({ success: true });

            case 'calendar_sync':
                const syncResult = await syncToGoogleCalendar(
                    params.accessToken,
                    params.householdId
                );
                return NextResponse.json(syncResult);

            case 'calendar_import':
                const importResult = await importFromGoogleCalendar(
                    params.accessToken,
                    params.householdId,
                    params.keywords
                );
                return NextResponse.json(importResult);

            // Smart Home Integration
            case 'utility_estimates':
                const estimates = await getHouseholdUtilityEstimates(params.configs);
                return NextResponse.json(estimates);

            // Crypto Integration
            case 'crypto_holdings':
                const holdings = await aggregateCryptoHoldings(
                    params.wallets || [],
                    params.exchanges || []
                );
                return NextResponse.json(holdings);

            case 'crypto_transactions':
                const transactions = await getRecentTransactions(
                    params.address,
                    params.network
                );
                return NextResponse.json({ transactions });

            default:
                return NextResponse.json(
                    { error: 'Unknown action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Integration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Integration failed' },
            { status: 500 }
        );
    }
}
