// Channel Service
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  ProjectChannel,
  ProjectChannelMember,
  CreateChannelDto,
  UpdateChannelDto,
  PaginationParams,
  PaginatedResponse
} from '../types'
import { hasPermission, ProjectAction } from '../permissions'

export class ChannelService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async getProjectChannels(
    projectId: string,
    _userId: string,
    params?: PaginationParams & { type?: string; visibility?: string }
  ): Promise<PaginatedResponse<ProjectChannel>> {
    const { page = 1, limit = 50, type, visibility } = params || {}
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('project_channels')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)

    if (type) {
      query = query.eq('type', type)
    }

    if (visibility) {
      query = query.eq('visibility', visibility)
    }

    const { data, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch channels: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getChannelById(channelId: string, _userId: string): Promise<ProjectChannel> {
    const { data, error } = await this.supabase
      .from('project_channels')
      .select('*')
      .eq('id', channelId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch channel: ${error.message}`)
    }

    // Check access
    const member = await this.getProjectMember(_userId, channelId)
    if (!member && data.visibility === 'private') {
      throw new Error('Access denied')
    }

    return data
  }

  async createChannel(
    projectId: string,
    userId: string,
    dto: CreateChannelDto
  ): Promise<ProjectChannel> {
    // Check permissions
    const projectMember = await this.getProjectMemberByProject(userId, projectId)
    if (!projectMember) {
      throw new Error('Access denied')
    }

    requirePermission(projectMember.role, ProjectAction.CREATE_CHANNELS)

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
      .single()

    if (error) {
      throw new Error(`Failed to create channel: ${error.message}`)
    }

    // Add creator as channel admin
    await this.supabase.from('project_channel_members').insert({
      channel_id: data.id,
      user_id: userId,
      role: 'admin'
    })

    return data
  }

  async updateChannel(
    channelId: string,
    userId: string,
    dto: UpdateChannelDto
  ): Promise<ProjectChannel> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member) {
      throw new Error('Access denied')
    }

    requirePermission(member.role, ProjectAction.EDIT_CHANNELS)

    const { data, error } = await this.supabase
      .from('project_channels')
      .update(dto)
      .eq('id', channelId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update channel: ${error.message}`)
    }

    return data
  }

  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member) {
      throw new Error('Access denied')
    }

    // Permission check would go here

    const { error } = await this.supabase
      .from('project_channels')
      .delete()
      .eq('id', channelId)

    if (error) {
      throw new Error(`Failed to delete channel: ${error.message}`)
    }
  }

  async getChannelMembers(
    channelId: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProjectChannelMember>> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member) {
      throw new Error('Access denied')
    }

    const { page = 1, limit = 50 } = params || {}
    const offset = (page - 1) * limit

    const { data, error, count } = await this.supabase
      .from('project_channel_members')
      .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('channel_id', channelId)
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch channel members: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async addChannelMember(
    channelId: string,
    userId: string,
    targetUserId: string,
    role: 'admin' | 'moderator' | 'member' = 'member'
  ): Promise<ProjectChannelMember> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_channel_members')
      .insert({
        channel_id: channelId,
        user_id: targetUserId,
        role
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add channel member: ${error.message}`)
    }

    return data
  }

  async removeChannelMember(
    channelId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied')
    }

    const { error } = await this.supabase
      .from('project_channel_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      throw new Error(`Failed to remove channel member: ${error.message}`)
    }
  }

  async updateChannelMemberRole(
    channelId: string,
    memberId: string,
    userId: string,
    role: 'admin' | 'moderator' | 'member'
  ): Promise<ProjectChannelMember> {
    const member = await this.getProjectMember(userId, channelId)
    if (!member || member.role !== 'admin') {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_channel_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update channel member role: ${error.message}`)
    }

    return data
  }

  async markChannelAsRead(channelId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_channel_members')
      .update({
        last_read_at: new Date().toISOString()
      })
      .eq('channel_id', channelId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to mark channel as read: ${error.message}`)
    }
  }

  private async getProjectMember(
    userId: string,
    channelId: string
  ): Promise<ProjectChannelMember | null> {
    const { data, error } = await this.supabase
      .from('project_channel_members')
      .select('*')
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }

  private async getProjectMemberByProject(
    userId: string,
    projectId: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}
