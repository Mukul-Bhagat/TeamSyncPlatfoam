import { z } from 'zod';

export const CreateIntegrationSchema = z.object({
  organization_id: z.string().uuid(),
  integration_name: z.string().min(1).max(100),
  enabled: z.boolean().optional().default(true),
  config: z.record(z.unknown()).optional().default({}),
  webhook_url: z.string().url().optional(),
  webhook_secret: z.string().optional(),
  api_key: z.string().optional(),
});

export const UpdateIntegrationSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  webhook_url: z.string().url().optional(),
  webhook_secret: z.string().optional(),
  api_key: z.string().optional(),
  health_status: z.enum(['unknown', 'healthy', 'degraded', 'unhealthy']).optional(),
});

export type CreateIntegrationRequest = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegrationRequest = z.infer<typeof UpdateIntegrationSchema>;

export interface IntegrationHealth {
  integration_id: string;
  status: 'unknown' | 'healthy' | 'degraded' | 'unhealthy';
  last_heartbeat?: string;
  error_count?: number;
}
