import { ActionRegistry } from './ActionRegistry';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import { WorkflowValidator } from '../engine/WorkflowValidator';

export class ActionExecutor {
  private actionRegistry: ActionRegistry;
  private logger: WorkflowLogger;
  private validator: WorkflowValidator;

  constructor() {
    this.actionRegistry = ActionRegistry.getInstance();
    this.logger = new WorkflowLogger();
    this.validator = new WorkflowValidator();
  }

  /**
   * Execute an action
   */
  async executeAction(
    actionType: string,
    config: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<unknown> {
    const action = this.actionRegistry.get(actionType);
    if (!action) {
      throw new Error(`Action not found: ${actionType}`);
    }

    // Validate action config
    const validation = this.validator.validateActionConfig(actionType, config);
    if (!validation.valid) {
      throw new Error(`Invalid action config: ${validation.errors.join(', ')}`);
    }

    try {
      const result = await action.execute(config, context);
      this.logger.logActionExecuted('execution', actionType, result);

      if (!result.success) {
        this.logger.logActionFailed('execution', actionType, result.error || 'Unknown error');
        throw new Error(result.error || 'Action execution failed');
      }

      return result.data;
    } catch (error) {
      this.logger.logActionFailed('execution', actionType, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Execute multiple actions in sequence
   */
  async executeActions(
    actions: Array<{ action_type: string; action_config: Record<string, unknown> }>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    for (const action of actions) {
      try {
        const result = await this.executeAction(action.action_type, action.action_config, context);
        results[action.action_type] = result;
      } catch (error) {
        results[action.action_type] = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    return results;
  }

  /**
   * Get action schema
   */
  getActionSchema(actionType: string): any {
    const action = this.actionRegistry.get(actionType);
    if (!action) {
      throw new Error(`Action not found: ${actionType}`);
    }
    return action.getSchema();
  }

  /**
   * Get all action schemas
   */
  getAllActionSchemas(): Record<string, any> {
    const schemas: Record<string, any> = {};
    const actions = this.actionRegistry.getAllActions();

    actions.forEach((action, actionType) => {
      schemas[actionType] = action.getSchema();
    });

    return schemas;
  }
}
