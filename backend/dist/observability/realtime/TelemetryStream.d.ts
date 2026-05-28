/**
 * TelemetryStream - Realtime telemetry streaming via SSE
 *
 * Provides Server-Sent Events (SSE) endpoints for streaming telemetry data.
 * Reuses existing SSE infrastructure for metrics, health, and alerts.
 */
import { FastifyInstance } from 'fastify';
export declare class TelemetryStream {
    private static instance;
    private observabilityEngine;
    private dashboardDataService;
    private alertEngine;
    private activeConnections;
    private constructor();
    static getInstance(): TelemetryStream;
    /**
     * Register SSE routes
     */
    registerRoutes(fastify: FastifyInstance): void;
    /**
     * Stream dashboard summary updates
     */
    private streamSummary;
    /**
     * Stream health updates
     */
    private streamHealth;
    /**
     * Stream metrics for a specific metric
     */
    private streamMetrics;
    /**
     * Stream alert updates
     */
    private streamAlerts;
    /**
     * Send SSE event
     */
    private sendSSEEvent;
    /**
     * Generate unique connection ID
     */
    private generateConnectionId;
    /**
     * Get active connection count
     */
    getActiveConnectionCount(): number;
}
//# sourceMappingURL=TelemetryStream.d.ts.map