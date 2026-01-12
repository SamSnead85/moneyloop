import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/households - List user's households
export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: households, error } = await supabase
        .from('households')
        .select(`
      *,
      members:household_members(
        id, role, user_id,
        profile:profiles(email, full_name, avatar_url)
      )
    `)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ households });
}

// POST /api/households - Create a new household
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: 'Household name is required' }, { status: 400 });
    }

    // Create household
    const { data: household, error: createError } = await supabase
        .from('households')
        .insert({
            name: name.trim(),
            created_by: user.id
        })
        .select()
        .single();

    if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Add user as owner
    const { error: memberError } = await supabase
        .from('household_members')
        .insert({
            household_id: household.id,
            user_id: user.id,
            role: 'owner',
            can_add_accounts: true,
            can_invite_members: true,
        });

    if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Create default personal context
    await supabase
        .from('finance_contexts')
        .insert({
            household_id: household.id,
            name: 'Personal',
            type: 'personal',
            is_default: true,
        });

    return NextResponse.json({ household }, { status: 201 });
}
