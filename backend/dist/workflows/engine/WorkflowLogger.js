"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLogger = void 0;
class WorkflowLogger {
    /**
     * Log workflow registered
     */
    logWorkflowRegistered(workflowId, workflowName) {
        console.log(`[WorkflowEngine] Workflow registered: ${workflowId} (${workflowName})`);
    }
    /**
     * Log workflow unregistered
     */
    logWorkflowUnregistered(workflowId) {
        console.log(`[WorkflowEngine] Workflow unregistered: ${workflowId}`);
    }
    /**
     * Log execution started
     */
    logExecutionStarted(executionId, workflowId) {
        console.log(`[WorkflowEngine] Execution started: ${executionId} for workflow ${workflowId}`);
    }
    /**
     * Log execution completed
     */
    logExecutionCompleted(executionId, workflowId) {
        console.log(`[WorkflowEngine] Execution completed: ${executionId} for workflow ${workflowId}`);
    }
    /**
     * Log execution failed
     */
    logExecutionFailed(executionId, workflowId, error) {
        console.error(`[WorkflowEngine] Execution failed: ${executionId} for workflow ${workflowId} - ${error}`);
    }
    /**
     * Log execution cancelled
     */
    logExecutionCancelled(executionId, workflowId) {
        console.log(`[WorkflowEngine] Execution cancelled: ${executionId} for workflow ${workflowId}`);
    }
    /**
     * Log step completed
     */
    logStepCompleted(executionId, stepId) {
        console.log(`[WorkflowEngine] Step completed: ${stepId} in execution ${executionId}`);
    }
    /**
     * Log step failed
     */
    logStepFailed(executionId, stepId, error) {
        console.error(`[WorkflowEngine] Step failed: ${stepId} in execution ${executionId} - ${error}`);
    }
    /**
     * Log step skipped
     */
    logStepSkipped(executionId, stepId, reason) {
        console.log(`[WorkflowEngine] Step skipped: ${stepId} in execution ${executionId} - ${reason}`);
    }
    /**
     * Log step retry success
     */
    logStepRetrySuccess(executionId, stepId, attempt) {
        console.log(`[WorkflowEngine] Step retry success: ${stepId} in execution ${executionId} on attempt ${attempt}`);
    }
    /**
     * Log step retry failed
     */
    logStepRetryFailed(executionId, stepId, attempt) {
        console.error(`[WorkflowEngine] Step retry failed: ${stepId} in execution ${executionId} on attempt ${attempt}`);
    }
    /**
     * Log trigger matched
     */
    logTriggerMatched(workflowId, triggerType, eventData) {
        console.log(`[WorkflowEngine] Trigger matched: ${workflowId} (${triggerType})`, eventData);
    }
    /**
     * Log trigger evaluation
     */
    logTriggerEvaluation(workflowId, matched) {
        console.log(`[WorkflowEngine] Trigger evaluation: ${workflowId} - ${matched ? 'MATCHED' : 'NO MATCH'}`);
    }
    /**
     * Log action executed
     */
    logActionExecuted(executionId, actionType, result) {
        console.log(`[WorkflowEngine] Action executed: ${actionType} in execution ${executionId}`, result);
    }
    /**
     * Log action failed
     */
    logActionFailed(executionId, actionType, error) {
        console.error(`[WorkflowEngine] Action failed: ${actionType} in execution ${executionId} - ${error}`);
    }
    /**
     * Log approval requested
     */
    logApprovalRequested(executionId, approverId) {
        console.log(`[WorkflowEngine] Approval requested: ${executionId} by ${approverId}`);
    }
    /**
     * Log approval granted
     */
    logApprovalGranted(executionId, approverId) {
        console.log(`[WorkflowEngine] Approval granted: ${executionId} by ${approverId}`);
    }
    /**
     * Log approval rejected
     */
    logApprovalRejected(executionId, approverId, reason) {
        console.log(`[WorkflowEngine] Approval rejected: ${executionId} by ${approverId} - ${reason}`);
    }
    /**
     * Log schedule triggered
     */
    logScheduleTriggered(workflowId, scheduleId) {
        console.log(`[WorkflowEngine] Schedule triggered: ${workflowId} (${scheduleId})`);
    }
    /**
     * Log command executed
     */
    logCommandExecuted(commandName, executionId, userId) {
        console.log(`[WorkflowEngine] Command executed: ${commandName} in execution ${executionId} by ${userId}`);
    }
    /**
     * Log capability check
     */
    logCapabilityCheck(userId, capability, granted) {
        console.log(`[WorkflowEngine] Capability check: ${userId} - ${capability} - ${granted ? 'GRANTED' : 'DENIED'}`);
    }
}
exports.WorkflowLogger = WorkflowLogger;
//# sourceMappingURL=WorkflowLogger.js.map