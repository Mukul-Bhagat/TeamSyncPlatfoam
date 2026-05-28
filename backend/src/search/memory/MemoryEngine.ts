import { MemoryDetector } from './MemoryDetector';
import { MemoryStorage } from './MemoryStorage';

export class MemoryEngine {
  private detector: MemoryDetector;
  private storage: MemoryStorage;

  constructor() {
    this.detector = new MemoryDetector();
    this.storage = new MemoryStorage();
  }

  /**
   * Detect and store memories for an entity
   */
  async processEntity(entityType: string, entityId: string, organizationId: string, workspaceId?: string): Promise<string[]> {
    const candidates = await this.detector.detectMemories(entityType, entityId, organizationId);
    const memoryIds: string[] = [];

    for (const candidate of candidates) {
      const memoryId = await this.storage.storeMemory(candidate, organizationId, workspaceId);
      memoryIds.push(memoryId);
    }

    return memoryIds;
  }

  /**
   * Retrieve memories for an organization
   */
  async retrieveMemories(
    organizationId: string,
    workspaceId?: string,
    memoryType?: string,
    limit?: number
  ) {
    return this.storage.retrieveMemories(organizationId, workspaceId, memoryType, limit);
  }

  /**
   * Get a specific memory
   */
  async getMemory(id: string) {
    return this.storage.getMemory(id);
  }

  /**
   * Semantic search for memories
   */
  async semanticSearchMemories(
    query: string,
    organizationId: string,
    workspaceId?: string,
    limit?: number
  ) {
    return this.storage.semanticSearchMemories(query, organizationId, workspaceId, limit);
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    return this.storage.deleteMemory(id);
  }
}
