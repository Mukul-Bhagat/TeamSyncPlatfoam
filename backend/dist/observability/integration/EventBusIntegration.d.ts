/**
 * EventBusIntegration - Integrates observability with InternalEventBus
 *
 * Adds tracing, metrics, and dead letter persistence to the event bus.
 */
import type { EcosystemEvent } from '../../types';
export declare class EventBusIntegration {
    private static instance;
    private observabilityEngine;
    private deadLetterManager;
    private organizationId?;
    private workspaceId?;
    private constructor();
    static getInstance(): EventBusIntegration;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Wrap event publish with observability
     */
    tracePublish(eventType: string, publishFn: () => Promise<void>, event: EcosystemEvent): Promise<void>;
    /**
     * Get observability-enhanced event bus metrics
     */
    getEnhancedMetrics(): Promise<{
        deadLetters: {
            total: number;
            bySourceSystem: Record<string, number>;
            byEventType: Record<string, number>;
            replayed: number;
            pending: number;
        };
    }>;
}
//# sourceMappingURL=EventBusIntegration.d.ts.map