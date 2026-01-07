import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTransactions } from '@/lib/plaid';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date') || getDateDaysAgo(30);
        const endDate = searchParams.get('end_date') || getTodayDate();

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

        const allTransactions = [];

        for (const institution of institutions || []) {
            try {
                // Fetch transactions from Plaid
                const plaidTransactions = await getTransactions(
                    institution.access_token,
                    startDate,
                    endDate
                );

                // Get account ID mapping
                const { data: accounts } = await supabase
                    .from('accounts')
                    .select('id, plaid_account_id, name')
                    .eq('institution_id', institution.id);

                const accountMap = new Map(
                    (accounts || []).map((a) => [a.plaid_account_id, a])
                );

                // Store transactions in database and prepare response
                for (const transaction of plaidTransactions.transactions) {
                    const account = accountMap.get(transaction.account_id);

                    // Upsert transaction
                    await supabase
                        .from('transactions')
                        .upsert({
                            account_id: account?.id,
                            plaid_transaction_id: transaction.transaction_id,
                            amount: transaction.amount,
                            date: transaction.date,
                            name: transaction.name,
                            merchant_name: transaction.merchant_name,
                            category: transaction.category,
                            pending: transaction.pending,
                        }, {
                            onConflict: 'plaid_transaction_id',
                        });

                    allTransactions.push({
                        id: transaction.transaction_id,
                        account_name: account?.name || 'Unknown',
                        institution: institution.institution_name,
                        amount: transaction.amount,
                        date: transaction.date,
                        name: transaction.name,
                        merchant: transaction.merchant_name,
                        category: transaction.category?.[0] || 'Uncategorized',
                        pending: transaction.pending,
                    });
                }
            } catch (e) {
                console.error(`Error fetching transactions for ${institution.institution_name}:`, e);
            }
        }

        // Sort by date descending
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            transactions: allTransactions,
            total: allTransactions.length,
            date_range: { start_date: startDate, end_date: endDate },
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Helper to get date N days ago in YYYY-MM-DD format
function getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}
