"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
// Project Service
const supabase_js_1 = require("@supabase/supabase-js");
const permissions_1 = require("../permissions");
class ProjectService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getProjects(userId, params) {
        const { page = 1, limit = 50, status, team_id, search } = params || {};
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('projects')
            .select('*', { count: 'exact' });
        // Filter by user's projects
        query = query.or(`owner_id.eq.${userId},project_members.user_id.eq.${userId}`);
        if (status) {
            query = query.eq('status', status);
        }
        if (team_id) {
            query = query.eq('team_id', team_id);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch projects: ${error.message}`);
        }
        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }
    async getProjectById(projectId, userId) {
        const { data, error } = await this.supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch project: ${error.message}`);
        }
        // Check if user has access
        const member = await this.getProjectMember(userId, projectId);
        if (!member && data.owner_id !== userId) {
            throw new Error('Access denied');
        }
        return data;
    }
    async createProject(userId, dto) {
        const { data: project, error: projectError } = await this.supabase
            .from('projects')
            .insert({
            name: dto.name,
            description: dto.description || null,
            owner_id: userId,
            workspace_id: dto.workspace_id || dto.team_id,
            color: dto.color || '#6366f1',
            icon: dto.icon || '🚀',
            visibility: dto.visibility || 'private',
            created_by: userId,
            status: 'active'
        })
            .select()
            .single();
        if (projectError) {
            throw new Error(`Failed to create project: ${projectError.message}`);
        }
        // Add owner as member
        await this.supabase.from('project_members').insert({
            project_id: project.id,
            user_id: userId,
            email: (await this.getUserEmail(userId)) || '',
            role: 'owner',
            status: 'active',
            invited_by: userId,
            joined_at: new Date().toISOString()
        });
        // Create project channels
        const channels = [
            { name: 'General Chat', slug: 'general', type: 'general' },
            { name: 'Announcements', slug: 'announcements', type: 'announcements' },
            { name: 'Activity Log', slug: 'activity', type: 'activity' }
        ];
        for (const chan of channels) {
            const { data: createdChan, error: chanError } = await this.supabase
                .from('project_channels')
                .insert({
                project_id: project.id,
                name: chan.name,
                slug: chan.slug,
                type: chan.type,
                visibility: 'private',
                created_by: userId
            })
                .select()
                .single();
            if (!chanError && createdChan) {
                await this.supabase.from('project_channel_members').insert({
                    channel_id: createdChan.id,
                    user_id: userId,
                    role: 'admin',
                    joined_at: new Date().toISOString()
                });
            }
        }
        return project;
    }
    async updateProject(projectId, userId, dto) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.EDIT_PROJECT);
        const { data, error } = await this.supabase
            .from('projects')
            .update(dto)
            .eq('id', projectId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
        return data;
    }
    async deleteProject(projectId, userId) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.DELETE_PROJECT);
        const { error } = await this.supabase
            .from('projects')
            .delete()
            .eq('id', projectId);
        if (error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }
    async archiveProject(projectId, userId) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.ARCHIVE_PROJECT);
        const { data, error } = await this.supabase
            .from('projects')
            .update({ status: 'archived', archived_at: new Date().toISOString() })
            .eq('id', projectId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to archive project: ${error.message}`);
        }
        return data;
    }
    async getProjectMembers(projectId, userId, params) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.VIEW_MEMBERS);
        const { page = 1, limit = 50, role, status } = params || {};
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('project_members')
            .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
            .eq('project_id', projectId);
        if (role) {
            query = query.eq('role', role);
        }
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch project members: ${error.message}`);
        }
        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }
    async addProjectMember(projectId, userId, email, role) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.INVITE_MEMBERS);
        const { data, error } = await this.supabase
            .from('project_members')
            .insert({
            project_id: projectId,
            email,
            role,
            status: 'invited',
            invited_by: userId
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to add project member: ${error.message}`);
        }
        return data;
    }
    async updateProjectMemberRole(projectId, memberId, userId, role) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.CHANGE_MEMBER_ROLES);
        const { data, error } = await this.supabase
            .from('project_members')
            .update({ role })
            .eq('id', memberId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update member role: ${error.message}`);
        }
        return data;
    }
    async removeProjectMember(projectId, memberId, userId) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        (0, permissions_1.requirePermission)(member.role, permissions_1.ProjectAction.REMOVE_MEMBERS);
        const { error } = await this.supabase
            .from('project_members')
            .delete()
            .eq('id', memberId);
        if (error) {
            throw new Error(`Failed to remove project member: ${error.message}`);
        }
    }
    async getProjectStatistics(projectId, userId) {
        const member = await this.getProjectMember(userId, projectId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase.rpc('get_project_statistics', {
            p_project_id: projectId
        });
        if (error) {
            throw new Error(`Failed to fetch project statistics: ${error.message}`);
        }
        return data;
    }
    async getProjectMember(userId, projectId) {
        const { data, error } = await this.supabase
            .from('project_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();
        if (error || !data) {
            return null;
        }
        return data;
    }
    async getUserEmail(userId) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();
        if (error || !data) {
            return null;
        }
        return data.email;
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map