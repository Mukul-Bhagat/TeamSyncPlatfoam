"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorProviderFactory = void 0;
const PgVectorProvider_1 = require("./PgVectorProvider");
class VectorProviderFactory {
    static providers = new Map();
    static {
        this.providers.set('pgvector', (dimension) => new PgVectorProvider_1.PgVectorProvider(dimension));
        // Future: Pinecone, Qdrant, Weaviate providers will be registered here
    }
    static create(providerName, dimension) {
        const factory = this.providers.get(providerName.toLowerCase());
        if (!factory) {
            throw new Error(`Unknown vector provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
        }
        return factory(dimension);
    }
    static registerProvider(name, factory) {
        this.providers.set(name.toLowerCase(), factory);
    }
    static getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
}
exports.VectorProviderFactory = VectorProviderFactory;
//# sourceMappingURL=VectorProviderFactory.js.map