"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const SearchEngine_1 = require("../../search/engine/SearchEngine");
const MemoryEngine_1 = require("../../search/memory/MemoryEngine");
class SearchService {
    searchEngine;
    memoryEngine;
    constructor() {
        this.searchEngine = new SearchEngine_1.SearchEngine();
        this.memoryEngine = new MemoryEngine_1.MemoryEngine();
    }
    /**
     * Perform hybrid search
     */
    async search(request) {
        const results = await this.searchEngine.search({
            query: request.query,
            organizationId: request.organization_id,
            workspaceId: request.workspace_id,
            entityType: request.entity_type,
            limit: request.limit || 10,
            useSemantic: request.use_semantic !== false,
        });
        return {
            results,
            total: results.length,
            query: request.query,
        };
    }
    /**
     * Semantic-only search
     */
    async semanticSearch(request) {
        const results = await this.searchEngine.search({
            query: request.query,
            organizationId: request.organization_id,
            workspaceId: request.workspace_id,
            entityType: request.entity_type,
            limit: request.limit || 10,
            useSemantic: true,
        });
        return {
            results,
            total: results.length,
            query: request.query,
        };
    }
    /**
     * Retrieve memories
     */
    async getMemories(request) {
        const memories = await this.memoryEngine.retrieveMemories(request.organization_id, request.workspace_id, request.memory_type, request.limit || 20);
        return {
            memories,
            total: memories.length,
        };
    }
    /**
     * Get a specific memory
     */
    async getMemory(id) {
        return this.memoryEngine.getMemory(id);
    }
    /**
     * Semantic search for memories
     */
    async searchMemories(query, organizationId, workspaceId, limit) {
        return this.memoryEngine.semanticSearchMemories(query, organizationId, workspaceId, limit);
    }
    /**
     * Delete a memory
     */
    async deleteMemory(id) {
        return this.memoryEngine.deleteMemory(id);
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
//# sourceMappingURL=service.js.map