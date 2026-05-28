"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
const RAGRetriever_1 = require("./RAGRetriever");
const MemoryEngine_1 = require("../memory/MemoryEngine");
class ContextBuilder {
    ragRetriever;
    memoryEngine;
    constructor() {
        this.ragRetriever = new RAGRetriever_1.RAGRetriever();
        this.memoryEngine = new MemoryEngine_1.MemoryEngine();
    }
    /**
     * Build comprehensive context for AI operations
     */
    async buildContext(params) {
        // Retrieve RAG context
        const ragContext = await this.ragRetriever.retrieveContext({
            query: params.query,
            organizationId: params.organizationId,
            workspaceId: params.workspaceId,
            entityType: params.entityType,
            limit: params.limit || 10,
        });
        // Retrieve memory context if requested
        let memoryContext = [];
        if (params.includeMemories) {
            memoryContext = await this.memoryEngine.retrieveMemories(params.organizationId, params.workspaceId, undefined, 5);
        }
        // Combine contexts
        const combinedContext = this.combineContexts(ragContext, memoryContext);
        return {
            ragContext,
            memoryContext: memoryContext.length > 0 ? memoryContext : undefined,
            combinedContext,
            metadata: {
                ragResults: ragContext.results.length,
                memoryResults: memoryContext.length,
                contextLength: combinedContext.length,
            },
        };
    }
    /**
     * Combine RAG and memory contexts
     */
    combineContexts(ragContext, memoryContext) {
        let combined = ragContext.contextText;
        if (memoryContext.length > 0) {
            combined += '\n\nOperational Memory:\n\n';
            memoryContext.forEach((memory, index) => {
                combined += `[M${index + 1}] ${memory.title}\nType: ${memory.memory_type}\nContent: ${memory.content}\n`;
            });
        }
        return combined;
    }
    /**
     * Build context for a specific entity (e.g., deployment, incident)
     */
    async buildEntityContext(entityType, entityId, organizationId, workspaceId) {
        const ragContext = await this.ragRetriever.retrieveEntityContext(entityType, entityId, organizationId, workspaceId);
        const memoryContext = await this.memoryEngine.retrieveMemories(organizationId, workspaceId, undefined, 5);
        const combinedContext = this.combineContexts(ragContext, memoryContext);
        return {
            ragContext,
            memoryContext: memoryContext.length > 0 ? memoryContext : undefined,
            combinedContext,
            metadata: {
                ragResults: ragContext.results.length,
                memoryResults: memoryContext.length,
                contextLength: combinedContext.length,
            },
        };
    }
    /**
     * Build recent activity context
     */
    async buildRecentContext(organizationId, workspaceId, hours = 24) {
        const ragContext = await this.ragRetriever.retrieveRecentContext(organizationId, workspaceId, hours);
        const memoryContext = await this.memoryEngine.retrieveMemories(organizationId, workspaceId, undefined, 5);
        const combinedContext = this.combineContexts(ragContext, memoryContext);
        return {
            ragContext,
            memoryContext: memoryContext.length > 0 ? memoryContext : undefined,
            combinedContext,
            metadata: {
                ragResults: ragContext.results.length,
                memoryResults: memoryContext.length,
                contextLength: combinedContext.length,
            },
        };
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=ContextBuilder.js.map