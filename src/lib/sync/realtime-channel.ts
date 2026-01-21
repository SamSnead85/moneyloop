/**
 * Real-time Sync Channel System
 * 
 * Supabase Realtime integration for household-level synchronization.
 * Supports presence indicators and collaborative editing.
 * 
 * Super-Sprint 2: Phases 126-150
 */

import { createClient, RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export interface PresenceState {
    odySaerId: string;
    name: string;
    avatar?: string;
    currentPage?: string;
    lastActive: Date;
    isTyping?: boolean;
    editingEntity?: { type: string; id: string };
}

export interface SyncMessage {
    type: 'update' | 'delete' | 'create' | 'broadcast';
    entity: string;
    entityId?: string;
    payload: Record<string, unknown>;
    userId: string;
    timestamp: Date;
}

export interface RealtimeConfig {
    householdId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
}

type MessageHandler = (message: SyncMessage) => void;
type PresenceHandler = (state: Record<string, PresenceState[]>) => void;

class RealtimeSyncChannel {
    private channel: RealtimeChannel | null = null;
    private supabase: ReturnType<typeof createClient>;
    private config: RealtimeConfig;
    private messageHandlers: Set<MessageHandler> = new Set();
    private presenceHandlers: Set<PresenceHandler> = new Set();
    private currentPresence: PresenceState;
    private isConnected: boolean = false;

    constructor(supabaseUrl: string, supabaseKey: string, config: RealtimeConfig) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.config = config;
        this.currentPresence = {
            odySaerId: config.userId,
            name: config.userName,
            avatar: config.userAvatar,
            lastActive: new Date(),
        };
    }

    /**
     * Connect to the household channel
     */
    async connect(): Promise<void> {
        if (this.isConnected) return;

        const channelName = `household:${this.config.householdId}`;

        this.channel = this.supabase.channel(channelName, {
            config: {
                presence: { key: this.config.userId },
                broadcast: { self: false },
            },
        });

        // Handle presence sync
        this.channel.on('presence', { event: 'sync' }, () => {
            const state = this.channel?.presenceState() as RealtimePresenceState<PresenceState>;
            const transformed = this.transformPresenceState(state);
            this.presenceHandlers.forEach(handler => handler(transformed));
        });

        // Handle presence join
        this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('Member joined:', newPresences);
        });

        // Handle presence leave
        this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('Member left:', leftPresences);
        });

        // Handle broadcast messages
        this.channel.on('broadcast', { event: 'sync' }, ({ payload }) => {
            const message = payload as SyncMessage;
            this.messageHandlers.forEach(handler => handler(message));
        });

        // Subscribe and track presence
        await this.channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                this.isConnected = true;
                await this.channel?.track(this.currentPresence);
            }
        });
    }

    /**
     * Transform Supabase presence state to our format
     */
    private transformPresenceState(
        state: RealtimePresenceState<PresenceState>
    ): Record<string, PresenceState[]> {
        const result: Record<string, PresenceState[]> = {};
        for (const [key, presences] of Object.entries(state)) {
            result[key] = presences.map(p => ({
                odySaerId: p.odySaerId,
                name: p.name,
                avatar: p.avatar,
                currentPage: p.currentPage,
                lastActive: new Date(p.lastActive),
                isTyping: p.isTyping,
                editingEntity: p.editingEntity,
            }));
        }
        return result;
    }

    /**
     * Disconnect from the channel
     */
    async disconnect(): Promise<void> {
        if (this.channel) {
            await this.supabase.removeChannel(this.channel);
            this.channel = null;
            this.isConnected = false;
        }
    }

    /**
     * Broadcast a sync message to all household members
     */
    async broadcast(message: Omit<SyncMessage, 'userId' | 'timestamp'>): Promise<void> {
        if (!this.channel || !this.isConnected) return;

        await this.channel.send({
            type: 'broadcast',
            event: 'sync',
            payload: {
                ...message,
                userId: this.config.userId,
                timestamp: new Date(),
            },
        });
    }

    /**
     * Update current user's presence
     */
    async updatePresence(updates: Partial<PresenceState>): Promise<void> {
        if (!this.channel || !this.isConnected) return;

        this.currentPresence = {
            ...this.currentPresence,
            ...updates,
            lastActive: new Date(),
        };

        await this.channel.track(this.currentPresence);
    }

    /**
     * Set typing indicator
     */
    async setTyping(isTyping: boolean): Promise<void> {
        await this.updatePresence({ isTyping });
    }

    /**
     * Set currently editing entity
     */
    async setEditing(entity: { type: string; id: string } | undefined): Promise<void> {
        await this.updatePresence({ editingEntity: entity });
    }

    /**
     * Set current page
     */
    async setCurrentPage(page: string): Promise<void> {
        await this.updatePresence({ currentPage: page });
    }

    /**
     * Register message handler
     */
    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    /**
     * Register presence handler
     */
    onPresence(handler: PresenceHandler): () => void {
        this.presenceHandlers.add(handler);
        return () => this.presenceHandlers.delete(handler);
    }

    /**
     * Get current channel state
     */
    getState(): { isConnected: boolean; memberCount: number } {
        const presences = this.channel?.presenceState() || {};
        return {
            isConnected: this.isConnected,
            memberCount: Object.keys(presences).length,
        };
    }
}

// Singleton instance manager
const channels: Map<string, RealtimeSyncChannel> = new Map();

/**
 * Get or create a sync channel for a household
 */
export function getHouseholdChannel(
    supabaseUrl: string,
    supabaseKey: string,
    config: RealtimeConfig
): RealtimeSyncChannel {
    const key = `${config.householdId}:${config.userId}`;

    if (!channels.has(key)) {
        channels.set(key, new RealtimeSyncChannel(supabaseUrl, supabaseKey, config));
    }

    return channels.get(key)!;
}

/**
 * Disconnect all channels
 */
export async function disconnectAllChannels(): Promise<void> {
    for (const channel of channels.values()) {
        await channel.disconnect();
    }
    channels.clear();
}

export { RealtimeSyncChannel };

export default {
    getHouseholdChannel,
    disconnectAllChannels,
};
