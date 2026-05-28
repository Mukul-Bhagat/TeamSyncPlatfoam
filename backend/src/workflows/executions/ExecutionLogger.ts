import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

export interface ExecutionLogEntry {
  execution_id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  step_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export class ExecutionLogger {
  private static instance: ExecutionLogger;
  private supabase;

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  static getInstance(): ExecutionLogger {
    if (!ExecutionLogger.instance) {
      ExecutionLogger.instance = new ExecutionLogger();
    }
    return ExecutionLogger.instance;
  }

  /**
   * Log an execution event
   */
  async log(entry: ExecutionLogEntry): Promise<void> {
    // TODO: Store in a dedicated execution_logs table
    // For now, we'll update the execution metadata
    const { error } = await this.supabase
      .from('workflow_executions')
      .update({
        metadata: {
          logs: entry,
        },
      })
      .eq('id', entry.execution_id);

    if (error) {
      console.error(`Failed to log execution event: ${error.message}`);
    }
  }

  /**
   * Log info
   */
  async logInfo(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log({
      execution_id: executionId,
      level: 'info',
      message,
      step_id: stepId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log warning
   */
  async logWarn(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log({
      execution_id: executionId,
      level: 'warn',
      message,
      step_id: stepId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log error
   */
  async logError(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log({
      execution_id: executionId,
      level: 'error',
      message,
      step_id: stepId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log debug
   */
  async logDebug(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log({
      execution_id: executionId,
      level: 'debug',
      message,
      step_id: stepId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get execution logs
   */
  async getLogs(executionId: string): Promise<ExecutionLogEntry[]> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .select('metadata')
      .eq('id', executionId)
      .single();

    if (error || !data) {
      return [];
    }

    const logs = (data.metadata as any).logs || [];
    return Array.isArray(logs) ? logs : [logs];
  }
}
