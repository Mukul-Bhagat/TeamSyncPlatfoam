"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerEngine = void 0;
const LocalSchedulerEngine_1 = require("./LocalSchedulerEngine");
class SchedulerEngine {
    static instance;
    scheduler;
    constructor() {
        // Use LocalSchedulerEngine by default
        // In production, this could be swapped for a distributed scheduler
        this.scheduler = LocalSchedulerEngine_1.LocalSchedulerEngine.getInstance();
    }
    static getInstance() {
        if (!SchedulerEngine.instance) {
            SchedulerEngine.instance = new SchedulerEngine();
        }
        return SchedulerEngine.instance;
    }
    async schedule(config) {
        return this.scheduler.schedule(config);
    }
    async unschedule(scheduleId) {
        return this.scheduler.unschedule(scheduleId);
    }
    async getSchedule(scheduleId) {
        return this.scheduler.getSchedule(scheduleId);
    }
    async getWorkflowSchedules(workflowId) {
        return this.scheduler.getWorkflowSchedules(workflowId);
    }
    async enableSchedule(scheduleId) {
        return this.scheduler.enableSchedule(scheduleId);
    }
    async disableSchedule(scheduleId) {
        return this.scheduler.disableSchedule(scheduleId);
    }
    async start() {
        return this.scheduler.start();
    }
    async stop() {
        return this.scheduler.stop();
    }
}
exports.SchedulerEngine = SchedulerEngine;
//# sourceMappingURL=SchedulerEngine.js.map