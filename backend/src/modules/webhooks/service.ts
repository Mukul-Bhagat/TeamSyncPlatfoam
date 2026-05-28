import { WebhookVerifier } from './verifier';
import { EventNormalizer } from '../../core/normalization/EventNormalizer';
import type { WebhookRequest, WebhookResponse } from './types';
import { getIntegrationConfig, updateIntegrationHealth, createEcosystemEvent } from '../../shared/database';
import { InternalEventBus } from '../../core/event-bus';
import { AppError, RateLimitError } from '../../shared/errors';
import type { WebhookPayload } from '../../types';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export class WebhookService {
  private eventBus: InternalEventBus;
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private readonly rateLimitWindowMs = 60000; // 1 minute
  private readonly rateLimitMaxRequests = 100;

  constructor() {
    this.eventBus = InternalEventBus.getInstance();
  }

  async processWebhook(request: WebhookRequest, organizationId: string): Promise<WebhookResponse> {
    try {
      // Rate limit check
      const rateLimitKey = `${organizationId}:${request.integrationName}`;
      if (this.isRateLimited(rateLimitKey)) {
        throw new RateLimitError();
      }
      this.recordRequest(rateLimitKey);

      // Fetch integration config
      const integration = await getIntegrationConfig(organizationId, request.integrationName);

      if (!integration) {
        return { success: false, error: 'Integration not found or not configured' };
      }

      if (!integration.enabled) {
        return { success: false, error: 'Integration is disabled' };
      }

      // Verify webhook signature
      const verification = await WebhookVerifier.verify(
        request.body,
        request.headers,
        integration
      );

      if (!verification.valid) {
        await updateIntegrationHealth(integration.id, 'unhealthy');
        return { success: false, error: verification.error || 'Webhook verification failed' };
      }

      // Parse payload
      let payload: WebhookPayload;
      try {
        payload = JSON.parse(request.body);
      } catch {
        return { success: false, error: 'Invalid JSON payload' };
      }

      // Normalize event
      const normalizedEvent = EventNormalizer.normalize(
        { event_type: payload.event_type, event_version: payload.event_version, payload: payload.data },
        {
          source_app: request.integrationName,
          organization_id: organizationId,
          severity: this.determineSeverity(payload.event_type),
        }
      );

      // Create ecosystem event in database
      const ecosystemEvent = await createEcosystemEvent({
        source_app: normalizedEvent.source_app,
        organization_id: normalizedEvent.organization_id,
        workspace_id: normalizedEvent.workspace_id,
        channel_id: normalizedEvent.channel_id,
        event_type: normalizedEvent.event_type,
        event_version: normalizedEvent.event_version,
        payload: normalizedEvent.payload,
        metadata: normalizedEvent.metadata,
        severity: normalizedEvent.severity,
        correlation_id: normalizedEvent.correlation_id,
        triggered_by: normalizedEvent.triggered_by,
      });

      // Publish to event bus
      await this.eventBus.publish(ecosystemEvent);

      // Update integration health
      await updateIntegrationHealth(integration.id, 'healthy');

      return { success: true, event: ecosystemEvent };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry) return false;

    if (now - entry.windowStart > this.rateLimitWindowMs) {
      this.rateLimits.delete(key);
      return false;
    }

    return entry.count >= this.rateLimitMaxRequests;
  }

  private recordRequest(key: string): void {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now - entry.windowStart > this.rateLimitWindowMs) {
      this.rateLimits.set(key, { count: 1, windowStart: now });
    } else {
      entry.count++;
    }
  }

  private determineSeverity(eventType: string): 'info' | 'warning' | 'critical' {
    const criticalEvents = [
      'deployment.failed',
      'incident.created',
      'incident.escalated',
      'pipeline.failed',
      'analytics.alert',
    ];

    const warningEvents = [
      'deployment.started',
      'incident.resolved',
      'metrics.threshold',
    ];

    if (criticalEvents.includes(eventType)) return 'critical';
    if (warningEvents.includes(eventType)) return 'warning';
    return 'info';
  }
}
