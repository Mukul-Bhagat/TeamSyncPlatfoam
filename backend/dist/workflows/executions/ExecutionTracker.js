"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionTracker = void 0;
const WorkflowStateTracker_1 = require("../engine/WorkflowStateTracker");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
class ExecutionTracker {
    static instance;
    stateTracker;
    logger;
    constructor() {
        this.stateTracker = new WorkflowStateTracker_1.WorkflowStateTracker();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    static getInstance() {
        if (!ExecutionTracker.instance) {
            ExecutionTracker.instance = new ExecutionTracker();
        }
        return ExecutionTracker.instance;
    }
    /**
     * Track execution progress
     */
    async trackProgress(executionId, progress, message) {
        await this.stateTracker.updateExecutionMetadata(executionId, {
            progress,
            progress_message: message,
            updated_at: new Date().toISOString(),
        });
    }
    /**
     * Track step execution
     */
    async trackStepExecution(executionId, stepId, status, result) {
        const execution = await this.stateTracker.getExecution(executionId);
        if (!execution) {
            return;
        }
        const steps = execution.metadata.steps || {};
        steps[stepId] = {
            status,
            result,
            timestamp: new Date().toISOString(),
        };
        await this.stateTracker.updateExecutionMetadata(executionId, {
            steps,
        });
        if (status === 'completed') {
            this.logger.logStepCompleted(executionId, stepId);
        }
        else if (status === 'failed') {
            this.logger.logStepFailed(executionId, stepId, String(result));
        }
    }
    /**
     * Get execution progress
     */
    async getProgress(executionId) {
        const execution = await this.stateTracker.getExecution(executionId);
        if (!execution) {
            return 0;
        }
        return execution.metadata.progress || 0;
    }
    /**
     * Get execution steps
     */
    async getSteps(executionId) {
        const execution = await this.stateTracker.getExecution(executionId);
        if (!execution) {
            return {};
        }
        return execution.metadata.steps || {};
    }
    /**
     * Get execution timeline
     */
    async getTimeline(executionId) {
        const execution = await this.stateTracker.getExecution(executionId);
        if (!execution) {
            return [];
        }
        const timeline = [];
        if (execution.started_at) {
            timeline.push({
                timestamp: execution.started_at,
                event: 'started',
                details: {},
            });
        }
        if (execution.completed_at) {
            timeline.push({
                timestamp: execution.completed_at,
                event: 'completed',
                details: { status: execution.status },
            });
        }
        const steps = execution.metadata.steps || {};
        for (const [stepId, stepData] of Object.entries(steps)) {
            timeline.push({
                timestamp: stepData.timestamp,
                event: `step_${stepId}`,
                details: stepData,
            });
        }
        return timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }
}
exports.ExecutionTracker = ExecutionTracker;
//# sourceMappingURL=ExecutionTracker.js.map