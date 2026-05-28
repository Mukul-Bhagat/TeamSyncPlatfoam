"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowValidator = void 0;
class WorkflowValidator {
    /**
     * Validate workflow definition
     */
    validate(definition) {
        const errors = [];
        // Validate trigger
        if (!definition.trigger || Object.keys(definition.trigger).length === 0) {
            errors.push('Workflow must have a trigger configuration');
        }
        // Validate steps
        if (!definition.steps || !Array.isArray(definition.steps) || definition.steps.length === 0) {
            errors.push('Workflow must have at least one step');
        }
        else {
            definition.steps.forEach((step, index) => {
                const stepErrors = this.validateStep(step, index);
                errors.push(...stepErrors);
            });
        }
        // Validate retry policy if present
        if (definition.retry_policy) {
            const retryErrors = this.validateRetryPolicy(definition.retry_policy);
            errors.push(...retryErrors);
        }
        // Validate error handling if present
        if (definition.error_handling) {
            const errorHandlingErrors = this.validateErrorHandling(definition.error_handling);
            errors.push(...errorHandlingErrors);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate a workflow step
     */
    validateStep(step, index) {
        const errors = [];
        if (!step.id) {
            errors.push(`Step ${index}: Missing step id`);
        }
        if (!step.action_type) {
            errors.push(`Step ${index}: Missing action_type`);
        }
        if (!step.action_config || typeof step.action_config !== 'object') {
            errors.push(`Step ${index}: Missing or invalid action_config`);
        }
        if (step.on_failure && !['continue', 'stop', 'retry'].includes(step.on_failure)) {
            errors.push(`Step ${index}: Invalid on_failure value, must be one of: continue, stop, retry`);
        }
        return errors;
    }
    /**
     * Validate retry policy
     */
    validateRetryPolicy(policy) {
        const errors = [];
        if (typeof policy.max_attempts !== 'number' || policy.max_attempts < 1) {
            errors.push('Retry policy: max_attempts must be a positive number');
        }
        if (!['linear', 'exponential'].includes(policy.backoff_strategy)) {
            errors.push('Retry policy: backoff_strategy must be one of: linear, exponential');
        }
        if (typeof policy.initial_delay_ms !== 'number' || policy.initial_delay_ms < 0) {
            errors.push('Retry policy: initial_delay_ms must be a non-negative number');
        }
        return errors;
    }
    /**
     * Validate error handling
     */
    validateErrorHandling(handling) {
        const errors = [];
        if (!['continue', 'stop', 'retry'].includes(handling.on_failure)) {
            errors.push('Error handling: on_failure must be one of: continue, stop, retry');
        }
        if (typeof handling.notify_on_failure !== 'boolean') {
            errors.push('Error handling: notify_on_failure must be a boolean');
        }
        return errors;
    }
    /**
     * Validate action configuration
     */
    validateActionConfig(actionType, config) {
        const errors = [];
        // Common validation
        if (!config || Object.keys(config).length === 0) {
            errors.push('Action config cannot be empty');
        }
        // Action-specific validation
        switch (actionType) {
            case 'send_notification':
                if (!config.recipient) {
                    errors.push('send_notification: Missing recipient');
                }
                if (!config.message) {
                    errors.push('send_notification: Missing message');
                }
                break;
            case 'create_incident':
                if (!config.title) {
                    errors.push('create_incident: Missing title');
                }
                if (!config.severity) {
                    errors.push('create_incident: Missing severity');
                }
                break;
            case 'trigger_webhook':
                if (!config.url) {
                    errors.push('trigger_webhook: Missing url');
                }
                break;
            case 'AI_analysis':
                if (!config.prompt) {
                    errors.push('AI_analysis: Missing prompt');
                }
                break;
            default:
                // For custom actions, just validate that config is present
                break;
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.WorkflowValidator = WorkflowValidator;
//# sourceMappingURL=WorkflowValidator.js.map