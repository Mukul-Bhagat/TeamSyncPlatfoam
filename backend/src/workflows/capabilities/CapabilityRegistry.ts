export interface CapabilityDefinition {
  name: string;
  description: string;
  category: string;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, CapabilityDefinition> = new Map();

  private constructor() {
    this.registerCoreCapabilities();
  }

  static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  /**
   * Register core capabilities
   */
  private registerCoreCapabilities(): void {
    // Workflow capabilities
    this.registerCapability('workflow.execute', 'Execute workflows', 'workflow');
    this.registerCapability('workflow.manage', 'Manage workflows (create, update, delete)', 'workflow');
    this.registerCapability('workflow.approve', 'Approve workflow executions', 'workflow');

    // Command capabilities
    this.registerCapability('deploy.execute', 'Execute deployments', 'command');
    this.registerCapability('rollback.execute', 'Execute rollbacks', 'command');
    this.registerCapability('incident.create', 'Create incidents', 'command');
    this.registerCapability('incident.manage', 'Manage incidents', 'command');
    this.registerCapability('summary.generate', 'Generate summaries', 'command');
    this.registerCapability('user.assign', 'Assign users to entities', 'command');

    // System capabilities
    this.registerCapability('system.admin', 'Full system administration', 'system');
    this.registerCapability('organization.manage', 'Manage organization settings', 'organization');
    this.registerCapability('workspace.manage', 'Manage workspace settings', 'workspace');
  }

  /**
   * Register a capability
   */
  registerCapability(name: string, description: string, category: string): void {
    this.capabilities.set(name, { name, description, category });
  }

  /**
   * Unregister a capability
   */
  unregisterCapability(name: string): void {
    this.capabilities.delete(name);
  }

  /**
   * Get a capability
   */
  getCapability(name: string): CapabilityDefinition | undefined {
    return this.capabilities.get(name);
  }

  /**
   * Get all capabilities
   */
  getAllCapabilities(): Map<string, CapabilityDefinition> {
    return new Map(this.capabilities);
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(category: string): CapabilityDefinition[] {
    const capabilities: CapabilityDefinition[] = [];
    this.capabilities.forEach((cap) => {
      if (cap.category === category) {
        capabilities.push(cap);
      }
    });
    return capabilities;
  }

  /**
   * Check if capability exists
   */
  hasCapability(name: string): boolean {
    return this.capabilities.has(name);
  }

  /**
   * Clear all capabilities
   */
  clear(): void {
    this.capabilities.clear();
  }
}
