import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { CapabilityRegistry } from './CapabilityRegistry';

export class CapabilityGranter {
  private static instance: CapabilityGranter;
  private supabase;
  private capabilityRegistry: CapabilityRegistry;

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.capabilityRegistry = CapabilityRegistry.getInstance();
  }

  static getInstance(): CapabilityGranter {
    if (!CapabilityGranter.instance) {
      CapabilityGranter.instance = new CapabilityGranter();
    }
    return CapabilityGranter.instance;
  }

  /**
   * Grant a capability to a user
   */
  async grantCapability(
    userId: string,
    capabilityName: string,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<boolean> {
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
  async revokeCapability(userId: string, capabilityName: string): Promise<boolean> {
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
  async grantCapabilities(
    userId: string,
    capabilityNames: string[],
    grantedBy: string,
    expiresAt?: Date
  ): Promise<boolean> {
    const results = await Promise.all(
      capabilityNames.map((cap) => this.grantCapability(userId, cap, grantedBy, expiresAt))
    );
    return results.every((result) => result === true);
  }

  /**
   * Revoke all capabilities from a user
   */
  async revokeAllCapabilities(userId: string): Promise<boolean> {
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
  async grantRoleCapabilities(userId: string, role: string, grantedBy: string): Promise<boolean> {
    const roleCapabilities = this.getCapabilitiesForRole(role);
    return this.grantCapabilities(userId, roleCapabilities, grantedBy);
  }

  /**
   * Get capabilities for a role
   */
  private getCapabilitiesForRole(role: string): string[] {
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
  async cleanupExpiredCapabilities(): Promise<number> {
    const { error } = await this.supabase.rpc('cleanup_expired_capabilities');

    if (error) {
      console.error(`Error cleaning up expired capabilities: ${error.message}`);
      return 0;
    }

    return 1;
  }
}
