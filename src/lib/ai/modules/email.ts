/**
 * Email Integration Module
 * 
 * Unified email management for Gmail and Outlook.
 * Supports smart drafting, summarization, and priority classification.
 */

export type EmailProvider = 'gmail' | 'outlook';
export type EmailPriority = 'urgent' | 'high' | 'normal' | 'low';
export type EmailCategory = 'work' | 'personal' | 'finance' | 'marketing' | 'social' | 'other';

export interface Email {
    id: string;
    provider: EmailProvider;
    externalId: string;
    threadId: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc: EmailAddress[];
    subject: string;
    snippet: string;
    body: string;
    bodyHtml?: string;
    attachments: Attachment[];
    labels: string[];
    isRead: boolean;
    isStarred: boolean;
    receivedAt: string;
    priority: EmailPriority;
    category: EmailCategory;
    actionItems: string[];
}

export interface EmailAddress {
    email: string;
    name?: string;
}

export interface Attachment {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface EmailDraft {
    to: EmailAddress[];
    cc?: EmailAddress[];
    subject: string;
    body: string;
    replyToId?: string;
}

export interface EmailSummary {
    subject: string;
    sender: string;
    keyPoints: string[];
    suggestedReply?: string;
    actionItems: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
}

// Email Manager Class
export class EmailManager {
    private connectedProviders: Map<EmailProvider, { accessToken: string; refreshToken: string }> = new Map();
    private cachedEmails: Email[] = [];
    private lastSync: string | null = null;

