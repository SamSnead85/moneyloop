/**
 * External Integrations & Webhook API
 * 
 * Calendar sync, email parsing, and webhook management
 * for third-party integrations.
 * 
 * Super-Sprint 19: Phases 1801-1850
 */

export type IntegrationType =
    | 'google_calendar'
    | 'apple_calendar'
    | 'outlook_calendar'
    | 'gmail'
    | 'slack'
    | 'zapier'
    | 'ifttt'
    | 'custom_webhook';

export interface Integration {
    id: string;
    userId: string;
    type: IntegrationType;
    name: string;
    isEnabled: boolean;
    config: Record<string, unknown>;
    credentials?: {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: Date;
    };
    lastSyncAt?: Date;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    errorMessage?: string;
    createdAt: Date;
}

export interface Webhook {
    id: string;
    userId: string;
    name: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    isEnabled: boolean;
    headers?: Record<string, string>;
    retryCount: number;
    lastTriggeredAt?: Date;
    failureCount: number;
    createdAt: Date;
}

export type WebhookEvent =
    | 'transaction.created'
    | 'transaction.updated'
    | 'bill.due_soon'
    | 'bill.overdue'
    | 'budget.exceeded'
    | 'goal.milestone'
    | 'goal.completed'
    | 'balance.low'
    | 'balance.high'
    | 'account.synced'
    | 'report.generated';

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: WebhookEvent;
    payload: Record<string, unknown>;
    response?: {
        statusCode: number;
        body?: string;
    };
    status: 'pending' | 'delivered' | 'failed';
    attempts: number;
    lastAttemptAt?: Date;
    createdAt: Date;
}

export interface CalendarEvent {
    id: string;
    integrationId: string;
    externalId?: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    allDay: boolean;
    recurrence?: string;
    type: 'bill' | 'goal' | 'income' | 'reminder';
    linkedEntityId?: string;
    syncedAt: Date;
}

// In-memory stores
const integrations: Map<string, Integration> = new Map();
const webhooks: Map<string, Webhook> = new Map();
const deliveries: Map<string, WebhookDelivery> = new Map();
const calendarEvents: Map<string, CalendarEvent> = new Map();

/**
 * Create integration
 */
export function createIntegration(params: Omit<Integration, 'id' | 'createdAt' | 'status'>): Integration {
    const id = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const integration: Integration = {
        id,
        ...params,
        status: 'pending',
        createdAt: new Date(),
    };

    integrations.set(id, integration);
    return integration;
}

/**
 * Get user integrations
 */
export function getUserIntegrations(userId: string): Integration[] {
    return Array.from(integrations.values())
        .filter(i => i.userId === userId);
}

/**
 * Create webhook
 */
export function createWebhook(params: Omit<Webhook, 'id' | 'createdAt' | 'failureCount'>): Webhook {
    const id = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const webhook: Webhook = {
        id,
        ...params,
        failureCount: 0,
        createdAt: new Date(),
    };

    webhooks.set(id, webhook);
    return webhook;
}

/**
 * Get user webhooks
 */
export function getUserWebhooks(userId: string): Webhook[] {
    return Array.from(webhooks.values())
        .filter(w => w.userId === userId);
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
    event: WebhookEvent,
    payload: Record<string, unknown>,
    userId: string
): Promise<WebhookDelivery[]> {
    const userWebhooks = getUserWebhooks(userId)
        .filter(w => w.isEnabled && w.events.includes(event));

    const deliveryResults: WebhookDelivery[] = [];

    for (const webhook of userWebhooks) {
        const delivery = await deliverWebhook(webhook, event, payload);
        deliveryResults.push(delivery);
    }

    return deliveryResults;
}

/**
 * Deliver webhook to endpoint
 */
async function deliverWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    payload: Record<string, unknown>
): Promise<WebhookDelivery> {
    const delivery: WebhookDelivery = {
        id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        webhookId: webhook.id,
        event,
        payload,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
    };

    deliveries.set(delivery.id, delivery);

    try {
        // Build request body
        const body = JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload,
        });

        // Build headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-MoneyLoop-Event': event,
            'X-MoneyLoop-Timestamp': new Date().toISOString(),
            ...webhook.headers,
        };

        // Add signature if secret is set
        if (webhook.secret) {
            const crypto = await import('crypto');
            const signature = crypto
                .createHmac('sha256', webhook.secret)
                .update(body)
                .digest('hex');
            headers['X-MoneyLoop-Signature'] = `sha256=${signature}`;
        }

        // In production, would make actual HTTP request
        // const response = await fetch(webhook.url, { method: 'POST', headers, body });

        // Simulate success
        delivery.response = { statusCode: 200 };
        delivery.status = 'delivered';
        delivery.attempts = 1;
        delivery.lastAttemptAt = new Date();

        webhook.lastTriggeredAt = new Date();
    } catch (error) {
        delivery.status = 'failed';
        delivery.attempts = 1;
        delivery.lastAttemptAt = new Date();
        webhook.failureCount++;

        if (webhook.failureCount >= 10) {
            webhook.isEnabled = false;
        }
    }

    return delivery;
}

