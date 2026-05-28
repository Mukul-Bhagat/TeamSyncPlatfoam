export declare class ActionExecutor {
    private actionRegistry;
    private logger;
    private validator;
    constructor();
    /**
     * Execute an action
     */
    executeAction(actionType: string, config: Record<string, unknown>, context: Record<string, unknown>): Promise<unknown>;
    /**
     * Execute multiple actions in sequence
     */
    executeActions(actions: Array<{
        action_type: string;
        action_config: Record<string, unknown>;
    }>, context: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Get action schema
     */
    getActionSchema(actionType: string): any;
    /**
     * Get all action schemas
     */
    getAllActionSchemas(): Record<string, any>;
}
//# sourceMappingURL=ActionExecutor.d.ts.map