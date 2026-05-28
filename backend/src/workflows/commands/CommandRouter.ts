import { CommandRegistry } from './CommandRegistry';
import { CapabilityChecker } from '../capabilities/CapabilityChecker';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import type { ICommand, CommandContext, CommandResult } from './ICommand';

export class CommandRouter {
  private static instance: CommandRouter;
  private commandRegistry: CommandRegistry;
  private capabilityChecker: CapabilityChecker;
  private logger: WorkflowLogger;

  private constructor() {
    this.commandRegistry = CommandRegistry.getInstance();
    this.capabilityChecker = CapabilityChecker.getInstance();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): CommandRouter {
    if (!CommandRouter.instance) {
      CommandRouter.instance = new CommandRouter();
    }
    return CommandRouter.instance;
  }

  /**
   * Route a command to its handler
   */
  async route(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    const command = this.commandRegistry.get(commandName);
    if (!command) {
      return {
        success: false,
        error: `Command not found: ${commandName}`,
      };
    }

    // Check capability requirement
    const requiredCapability = command.getRequiredCapability();
    if (requiredCapability) {
      const hasCapability = await this.capabilityChecker.checkCapability(
        context.user_id,
        requiredCapability
      );
      this.logger.logCapabilityCheck(context.user_id, requiredCapability, hasCapability);

      if (!hasCapability) {
        return {
          success: false,
          error: `User lacks required capability: ${requiredCapability}`,
        };
      }
    }

    // Validate arguments
    const isValid = command.validate(args);
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid command arguments',
      };
    }

    // Execute command
    try {
      const result = await command.execute(args, context);
      this.logger.logCommandExecuted(commandName, result.execution_id || '', context.user_id);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Route a slash command from chat
   */
  async routeSlashCommand(
    commandString: string,
    context: CommandContext
  ): Promise<CommandResult> {
    const { commandName, args } = this.parseSlashCommand(commandString);
    return this.route(commandName, args, context);
  }

  /**
   * Route an API command
   */
  async routeAPICommand(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    context.source = 'api';
    return this.route(commandName, args, context);
  }

  /**
   * Route an AI-triggered command
   */
  async routeAICommand(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    context.source = 'AI';
    return this.route(commandName, args, context);
  }

  /**
   * Route a workflow-triggered command
   */
  async routeWorkflowCommand(
    commandName: string,
    args: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    context.source = 'workflow';
    return this.route(commandName, args, context);
  }

  /**
   * Parse slash command string
   */
  private parseSlashCommand(commandString: string): { commandName: string; args: Record<string, unknown> } {
    const parts = commandString.trim().split(/\s+/);
    const commandName = parts[0].replace(/^\//, '');
    const args: Record<string, unknown> = {};

    // Simple argument parsing - can be extended
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const key = part.substring(2);
        const value = parts[i + 1];
        if (value && !value.startsWith('--')) {
          args[key] = value;
          i++;
        } else {
          args[key] = true;
        }
      } else {
        args[`arg${i}`] = part;
      }
    }

    return { commandName, args };
  }

  /**
   * Get all available commands for a user
   */
  async getAvailableCommands(userId: string): Promise<string[]> {
    const commands: string[] = [];
    const allCommands = this.commandRegistry.getAll();

    for (const [name, command] of allCommands) {
      const requiredCapability = command.getRequiredCapability();
      if (!requiredCapability) {
        commands.push(name);
      } else {
        const hasCapability = await this.capabilityChecker.checkCapability(userId, requiredCapability);
        if (hasCapability) {
          commands.push(name);
        }
      }
    }

    return commands;
  }
}
