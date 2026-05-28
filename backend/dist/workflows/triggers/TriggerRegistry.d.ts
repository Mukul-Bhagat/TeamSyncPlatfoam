import type { ITrigger } from './ITrigger';
export interface TriggerRegistration {
    workflowId: string;
    triggerType: string;
    trigger: ITrigger;
}
export declare class TriggerRegistry {
    private static instance;
    private registrations;
    private constructor();
    static getInstance(): TriggerRegistry;
    /**
     * Register a trigger for a workflow
     */
    register(workflowId: string, triggerType: string, trigger: ITrigger): void;
    /**
     * Unregister a trigger
     */
    unregister(workflowId: string): void;
    /**
     * Get trigger registration for a workflow
     */
    get(workflowId: string): TriggerRegistration | undefined;
    /**
     * Get all registrations
     */
    getAll(): TriggerRegistration[];
    /**
     * Get registrations by trigger type
     */
    getByType(triggerType: string): TriggerRegistration[];
    /**
     * Create a trigger instance based on type
     */
    createTrigger(triggerType: string, config: Record<string, unknown>): ITrigger;
    /**
     * Clear all registrations
     */
    clear(): void;
}
//# sourceMappingURL=TriggerRegistry.d.ts.map