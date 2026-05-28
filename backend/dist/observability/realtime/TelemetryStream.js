"use strict";
/**
 * TelemetryStream - Realtime telemetry streaming via SSE
 *
 * Provides Server-Sent Events (SSE) endpoints for streaming telemetry data.
 * Reuses existing SSE infrastructure for metrics, health, and alerts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryStream = void 0;
const ObservabilityEngine_1 = require("../ObservabilityEngine");
const DashboardDataService_1 = require("../dashboards/DashboardDataService");
const AlertEngine_1 = require("../monitoring/AlertEngine");
class TelemetryStream {
    static instance;
    observabilityEngine;
    dashboardDataService;
    alertEngine;
    activeConnections = new Set();
    constructor() {
        this.observabilityEngine = ObservabilityEngine_1.ObservabilityEngine.getInstance();
        this.dashboardDataService = DashboardDataService_1.DashboardDataService.getInstance();
        this.alertEngine = AlertEngine_1.AlertEngine.getInstance();
    }
    static getInstance() {
        if (!TelemetryStream.instance) {
            TelemetryStream.instance = new TelemetryStream();
        }
        return TelemetryStream.instance;
    }
    /**
     * Register SSE routes
     */
    registerRoutes(fastify) {
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
    async streamSummary(request, reply) {
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
        const interval = globalThis.setInterval(async () => {
            try {
                const updatedSummary = await this.dashboardDataService.getSummary(organizationId, workspaceId);
                this.sendSSEEvent(reply, 'summary', updatedSummary);
            }
            catch (error) {
                // Continue on error
            }
        }, 5000); // Update every 5 seconds
        // Cleanup on disconnect
        request.raw.on('close', () => {
            globalThis.clearInterval(interval);
            this.activeConnections.delete(connectionId);
        });
    }
    /**
     * Stream health updates
     */
    async streamHealth(request, reply) {
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
        const interval = globalThis.setInterval(async () => {
            try {
                const updatedHealth = await this.observabilityEngine.checkHealth();
                this.sendSSEEvent(reply, 'health', updatedHealth);
            }
            catch (error) {
                // Continue on error
            }
        }, 10000); // Update every 10 seconds
        request.raw.on('close', () => {
            globalThis.clearInterval(interval);
            this.activeConnections.delete(connectionId);
        });
    }
    /**
     * Stream metrics for a specific metric
     */
    async streamMetrics(request, reply) {
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
        const data = await this.dashboardDataService.getTelemetryData(metricName, timeRange, granularity, organizationId, workspaceId);
        this.sendSSEEvent(reply, 'metrics', { metricName, data });
        // Set up periodic updates
        const interval = globalThis.setInterval(async () => {
            try {
                const updatedTimeRange = {
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    end: new Date(),
                };
                const updatedData = await this.dashboardDataService.getTelemetryData(metricName, updatedTimeRange, granularity, organizationId, workspaceId);
                this.sendSSEEvent(reply, 'metrics', { metricName, data: updatedData });
            }
            catch (error) {
                // Continue on error
            }
        }, 10000); // Update every 10 seconds
        request.raw.on('close', () => {
            globalThis.clearInterval(interval);
            this.activeConnections.delete(connectionId);
        });
    }
    /**
     * Stream alert updates
     */
    async streamAlerts(request, reply) {
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
        const interval = globalThis.setInterval(async () => {
            try {
                const updatedIncidents = await this.alertEngine.getIncidents({
                    organizationId,
                    workspaceId,
                    status: 'active',
                    limit: 50,
                });
                this.sendSSEEvent(reply, 'alerts', { incidents: updatedIncidents });
            }
            catch (error) {
                // Continue on error
            }
        }, 15000); // Update every 15 seconds
        request.raw.on('close', () => {
            globalThis.clearInterval(interval);
            this.activeConnections.delete(connectionId);
        });
    }
    /**
     * Send SSE event
     */
    sendSSEEvent(reply, eventType, data) {
        const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        reply.raw.write(event);
    }
    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get active connection count
     */
    getActiveConnectionCount() {
        return this.activeConnections.size;
    }
}
exports.TelemetryStream = TelemetryStream;
//# sourceMappingURL=TelemetryStream.js.map