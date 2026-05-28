import { RAGRetriever, type RAGContext } from './RAGRetriever';
import { MemoryEngine } from '../memory/MemoryEngine';

export interface BuiltContext {
  ragContext: RAGContext;
  memoryContext?: any[];
  combinedContext: string;
  metadata: {
    ragResults: number;
    memoryResults: number;
    contextLength: number;
  };
}

export class ContextBuilder {
  private ragRetriever: RAGRetriever;
  private memoryEngine: MemoryEngine;

  constructor() {
    this.ragRetriever = new RAGRetriever();
    this.memoryEngine = new MemoryEngine();
  }

  /**
   * Build comprehensive context for AI operations
   */
  async buildContext(params: {
    query: string;
    organizationId: string;
    workspaceId?: string;
    entityType?: string;
    includeMemories?: boolean;
    limit?: number;
  }): Promise<BuiltContext> {
    // Retrieve RAG context
    const ragContext = await this.ragRetriever.retrieveContext({
      query: params.query,
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      entityType: params.entityType,
      limit: params.limit || 10,
    });

    // Retrieve memory context if requested
    let memoryContext: any[] = [];
    if (params.includeMemories) {
      memoryContext = await this.memoryEngine.retrieveMemories(
        params.organizationId,
        params.workspaceId,
        undefined,
        5
      );
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
  private combineContexts(ragContext: RAGContext, memoryContext: any[]): string {
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
  async buildEntityContext(
    entityType: string,
    entityId: string,
    organizationId: string,
    workspaceId?: string
  ): Promise<BuiltContext> {
    const ragContext = await this.ragRetriever.retrieveEntityContext(
      entityType,
      entityId,
      organizationId,
      workspaceId
    );

    const memoryContext = await this.memoryEngine.retrieveMemories(
      organizationId,
      workspaceId,
      undefined,
      5
    );

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
  async buildRecentContext(
    organizationId: string,
    workspaceId?: string,
    hours: number = 24
  ): Promise<BuiltContext> {
    const ragContext = await this.ragRetriever.retrieveRecentContext(
      organizationId,
      workspaceId,
      hours
    );

    const memoryContext = await this.memoryEngine.retrieveMemories(
      organizationId,
      workspaceId,
      undefined,
      5
    );

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
