import { z } from 'zod';
export declare const CreateIntegrationSchema: z.ZodObject<{
    organization_id: z.ZodString;
    integration_name: z.ZodString;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    config: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    webhook_url: z.ZodOptional<z.ZodString>;
    webhook_secret: z.ZodOptional<z.ZodString>;
    api_key: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organization_id: string;
    integration_name: string;
    enabled: boolean;
    config: Record<string, unknown>;
    webhook_url?: string | undefined;
    webhook_secret?: string | undefined;
    api_key?: string | undefined;
}, {
    organization_id: string;
    integration_name: string;
    enabled?: boolean | undefined;
    config?: Record<string, unknown> | undefined;
    webhook_url?: string | undefined;
    webhook_secret?: string | undefined;
    api_key?: string | undefined;
}>;
export declare const UpdateIntegrationSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    webhook_url: z.ZodOptional<z.ZodString>;
    webhook_secret: z.ZodOptional<z.ZodString>;
    api_key: z.ZodOptional<z.ZodString>;
    health_status: z.ZodOptional<z.ZodEnum<["unknown", "healthy", "degraded", "unhealthy"]>>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    config?: Record<string, unknown> | undefined;
    webhook_url?: string | undefined;
    webhook_secret?: string | undefined;
    api_key?: string | undefined;
    health_status?: "unknown" | "healthy" | "degraded" | "unhealthy" | undefined;
}, {
    enabled?: boolean | undefined;
    config?: Record<string, unknown> | undefined;
    webhook_url?: string | undefined;
    webhook_secret?: string | undefined;
    api_key?: string | undefined;
    health_status?: "unknown" | "healthy" | "degraded" | "unhealthy" | undefined;
}>;
export type CreateIntegrationRequest = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegrationRequest = z.infer<typeof UpdateIntegrationSchema>;
export interface IntegrationHealth {
    integration_id: string;
    status: 'unknown' | 'healthy' | 'degraded' | 'unhealthy';
    last_heartbeat?: string;
    error_count?: number;
}
//# sourceMappingURL=types.d.ts.map