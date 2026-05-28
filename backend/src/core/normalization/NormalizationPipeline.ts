import type { NormalizedEvent, WebhookPayload } from '../../types';
import { AnyEventSchema } from '../validation/EventValidator';

export interface Normalizer {
  canNormalize(sourceApp: string, eventType: string): boolean;
  normalize(payload: WebhookPayload): NormalizedEvent;
}

export class NormalizationPipeline {
  private normalizers: Map<string, Normalizer[]> = new Map();

  registerNormalizer(sourceApp: string, normalizer: Normalizer): void {
    const normalizers = this.normalizers.get(sourceApp) || [];
    normalizers.push(normalizer);
    this.normalizers.set(sourceApp, normalizers);
  }

  async normalize(sourceApp: string, payload: WebhookPayload): Promise<NormalizedEvent> {
    // Find appropriate normalizer
    const normalizers = this.normalizers.get(sourceApp);
    
    if (normalizers) {
      for (const normalizer of normalizers) {
        if (normalizer.canNormalize(sourceApp, payload.event_type)) {
          return normalizer.normalize(payload);
        }
      }
    }

    // Default normalization if no specific normalizer found
    return this.defaultNormalize(sourceApp, payload);
  }

  private defaultNormalize(sourceApp: string, payload: WebhookPayload): NormalizedEvent {
    return {
      source_app: sourceApp,
      event_type: payload.event_type,
      event_version: payload.event_version,
      payload: payload.data,
      metadata: {
        normalized_at: new Date().toISOString(),
        normalizer: 'default',
      },
      correlation_id: this.generateCorrelationId(),
    };
  }

  private generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateNormalizedEvent(event: NormalizedEvent): boolean {
    try {
      // Try to validate against known event schemas
      const validationResult = AnyEventSchema.safeParse({
        event_type: event.event_type,
        event_version: event.event_version,
        timestamp: new Date().toISOString(),
        data: event.payload,
      });

      return validationResult.success;
    } catch {
      // If validation fails, still allow the event through
      // but log a warning in production
      return true;
    }
  }
}
