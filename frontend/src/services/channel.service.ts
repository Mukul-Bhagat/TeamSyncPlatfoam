import { supabase } from '@/lib/supabase';
import type {
  Channel,
  ChannelMember,
  ChannelMemberWithProfile,
  CreateChannelInput,
  UpdateChannelInput,
  AddChannelMemberInput,
  UpdateChannelMemberRoleInput,
} from '@/features/channels/types/channel.types';

export const channelService = {
  async createChannel(input: CreateChannelInput) {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        workspace_id: input.workspace_id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        type: input.type,
        visibility: input.visibility,
        icon: input.icon,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // If private channel, add creator as admin member
    if (input.visibility === 'private') {
      await this.addChannelMember({
        channel_id: data.id,
        user_id: data.created_by,
        role: 'admin',
      });
    }

    return data as Channel;
  },

  async getChannel(id: string) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Channel;
  },

  async getChannelBySlug(workspaceId: string, slug: string) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Channel;
  },

  async listWorkspaceChannels(workspaceId: string) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Channel[];
  },

  async updateChannel(id: string, input: UpdateChannelInput) {
    const { data, error } = await supabase
      .from('channels')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Channel;
  },

  async deleteChannel(id: string) {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async joinChannel(channelId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('channel_members')
      .insert({
        channel_id: channelId,
        user_id: user.id,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChannelMember;
  },

  async leaveChannel(channelId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async addChannelMember(input: AddChannelMemberInput) {
    const { data, error } = await supabase
      .from('channel_members')
      .insert({
        channel_id: input.channel_id,
        user_id: input.user_id,
        role: input.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChannelMember;
  },

  async removeChannelMember(channelId: string, userId: string) {
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateChannelMemberRole(channelId: string, userId: string, input: UpdateChannelMemberRoleInput) {
    const { data, error } = await supabase
      .from('channel_members')
      .update({ role: input.role })
      .eq('channel_id', channelId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as ChannelMember;
  },

  async listChannelMembers(channelId: string) {
    const { data, error } = await supabase
      .from('channel_members')
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('channel_id', channelId);

    if (error) throw error;
    return data as ChannelMemberWithProfile[];
  },
};
