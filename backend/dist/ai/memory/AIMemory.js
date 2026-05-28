"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIMemory = void 0;
const database_1 = require("../../shared/database");
class AIMemory {
    /**
     * Store context in ai_context_memory table
     */
    async storeContext(organizationId, contextType, entityType, entityId, content, metadata = {}, workspaceId) {
        const { data, error } = await database_1.supabase
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
    async retrieveContext(organizationId, entityType, entityId, limit = 10) {
        const { data, error } = await database_1.supabase
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
    async retrieveContextByType(organizationId, contextType, workspaceId, limit = 20) {
        let query = database_1.supabase
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
    async semanticSearch(organizationId, query, limit = 10) {
        // This is a placeholder for future vector search implementation
        // For now, return empty array
        console.warn('[AIMemory] Semantic search not yet implemented - returning empty results');
        return [];
    }
    /**
     * Delete old context to manage storage
     */
    async deleteOldContext(olderThanDays = 30) {
        const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await database_1.supabase
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
exports.AIMemory = AIMemory;
//# sourceMappingURL=AIMemory.js.map