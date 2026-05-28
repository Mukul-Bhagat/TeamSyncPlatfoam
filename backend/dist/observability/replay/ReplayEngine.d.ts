/**
 * ReplayEngine - Orchestrates replay operations
 *
 * Manages replay job lifecycle, enforces idempotency, deduplication, and retry protection.
 * Coordinates replay handlers for different entity types.
 */
import type { IReplayable } from './IReplayable';
export declare class ReplayEngine {
    private static instance;
    private supabase;
    private handlers;
    private activeReplays;
    private constructor();
    static getInstance(): ReplayEngine;
    /**
     * Register a replay handler for an entity type
     */
    registerHandler(handler: IReplayable): void;
    /**
     * Unregister a replay handler
     */
    unregisterHandler(entityType: string): void;
    /**
     * Start a replay for an entity
     */
    startReplay(entityType: string, entityId: string, options?: {
        fromStep?: string;
        skipSteps?: string[];
        overrideContext?: Record<string, unknown>;
        organizationId?: string;
        workspaceId?: string;
        createdBy?: string;
    }): Promise<string>;
    /**
     * Execute replay asynchronously
     */
    private executeReplayAsync;
    /**
     * Get replay job by ID
     */
    getReplayJob(jobId: string): Promise<any | null>;
    /**
     * Get replay jobs for an entity
     */
    getReplayJobs(entityType: string, entityId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<any[]>;
    /**
     * Cancel a replay job
     */
    cancelReplay(jobId: string): Promise<void>;
    /**
     * Get replay statistics
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
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        successRate: number;
    }>;
    /**
     * Get active replay count
     */
    getActiveReplayCount(): number;
}
//# sourceMappingURL=ReplayEngine.d.ts.map