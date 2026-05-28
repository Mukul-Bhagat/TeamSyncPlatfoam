import { readFileSync } from 'fs';
import { join } from 'path';

export interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
  version: string;
}

export class PromptManager {
  private static prompts: Map<string, PromptTemplate> = new Map();
  private static promptDir: string;

  static initialize(promptDir: string = join(__dirname, 'prompts')) {
    this.promptDir = promptDir;
  }

  static loadPrompt(promptName: string): PromptTemplate {
    if (this.prompts.has(promptName)) {
      return this.prompts.get(promptName)!;
    }

    const promptPath = join(this.promptDir, `${promptName}.prompt.ts`);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const promptModule = require(promptPath);
      const template: PromptTemplate = promptModule.default || promptModule;
      this.prompts.set(promptName, template);
      return template;
    } catch (error) {
      throw new Error(`Failed to load prompt: ${promptName}. Error: ${error}`);
    }
  }

  static composePrompt(promptName: string, variables: Record<string, string> = {}): { systemPrompt: string; userPrompt: string } {
    const template = this.loadPrompt(promptName);
    let userPrompt = template.userPromptTemplate;

    // Replace variables in the template
    for (const [key, value] of Object.entries(variables)) {
      userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return {
      systemPrompt: template.systemPrompt,
      userPrompt,
    };
  }

  static registerPrompt(name: string, template: PromptTemplate): void {
    this.prompts.set(name, template);
  }

  static getAvailablePrompts(): string[] {
    return Array.from(this.prompts.keys());
  }
}
