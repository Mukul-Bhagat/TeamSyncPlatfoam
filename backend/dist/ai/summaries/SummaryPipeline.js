"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryPipeline = void 0;
class SummaryPipeline {
    orchestrator;
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }
    buildBaseOptions(organizationId, workspaceId, channelId, metadata) {
        return {
            organizationId,
            workspaceId,
            channelId,
            metadata,
        };
    }
}
exports.SummaryPipeline = SummaryPipeline;
//# sourceMappingURL=SummaryPipeline.js.map