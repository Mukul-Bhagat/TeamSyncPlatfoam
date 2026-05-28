"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const OpenAIProvider_1 = require("./OpenAIProvider");
class ProviderFactory {
    static providers = new Map();
    static {
        this.providers.set('openai', (config) => new OpenAIProvider_1.OpenAIProvider(config));
        // Future: Gemini, Claude, Local providers will be registered here
    }
    static create(providerName, config) {
        const factory = this.providers.get(providerName.toLowerCase());
        if (!factory) {
            throw new Error(`Unknown AI provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
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
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=ProviderFactory.js.map