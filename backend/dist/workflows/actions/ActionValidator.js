"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionValidator = void 0;
const ActionRegistry_1 = require("./ActionRegistry");
const WorkflowValidator_1 = require("../engine/WorkflowValidator");
class ActionValidator {
    actionRegistry;
    workflowValidator;
    constructor() {
        this.actionRegistry = ActionRegistry_1.ActionRegistry.getInstance();
        this.workflowValidator = new WorkflowValidator_1.WorkflowValidator();
    }
    /**
     * Validate action configuration
     */
    validateActionConfig(actionType, config) {
        const action = this.actionRegistry.get(actionType);
        if (!action) {
            return { valid: false, errors: [`Action not found: ${actionType}`] };
        }
        const isValid = action.validate(config);
        if (!isValid) {
            return { valid: false, errors: ['Action configuration validation failed'] };
        }
        // Use workflow validator for additional validation
        return this.workflowValidator.validateActionConfig(actionType, config);
    }
    /**
     * Validate action type exists
     */
    validateActionType(actionType) {
        return this.actionRegistry.has(actionType);
    }
    /**
     * Get validation errors for action config
     */
    getValidationErrors(actionType, config) {
        const result = this.validateActionConfig(actionType, config);
        return result.errors;
    }
}
exports.ActionValidator = ActionValidator;
//# sourceMappingURL=ActionValidator.js.map