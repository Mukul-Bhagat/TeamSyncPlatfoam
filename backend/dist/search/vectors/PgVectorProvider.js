"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgVectorProvider = void 0;
const database_1 = require("../../shared/database");
class PgVectorProvider {
    constructor(_dimension = 1536) {
        // Dimension is stored for future use
    }
    async store(documentId, vector, _metadata) {
        const { error } = await database_1.supabase
            .from('search_documents')
            .update({
            embedding: `[${vector.join(',')}]`,
            updated_at: new Date().toISOString(),
        })
            .eq('id', documentId);
        if (error) {
            throw new Error(`Failed to store vector: ${error.message}`);
        }
    }
    async storeBatch(documents) {
        const updates = documents.map((doc) => ({
            id: doc.id,
            embedding: `[${doc.vector.join(',')}]`,
            updated_at: new Date().toISOString(),
        }));
        const { error } = await database_1.supabase
            .from('search_documents')
            .upsert(updates);
        if (error) {
            throw new Error(`Failed to store vectors in batch: ${error.message}`);
        }
    }
    async search(queryVector, limit = 10, filters) {
        const vectorString = `[${queryVector.join(',')}]`;
        let query = database_1.supabase
            .from('search_documents')
            .select('id, 1 - (embedding <=> $1) as similarity, metadata', { count: 'exact' })
            .eq('$1', vectorString)
            .order('similarity', { ascending: false })
            .limit(limit);
        // Apply filters if provided
        if (filters?.organization_id) {
            query = query.eq('organization_id', filters.organization_id);
        }
        if (filters?.workspace_id) {
            query = query.eq('workspace_id', filters.workspace_id);
        }
        if (filters?.entity_type) {
            query = query.eq('entity_type', filters.entity_type);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Vector search failed: ${error.message}`);
        }
        return (data || []).map((row) => ({
            id: row.id,
            score: row.similarity,
            metadata: row.metadata,
        }));
    }
    async delete(documentId) {
        const { error } = await database_1.supabase
            .from('search_documents')
            .update({ embedding: null, updated_at: new Date().toISOString() })
            .eq('id', documentId);
        if (error) {
            throw new Error(`Failed to delete vector: ${error.message}`);
        }
    }
    async deleteBatch(documentIds) {
        const { error } = await database_1.supabase
            .from('search_documents')
            .update({ embedding: null, updated_at: new Date().toISOString() })
            .in('id', documentIds);
        if (error) {
            throw new Error(`Failed to delete vectors in batch: ${error.message}`);
        }
    }
    cosineSimilarity(vec1, vec2) {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectors must have the same dimension');
        }
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    getProviderName() {
        return 'pgvector';
    }
    async healthCheck() {
        try {
            // Check if pgvector extension is available
            const { error } = await database_1.supabase.rpc('pgvector_version');
            // If the function doesn't exist, we'll get an error - that's okay for now
            // We'll assume pgvector is available if the table exists
            await database_1.supabase
                .from('search_documents')
                .select('id')
                .limit(1);
            return !error;
        }
        catch {
            return false;
        }
    }
}
exports.PgVectorProvider = PgVectorProvider;
//# sourceMappingURL=PgVectorProvider.js.map