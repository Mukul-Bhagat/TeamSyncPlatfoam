"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
const EmbeddingProviderFactory_1 = require("../embeddings/EmbeddingProviderFactory");
const database_1 = require("../../shared/database");
const env_1 = require("../../config/env");
class MemoryStorage {
    embeddingProvider = EmbeddingProviderFactory_1.EmbeddingProviderFactory.create('openai', { apiKey: env_1.env.OPENAI_API_KEY || '' });
    /**
     * Store a memory entity
     */
    async storeMemory(candidate, organizationId, workspaceId) {
        // Generate embedding for the memory content
        const embedding = await this.embeddingProvider.generate({ text: candidate.content });
        // Check if similar memory already exists
        const { data: existing } = await database_1.supabase
            .from('memory_entities')
            .select('id')
            .eq('source_entity_type', candidate.sourceEntityType)
            .eq('source_entity_id', candidate.sourceEntityId)
            .single();
        if (existing) {
            // Update existing memory
            await database_1.supabase
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
        const { data, error } = await database_1.supabase
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
    async retrieveMemories(organizationId, workspaceId, memoryType, limit = 20) {
        let query = database_1.supabase
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
    async getMemory(id) {
        const { data, error } = await database_1.supabase
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
    async deleteMemory(id) {
        const { error } = await database_1.supabase
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
    async semanticSearchMemories(query, organizationId, workspaceId, limit = 10) {
        // Generate embedding for query
        const embedding = await this.embeddingProvider.generate({ text: query });
        // Search using vector similarity
        const vectorString = `[${embedding.embedding.join(',')}]`;
        let dbQuery = database_1.supabase
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
        return (data || []).map((row) => ({
            ...row,
            score: row.similarity,
        }));
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=MemoryStorage.js.map