import type { CreateIntegrationRequest, UpdateIntegrationRequest, IntegrationHealth } from './types';
export declare class IntegrationService {
    listIntegrations(organizationId: string): Promise<any[]>;
    getIntegration(organizationId: string, integrationName: string): Promise<any>;
    createIntegration(request: CreateIntegrationRequest): Promise<any>;
    updateIntegration(integrationId: string, request: UpdateIntegrationRequest): Promise<any>;
    deleteIntegration(integrationId: string): Promise<any>;
    getIntegrationHealthById(integrationId: string): Promise<IntegrationHealth | null>;
    updateHealthStatus(integrationId: string, status: 'unknown' | 'healthy' | 'degraded' | 'unhealthy'): Promise<any>;
    heartbeat(organizationId: string, integrationName: string): Promise<any>;
}
//# sourceMappingURL=service.d.ts.map