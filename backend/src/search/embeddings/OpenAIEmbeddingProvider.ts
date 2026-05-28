import type { IEmbeddingProvider, EmbeddingConfig, EmbeddingRequest, EmbeddingResponse, BatchEmbeddingRequest, BatchEmbeddingResponse } from './IEmbeddingProvider';

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  private config: EmbeddingConfig;
  private baseUrl: string;

  constructor(config: EmbeddingConfig) {
    this.config = {
      model: 'text-embedding-3-small',
      dimension: 1536,
      batchSize: 100,
      timeoutMs: 30000,
      ...config,
    };
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generate(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.model,
          input: request.text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI Embeddings API error: ${response.status} ${JSON.stringify(error)}`);
      }

      const data = await response.json();

      return {
        embedding: data.data[0].embedding,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI Embeddings API request timed out');
      }
      throw error;
    }
  }

  async generateBatch(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.model,
          input: request.texts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI Embeddings API error: ${response.status} ${JSON.stringify(error)}`);
      }

      const data = await response.json();

      return {
        embeddings: data.data.map((item: any) => item.embedding),
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI Embeddings API request timed out');
      }
      throw error;
    }
  }

  getDimension(): number {
    const modelDimensions: Record<string, number> = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
    };
    return modelDimensions[this.config.model || 'text-embedding-3-small'] || 1536;
  }

  estimateTokens(text: string): number {
    // Rough approximation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  getProviderName(): string {
    return 'openai';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
