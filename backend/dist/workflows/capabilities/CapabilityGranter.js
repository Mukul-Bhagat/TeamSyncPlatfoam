"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityGranter = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const CapabilityRegistry_1 = require("./CapabilityRegistry");
class CapabilityGranter {
    static instance;
    supabase;
    capabilityRegistry;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.capabilityRegistry = CapabilityRegistry_1.CapabilityRegistry.getInstance();
    }
    static getInstance() {
        if (!CapabilityGranter.instance) {
            CapabilityGranter.instance = new CapabilityGranter();
        }
        return CapabilityGranter.instance;
    }
    /**
     * Grant a capability to a user
     */
    async grantCapability(userId, capabilityName, grantedBy, expiresAt) {
        // Check if capability exists
        if (!this.capabilityRegistry.hasCapability(capabilityName)) {
            throw new Error(`Capability not found: ${capabilityName}`);
        }
        const { error } = await this.supabase
            .from('user_capabilities')
            .upsert({
            user_id: userId,
            capability_name: capabilityName,
            granted_by: grantedBy,
            granted_at: new Date().toISOString(),
            expires_at: expiresAt ? expiresAt.toISOString() : null,
        });
        if (error) {
            console.error(`Error granting capability: ${error.message}`);
            return false;
        }
        return true;
    }
    /**
     * Revoke a capability from a user
     */
    async revokeCapability(userId, capabilityName) {
        const { error } = await this.supabase
            .from('user_capabilities')
            .delete()
            .eq('user_id', userId)
            .eq('capability_name', capabilityName);
        if (error) {
            console.error(`Error revoking capability: ${error.message}`);
            return false;
        }
        return true;
    }
    /**
     * Grant multiple capabilities to a user
     */
    async grantCapabilities(userId, capabilityNames, grantedBy, expiresAt) {
        const results = await Promise.all(capabilityNames.map((cap) => this.grantCapability(userId, cap, grantedBy, expiresAt)));
        return results.every((result) => result === true);
    }
    /**
     * Revoke all capabilities from a user
     */
    async revokeAllCapabilities(userId) {
        const { error } = await this.supabase
            .from('user_capabilities')
            .delete()
            .eq('user_id', userId);
        if (error) {
            console.error(`Error revoking all capabilities: ${error.message}`);
            return false;
        }
        return true;
    }
    /**
     * Grant capabilities based on role
     */
    async grantRoleCapabilities(userId, role, grantedBy) {
        const roleCapabilities = this.getCapabilitiesForRole(role);
        return this.grantCapabilities(userId, roleCapabilities, grantedBy);
    }
    /**
     * Get capabilities for a role
     */
    getCapabilitiesForRole(role) {
        switch (role) {
            case 'owner':
                return [
                    'workflow.execute',
                    'workflow.manage',
                    'workflow.approve',
                    'deploy.execute',
                    'rollback.execute',
                    'incident.create',
                    'incident.manage',
                    'summary.generate',
                    'user.assign',
                    'system.admin',
                    'organization.manage',
                    'workspace.manage',
                ];
            case 'admin':
                return [
                    'workflow.execute',
                    'workflow.manage',
                    'workflow.approve',
                    'deploy.execute',
                    'rollback.execute',
                    'incident.create',
                    'incident.manage',
                    'summary.generate',
                    'user.assign',
                    'organization.manage',
                    'workspace.manage',
                ];
            case 'member':
                return [
                    'workflow.execute',
                    'incident.create',
                    'summary.generate',
                ];
            default:
                return [];
        }
    }
    /**
     * Clean up expired capabilities
     */
    async cleanupExpiredCapabilities() {
        const { error } = await this.supabase.rpc('cleanup_expired_capabilities');
        if (error) {
            console.error(`Error cleaning up expired capabilities: ${error.message}`);
            return 0;
        }
        return 1;
    }
}
exports.CapabilityGranter = CapabilityGranter;
//# sourceMappingURL=CapabilityGranter.js.map