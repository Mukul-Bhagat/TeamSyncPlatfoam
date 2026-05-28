import type { ICommand } from './ICommand';
export declare class CommandRegistry {
    private static instance;
    private commands;
    private commandCapabilities;
    private constructor();
    static getInstance(): CommandRegistry;
    /**
     * Register a command
     */
    register(command: ICommand): void;
    /**
     * Unregister a command
     */
    unregister(commandName: string): void;
    /**
     * Get a command by name
     */
    get(commandName: string): ICommand | undefined;
    /**
     * Get all commands
     */
    getAll(): Map<string, ICommand>;
    /**
     * Get command capability requirement
     */
    getCommandCapability(commandName: string): string | undefined;
    /**
     * Check if command exists
     */
    has(commandName: string): boolean;
    /**
     * Get all command schemas
     */
    getAllSchemas(): Record<string, any>;
    /**
     * Clear all commands
     */
    clear(): void;
}
//# sourceMappingURL=CommandRegistry.d.ts.map