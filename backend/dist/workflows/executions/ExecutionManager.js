"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionManager = void 0;
const ExecutionPipeline_1 = require("./ExecutionPipeline");
const WorkflowStateTracker_1 = require("../engine/WorkflowStateTracker");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
class ExecutionManager {
    static instance;
    pipeline;
    stateTracker;
    logger;
    activeExecutions = new Map();
    maxConcurrentExecutions = 10;
    constructor() {
        this.pipeline = ExecutionPipeline_1.ExecutionPipeline.getInstance();
        this.stateTracker = new WorkflowStateTracker_1.WorkflowStateTracker();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    static getInstance() {
        if (!ExecutionManager.instance) {
            ExecutionManager.instance = new ExecutionManager();
        }
        return ExecutionManager.instance;
    }
    /**
     * Queue and execute a workflow
     */
    async queueExecution(workflowId, context) {
        if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached');
        }
        const executionPromise = this.pipeline.execute(workflowId, context);
        this.activeExecutions.set(workflowId, executionPromise);
        try {
            const executionId = await executionPromise;
            return executionId;
        }
        finally {
            this.activeExecutions.delete(workflowId);
        }
    }
    /**
     * Cancel an execution
     */
    async cancelExecution(executionId) {
        try {
            await this.stateTracker.cancelExecution(executionId);
            this.logger.logExecutionCancelled(executionId, 'unknown');
            return true;
        }
        catch (error) {
            console.error(`Failed to cancel execution ${executionId}:`, error);
            return false;
        }
    }
    /**
     * Get active executions count
     */
    getActiveExecutionsCount() {
        return this.activeExecutions.size;
    }
    /**
     * Set max concurrent executions
     */
    setMaxConcurrentExecutions(max) {
        this.maxConcurrentExecutions = max;
    }
    /**
     * Get execution status
     */
    async getExecutionStatus(executionId) {
        return this.stateTracker.getExecution(executionId);
    }
    /**
     * Get pending executions
     */
    async getPendingExecutions() {
        return this.stateTracker.getPendingExecutions();
    }
    /**
     * Get failed executions for retry
     */
    async getFailedExecutions(olderThanMinutes = 5) {
        return this.stateTracker.getFailedExecutions(olderThanMinutes);
    }
    /**
     * Retry a failed execution
     */
    async retryExecution(executionId) {
        const execution = await this.stateTracker.getExecution(executionId);
        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }
        if (execution.status !== 'failed') {
            throw new Error(`Cannot retry execution with status: ${execution.status}`);
        }
        const context = {
            trigger_event_id: execution.trigger_event_id,
            metadata: execution.execution_context,
        };
        return this.queueExecution(execution.workflow_id, context);
    }
}
exports.ExecutionManager = ExecutionManager;
//# sourceMappingURL=ExecutionManager.js.map