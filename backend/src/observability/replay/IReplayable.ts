/**
 * IReplayable - Interface for replayable entities
 * 
 * Entities that can be replayed (workflows, events, indexing jobs, AI pipelines)
 * must implement this interface.
 */

export interface ReplayContext {
  entityId: string;
  entityType: string;
  originalExecution?: {
    id: string;
    timestamp: Date;
    context: Record<string, unknown>;
  };
  replayOptions: {
    fromStep?: string;
    skipSteps?: string[];
    overrideContext?: Record<string, unknown>;
  };
  metadata: Record<string, unknown>;
}

export interface ReplayResult {
  success: boolean;
  replayId: string;
  entityId: string;
  entityType: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: string;
  output?: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface IReplayable {
  /**
   * Check if an entity can be replayed
   */
  canReplay(entityId: string): Promise<boolean>;

  /**
   * Prepare a replay context for an entity
   */
  prepareReplay(entityId: string, options?: {
    fromStep?: string;
    skipSteps?: string[];
    overrideContext?: Record<string, unknown>;
  }): Promise<ReplayContext>;

  /**
   * Execute a replay with the given context
   */
  executeReplay(context: ReplayContext): Promise<ReplayResult>;

  /**
   * Validate that a replay is safe to execute
   * Checks for idempotency, deduplication, retry protection
   */
  validateReplaySafety(context: ReplayContext): Promise<{
    safe: boolean;
    reason?: string;
  }>;

  /**
   * Get the entity type this handler supports
   */
  getEntityType(): string;
}
