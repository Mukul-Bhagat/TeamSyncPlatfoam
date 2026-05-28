import type { NormalizedEvent, WebhookPayload } from '../../types';
export interface Normalizer {
    canNormalize(sourceApp: string, eventType: string): boolean;
    normalize(payload: WebhookPayload): NormalizedEvent;
}
export declare class NormalizationPipeline {
    private normalizers;
    registerNormalizer(sourceApp: string, normalizer: Normalizer): void;
    normalize(sourceApp: string, payload: WebhookPayload): Promise<NormalizedEvent>;
    private defaultNormalize;
    private generateCorrelationId;
    validateNormalizedEvent(event: NormalizedEvent): boolean;
}
//# sourceMappingURL=NormalizationPipeline.d.ts.map