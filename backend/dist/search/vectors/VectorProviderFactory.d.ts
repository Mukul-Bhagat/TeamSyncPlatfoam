import type { IVectorProvider } from './IVectorProvider';
export declare class VectorProviderFactory {
    private static providers;
    static create(providerName: string, dimension?: number): IVectorProvider;
    static registerProvider(name: string, factory: (dimension?: number) => IVectorProvider): void;
    static getAvailableProviders(): string[];
}
//# sourceMappingURL=VectorProviderFactory.d.ts.map