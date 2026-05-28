"use strict";
/**
 * AIOrchestratorIntegration - Integrates observability with AIOrchestrator
 *
 * Adds tracing, metrics, and token usage tracking to AI requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOrchestratorIntegration = void 0;
const ObservabilityEngine_1 = require("../ObservabilityEngine");
class AIOrchestratorIntegration {
    static instance;
    observabilityEngine;
    organizationId;
    workspaceId;
    constructor() {
        this.observabilityEngine = ObservabilityEngine_1.ObservabilityEngine.getInstance();
    }
    static getInstance() {
        if (!AIOrchestratorIntegration.instance) {
            AIOrchestratorIntegration.instance = new AIOrchestratorIntegration();
        }
        return AIOrchestratorIntegration.instance;
    }
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId, workspaceId) {
        this.organizationId = organizationId;
        this.workspaceId = workspaceId;
        this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
    }
    /**
     * Wrap AI request with observability
     */
    async traceAIRequest(requestType, requestFn, metadata = {}) {
        const spanId = this.observabilityEngine.startSpan(`ai.request.${requestType}`);
        const startTime = Date.now();
        try {
            const result = await requestFn();
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'success', {
                requestType,
                ...metadata,
            });
            await this.observabilityEngine.recordAIRequest(duration, {
                request_type: requestType,
                ...metadata,
            });
            if (result.tokenUsage) {
                await this.observabilityEngine.recordAITokenUsage(result.tokenUsage, {
                    request_type: requestType,
                    ...metadata,
                });
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'failed', {
                requestType,
                error: error instanceof Error ? error.message : String(error),
                ...metadata,
            });
            throw error;
        }
    }
}
exports.AIOrchestratorIntegration = AIOrchestratorIntegration;
//# sourceMappingURL=AIOrchestratorIntegration.js.map