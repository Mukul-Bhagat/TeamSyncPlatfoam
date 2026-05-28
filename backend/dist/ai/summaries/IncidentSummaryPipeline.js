"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentSummaryPipeline = void 0;
const SummaryPipeline_1 = require("./SummaryPipeline");
class IncidentSummaryPipeline extends SummaryPipeline_1.SummaryPipeline {
    async execute(options) {
        const { entityId, organizationId, workspaceId, channelId, metadata } = options;
        return await this.orchestrator.generateSummary({
            summaryType: 'incident',
            entityId,
            organizationId,
            workspaceId,
            channelId,
            metadata: {
                ...metadata,
                resolved_at: metadata?.payload?.resolved_at,
                affected_services: metadata?.payload?.affected_services,
                description: metadata?.payload?.description,
                resolution: metadata?.payload?.resolution,
            },
        });
    }
}
exports.IncidentSummaryPipeline = IncidentSummaryPipeline;
//# sourceMappingURL=IncidentSummaryPipeline.js.map