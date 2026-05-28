import type { EcosystemEvent } from '../../types';

export interface TriggerMatchResult {
  matched: boolean;
  context?: Record<string, unknown>;
  reason?: string;
}

export interface TriggerMetadata {
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

/**
 * ITrigger abstraction for all trigger types
 * Enables extensible trigger system for future trigger types
 */
export interface ITrigger {
  /**
   * Check if the trigger matches the given event/context
   */
  match(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<TriggerMatchResult>;

  /**
   * Evaluate trigger conditions
   */
  evaluate(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<boolean>;

  /**
   * Get trigger metadata
   */
  getMetadata(): TriggerMetadata;

  /**
   * Validate trigger configuration
   */
  validate(config: Record<string, unknown>): boolean;
}
