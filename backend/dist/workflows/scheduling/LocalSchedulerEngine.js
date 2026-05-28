"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSchedulerEngine = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class LocalSchedulerEngine {
    static instance;
    supabase;
    jobs = new Map();
    running = false;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    static getInstance() {
        if (!LocalSchedulerEngine.instance) {
            LocalSchedulerEngine.instance = new LocalSchedulerEngine();
        }
        return LocalSchedulerEngine.instance;
    }
    async schedule(config) {
        const { data, error } = await this.supabase
            .from('workflow_schedules')
            .insert({
            workflow_id: config.workflow_id,
            schedule_expression: config.schedule_expression,
            timezone: config.timezone,
            enabled: config.enabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to schedule: ${error.message}`);
        }
        if (this.running && config.enabled) {
            this.scheduleJob(data.id);
        }
        return data.id;
    }
    async unschedule(scheduleId) {
        const { error } = await this.supabase
            .from('workflow_schedules')
            .delete()
            .eq('id', scheduleId);
        if (error) {
            throw new Error(`Failed to unschedule: ${error.message}`);
        }
        this.stopJob(scheduleId);
        return true;
    }
    async getSchedule(scheduleId) {
        const { data, error } = await this.supabase
            .from('workflow_schedules')
            .select('*')
            .eq('id', scheduleId)
            .single();
        if (error) {
            return undefined;
        }
        return data;
    }
    async getWorkflowSchedules(workflowId) {
        const { data, error } = await this.supabase
            .from('workflow_schedules')
            .select('*')
            .eq('workflow_id', workflowId);
        if (error) {
            return [];
        }
        return (data || []);
    }
    async enableSchedule(scheduleId) {
        const { error } = await this.supabase
            .from('workflow_schedules')
            .update({ enabled: true, updated_at: new Date().toISOString() })
            .eq('id', scheduleId);
        if (error) {
            throw new Error(`Failed to enable schedule: ${error.message}`);
        }
        if (this.running) {
            this.scheduleJob(scheduleId);
        }
        return true;
    }
    async disableSchedule(scheduleId) {
        const { error } = await this.supabase
            .from('workflow_schedules')
            .update({ enabled: false, updated_at: new Date().toISOString() })
            .eq('id', scheduleId);
        if (error) {
            throw new Error(`Failed to disable schedule: ${error.message}`);
        }
        this.stopJob(scheduleId);
        return true;
    }
    async start() {
        if (this.running) {
            return;
        }
        this.running = true;
        // Load all enabled schedules
        const { data, error } = await this.supabase
            .from('workflow_schedules')
            .select('*')
            .eq('enabled', true);
        if (error) {
            console.error(`Failed to load schedules: ${error.message}`);
            return;
        }
        for (const schedule of data || []) {
            this.scheduleJob(schedule.id);
        }
    }
    async stop() {
        this.running = false;
        // Stop all jobs
        for (const [scheduleId, timeout] of this.jobs) {
            clearTimeout(timeout);
        }
        this.jobs.clear();
    }
    scheduleJob(scheduleId) {
        this.stopJob(scheduleId);
        this.getSchedule(scheduleId).then((schedule) => {
            if (!schedule || !schedule.enabled) {
                return;
            }
            const delay = this.calculateDelay(schedule.schedule_expression, schedule.timezone);
            const timeout = setTimeout(() => {
                this.executeScheduledWorkflow(schedule.workflow_id, scheduleId);
                this.scheduleJob(scheduleId); // Reschedule
            }, delay);
            this.jobs.set(scheduleId, timeout);
        });
    }
    stopJob(scheduleId) {
        const timeout = this.jobs.get(scheduleId);
        if (timeout) {
            clearTimeout(timeout);
            this.jobs.delete(scheduleId);
        }
    }
    calculateDelay(cronExpression, timezone) {
        // Simple implementation - in production use a proper cron library
        // For now, return a fixed delay (e.g., 1 minute)
        return 60 * 1000;
    }
    async executeScheduledWorkflow(workflowId, scheduleId) {
        try {
            // Update last_run_at
            await this.supabase
                .from('workflow_schedules')
                .update({ last_run_at: new Date().toISOString() })
                .eq('id', scheduleId);
            // TODO: Trigger workflow execution
            // This would integrate with WorkflowEngine or ExecutionManager
            console.log(`Executing scheduled workflow: ${workflowId}`);
        }
        catch (error) {
            console.error(`Failed to execute scheduled workflow ${workflowId}:`, error);
        }
    }
}
exports.LocalSchedulerEngine = LocalSchedulerEngine;
//# sourceMappingURL=LocalSchedulerEngine.js.map