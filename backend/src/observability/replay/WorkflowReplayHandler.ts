/**
 * WorkflowReplayHandler - Replay handler for workflow executions
 * Priority 1: Operationally critical for orchestration reliability
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { WorkflowEngine } from '../../workflows/engine/WorkflowEngine';
import type { IReplayable, ReplayContext, ReplayResult } from './IReplayable';

export class WorkflowReplayHandler implements IReplayable {
  private supabase;
  private workflowEngine: WorkflowEngine;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.workflowEngine = WorkflowEngine.getInstance();
  }

  async canReplay(entityId: string): Promise<boolean> {
    // Check if workflow execution exists and is failed
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', entityId)
      .single();

    if (error || !data) {
      return false;
    }

    // Can replay failed executions
    return data.status === 'failed';
  }

  async prepareReplay(
    entityId: string,
    options?: {
      fromStep?: string;
      skipSteps?: string[];
      overrideContext?: Record<string, unknown>;
    }
  ): Promise<ReplayContext> {
    // Get original execution
    const { data: execution, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', entityId)
      .single();

    if (error || !execution) {
      throw new Error(`Workflow execution not found: ${entityId}`);
    }

    // Get workflow definition
    const { data: workflow } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', execution.workflow_id)
      .single();

    if (!workflow) {
      throw new Error(`Workflow not found: ${execution.workflow_id}`);
    }

    return {
      entityId,
      entityType: 'workflow',
      originalExecution: {
        id: execution.id,
        timestamp: new Date(execution.created_at),
        context: execution.execution_context,
      },
      replayOptions: {
        fromStep: options?.fromStep,
        skipSteps: options?.skipSteps,
        overrideContext: options?.overrideContext,
      },
      metadata: {
        workflowId: execution.workflow_id,
        workflowName: workflow.name,
        originalStatus: execution.status,
        originalError: execution.error_message,
      },
    };
  }

  async executeReplay(context: ReplayContext): Promise<ReplayResult> {
    const startTime = Date.now();
    const replayId = `replay-${context.entityId}-${Date.now()}`;

    try {
      // Get workflow from context
      const workflowId = context.metadata?.workflowId as string;
      if (!workflowId) {
        throw new Error('Workflow ID not found in context');
      }

      // Merge original context with overrides
      const executionContext = {
        ...(context.originalExecution?.context || {}),
        ...(context.replayOptions?.overrideContext || {}),
        _replay: true,
        _replayId: replayId,
        _originalExecutionId: context.entityId,
      };

      // Execute workflow
      const execution = await this.workflowEngine.executeWorkflow(
        workflowId,
        undefined,
        executionContext
      );

      const duration = Date.now() - startTime;

      return {
        success: true,
        replayId,
        entityId: context.entityId,
        entityType: context.entityType,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: duration,
        output: {
          executionId: execution.id,
          status: execution.status,
          context: execution.execution_context,
        },
        metadata: context.metadata,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        replayId,
        entityId: context.entityId,
        entityType: context.entityType,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: duration,
        error: error instanceof Error ? error.message : String(error),
        metadata: context.metadata,
      };
    }
  }

  async validateReplaySafety(context: ReplayContext): Promise<{
    safe: boolean;
    reason?: string;
  }> {
    // Check if workflow is still enabled
    const workflowId = context.metadata?.workflowId as string;
    if (!workflowId) {
      return { safe: false, reason: 'Workflow ID not found' };
    }

    const { data: workflow } = await this.supabase
      .from('workflows')
      .select('enabled')
      .eq('id', workflowId)
      .single();

    if (!workflow) {
      return { safe: false, reason: 'Workflow not found' };
    }

    if (!workflow.enabled) {
      return { safe: false, reason: 'Workflow is disabled' };
    }

    // Check for recent replay (retry protection)
    const { data: recentReplays } = await this.supabase
      .from('replay_jobs')
      .select('*')
      .eq('target_entity', context.entityId)
      .eq('replay_type', 'workflow')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .limit(1);

    if (recentReplays && recentReplays.length > 0) {
      return { safe: false, reason: 'Recent replay already attempted' };
    }

    return { safe: true };
  }

  getEntityType(): string {
    return 'workflow';
  }
}
