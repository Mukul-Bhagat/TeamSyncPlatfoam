import type { ICommand } from './ICommand';

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, ICommand> = new Map();
  private commandCapabilities: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  /**
   * Register a command
   */
  register(command: ICommand): void {
    const schema = command.getSchema();
    this.commands.set(schema.name, command);
    this.commandCapabilities.set(schema.name, schema.required_capability || '');
  }

  /**
   * Unregister a command
   */
  unregister(commandName: string): void {
    this.commands.delete(commandName);
    this.commandCapabilities.delete(commandName);
  }

  /**
   * Get a command by name
   */
  get(commandName: string): ICommand | undefined {
    return this.commands.get(commandName);
  }

  /**
   * Get all commands
   */
  getAll(): Map<string, ICommand> {
    return new Map(this.commands);
  }

  /**
   * Get command capability requirement
   */
  getCommandCapability(commandName: string): string | undefined {
    return this.commandCapabilities.get(commandName);
  }

  /**
   * Check if command exists
   */
  has(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  /**
   * Get all command schemas
   */
  getAllSchemas(): Record<string, any> {
    const schemas: Record<string, any> = {};
    this.commands.forEach((command, name) => {
      schemas[name] = command.getSchema();
    });
    return schemas;
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.commandCapabilities.clear();
  }
}
