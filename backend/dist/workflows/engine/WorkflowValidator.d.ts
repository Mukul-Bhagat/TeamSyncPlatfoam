import type { WorkflowDefinition } from './WorkflowEngine';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare class WorkflowValidator {
    /**
     * Validate workflow definition
     */
    validate(definition: WorkflowDefinition): ValidationResult;
    /**
     * Validate a workflow step
     */
    private validateStep;
    /**
     * Validate retry policy
     */
    private validateRetryPolicy;
    /**
     * Validate error handling
     */
    private validateErrorHandling;
    /**
     * Validate action configuration
     */
    validateActionConfig(actionType: string, config: Record<string, unknown>): ValidationResult;
}
//# sourceMappingURL=WorkflowValidator.d.ts.map