export interface WorkflowDefinition {
    trigger: Record<string, unknown>;
    steps: WorkflowStep[];
    conditions?: Record<string, unknown>[];
    retry_policy?: RetryPolicy;
    error_handling?: ErrorHandling;
}
export interface WorkflowStep {
    id: string;
    action_type: string;
    action_config: Record<string, unknown>;
    conditions?: Record<string, unknown>;
    on_failure?: 'continue' | 'stop' | 'retry';
}
export interface RetryPolicy {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    initial_delay_ms: number;
}
export interface ErrorHandling {
    on_failure: 'continue' | 'stop' | 'retry';
    notify_on_failure: boolean;
    fallback_action?: string;
}
export interface Workflow {
    id: string;
    organization_id: string;
    workspace_id?: string;
    name: string;
    description?: string;
    trigger_type: 'event' | 'schedule' | 'manual' | 'AI' | 'command';
    workflow_definition: WorkflowDefinition;
    enabled: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}
export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    trigger_event_id?: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
    execution_context: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: string;
}
export declare class WorkflowEngine {
    private static instance;
    private supabase;
    private eventBus;
    private validator;
    private stateTracker;
    private logger;
    private triggerEngine;
    private actionExecutor;
    private registeredWorkflows;
    private constructor();
    static getInstance(): WorkflowEngine;
    /**
     * Register a workflow
     */
    registerWorkflow(workflow: Workflow): Promise<void>;
    /**
     * Unregister a workflow
     */
    unregisterWorkflow(workflowId: string): Promise<void>;
    /**
     * Execute a workflow
     */
    executeWorkflow(workflowId: string, triggerEventId?: string, context?: Record<string, unknown>): Promise<WorkflowExecution>;
    /**
     * Execute workflow steps
     */
    private executeSteps;
    /**
     * Evaluate step conditions
     */
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
    /**
     * Retry a failed step
     */
    private retryStep;
    private sleep;
    /**
     * Create execution record
     */
    private createExecution;
    /**
     * Publish workflow event
     */
    private publishWorkflowEvent;
    /**
     * Load workflows from database
     */
    loadWorkflows(): Promise<void>;
    /**
     * Get workflow by ID
     */
    getWorkflow(workflowId: string): Workflow | undefined;
    /**
     * Get all registered workflows
     */
    getAllWorkflows(): Workflow[];
}
//# sourceMappingURL=WorkflowEngine.d.ts.map