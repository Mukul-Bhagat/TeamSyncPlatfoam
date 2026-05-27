import { supabase } from '@/lib/supabase';
import { storageService } from './storage.service';
import type {
  Message,
  MessageReaction,
  MessageAttachment,
  CreateMessageInput,
  UpdateMessageInput,
  AddReactionInput,
  UploadAttachmentInput,
} from '@/features/messages/types/message.types';

export const messageService = {
  async createMessage(input: CreateMessageInput) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: input.channel_id,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        type: input.type,
        content: input.content,
        metadata: input.metadata || {},
        parent_message_id: input.parent_message_id,
      })
      .select(`
        *,
        sender (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data as Message;
  },

  async getMessage(id: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Message;
  },

  async getChannelMessages(channelId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as Message[];
  },

  async updateMessage(id: string, input: UpdateMessageInput) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        ...input,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        sender (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data as Message;
  },

  async deleteMessage(id: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addReaction(input: AddReactionInput) {
    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: input.message_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        emoji: input.emoji,
      })
      .select(`
        *,
        user (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data as MessageReaction;
  },

  async removeReaction(messageId: string, emoji: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) throw error;
  },

  async getMessageReactions(messageId: string) {
    const { data, error } = await supabase
      .from('message_reactions')
      .select(`
        *,
        user (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('message_id', messageId);

    if (error) throw error;
    return data as MessageReaction[];
  },

  async uploadAttachment(input: UploadAttachmentInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Generate unique file path
    const filePath = storageService.generateFilePath('attachments', input.file.name);

    // Upload to storage
    const uploadResult = await storageService.uploadFile(
      'attachments',
      filePath,
      input.file
    );

    // Create attachment record
    const { data, error } = await supabase
      .from('message_attachments')
      .insert({
        message_id: input.message_id,
        uploaded_by: user.id,
        file_name: uploadResult.fileName,
        file_type: uploadResult.fileType,
        file_size: uploadResult.fileSize,
        file_url: uploadResult.url,
      })
      .select(`
        *,
        uploader (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data as MessageAttachment;
  },

  async deleteAttachment(attachmentId: string) {
    // Get attachment info first
    const { data: attachment, error: fetchError } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const path = attachment.file_url.split('/').pop();
    if (path) {
      await storageService.deleteFile('attachments', path);
    }

    // Delete from database
    const { error } = await supabase
      .from('message_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  },

  async getMessageAttachments(messageId: string) {
    const { data, error } = await supabase
      .from('message_attachments')
      .select(`
        *,
        uploader (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('message_id', messageId);

    if (error) throw error;
    return data as MessageAttachment[];
  },
};
