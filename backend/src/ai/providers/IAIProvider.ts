export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProvider {
  /**
   * Generate a completion from the AI provider
   */
  generate(request: AIRequest): Promise<AIResponse>;

  /**
   * Stream a completion from the AI provider
   */
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>;

  /**
   * Get the context window size for the current model
   */
  getContextWindow(): number;

  /**
   * Estimate token count for a string (approximate)
   */
  estimateTokens(text: string): number;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Check if the provider is healthy/available
   */
  healthCheck(): Promise<boolean>;
}
