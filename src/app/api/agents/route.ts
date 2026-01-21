/**
 * Agent API - GET /api/agents
 * 
 * Returns list of all agent summaries with status and last results.
 */

import { NextResponse } from 'next/server';
import { getAgentSummaries, getQueueStats } from '@/lib/agents';

export async function GET() {
    try {
        const agents = getAgentSummaries();
        const stats = getQueueStats();

        return NextResponse.json({
            agents,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agents' },
            { status: 500 }
        );
    }
}
