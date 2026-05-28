import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { WorkflowEngine } from '../../workflows/engine/WorkflowEngine';
import { TriggerEngine } from '../../workflows/triggers/TriggerEngine';
import { ExecutionManager } from '../../workflows/executions/ExecutionManager';
import { CapabilityManager } from '../../workflows/capabilities/CapabilityManager';
import { CommandRouter } from '../../workflows/commands/CommandRouter';
import type { Workflow, WorkflowExecution } from './types';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export class WorkflowService {
  private workflowEngine: WorkflowEngine;
  private triggerEngine: TriggerEngine;
  private executionManager: ExecutionManager;
  private capabilityManager: CapabilityManager;
  private commandRouter: CommandRouter;

  constructor() {
    this.workflowEngine = WorkflowEngine.getInstance();
    this.triggerEngine = TriggerEngine.getInstance();
    this.executionManager = ExecutionManager.getInstance();
    this.capabilityManager = CapabilityManager.getInstance();
    this.commandRouter = CommandRouter.getInstance();
  }

  // Workflow CRUD operations
  async createWorkflow(workflow: Partial<Workflow>, userId: string): Promise<Workflow> {
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

    if (error) throw error;
    return data;
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkflows(organizationId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Execution operations
  async executeWorkflow(workflowId: string, context: Record<string, unknown>): Promise<string> {
    return this.executionManager.queueExecution(workflowId, context);
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getExecutions(workflowId: string, limit: number = 50): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async cancelExecution(id: string): Promise<boolean> {
    return this.executionManager.cancelExecution(id);
  }

  // Trigger operations
  async registerTrigger(workflowId: string, triggerType: string, config: Record<string, unknown>): Promise<void> {
    await this.triggerEngine.registerTrigger(workflowId, triggerType, config);
  }

  // Capability operations
  async grantCapability(userId: string, capabilityName: string, grantedBy: string): Promise<boolean> {
    const granter = this.capabilityManager.getGranter();
    return granter.grantCapability(userId, capabilityName, grantedBy);
  }

  async revokeCapability(userId: string, capabilityName: string): Promise<boolean> {
    const granter = this.capabilityManager.getGranter();
    return granter.revokeCapability(userId, capabilityName);
  }

  async getUserCapabilities(userId: string): Promise<string[]> {
    const checker = this.capabilityManager.getChecker();
    return checker.getUserCapabilities(userId);
  }

  // Command operations
  async executeCommand(
    commandName: string,
    args: Record<string, unknown>,
    userId: string,
    organizationId: string
  ): Promise<any> {
    return this.commandRouter.route(commandName, args, {
      user_id: userId,
      organization_id: organizationId,
      source: 'api',
    });
  }

  async getAvailableCommands(userId: string): Promise<string[]> {
    return this.commandRouter.getAvailableCommands(userId);
  }
}
