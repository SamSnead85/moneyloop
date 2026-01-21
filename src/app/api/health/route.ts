import { NextResponse } from 'next/server';

/**
 * Health Check API
 * 
 * Returns application health status for monitoring and load balancers.
 */

export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
            api: 'ok',
            memory: getMemoryUsage(),
            uptime: process.uptime(),
        },
    };

    return NextResponse.json(health, { status: 200 });
}

function getMemoryUsage(): string {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        return `${Math.round(used)}MB`;
    }
    return 'N/A';
}
