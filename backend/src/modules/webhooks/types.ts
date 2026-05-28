import type { EcosystemEvent, WebhookPayload } from '../../types';

export interface WebhookRequest {
  integrationName: string;
  headers: Record<string, string>;
  body: string;
  rawBody?: Buffer;
}

export interface WebhookResponse {
  success: boolean;
  event?: EcosystemEvent;
  error?: string;
}

export interface WebhookServiceConfig {
  maxPayloadSize: number;
  timeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}
