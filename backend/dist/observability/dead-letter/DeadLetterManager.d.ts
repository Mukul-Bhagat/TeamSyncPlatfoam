/**
 * DeadLetterManager - Manages dead letter events with layered persistence
 *
 * Extends the EventBus dead letter log with database persistence.
 * Layered approach:
 * - In-memory cache for recent failures (fast debugging)
 * - Database table for persistence (replay, auditing, analysis)
 */
import type { EcosystemEvent } from '../../types';
export interface DeadLetterEvent {
    id: string;
    sourceSystem: string;
    eventType: string;
    payload: Record<string, unknown>;
    errorMessage: string;
    retryCount: number;
    failedAt: Date;
    replayedAt?: Date;
    organizationId?: string;
    workspaceId?: string;
    metadata: Record<string, unknown>;
}
export declare class DeadLetterManager {
    private static instance;
    private supabase;
    private inMemoryCache;
    private readonly CACHE_SIZE;
    private constructor();
    static getInstance(): DeadLetterManager;
    /**
     * Add a dead letter event
     */
    addDeadLetter(sourceSystem: string, event: EcosystemEvent, errorMessage: string, organizationId?: string, workspaceId?: string): Promise<void>;
    /**
     * Get recent dead letter events from cache
     */
    getRecentDeadLetters(limit?: number): Array<{
        event: EcosystemEvent;
        error: string;
        timestamp: string;
    }>;
    /**
     * Get dead letter events from database
     */
    getDeadLetterEvents(options?: {
        sourceSystem?: string;
        eventType?: string;
        organizationId?: string;
        workspaceId?: string;
        limit?: number;
        offset?: number;
    }): Promise<DeadLetterEvent[]>;
    /**
     * Get dead letter event by ID
     */
    getDeadLetterEvent(id: string): Promise<DeadLetterEvent | null>;
    /**
     * Mark a dead letter event as replayed
     */
    markAsReplayed(id: string): Promise<void>;
    /**
     * Increment retry count for a dead letter event
     */
    incrementRetryCount(id: string): Promise<void>;
    /**
     * Delete old dead letter events
     */
    cleanup(retentionDays?: number): Promise<number>;
    /**
     * Get dead letter statistics
     */
    getStatistics(options?: {
        organizationId?: string;
        workspaceId?: string;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<{
        total: number;
        bySourceSystem: Record<string, number>;
        byEventType: Record<string, number>;
        replayed: number;
        pending: number;
    }>;
    /**
     * Clear in-memory cache
     */
    clearCache(): void;
}
//# sourceMappingURL=DeadLetterManager.d.ts.map