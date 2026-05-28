import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

export class WorkflowStateTracker {
  private supabase;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Update execution status
   */
  async updateExecutionStatus(executionId: string, status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'): Promise<void> {
    const updates: Record<string, unknown> = { status };

    if (status === 'running') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
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
  async completeExecution(executionId: string): Promise<void> {
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
  async failExecution(executionId: string, errorMessage: string): Promise<void> {
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
  async cancelExecution(executionId: string): Promise<void> {
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
  async updateExecutionContext(executionId: string, context: Record<string, unknown>): Promise<void> {
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
  async updateExecutionMetadata(executionId: string, metadata: Record<string, unknown>): Promise<void> {
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
  async getExecution(executionId: string): Promise<any> {
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
  async getWorkflowExecutions(workflowId: string, limit: number = 50): Promise<any[]> {
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
  async getPendingExecutions(): Promise<any[]> {
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
  async getFailedExecutions(olderThanMinutes: number = 5): Promise<any[]> {
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
