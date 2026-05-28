import type { ICommand, CommandContext, CommandResult, CommandSchema } from './ICommand';

export abstract class BaseCommandHandler implements ICommand {
  protected name: string;
  protected description: string;
  protected requiredCapability?: string;

  constructor(name: string, description: string, requiredCapability?: string) {
    this.name = name;
    this.description = description;
    this.requiredCapability = requiredCapability;
  }

  abstract execute(args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
  abstract validate(args: Record<string, unknown>): boolean;
  abstract getParameters(): Record<string, { type: string; required: boolean; description: string }>;

  getSchema(): CommandSchema {
    return {
      name: this.name,
      description: this.description,
      required_capability: this.requiredCapability,
      parameters: this.getParameters(),
    };
  }

  getRequiredCapability(): string | undefined {
    return this.requiredCapability;
  }

  protected createSuccessResult(data: unknown, executionId?: string): CommandResult {
    return {
      success: true,
      data,
      execution_id: executionId,
    };
  }

  protected createErrorResult(error: string): CommandResult {
    return {
      success: false,
      error,
    };
  }
}
