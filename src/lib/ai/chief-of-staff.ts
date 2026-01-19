/**
 * AI Chief of Staff - Core Intelligence Engine
 * 
 * Multi-model AI orchestration for personal productivity:
 * - Scheduling & calendar management
 * - Notes & thought organization
 * - Strategic planning & analysis
 * - Autonomous task execution
 */

// Types
export type AIProvider = 'claude' | 'gemini' | 'openai';
export type TaskCategory = 'finance' | 'calendar' | 'notes' | 'email' | 'strategy' | 'general';

export interface ChiefOfStaffConfig {
    primaryProvider: AIProvider;
    fallbackProvider: AIProvider;
    enableAutonomousActions: boolean;
    requireApprovalForHighRisk: boolean;
}

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        model?: string;
        tokensUsed?: number;
        actionsTaken?: string[];
    };
}

export interface PendingAction {
    id: string;
    type: 'calendar' | 'email' | 'transaction' | 'reminder' | 'note';
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    payload: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected' | 'executed';
    createdAt: string;
}

export interface Memory {
    id: string;
    content: string;
    category: 'preference' | 'goal' | 'context' | 'insight';
    importance: number; // 1-10
    createdAt: string;
    lastAccessedAt: string;
}

export interface ChiefOfStaffState {
    isProcessing: boolean;
    currentProvider: AIProvider;
    conversationHistory: ConversationMessage[];
    pendingActions: PendingAction[];
    memories: Memory[];
}

// Provider configurations for multi-model routing
const PROVIDER_CONFIG = {
    claude: {
        name: 'Claude',
        endpoint: '/api/ai/claude',
        bestFor: ['reasoning', 'analysis', 'strategy', 'writing'],
        maxTokens: 4096,
    },
    gemini: {
        name: 'Gemini',
        endpoint: '/api/ai/gemini',
        bestFor: ['speed', 'research', 'summarization', 'extraction'],
        maxTokens: 8192,
    },
    openai: {
        name: 'GPT-4',
        endpoint: '/api/ai/openai',
        bestFor: ['creativity', 'coding', 'versatile'],
        maxTokens: 4096,
    },
} as const;

// Task routing intelligence
const TASK_ROUTING: Record<TaskCategory, AIProvider> = {
    finance: 'claude',      // Best reasoning for financial analysis
    calendar: 'gemini',     // Fast for scheduling lookups
    notes: 'claude',        // Best for organization & synthesis
    email: 'openai',        // Versatile for drafting
    strategy: 'claude',     // Deep reasoning for planning
    general: 'gemini',      // Fast default
};

/**
 * Chief of Staff Intelligence Engine
 */
export class ChiefOfStaff {
    private config: ChiefOfStaffConfig;
    private state: ChiefOfStaffState;
    private listeners: Set<(state: ChiefOfStaffState) => void> = new Set();

    constructor(config: Partial<ChiefOfStaffConfig> = {}) {
        this.config = {
            primaryProvider: 'claude',
            fallbackProvider: 'gemini',
            enableAutonomousActions: true,
            requireApprovalForHighRisk: true,
            ...config,
        };

        this.state = {
            isProcessing: false,
            currentProvider: this.config.primaryProvider,
            conversationHistory: [],
            pendingActions: [],
            memories: [],
        };

        this.loadMemories();
    }

