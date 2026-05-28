"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIntegrationSchema = exports.CreateIntegrationSchema = void 0;
const zod_1 = require("zod");
exports.CreateIntegrationSchema = zod_1.z.object({
    organization_id: zod_1.z.string().uuid(),
    integration_name: zod_1.z.string().min(1).max(100),
    enabled: zod_1.z.boolean().optional().default(true),
    config: zod_1.z.record(zod_1.z.unknown()).optional().default({}),
    webhook_url: zod_1.z.string().url().optional(),
    webhook_secret: zod_1.z.string().optional(),
    api_key: zod_1.z.string().optional(),
});
exports.UpdateIntegrationSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    config: zod_1.z.record(zod_1.z.unknown()).optional(),
    webhook_url: zod_1.z.string().url().optional(),
    webhook_secret: zod_1.z.string().optional(),
    api_key: zod_1.z.string().optional(),
    health_status: zod_1.z.enum(['unknown', 'healthy', 'degraded', 'unhealthy']).optional(),
});
//# sourceMappingURL=types.js.map