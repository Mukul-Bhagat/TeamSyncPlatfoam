import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import { InternalEventBus } from '../../core/event-bus/InternalEventBus';

export class ApprovalEngine {
  private static instance: ApprovalEngine;
  private supabase;
  private logger: WorkflowLogger;
  private eventBus: InternalEventBus;

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.logger = new WorkflowLogger();
    this.eventBus = InternalEventBus.getInstance();
  }

  static getInstance(): ApprovalEngine {
    if (!ApprovalEngine.instance) {
      ApprovalEngine.instance = new ApprovalEngine();
    }
    return ApprovalEngine.instance;
  }

  /**
   * Request approval for a workflow execution
   */
  async requestApproval(
    executionId: string,
    requestedBy: string,
    approvalType: string,
    approverId?: string,
    approvalMetadata: Record<string, unknown> = {},
    expiresAt?: Date
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('workflow_approvals')
      .insert({
        execution_id: executionId,
        requested_by: requestedBy,
        approver_id: approverId,
        status: 'pending',
        approval_type: approvalType,
        approval_metadata: approvalMetadata,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to request approval: ${error.message}`);
    }

    this.logger.logApprovalRequested(executionId, approvalType, requestedBy);

    // Publish approval requested event
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      organization_id: (data as any).organization_id,
      event_type: 'workflow.approval.requested',
      event_version: '1.0',
      payload: {
        approval_id: data.id,
        execution_id: executionId,
        approval_type: approvalType,
        requested_by: requestedBy,
      },
      severity: 'info',
      created_at: new Date().toISOString(),
    });

    return data.id;
  }

  /**
   * Approve a workflow execution
   */
  async approveApproval(approvalId: string, approverId: string, comment?: string): Promise<boolean> {
    const { data: approval, error: fetchError } = await this.supabase
      .from('workflow_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (fetchError) {
      throw new Error(`Approval not found: ${fetchError.message}`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Approval is not pending: ${approval.status}`);
    }

    // Check if expired
    if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
      await this.supabase
        .from('workflow_approvals')
        .update({ status: 'expired' })
        .eq('id', approvalId);
      throw new Error('Approval has expired');
    }

    const { error } = await this.supabase
      .from('workflow_approvals')
      .update({
        status: 'approved',
        approver_id: approverId,
        approved_at: new Date().toISOString(),
        approval_metadata: {
          ...approval.approval_metadata,
          comment,
        },
      })
      .eq('id', approvalId);

    if (error) {
      throw new Error(`Failed to approve: ${error.message}`);
    }

    this.logger.logApprovalApproved(approvalId, approverId);

    // Resume workflow execution
    await this.resumeExecution(approval.execution_id);

    return true;
  }

  /**
   * Reject a workflow execution
   */
  async rejectApproval(approvalId: string, approverId: string, reason: string): Promise<boolean> {
    const { data: approval, error: fetchError } = await this.supabase
      .from('workflow_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (fetchError) {
      throw new Error(`Approval not found: ${fetchError.message}`);
    }

    if (approval.status !== 'pending') {
      throw new Error(`Approval is not pending: ${approval.status}`);
    }

    const { error } = await this.supabase
      .from('workflow_approvals')
      .update({
        status: 'rejected',
        approver_id: approverId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', approvalId);

    if (error) {
      throw new Error(`Failed to reject: ${error.message}`);
    }

    this.logger.logApprovalRejected(approvalId, approverId, reason);

    // Cancel workflow execution
    await this.cancelExecution(approval.execution_id);

    return true;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(approverId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('workflow_approvals')
      .select('*')
      .eq('approver_id', approverId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get pending approvals: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get approval by ID
   */
  async getApproval(approvalId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('workflow_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (error) {
      throw new Error(`Approval not found: ${error.message}`);
    }

    return data;
  }

  /**
   * Get approvals for an execution
   */
  async getExecutionApprovals(executionId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('workflow_approvals')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get execution approvals: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Resume workflow execution after approval
   */
  private async resumeExecution(executionId: string): Promise<void> {
    // TODO: Integrate with WorkflowEngine to resume execution
    // This would involve updating the execution status and continuing from the approval step
  }

  /**
   * Cancel workflow execution after rejection
   */
  private async cancelExecution(executionId: string): Promise<void> {
    await this.supabase
      .from('workflow_executions')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', executionId);
  }

  /**
   * Clean up expired approvals
   */
  async cleanupExpiredApprovals(): Promise<number> {
    const { error } = await this.supabase
      .from('workflow_approvals')
      .update({ status: 'expired' })
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'pending');

    if (error) {
      console.error(`Failed to cleanup expired approvals: ${error.message}`);
      return 0;
    }

    return 1;
  }
}
