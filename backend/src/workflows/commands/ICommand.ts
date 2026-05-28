export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  execution_id?: string;
}

export interface CommandContext {
  user_id: string;
  organization_id: string;
  workspace_id?: string;
  channel_id?: string;
  source: 'chat' | 'api' | 'AI' | 'workflow';
  metadata?: Record<string, unknown>;
}

export interface CommandSchema {
  name: string;
  description: string;
  required_capability?: string;
  parameters: Record<string, CommandParameter>;
}

export interface CommandParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: unknown;
}

/**
 * ICommand abstraction for all command types
 * Enables extensible command system for AI copilots, workflows, integrations
 */
export interface ICommand {
  /**
   * Execute the command with given arguments and context
   */
  execute(args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;

  /**
   * Validate command arguments
   */
  validate(args: Record<string, unknown>): boolean;

  /**
   * Get command schema for UI/documentation
   */
  getSchema(): CommandSchema;

  /**
   * Get required capability for this command
   */
  getRequiredCapability(): string | undefined;
}
