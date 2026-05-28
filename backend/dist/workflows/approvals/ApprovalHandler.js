"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalHandler = void 0;
const ApprovalEngine_1 = require("./ApprovalEngine");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
class ApprovalHandler {
    static instance;
    approvalEngine;
    logger;
    constructor() {
        this.approvalEngine = ApprovalEngine_1.ApprovalEngine.getInstance();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    static getInstance() {
        if (!ApprovalHandler.instance) {
            ApprovalHandler.instance = new ApprovalHandler();
        }
        return ApprovalHandler.instance;
    }
    /**
     * Handle approval request from workflow
     */
    async handleApprovalRequest(executionId, requestedBy, approvalType, approverId, metadata) {
        return this.approvalEngine.requestApproval(executionId, requestedBy, approvalType, approverId, metadata);
    }
    /**
     * Handle approval action
     */
    async handleApproval(approvalId, approverId, comment) {
        return this.approvalEngine.approveApproval(approvalId, approverId, comment);
    }
    /**
     * Handle rejection action
     */
    async handleRejection(approvalId, approverId, reason) {
        return this.approvalEngine.rejectApproval(approvalId, approverId, reason);
    }
    /**
     * Get pending approvals for a user
     */
    async getPendingApprovals(approverId) {
        return this.approvalEngine.getPendingApprovals(approverId);
    }
    /**
     * Get approval details
     */
    async getApprovalDetails(approvalId) {
        return this.approvalEngine.getApproval(approvalId);
    }
}
exports.ApprovalHandler = ApprovalHandler;
//# sourceMappingURL=ApprovalHandler.js.map