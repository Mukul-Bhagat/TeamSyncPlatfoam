import { CommandRouter } from './CommandRouter';
import { WorkflowEngine } from '../engine/WorkflowEngine';
import { TriggerEngine } from '../triggers/TriggerEngine';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import type { CommandContext, CommandResult } from './ICommand';

export class CommandExecutor {
  private static instance: CommandExecutor;
  private commandRouter: CommandRouter;
  private workflowEngine: WorkflowEngine;
  private triggerEngine: TriggerEngine;
  private logger: WorkflowLogger;

  private constructor() {
    this.commandRouter = CommandRouter.getInstance();
    this.workflowEngine = WorkflowEngine.getInstance();
    this.triggerEngine = TriggerEngine.getInstance();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): CommandExecutor {
    if (!CommandExecutor.instance) {
      CommandExecutor.instance = new CommandExecutor();
    }
    return CommandExecutor.instance;
  }

  /**
   * Execute a command through the workflow engine
   */
  async executeThroughWorkflow(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    // First, try to route the command directly
    const directResult = await this.commandRouter.route(commandName, args, context);
    if (directResult.success) {
      return directResult;
    }

    // If direct execution fails, check if there's a workflow triggered by this command
    try {
      const workflowContext = {
        command_name: commandName,
        command_args: args,
        user_id: context.user_id,
        organization_id: context.organization_id,
        workspace_id: context.workspace_id,
      };

      // Find workflows triggered by this command
      // This would require querying the database for command-triggered workflows
      // For now, we'll return the direct result
      return directResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute command and track history
   */
  async executeWithHistory(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    const result = await this.executeThroughWorkflow(commandName, args, context);

    // TODO: Store command execution history in database
    // This would involve inserting into a command_history table

    return result;
  }

  /**
   * Execute command with retry
   */
  async executeWithRetry(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext,
    maxRetries: number = 3
  ): Promise<CommandResult> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.executeThroughWorkflow(commandName, args, context);
      if (result.success) {
        return result;
      }
      lastError = result.error;

      // Exponential backoff
      if (attempt < maxRetries) {
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    return {
      success: false,
      error: lastError || 'Command execution failed after retries',
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get command execution history for a user
   */
  async getCommandHistory(
    userId: string,
    limit: number = 50
  ): Promise<Array<{ command: string; args: Record<string, unknown>; executed_at: string; result: CommandResult }>> {
    // TODO: Query command_history table
    return [];
  }

  /**
   * Get command statistics
   */
  async getCommandStatistics(
    organizationId: string,
    timeRange?: string
  ): Promise<Record<string, number>> {
    // TODO: Query command_history table for statistics
    return {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      unique_commands: 0,
    };
  }
}
