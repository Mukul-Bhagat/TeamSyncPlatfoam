"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutor = void 0;
const CommandRouter_1 = require("./CommandRouter");
const WorkflowEngine_1 = require("../engine/WorkflowEngine");
const TriggerEngine_1 = require("../triggers/TriggerEngine");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
class CommandExecutor {
    static instance;
    commandRouter;
    workflowEngine;
    triggerEngine;
    logger;
    constructor() {
        this.commandRouter = CommandRouter_1.CommandRouter.getInstance();
        this.workflowEngine = WorkflowEngine_1.WorkflowEngine.getInstance();
        this.triggerEngine = TriggerEngine_1.TriggerEngine.getInstance();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    static getInstance() {
        if (!CommandExecutor.instance) {
            CommandExecutor.instance = new CommandExecutor();
        }
        return CommandExecutor.instance;
    }
    /**
     * Execute a command through the workflow engine
     */
    async executeThroughWorkflow(commandName, args, context) {
        // First, try to route the command directly
        const directResult = await this.commandRouter.route(commandName, args, context);
        if (directResult.success) {
            return directResult;
        }
        // If direct execution fails, check if there's a workflow triggered by this command
        try {
            const workflowContext = {
                command_name: commandName,
                command_args: args,
                user_id: context.user_id,
                organization_id: context.organization_id,
                workspace_id: context.workspace_id,
            };
            // Find workflows triggered by this command
            // This would require querying the database for command-triggered workflows
            // For now, we'll return the direct result
            return directResult;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Execute command and track history
     */
    async executeWithHistory(commandName, args, context) {
        const result = await this.executeThroughWorkflow(commandName, args, context);
        // TODO: Store command execution history in database
        // This would involve inserting into a command_history table
        return result;
    }
    /**
     * Execute command with retry
     */
    async executeWithRetry(commandName, args, context, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const result = await this.executeThroughWorkflow(commandName, args, context);
            if (result.success) {
                return result;
            }
            lastError = result.error;
            // Exponential backoff
            if (attempt < maxRetries) {
                await this.sleep(Math.pow(2, attempt) * 1000);
            }
        }
        return {
            success: false,
            error: lastError || 'Command execution failed after retries',
        };
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Get command execution history for a user
     */
    async getCommandHistory(userId, limit = 50) {
        // TODO: Query command_history table
        return [];
    }
    /**
     * Get command statistics
     */
    async getCommandStatistics(organizationId, timeRange) {
        // TODO: Query command_history table for statistics
        return {
            total_executions: 0,
            successful_executions: 0,
            failed_executions: 0,
            unique_commands: 0,
        };
    }
}
exports.CommandExecutor = CommandExecutor;
//# sourceMappingURL=CommandExecutor.js.map