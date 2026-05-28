import { EmbeddingProviderFactory } from '../embeddings/EmbeddingProviderFactory';
import { supabase } from '../../shared/database';
import { env } from '../../config/env';
import type { MemoryCandidate } from './MemoryDetector';

export class MemoryStorage {
  private embeddingProvider = EmbeddingProviderFactory.create('openai', { apiKey: env.OPENAI_API_KEY || '' });

  /**
   * Store a memory entity
   */
  async storeMemory(
    candidate: MemoryCandidate,
    organizationId: string,
    workspaceId?: string
  ): Promise<string> {
    // Generate embedding for the memory content
    const embedding = await this.embeddingProvider.generate({ text: candidate.content });

    // Check if similar memory already exists
    const { data: existing } = await supabase
      .from('memory_entities')
      .select('id')
      .eq('source_entity_type', candidate.sourceEntityType)
      .eq('source_entity_id', candidate.sourceEntityId)
      .single();

    if (existing) {
      // Update existing memory
      await supabase
        .from('memory_entities')
        .update({
          title: candidate.title,
          content: candidate.content,
          importance_score: candidate.importanceScore,
          metadata: candidate.metadata,
          embedding: `[${embedding.embedding.join(',')}]`,
        })
        .eq('id', existing.id);
      return existing.id;
    }

    // Insert new memory
    const { data, error } = await supabase
      .from('memory_entities')
      .insert({
        organization_id: organizationId,
        workspace_id: workspaceId,
        memory_type: candidate.memoryType,
        source_entity_type: candidate.sourceEntityType,
        source_entity_id: candidate.sourceEntityId,
        title: candidate.title,
        content: candidate.content,
        importance_score: candidate.importanceScore,
        metadata: candidate.metadata,
        embedding: `[${embedding.embedding.join(',')}]`,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Retrieve memories for an organization
   */
  async retrieveMemories(
    organizationId: string,
    workspaceId?: string,
    memoryType?: string,
    limit: number = 20
  ): Promise<any[]> {
    let query = supabase
      .from('memory_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to retrieve memories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('memory_entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get memory: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from('memory_entities')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Semantic search for memories
   */
  async semanticSearchMemories(
    query: string,
    organizationId: string,
    workspaceId?: string,
    limit: number = 10
  ): Promise<any[]> {
    // Generate embedding for query
    const embedding = await this.embeddingProvider.generate({ text: query });

    // Search using vector similarity
    const vectorString = `[${embedding.embedding.join(',')}]`;
    let dbQuery = supabase
      .from('memory_entities')
      .select('*, 1 - (embedding <=> $1) as similarity', { count: 'exact' })
      .eq('$1', vectorString)
      .eq('organization_id', organizationId)
      .order('similarity', { ascending: false })
      .limit(limit);

    if (workspaceId) {
      dbQuery = dbQuery.eq('workspace_id', workspaceId);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Memory semantic search failed: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      ...row,
      score: row.similarity,
    }));
  }
}
