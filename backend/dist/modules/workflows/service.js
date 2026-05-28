"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const WorkflowEngine_1 = require("../../workflows/engine/WorkflowEngine");
const TriggerEngine_1 = require("../../workflows/triggers/TriggerEngine");
const ExecutionManager_1 = require("../../workflows/executions/ExecutionManager");
const CapabilityManager_1 = require("../../workflows/capabilities/CapabilityManager");
const CommandRouter_1 = require("../../workflows/commands/CommandRouter");
const supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
class WorkflowService {
    workflowEngine;
    triggerEngine;
    executionManager;
    capabilityManager;
    commandRouter;
    constructor() {
        this.workflowEngine = WorkflowEngine_1.WorkflowEngine.getInstance();
        this.triggerEngine = TriggerEngine_1.TriggerEngine.getInstance();
        this.executionManager = ExecutionManager_1.ExecutionManager.getInstance();
        this.capabilityManager = CapabilityManager_1.CapabilityManager.getInstance();
        this.commandRouter = CommandRouter_1.CommandRouter.getInstance();
    }
    // Workflow CRUD operations
    async createWorkflow(workflow, userId) {
        const { data, error } = await supabase
            .from('workflows')
            .insert({
            ...workflow,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async getWorkflow(id) {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
    async getWorkflows(organizationId) {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('organization_id', organizationId);
        if (error)
            throw error;
        return data || [];
    }
    async updateWorkflow(id, updates) {
        const { data, error } = await supabase
            .from('workflows')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async deleteWorkflow(id) {
        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
    // Execution operations
    async executeWorkflow(workflowId, context) {
        return this.executionManager.queueExecution(workflowId, context);
    }
    async getExecution(id) {
        const { data, error } = await supabase
            .from('workflow_executions')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
    async getExecutions(workflowId, limit = 50) {
        const { data, error } = await supabase
            .from('workflow_executions')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw error;
        return data || [];
    }
    async cancelExecution(id) {
        return this.executionManager.cancelExecution(id);
    }
    // Trigger operations
    async registerTrigger(workflowId, triggerType, config) {
        await this.triggerEngine.registerTrigger(workflowId, triggerType, config);
    }
    // Capability operations
    async grantCapability(userId, capabilityName, grantedBy) {
        const granter = this.capabilityManager.getGranter();
        return granter.grantCapability(userId, capabilityName, grantedBy);
    }
    async revokeCapability(userId, capabilityName) {
        const granter = this.capabilityManager.getGranter();
        return granter.revokeCapability(userId, capabilityName);
    }
    async getUserCapabilities(userId) {
        const checker = this.capabilityManager.getChecker();
        return checker.getUserCapabilities(userId);
    }
    // Command operations
    async executeCommand(commandName, args, userId, organizationId) {
        return this.commandRouter.route(commandName, args, {
            user_id: userId,
            organization_id: organizationId,
            source: 'api',
        });
    }
    async getAvailableCommands(userId) {
        return this.commandRouter.getAvailableCommands(userId);
    }
}
exports.WorkflowService = WorkflowService;
//# sourceMappingURL=service.js.map