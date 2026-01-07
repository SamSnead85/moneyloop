import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subscriptionCancellation } from '@/lib/automation/bill-payment';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { serviceName } = await request.json();

        if (!serviceName) {
            return NextResponse.json({ error: 'Service name required' }, { status: 400 });
        }

        // Get cancellation instructions using the automation service
        const instructions = await subscriptionCancellation.getCancellationInstructions(serviceName);

        return NextResponse.json({
            success: true,
            serviceName,
            ...instructions,
        });

    } catch (error) {
        console.error('Subscription cancellation API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
