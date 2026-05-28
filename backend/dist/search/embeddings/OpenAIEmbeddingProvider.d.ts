import type { IEmbeddingProvider, EmbeddingConfig, EmbeddingRequest, EmbeddingResponse, BatchEmbeddingRequest, BatchEmbeddingResponse } from './IEmbeddingProvider';
export declare class OpenAIEmbeddingProvider implements IEmbeddingProvider {
    private config;
    private baseUrl;
    constructor(config: EmbeddingConfig);
    generate(request: EmbeddingRequest): Promise<EmbeddingResponse>;
    generateBatch(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResponse>;
    getDimension(): number;
    estimateTokens(text: string): number;
    getProviderName(): string;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=OpenAIEmbeddingProvider.d.ts.map