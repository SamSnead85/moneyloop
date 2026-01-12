import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/collaborativeAgents';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentType, householdId, contextId } = body;

    if (!agentType) {
        return NextResponse.json(
            { error: 'agentType is required' },
            { status: 400 }
        );
    }

    // Verify user is a member of the household
    if (householdId) {
        const { data: membership } = await supabase
            .from('household_members')
            .select('id')
            .eq('household_id', householdId)
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json(
                { error: 'Not a member of this household' },
                { status: 403 }
            );
        }
    }

    try {
        const result = await runAgent(agentType, {
            householdId: householdId || '',
            userId: user.id,
            contextId,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Agent error:', error);
        return NextResponse.json(
            { success: false, message: 'Agent execution failed' },
            { status: 500 }
        );
    }
}
