import { ActionRegistry } from './ActionRegistry';
import { WorkflowValidator } from '../engine/WorkflowValidator';

export class ActionValidator {
  private actionRegistry: ActionRegistry;
  private workflowValidator: WorkflowValidator;

  constructor() {
    this.actionRegistry = ActionRegistry.getInstance();
    this.workflowValidator = new WorkflowValidator();
  }

  /**
   * Validate action configuration
   */
  validateActionConfig(actionType: string, config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const action = this.actionRegistry.get(actionType);
    if (!action) {
      return { valid: false, errors: [`Action not found: ${actionType}`] };
    }

    const isValid = action.validate(config);
    if (!isValid) {
      return { valid: false, errors: ['Action configuration validation failed'] };
    }

    // Use workflow validator for additional validation
    return this.workflowValidator.validateActionConfig(actionType, config);
  }

  /**
   * Validate action type exists
   */
  validateActionType(actionType: string): boolean {
    return this.actionRegistry.has(actionType);
  }

  /**
   * Get validation errors for action config
   */
  getValidationErrors(actionType: string, config: Record<string, unknown>): string[] {
    const result = this.validateActionConfig(actionType, config);
    return result.errors;
  }
}