    /**
     * Connect an email provider
     */
    async connect(provider: EmailProvider, authCode: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/email/${provider}/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: authCode }),
            });

            if (!response.ok) throw new Error('Connection failed');

            const tokens = await response.json();
            this.connectedProviders.set(provider, tokens);
            await this.syncInbox(provider);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Disconnect an email provider
     */
    async disconnect(provider: EmailProvider): Promise<void> {
        this.connectedProviders.delete(provider);
        this.cachedEmails = this.cachedEmails.filter((e) => e.provider !== provider);
    }

    /**
     * Sync inbox from all connected providers
     */
    async syncAll(): Promise<Email[]> {
        const allEmails: Email[] = [];

        for (const [provider] of this.connectedProviders) {
            const emails = await this.syncInbox(provider);
            allEmails.push(...emails);
        }

        this.cachedEmails = allEmails;
        this.lastSync = new Date().toISOString();
        return allEmails;
    }

    /**
     * Sync inbox from a specific provider
     */
    async syncInbox(provider: EmailProvider, maxResults: number = 50): Promise<Email[]> {
        const tokens = this.connectedProviders.get(provider);
        if (!tokens) throw new Error(`Provider ${provider} not connected`);

        const response = await fetch(`/api/email/${provider}/messages?maxResults=${maxResults}`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        if (!response.ok) throw new Error('Sync failed');

        const emails: Email[] = await response.json();

        // Classify emails
        return emails.map((email) => ({
            ...email,
            provider,
            priority: this.classifyPriority(email),
            category: this.classifyCategory(email),
            actionItems: this.extractActionItems(email.body),
        }));
    }

    /**
     * Get inbox emails with optional filters
     */
    getInbox(filters?: {
        provider?: EmailProvider;
        priority?: EmailPriority;
        category?: EmailCategory;
        unreadOnly?: boolean;
        limit?: number;
    }): Email[] {
        let emails = [...this.cachedEmails];

        if (filters?.provider) {
            emails = emails.filter((e) => e.provider === filters.provider);
        }

        if (filters?.priority) {
            emails = emails.filter((e) => e.priority === filters.priority);
        }

        if (filters?.category) {
            emails = emails.filter((e) => e.category === filters.category);
        }

        if (filters?.unreadOnly) {
            emails = emails.filter((e) => !e.isRead);
        }

        // Sort by priority then date
        emails.sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
        });

        if (filters?.limit) {
            emails = emails.slice(0, filters.limit);
        }

        return emails;
    }

    /**
     * Get a specific email
     */
    async getEmail(id: string): Promise<Email | null> {
        const cached = this.cachedEmails.find((e) => e.id === id);
        if (cached) return cached;

        // Fetch from server if not cached
        try {
            const response = await fetch(`/api/email/message/${id}`);
            if (response.ok) {
                return response.json();
            }
        } catch {
            // Failed to fetch
        }
        return null;
    }

    /**
     * Mark email as read
     */
    async markAsRead(id: string): Promise<boolean> {
        const email = this.cachedEmails.find((e) => e.id === id);
        if (!email) return false;

        const tokens = this.connectedProviders.get(email.provider);
        if (!tokens) return false;

        const response = await fetch(`/api/email/${email.provider}/messages/${email.externalId}/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        if (response.ok) {
            email.isRead = true;
            return true;
        }
        return false;
    }

    /**
     * Star/unstar an email
     */
    async toggleStar(id: string): Promise<boolean> {
        const email = this.cachedEmails.find((e) => e.id === id);
        if (!email) return false;

        const tokens = this.connectedProviders.get(email.provider);
        if (!tokens) return false;

        const response = await fetch(`/api/email/${email.provider}/messages/${email.externalId}/star`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ starred: !email.isStarred }),
        });

        if (response.ok) {
            email.isStarred = !email.isStarred;
            return true;
        }
        return false;
    }

    /**
     * Send an email
     */
    async sendEmail(draft: EmailDraft, provider: EmailProvider = 'gmail'): Promise<boolean> {
        const tokens = this.connectedProviders.get(provider);
        if (!tokens) throw new Error(`Provider ${provider} not connected`);

        const response = await fetch(`/api/email/${provider}/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft),
        });

        return response.ok;
    }

    /**
     * AI-powered email drafting
     */
    async draftReply(
        emailId: string,
        instructions: string
    ): Promise<{ subject: string; body: string } | null> {
        const email = await this.getEmail(emailId);
        if (!email) return null;

        const response = await fetch('/api/ai/email/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalEmail: {
                    from: email.from,
                    subject: email.subject,
                    body: email.body,
                },
                instructions,
            }),
        });

        if (!response.ok) return null;
        return response.json();
    }

    /**
     * AI-powered email summarization
     */
    async summarizeEmail(emailId: string): Promise<EmailSummary | null> {
        const email = await this.getEmail(emailId);
        if (!email) return null;

        const response = await fetch('/api/ai/email/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: email.from,
                subject: email.subject,
                body: email.body,
            }),
        });

        if (!response.ok) {
            // Fallback: simple extraction
            return {
                subject: email.subject,
                sender: email.from.name || email.from.email,
                keyPoints: this.extractKeyPoints(email.body),
                actionItems: email.actionItems,
                sentiment: 'neutral',
            };
        }

        return response.json();
    }

    /**
     * Get inbox summary (for daily briefing)
     */
    getInboxSummary(): {
        total: number;
        unread: number;
        urgent: number;
        byCategory: Record<EmailCategory, number>;
    } {
        const total = this.cachedEmails.length;
        const unread = this.cachedEmails.filter((e) => !e.isRead).length;
        const urgent = this.cachedEmails.filter((e) => e.priority === 'urgent').length;

        const byCategory: Record<EmailCategory, number> = {
            work: 0,
            personal: 0,
            finance: 0,
            marketing: 0,
            social: 0,
            other: 0,
        };

        for (const email of this.cachedEmails) {
            byCategory[email.category]++;
        }

        return { total, unread, urgent, byCategory };
    }

    /**
     * Search emails
     */
    searchEmails(query: string, limit: number = 20): Email[] {
        const lowerQuery = query.toLowerCase();

        return this.cachedEmails
            .filter(
                (email) =>
                    email.subject.toLowerCase().includes(lowerQuery) ||
                    email.snippet.toLowerCase().includes(lowerQuery) ||
                    email.from.email.toLowerCase().includes(lowerQuery) ||
                    (email.from.name && email.from.name.toLowerCase().includes(lowerQuery))
            )
            .slice(0, limit);
    }

    /**
     * Get connected providers
     */
    getConnectedProviders(): EmailProvider[] {
        return Array.from(this.connectedProviders.keys());
    }

    /**
     * Check if any provider is connected
     */
    isConnected(): boolean {
        return this.connectedProviders.size > 0;
    }

    // Private methods

    private classifyPriority(email: Email): EmailPriority {
        const subject = email.subject.toLowerCase();
        const body = email.body.toLowerCase();
        const combined = `${subject} ${body}`;

        if (combined.includes('urgent') || combined.includes('asap') || combined.includes('immediately')) {
            return 'urgent';
        }

        if (
            combined.includes('important') ||
            combined.includes('deadline') ||
            combined.includes('required')
        ) {
            return 'high';
        }

        if (
            combined.includes('fyi') ||
            combined.includes('newsletter') ||
            combined.includes('unsubscribe')
        ) {
            return 'low';
        }

        return 'normal';
    }

    private classifyCategory(email: Email): EmailCategory {
        const fromEmail = email.from.email.toLowerCase();
        const subject = email.subject.toLowerCase();

        // Finance
        if (
            fromEmail.includes('bank') ||
            fromEmail.includes('paypal') ||
            fromEmail.includes('venmo') ||
            subject.includes('payment') ||
            subject.includes('invoice') ||
            subject.includes('statement')
        ) {
            return 'finance';
        }

        // Marketing
        if (
            subject.includes('sale') ||
            subject.includes('offer') ||
            subject.includes('% off') ||
            subject.includes('unsubscribe')
        ) {
            return 'marketing';
        }

        // Social
        if (
            fromEmail.includes('linkedin') ||
            fromEmail.includes('facebook') ||
            fromEmail.includes('twitter')
        ) {
            return 'social';
        }

        // Work (common work domains or keywords)
        if (subject.includes('meeting') || subject.includes('project') || subject.includes('review')) {
            return 'work';
        }

        return 'other';
    }

    private extractActionItems(body: string): string[] {
        const items: string[] = [];
        const patterns = [
            /please\s+(?:can\s+you\s+)?(.+?)(?:\.|$)/gi,
            /could\s+you\s+(.+?)(?:\.|$)/gi,
            /need\s+(?:you\s+to\s+)?(.+?)(?:\.|$)/gi,
            /action\s+required:\s*(.+?)(?:\.|$)/gi,
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(body)) !== null) {
                const item = match[1].trim();
                if (item.length > 10 && item.length < 200) {
                    items.push(item);
                }
            }
        }

        return items.slice(0, 5); // Max 5 action items
    }

    private extractKeyPoints(body: string): string[] {
        // Simple extraction: first sentence of each paragraph
        return body
            .split(/\n\n+/)
            .map((para) => para.split(/[.!?]/)[0]?.trim())
            .filter((point) => point && point.length > 20 && point.length < 200)
            .slice(0, 5);
    }
}

// Singleton instance
let emailManager: EmailManager | null = null;

export function getEmailManager(): EmailManager {
    if (!emailManager) {
        emailManager = new EmailManager();
    }
    return emailManager;
}
