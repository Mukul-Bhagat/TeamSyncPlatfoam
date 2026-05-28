import type { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIStreamChunk } from './IAIProvider';
export declare class OpenAIProvider implements AIProvider {
    private config;
    private baseUrl;
    constructor(config: AIProviderConfig);
    generate(request: AIRequest): Promise<AIResponse>;
    stream(request: AIRequest): AsyncIterable<AIStreamChunk>;
    getContextWindow(): number;
    estimateTokens(text: string): number;
    getProviderName(): string;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=OpenAIProvider.d.ts.map