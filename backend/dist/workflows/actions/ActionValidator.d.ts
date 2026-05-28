export declare class ActionValidator {
    private actionRegistry;
    private workflowValidator;
    constructor();
    /**
     * Validate action configuration
     */
    validateActionConfig(actionType: string, config: Record<string, unknown>): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Validate action type exists
     */
    validateActionType(actionType: string): boolean;
    /**
     * Get validation errors for action config
     */
    getValidationErrors(actionType: string, config: Record<string, unknown>): string[];
}
//# sourceMappingURL=ActionValidator.d.ts.map