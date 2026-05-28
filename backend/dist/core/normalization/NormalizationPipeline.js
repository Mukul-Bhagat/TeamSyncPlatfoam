"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizationPipeline = void 0;
const EventValidator_1 = require("../validation/EventValidator");
class NormalizationPipeline {
    normalizers = new Map();
    registerNormalizer(sourceApp, normalizer) {
        const normalizers = this.normalizers.get(sourceApp) || [];
        normalizers.push(normalizer);
        this.normalizers.set(sourceApp, normalizers);
    }
    async normalize(sourceApp, payload) {
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
    defaultNormalize(sourceApp, payload) {
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
    generateCorrelationId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    validateNormalizedEvent(event) {
        try {
            // Try to validate against known event schemas
            const validationResult = EventValidator_1.AnyEventSchema.safeParse({
                event_type: event.event_type,
                event_version: event.event_version,
                timestamp: new Date().toISOString(),
                data: event.payload,
            });
            return validationResult.success;
        }
        catch {
            // If validation fails, still allow the event through
            // but log a warning in production
            return true;
        }
    }
}
exports.NormalizationPipeline = NormalizationPipeline;
//# sourceMappingURL=NormalizationPipeline.js.map