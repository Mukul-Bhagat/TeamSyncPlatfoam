export declare class CapabilityChecker {
    private static instance;
    private supabase;
    private capabilityRegistry;
    private constructor();
    static getInstance(): CapabilityChecker;
    /**
     * Check if a user has a specific capability
     */
    checkCapability(userId: string, capabilityName: string): Promise<boolean>;
    /**
     * Check if a user has multiple capabilities (all must be true)
     */
    checkCapabilities(userId: string, capabilityNames: string[]): Promise<boolean>;
    /**
     * Check if a user has any of the given capabilities (at least one must be true)
     */
    checkAnyCapability(userId: string, capabilityNames: string[]): Promise<boolean>;
    /**
     * Get all capabilities for a user
     */
    getUserCapabilities(userId: string): Promise<string[]>;
    /**
     * Get capabilities for a user in a specific category
     */
    getUserCapabilitiesByCategory(userId: string, category: string): Promise<string[]>;
}
//# sourceMappingURL=CapabilityChecker.d.ts.map