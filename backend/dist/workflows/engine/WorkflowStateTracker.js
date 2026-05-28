"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStateTracker = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class WorkflowStateTracker {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    /**
     * Update execution status
     */
    async updateExecutionStatus(executionId, status) {
        const updates = { status };
        if (status === 'running') {
            updates.started_at = new Date().toISOString();
        }
        else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
            updates.completed_at = new Date().toISOString();
        }
        const { error } = await this.supabase
            .from('workflow_executions')
            .update(updates)
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to update execution status: ${error.message}`);
        }
    }
    /**
     * Complete execution
     */
    async completeExecution(executionId) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
        })
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to complete execution: ${error.message}`);
        }
    }
    /**
     * Fail execution
     */
    async failExecution(executionId, errorMessage) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
        })
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to fail execution: ${error.message}`);
        }
    }
    /**
     * Cancel execution
     */
    async cancelExecution(executionId) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            status: 'cancelled',
            completed_at: new Date().toISOString(),
        })
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to cancel execution: ${error.message}`);
        }
    }
    /**
     * Update execution context
     */
    async updateExecutionContext(executionId, context) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            execution_context: context,
        })
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to update execution context: ${error.message}`);
        }
    }
    /**
     * Update execution metadata
     */
    async updateExecutionMetadata(executionId, metadata) {
        const { error } = await this.supabase
            .from('workflow_executions')
            .update({
            metadata,
        })
            .eq('id', executionId);
        if (error) {
            throw new Error(`Failed to update execution metadata: ${error.message}`);
        }
    }
    /**
     * Get execution by ID
     */
    async getExecution(executionId) {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('*')
            .eq('id', executionId)
            .single();
        if (error) {
            throw new Error(`Failed to get execution: ${error.message}`);
        }
        return data;
    }
    /**
     * Get executions for a workflow
     */
    async getWorkflowExecutions(workflowId, limit = 50) {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            throw new Error(`Failed to get workflow executions: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get pending executions
     */
    async getPendingExecutions() {
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(100);
        if (error) {
            throw new Error(`Failed to get pending executions: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get failed executions for retry
     */
    async getFailedExecutions(olderThanMinutes = 5) {
        const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();
        const { data, error } = await this.supabase
            .from('workflow_executions')
            .select('*')
            .eq('status', 'failed')
            .lt('completed_at', cutoffTime)
            .order('completed_at', { ascending: false })
            .limit(50);
        if (error) {
            throw new Error(`Failed to get failed executions: ${error.message}`);
        }
        return data || [];
    }
}
exports.WorkflowStateTracker = WorkflowStateTracker;
//# sourceMappingURL=WorkflowStateTracker.js.map