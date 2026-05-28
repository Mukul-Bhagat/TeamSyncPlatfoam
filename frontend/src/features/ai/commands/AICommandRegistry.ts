export interface AICommand {
  id: string;
  name: string;
  description: string;
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

export class AICommandRegistry {
  private static commands: Map<string, AICommand> = new Map();

  static register(command: AICommand): void {
    this.commands.set(command.id, command);
  }

  static get(id: string): AICommand | undefined {
    return this.commands.get(id);
  }

  static getAll(): AICommand[] {
    return Array.from(this.commands.values());
  }

  static async execute(id: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const command = this.get(id);
    if (!command) {
      throw new Error(`Unknown AI command: ${id}`);
    }
    return command.handler(params);
  }
}

// Register built-in commands
AICommandRegistry.register({
  id: 'summarize',
  name: 'Summarize',
  description: 'Generate an AI summary of the current context',
  handler: async (params) => {
    // Placeholder for future implementation
    console.log('[AICommand] Summarize command called with params:', params);
    return { message: 'Summarize command execution deferred to future phase' };
  },
});

AICommandRegistry.register({
  id: 'explain',
  name: 'Explain',
  description: 'Explain the current context or entity',
  handler: async (params) => {
    // Placeholder for future implementation
    console.log('[AICommand] Explain command called with params:', params);
    return { message: 'Explain command execution deferred to future phase' };
  },
});

AICommandRegistry.register({
  id: 'analyze',
  name: 'Analyze',
  description: 'Perform deep analysis of deployment or incident',
  handler: async (params) => {
    // Placeholder for future implementation
    console.log('[AICommand] Analyze command called with params:', params);
    return { message: 'Analyze command execution deferred to future phase' };
  },
});

AICommandRegistry.register({
  id: 'deployment-summary',
  name: 'Deployment Summary',
  description: 'Generate a deployment summary',
  handler: async (params) => {
    // Placeholder for future implementation
    console.log('[AICommand] Deployment Summary command called with params:', params);
    return { message: 'Deployment Summary command execution deferred to future phase' };
  },
});
