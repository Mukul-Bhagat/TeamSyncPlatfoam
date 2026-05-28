/**
 * TelemetryStream - Realtime telemetry streaming via SSE
 * 
 * Provides Server-Sent Events (SSE) endpoints for streaming telemetry data.
 * Reuses existing SSE infrastructure for metrics, health, and alerts.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ObservabilityEngine } from '../ObservabilityEngine';
import { DashboardDataService } from '../dashboards/DashboardDataService';
import { AlertEngine } from '../monitoring/AlertEngine';

export class TelemetryStream {
  private static instance: TelemetryStream;
  private observabilityEngine: ObservabilityEngine;
  private dashboardDataService: DashboardDataService;
  private alertEngine: AlertEngine;
  private activeConnections: Set<string> = new Set();

  private constructor() {
    this.observabilityEngine = ObservabilityEngine.getInstance();
    this.dashboardDataService = DashboardDataService.getInstance();
    this.alertEngine = AlertEngine.getInstance();
  }

  static getInstance(): TelemetryStream {
    if (!TelemetryStream.instance) {
      TelemetryStream.instance = new TelemetryStream();
    }
    return TelemetryStream.instance;
  }

  /**
   * Register SSE routes
   */
  registerRoutes(fastify: FastifyInstance): void {
    // Stream dashboard summary
    fastify.get('/api/observability/stream/summary', this.streamSummary.bind(this));

    // Stream health updates
    fastify.get('/api/observability/stream/health', this.streamHealth.bind(this));

    // Stream metrics
    fastify.get('/api/observability/stream/metrics/:metricName', this.streamMetrics.bind(this));

    // Stream alerts
    fastify.get('/api/observability/stream/alerts', this.streamAlerts.bind(this));
  }

  /**
   * Stream dashboard summary updates
   */
  private async streamSummary(request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply): Promise<void> {
    const { organizationId, workspaceId } = request.query;
    const connectionId = this.generateConnectionId();

    // Set SSE headers
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    this.activeConnections.add(connectionId);

    // Send initial data
    const summary = await this.dashboardDataService.getSummary(organizationId, workspaceId);
    this.sendSSEEvent(reply, 'summary', summary);

    // Set up periodic updates
    const interval = (globalThis as any).setInterval(async () => {
      try {
        const updatedSummary = await this.dashboardDataService.getSummary(organizationId, workspaceId);
        this.sendSSEEvent(reply, 'summary', updatedSummary);
      } catch (error) {
        // Continue on error
      }
    }, 5000); // Update every 5 seconds

    // Cleanup on disconnect
    request.raw.on('close', () => {
      (globalThis as any).clearInterval(interval);
      this.activeConnections.delete(connectionId);
    });
  }

  /**
   * Stream health updates
   */
  private async streamHealth(request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply): Promise<void> {
    const { organizationId, workspaceId } = request.query;
    const connectionId = this.generateConnectionId();

    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    this.activeConnections.add(connectionId);

    // Send initial health data
    const health = await this.observabilityEngine.checkHealth();
    this.sendSSEEvent(reply, 'health', health);

    // Set up periodic updates
    const interval = (globalThis as any).setInterval(async () => {
      try {
        const updatedHealth = await this.observabilityEngine.checkHealth();
        this.sendSSEEvent(reply, 'health', updatedHealth);
      } catch (error) {
        // Continue on error
      }
    }, 10000); // Update every 10 seconds

    request.raw.on('close', () => {
      (globalThis as any).clearInterval(interval);
      this.activeConnections.delete(connectionId);
    });
  }

  /**
   * Stream metrics for a specific metric
   */
  private async streamMetrics(
    request: FastifyRequest<{ Params: { metricName: string }; Querystring: any }>,
    reply: FastifyReply
  ): Promise<void> {
    const { metricName } = request.params;
    const { organizationId, workspaceId, granularity = '5m' } = request.query;
    const connectionId = this.generateConnectionId();

    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    this.activeConnections.add(connectionId);

    // Send initial metrics
    const timeRange = {
      start: new Date(Date.now() - 60 * 60 * 1000),
      end: new Date(),
    };
    const data = await this.dashboardDataService.getTelemetryData(
      metricName,
      timeRange,
      granularity,
      organizationId,
      workspaceId
    );
    this.sendSSEEvent(reply, 'metrics', { metricName, data });

    // Set up periodic updates
    const interval = (globalThis as any).setInterval(async () => {
      try {
        const updatedTimeRange = {
          start: new Date(Date.now() - 60 * 60 * 1000),
          end: new Date(),
        };
        const updatedData = await this.dashboardDataService.getTelemetryData(
          metricName,
          updatedTimeRange,
          granularity,
          organizationId,
          workspaceId
        );
        this.sendSSEEvent(reply, 'metrics', { metricName, data: updatedData });
      } catch (error) {
        // Continue on error
      }
    }, 10000); // Update every 10 seconds

    request.raw.on('close', () => {
      (globalThis as any).clearInterval(interval);
      this.activeConnections.delete(connectionId);
    });
  }

  /**
   * Stream alert updates
   */
  private async streamAlerts(request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply): Promise<void> {
    const { organizationId, workspaceId } = request.query;
    const connectionId = this.generateConnectionId();

    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    this.activeConnections.add(connectionId);

    // Send initial alerts
    const incidents = await this.alertEngine.getIncidents({
      organizationId,
      workspaceId,
      status: 'active',
      limit: 50,
    });
    this.sendSSEEvent(reply, 'alerts', { incidents });

    // Set up periodic updates
    const interval = (globalThis as any).setInterval(async () => {
      try {
        const updatedIncidents = await this.alertEngine.getIncidents({
          organizationId,
          workspaceId,
          status: 'active',
          limit: 50,
        });
        this.sendSSEEvent(reply, 'alerts', { incidents: updatedIncidents });
      } catch (error) {
        // Continue on error
      }
    }, 15000); // Update every 15 seconds

    request.raw.on('close', () => {
      (globalThis as any).clearInterval(interval);
      this.activeConnections.delete(connectionId);
    });
  }

  /**
   * Send SSE event
   */
  private sendSSEEvent(reply: FastifyReply, eventType: string, data: unknown): void {
    const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    reply.raw.write(event);
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active connection count
   */
  getActiveConnectionCount(): number {
    return this.activeConnections.size;
  }
}
