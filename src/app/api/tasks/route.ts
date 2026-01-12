import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tasks - List household tasks
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const householdId = searchParams.get('household_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const contextId = searchParams.get('context_id');

    let query = supabase
        .from('tasks')
        .select(`
      *,
      claimer:profiles!claimed_by(email, full_name, avatar_url),
      assignee:profiles!assigned_to(email, full_name, avatar_url),
      context:finance_contexts(id, name, type, color)
    `)
        .order('due_date', { ascending: true, nullsFirst: false });

    if (householdId) {
        query = query.eq('household_id', householdId);
    }
    if (status) {
        query = query.eq('status', status);
    }
    if (priority) {
        query = query.eq('priority', priority);
    }
    if (contextId) {
        query = query.eq('context_id', contextId);
    }

    const { data: tasks, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks });
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
        household_id,
        context_id,
        title,
        description,
        type = 'action',
        priority = 'noise',
        amount,
        due_date,
        assigned_to,
        tags = [],
    } = body;

    if (!household_id || !title?.trim()) {
        return NextResponse.json(
            { error: 'household_id and title are required' },
            { status: 400 }
        );
    }

    // Verify user is a member of the household
    const { data: membership } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', household_id)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return NextResponse.json(
            { error: 'Not a member of this household' },
            { status: 403 }
        );
    }

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            household_id,
            context_id,
            created_by: user.id,
            title: title.trim(),
            description: description?.trim() || null,
            type,
            priority,
            amount: amount || null,
            due_date: due_date || null,
            assigned_to: assigned_to || null,
            tags,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the creation activity
    await supabase.from('task_activities').insert({
        task_id: task.id,
        user_id: user.id,
        action: 'created',
    });

    return NextResponse.json({ task }, { status: 201 });
}

// PATCH /api/tasks - Update task (claim, complete, etc.)
export async function PATCH(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task_id, action, notes } = body;

    if (!task_id || !action) {
        return NextResponse.json(
            { error: 'task_id and action are required' },
            { status: 400 }
        );
    }

    let result;

    switch (action) {
        case 'claim':
            result = await supabase.rpc('claim_task', { task_id });
            break;

        case 'complete':
            result = await supabase.rpc('complete_task', {
                task_id,
                notes: notes || null
            });
            break;

        case 'unclaim':
            result = await supabase
                .from('tasks')
                .update({
                    claimed_by: null,
                    claimed_at: null,
                    status: 'open',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task_id)
                .eq('claimed_by', user.id) // Can only unclaim own tasks
                .select()
                .single();

            if (result.data) {
                await supabase.from('task_activities').insert({
                    task_id,
                    user_id: user.id,
                    action: 'unclaimed',
                });
            }
            break;

        default:
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
    }

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ task: result.data });
}
