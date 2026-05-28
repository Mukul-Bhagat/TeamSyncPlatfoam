"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingProviderFactory = void 0;
const OpenAIEmbeddingProvider_1 = require("./OpenAIEmbeddingProvider");
class EmbeddingProviderFactory {
    static providers = new Map();
    static {
        this.providers.set('openai', (config) => new OpenAIEmbeddingProvider_1.OpenAIEmbeddingProvider(config));
        // Future: Gemini, Cohere, local embeddings will be registered here
    }
    static create(providerName, config) {
        const factory = this.providers.get(providerName.toLowerCase());
        if (!factory) {
            throw new Error(`Unknown embedding provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
        }
        return factory(config);
    }
    static registerProvider(name, factory) {
        this.providers.set(name.toLowerCase(), factory);
    }
    static getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
}
exports.EmbeddingProviderFactory = EmbeddingProviderFactory;
//# sourceMappingURL=EmbeddingProviderFactory.js.map