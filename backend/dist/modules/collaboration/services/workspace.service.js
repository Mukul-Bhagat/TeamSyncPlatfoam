"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class WorkspaceService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getWorkspaces(orgId, userId) {
        let query = this.supabase
            .from('workspace_members')
            .select('*, workspace:workspaces(*)')
            .eq('user_id', userId);
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch user workspaces: ${error.message}`);
        }
        const workspaces = (data || []).map((m) => ({
            workspace_id: m.workspace_id,
            role: m.role,
            joined_at: m.joined_at,
            workspace: m.workspace
        })).filter((w) => w.workspace !== null);
        // If orgId is provided, filter by it
        if (orgId) {
            return workspaces.filter((w) => w.workspace.organization_id === orgId);
        }
        else {
            // If orgId is null/empty, filter by personal workspaces (orgId = null)
            return workspaces.filter((w) => w.workspace.organization_id === null);
        }
    }
    async getWorkspaceById(workspaceId, userId) {
        const member = await this.getMember(userId, workspaceId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch workspace: ${error.message}`);
        }
        return data;
    }
    async createWorkspace(userId, orgId, name, slug, description, icon) {
        const { data, error } = await this.supabase.rpc('create_workspace_flow', {
            p_organization_id: orgId || null,
            p_name: name,
            p_slug: slug,
            p_description: description || null,
            p_icon: icon || null
        });
        if (error) {
            throw new Error(`Failed to create workspace: ${error.message}`);
        }
        const workspace = await this.getWorkspaceById(data.workspace_id, userId);
        return workspace;
    }
    async updateWorkspace(workspaceId, userId, updateData) {
        const member = await this.getMember(userId, workspaceId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied: Admin role required');
        }
        const { data, error } = await this.supabase
            .from('workspaces')
            .update(updateData)
            .eq('id', workspaceId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update workspace: ${error.message}`);
        }
        return data;
    }
    async deleteWorkspace(workspaceId, userId) {
        const member = await this.getMember(userId, workspaceId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied: Admin role required');
        }
        const { error } = await this.supabase
            .from('workspaces')
            .delete()
            .eq('id', workspaceId);
        if (error) {
            throw new Error(`Failed to delete workspace: ${error.message}`);
        }
    }
    async getWorkspaceMembers(workspaceId, userId) {
        const member = await this.getMember(userId, workspaceId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('workspace_members')
            .select('*, profile:profiles(full_name, email, avatar_url)')
            .eq('workspace_id', workspaceId);
        if (error) {
            throw new Error(`Failed to fetch workspace members: ${error.message}`);
        }
        return data || [];
    }
    async addWorkspaceMember(workspaceId, userId, targetEmail, role = 'member') {
        const member = await this.getMember(userId, workspaceId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied: Admin role required');
        }
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('email', targetEmail)
            .maybeSingle();
        if (profile) {
            const { data, error } = await this.supabase
                .from('workspace_members')
                .insert({
                workspace_id: workspaceId,
                user_id: profile.id,
                role,
                joined_at: new Date().toISOString()
            })
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to add workspace member: ${error.message}`);
            }
            return data;
        }
        else {
            throw new Error(`User with email ${targetEmail} does not exist in TeamSync. Please have them register first.`);
        }
    }
    async removeWorkspaceMember(workspaceId, userId, targetUserId) {
        const member = await this.getMember(userId, workspaceId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied: Admin role required');
        }
        const { error } = await this.supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('user_id', targetUserId);
        if (error) {
            throw new Error(`Failed to remove workspace member: ${error.message}`);
        }
    }
    async getMember(userId, workspaceId) {
        const { data } = await this.supabase
            .from('workspace_members')
            .select('*')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .maybeSingle();
        return data;
    }
}
exports.WorkspaceService = WorkspaceService;
//# sourceMappingURL=workspace.service.js.map