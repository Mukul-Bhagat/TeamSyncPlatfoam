import type { IWorkflowAction } from './IWorkflowAction';
export declare class DynamicActionRegistry {
    private static instance;
    private actionRegistry;
    private constructor();
    static getInstance(): DynamicActionRegistry;
    /**
     * Register a dynamic action from an ecosystem app
     */
    registerDynamicAction(actionType: string, action: IWorkflowAction, sourceApp: string): void;
    /**
     * Unregister a dynamic action
     */
    unregisterDynamicAction(actionType: string, sourceApp: string): void;
    /**
     * Get all dynamic actions
     */
    getDynamicActions(): Map<string, IWorkflowAction>;
    /**
     * Clear all dynamic actions (e.g., on app uninstall)
     */
    clearDynamicActions(sourceApp: string): void;
}
//# sourceMappingURL=DynamicActionRegistry.d.ts.map