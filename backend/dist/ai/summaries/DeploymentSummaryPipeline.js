"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentSummaryPipeline = void 0;
const SummaryPipeline_1 = require("./SummaryPipeline");
class DeploymentSummaryPipeline extends SummaryPipeline_1.SummaryPipeline {
    async execute(options) {
        const { entityId, organizationId, workspaceId, metadata } = options;
        return await this.orchestrator.generateSummary({
            summaryType: 'deployment',
            entityId,
            organizationId,
            workspaceId,
            metadata: {
                ...metadata,
                version: metadata?.payload?.version,
                completed_at: metadata?.payload?.completed_at,
                error_message: metadata?.payload?.error_message,
            },
        });
    }
}
exports.DeploymentSummaryPipeline = DeploymentSummaryPipeline;
//# sourceMappingURL=DeploymentSummaryPipeline.js.map