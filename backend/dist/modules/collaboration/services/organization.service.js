"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class OrganizationService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getOrganizations(userId) {
        const { data, error } = await this.supabase
            .from('organization_members')
            .select('*, organization:organizations(*)')
            .eq('user_id', userId);
        if (error) {
            throw new Error(`Failed to fetch user organizations: ${error.message}`);
        }
        return (data || []).map((m) => ({
            organization_id: m.organization_id,
            role: m.role,
            status: m.status,
            organizations: m.organization
        }));
    }
    async getOrganizationById(orgId, userId) {
        const member = await this.getMember(userId, orgId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch organization: ${error.message}`);
        }
        return data;
    }
    async createOrganization(userId, name, slug, logoUrl) {
        // We can use the create_organization_flow RPC for transactional creation
        const { data, error } = await this.supabase.rpc('create_organization_flow', {
            p_name: name,
            p_slug: slug,
            p_logo_url: logoUrl || null
        });
        if (error) {
            throw new Error(`Failed to create organization: ${error.message}`);
        }
        // Fetch and return the newly created organization
        const org = await this.getOrganizationById(data.organization_id, userId);
        return org;
    }
    async updateOrganization(orgId, userId, updateData) {
        const member = await this.getMember(userId, orgId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new Error('Access denied: Admin or Owner role required');
        }
        const { data, error } = await this.supabase
            .from('organizations')
            .update(updateData)
            .eq('id', orgId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update organization: ${error.message}`);
        }
        return data;
    }
    async deleteOrganization(orgId, userId) {
        const member = await this.getMember(userId, orgId);
        if (!member || member.role !== 'owner') {
            throw new Error('Access denied: Owner role required');
        }
        const { error } = await this.supabase
            .from('organizations')
            .delete()
            .eq('id', orgId);
        if (error) {
            throw new Error(`Failed to delete organization: ${error.message}`);
        }
    }
    async getOrganizationMembers(orgId, userId) {
        const member = await this.getMember(userId, orgId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('organization_members')
            .select('*, profile:profiles(full_name, email, avatar_url)')
            .eq('organization_id', orgId);
        if (error) {
            throw new Error(`Failed to fetch organization members: ${error.message}`);
        }
        return data || [];
    }
    async addOrganizationMember(orgId, userId, targetEmail, role = 'member') {
        const member = await this.getMember(userId, orgId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new Error('Access denied: Admin or Owner role required');
        }
        // Find if profile exists for email
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('email', targetEmail)
            .maybeSingle();
        if (profile) {
            // Direct add
            const { data, error } = await this.supabase
                .from('organization_members')
                .insert({
                organization_id: orgId,
                user_id: profile.id,
                role,
                status: 'active',
                joined_at: new Date().toISOString()
            })
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to add member: ${error.message}`);
            }
            return data;
        }
        else {
            // Pending invitation (create member record with null user_id, or support invitation system)
            // For organizations, if user doesn't exist, we can create a placeholder or invite record
            // In this database schema, let's create in organization_members with status = 'invited'
            // We need to fetch email. Let's see if organization_members has email.
            // Usually, invite flow is done in project_invitations, but organization can do it too.
            // If organization_members lacks email, we'll return a pending message.
            // Let's check organization_members columns or just insert with target user search.
            throw new Error(`User with email ${targetEmail} does not exist in TeamSync. Please have them register first.`);
        }
    }
    async removeOrganizationMember(orgId, userId, targetUserId) {
        const member = await this.getMember(userId, orgId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new Error('Access denied: Admin or Owner role required');
        }
        // Owner cannot be removed, check role of target
        const targetMember = await this.getMember(targetUserId, orgId);
        if (targetMember && targetMember.role === 'owner') {
            throw new Error('Cannot remove the organization owner');
        }
        const { error } = await this.supabase
            .from('organization_members')
            .delete()
            .eq('organization_id', orgId)
            .eq('user_id', targetUserId);
        if (error) {
            throw new Error(`Failed to remove organization member: ${error.message}`);
        }
    }
    async updateOrganizationMemberRole(orgId, userId, targetUserId, role) {
        const member = await this.getMember(userId, orgId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new Error('Access denied: Admin or Owner role required');
        }
        // Owner role changes are transfer-ownership, handled separately
        if (role === 'owner') {
            throw new Error('Use transfer ownership to promote a new owner');
        }
        const { data, error } = await this.supabase
            .from('organization_members')
            .update({ role })
            .eq('organization_id', orgId)
            .eq('user_id', targetUserId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update role: ${error.message}`);
        }
        return data;
    }
    async getMember(userId, orgId) {
        const { data } = await this.supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', orgId)
            .eq('user_id', userId)
            .maybeSingle();
        return data;
    }
}
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=organization.service.js.map