import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeGroceryPatterns, generateGroceryList, comparePrices, placeGroceryOrder, type GroceryItem, type GroceryList } from '@/lib/automation/grocery-agent';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');

        if (action === 'analyze') {
            const analysis = await analyzeGroceryPatterns(user.id);
            return NextResponse.json(analysis);
        } else if (action === 'generate') {
            const list = await generateGroceryList(user.id);
            return NextResponse.json(list);
        }

        // Default: return analysis
        const analysis = await analyzeGroceryPatterns(user.id);
        return NextResponse.json(analysis);

    } catch (error) {
        console.error('Grocery API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        const { action, items, store, list } = body;

        if (action === 'compare-prices' && items) {
            const pricing = await comparePrices(items as GroceryItem[]);
            return NextResponse.json(pricing);
        }

        if (action === 'place-order' && list && store) {
            const result = await placeGroceryOrder(list as GroceryList, store);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Grocery API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
