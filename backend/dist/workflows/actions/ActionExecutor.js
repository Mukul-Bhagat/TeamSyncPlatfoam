"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutor = void 0;
const ActionRegistry_1 = require("./ActionRegistry");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
const WorkflowValidator_1 = require("../engine/WorkflowValidator");
class ActionExecutor {
    actionRegistry;
    logger;
    validator;
    constructor() {
        this.actionRegistry = ActionRegistry_1.ActionRegistry.getInstance();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
        this.validator = new WorkflowValidator_1.WorkflowValidator();
    }
    /**
     * Execute an action
     */
    async executeAction(actionType, config, context) {
        const action = this.actionRegistry.get(actionType);
        if (!action) {
            throw new Error(`Action not found: ${actionType}`);
        }
        // Validate action config
        const validation = this.validator.validateActionConfig(actionType, config);
        if (!validation.valid) {
            throw new Error(`Invalid action config: ${validation.errors.join(', ')}`);
        }
        try {
            const result = await action.execute(config, context);
            this.logger.logActionExecuted('execution', actionType, result);
            if (!result.success) {
                this.logger.logActionFailed('execution', actionType, result.error || 'Unknown error');
                throw new Error(result.error || 'Action execution failed');
            }
            return result.data;
        }
        catch (error) {
            this.logger.logActionFailed('execution', actionType, error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
    /**
     * Execute multiple actions in sequence
     */
    async executeActions(actions, context) {
        const results = {};
        for (const action of actions) {
            try {
                const result = await this.executeAction(action.action_type, action.action_config, context);
                results[action.action_type] = result;
            }
            catch (error) {
                results[action.action_type] = { error: error instanceof Error ? error.message : String(error) };
            }
        }
        return results;
    }
    /**
     * Get action schema
     */
    getActionSchema(actionType) {
        const action = this.actionRegistry.get(actionType);
        if (!action) {
            throw new Error(`Action not found: ${actionType}`);
        }
        return action.getSchema();
    }
    /**
     * Get all action schemas
     */
    getAllActionSchemas() {
        const schemas = {};
        const actions = this.actionRegistry.getAllActions();
        actions.forEach((action, actionType) => {
            schemas[actionType] = action.getSchema();
        });
        return schemas;
    }
}
exports.ActionExecutor = ActionExecutor;
//# sourceMappingURL=ActionExecutor.js.map