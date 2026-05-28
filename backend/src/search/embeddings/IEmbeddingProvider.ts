export interface EmbeddingConfig {
  apiKey: string;
  model?: string;
  dimension?: number;
  batchSize?: number;
  timeoutMs?: number;
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface BatchEmbeddingRequest {
  texts: string[];
  model?: string;
}

export interface BatchEmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface IEmbeddingProvider {
  /**
   * Generate embedding for a single text
   */
  generate(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  /**
   * Generate embeddings for multiple texts in batch
   */
  generateBatch(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResponse>;

  /**
   * Get the embedding dimension
   */
  getDimension(): number;

  /**
   * Estimate token count for text
   */
  estimateTokens(text: string): number;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Check if the provider is healthy
   */
  healthCheck(): Promise<boolean>;
}
