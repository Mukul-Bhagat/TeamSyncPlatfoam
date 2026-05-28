"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const database_1 = require("../../shared/database");
const types_1 = require("./types");
const errors_1 = require("../../shared/errors");
class IntegrationService {
    async listIntegrations(organizationId) {
        return (0, database_1.listIntegrationConfigs)(organizationId);
    }
    async getIntegration(organizationId, integrationName) {
        return (0, database_1.getIntegrationConfig)(organizationId, integrationName);
    }
    async createIntegration(request) {
        const parse = types_1.CreateIntegrationSchema.safeParse(request);
        if (!parse.success) {
            throw new errors_1.ValidationError(JSON.stringify(parse.error.errors));
        }
        return (0, database_1.createIntegrationConfig)(parse.data);
    }
    async updateIntegration(integrationId, request) {
        const parse = types_1.UpdateIntegrationSchema.safeParse(request);
        if (!parse.success) {
            throw new errors_1.ValidationError(JSON.stringify(parse.error.errors));
        }
        return (0, database_1.updateIntegrationConfig)(integrationId, parse.data);
    }
    async deleteIntegration(integrationId) {
        return (0, database_1.updateIntegrationConfig)(integrationId, { enabled: false });
    }
    async getIntegrationHealthById(integrationId) {
        const { data, error } = await database_1.supabase
            .from('integration_configs')
            .select('id, health_status, last_heartbeat')
            .eq('id', integrationId)
            .single();
        if (error || !data)
            return null;
        return {
            integration_id: data.id,
            status: data.health_status,
            last_heartbeat: data.last_heartbeat,
        };
    }
    async updateHealthStatus(integrationId, status) {
        return (0, database_1.updateIntegrationHealth)(integrationId, status);
    }
    async heartbeat(organizationId, integrationName) {
        const integration = await (0, database_1.getIntegrationConfig)(organizationId, integrationName);
        if (!integration)
            return null;
        return (0, database_1.updateIntegrationHealth)(integration.id, 'healthy');
    }
}
exports.IntegrationService = IntegrationService;
//# sourceMappingURL=service.js.map