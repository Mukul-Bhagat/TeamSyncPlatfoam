import type { IEmbeddingProvider, EmbeddingConfig } from './IEmbeddingProvider';
export declare class EmbeddingProviderFactory {
    private static providers;
    static create(providerName: string, config: EmbeddingConfig): IEmbeddingProvider;
    static registerProvider(name: string, factory: (config: EmbeddingConfig) => IEmbeddingProvider): void;
    static getAvailableProviders(): string[];
}
//# sourceMappingURL=EmbeddingProviderFactory.d.ts.map