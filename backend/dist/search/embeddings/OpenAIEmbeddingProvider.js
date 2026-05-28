"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIEmbeddingProvider = void 0;
class OpenAIEmbeddingProvider {
    config;
    baseUrl;
    constructor(config) {
        this.config = {
            model: 'text-embedding-3-small',
            dimension: 1536,
            batchSize: 100,
            timeoutMs: 30000,
            ...config,
        };
        this.baseUrl = 'https://api.openai.com/v1';
    }
    async generate(request) {
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
        }
        catch (error) {
            clearTimeout(timeout);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('OpenAI Embeddings API request timed out');
            }
            throw error;
        }
    }
    async generateBatch(request) {
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
                embeddings: data.data.map((item) => item.embedding),
                model: data.model,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    totalTokens: data.usage.total_tokens,
                },
            };
        }
        catch (error) {
            clearTimeout(timeout);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('OpenAI Embeddings API request timed out');
            }
            throw error;
        }
    }
    getDimension() {
        const modelDimensions = {
            'text-embedding-3-small': 1536,
            'text-embedding-3-large': 3072,
            'text-embedding-ada-002': 1536,
        };
        return modelDimensions[this.config.model || 'text-embedding-3-small'] || 1536;
    }
    estimateTokens(text) {
        // Rough approximation: ~4 characters per token for English
        return Math.ceil(text.length / 4);
    }
    getProviderName() {
        return 'openai';
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.OpenAIEmbeddingProvider = OpenAIEmbeddingProvider;
//# sourceMappingURL=OpenAIEmbeddingProvider.js.map