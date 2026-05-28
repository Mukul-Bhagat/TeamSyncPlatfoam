import { CommandRouter } from './CommandRouter';
import type { CommandContext, CommandResult } from './ICommand';

export class APICommandHandler {
  private static instance: APICommandHandler;
  private commandRouter: CommandRouter;

  private constructor() {
    this.commandRouter = CommandRouter.getInstance();
  }

  static getInstance(): APICommandHandler {
    if (!APICommandHandler.instance) {
      APICommandHandler.instance = new APICommandHandler();
    }
    return APICommandHandler.instance;
  }

  /**
   * Handle API command execution
   */
  async handle(
    commandName: string,
    args: Record<string, unknown>,
    userId: string,
    organizationId: string,
    workspaceId?: string,
    channelId?: string
  ): Promise<CommandResult> {
    const context: CommandContext = {
      user_id: userId,
      organization_id: organizationId,
      workspace_id: workspaceId,
      channel_id: channelId,
      source: 'api',
    };

    return this.commandRouter.routeAPICommand(commandName, args, context);
  }

  /**
   * Batch execute multiple commands
   */
  async handleBatch(
    commands: Array<{ command_name: string; args: Record<string, unknown> }>,
    userId: string,
    organizationId: string,
    workspaceId?: string
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const cmd of commands) {
      const result = await this.handle(
        cmd.command_name,
        cmd.args,
        userId,
        organizationId,
        workspaceId
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get available commands for user
   */
  async getAvailableCommands(userId: string): Promise<string[]> {
    return this.commandRouter.getAvailableCommands(userId);
  }

  /**
   * Get command schema
   */
  getCommandSchema(commandName: string): any {
    const command = this.commandRouter.get(commandName);
    if (!command) {
      return null;
    }
    return command.getSchema();
  }

  /**
   * Get all command schemas
   */
  getAllCommandSchemas(): Record<string, any> {
    const commandRegistry = (this.commandRouter as any).commandRegistry;
    return commandRegistry.getAllSchemas();
  }
}
