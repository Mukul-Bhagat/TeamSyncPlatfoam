export declare class ApprovalNotifier {
    private static instance;
    private eventBus;
    private constructor();
    static getInstance(): ApprovalNotifier;
    /**
     * Notify approver of pending approval
     */
    notifyApprover(approvalId: string, approverId: string, executionId: string, approvalType: string): Promise<void>;
    /**
     * Notify requester of approval decision
     */
    notifyRequester(approvalId: string, requestedBy: string, decision: 'approved' | 'rejected', reason?: string): Promise<void>;
    /**
     * Notify of approval expiration
     */
    notifyExpiration(approvalId: string, approverId: string): Promise<void>;
}
//# sourceMappingURL=ApprovalNotifier.d.ts.map