import { supabase } from '../../shared/database';

export interface StoredContext {
  id: string;
  organization_id: string;
  workspace_id?: string;
  context_type: string;
  entity_type: string;
  entity_id: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export class AIMemory {
  /**
   * Store context in ai_context_memory table
   */
  async storeContext(
    organizationId: string,
    contextType: string,
    entityType: string,
    entityId: string,
    content: string,
    metadata: Record<string, unknown> = {},
    workspaceId?: string
  ): Promise<StoredContext> {
    const { data, error } = await supabase
      .from('ai_context_memory')
      .insert({
        organization_id: organizationId,
        workspace_id: workspaceId,
        context_type: contextType,
        entity_type: entityType,
        entity_id: entityId,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store context: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieve context for an entity
   */
  async retrieveContext(
    organizationId: string,
    entityType: string,
    entityId: string,
    limit: number = 10
  ): Promise<StoredContext[]> {
    const { data, error } = await supabase
      .from('ai_context_memory')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to retrieve context: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Retrieve context by type
   */
  async retrieveContextByType(
    organizationId: string,
    contextType: string,
    workspaceId?: string,
    limit: number = 20
  ): Promise<StoredContext[]> {
    let query = supabase
      .from('ai_context_memory')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('context_type', contextType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to retrieve context by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Placeholder for semantic search (future vector DB integration)
   */
  async semanticSearch(
    organizationId: string,
    query: string,
    limit: number = 10
  ): Promise<StoredContext[]> {
    // This is a placeholder for future vector search implementation
    // For now, return empty array
    console.warn('[AIMemory] Semantic search not yet implemented - returning empty results');
    return [];
  }

  /**
   * Delete old context to manage storage
   */
  async deleteOldContext(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('ai_context_memory')
      .delete()
      .lt('created_at', cutoffDate);

    if (error) {
      throw new Error(`Failed to delete old context: ${error.message}`);
    }

    // Return count of deleted records (not directly available from Supabase delete)
    return 0;
  }
}
