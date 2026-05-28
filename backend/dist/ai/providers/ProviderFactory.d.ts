import type { AIProvider, AIProviderConfig } from './IAIProvider';
export declare class ProviderFactory {
    private static providers;
    static create(providerName: string, config: AIProviderConfig): AIProvider;
    static registerProvider(name: string, factory: (config: AIProviderConfig) => AIProvider): void;
    static getAvailableProviders(): string[];
}
//# sourceMappingURL=ProviderFactory.d.ts.map