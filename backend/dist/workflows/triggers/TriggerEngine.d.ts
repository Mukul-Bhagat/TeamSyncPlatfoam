import type { EcosystemEvent } from '../../types';
export declare class TriggerEngine {
    private static instance;
    private eventBus;
    private triggerRegistry;
    private logger;
    private workflowEngine;
    private constructor();
    static getInstance(): TriggerEngine;
    /**
     * Register a trigger for a workflow
     */
    registerTrigger(workflowId: string, triggerType: string, config: Record<string, unknown>): Promise<void>;
    /**
     * Unregister a trigger
     */
    unregisterTrigger(workflowId: string): Promise<void>;
    /**
     * Handle event trigger
     */
    private handleEventTrigger;
    /**
     * Handle manual trigger
     */
    handleManualTrigger(workflowId: string, context: Record<string, unknown>): Promise<void>;
    /**
     * Handle AI trigger
     */
    handleAITrigger(workflowId: string, context: Record<string, unknown>): Promise<void>;
    /**
     * Handle command trigger
     */
    handleCommandTrigger(workflowId: string, context: Record<string, unknown>): Promise<void>;
    /**
     * Evaluate all triggers for a given event
     */
    evaluateEventTriggers(event: EcosystemEvent): Promise<string[]>;
    /**
     * Get all registered triggers
     */
    getAllTriggers(): Map<string, any>;
}
//# sourceMappingURL=TriggerEngine.d.ts.map