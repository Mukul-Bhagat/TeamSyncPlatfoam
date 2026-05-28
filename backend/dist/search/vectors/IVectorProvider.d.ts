export interface VectorConfig {
    dimension: number;
    indexType?: 'ivfflat' | 'hnsw';
    metric?: 'cosine' | 'l2' | 'ip';
}
export interface VectorDocument {
    id: string;
    vector: number[];
    metadata?: Record<string, unknown>;
}
export interface SearchResult {
    id: string;
    score: number;
    metadata?: Record<string, unknown>;
}
export interface IVectorProvider {
    /**
     * Store a vector with associated metadata
     */
    store(documentId: string, vector: number[], metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Store multiple vectors in batch
     */
    storeBatch(documents: VectorDocument[]): Promise<void>;
    /**
     * Search for similar vectors
     */
    search(queryVector: number[], limit: number, filters?: Record<string, unknown>): Promise<SearchResult[]>;
    /**
     * Delete a vector by document ID
     */
    delete(documentId: string): Promise<void>;
    /**
     * Delete multiple vectors in batch
     */
    deleteBatch(documentIds: string[]): Promise<void>;
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vec1: number[], vec2: number[]): number;
    /**
     * Get the provider name
     */
    getProviderName(): string;
    /**
     * Check if the provider is healthy
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=IVectorProvider.d.ts.map