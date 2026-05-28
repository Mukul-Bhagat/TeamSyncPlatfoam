import type { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIStreamChunk } from './IAIProvider';

export class OpenAIProvider implements AIProvider {
  private config: AIProviderConfig;
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    this.config = {
      model: 'gpt-4o-mini',
      maxTokens: 4096,
      temperature: 0.7,
      timeoutMs: 30000,
      ...config,
    };
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          max_tokens: request.maxTokens ?? this.config.maxTokens,
          temperature: request.temperature ?? this.config.temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: data.model,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    }
  }

  async *stream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          max_tokens: request.maxTokens ?? this.config.maxTokens,
          temperature: request.temperature ?? this.config.temperature,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(error)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices[0]?.delta;
            if (delta?.content) {
              yield { content: delta.content, done: false };
            }
          } catch {
            // Skip malformed SSE data
          }
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    }
  }

  getContextWindow(): number {
    const modelContextWindows: Record<string, number> = {
      'gpt-4o': 128000,
      'gpt-4o-mini': 128000,
      'gpt-4-turbo': 128000,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 16385,
    };
    return modelContextWindows[this.config.model || 'gpt-4o-mini'] || 4096;
  }

  estimateTokens(text: string): number {
    // Rough approximation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  getProviderName(): string {
    return 'openai';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
