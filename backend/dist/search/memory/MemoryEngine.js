"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryEngine = void 0;
const MemoryDetector_1 = require("./MemoryDetector");
const MemoryStorage_1 = require("./MemoryStorage");
class MemoryEngine {
    detector;
    storage;
    constructor() {
        this.detector = new MemoryDetector_1.MemoryDetector();
        this.storage = new MemoryStorage_1.MemoryStorage();
    }
    /**
     * Detect and store memories for an entity
     */
    async processEntity(entityType, entityId, organizationId, workspaceId) {
        const candidates = await this.detector.detectMemories(entityType, entityId, organizationId);
        const memoryIds = [];
        for (const candidate of candidates) {
            const memoryId = await this.storage.storeMemory(candidate, organizationId, workspaceId);
            memoryIds.push(memoryId);
        }
        return memoryIds;
    }
    /**
     * Retrieve memories for an organization
     */
    async retrieveMemories(organizationId, workspaceId, memoryType, limit) {
        return this.storage.retrieveMemories(organizationId, workspaceId, memoryType, limit);
    }
    /**
     * Get a specific memory
     */
    async getMemory(id) {
        return this.storage.getMemory(id);
    }
    /**
     * Semantic search for memories
     */
    async semanticSearchMemories(query, organizationId, workspaceId, limit) {
        return this.storage.semanticSearchMemories(query, organizationId, workspaceId, limit);
    }
    /**
     * Delete a memory
     */
    async deleteMemory(id) {
        return this.storage.deleteMemory(id);
    }
}
exports.MemoryEngine = MemoryEngine;
//# sourceMappingURL=MemoryEngine.js.map