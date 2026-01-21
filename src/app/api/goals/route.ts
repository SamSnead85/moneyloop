import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    createGoal,
    updateGoalProgress,
    calculateProjection,
    generateContributionSuggestions,
    getUserGoals,
    getGoalAlerts,
} from '@/lib/goals/goal-automation';

/**
 * Goals API Routes
 * 
 * Endpoints for goal management, progress tracking,
 * and contribution suggestions.
 */

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'list':
                const status = searchParams.get('status') as 'active' | 'completed' | undefined;
                const goals = getUserGoals(user.id, status || undefined);
                return NextResponse.json({ goals });

            case 'projections':
                const allGoals = getUserGoals(user.id, 'active');
                const projections = allGoals.map(goal => ({
                    goal,
                    projection: calculateProjection(goal),
                }));
                return NextResponse.json({ projections });

            case 'suggestions':
                const budget = parseFloat(searchParams.get('budget') || '0');
                const suggestions = generateContributionSuggestions(user.id, budget);
                return NextResponse.json({ suggestions });

            case 'alerts':
                const alerts = getGoalAlerts(user.id);
                return NextResponse.json({ alerts });

            default:
                const defaultGoals = getUserGoals(user.id);
                return NextResponse.json({ goals: defaultGoals });
        }
    } catch (error) {
        console.error('Goals API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goals' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case 'create':
                const newGoal = createGoal({
                    userId: user.id,
                    name: params.name,
                    description: params.description,
                    targetAmount: params.targetAmount,
                    targetDate: new Date(params.targetDate),
                    category: params.category,
                    priority: params.priority,
                    autoContribute: params.autoContribute,
                    contributionFrequency: params.contributionFrequency,
                    contributionAmount: params.contributionAmount,
                });
                return NextResponse.json({ goal: newGoal }, { status: 201 });

            case 'update-progress':
                const { goalId, amount } = params;
                const result = updateGoalProgress(goalId, amount);
                return NextResponse.json({
                    goal: result.goal,
                    reachedMilestones: result.reachedMilestones,
                    isCompleted: result.isCompleted,
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Goals API error:', error);
        return NextResponse.json(
            { error: 'Failed to process goal request' },
            { status: 500 }
        );
    }
}
