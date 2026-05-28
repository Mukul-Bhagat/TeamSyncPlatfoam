export declare class WorkflowStateTracker {
    private supabase;
    constructor();
    /**
     * Update execution status
     */
    updateExecutionStatus(executionId: string, status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'): Promise<void>;
    /**
     * Complete execution
     */
    completeExecution(executionId: string): Promise<void>;
    /**
     * Fail execution
     */
    failExecution(executionId: string, errorMessage: string): Promise<void>;
    /**
     * Cancel execution
     */
    cancelExecution(executionId: string): Promise<void>;
    /**
     * Update execution context
     */
    updateExecutionContext(executionId: string, context: Record<string, unknown>): Promise<void>;
    /**
     * Update execution metadata
     */
    updateExecutionMetadata(executionId: string, metadata: Record<string, unknown>): Promise<void>;
    /**
     * Get execution by ID
     */
    getExecution(executionId: string): Promise<any>;
    /**
     * Get executions for a workflow
     */
    getWorkflowExecutions(workflowId: string, limit?: number): Promise<any[]>;
    /**
     * Get pending executions
     */
    getPendingExecutions(): Promise<any[]>;
    /**
     * Get failed executions for retry
     */
    getFailedExecutions(olderThanMinutes?: number): Promise<any[]>;
}
//# sourceMappingURL=WorkflowStateTracker.d.ts.map