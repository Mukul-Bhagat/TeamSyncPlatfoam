import { InternalEventBus } from '../../core/event-bus/InternalEventBus';

export class ApprovalNotifier {
  private static instance: ApprovalNotifier;
  private eventBus: InternalEventBus;

  private constructor() {
    this.eventBus = InternalEventBus.getInstance();
  }

  static getInstance(): ApprovalNotifier {
    if (!ApprovalNotifier.instance) {
      ApprovalNotifier.instance = new ApprovalNotifier();
    }
    return ApprovalNotifier.instance;
  }

  /**
   * Notify approver of pending approval
   */
  async notifyApprover(
    approvalId: string,
    approverId: string,
    executionId: string,
    approvalType: string
  ): Promise<void> {
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      event_type: 'approval.notification',
      event_version: '1.0',
      payload: {
        approval_id: approvalId,
        approver_id: approverId,
        execution_id: executionId,
        approval_type: approvalType,
        notification_type: 'approval_requested',
      },
      severity: 'info',
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Notify requester of approval decision
   */
  async notifyRequester(
    approvalId: string,
    requestedBy: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      event_type: 'approval.notification',
      event_version: '1.0',
      payload: {
        approval_id: approvalId,
        requested_by: requestedBy,
        decision,
        reason,
        notification_type: 'approval_decision',
      },
      severity: decision === 'approved' ? 'info' : 'warn',
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Notify of approval expiration
   */
  async notifyExpiration(approvalId: string, approverId: string): Promise<void> {
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      event_type: 'approval.notification',
      event_version: '1.0',
      payload: {
        approval_id: approvalId,
        approver_id: approverId,
        notification_type: 'approval_expired',
      },
      severity: 'warn',
      created_at: new Date().toISOString(),
    });
  }
}
