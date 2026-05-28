export interface ApprovalValidationResult {
    valid: boolean;
    errors: string[];
}
export declare class ApprovalValidator {
    private static instance;
    private constructor();
    static getInstance(): ApprovalValidator;
    /**
     * Validate approval request
     */
    validateApprovalRequest(data: {
        execution_id: string;
        requested_by: string;
        approval_type: string;
        approver_id?: string;
    }): ApprovalValidationResult;
    /**
     * Validate approval action
     */
    validateApprovalAction(data: {
        approval_id: string;
        approver_id: string;
        action: 'approve' | 'reject';
    }): ApprovalValidationResult;
    /**
     * Validate rejection action
     */
    validateRejectionAction(data: {
        approval_id: string;
        approver_id: string;
        reason: string;
    }): ApprovalValidationResult;
}
//# sourceMappingURL=ApprovalValidator.d.ts.map