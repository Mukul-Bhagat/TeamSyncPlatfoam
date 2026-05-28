import type { CommandResult } from './ICommand';
export declare class APICommandHandler {
    private static instance;
    private commandRouter;
    private constructor();
    static getInstance(): APICommandHandler;
    /**
     * Handle API command execution
     */
    handle(commandName: string, args: Record<string, unknown>, userId: string, organizationId: string, workspaceId?: string, channelId?: string): Promise<CommandResult>;
    /**
     * Batch execute multiple commands
     */
    handleBatch(commands: Array<{
        command_name: string;
        args: Record<string, unknown>;
    }>, userId: string, organizationId: string, workspaceId?: string): Promise<CommandResult[]>;
    /**
     * Get available commands for user
     */
    getAvailableCommands(userId: string): Promise<string[]>;
    /**
     * Get command schema
     */
    getCommandSchema(commandName: string): any;
    /**
     * Get all command schemas
     */
    getAllCommandSchemas(): Record<string, any>;
}
//# sourceMappingURL=APICommandHandler.d.ts.map