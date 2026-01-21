/**
 * Multi-Channel Notification System
 * 
 * Unified notification delivery across push, email, SMS, and in-app.
 * Supports intelligent batching, scheduling, and user preferences.
 * 
 * Super-Sprint 12: Phases 1101-1150
 */

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationCategory =
    | 'transaction'
    | 'bill'
    | 'budget'
    | 'goal'
    | 'security'
    | 'insight'
    | 'system'
    | 'marketing';

export interface NotificationPreferences {
    userId: string;
    channels: {
        push: boolean;
        email: boolean;
        sms: boolean;
        in_app: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string; // HH:mm
        end: string;
        timezone: string;
    };
    categoryPreferences: Record<NotificationCategory, {
        enabled: boolean;
        channels: NotificationChannel[];
        frequency: 'instant' | 'daily_digest' | 'weekly_digest';
    }>;
    batchingEnabled: boolean;
    digestTime: string; // HH:mm
}

export interface Notification {
    id: string;
    userId: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    actionUrl?: string;
    imageUrl?: string;
    channels: NotificationChannel[];
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: Date;
    scheduledFor?: Date;
    sentAt?: Date;
    readAt?: Date;
    batchId?: string;
}

export interface NotificationBatch {
    id: string;
    userId: string;
    notifications: Notification[];
    channel: NotificationChannel;
    scheduledFor: Date;
    status: 'pending' | 'sent' | 'failed';
}

// In-memory stores (production would use database + queue)
const notifications: Map<string, Notification> = new Map();
const batches: Map<string, NotificationBatch> = new Map();

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
    userId: '',
    channels: {
        push: true,
        email: true,
        sms: false,
        in_app: true,
    },
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'America/New_York',
    },
    categoryPreferences: {
        transaction: { enabled: true, channels: ['in_app', 'push'], frequency: 'instant' },
        bill: { enabled: true, channels: ['push', 'email'], frequency: 'instant' },
        budget: { enabled: true, channels: ['in_app', 'push'], frequency: 'instant' },
        goal: { enabled: true, channels: ['in_app'], frequency: 'instant' },
        security: { enabled: true, channels: ['push', 'email', 'sms'], frequency: 'instant' },
        insight: { enabled: true, channels: ['in_app'], frequency: 'daily_digest' },
        system: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
        marketing: { enabled: false, channels: ['email'], frequency: 'weekly_digest' },
    },
    batchingEnabled: true,
    digestTime: '09:00',
};

/**
 * Check if within quiet hours
 */
function isQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHours.enabled) return false;

    const now = new Date();
    const [startHour, startMin] = prefs.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHours.end.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes < endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
}

/**
 * Get effective channels based on preferences
 */
function getEffectiveChannels(
    category: NotificationCategory,
    priority: NotificationPriority,
    prefs: NotificationPreferences
): NotificationChannel[] {
    const catPref = prefs.categoryPreferences[category];
    if (!catPref?.enabled) return [];

    // Critical always goes through (bypasses quiet hours)
    if (priority === 'critical') {
        return catPref.channels.filter(c => prefs.channels[c]);
    }

    // During quiet hours, only in-app notifications
    if (isQuietHours(prefs) && priority !== 'high') {
        return catPref.channels.filter(c => c === 'in_app' && prefs.channels[c]);
    }

    return catPref.channels.filter(c => prefs.channels[c]);
}

/**
 * Create a notification
 */
export async function createNotification(params: {
    userId: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    actionUrl?: string;
    imageUrl?: string;
    preferences?: NotificationPreferences;
}): Promise<Notification> {
    const prefs = params.preferences || { ...DEFAULT_PREFERENCES, userId: params.userId };
    const channels = getEffectiveChannels(params.category, params.priority, prefs);

    const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId,
        category: params.category,
        priority: params.priority,
        title: params.title,
        body: params.body,
        data: params.data,
        actionUrl: params.actionUrl,
        imageUrl: params.imageUrl,
        channels,
        status: 'pending',
        createdAt: new Date(),
    };

    notifications.set(notification.id, notification);

    // Check if should batch
    const catPref = prefs.categoryPreferences[params.category];
    if (prefs.batchingEnabled && catPref?.frequency !== 'instant') {
        await addToBatch(notification, prefs);
    } else {
        await sendNotification(notification);
    }

    return notification;
}

/**
 * Add notification to batch
 */
