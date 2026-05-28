"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
class CommandRegistry {
    static instance;
    commands = new Map();
    commandCapabilities = new Map();
    constructor() { }
    static getInstance() {
        if (!CommandRegistry.instance) {
            CommandRegistry.instance = new CommandRegistry();
        }
        return CommandRegistry.instance;
    }
    /**
     * Register a command
     */
    register(command) {
        const schema = command.getSchema();
        this.commands.set(schema.name, command);
        this.commandCapabilities.set(schema.name, schema.required_capability || '');
    }
    /**
     * Unregister a command
     */
    unregister(commandName) {
        this.commands.delete(commandName);
        this.commandCapabilities.delete(commandName);
    }
    /**
     * Get a command by name
     */
    get(commandName) {
        return this.commands.get(commandName);
    }
    /**
     * Get all commands
     */
    getAll() {
        return new Map(this.commands);
    }
    /**
     * Get command capability requirement
     */
    getCommandCapability(commandName) {
        return this.commandCapabilities.get(commandName);
    }
    /**
     * Check if command exists
     */
    has(commandName) {
        return this.commands.has(commandName);
    }
    /**
     * Get all command schemas
     */
    getAllSchemas() {
        const schemas = {};
        this.commands.forEach((command, name) => {
            schemas[name] = command.getSchema();
        });
        return schemas;
    }
    /**
     * Clear all commands
     */
    clear() {
        this.commands.clear();
        this.commandCapabilities.clear();
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=CommandRegistry.js.map