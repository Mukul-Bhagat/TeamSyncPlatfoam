/**
 * Observability API Routes
 * 
 * REST API endpoints for the observability infrastructure.
 * Provides access to traces, metrics, health, dead letters, replays, alerts, and diagnostics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ObservabilityEngine } from '../../src/observability/ObservabilityEngine';
import { DeadLetterManager } from '../../src/observability/dead-letter/DeadLetterManager';
import { ReplayEngine } from '../../src/observability/replay/ReplayEngine';
import { AlertEngine } from '../../src/observability/monitoring/AlertEngine';
import { DiagnosticsEngine } from '../../src/observability/diagnostics/DiagnosticsEngine';
import { DashboardDataService } from '../../src/observability/dashboards/DashboardDataService';

export async function observabilityRoutes(fastify: FastifyInstance) {
  const observabilityEngine = ObservabilityEngine.getInstance();
  const deadLetterManager = DeadLetterManager.getInstance();
  const replayEngine = ReplayEngine.getInstance();
  const alertEngine = AlertEngine.getInstance();
  const diagnosticsEngine = DiagnosticsEngine.getInstance();
  const dashboardDataService = DashboardDataService.getInstance();

  // Initialize observability engine
  await observabilityEngine.initialize();

  // ===== TRACING =====

  /**
   * Get trace spans
   */
  fastify.get('/observability/traces/:traceId', async (request: FastifyRequest<{ Params: { traceId: string } }>, reply: FastifyReply) => {
    const { traceId } = request.params;
    const spans = await observabilityEngine.getTraceSpans(traceId);
    return reply.send({ spans });
  });

  /**
   * Search traces
   */
  fastify.get('/observability/traces', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { serviceName, operationName, status, minDuration, maxDuration, startTime, endTime, limit } = request.query;
    const traces = await diagnosticsEngine.searchTraces({
      serviceName,
      operationName,
      status,
      minDuration: minDuration ? Number(minDuration) : undefined,
      maxDuration: maxDuration ? Number(maxDuration) : undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? Number(limit) : 50,
    });
    return reply.send({ traces });
  });

  // ===== METRICS =====

  /**
   * Get metric data
   */
  fastify.get('/observability/metrics/:metricName', async (request: FastifyRequest<{ Params: { metricName: string }; Querystring: any }>, reply: FastifyReply) => {
    const { metricName } = request.params;
    const { startTime, endTime, granularity, organizationId, workspaceId } = request.query;
    
    const timeRange = {
      start: startTime ? new Date(startTime) : new Date(Date.now() - 60 * 60 * 1000),
      end: endTime ? new Date(endTime) : new Date(),
    };

    const data = await dashboardDataService.getTelemetryData(
      metricName,
      timeRange,
      granularity || '5m',
      organizationId,
      workspaceId
    );
    return reply.send({ metricName, data });
  });

  // ===== HEALTH =====

  /**
   * Get system health
   */
  fastify.get('/observability/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = await observabilityEngine.checkHealth();
    return reply.send(health);
  });

  /**
   * Get component health
   */
  fastify.get('/observability/health/:componentName', async (request: FastifyRequest<{ Params: { componentName: string } }>, reply: FastifyReply) => {
    const { componentName } = request.params;
    const health = await observabilityEngine.checkComponentHealth(componentName);
    return reply.send(health);
  });

  /**
   * Get health history
   */
  fastify.get('/observability/health/:componentName/history', async (request: FastifyRequest<{ Params: { componentName: string }; Querystring: any }>, reply: FastifyReply) => {
    const { componentName } = request.params;
    const { hours = 24 } = request.query;
    const history = await observabilityEngine.getHealthHistory(componentName, null, Number(hours));
    return reply.send({ componentName, history });
  });

  // ===== DEAD LETTER =====

  /**
   * Get dead letter events
   */
  fastify.get('/observability/dead-letters', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { sourceSystem, eventType, organizationId, workspaceId, limit = 50, offset = 0 } = request.query;
    const events = await deadLetterManager.getDeadLetterEvents({
      sourceSystem,
      eventType,
      organizationId,
      workspaceId,
      limit: Number(limit),
      offset: Number(offset),
    });
    return reply.send({ events });
  });

  /**
   * Get dead letter statistics
   */
  fastify.get('/observability/dead-letters/statistics', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { organizationId, workspaceId, startTime, endTime } = request.query;
    const stats = await deadLetterManager.getStatistics({
      organizationId,
      workspaceId,
      timeRange: startTime && endTime ? {
        start: new Date(startTime),
        end: new Date(endTime),
      } : undefined,
    });
    return reply.send(stats);
  });

  /**
   * Replay dead letter event
   */
  fastify.post('/observability/dead-letters/:id/replay', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const event = await deadLetterManager.getDeadLetterEvent(id);
    if (!event) {
      return reply.status(404).send({ error: 'Dead letter event not found' });
    }

    const replayId = await replayEngine.startReplay('event', id, {
      organizationId: event.organizationId,
      workspaceId: event.workspaceId,
    });

    await deadLetterManager.markAsReplayed(id);
    return reply.send({ replayId });
  });

  // ===== REPLAY =====

  /**
   * Start a replay
   */
  fastify.post('/observability/replay', async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    const { entityType, entityId, options } = request.body;
    const replayId = await replayEngine.startReplay(entityType, entityId, options);
    return reply.send({ replayId });
  });

  /**
   * Get replay job
   */
  fastify.get('/observability/replay/:jobId', async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const { jobId } = request.params;
    const job = await replayEngine.getReplayJob(jobId);
    if (!job) {
      return reply.status(404).send({ error: 'Replay job not found' });
    }
    return reply.send(job);
  });

  /**
   * Get replay jobs for an entity
   */
  fastify.get('/observability/replay', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { entityType, entityId, limit = 50, offset = 0 } = request.query;
    const jobs = await replayEngine.getReplayJobs(entityType, entityId, {
      limit: Number(limit),
      offset: Number(offset),
    });
    return reply.send({ jobs });
  });

  /**
   * Cancel replay job
   */
  fastify.post('/observability/replay/:jobId/cancel', async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    const { jobId } = request.params;
    await replayEngine.cancelReplay(jobId);
    return reply.send({ success: true });
  });

  /**
   * Get replay statistics
   */
  fastify.get('/observability/replay/statistics', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { organizationId, workspaceId, startTime, endTime } = request.query;
    const stats = await replayEngine.getStatistics({
      organizationId,
      workspaceId,
      timeRange: startTime && endTime ? {
        start: new Date(startTime),
        end: new Date(endTime),
      } : undefined,
    });
    return reply.send(stats);
  });

  // ===== ALERTS =====

  /**
   * Create alert rule
   */
  fastify.post('/observability/alerts/rules', async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    const rule = await alertEngine.createRule(request.body);
    return reply.send(rule);
  });

  /**
   * Get alert rules
   */
  fastify.get('/observability/alerts/rules', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { organizationId, workspaceId, enabled, severity } = request.query;
    const rules = await alertEngine.getRules({
      organizationId,
      workspaceId,
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
      severity,
    });
    return reply.send({ rules });
  });

  /**
   * Update alert rule
   */
  fastify.put('/observability/alerts/rules/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    const { id } = request.params;
    const rule = await alertEngine.updateRule(id, request.body);
    return reply.send(rule);
  });

  /**
   * Delete alert rule
   */
  fastify.delete('/observability/alerts/rules/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    await alertEngine.deleteRule(id);
    return reply.send({ success: true });
  });

  /**
   * Get alert incidents
   */
  fastify.get('/observability/alerts/incidents', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { ruleId, organizationId, workspaceId, status, limit = 50 } = request.query;
    const incidents = await alertEngine.getIncidents({
      ruleId,
      organizationId,
      workspaceId,
      status,
      limit: Number(limit),
    });
    return reply.send({ incidents });
  });

  /**
   * Acknowledge incident
   */
  fastify.post('/observability/alerts/incidents/:id/acknowledge', async (request: FastifyRequest<{ Params: { id: string }; Body: { userId: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { userId } = request.body;
    await alertEngine.acknowledgeIncident(id, userId);
    return reply.send({ success: true });
  });

  /**
   * Resolve incident
   */
  fastify.post('/observability/alerts/incidents/:id/resolve', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    await alertEngine.resolveIncident(id);
    return reply.send({ success: true });
  });

  /**
   * Get alert statistics
   */
  fastify.get('/observability/alerts/statistics', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { organizationId, workspaceId, startTime, endTime } = request.query;
    const stats = await alertEngine.getStatistics({
      organizationId,
      workspaceId,
      timeRange: startTime && endTime ? {
        start: new Date(startTime),
        end: new Date(endTime),
      } : undefined,
    });
    return reply.send(stats);
  });

  // ===== DIAGNOSTICS =====

  /**
   * Generate diagnostic report for a trace
   */
  fastify.get('/observability/diagnostics/traces/:traceId', async (request: FastifyRequest<{ Params: { traceId: string } }>, reply: FastifyReply) => {
    const { traceId } = request.params;
    const report = await diagnosticsEngine.generateDiagnosticReport(traceId);
    return reply.send(report);
  });

  /**
   * Get workflow execution diagnostics
   */
  fastify.get('/observability/diagnostics/workflows/:executionId', async (request: FastifyRequest<{ Params: { executionId: string } }>, reply: FastifyReply) => {
    const { executionId } = request.params;
    const diagnostics = await diagnosticsEngine.getWorkflowExecutionDiagnostics(executionId);
    return reply.send(diagnostics);
  });

  // ===== DASHBOARD =====

  /**
   * Get dashboard summary
   */
  fastify.get('/observability/dashboard/summary', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { organizationId, workspaceId } = request.query;
    const summary = await dashboardDataService.getSummary(organizationId, workspaceId);
    return reply.send(summary);
  });

  /**
   * Get recent traces for dashboard
   */
  fastify.get('/observability/dashboard/traces', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { limit = 20, organizationId, workspaceId } = request.query;
    const traces = await dashboardDataService.getRecentTraces(Number(limit), organizationId, workspaceId);
    return reply.send({ traces });
  });

  /**
   * Get recent dead letters for dashboard
   */
  fastify.get('/observability/dashboard/dead-letters', async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    const { limit = 20, organizationId, workspaceId } = request.query;
    const events = await dashboardDataService.getRecentDeadLetters(Number(limit), organizationId, workspaceId);
    return reply.send({ events });
  });
}
