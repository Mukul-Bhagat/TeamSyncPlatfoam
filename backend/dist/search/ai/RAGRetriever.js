"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGRetriever = void 0;
const SearchEngine_1 = require("../engine/SearchEngine");
class RAGRetriever {
    searchEngine;
    constructor() {
        this.searchEngine = new SearchEngine_1.SearchEngine();
    }
    /**
     * Retrieve relevant context for RAG
     */
    async retrieveContext(params) {
        const results = await this.searchEngine.search({
            query: params.query,
            organizationId: params.organizationId,
            workspaceId: params.workspaceId,
            entityType: params.entityType,
            limit: params.limit || 10,
            useSemantic: true,
        });
        const contextText = this.buildContextText(results);
        const entityTypes = [...new Set(results.map((r) => r.entity_type))];
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        return {
            query: params.query,
            results,
            contextText,
            metadata: {
                totalResults: results.length,
                entityTypes,
                averageScore,
            },
        };
    }
    /**
     * Build context text from search results
     */
    buildContextText(results) {
        if (results.length === 0) {
            return 'No relevant context found.';
        }
        const sections = results.map((result, index) => {
            return `[${index + 1}] ${result.title}\nType: ${result.entity_type}\nContent: ${result.content}\n`;
        });
        return `Relevant context:\n\n${sections.join('\n')}`;
    }
    /**
     * Retrieve context for a specific entity
     */
    async retrieveEntityContext(entityType, entityId, organizationId, workspaceId) {
        const results = await this.searchEngine.search({
            query: entityId,
            organizationId: organizationId,
            workspaceId: workspaceId,
            entityType,
            limit: 5,
            useSemantic: false,
        });
        const contextText = this.buildContextText(results);
        const entityTypes = [...new Set(results.map((r) => r.entity_type))];
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        return {
            query: entityId,
            results,
            contextText,
            metadata: {
                totalResults: results.length,
                entityTypes,
                averageScore,
            },
        };
    }
    /**
     * Retrieve recent activity context
     */
    async retrieveRecentContext(organizationId, workspaceId, hours = 24) {
        const results = await this.searchEngine.search({
            query: 'recent activity',
            organizationId: organizationId,
            workspaceId: workspaceId,
            limit: 20,
            useSemantic: false,
        });
        const contextText = this.buildContextText(results);
        const entityTypes = [...new Set(results.map((r) => r.entity_type))];
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        return {
            query: 'recent activity',
            results,
            contextText,
            metadata: {
                totalResults: results.length,
                entityTypes,
                averageScore,
            },
        };
    }
}
exports.RAGRetriever = RAGRetriever;
//# sourceMappingURL=RAGRetriever.js.map