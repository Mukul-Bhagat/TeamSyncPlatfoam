import { api } from '@/lib/api';
import type { IntegrationConfig, WebhookConfig, EcosystemEventItem } from '../types/integration.types';

export class IntegrationService {
  async listIntegrations(organizationId: string): Promise<IntegrationConfig[]> {
    return api.get('/integrations', { organization_id: organizationId });
  }

  async getIntegration(organizationId: string, name: string): Promise<IntegrationConfig> {
    return api.get(`/integrations/${name}`, { organization_id: organizationId });
  }

  async createIntegration(data: {
    organization_id: string;
    integration_name: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
    webhook_url?: string;
    webhook_secret?: string;
    api_key?: string;
  }): Promise<IntegrationConfig> {
    return api.post('/integrations', data);
  }

  async updateIntegration(id: string, data: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    return api.put(`/integrations/${id}`, data);
  }

  async deleteIntegration(id: string): Promise<void> {
    return api.del(`/integrations/${id}`);
  }

  async getWebhookConfig(organizationId: string, name: string): Promise<WebhookConfig> {
    return api.get(`/webhooks/${name}/config`, { organization_id: organizationId });
  }

  async testWebhook(name: string, organizationId: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/webhooks/${name}/test?organization_id=${organizationId}`, {});
  }

  async heartbeat(name: string, organizationId: string): Promise<{ success: boolean; health_status: string; last_heartbeat?: string }> {
    return api.post(`/integrations/${name}/heartbeat?organization_id=${organizationId}`, {});
  }

  async getEventLogs(organizationId: string, filters?: {
    source_app?: string;
    event_type?: string;
    severity?: string;
    limit?: string;
  }): Promise<EcosystemEventItem[]> {
    return api.get('/events', { organization_id: organizationId, ...filters });
  }

  async getEventStats(organizationId: string): Promise<{
    total_events: number;
    by_source_app: Record<string, number>;
    by_event_type: Record<string, number>;
    by_severity: Record<string, number>;
    recent_critical: EcosystemEventItem[];
  }> {
    return api.get('/events/stats', { organization_id: organizationId });
  }
}

export const integrationService = new IntegrationService();
