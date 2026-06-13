import { ProjectMessage, MessageReaction, MessageAttachment, CreateMessageDto, UpdateMessageDto, PaginationParams, PaginatedResponse } from '../types';
export declare class MessageService {
    private supabase;
    constructor();
    getChannelMessages(channelId: string, userId: string, params?: PaginationParams & {
        before?: string;
        after?: string;
        thread_id?: string;
        is_pinned?: boolean;
        is_starred?: boolean;
    }): Promise<PaginatedResponse<ProjectMessage>>;
    getMessageById(messageId: string, userId: string): Promise<ProjectMessage>;
    createMessage(channelId: string, userId: string, dto: CreateMessageDto): Promise<ProjectMessage>;
    updateMessage(messageId: string, userId: string, dto: UpdateMessageDto): Promise<ProjectMessage>;
    deleteMessage(messageId: string, userId: string): Promise<void>;
    pinMessage(messageId: string, userId: string): Promise<ProjectMessage>;
    starMessage(messageId: string, userId: string): Promise<ProjectMessage>;
    getMessageReactions(messageId: string): Promise<MessageReaction[]>;
    addReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction>;
    removeReaction(messageId: string, userId: string, emoji: string): Promise<void>;
    getMessageAttachments(messageId: string): Promise<MessageAttachment[]>;
    getMessageThread(messageId: string, userId: string): Promise<ProjectMessage[]>;
    searchMessages(projectId: string, userId: string, query: string, params?: PaginationParams & {
        channel_id?: string;
        sender_id?: string;
        type?: string;
    }): Promise<PaginatedResponse<ProjectMessage>>;
    setTypingIndicator(channelId: string, userId: string, isTyping: boolean): Promise<void>;
    getTypingUsers(channelId: string): Promise<any[]>;
    markMessageAsRead(messageId: string, userId: string): Promise<void>;
    getMessageReadStatus(messageId: string): Promise<any>;
}
//# sourceMappingURL=message.service.d.ts.map