"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionLogger = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class ExecutionLogger {
    static instance;
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    static getInstance() {
        if (!ExecutionLogger.instance) {
            ExecutionLogger.instance = new ExecutionLogger();
        }
        return ExecutionLogger.instance;
    }
    /**
     * Log an execution event
     */
    async log(entry) {
        // TODO: Store in a dedicated execution_logs table
        // For now, we'll update the execution metadata
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            metadata: {
                logs: entry,
            },
        })
            .eq('id', entry.execution_id);
        if (error) {
            console.error(`Failed to log execution event: ${error.message}`);
        }
    }
    /**
     * Log info
     */
    async logInfo(executionId, message, stepId, metadata) {
        await this.log({
            execution_id: executionId,
            level: 'info',
            message,
            step_id: stepId,
            metadata,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Log warning
     */
    async logWarn(executionId, message, stepId, metadata) {
        await this.log({
            execution_id: executionId,
            level: 'warn',
            message,
            step_id: stepId,
            metadata,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Log error
     */
    async logError(executionId, message, stepId, metadata) {
        await this.log({
            execution_id: executionId,
            level: 'error',
            message,
            step_id: stepId,
            metadata,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Log debug
     */
    async logDebug(executionId, message, stepId, metadata) {
        await this.log({
            execution_id: executionId,
            level: 'debug',
            message,
            step_id: stepId,
            metadata,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Get execution logs
     */
    async getLogs(executionId) {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('metadata')
            .eq('id', executionId)
            .single();
        if (error || !data) {
            return [];
        }
        const logs = data.metadata.logs || [];
        return Array.isArray(logs) ? logs : [logs];
    }
}
exports.ExecutionLogger = ExecutionLogger;
//# sourceMappingURL=ExecutionLogger.js.map