import type { AIProvider, AIProviderConfig } from './IAIProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class ProviderFactory {
  private static providers: Map<string, (config: AIProviderConfig) => AIProvider> = new Map();

  static {
    this.providers.set('openai', (config) => new OpenAIProvider(config));
    // Future: Gemini, Claude, Local providers will be registered here
  }

  static create(providerName: string, config: AIProviderConfig): AIProvider {
    const factory = this.providers.get(providerName.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown AI provider: ${providerName}. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return factory(config);
  }

  static registerProvider(name: string, factory: (config: AIProviderConfig) => AIProvider): void {
    this.providers.set(name.toLowerCase(), factory);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
