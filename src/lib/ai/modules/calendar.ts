/**
 * Calendar Integration Module
 * 
 * Unified calendar management for Google Calendar and Outlook.
 * Supports smart scheduling, conflict detection, and focus time blocking.
 */

export type CalendarProvider = 'google' | 'outlook' | 'apple';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: string; // ISO 8601
    end: string;
    allDay: boolean;
    location?: string;
    attendees: Attendee[];
    recurrence?: RecurrenceRule;
    status: 'confirmed' | 'tentative' | 'cancelled';
    provider: CalendarProvider;
    externalId: string;
}

export interface Attendee {
    email: string;
    name?: string;
    status: 'accepted' | 'declined' | 'tentative' | 'pending';
    organizer: boolean;
}

export interface RecurrenceRule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: string;
    count?: number;
    byDay?: string[];
}

export interface TimeSlot {
    start: string;
    end: string;
    available: boolean;
}

export interface SchedulingSuggestion {
    slot: TimeSlot;
    score: number; // 0-100, higher is better
    reasons: string[];
}

export interface FocusTimeBlock {
    id: string;
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string;
    label: string;
    color: string;
}

// Calendar Manager Class
export class CalendarManager {
    private connectedProviders: Map<CalendarProvider, { accessToken: string; refreshToken: string }> = new Map();
    private cachedEvents: CalendarEvent[] = [];
    private focusTimeBlocks: FocusTimeBlock[] = [];
    private lastSync: string | null = null;

