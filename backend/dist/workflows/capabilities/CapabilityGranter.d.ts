export declare class CapabilityGranter {
    private static instance;
    private supabase;
    private capabilityRegistry;
    private constructor();
    static getInstance(): CapabilityGranter;
    /**
     * Grant a capability to a user
     */
    grantCapability(userId: string, capabilityName: string, grantedBy: string, expiresAt?: Date): Promise<boolean>;
    /**
     * Revoke a capability from a user
     */
    revokeCapability(userId: string, capabilityName: string): Promise<boolean>;
    /**
     * Grant multiple capabilities to a user
     */
    grantCapabilities(userId: string, capabilityNames: string[], grantedBy: string, expiresAt?: Date): Promise<boolean>;
    /**
     * Revoke all capabilities from a user
     */
    revokeAllCapabilities(userId: string): Promise<boolean>;
    /**
     * Grant capabilities based on role
     */
    grantRoleCapabilities(userId: string, role: string, grantedBy: string): Promise<boolean>;
    /**
     * Get capabilities for a role
     */
    private getCapabilitiesForRole;
    /**
     * Clean up expired capabilities
     */
    cleanupExpiredCapabilities(): Promise<number>;
}
//# sourceMappingURL=CapabilityGranter.d.ts.map