/**
 * Notes & Thoughts Module
 * 
 * Intelligent note-taking and thought organization system.
 * Supports capture, tagging, synthesis, and action item extraction.
 */

export type NoteType = 'quick' | 'journal' | 'meeting' | 'idea' | 'task' | 'reference';

export interface Note {
    id: string;
    title: string;
    content: string;
    type: NoteType;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
    linkedNotes: string[];
    actionItems: ActionItem[];
    source?: {
        type: 'voice' | 'text' | 'email' | 'meeting';
        reference?: string;
    };
}

export interface ActionItem {
    id: string;
    text: string;
    completed: boolean;
    dueDate?: string;
    assignee?: string;
    priority: 'low' | 'medium' | 'high';
}

export interface NoteSearchResult {
    note: Note;
    score: number;
    matchedContent: string;
}

export interface NoteSynthesis {
    summary: string;
    keyPoints: string[];
    actionItems: ActionItem[];
    relatedTopics: string[];
}

// Notes Manager Class
export class NotesManager {
    private notes: Map<string, Note> = new Map();
    private searchIndex: Map<string, Set<string>> = new Map(); // word -> noteIds

    constructor() {
        this.loadNotes();
    }

    /**
     * Create a new note
     */
    async createNote(
        input: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'linkedNotes' | 'actionItems'>
    ): Promise<Note> {
        const note: Note = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            linkedNotes: [],
            actionItems: [],
        };

        // Extract action items from content
        note.actionItems = this.extractActionItems(note.content);

        // Auto-tag based on content
        note.tags = [...new Set([...input.tags, ...this.suggestTags(note.content)])];

        // Find and link related notes
        note.linkedNotes = this.findRelatedNotes(note).map((n) => n.id);

        this.notes.set(note.id, note);
        this.indexNote(note);
        this.saveNotes();

        // Sync to server
        await this.syncNote(note);

