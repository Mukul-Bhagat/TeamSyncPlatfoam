"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleExecutor = void 0;
const SchedulerEngine_1 = require("./SchedulerEngine");
const ExecutionManager_1 = require("../executions/ExecutionManager");
class ScheduleExecutor {
    static instance;
    schedulerEngine;
    executionManager;
    constructor() {
        this.schedulerEngine = SchedulerEngine_1.SchedulerEngine.getInstance();
        this.executionManager = ExecutionManager_1.ExecutionManager.getInstance();
    }
    static getInstance() {
        if (!ScheduleExecutor.instance) {
            ScheduleExecutor.instance = new ScheduleExecutor();
        }
        return ScheduleExecutor.instance;
    }
    /**
     * Execute a scheduled workflow
     */
    async executeScheduledWorkflow(workflowId, scheduleId) {
        const context = {
            trigger_source: 'schedule',
            schedule_id: scheduleId,
            metadata: {
                scheduled: true,
            },
        };
        return this.executionManager.queueExecution(workflowId, context);
    }
    /**
     * Execute multiple scheduled workflows
     */
    async executeScheduledWorkflows(workflowIds, scheduleId) {
        const executionIds = [];
        for (const workflowId of workflowIds) {
            try {
                const executionId = await this.executeScheduledWorkflow(workflowId, scheduleId);
                executionIds.push(executionId);
            }
            catch (error) {
                console.error(`Failed to execute scheduled workflow ${workflowId}:`, error);
            }
        }
        return executionIds;
    }
    /**
     * Get scheduled executions for a time range
     */
    async getScheduledExecutions(startTime, endTime) {
        // TODO: Query database for scheduled executions in time range
        return [];
    }
}
exports.ScheduleExecutor = ScheduleExecutor;
//# sourceMappingURL=ScheduleExecutor.js.map