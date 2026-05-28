export declare class ApprovalHandler {
    private static instance;
    private approvalEngine;
    private logger;
    private constructor();
    static getInstance(): ApprovalHandler;
    /**
     * Handle approval request from workflow
     */
    handleApprovalRequest(executionId: string, requestedBy: string, approvalType: string, approverId?: string, metadata?: Record<string, unknown>): Promise<string>;
    /**
     * Handle approval action
     */
    handleApproval(approvalId: string, approverId: string, comment?: string): Promise<boolean>;
    /**
     * Handle rejection action
     */
    handleRejection(approvalId: string, approverId: string, reason: string): Promise<boolean>;
    /**
     * Get pending approvals for a user
     */
    getPendingApprovals(approverId: string): Promise<any[]>;
    /**
     * Get approval details
     */
    getApprovalDetails(approvalId: string): Promise<any>;
}
//# sourceMappingURL=ApprovalHandler.d.ts.map