import type { IVectorProvider } from './IVectorProvider';
import { PgVectorProvider } from './PgVectorProvider';

export class VectorProviderFactory {
  private static providers: Map<string, (dimension?: number) => IVectorProvider> = new Map();

  static {
    this.providers.set('pgvector', (dimension) => new PgVectorProvider(dimension));
    // Future: Pinecone, Qdrant, Weaviate providers will be registered here
  }

  static create(providerName: string, dimension?: number): IVectorProvider {
    const factory = this.providers.get(providerName.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown vector provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return factory(dimension);
  }

  static registerProvider(name: string, factory: (dimension?: number) => IVectorProvider): void {
    this.providers.set(name.toLowerCase(), factory);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
