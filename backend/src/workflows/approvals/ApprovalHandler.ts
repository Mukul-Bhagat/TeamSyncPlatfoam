import { ApprovalEngine } from './ApprovalEngine';
import { WorkflowLogger } from '../engine/WorkflowLogger';

export class ApprovalHandler {
  private static instance: ApprovalHandler;
  private approvalEngine: ApprovalEngine;
  private logger: WorkflowLogger;

  private constructor() {
    this.approvalEngine = ApprovalEngine.getInstance();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): ApprovalHandler {
    if (!ApprovalHandler.instance) {
      ApprovalHandler.instance = new ApprovalHandler();
    }
    return ApprovalHandler.instance;
  }

  /**
   * Handle approval request from workflow
   */
  async handleApprovalRequest(
    executionId: string,
    requestedBy: string,
    approvalType: string,
    approverId?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    return this.approvalEngine.requestApproval(
      executionId,
      requestedBy,
      approvalType,
      approverId,
      metadata
    );
  }

  /**
   * Handle approval action
   */
  async handleApproval(approvalId: string, approverId: string, comment?: string): Promise<boolean> {
    return this.approvalEngine.approveApproval(approvalId, approverId, comment);
  }

  /**
   * Handle rejection action
   */
  async handleRejection(approvalId: string, approverId: string, reason: string): Promise<boolean> {
    return this.approvalEngine.rejectApproval(approvalId, approverId, reason);
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(approverId: string): Promise<any[]> {
    return this.approvalEngine.getPendingApprovals(approverId);
  }

  /**
   * Get approval details
   */
  async getApprovalDetails(approvalId: string): Promise<any> {
    return this.approvalEngine.getApproval(approvalId);
  }
}
