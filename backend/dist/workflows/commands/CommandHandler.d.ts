import type { ICommand, CommandContext, CommandResult, CommandSchema } from './ICommand';
export declare abstract class BaseCommandHandler implements ICommand {
    protected name: string;
    protected description: string;
    protected requiredCapability?: string;
    constructor(name: string, description: string, requiredCapability?: string);
    abstract execute(args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    abstract validate(args: Record<string, unknown>): boolean;
    abstract getParameters(): Record<string, {
        type: string;
        required: boolean;
        description: string;
    }>;
    getSchema(): CommandSchema;
    getRequiredCapability(): string | undefined;
    protected createSuccessResult(data: unknown, executionId?: string): CommandResult;
    protected createErrorResult(error: string): CommandResult;
}
//# sourceMappingURL=CommandHandler.d.ts.map