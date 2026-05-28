import { EmbeddingProviderFactory } from '../embeddings/EmbeddingProviderFactory';
import { VectorProviderFactory } from '../vectors/VectorProviderFactory';
import { supabase } from '../../shared/database';
import { env } from '../../config/env';

export interface SearchQuery {
  query: string;
  organizationId: string;
  workspaceId?: string;
  entityType?: string;
  limit?: number;
  useSemantic?: boolean;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export class SearchEngine {
  private embeddingProvider = EmbeddingProviderFactory.create('openai', { apiKey: env.OPENAI_API_KEY || '' });
  private vectorProvider = VectorProviderFactory.create('pgvector', 1536);

  /**
   * Perform hybrid search (keyword + semantic)
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const { query: searchText, organizationId, workspaceId, entityType, limit = 10, useSemantic = true } = query;

    // Perform keyword search
    const keywordResults = await this.keywordSearch(searchText, organizationId, workspaceId, entityType, limit * 2);

    if (!useSemantic) {
      return keywordResults.slice(0, limit);
    }

    // Perform semantic search
    const semanticResults = await this.semanticSearch(searchText, organizationId, workspaceId, entityType, limit * 2);

    // Merge and rank results
    const mergedResults = this.mergeAndRank(keywordResults, semanticResults);

    return mergedResults.slice(0, limit);
  }

  /**
   * Keyword-only search using trigram matching
   */
  async keywordSearch(
    query: string,
    organizationId: string,
    workspaceId?: string,
    entityType?: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('search_documents')
      .select('id, entity_type, entity_id, title, content, metadata, created_at')
      .eq('organization_id', organizationId)
      .textSearch('searchable_text', query)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (workspaceId) {
      dbQuery = dbQuery.eq('workspace_id', workspaceId);
    }
    if (entityType) {
      dbQuery = dbQuery.eq('entity_type', entityType);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Keyword search failed: ${error.message}`);
    }

    return (data || []).map((doc) => ({
      id: doc.id,
      entityType: doc.entity_type,
      entityId: doc.entity_id,
      title: doc.title || '',
      content: doc.content,
      score: 0.5, // Base score for keyword matches
      metadata: doc.metadata || {},
      createdAt: doc.created_at,
    }));
  }

  /**
   * Semantic search using vector similarity
   */
  async semanticSearch(
    query: string,
    organizationId: string,
    workspaceId?: string,
    entityType?: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    // Generate embedding for query
    const embedding = await this.embeddingProvider.generate({ text: query });

    // Search using vector similarity
    const vectorResults = await this.vectorProvider.search(embedding.embedding, limit, {
      organization_id: organizationId,
      workspace_id,
      entity_type: entityType,
    });

    // Fetch full documents for the vector results
    const documentIds = vectorResults.map((r) => r.id);
    const { data: documents } = await supabase
      .from('search_documents')
      .select('id, entity_type, entity_id, title, content, metadata, created_at')
      .in('id', documentIds);

    // Merge scores with documents
    const resultMap = new Map(vectorResults.map((r) => [r.id, r.score]));
    const results = (documents || []).map((doc) => ({
      id: doc.id,
      entityType: doc.entity_type,
      entityId: doc.entity_id,
      title: doc.title || '',
      content: doc.content,
      score: resultMap.get(doc.id) || 0,
      metadata: doc.metadata || {},
      createdAt: doc.created_at,
    }));

    // Sort by score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Merge and rank keyword and semantic results
   */
  private mergeAndRank(keywordResults: SearchResult[], semanticResults: SearchResult[]): SearchResult[] {
    const mergedMap = new Map<string, SearchResult>();

    // Add keyword results
    keywordResults.forEach((result) => {
      mergedMap.set(result.id, { ...result, score: result.score * 0.4 }); // 40% weight for keyword
    });

    // Add/merge semantic results
    semanticResults.forEach((result) => {
      const existing = mergedMap.get(result.id);
      if (existing) {
        // Combine scores
        existing.score = existing.score + (result.score * 0.6); // 60% weight for semantic
      } else {
        mergedMap.set(result.id, { ...result, score: result.score * 0.6 });
      }
    });

    // Apply recency boost
    const now = new Date();
    const results = Array.from(mergedMap.values()).map((result) => {
      const age = now.getTime() - new Date(result.createdAt).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 1 - daysSinceCreation / 30); // Decay over 30 days
      result.score = result.score * (1 + recencyBoost * 0.2); // Up to 20% boost for recent items
      return result;
    });

    // Sort by final score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Index a document
   */
  async indexDocument(params: {
    entityType: string;
    entityId: string;
    organizationId: string;
    workspaceId?: string;
    title: string;
    content: string;
    searchableText: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    // Check if document exists
    const { data: existing } = await supabase
      .from('search_documents')
      .select('id')
      .eq('entity_type', params.entityType)
      .eq('entity_id', params.entityId)
      .single();

    // Generate embedding
    const embedding = await this.embeddingProvider.generate({ text: params.searchableText });

    if (existing) {
      // Update existing document
      await supabase
        .from('search_documents')
        .update({
          title: params.title,
          content: params.content,
          searchable_text: params.searchableText,
          metadata: params.metadata,
          embedding: `[${embedding.embedding.join(',')}]`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new document
      await supabase
        .from('search_documents')
        .insert({
          organization_id: params.organizationId,
          workspace_id: params.workspaceId,
          entity_type: params.entityType,
          entity_id: params.entityId,
          title: params.title,
          content: params.content,
          searchable_text: params.searchableText,
          metadata: params.metadata,
          embedding: `[${embedding.embedding.join(',')}]`,
        });
    }
  }

  /**
   * Delete a document from search index
   */
  async deleteDocument(entityType: string, entityId: string): Promise<void> {
    await supabase
      .from('search_documents')
      .delete()
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
  }
}