    /**
     * Connect a calendar provider
     */
    async connect(provider: CalendarProvider, authCode: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/calendar/${provider}/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: authCode }),
            });

            if (!response.ok) throw new Error('Connection failed');

            const tokens = await response.json();
            this.connectedProviders.set(provider, tokens);
            await this.syncCalendar(provider);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Disconnect a calendar provider
     */
    async disconnect(provider: CalendarProvider): Promise<void> {
        this.connectedProviders.delete(provider);
        this.cachedEvents = this.cachedEvents.filter((e) => e.provider !== provider);
    }

    /**
     * Sync events from all connected calendars
     */
    async syncAll(): Promise<CalendarEvent[]> {
        const allEvents: CalendarEvent[] = [];

        for (const [provider] of this.connectedProviders) {
            const events = await this.syncCalendar(provider);
            allEvents.push(...events);
        }

        this.cachedEvents = allEvents;
        this.lastSync = new Date().toISOString();
        return allEvents;
    }

    /**
     * Sync events from a specific provider
     */
    async syncCalendar(provider: CalendarProvider): Promise<CalendarEvent[]> {
        const tokens = this.connectedProviders.get(provider);
        if (!tokens) throw new Error(`Provider ${provider} not connected`);

        const now = new Date();
        const startDate = now.toISOString();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

        const response = await fetch(`/api/calendar/${provider}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });

        if (!response.ok) throw new Error('Sync failed');

        const events: CalendarEvent[] = await response.json();
        return events.map((e) => ({ ...e, provider }));
    }

    /**
     * Create a new event
     */
    async createEvent(
        event: Omit<CalendarEvent, 'id' | 'provider' | 'externalId' | 'status'>,
        provider: CalendarProvider = 'google'
    ): Promise<CalendarEvent | null> {
        const tokens = this.connectedProviders.get(provider);
        if (!tokens) throw new Error(`Provider ${provider} not connected`);

        const response = await fetch(`/api/calendar/${provider}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.accessToken}`,
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) return null;

        const created = await response.json();
        this.cachedEvents.push(created);
        return created;
    }

    /**
     * Update an existing event
     */
    async updateEvent(event: Partial<CalendarEvent> & { id: string }): Promise<boolean> {
        const existing = this.cachedEvents.find((e) => e.id === event.id);
        if (!existing) return false;

        const tokens = this.connectedProviders.get(existing.provider);
        if (!tokens) return false;

        const response = await fetch(`/api/calendar/${existing.provider}/events/${existing.externalId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.accessToken}`,
            },
            body: JSON.stringify(event),
        });

        if (response.ok) {
            Object.assign(existing, event);
            return true;
        }
        return false;
    }

    /**
     * Delete an event
     */
    async deleteEvent(eventId: string): Promise<boolean> {
        const event = this.cachedEvents.find((e) => e.id === eventId);
        if (!event) return false;

        const tokens = this.connectedProviders.get(event.provider);
        if (!tokens) return false;

        const response = await fetch(`/api/calendar/${event.provider}/events/${event.externalId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        if (response.ok) {
            this.cachedEvents = this.cachedEvents.filter((e) => e.id !== eventId);
            return true;
        }
        return false;
    }

    /**
     * Find available time slots for scheduling
     */
    findAvailableSlots(
        durationMinutes: number,
        startDate: Date,
        endDate: Date,
        workingHours: { start: string; end: string } = { start: '09:00', end: '17:00' }
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        const duration = durationMinutes * 60 * 1000;

        // Filter events in range
        const eventsInRange = this.cachedEvents.filter((e) => {
            const eventStart = new Date(e.start);
            const eventEnd = new Date(e.end);
            return eventStart >= startDate && eventEnd <= endDate && e.status !== 'cancelled';
        });

        // Generate potential slots
        const current = new Date(startDate);
        while (current < endDate) {
            // Skip weekends
            if (current.getDay() === 0 || current.getDay() === 6) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // Parse working hours
            const [startHour, startMin] = workingHours.start.split(':').map(Number);
            const [endHour, endMin] = workingHours.end.split(':').map(Number);

            const dayStart = new Date(current);
            dayStart.setHours(startHour, startMin, 0, 0);

            const dayEnd = new Date(current);
            dayEnd.setHours(endHour, endMin, 0, 0);

            let slotStart = new Date(dayStart);
            while (slotStart.getTime() + duration <= dayEnd.getTime()) {
                const slotEnd = new Date(slotStart.getTime() + duration);

                // Check for conflicts
                const hasConflict = eventsInRange.some((e) => {
                    const eventStart = new Date(e.start);
                    const eventEnd = new Date(e.end);
                    return slotStart < eventEnd && slotEnd > eventStart;
                });

                // Check focus time blocks
                const inFocusTime = this.focusTimeBlocks.some((block) => {
                    if (block.dayOfWeek !== slotStart.getDay()) return false;
                    const [blockStartH, blockStartM] = block.startTime.split(':').map(Number);
                    const [blockEndH, blockEndM] = block.endTime.split(':').map(Number);
                    const blockStart = blockStartH * 60 + blockStartM;
                    const blockEnd = blockEndH * 60 + blockEndM;
                    const slotTime = slotStart.getHours() * 60 + slotStart.getMinutes();
                    return slotTime >= blockStart && slotTime < blockEnd;
                });

                slots.push({
                    start: slotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    available: !hasConflict && !inFocusTime,
                });

                slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 min increments
            }

            current.setDate(current.getDate() + 1);
        }

        return slots.filter((s) => s.available);
    }

    /**
     * Smart scheduling - suggest optimal meeting times
     */
    suggestMeetingTimes(
        durationMinutes: number,
        preferredTimeOfDay: 'morning' | 'afternoon' | 'any' = 'any',
        daysAhead: number = 7
    ): SchedulingSuggestion[] {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);

        const availableSlots = this.findAvailableSlots(durationMinutes, startDate, endDate);

        return availableSlots
            .map((slot) => {
                const slotDate = new Date(slot.start);
                const hour = slotDate.getHours();
                const reasons: string[] = [];
                let score = 50;

                // Score based on time of day preference
                if (preferredTimeOfDay === 'morning' && hour >= 9 && hour < 12) {
                    score += 20;
                    reasons.push('Morning slot as preferred');
                } else if (preferredTimeOfDay === 'afternoon' && hour >= 13 && hour < 17) {
                    score += 20;
                    reasons.push('Afternoon slot as preferred');
                }

                // Score based on buffer time before/after
                const hasBufferBefore = !this.cachedEvents.some((e) => {
                    const eventEnd = new Date(e.end);
                    return eventEnd.getTime() === slotDate.getTime();
                });
                if (hasBufferBefore) {
                    score += 10;
                    reasons.push('Has buffer time before');
                }

                // Score based on day of week (prefer earlier in week)
                const dayScore = 5 - slotDate.getDay();
                score += dayScore * 2;
                if (dayScore > 3) reasons.push('Earlier in the week');

                return { slot, score: Math.min(100, score), reasons };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    /**
     * Get events for a specific date range
     */
    getEvents(start: Date, end: Date): CalendarEvent[] {
        return this.cachedEvents.filter((e) => {
            const eventStart = new Date(e.start);
            const eventEnd = new Date(e.end);
            return eventStart >= start && eventEnd <= end && e.status !== 'cancelled';
        });
    }

    /**
     * Get today's agenda
     */
    getTodaysAgenda(): CalendarEvent[] {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        return this.getEvents(startOfDay, endOfDay).sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );
    }

    /**
     * Set focus time blocks
     */
    setFocusTimeBlocks(blocks: FocusTimeBlock[]): void {
        this.focusTimeBlocks = blocks;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('moneyloop_focus_blocks', JSON.stringify(blocks));
        }
    }

    /**
     * Get connected providers
     */
    getConnectedProviders(): CalendarProvider[] {
        return Array.from(this.connectedProviders.keys());
    }

    /**
     * Check if any provider is connected
     */
    isConnected(): boolean {
        return this.connectedProviders.size > 0;
    }
}

// Singleton instance
let calendarManager: CalendarManager | null = null;

export function getCalendarManager(): CalendarManager {
    if (!calendarManager) {
        calendarManager = new CalendarManager();
    }
    return calendarManager;
}
