export interface CapabilityDefinition {
    name: string;
    description: string;
    category: string;
}
export declare class CapabilityRegistry {
    private static instance;
    private capabilities;
    private constructor();
    static getInstance(): CapabilityRegistry;
    /**
     * Register core capabilities
     */
    private registerCoreCapabilities;
    /**
     * Register a capability
     */
    registerCapability(name: string, description: string, category: string): void;
    /**
     * Unregister a capability
     */
    unregisterCapability(name: string): void;
    /**
     * Get a capability
     */
    getCapability(name: string): CapabilityDefinition | undefined;
    /**
     * Get all capabilities
     */
    getAllCapabilities(): Map<string, CapabilityDefinition>;
    /**
     * Get capabilities by category
     */
    getCapabilitiesByCategory(category: string): CapabilityDefinition[];
    /**
     * Check if capability exists
     */
    hasCapability(name: string): boolean;
    /**
     * Clear all capabilities
     */
    clear(): void;
}
//# sourceMappingURL=CapabilityRegistry.d.ts.map