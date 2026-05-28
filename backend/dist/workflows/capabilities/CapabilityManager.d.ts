import { CapabilityRegistry } from './CapabilityRegistry';
import { CapabilityChecker } from './CapabilityChecker';
import { CapabilityGranter } from './CapabilityGranter';
export declare class CapabilityManager {
    private static instance;
    private registry;
    private checker;
    private granter;
    private constructor();
    static getInstance(): CapabilityManager;
    /**
     * Get the capability registry
     */
    getRegistry(): CapabilityRegistry;
    /**
     * Get the capability checker
     */
    getChecker(): CapabilityChecker;
    /**
     * Get the capability granter
     */
    getGranter(): CapabilityGranter;
    /**
     * Initialize the capability system
     */
    initialize(): Promise<void>;
    /**
     * Get all available capabilities
     */
    getAvailableCapabilities(): Map<string, {
        name: string;
        description: string;
        category: string;
    }>;
    /**
     * Get capabilities by category
     */
    getCapabilitiesByCategory(category: string): Array<{
        name: string;
        description: string;
        category: string;
    }>;
}
//# sourceMappingURL=CapabilityManager.d.ts.map