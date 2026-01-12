'use server';

import { createClient } from '@/lib/supabase/server';

// Calendar integration types
export type CalendarProvider = 'google' | 'apple' | 'outlook';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time?: string;
    recurrence?: string;
    source: CalendarProvider;
}

interface CalendarSyncResult {
    success: boolean;
    eventsCreated: number;
    errors: string[];
}

// OAuth configuration for calendar providers
const OAUTH_CONFIG = {
    google: {
        clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
    },
    apple: {
        // Apple uses CloudKit for calendar access
        containerId: process.env.APPLE_CLOUDKIT_CONTAINER,
    },
    outlook: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        scopes: ['Calendars.ReadWrite'],
    },
};

// Convert MoneyLoop task to calendar event
function taskToCalendarEvent(task: {
    id: string;
    title: string;
    due_date: string | null;
    amount?: number;
    type: string;
}): CalendarEvent | null {
    if (!task.due_date) return null;

    const title = task.amount
        ? `💰 ${task.title} ($${task.amount})`
        : `📋 ${task.title}`;

    return {
        id: task.id,
        title,
        date: task.due_date,
        source: 'google', // Will be set based on user preference
    };
}

// Sync bills and tasks to Google Calendar
export async function syncToGoogleCalendar(
    accessToken: string,
    householdId: string
): Promise<CalendarSyncResult> {
    const supabase = await createClient();

    // Get upcoming tasks with due dates
    const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, amount, type')
        .eq('household_id', householdId)
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(50);

    const results: CalendarSyncResult = {
        success: true,
        eventsCreated: 0,
        errors: [],
    };

    for (const task of tasks || []) {
        const event = taskToCalendarEvent(task);
        if (!event) continue;

        try {
            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary: event.title,
                        start: {
                            date: event.date.split('T')[0],
                        },
                        end: {
                            date: event.date.split('T')[0],
                        },
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'popup', minutes: 60 * 24 }, // 1 day before
                                { method: 'popup', minutes: 60 }, // 1 hour before
                            ],
                        },
                    }),
                }
            );

            if (response.ok) {
                results.eventsCreated++;
            } else {
                const error = await response.text();
                results.errors.push(`Failed to create event for ${task.title}: ${error}`);
            }
        } catch (error) {
            results.errors.push(`Error syncing ${task.title}: ${error}`);
        }
    }

    if (results.errors.length > 0) {
        results.success = false;
    }

    return results;
}

// Import calendar events as potential bills/tasks
export async function importFromGoogleCalendar(
    accessToken: string,
    householdId: string,
    keywords: string[] = ['bill', 'payment', 'due', 'pay']
): Promise<{ imported: number; events: CalendarEvent[] }> {
    const now = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 3); // Look 3 months ahead

    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${now.toISOString()}&timeMax=${future.toISOString()}&maxResults=100`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    const events: CalendarEvent[] = [];

    // Filter events that look like bills/financial tasks
    for (const item of data.items || []) {
        const title = (item.summary || '').toLowerCase();
        const isFinancial = keywords.some(kw => title.includes(kw));

        if (isFinancial) {
            events.push({
                id: item.id,
                title: item.summary,
                date: item.start?.date || item.start?.dateTime,
                recurrence: item.recurrence?.[0],
                source: 'google',
            });
        }
    }

    return { imported: events.length, events };
}

// OAuth flow helpers
export async function getGoogleCalendarAuthUrl(redirectUri: string): Promise<string> {
    const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.google.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(
    code: string,
    redirectUri: string
): Promise<{ access_token: string; refresh_token: string }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: OAUTH_CONFIG.google.clientId || '',
            client_secret: OAUTH_CONFIG.google.clientSecret || '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
    }

    return response.json();
}
