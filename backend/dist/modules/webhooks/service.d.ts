import type { WebhookRequest, WebhookResponse } from './types';
export declare class WebhookService {
    private eventBus;
    private rateLimits;
    private readonly rateLimitWindowMs;
    private readonly rateLimitMaxRequests;
    constructor();
    processWebhook(request: WebhookRequest, organizationId: string): Promise<WebhookResponse>;
    private isRateLimited;
    private recordRequest;
    private determineSeverity;
}
//# sourceMappingURL=service.d.ts.map