import type { CommandContext, CommandResult } from './ICommand';
export declare class CommandExecutor {
    private static instance;
    private commandRouter;
    private workflowEngine;
    private triggerEngine;
    private logger;
    private constructor();
    static getInstance(): CommandExecutor;
    /**
     * Execute a command through the workflow engine
     */
    executeThroughWorkflow(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Execute command and track history
     */
    executeWithHistory(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Execute command with retry
     */
    executeWithRetry(commandName: string, args: Record<string, unknown>, context: CommandContext, maxRetries?: number): Promise<CommandResult>;
    private sleep;
    /**
     * Get command execution history for a user
     */
    getCommandHistory(userId: string, limit?: number): Promise<Array<{
        command: string;
        args: Record<string, unknown>;
        executed_at: string;
        result: CommandResult;
    }>>;
    /**
     * Get command statistics
     */
    getCommandStatistics(organizationId: string, timeRange?: string): Promise<Record<string, number>>;
}
//# sourceMappingURL=CommandExecutor.d.ts.map