/**
 * EventReplayHandler - Replay handler for ecosystem events
 * Priority 2: Critical for ecosystem consistency and event recovery
 */
import type { IReplayable, ReplayContext, ReplayResult } from './IReplayable';
export declare class EventReplayHandler implements IReplayable {
    private supabase;
    private eventBus;
    constructor();
    canReplay(entityId: string): Promise<boolean>;
    prepareReplay(entityId: string, options?: {
        fromStep?: string;
        skipSteps?: string[];
        overrideContext?: Record<string, unknown>;
    }): Promise<ReplayContext>;
    executeReplay(context: ReplayContext): Promise<ReplayResult>;
    validateReplaySafety(context: ReplayContext): Promise<{
        safe: boolean;
        reason?: string;
    }>;
    getEntityType(): string;
    private generateUUID;
}
//# sourceMappingURL=EventReplayHandler.d.ts.map