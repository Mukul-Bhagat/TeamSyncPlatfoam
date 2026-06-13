"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
// Message Service
const supabase_js_1 = require("@supabase/supabase-js");
class MessageService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getChannelMessages(channelId, userId, params) {
        const { page = 1, limit = 50, before, after, thread_id, is_pinned, is_starred } = params || {};
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('project_messages')
            .select('*, sender:profiles(full_name, avatar_url)', { count: 'exact' })
            .eq('channel_id', channelId)
            .is('deleted_at', null);
        if (before) {
            query = query.lt('created_at', before);
        }
        if (after) {
            query = query.gt('created_at', after);
        }
        if (thread_id) {
            query = query.eq('thread_id', thread_id);
        }
        if (is_pinned !== undefined) {
            query = query.eq('is_pinned', is_pinned);
        }
        if (is_starred !== undefined) {
            query = query.eq('is_starred', is_starred);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch messages: ${error.message}`);
        }
        // Fetch reactions and attachments for each message
        const messagesWithDetails = await Promise.all((data || []).map(async (message) => {
            const [reactions, attachments] = await Promise.all([
                this.getMessageReactions(message.id),
                this.getMessageAttachments(message.id)
            ]);
            return {
                ...message,
                reactions,
                attachments
            };
        }));
        return {
            data: messagesWithDetails,
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }
    async getMessageById(messageId, userId) {
        const { data, error } = await this.supabase
            .from('project_messages')
            .select('*, sender:profiles(full_name, avatar_url)')
            .eq('id', messageId)
            .is('deleted_at', null)
            .single();
        if (error) {
            throw new Error(`Failed to fetch message: ${error.message}`);
        }
        const [reactions, attachments] = await Promise.all([
            this.getMessageReactions(messageId),
            this.getMessageAttachments(messageId)
        ]);
        return {
            ...data,
            reactions,
            attachments
        };
    }
    async createMessage(channelId, userId, dto) {
        // Get project_id from channel
        const { data: channel } = await this.supabase
            .from('project_channels')
            .select('project_id')
            .eq('id', channelId)
            .single();
        if (!channel) {
            throw new Error('Channel not found');
        }
        const { data, error } = await this.supabase
            .from('project_messages')
            .insert({
            channel_id: channelId,
            project_id: channel.project_id,
            sender_id: userId,
            type: dto.type,
            content: dto.content,
            parent_message_id: dto.parent_message_id,
            thread_id: dto.thread_id || dto.parent_message_id,
            mentioned_users: dto.mentioned_users || [],
            mentioned_all: dto.mentioned_all || false,
            metadata: {}
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create message: ${error.message}`);
        }
        // Create attachments if provided
        if (dto.attachments && dto.attachments.length > 0) {
            for (const attachment of dto.attachments) {
                await this.supabase.from('project_message_attachments').insert({
                    message_id: data.id,
                    uploaded_by: userId,
                    ...attachment
                });
            }
        }
        // Update reply count if it's a reply
        if (dto.parent_message_id) {
            await this.supabase.rpc('increment_reply_count', {
                p_message_id: dto.parent_message_id
            });
        }
        return data;
    }
    async updateMessage(messageId, userId, dto) {
        const message = await this.getMessageById(messageId, userId);
        if (message.sender_id !== userId) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('project_messages')
            .update({
            ...dto,
            edited_at: new Date().toISOString()
        })
            .eq('id', messageId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update message: ${error.message}`);
        }
        return data;
    }
    async deleteMessage(messageId, userId) {
        const message = await this.getMessageById(messageId, userId);
        if (message.sender_id !== userId) {
            throw new Error('Access denied');
        }
        const { error } = await this.supabase
            .from('project_messages')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', messageId);
        if (error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        }
    }
    async pinMessage(messageId, userId) {
        const message = await this.getMessageById(messageId, userId);
        const { data, error } = await this.supabase
            .from('project_messages')
            .update({ is_pinned: !message.is_pinned })
            .eq('id', messageId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to pin message: ${error.message}`);
        }
        return data;
    }
    async starMessage(messageId, userId) {
        const message = await this.getMessageById(messageId, userId);
        const { data, error } = await this.supabase
            .from('project_messages')
            .update({ is_starred: !message.is_starred })
            .eq('id', messageId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to star message: ${error.message}`);
        }
        return data;
    }
    async getMessageReactions(messageId) {
        const { data, error } = await this.supabase
            .from('project_message_reactions')
            .select('*, user:profiles(full_name, avatar_url)')
            .eq('message_id', messageId);
        if (error) {
            throw new Error(`Failed to fetch reactions: ${error.message}`);
        }
        return data || [];
    }
    async addReaction(messageId, userId, emoji) {
        const { data, error } = await this.supabase
            .from('project_message_reactions')
            .insert({
            message_id: messageId,
            user_id: userId,
            emoji
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to add reaction: ${error.message}`);
        }
        return data;
    }
    async removeReaction(messageId, userId, emoji) {
        const { error } = await this.supabase
            .from('project_message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userId)
            .eq('emoji', emoji);
        if (error) {
            throw new Error(`Failed to remove reaction: ${error.message}`);
        }
    }
    async getMessageAttachments(messageId) {
        const { data, error } = await this.supabase
            .from('project_message_attachments')
            .select('*')
            .eq('message_id', messageId);
        if (error) {
            throw new Error(`Failed to fetch attachments: ${error.message}`);
        }
        return data || [];
    }
    async getMessageThread(messageId, userId) {
        const message = await this.getMessageById(messageId, userId);
        const { data, error } = await this.supabase
            .from('project_messages')
            .select('*, sender:profiles(full_name, avatar_url)')
            .eq('thread_id', message.thread_id || messageId)
            .is('deleted_at', null)
            .order('created_at', { ascending: true });
        if (error) {
            throw new Error(`Failed to fetch thread: ${error.message}`);
        }
        return data || [];
    }
    async searchMessages(projectId, userId, query, params) {
        const { page = 1, limit = 50, channel_id, sender_id, type } = params || {};
        const offset = (page - 1) * limit;
        let searchQuery = this.supabase
            .from('project_messages')
            .select('*, sender:profiles(full_name, avatar_url)', { count: 'exact' })
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .textSearch('content', query);
        if (channel_id) {
            searchQuery = searchQuery.eq('channel_id', channel_id);
        }
        if (sender_id) {
            searchQuery = searchQuery.eq('sender_id', sender_id);
        }
        if (type) {
            searchQuery = searchQuery.eq('type', type);
        }
        const { data, error, count } = await searchQuery
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to search messages: ${error.message}`);
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
    async setTypingIndicator(channelId, userId, isTyping) {
        if (isTyping) {
            await this.supabase
                .from('project_typing_indicators')
                .upsert({
                channel_id: channelId,
                user_id: userId,
                last_typed_at: new Date().toISOString()
            }, {
                onConflict: 'channel_id,user_id'
            });
        }
        else {
            await this.supabase
                .from('project_typing_indicators')
                .delete()
                .eq('channel_id', channelId)
                .eq('user_id', userId);
        }
    }
    async getTypingUsers(channelId) {
        const { data, error } = await this.supabase
            .from('project_typing_indicators')
            .select('*, user:profiles(full_name, avatar_url)')
            .eq('channel_id', channelId)
            .gt('last_typed_at', new Date(Date.now() - 5000).toISOString()); // Last 5 seconds
        if (error) {
            throw new Error(`Failed to fetch typing users: ${error.message}`);
        }
        return data || [];
    }
    async markMessageAsRead(messageId, userId) {
        await this.supabase
            .from('project_read_receipts')
            .upsert({
            message_id: messageId,
            user_id: userId,
            read_at: new Date().toISOString()
        }, {
            onConflict: 'message_id,user_id'
        });
    }
    async getMessageReadStatus(messageId) {
        const { data, error } = await this.supabase
            .from('project_read_receipts')
            .select('*, user:profiles(full_name, avatar_url)')
            .eq('message_id', messageId);
        if (error) {
            throw new Error(`Failed to fetch read status: ${error.message}`);
        }
        return {
            message_id: messageId,
            read_by: data || [],
            unread_count: 0 // Calculate based on channel members
        };
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map