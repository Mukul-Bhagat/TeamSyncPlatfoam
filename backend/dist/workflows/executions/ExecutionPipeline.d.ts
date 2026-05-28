import type { EcosystemEvent } from '../../../types';
export interface PipelineContext {
    trigger_event?: EcosystemEvent;
    user_id?: string;
    organization_id: string;
    workspace_id?: string;
    metadata?: Record<string, unknown>;
}
export declare class ExecutionPipeline {
    private static instance;
    private workflowEngine;
    private triggerEngine;
    private actionExecutor;
    private stateTracker;
    private logger;
    private eventBus;
    private constructor();
    static getInstance(): ExecutionPipeline;
    /**
     * Execute the full pipeline: Trigger → Validation → Execution → Tracking → Notifications
     */
    execute(workflowId: string, context: PipelineContext): Promise<string>;
    /**
     * Validate trigger conditions
     */
    private validateTrigger;
    /**
     * Track execution metadata
     */
    private trackExecution;
    /**
     * Send notifications based on execution result
     */
    private sendNotifications;
    /**
     * Publish realtime updates
     */
    private publishRealtimeUpdates;
    /**
     * Execute pipeline with retry
     */
    executeWithRetry(workflowId: string, context: PipelineContext, maxRetries?: number): Promise<string>;
    private sleep;
}
//# sourceMappingURL=ExecutionPipeline.d.ts.map