        return note;
    }

    /**
     * Quick capture - create a note with minimal input
     */
    async quickCapture(content: string): Promise<Note> {
        // Infer title from first line or first few words
        const firstLine = content.split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;

        // Infer type from content
        const type = this.inferNoteType(content);

        return this.createNote({
            title,
            content,
            type,
            tags: [],
            source: { type: 'text' },
        });
    }

    /**
     * Update a note
     */
    async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
        const note = this.notes.get(id);
        if (!note) return null;

        Object.assign(note, updates, { updatedAt: new Date().toISOString() });

        // Re-extract action items if content changed
        if (updates.content) {
            note.actionItems = this.extractActionItems(note.content);
        }

        // Re-index
        this.indexNote(note);
        this.saveNotes();
        await this.syncNote(note);

        return note;
    }

    /**
     * Delete a note
     */
    async deleteNote(id: string): Promise<boolean> {
        const note = this.notes.get(id);
        if (!note) return false;

        this.notes.delete(id);
        this.removeFromIndex(id);
        this.saveNotes();

        // Remove from linked notes
        for (const [, otherNote] of this.notes) {
            otherNote.linkedNotes = otherNote.linkedNotes.filter((linkedId) => linkedId !== id);
        }

        await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        return true;
    }

    /**
     * Archive a note
     */
    async archiveNote(id: string): Promise<Note | null> {
        return this.updateNote(id, { archivedAt: new Date().toISOString() });
    }

    /**
     * Search notes
     */
    search(query: string, limit: number = 20): NoteSearchResult[] {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const scores: Map<string, number> = new Map();
        const matchedContent: Map<string, string> = new Map();

        for (const word of words) {
            // Exact match
            const exactMatches = this.searchIndex.get(word);
            if (exactMatches) {
                for (const noteId of exactMatches) {
                    scores.set(noteId, (scores.get(noteId) || 0) + 10);
                }
            }

            // Prefix match
            for (const [indexWord, noteIds] of this.searchIndex) {
                if (indexWord.startsWith(word) && indexWord !== word) {
                    for (const noteId of noteIds) {
                        scores.set(noteId, (scores.get(noteId) || 0) + 5);
                    }
                }
            }
        }

        // Find matched content snippets
        for (const [noteId] of scores) {
            const note = this.notes.get(noteId);
            if (note) {
                const lowerContent = note.content.toLowerCase();
                for (const word of words) {
                    const index = lowerContent.indexOf(word);
                    if (index !== -1) {
                        const start = Math.max(0, index - 30);
                        const end = Math.min(note.content.length, index + word.length + 30);
                        matchedContent.set(noteId, '...' + note.content.substring(start, end) + '...');
                        break;
                    }
                }
            }
        }

        return Array.from(scores.entries())
            .filter(([noteId]) => !this.notes.get(noteId)?.archivedAt)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([noteId, score]) => ({
                note: this.notes.get(noteId)!,
                score,
                matchedContent: matchedContent.get(noteId) || '',
            }));
    }

    /**
     * Get all notes (with optional filters)
     */
    getNotes(filters?: {
        type?: NoteType;
        tags?: string[];
        includeArchived?: boolean;
        limit?: number;
    }): Note[] {
        let notes = Array.from(this.notes.values());

        if (!filters?.includeArchived) {
            notes = notes.filter((n) => !n.archivedAt);
        }

        if (filters?.type) {
            notes = notes.filter((n) => n.type === filters.type);
        }

        if (filters?.tags && filters.tags.length > 0) {
            notes = notes.filter((n) => filters.tags!.some((tag) => n.tags.includes(tag)));
        }

        // Sort by updated date
        notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        if (filters?.limit) {
            notes = notes.slice(0, filters.limit);
        }

        return notes;
    }

    /**
     * Get a specific note
     */
    getNote(id: string): Note | undefined {
        return this.notes.get(id);
    }

    /**
     * Toggle action item completion
     */
    async toggleActionItem(noteId: string, actionItemId: string): Promise<boolean> {
        const note = this.notes.get(noteId);
        if (!note) return false;

        const actionItem = note.actionItems.find((a) => a.id === actionItemId);
        if (!actionItem) return false;

        actionItem.completed = !actionItem.completed;
        note.updatedAt = new Date().toISOString();

        this.saveNotes();
        await this.syncNote(note);
        return true;
    }

    /**
     * Synthesize multiple notes into a summary
     */
    async synthesize(noteIds: string[]): Promise<NoteSynthesis | null> {
        const notes = noteIds.map((id) => this.notes.get(id)).filter(Boolean) as Note[];
        if (notes.length === 0) return null;

        const combinedContent = notes.map((n) => `## ${n.title}\n${n.content}`).join('\n\n');

        // Use AI to synthesize
        const response = await fetch('/api/ai/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: combinedContent }),
        });

        if (!response.ok) {
            // Fallback: simple extraction
            return {
                summary: notes.map((n) => n.title).join(', '),
                keyPoints: notes.flatMap((n) => n.content.split('\n').filter((l) => l.startsWith('- '))),
                actionItems: notes.flatMap((n) => n.actionItems),
                relatedTopics: [...new Set(notes.flatMap((n) => n.tags))],
            };
        }

        return response.json();
    }

    /**
     * Get all unique tags
     */
    getAllTags(): string[] {
        const tags = new Set<string>();
        for (const note of this.notes.values()) {
            note.tags.forEach((tag) => tags.add(tag));
        }
        return Array.from(tags).sort();
    }

    /**
     * Get uncompleted action items across all notes
     */
    getPendingActionItems(): Array<ActionItem & { noteId: string; noteTitle: string }> {
        const items: Array<ActionItem & { noteId: string; noteTitle: string }> = [];

        for (const note of this.notes.values()) {
            if (note.archivedAt) continue;
            for (const item of note.actionItems) {
                if (!item.completed) {
                    items.push({ ...item, noteId: note.id, noteTitle: note.title });
                }
            }
        }

        // Sort by priority and due date
        return items.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return a.dueDate ? -1 : b.dueDate ? 1 : 0;
        });
    }

    // Private methods

    private extractActionItems(content: string): ActionItem[] {
        const items: ActionItem[] = [];
        const patterns = [
            /\[\s*\]\s*(.+)/gm, // [ ] task
            /TODO:\s*(.+)/gi, // TODO: task
            /ACTION:\s*(.+)/gi, // ACTION: task
            /- \[\s*\]\s*(.+)/gm, // - [ ] task (markdown)
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                items.push({
                    id: crypto.randomUUID(),
                    text: match[1].trim(),
                    completed: false,
                    priority: this.inferPriority(match[1]),
                });
            }
        }

        return items;
    }

    private inferPriority(text: string): ActionItem['priority'] {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('!')) {
            return 'high';
        }
        if (lowerText.includes('soon') || lowerText.includes('important')) {
            return 'medium';
        }
        return 'low';
    }

    private inferNoteType(content: string): NoteType {
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('meeting') || lowerContent.includes('attendees')) {
            return 'meeting';
        }
        if (lowerContent.includes('idea') || lowerContent.includes('concept')) {
            return 'idea';
        }
        if (content.match(/\[\s*\]|TODO:|ACTION:/i)) {
            return 'task';
        }
        if (content.length < 200) {
            return 'quick';
        }
        return 'journal';
    }

    private suggestTags(content: string): string[] {
        const tags: string[] = [];
        const lowerContent = content.toLowerCase();

        // Finance-related
        if (lowerContent.match(/budget|money|expense|invest|save|finance/)) {
            tags.push('finance');
        }

        // Work-related
        if (lowerContent.match(/meeting|project|deadline|client|work/)) {
            tags.push('work');
        }

        // Personal
        if (lowerContent.match(/health|exercise|family|personal/)) {
            tags.push('personal');
        }

        // Goals
        if (lowerContent.match(/goal|target|objective|plan/)) {
            tags.push('goals');
        }

        return tags;
    }

    private findRelatedNotes(note: Note): Note[] {
        const relatedScores: Map<string, number> = new Map();

        for (const [id, otherNote] of this.notes) {
            if (id === note.id) continue;

            let score = 0;

            // Tag overlap
            const commonTags = note.tags.filter((t) => otherNote.tags.includes(t));
            score += commonTags.length * 5;

            // Type match
            if (note.type === otherNote.type) {
                score += 2;
            }

            // Content word overlap (simple)
            const noteWords = new Set(note.content.toLowerCase().split(/\s+/));
            const otherWords = otherNote.content.toLowerCase().split(/\s+/);
            const overlap = otherWords.filter((w) => noteWords.has(w) && w.length > 4).length;
            score += Math.min(overlap, 10);

            if (score > 5) {
                relatedScores.set(id, score);
            }
        }

        return Array.from(relatedScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => this.notes.get(id)!)
            .filter(Boolean);
    }

    private indexNote(note: Note): void {
        const words = `${note.title} ${note.content} ${note.tags.join(' ')}`
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2);

        for (const word of words) {
            if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, new Set());
            }
            this.searchIndex.get(word)!.add(note.id);
        }
    }

    private removeFromIndex(noteId: string): void {
        for (const [, noteIds] of this.searchIndex) {
            noteIds.delete(noteId);
        }
    }

    private loadNotes(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const stored = localStorage.getItem('moneyloop_notes');
            if (stored) {
                const notesArray: Note[] = JSON.parse(stored);
                for (const note of notesArray) {
                    this.notes.set(note.id, note);
                    this.indexNote(note);
                }
            }
        } catch {
            // Failed to load
        }
    }

    private saveNotes(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem('moneyloop_notes', JSON.stringify(Array.from(this.notes.values())));
        } catch {
            // Storage full
        }
    }

    private async syncNote(note: Note): Promise<void> {
        try {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            });
        } catch {
            // Failed to sync, will retry later
        }
    }
}

// Singleton instance
let notesManager: NotesManager | null = null;

export function getNotesManager(): NotesManager {
    if (!notesManager) {
        notesManager = new NotesManager();
    }
    return notesManager;
}