async function addToBatch(notification: Notification, prefs: NotificationPreferences): Promise<void> {
    const digestTime = prefs.digestTime.split(':').map(Number);
    const scheduledFor = new Date();
    scheduledFor.setHours(digestTime[0], digestTime[1], 0, 0);

    if (scheduledFor <= new Date()) {
        scheduledFor.setDate(scheduledFor.getDate() + 1);
    }

    for (const channel of notification.channels) {
        const batchKey = `${notification.userId}_${channel}_${scheduledFor.toDateString()}`;

        let batch = batches.get(batchKey);
        if (!batch) {
            batch = {
                id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                userId: notification.userId,
                notifications: [],
                channel,
                scheduledFor,
                status: 'pending',
            };
            batches.set(batchKey, batch);
        }

        batch.notifications.push(notification);
        notification.batchId = batch.id;
    }

    notification.status = 'pending';
    notification.scheduledFor = scheduledFor;
}

/**
 * Send notification immediately
 */
async function sendNotification(notification: Notification): Promise<void> {
    try {
        for (const channel of notification.channels) {
            await deliverToChannel(notification, channel);
        }
        notification.status = 'sent';
        notification.sentAt = new Date();
    } catch (error) {
        notification.status = 'failed';
        console.error('Failed to send notification:', error);
    }
}

/**
 * Deliver to specific channel
 */
async function deliverToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    switch (channel) {
        case 'push':
            // Would integrate with FCM/APNs
            console.log('Push notification:', notification.title);
            break;
        case 'email':
            // Would integrate with email service (SendGrid, etc.)
            console.log('Email notification:', notification.title);
            break;
        case 'sms':
            // Would integrate with SMS service (Twilio, etc.)
            console.log('SMS notification:', notification.title);
            break;
        case 'in_app':
            // Already stored, will be fetched by client
            break;
    }
}

/**
 * Get user notifications
 */
export function getUserNotifications(
    userId: string,
    options?: {
        unreadOnly?: boolean;
        category?: NotificationCategory;
        limit?: number;
    }
): Notification[] {
    let userNotifs = Array.from(notifications.values())
        .filter(n => n.userId === userId);

    if (options?.unreadOnly) {
        userNotifs = userNotifs.filter(n => !n.readAt);
    }
    if (options?.category) {
        userNotifs = userNotifs.filter(n => n.category === options.category);
    }

    return userNotifs
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, options?.limit || 50);
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): boolean {
    const notification = notifications.get(notificationId);
    if (!notification) return false;

    notification.readAt = new Date();
    notification.status = 'read';
    return true;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(userId: string): number {
    let count = 0;
    for (const notification of notifications.values()) {
        if (notification.userId === userId && !notification.readAt) {
            notification.readAt = new Date();
            notification.status = 'read';
            count++;
        }
    }
    return count;
}

/**
 * Get unread count
 */
export function getUnreadCount(userId: string): number {
    return Array.from(notifications.values())
        .filter(n => n.userId === userId && !n.readAt)
        .length;
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId: string): boolean {
    return notifications.delete(notificationId);
}

/**
 * Process pending batches
 */
export async function processPendingBatches(): Promise<number> {
    let processed = 0;
    const now = new Date();

    for (const batch of batches.values()) {
        if (batch.status !== 'pending') continue;
        if (batch.scheduledFor > now) continue;

        try {
            await sendBatch(batch);
            batch.status = 'sent';
            processed++;
        } catch (error) {
            batch.status = 'failed';
            console.error('Failed to send batch:', error);
        }
    }

    return processed;
}

/**
 * Send a batch digest
 */
async function sendBatch(batch: NotificationBatch): Promise<void> {
    if (batch.notifications.length === 0) return;

    const digestNotification: Notification = {
        id: `digest_${batch.id}`,
        userId: batch.userId,
        category: 'system',
        priority: 'low',
        title: `You have ${batch.notifications.length} updates`,
        body: batch.notifications.map(n => `• ${n.title}`).join('\n'),
        channels: [batch.channel],
        status: 'pending',
        createdAt: new Date(),
    };

    await deliverToChannel(digestNotification, batch.channel);
}

/**
 * Get default preferences
 */
export function getDefaultPreferences(userId: string): NotificationPreferences {
    return { ...DEFAULT_PREFERENCES, userId };
}

export default {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    processPendingBatches,
    getDefaultPreferences,
};
