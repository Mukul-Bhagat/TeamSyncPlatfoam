"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalNotifier = void 0;
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
class ApprovalNotifier {
    static instance;
    eventBus;
    constructor() {
        this.eventBus = InternalEventBus_1.InternalEventBus.getInstance();
    }
    static getInstance() {
        if (!ApprovalNotifier.instance) {
            ApprovalNotifier.instance = new ApprovalNotifier();
        }
        return ApprovalNotifier.instance;
    }
    /**
     * Notify approver of pending approval
     */
    async notifyApprover(approvalId, approverId, executionId, approvalType) {
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
    async notifyRequester(approvalId, requestedBy, decision, reason) {
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
    async notifyExpiration(approvalId, approverId) {
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
exports.ApprovalNotifier = ApprovalNotifier;
//# sourceMappingURL=ApprovalNotifier.js.map