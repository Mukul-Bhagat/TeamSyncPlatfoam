import type { IWorkflowAction } from './IWorkflowAction';
export declare class ActionRegistry {
    private static instance;
    private coreActions;
    private dynamicActions;
    private constructor();
    static getInstance(): ActionRegistry;
    /**
     * Register a core action (built-in)
     */
    registerCoreAction(actionType: string, action: IWorkflowAction): void;
    /**
     * Register a dynamic action (from ecosystem apps)
     */
    registerDynamicAction(actionType: string, action: IWorkflowAction): void;
    /**
     * Unregister an action
     */
    unregister(actionType: string): void;
    /**
     * Get an action (core takes precedence)
     */
    get(actionType: string): IWorkflowAction | undefined;
    /**
     * Get all core actions
     */
    getCoreActions(): Map<string, IWorkflowAction>;
    /**
     * Get all dynamic actions
     */
    getDynamicActions(): Map<string, IWorkflowAction>;
    /**
     * Get all actions
     */
    getAllActions(): Map<string, IWorkflowAction>;
    /**
     * Check if action type exists
     */
    has(actionType: string): boolean;
    /**
     * Clear all actions
     */
    clear(): void;
}
//# sourceMappingURL=ActionRegistry.d.ts.map