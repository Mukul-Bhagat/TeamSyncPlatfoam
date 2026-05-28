import {
  getIntegrationConfig,
  listIntegrationConfigs,
  createIntegrationConfig,
  updateIntegrationConfig,
  updateIntegrationHealth,
  supabase,
} from '../../shared/database';
import { CreateIntegrationSchema, UpdateIntegrationSchema } from './types';
import { ValidationError } from '../../shared/errors';
import type { CreateIntegrationRequest, UpdateIntegrationRequest, IntegrationHealth } from './types';

export class IntegrationService {
  async listIntegrations(organizationId: string) {
    return listIntegrationConfigs(organizationId);
  }

  async getIntegration(organizationId: string, integrationName: string) {
    return getIntegrationConfig(organizationId, integrationName);
  }

  async createIntegration(request: CreateIntegrationRequest) {
    const parse = CreateIntegrationSchema.safeParse(request);
    if (!parse.success) {
      throw new ValidationError(JSON.stringify(parse.error.errors));
    }
    return createIntegrationConfig(parse.data);
  }

  async updateIntegration(integrationId: string, request: UpdateIntegrationRequest) {
    const parse = UpdateIntegrationSchema.safeParse(request);
    if (!parse.success) {
      throw new ValidationError(JSON.stringify(parse.error.errors));
    }
    return updateIntegrationConfig(integrationId, parse.data);
  }

  async deleteIntegration(integrationId: string) {
    return updateIntegrationConfig(integrationId, { enabled: false });
  }

  async getIntegrationHealthById(integrationId: string): Promise<IntegrationHealth | null> {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('id, health_status, last_heartbeat')
      .eq('id', integrationId)
      .single();

    if (error || !data) return null;

    return {
      integration_id: data.id,
      status: data.health_status as 'unknown' | 'healthy' | 'degraded' | 'unhealthy',
      last_heartbeat: data.last_heartbeat,
    };
  }

  async updateHealthStatus(
    integrationId: string,
    status: 'unknown' | 'healthy' | 'degraded' | 'unhealthy'
  ) {
    return updateIntegrationHealth(integrationId, status);
  }

  async heartbeat(organizationId: string, integrationName: string) {
    const integration = await getIntegrationConfig(organizationId, integrationName);
    if (!integration) return null;
    return updateIntegrationHealth(integration.id, 'healthy');
  }
}
