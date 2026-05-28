export declare class ApprovalEngine {
    private static instance;
    private supabase;
    private logger;
    private eventBus;
    private constructor();
    static getInstance(): ApprovalEngine;
    /**
     * Request approval for a workflow execution
     */
    requestApproval(executionId: string, requestedBy: string, approvalType: string, approverId?: string, approvalMetadata?: Record<string, unknown>, expiresAt?: Date): Promise<string>;
    /**
     * Approve a workflow execution
     */
    approveApproval(approvalId: string, approverId: string, comment?: string): Promise<boolean>;
    /**
     * Reject a workflow execution
     */
    rejectApproval(approvalId: string, approverId: string, reason: string): Promise<boolean>;
    /**
     * Get pending approvals for a user
     */
    getPendingApprovals(approverId: string): Promise<any[]>;
    /**
     * Get approval by ID
     */
    getApproval(approvalId: string): Promise<any>;
    /**
     * Get approvals for an execution
     */
    getExecutionApprovals(executionId: string): Promise<any[]>;
    /**
     * Resume workflow execution after approval
     */
    private resumeExecution;
    /**
     * Cancel workflow execution after rejection
     */
    private cancelExecution;
    /**
     * Clean up expired approvals
     */
    cleanupExpiredApprovals(): Promise<number>;
}
//# sourceMappingURL=ApprovalEngine.d.ts.map