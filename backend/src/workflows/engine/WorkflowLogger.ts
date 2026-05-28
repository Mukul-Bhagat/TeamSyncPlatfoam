export class WorkflowLogger {
  /**
   * Log workflow registered
   */
  logWorkflowRegistered(workflowId: string, workflowName: string): void {
    console.log(`[WorkflowEngine] Workflow registered: ${workflowId} (${workflowName})`);
  }

  /**
   * Log workflow unregistered
   */
  logWorkflowUnregistered(workflowId: string): void {
    console.log(`[WorkflowEngine] Workflow unregistered: ${workflowId}`);
  }

  /**
   * Log execution started
   */
  logExecutionStarted(executionId: string, workflowId: string): void {
    console.log(`[WorkflowEngine] Execution started: ${executionId} for workflow ${workflowId}`);
  }

  /**
   * Log execution completed
   */
  logExecutionCompleted(executionId: string, workflowId: string): void {
    console.log(`[WorkflowEngine] Execution completed: ${executionId} for workflow ${workflowId}`);
  }

  /**
   * Log execution failed
   */
  logExecutionFailed(executionId: string, workflowId: string, error: string): void {
    console.error(`[WorkflowEngine] Execution failed: ${executionId} for workflow ${workflowId} - ${error}`);
  }

  /**
   * Log execution cancelled
   */
  logExecutionCancelled(executionId: string, workflowId: string): void {
    console.log(`[WorkflowEngine] Execution cancelled: ${executionId} for workflow ${workflowId}`);
  }

  /**
   * Log step completed
   */
  logStepCompleted(executionId: string, stepId: string): void {
    console.log(`[WorkflowEngine] Step completed: ${stepId} in execution ${executionId}`);
  }

  /**
   * Log step failed
   */
  logStepFailed(executionId: string, stepId: string, error: string): void {
    console.error(`[WorkflowEngine] Step failed: ${stepId} in execution ${executionId} - ${error}`);
  }

  /**
   * Log step skipped
   */
  logStepSkipped(executionId: string, stepId: string, reason: string): void {
    console.log(`[WorkflowEngine] Step skipped: ${stepId} in execution ${executionId} - ${reason}`);
  }

  /**
   * Log step retry success
   */
  logStepRetrySuccess(executionId: string, stepId: string, attempt: number): void {
    console.log(`[WorkflowEngine] Step retry success: ${stepId} in execution ${executionId} on attempt ${attempt}`);
  }

  /**
   * Log step retry failed
   */
  logStepRetryFailed(executionId: string, stepId: string, attempt: number): void {
    console.error(`[WorkflowEngine] Step retry failed: ${stepId} in execution ${executionId} on attempt ${attempt}`);
  }

  /**
   * Log trigger matched
   */
  logTriggerMatched(workflowId: string, triggerType: string, eventData: Record<string, unknown>): void {
    console.log(`[WorkflowEngine] Trigger matched: ${workflowId} (${triggerType})`, eventData);
  }

  /**
   * Log trigger evaluation
   */
  logTriggerEvaluation(workflowId: string, matched: boolean): void {
    console.log(`[WorkflowEngine] Trigger evaluation: ${workflowId} - ${matched ? 'MATCHED' : 'NO MATCH'}`);
  }

  /**
   * Log action executed
   */
  logActionExecuted(executionId: string, actionType: string, result: unknown): void {
    console.log(`[WorkflowEngine] Action executed: ${actionType} in execution ${executionId}`, result);
  }

  /**
   * Log action failed
   */
  logActionFailed(executionId: string, actionType: string, error: string): void {
    console.error(`[WorkflowEngine] Action failed: ${actionType} in execution ${executionId} - ${error}`);
  }

  /**
   * Log approval requested
   */
  logApprovalRequested(executionId: string, approverId: string): void {
    console.log(`[WorkflowEngine] Approval requested: ${executionId} by ${approverId}`);
  }

  /**
   * Log approval granted
   */
  logApprovalGranted(executionId: string, approverId: string): void {
    console.log(`[WorkflowEngine] Approval granted: ${executionId} by ${approverId}`);
  }

  /**
   * Log approval rejected
   */
  logApprovalRejected(executionId: string, approverId: string, reason: string): void {
    console.log(`[WorkflowEngine] Approval rejected: ${executionId} by ${approverId} - ${reason}`);
  }

  /**
   * Log schedule triggered
   */
  logScheduleTriggered(workflowId: string, scheduleId: string): void {
    console.log(`[WorkflowEngine] Schedule triggered: ${workflowId} (${scheduleId})`);
  }

  /**
   * Log command executed
   */
  logCommandExecuted(commandName: string, executionId: string, userId: string): void {
    console.log(`[WorkflowEngine] Command executed: ${commandName} in execution ${executionId} by ${userId}`);
  }

  /**
   * Log capability check
   */
  logCapabilityCheck(userId: string, capability: string, granted: boolean): void {
    console.log(`[WorkflowEngine] Capability check: ${userId} - ${capability} - ${granted ? 'GRANTED' : 'DENIED'}`);
  }
}
