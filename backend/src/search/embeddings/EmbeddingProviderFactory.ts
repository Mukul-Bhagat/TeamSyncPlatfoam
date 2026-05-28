import type { IEmbeddingProvider, EmbeddingConfig } from './IEmbeddingProvider';
import { OpenAIEmbeddingProvider } from './OpenAIEmbeddingProvider';

export class EmbeddingProviderFactory {
  private static providers: Map<string, (config: EmbeddingConfig) => IEmbeddingProvider> = new Map();

  static {
    this.providers.set('openai', (config) => new OpenAIEmbeddingProvider(config));
    // Future: Gemini, Cohere, local embeddings will be registered here
  }

  static create(providerName: string, config: EmbeddingConfig): IEmbeddingProvider {
    const factory = this.providers.get(providerName.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown embedding provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return factory(config);
  }

  static registerProvider(name: string, factory: (config: EmbeddingConfig) => IEmbeddingProvider): void {
    this.providers.set(name.toLowerCase(), factory);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
