"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPipeline = void 0;
const WorkflowEngine_1 = require("../engine/WorkflowEngine");
const WorkflowStateTracker_1 = require("../engine/WorkflowStateTracker");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
class ExecutionPipeline {
    static instance;
    workflowEngine;
    stateTracker;
    logger;
    eventBus;
    constructor() {
        this.workflowEngine = WorkflowEngine_1.WorkflowEngine.getInstance();
        this.stateTracker = new WorkflowStateTracker_1.WorkflowStateTracker();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
        this.eventBus = InternalEventBus_1.InternalEventBus.getInstance();
    }
    static getInstance() {
        if (!ExecutionPipeline.instance) {
            ExecutionPipeline.instance = new ExecutionPipeline();
        }
        return ExecutionPipeline.instance;
    }
    /**
     * Execute the full pipeline: Trigger → Validation → Execution → Tracking → Notifications
     */
    async execute(workflowId, context) {
        try {
            // Step 1: Trigger validation
            await this.validateTrigger(workflowId, context);
            // Step 2: Execute workflow
            const execution = await this.workflowEngine.executeWorkflow(workflowId, context.trigger_event?.id, context.metadata);
            // Step 3: Track execution
            await this.trackExecution(execution.id, context);
            // Step 4: Send notifications
            await this.sendNotifications(execution, context);
            // Step 5: Publish realtime updates
            await this.publishRealtimeUpdates(execution, context);
            return execution.id;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.logExecutionFailed('pipeline', workflowId, errorMessage);
            throw error;
        }
    }
    /**
     * Validate trigger conditions
     */
    async validateTrigger(_workflowId, _context) {
        // Trigger validation is handled by TriggerEngine before execution
        // This is a placeholder for additional validation logic
    }
    /**
     * Track execution metadata
     */
    async trackExecution(executionId, context) {
        await this.stateTracker.updateExecutionMetadata(executionId, {
            user_id: context.user_id,
            organization_id: context.organization_id,
            workspace_id: context.workspace_id,
            trigger_source: context.trigger_event?.event_type,
        });
    }
    /**
     * Send notifications based on execution result
     */
    async sendNotifications(_execution, _context) {
        // TODO: Integrate with notification system
        // Send notifications for:
        // - Workflow started
        // - Workflow completed
        // - Workflow failed
        // - Approval required
    }
    /**
     * Publish realtime updates
     */
    async publishRealtimeUpdates(execution, context) {
        await this.eventBus.publish({
            id: crypto.randomUUID(),
            source_app: 'workflow_engine',
            organization_id: context.organization_id,
            event_type: 'workflow.execution.updated',
            event_version: '1.0',
            payload: {
                execution_id: execution.id,
                workflow_id: execution.workflow_id,
                status: execution.status,
            },
            metadata: {
                workspace_id: context.workspace_id,
            },
            severity: 'info',
            created_at: new Date().toISOString(),
        });
    }
    /**
     * Execute pipeline with retry
     */
    async executeWithRetry(workflowId, context, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.execute(workflowId, context);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < maxRetries) {
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ExecutionPipeline = ExecutionPipeline;
//# sourceMappingURL=ExecutionPipeline.js.map