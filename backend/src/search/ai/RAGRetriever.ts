import { SearchEngine } from '../engine/SearchEngine';
import type { SearchResult } from '../engine/SearchEngine';

export interface RAGContext {
  query: string;
  results: SearchResult[];
  contextText: string;
  metadata: {
    totalResults: number;
    entityTypes: string[];
    averageScore: number;
  };
}

export class RAGRetriever {
  private searchEngine: SearchEngine;

  constructor() {
    this.searchEngine = new SearchEngine();
  }

  /**
   * Retrieve relevant context for RAG
   */
  async retrieveContext(params: {
    query: string;
    organizationId: string;
    workspaceId?: string;
    entityType?: string;
    limit?: number;
  }): Promise<RAGContext> {
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
  private buildContextText(results: SearchResult[]): string {
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
  async retrieveEntityContext(
    entityType: string,
    entityId: string,
    organizationId: string,
    workspaceId?: string
  ): Promise<RAGContext> {
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
  async retrieveRecentContext(
    organizationId: string,
    workspaceId?: string,
    hours: number = 24
  ): Promise<RAGContext> {
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
