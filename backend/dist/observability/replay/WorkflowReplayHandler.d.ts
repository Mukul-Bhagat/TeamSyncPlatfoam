/**
 * WorkflowReplayHandler - Replay handler for workflow executions
 * Priority 1: Operationally critical for orchestration reliability
 */
import type { IReplayable, ReplayContext, ReplayResult } from './IReplayable';
export declare class WorkflowReplayHandler implements IReplayable {
    private supabase;
    private workflowEngine;
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
}
//# sourceMappingURL=WorkflowReplayHandler.d.ts.map