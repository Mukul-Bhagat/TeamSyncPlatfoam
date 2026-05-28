import type {
  Workflow,
  WorkflowExecution,
  WorkflowApproval,
  WorkflowSchedule,
  UserCapability,
  CommandResult,
} from '../types/workflows';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class WorkflowService {
  private static instance: WorkflowService;

  private constructor() {}

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  // Workflow CRUD
  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE}/workflows/${id}`);
    if (!response.ok) throw new Error('Failed to get workflow');
    return response.json();
  }

  async getWorkflows(organizationId: string): Promise<Workflow[]> {
    const response = await fetch(`${API_BASE}/workflows?organization_id=${organizationId}`);
    if (!response.ok) throw new Error('Failed to get workflows');
    return response.json();
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update workflow');
    return response.json();
  }

  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete workflow');
  }

  // Execution operations
  async executeWorkflow(workflowId: string, context: Record<string, unknown> = {}): Promise<{ execution_id: string }> {
    const response = await fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    if (!response.ok) throw new Error('Failed to execute workflow');
    return response.json();
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    const response = await fetch(`${API_BASE}/executions/${id}`);
    if (!response.ok) throw new Error('Failed to get execution');
    return response.json();
  }

  async getExecutions(workflowId: string, limit: number = 50): Promise<WorkflowExecution[]> {
    const response = await fetch(`${API_BASE}/workflows/${workflowId}/executions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get executions');
    return response.json();
  }

  async cancelExecution(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/executions/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel execution');
    return response.json();
  }

  // Trigger operations
  async registerTrigger(workflowId: string, triggerType: string, config: Record<string, unknown>): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/workflows/${workflowId}/triggers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger_type: triggerType, trigger_config: config }),
    });
    if (!response.ok) throw new Error('Failed to register trigger');
    return response.json();
  }

  // Capability operations
  async grantCapability(userId: string, capabilityName: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/capabilities/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, capability_name: capabilityName }),
    });
    if (!response.ok) throw new Error('Failed to grant capability');
    return response.json();
  }

  async revokeCapability(userId: string, capabilityName: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/capabilities/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, capability_name: capabilityName }),
    });
    if (!response.ok) throw new Error('Failed to revoke capability');
    return response.json();
  }

  async getUserCapabilities(userId: string): Promise<{ capabilities: string[] }> {
    const response = await fetch(`${API_BASE}/capabilities/${userId}`);
    if (!response.ok) throw new Error('Failed to get user capabilities');
    return response.json();
  }

  // Command operations
  async executeCommand(commandName: string, args: Record<string, unknown>): Promise<CommandResult> {
    const response = await fetch(`${API_BASE}/commands/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command_name: commandName, args }),
    });
    if (!response.ok) throw new Error('Failed to execute command');
    return response.json();
  }

  async getAvailableCommands(): Promise<{ commands: string[] }> {
    const response = await fetch(`${API_BASE}/commands`);
    if (!response.ok) throw new Error('Failed to get available commands');
    return response.json();
  }
}

export const workflowService = WorkflowService.getInstance();
