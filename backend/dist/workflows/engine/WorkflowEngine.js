"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
const WorkflowValidator_1 = require("./WorkflowValidator");
const WorkflowStateTracker_1 = require("./WorkflowStateTracker");
const WorkflowLogger_1 = require("./WorkflowLogger");
const TriggerEngine_1 = require("../triggers/TriggerEngine");
const ActionExecutor_1 = require("../actions/ActionExecutor");
class WorkflowEngine {
    static instance;
    supabase;
    eventBus;
    validator;
    stateTracker;
    logger;
    triggerEngine;
    actionExecutor;
    registeredWorkflows = new Map();
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.eventBus = InternalEventBus_1.InternalEventBus.getInstance();
        this.validator = new WorkflowValidator_1.WorkflowValidator();
        this.stateTracker = new WorkflowStateTracker_1.WorkflowStateTracker();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
        this.triggerEngine = TriggerEngine_1.TriggerEngine.getInstance();
        this.actionExecutor = new ActionExecutor_1.ActionExecutor();
    }
    static getInstance() {
        if (!WorkflowEngine.instance) {
            WorkflowEngine.instance = new WorkflowEngine();
        }
        return WorkflowEngine.instance;
    }
    /**
     * Register a workflow
     */
    async registerWorkflow(workflow) {
        // Validate workflow definition
        const validation = this.validator.validate(workflow.workflow_definition);
        if (!validation.valid) {
            throw new Error(`Invalid workflow definition: ${validation.errors.join(', ')}`);
        }
        // Store in registry
        this.registeredWorkflows.set(workflow.id, workflow);
        // Register trigger with trigger engine
        await this.triggerEngine.registerTrigger(workflow.id, workflow.trigger_type, workflow.workflow_definition.trigger);
        this.logger.logWorkflowRegistered(workflow.id, workflow.name);
    }
    /**
     * Unregister a workflow
     */
    async unregisterWorkflow(workflowId) {
        this.registeredWorkflows.delete(workflowId);
        await this.triggerEngine.unregisterTrigger(workflowId);
        this.logger.logWorkflowUnregistered(workflowId);
    }
    /**
     * Execute a workflow
     */
    async executeWorkflow(workflowId, triggerEventId, context) {
        const workflow = this.registeredWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        if (!workflow.enabled) {
            throw new Error(`Workflow is disabled: ${workflowId}`);
        }
        // Create execution record
        const execution = await this.createExecution(workflowId, triggerEventId, context);
        try {
            // Update status to running
            await this.stateTracker.updateExecutionStatus(execution.id, 'running');
            this.logger.logExecutionStarted(execution.id, workflowId);
            // Execute workflow steps
            const results = await this.executeSteps(workflow, execution);
            // Update status to completed
            await this.stateTracker.updateExecutionStatus(execution.id, 'completed');
            await this.stateTracker.completeExecution(execution.id);
            this.logger.logExecutionCompleted(execution.id, workflowId);
            // Publish workflow completed event
            await this.publishWorkflowEvent('workflow.completed', {
                workflow_id: workflowId,
                execution_id: execution.id,
                status: 'completed',
                results,
            });
            return execution;
        }
        catch (error) {
            // Update status to failed
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.stateTracker.updateExecutionStatus(execution.id, 'failed');
            await this.stateTracker.failExecution(execution.id, errorMessage);
            this.logger.logExecutionFailed(execution.id, workflowId, errorMessage);
            // Publish workflow failed event
            await this.publishWorkflowEvent('workflow.failed', {
                workflow_id: workflowId,
                execution_id: execution.id,
                status: 'failed',
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Execute workflow steps
     */
    async executeSteps(workflow, execution) {
        const results = [];
        const definition = workflow.workflow_definition;
        for (const step of definition.steps) {
            try {
                // Check conditions
                if (step.conditions && !this.evaluateConditions([step.conditions], execution.execution_context)) {
                    this.logger.logStepSkipped(execution.id, step.id, 'Conditions not met');
                    continue;
                }
                // Execute action
                const result = await this.actionExecutor.executeAction(step.action_type, step.action_config, execution.execution_context);
                results.push({ step_id: step.id, result });
                // Update execution context with result
                execution.execution_context[step.id] = result;
                this.logger.logStepCompleted(execution.id, step.id);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.logStepFailed(execution.id, step.id, errorMessage);
                // Handle failure based on step configuration
                if (step.on_failure === 'continue') {
                    results.push({ step_id: step.id, error: errorMessage });
                    continue;
                }
                else if (step.on_failure === 'retry') {
                    const retryPolicy = definition.retry_policy;
                    if (retryPolicy) {
                        await this.retryStep(step, retryPolicy, execution);
                        continue;
                    }
                }
                // Default: stop execution
                throw error;
            }
        }
        return results;
    }
    /**
     * Evaluate step conditions
     */
    evaluateConditions(conditions, context) {
        // Simple condition evaluation - can be extended
        for (const condition of conditions) {
            if (condition.field && condition.operator && condition.value) {
                const fieldValue = this.getNestedValue(context, condition.field);
                if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
                    return false;
                }
            }
        }
        return true;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    evaluateCondition(value, operator, expected) {
        switch (operator) {
            case 'equals':
                return value === expected;
            case 'not_equals':
                return value !== expected;
            case 'contains':
                return typeof value === 'string' && value.includes(expected);
            case 'greater_than':
                return typeof value === 'number' && value > expected;
            case 'less_than':
                return typeof value === 'number' && value < expected;
            default:
                return false;
        }
    }
    /**
     * Retry a failed step
     */
    async retryStep(step, retryPolicy, execution) {
        const maxAttempts = retryPolicy.max_attempts;
        const delay = retryPolicy.initial_delay_ms;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.sleep(delay * attempt); // Simple backoff
            try {
                await this.actionExecutor.executeAction(step.action_type, step.action_config, execution.execution_context);
                this.logger.logStepRetrySuccess(execution.id, step.id, attempt);
                return;
            }
            catch (error) {
                this.logger.logStepRetryFailed(execution.id, step.id, attempt);
                if (attempt === maxAttempts) {
                    throw error;
                }
            }
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Create execution record
     */
    async createExecution(workflowId, triggerEventId, context) {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .insert({
            workflow_id: workflowId,
            status: 'pending',
            trigger_event_id: triggerEventId,
            execution_context: context || {},
            metadata: {},
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create execution: ${error.message}`);
        }
        return data;
    }
    /**
     * Publish workflow event
     */
    async publishWorkflowEvent(eventType, payload) {
        await this.eventBus.publish({
            id: crypto.randomUUID(),
            source_app: 'workflow_engine',
            organization_id: 'system',
            event_type: eventType,
            event_version: '1.0',
            payload,
            metadata: {},
            severity: 'info',
            created_at: new Date().toISOString(),
        });
    }
    /**
     * Load workflows from database
     */
    async loadWorkflows() {
        const { data, error } = await this.supabase
            .from('workflows')
            .select('*')
            .eq('enabled', true);
        if (error) {
            console.error(`Failed to load workflows: ${error.message}`);
            return;
        }
        for (const workflow of data || []) {
            try {
                await this.registerWorkflow(workflow);
            }
            catch (error) {
                console.error(`Failed to register workflow ${workflow.id}:`, error);
            }
        }
        console.log(`Loaded ${this.registeredWorkflows.size} workflows`);
    }
    /**
     * Get workflow by ID
     */
    getWorkflow(workflowId) {
        return this.registeredWorkflows.get(workflowId);
    }
    /**
     * Get all registered workflows
     */
    getAllWorkflows() {
        return Array.from(this.registeredWorkflows.values());
    }
}
exports.WorkflowEngine = WorkflowEngine;
//# sourceMappingURL=WorkflowEngine.js.map