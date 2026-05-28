"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleManager = void 0;
const SchedulerEngine_1 = require("./SchedulerEngine");
const TriggerEngine_1 = require("../triggers/TriggerEngine");
class ScheduleManager {
    static instance;
    schedulerEngine;
    triggerEngine;
    constructor() {
        this.schedulerEngine = SchedulerEngine_1.SchedulerEngine.getInstance();
        this.triggerEngine = TriggerEngine_1.TriggerEngine.getInstance();
    }
    static getInstance() {
        if (!ScheduleManager.instance) {
            ScheduleManager.instance = new ScheduleManager();
        }
        return ScheduleManager.instance;
    }
    /**
     * Create a schedule for a workflow
     */
    async createSchedule(workflowId, scheduleExpression, timezone = 'UTC') {
        // Register schedule trigger with TriggerEngine
        await this.triggerEngine.registerTrigger(workflowId, 'schedule', {
            schedule_expression: scheduleExpression,
            timezone,
        });
        // Create schedule
        return this.schedulerEngine.schedule({
            workflow_id: workflowId,
            schedule_expression: scheduleExpression,
            timezone,
            enabled: true,
        });
    }
    /**
     * Delete a schedule
     */
    async deleteSchedule(scheduleId) {
        return this.schedulerEngine.unschedule(scheduleId);
    }
    /**
     * Get all schedules for a workflow
     */
    async getWorkflowSchedules(workflowId) {
        return this.schedulerEngine.getWorkflowSchedules(workflowId);
    }
    /**
     * Enable a schedule
     */
    async enableSchedule(scheduleId) {
        return this.schedulerEngine.enableSchedule(scheduleId);
    }
    /**
     * Disable a schedule
     */
    async disableSchedule(scheduleId) {
        return this.schedulerEngine.disableSchedule(scheduleId);
    }
    /**
     * Start the scheduler
     */
    async start() {
        return this.schedulerEngine.start();
    }
    /**
     * Stop the scheduler
     */
    async stop() {
        return this.schedulerEngine.stop();
    }
}
exports.ScheduleManager = ScheduleManager;
//# sourceMappingURL=ScheduleManager.js.map