/**
 * Retry failed deliveries
 */
export async function retryFailedDeliveries(): Promise<number> {
    let retried = 0;
    const failedDeliveries = Array.from(deliveries.values())
        .filter(d => d.status === 'failed' && d.attempts < 3);

    for (const delivery of failedDeliveries) {
        const webhook = webhooks.get(delivery.webhookId);
        if (!webhook || !webhook.isEnabled) continue;

        const retryResult = await deliverWebhook(webhook, delivery.event, delivery.payload);
        if (retryResult.status === 'delivered') {
            delivery.status = 'delivered';
            retried++;
        }
        delivery.attempts++;
    }

    return retried;
}

/**
 * Sync bills to calendar
 */
export function syncBillsToCalendar(
    integrationId: string,
    bills: Array<{ id: string; name: string; dueDate: Date; amount: number }>
): CalendarEvent[] {
    const integration = integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
        throw new Error('Integration not connected');
    }

    const events: CalendarEvent[] = [];

    for (const bill of bills) {
        const eventId = `cal_${bill.id}_${integrationId}`;

        const event: CalendarEvent = {
            id: eventId,
            integrationId,
            title: `💰 ${bill.name} due - $${bill.amount}`,
            description: `Bill payment due: $${bill.amount}`,
            startDate: bill.dueDate,
            allDay: true,
            type: 'bill',
            linkedEntityId: bill.id,
            syncedAt: new Date(),
        };

        calendarEvents.set(eventId, event);
        events.push(event);
    }

    integration.lastSyncAt = new Date();
    return events;
}

/**
 * Sync goals to calendar
 */
export function syncGoalsToCalendar(
    integrationId: string,
    goals: Array<{ id: string; name: string; targetDate: Date; targetAmount: number }>
): CalendarEvent[] {
    const integration = integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
        throw new Error('Integration not connected');
    }

    const events: CalendarEvent[] = [];

    for (const goal of goals) {
        const eventId = `cal_${goal.id}_${integrationId}`;

        const event: CalendarEvent = {
            id: eventId,
            integrationId,
            title: `🎯 ${goal.name} target date`,
            description: `Goal target: $${goal.targetAmount.toLocaleString()}`,
            startDate: goal.targetDate,
            allDay: true,
            type: 'goal',
            linkedEntityId: goal.id,
            syncedAt: new Date(),
        };

        calendarEvents.set(eventId, event);
        events.push(event);
    }

    integration.lastSyncAt = new Date();
    return events;
}

/**
 * Parse email for transactions (stub)
 */
export async function parseEmailForTransactions(email: {
    from: string;
    subject: string;
    body: string;
    receivedAt: Date;
}): Promise<{
    found: boolean;
    type?: 'receipt' | 'statement' | 'alert';
    merchant?: string;
    amount?: number;
    date?: Date;
}> {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    // Check for common transaction email patterns
    const patterns = [
        { type: 'receipt' as const, keywords: ['receipt', 'order confirmed', 'purchase'] },
        { type: 'statement' as const, keywords: ['statement', 'monthly summary'] },
        { type: 'alert' as const, keywords: ['transaction alert', 'card used', 'payment'] },
    ];

    for (const pattern of patterns) {
        if (pattern.keywords.some(k => subject.includes(k) || body.includes(k))) {
            // Extract amount
            const amountMatch = body.match(/\$(\d+\.?\d*)/);
            const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

            return {
                found: true,
                type: pattern.type,
                amount,
                date: email.receivedAt,
            };
        }
    }

    return { found: false };
}

/**
 * Get webhook deliveries
 */
export function getWebhookDeliveries(webhookId: string, limit: number = 50): WebhookDelivery[] {
    return Array.from(deliveries.values())
        .filter(d => d.webhookId === webhookId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
}

/**
 * Test webhook
 */
export async function testWebhook(webhookId: string): Promise<WebhookDelivery> {
    const webhook = webhooks.get(webhookId);
    if (!webhook) throw new Error('Webhook not found');

    const testPayload = {
        test: true,
        message: 'This is a test webhook from MoneyLoop',
        timestamp: new Date().toISOString(),
    };

    return await deliverWebhook(webhook, 'transaction.created', testPayload);
}

export default {
    createIntegration,
    getUserIntegrations,
    createWebhook,
    getUserWebhooks,
    triggerWebhook,
    retryFailedDeliveries,
    syncBillsToCalendar,
    syncGoalsToCalendar,
    parseEmailForTransactions,
    getWebhookDeliveries,
    testWebhook,
};
