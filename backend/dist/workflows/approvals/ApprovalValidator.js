"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalValidator = void 0;
class ApprovalValidator {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ApprovalValidator.instance) {
            ApprovalValidator.instance = new ApprovalValidator();
        }
        return ApprovalValidator.instance;
    }
    /**
     * Validate approval request
     */
    validateApprovalRequest(data) {
        const errors = [];
        if (!data.execution_id) {
            errors.push('execution_id is required');
        }
        if (!data.requested_by) {
            errors.push('requested_by is required');
        }
        if (!data.approval_type) {
            errors.push('approval_type is required');
        }
        // Validate approval type
        const validTypes = ['manual', 'deployment', 'incident', 'custom'];
        if (!validTypes.includes(data.approval_type)) {
            errors.push(`approval_type must be one of: ${validTypes.join(', ')}`);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate approval action
     */
    validateApprovalAction(data) {
        const errors = [];
        if (!data.approval_id) {
            errors.push('approval_id is required');
        }
        if (!data.approver_id) {
            errors.push('approver_id is required');
        }
        if (!data.action) {
            errors.push('action is required');
        }
        if (data.action !== 'approve' && data.action !== 'reject') {
            errors.push('action must be either "approve" or "reject"');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate rejection action
     */
    validateRejectionAction(data) {
        const errors = [];
        if (!data.approval_id) {
            errors.push('approval_id is required');
        }
        if (!data.approver_id) {
            errors.push('approver_id is required');
        }
        if (!data.reason) {
            errors.push('reason is required for rejection');
        }
        if (data.reason.length < 10) {
            errors.push('reason must be at least 10 characters');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.ApprovalValidator = ApprovalValidator;
//# sourceMappingURL=ApprovalValidator.js.map