    /**
     * Process a user message and generate a response
     */
    async chat(
        message: string,
        context?: { category?: TaskCategory; userId?: string }
    ): Promise<{ response: string; actions: PendingAction[] }> {
        this.state.isProcessing = true;
        this.notifyListeners();

        // Add user message to history
        const userMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        this.state.conversationHistory.push(userMessage);

        try {
            // Route to optimal provider based on task
            const category = context?.category || this.classifyTask(message);
            const provider = TASK_ROUTING[category];
            this.state.currentProvider = provider;

            // Build system prompt with memories and context
            const systemPrompt = this.buildSystemPrompt(category);

            // Call AI provider
            const response = await this.callProvider(provider, message, systemPrompt);

            // Extract any actions from response
            const actions = this.extractActions(response);

            // Add to pending if approval required
            if (actions.length > 0 && this.config.requireApprovalForHighRisk) {
                const highRiskActions = actions.filter((a) => a.riskLevel === 'high');
                this.state.pendingActions.push(...highRiskActions);

                // Auto-execute low risk actions if autonomous mode enabled
                if (this.config.enableAutonomousActions) {
                    const lowRiskActions = actions.filter((a) => a.riskLevel === 'low');
                    await Promise.all(lowRiskActions.map((a) => this.executeAction(a)));
                }
            }

            // Add assistant message to history
            const assistantMessage: ConversationMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
                metadata: {
                    model: provider,
                    actionsTaken: actions.map((a) => a.type),
                },
            };
            this.state.conversationHistory.push(assistantMessage);

            // Extract and store any memories
            await this.extractMemories(message, response);

            return { response, actions };
        } catch (error) {
            // Fallback to secondary provider
            console.error(`Primary provider failed, falling back:`, error);
            const fallbackResponse = await this.callProvider(
                this.config.fallbackProvider,
                message,
                ''
            );
            return { response: fallbackResponse, actions: [] };
        } finally {
            this.state.isProcessing = false;
            this.notifyListeners();
        }
    }

    /**
     * Approve a pending action for execution
     */
    async approveAction(actionId: string): Promise<boolean> {
        const action = this.state.pendingActions.find((a) => a.id === actionId);
        if (!action || action.status !== 'pending') return false;

        action.status = 'approved';
        const success = await this.executeAction(action);
        action.status = success ? 'executed' : 'pending';
        this.notifyListeners();
        return success;
    }

    /**
     * Reject a pending action
     */
    rejectAction(actionId: string): boolean {
        const action = this.state.pendingActions.find((a) => a.id === actionId);
        if (!action || action.status !== 'pending') return false;

        action.status = 'rejected';
        this.notifyListeners();
        return true;
    }

    /**
     * Get current state
     */
    getState(): ChiefOfStaffState {
        return { ...this.state };
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback: (state: ChiefOfStaffState) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.state.conversationHistory = [];
        this.notifyListeners();
    }

    // Private methods

    private classifyTask(message: string): TaskCategory {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.match(/budget|expense|spend|money|bill|pay|transfer|account/)) {
            return 'finance';
        }
        if (lowerMessage.match(/schedule|meeting|calendar|appointment|event|time/)) {
            return 'calendar';
        }
        if (lowerMessage.match(/note|thought|idea|remember|write|journal/)) {
            return 'notes';
        }
        if (lowerMessage.match(/email|message|reply|draft|send|inbox/)) {
            return 'email';
        }
        if (lowerMessage.match(/plan|strategy|goal|objective|analyze|decision/)) {
            return 'strategy';
        }

        return 'general';
    }

    private buildSystemPrompt(category: TaskCategory): string {
        const relevantMemories = this.state.memories
            .filter((m) => m.importance >= 5)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 10)
            .map((m) => m.content)
            .join('\n');

        return `You are the Chief of Staff AI assistant for MoneyLoop, a personal productivity and finance platform.

Your role is to help the user organize their:
- Financial life (budgets, bills, transactions, savings goals)
- Schedule (calendar, meetings, events)
- Thoughts and notes (capture, organize, synthesize)
- Strategic planning (goal setting, decision making, analysis)

Current focus: ${category}

Key context about the user:
${relevantMemories || 'No specific preferences stored yet.'}

Guidelines:
1. Be proactive but not intrusive
2. Suggest actions when appropriate, but clearly indicate what you're proposing
3. For financial matters, always prioritize accuracy and security
4. For scheduling, respect existing commitments and preferences
5. Help organize and synthesize information, not just store it
6. When asked to take action, be explicit about what you will do

You can propose actions in your response using this format:
[ACTION:type:riskLevel] description

Where type is: calendar, email, transaction, reminder, note
And riskLevel is: low, medium, high`;
    }

    private async callProvider(
        provider: AIProvider,
        message: string,
        systemPrompt: string
    ): Promise<string> {
        const config = PROVIDER_CONFIG[provider];

        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                systemPrompt,
                history: this.state.conversationHistory.slice(-10),
                maxTokens: config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`Provider ${provider} failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || data.content || data.text;
    }

    private extractActions(response: string): PendingAction[] {
        const actionPattern = /\[ACTION:(\w+):(\w+)\]\s*(.+?)(?=\[ACTION:|$)/g;
        const actions: PendingAction[] = [];
        let match;

        while ((match = actionPattern.exec(response)) !== null) {
            actions.push({
                id: crypto.randomUUID(),
                type: match[1] as PendingAction['type'],
                riskLevel: match[2] as PendingAction['riskLevel'],
                description: match[3].trim(),
                payload: {},
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
        }

        return actions;
    }

    private async executeAction(action: PendingAction): Promise<boolean> {
        try {
            const response = await fetch('/api/chief-of-staff/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action),
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    private async extractMemories(userMessage: string, response: string): Promise<void> {
        // Simple heuristic extraction - could be enhanced with AI
        const preferencePhrases = [
            /i (?:prefer|like|always|never|usually|want)/i,
            /my (?:goal|preference|style|habit)/i,
        ];

        for (const pattern of preferencePhrases) {
            if (pattern.test(userMessage)) {
                const memory: Memory = {
                    id: crypto.randomUUID(),
                    content: userMessage,
                    category: 'preference',
                    importance: 5,
                    createdAt: new Date().toISOString(),
                    lastAccessedAt: new Date().toISOString(),
                };
                this.state.memories.push(memory);
                this.saveMemories();
                break;
            }
        }
    }

    private loadMemories(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const stored = localStorage.getItem('moneyloop_chief_memories');
            if (stored) {
                this.state.memories = JSON.parse(stored);
            }
        } catch {
            this.state.memories = [];
        }
    }

    private saveMemories(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem('moneyloop_chief_memories', JSON.stringify(this.state.memories));
        } catch {
            // Storage full
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach((callback) => callback({ ...this.state }));
    }
}

// Singleton instance
let chiefOfStaff: ChiefOfStaff | null = null;

export function getChiefOfStaff(config?: Partial<ChiefOfStaffConfig>): ChiefOfStaff {
    if (!chiefOfStaff) {
        chiefOfStaff = new ChiefOfStaff(config);
    }
    return chiefOfStaff;
}

// React hook placeholder
export function useChiefOfStaff(): ChiefOfStaffState {
    return getChiefOfStaff().getState();
}
