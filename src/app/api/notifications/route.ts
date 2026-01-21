import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    createNotification,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
    type NotificationCategory,
    type NotificationPriority,
} from '@/lib/notifications/notification-service';

/**
 * Notifications API Routes
 * 
 * Endpoints for sending, listing, and managing notifications.
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
                const limit = parseInt(searchParams.get('limit') || '50');
                const unreadOnly = searchParams.get('unreadOnly') === 'true';
                const notifications = await getUserNotifications(user.id, { limit, unreadOnly });
                return NextResponse.json({ notifications });

            case 'unread-count':
                const count = await getUnreadCount(user.id);
                return NextResponse.json({ count });

            default:
                const defaultNotifications = await getUserNotifications(user.id);
                return NextResponse.json({ notifications: defaultNotifications });
        }
    } catch (error) {
        console.error('Notifications API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
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
            case 'send':
                const notification = await createNotification({
                    userId: user.id,
                    category: params.category as NotificationCategory || 'system',
                    priority: params.priority as NotificationPriority || 'normal',
                    title: params.title,
                    body: params.message,
                    actionUrl: params.actionUrl,
                    data: params.data,
                });
                return NextResponse.json({ notification }, { status: 201 });

            case 'mark-read':
                const { notificationId } = params;
                const success = await markAsRead(notificationId);
                return NextResponse.json({ success });

            case 'mark-all-read':
                const notifications = await getUserNotifications(user.id, { unreadOnly: true, limit: 100 });
                let marked = 0;
                for (const n of notifications) {
                    if (await markAsRead(n.id)) marked++;
                }
                return NextResponse.json({ marked });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Notifications API error:', error);
        return NextResponse.json(
            { error: 'Failed to process notification request' },
            { status: 500 }
        );
    }
}
