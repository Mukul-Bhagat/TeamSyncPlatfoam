"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APICommandHandler = void 0;
const CommandRouter_1 = require("./CommandRouter");
class APICommandHandler {
    static instance;
    commandRouter;
    constructor() {
        this.commandRouter = CommandRouter_1.CommandRouter.getInstance();
    }
    static getInstance() {
        if (!APICommandHandler.instance) {
            APICommandHandler.instance = new APICommandHandler();
        }
        return APICommandHandler.instance;
    }
    /**
     * Handle API command execution
     */
    async handle(commandName, args, userId, organizationId, workspaceId, channelId) {
        const context = {
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
    async handleBatch(commands, userId, organizationId, workspaceId) {
        const results = [];
        for (const cmd of commands) {
            const result = await this.handle(cmd.command_name, cmd.args, userId, organizationId, workspaceId);
            results.push(result);
        }
        return results;
    }
    /**
     * Get available commands for user
     */
    async getAvailableCommands(userId) {
        return this.commandRouter.getAvailableCommands(userId);
    }
    /**
     * Get command schema
     */
    getCommandSchema(commandName) {
        const command = this.commandRouter.get(commandName);
        if (!command) {
            return null;
        }
        return command.getSchema();
    }
    /**
     * Get all command schemas
     */
    getAllCommandSchemas() {
        const commandRegistry = this.commandRouter.commandRegistry;
        return commandRegistry.getAllSchemas();
    }
}
exports.APICommandHandler = APICommandHandler;
//# sourceMappingURL=APICommandHandler.js.map