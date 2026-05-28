import type { CommandContext, CommandResult } from './ICommand';
export declare class CommandRouter {
    private static instance;
    private commandRegistry;
    private capabilityChecker;
    private logger;
    private constructor();
    static getInstance(): CommandRouter;
    /**
     * Route a command to its handler
     */
    route(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Route a slash command from chat
     */
    routeSlashCommand(commandString: string, context: CommandContext): Promise<CommandResult>;
    /**
     * Route an API command
     */
    routeAPICommand(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Route an AI-triggered command
     */
    routeAICommand(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Route a workflow-triggered command
     */
    routeWorkflowCommand(commandName: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
    /**
     * Parse slash command string
     */
    private parseSlashCommand;
    /**
     * Get all available commands for a user
     */
    getAvailableCommands(userId: string): Promise<string[]>;
}
//# sourceMappingURL=CommandRouter.d.ts.map