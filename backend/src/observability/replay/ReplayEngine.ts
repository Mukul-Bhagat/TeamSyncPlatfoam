/**
 * ReplayEngine - Orchestrates replay operations
 * 
 * Manages replay job lifecycle, enforces idempotency, deduplication, and retry protection.
 * Coordinates replay handlers for different entity types.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import type { IReplayable, ReplayContext, ReplayResult } from './IReplayable';

export class ReplayEngine {
  private static instance: ReplayEngine;
  private supabase;
  private handlers: Map<string, IReplayable> = new Map();
  private activeReplays: Set<string> = new Set();

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  static getInstance(): ReplayEngine {
    if (!ReplayEngine.instance) {
      ReplayEngine.instance = new ReplayEngine();
    }
    return ReplayEngine.instance;
  }

  /**
   * Register a replay handler for an entity type
   */
  registerHandler(handler: IReplayable): void {
    this.handlers.set(handler.getEntityType(), handler);
  }

  /**
   * Unregister a replay handler
   */
  unregisterHandler(entityType: string): void {
    this.handlers.delete(entityType);
  }

  /**
   * Start a replay for an entity
   */
  async startReplay(
    entityType: string,
    entityId: string,
    options?: {
      fromStep?: string;
      skipSteps?: string[];
      overrideContext?: Record<string, unknown>;
      organizationId?: string;
      workspaceId?: string;
      createdBy?: string;
    }
  ): Promise<string> {
    const handler = this.handlers.get(entityType);
    if (!handler) {
      throw new Error(`No replay handler registered for entity type: ${entityType}`);
    }

    // Check if entity can be replayed
    const canReplay = await handler.canReplay(entityId);
    if (!canReplay) {
      throw new Error(`Entity ${entityId} of type ${entityType} cannot be replayed`);
    }

    // Prepare replay context
    const context = await handler.prepareReplay(entityId, options);

    // Validate replay safety
    const safetyCheck = await handler.validateReplaySafety(context);
    if (!safetyCheck.safe) {
      throw new Error(`Replay not safe: ${safetyCheck.reason}`);
    }

    // Check for active replay (deduplication)
    const replayKey = `${entityType}:${entityId}`;
    if (this.activeReplays.has(replayKey)) {
      throw new Error(`Replay already in progress for ${entityType}:${entityId}`);
    }

    // Create replay job record
    const { data: job, error } = await this.supabase
      .from('replay_jobs')
      .insert({
        replay_type: entityType,
        target_entity: entityId,
        status: 'pending',
        replay_context: context,
        organization_id: options?.organizationId,
        workspace_id: options?.workspaceId,
        created_by: options?.createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create replay job: ${error.message}`);
    }

    // Mark as active
    this.activeReplays.add(replayKey);

    // Execute replay asynchronously
    this.executeReplayAsync(job.id, handler, context, replayKey).catch((error) => {
      this.activeReplays.delete(replayKey);
    });

    return job.id;
  }

  /**
   * Execute replay asynchronously
   */
  private async executeReplayAsync(
    jobId: string,
    handler: IReplayable,
    context: ReplayContext,
    replayKey: string
  ): Promise<void> {
    try {
      // Update status to running
      await this.supabase
        .from('replay_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', jobId);

      // Execute replay
      const result = await handler.executeReplay(context);

      // Update status to completed
      await this.supabase
        .from('replay_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          replay_context: {
            ...context,
            result,
          },
        })
        .eq('id', jobId);
    } catch (error) {
      // Update status to failed
      await this.supabase
        .from('replay_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', jobId);
    } finally {
      this.activeReplays.delete(replayKey);
    }
  }

  /**
   * Get replay job by ID
   */
  async getReplayJob(jobId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('replay_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch replay job: ${error.message}`);
    }

    return data;
  }

  /**
   * Get replay jobs for an entity
   */
  async getReplayJobs(
    entityType: string,
    entityId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    let query = this.supabase
      .from('replay_jobs')
      .select('*')
      .eq('replay_type', entityType)
      .eq('target_entity', entityId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch replay jobs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cancel a replay job
   */
  async cancelReplay(jobId: string): Promise<void> {
    const job = await this.getReplayJob(jobId);
    if (!job) {
      throw new Error(`Replay job not found: ${jobId}`);
    }

    if (job.status !== 'pending' && job.status !== 'running') {
      throw new Error(`Cannot cancel replay job with status: ${job.status}`);
    }

    const { error } = await this.supabase
      .from('replay_jobs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to cancel replay job: ${error.message}`);
    }

    // Remove from active replays
    const replayKey = `${job.replay_type}:${job.target_entity}`;
    this.activeReplays.delete(replayKey);
  }

  /**
   * Get replay statistics
   */
  async getStatistics(options?: {
    organizationId?: string;
    workspaceId?: string;
    timeRange?: { start: Date; end: Date };
  }): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    successRate: number;
  }> {
    let query = this.supabase
      .from('replay_jobs')
      .select('replay_type, status');

    if (options?.organizationId) {
      query = query.eq('organization_id', options.organizationId);
    }

    if (options?.workspaceId) {
      query = query.eq('workspace_id', options.workspaceId);
    }

    if (options?.timeRange) {
      query = query.gte('created_at', options.timeRange.start.toISOString()).lte('created_at', options.timeRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch replay statistics: ${error.message}`);
    }

    const jobs = data || [];
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let completed = 0;
    let successful = 0;

    for (const job of jobs) {
      byType[job.replay_type] = (byType[job.replay_type] || 0) + 1;
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;

      if (job.status === 'completed') {
        completed++;
        successful++;
      }
    }

    const successRate = completed > 0 ? (successful / completed) * 100 : 0;

    return {
      total: jobs.length,
      byType,
      byStatus,
      successRate,
    };
  }

  /**
   * Get active replay count
   */
  getActiveReplayCount(): number {
    return this.activeReplays.size;
  }
}
