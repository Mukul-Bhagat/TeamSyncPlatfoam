export interface Workflow {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  created_by: string;
  trigger_config: Record<string, unknown>;
  steps: WorkflowStep[];
  retry_policy: RetryPolicy;
  error_handling: ErrorHandling;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action_type: string;
  action_config: Record<string, unknown>;
  conditions?: StepCondition[];
  continue_on_error?: boolean;
}

export interface StepCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface RetryPolicy {
  max_retries: number;
  backoff_strategy: 'linear' | 'exponential';
  initial_delay_ms: number;
}

export interface ErrorHandling {
  on_failure: 'stop' | 'continue' | 'retry';
  notify_on_failure: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_event_id?: string;
  execution_context: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  execution_id: string;
  step_id: string;
  action_type: string;
  action_config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface WorkflowApproval {
  id: string;
  execution_id: string;
  requested_by: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approval_type: string;
  approval_metadata: Record<string, unknown>;
  expires_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface WorkflowSchedule {
  id: string;
  workflow_id: string;
  schedule_expression: string;
  timezone: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommandCapability {
  id: string;
  command_name: string;
  required_capability: string;
  description: string;
  created_at: string;
}

export interface UserCapability {
  id: string;
  user_id: string;
  capability_name: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  execution_id?: string;
}
