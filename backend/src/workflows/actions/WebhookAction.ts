import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';

export interface WebhookConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export class WebhookAction implements IWorkflowAction {
  async execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult> {
    const cfg = config as unknown as WebhookConfig;

    try {
      const controller = new AbortController();
      const timeout = cfg.timeout || 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(cfg.url, {
        method: cfg.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...cfg.headers,
        },
        body: cfg.body ? JSON.stringify(cfg.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({ status: response.status }));

      return {
        success: response.ok,
        data: responseData,
        metadata: {
          status: response.status,
          url: cfg.url,
          method: cfg.method || 'POST',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    const cfg = config as unknown as WebhookConfig;
    return !!(cfg.url && typeof cfg.url === 'string');
  }

  getSchema(): ActionSchema {
    return {
      type: 'trigger_webhook',
      description: 'Trigger an external webhook',
      config_schema: {
        url: { type: 'string', required: true, description: 'Webhook URL' },
        method: { type: 'enum', required: false, values: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'POST' },
        headers: { type: 'object', required: false, description: 'HTTP headers' },
        body: { type: 'object', required: false, description: 'Request body' },
        timeout: { type: 'number', required: false, default: 10000, description: 'Timeout in milliseconds' },
      },
    };
  }
}
