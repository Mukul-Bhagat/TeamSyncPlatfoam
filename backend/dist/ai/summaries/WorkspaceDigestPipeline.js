"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceDigestPipeline = void 0;
const SummaryPipeline_1 = require("./SummaryPipeline");
class WorkspaceDigestPipeline extends SummaryPipeline_1.SummaryPipeline {
    async execute(options) {
        const { organizationId, workspaceId, metadata } = options;
        if (!workspaceId) {
            throw new Error('Workspace ID is required for workspace digest');
        }
        const timeRange = metadata?.timeRange || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return await this.orchestrator.generateSummary({
            summaryType: 'workspace_daily',
            entityId: workspaceId,
            organizationId,
            workspaceId,
            metadata: {
                ...metadata,
                timeRange,
                date: new Date().toISOString().split('T')[0],
            },
        });
    }
}
exports.WorkspaceDigestPipeline = WorkspaceDigestPipeline;
//# sourceMappingURL=WorkspaceDigestPipeline.js.map