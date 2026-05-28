import { CapabilityRegistry } from './CapabilityRegistry';
import { CapabilityChecker } from './CapabilityChecker';
import { CapabilityGranter } from './CapabilityGranter';

export class CapabilityManager {
  private static instance: CapabilityManager;
  private registry: CapabilityRegistry;
  private checker: CapabilityChecker;
  private granter: CapabilityGranter;

  private constructor() {
    this.registry = CapabilityRegistry.getInstance();
    this.checker = CapabilityChecker.getInstance();
    this.granter = CapabilityGranter.getInstance();
  }

  static getInstance(): CapabilityManager {
    if (!CapabilityManager.instance) {
      CapabilityManager.instance = new CapabilityManager();
    }
    return CapabilityManager.instance;
  }

  /**
   * Get the capability registry
   */
  getRegistry(): CapabilityRegistry {
    return this.registry;
  }

  /**
   * Get the capability checker
   */
  getChecker(): CapabilityChecker {
    return this.checker;
  }

  /**
   * Get the capability granter
   */
  getGranter(): CapabilityGranter {
    return this.granter;
  }

  /**
   * Initialize the capability system
   */
  async initialize(): Promise<void> {
    // Core capabilities are already registered in CapabilityRegistry constructor
    console.log('[CapabilityManager] Capability system initialized');
  }

  /**
   * Get all available capabilities
   */
  getAvailableCapabilities(): Map<string, { name: string; description: string; category: string }> {
    return this.registry.getAllCapabilities();
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(category: string): Array<{ name: string; description: string; category: string }> {
    return this.registry.getCapabilitiesByCategory(category);
  }
}
