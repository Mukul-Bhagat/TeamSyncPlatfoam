export declare class WorkflowLogger {
    /**
     * Log workflow registered
     */
    logWorkflowRegistered(workflowId: string, workflowName: string): void;
    /**
     * Log workflow unregistered
     */
    logWorkflowUnregistered(workflowId: string): void;
    /**
     * Log execution started
     */
    logExecutionStarted(executionId: string, workflowId: string): void;
    /**
     * Log execution completed
     */
    logExecutionCompleted(executionId: string, workflowId: string): void;
    /**
     * Log execution failed
     */
    logExecutionFailed(executionId: string, workflowId: string, error: string): void;
    /**
     * Log execution cancelled
     */
    logExecutionCancelled(executionId: string, workflowId: string): void;
    /**
     * Log step completed
     */
    logStepCompleted(executionId: string, stepId: string): void;
    /**
     * Log step failed
     */
    logStepFailed(executionId: string, stepId: string, error: string): void;
    /**
     * Log step skipped
     */
    logStepSkipped(executionId: string, stepId: string, reason: string): void;
    /**
     * Log step retry success
     */
    logStepRetrySuccess(executionId: string, stepId: string, attempt: number): void;
    /**
     * Log step retry failed
     */
    logStepRetryFailed(executionId: string, stepId: string, attempt: number): void;
    /**
     * Log trigger matched
     */
    logTriggerMatched(workflowId: string, triggerType: string, eventData: Record<string, unknown>): void;
    /**
     * Log trigger evaluation
     */
    logTriggerEvaluation(workflowId: string, matched: boolean): void;
    /**
     * Log action executed
     */
    logActionExecuted(executionId: string, actionType: string, result: unknown): void;
    /**
     * Log action failed
     */
    logActionFailed(executionId: string, actionType: string, error: string): void;
    /**
     * Log approval requested
     */
    logApprovalRequested(executionId: string, approverId: string): void;
    /**
     * Log approval granted
     */
    logApprovalGranted(executionId: string, approverId: string): void;
    /**
     * Log approval rejected
     */
    logApprovalRejected(executionId: string, approverId: string, reason: string): void;
    /**
     * Log schedule triggered
     */
    logScheduleTriggered(workflowId: string, scheduleId: string): void;
    /**
     * Log command executed
     */
    logCommandExecuted(commandName: string, executionId: string, userId: string): void;
    /**
     * Log capability check
     */
    logCapabilityCheck(userId: string, capability: string, granted: boolean): void;
}
//# sourceMappingURL=WorkflowLogger.d.ts.map