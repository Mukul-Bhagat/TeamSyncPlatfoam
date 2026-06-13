"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelService = void 0;
// Channel Service
const supabase_js_1 = require("@supabase/supabase-js");
const permissions_1 = require("../permissions");
class ChannelService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getProjectChannels(projectId, _userId, params) {
        const { page = 1, limit = 50, type, visibility } = params || {};
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('project_channels')
            .select('*', { count: 'exact' })
            .eq('project_id', projectId);
        if (type) {
            query = query.eq('type', type);
        }
        if (visibility) {
            query = query.eq('visibility', visibility);
        }
        const { data, error, count } = await query
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch channels: ${error.message}`);
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
    async getChannelById(channelId, _userId) {
        const { data, error } = await this.supabase
            .from('project_channels')
            .select('*')
            .eq('id', channelId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch channel: ${error.message}`);
        }
        // Check access
        const member = await this.getProjectMember(_userId, channelId);
        if (!member && data.visibility === 'private') {
            throw new Error('Access denied');
        }
        return data;
    }
    async createChannel(projectId, userId, dto) {
        // Check permissions
        const projectMember = await this.getProjectMemberByProject(userId, projectId);
        if (!projectMember) {
            throw new Error('Access denied');
        }
        requirePermission(projectMember.role, permissions_1.ProjectAction.CREATE_CHANNELS);
        const { data, error } = await this.supabase
            .from('project_channels')
            .insert({
            project_id: projectId,
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            type: dto.type || 'custom',
            visibility: dto.visibility || 'public',
            icon: dto.icon,
            color: dto.color,
            created_by: userId
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create channel: ${error.message}`);
        }
        // Add creator as channel admin
        await this.supabase.from('project_channel_members').insert({
            channel_id: data.id,
            user_id: userId,
            role: 'admin'
        });
        return data;
    }
    async updateChannel(channelId, userId, dto) {
        const member = await this.getProjectMember(userId, channelId);
        if (!member) {
            throw new Error('Access denied');
        }
        requirePermission(member.role, permissions_1.ProjectAction.EDIT_CHANNELS);
        const { data, error } = await this.supabase
            .from('project_channels')
            .update(dto)
            .eq('id', channelId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update channel: ${error.message}`);
        }
        return data;
    }
    async deleteChannel(channelId, userId) {
        const member = await this.getProjectMember(userId, channelId);
        if (!member) {
            throw new Error('Access denied');
        }
        // Permission check would go here
        const { error } = await this.supabase
            .from('project_channels')
            .delete()
            .eq('id', channelId);
        if (error) {
            throw new Error(`Failed to delete channel: ${error.message}`);
        }
    }
    async getChannelMembers(channelId, userId, params) {
        const member = await this.getProjectMember(userId, channelId);
        if (!member) {
            throw new Error('Access denied');
        }
        const { page = 1, limit = 50 } = params || {};
        const offset = (page - 1) * limit;
        const { data, error, count } = await this.supabase
            .from('project_channel_members')
            .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
            .eq('channel_id', channelId)
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch channel members: ${error.message}`);
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
    async addChannelMember(channelId, userId, targetUserId, role = 'member') {
        const member = await this.getProjectMember(userId, channelId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('project_channel_members')
            .insert({
            channel_id: channelId,
            user_id: targetUserId,
            role
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to add channel member: ${error.message}`);
        }
        return data;
    }
    async removeChannelMember(channelId, memberId, userId) {
        const member = await this.getProjectMember(userId, channelId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied');
        }
        const { error } = await this.supabase
            .from('project_channel_members')
            .delete()
            .eq('id', memberId);
        if (error) {
            throw new Error(`Failed to remove channel member: ${error.message}`);
        }
    }
    async updateChannelMemberRole(channelId, memberId, userId, role) {
        const member = await this.getProjectMember(userId, channelId);
        if (!member || member.role !== 'admin') {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('project_channel_members')
            .update({ role })
            .eq('id', memberId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update channel member role: ${error.message}`);
        }
        return data;
    }
    async markChannelAsRead(channelId, userId) {
        const { error } = await this.supabase
            .from('project_channel_members')
            .update({
            last_read_at: new Date().toISOString()
        })
            .eq('channel_id', channelId)
            .eq('user_id', userId);
        if (error) {
            throw new Error(`Failed to mark channel as read: ${error.message}`);
        }
    }
    async getProjectMember(userId, channelId) {
        const { data, error } = await this.supabase
            .from('project_channel_members')
            .select('*')
            .eq('channel_id', channelId)
            .eq('user_id', userId)
            .single();
        if (error || !data) {
            return null;
        }
        return data;
    }
    async getProjectMemberByProject(userId, projectId) {
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
}
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map