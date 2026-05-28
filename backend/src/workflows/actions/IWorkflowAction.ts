export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ActionSchema {
  type: string;
  description: string;
  config_schema: Record<string, unknown>;
}

/**
 * IWorkflowAction abstraction for all action types
 * Enables extensible action system for future ecosystem apps
 */
export interface IWorkflowAction {
  /**
   * Execute the action with given config and context
   */
  execute(config: Record<string, unknown>, context: Record<string, unknown>): Promise<ActionResult>;

  /**
   * Validate action configuration
   */
  validate(config: Record<string, unknown>): boolean;

  /**
   * Get action schema for UI/editor
   */
  getSchema(): ActionSchema;
}
