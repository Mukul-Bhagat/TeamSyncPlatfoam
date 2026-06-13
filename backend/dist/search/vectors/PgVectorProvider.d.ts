import type { IVectorProvider, VectorDocument, SearchResult } from './IVectorProvider';
export declare class PgVectorProvider implements IVectorProvider {
    constructor(_dimension?: number);
    store(documentId: string, vector: number[], _metadata?: Record<string, unknown>): Promise<void>;
    storeBatch(documents: VectorDocument[]): Promise<void>;
    search(queryVector: number[], limit?: number, filters?: Record<string, unknown>): Promise<SearchResult[]>;
    delete(documentId: string): Promise<void>;
    deleteBatch(documentIds: string[]): Promise<void>;
    cosineSimilarity(vec1: number[], vec2: number[]): number;
    getProviderName(): string;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=PgVectorProvider.d.ts.map