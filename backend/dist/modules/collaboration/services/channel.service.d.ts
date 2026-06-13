import { ProjectChannel, ProjectChannelMember, CreateChannelDto, UpdateChannelDto, PaginationParams, PaginatedResponse } from '../types';
export declare class ChannelService {
    private supabase;
    constructor();
    getProjectChannels(projectId: string, _userId: string, params?: PaginationParams & {
        type?: string;
        visibility?: string;
    }): Promise<PaginatedResponse<ProjectChannel>>;
    getChannelById(channelId: string, _userId: string): Promise<ProjectChannel>;
    createChannel(projectId: string, userId: string, dto: CreateChannelDto): Promise<ProjectChannel>;
    updateChannel(channelId: string, userId: string, dto: UpdateChannelDto): Promise<ProjectChannel>;
    deleteChannel(channelId: string, userId: string): Promise<void>;
    getChannelMembers(channelId: string, userId: string, params?: PaginationParams): Promise<PaginatedResponse<ProjectChannelMember>>;
    addChannelMember(channelId: string, userId: string, targetUserId: string, role?: 'admin' | 'moderator' | 'member'): Promise<ProjectChannelMember>;
    removeChannelMember(channelId: string, memberId: string, userId: string): Promise<void>;
    updateChannelMemberRole(channelId: string, memberId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<ProjectChannelMember>;
    markChannelAsRead(channelId: string, userId: string): Promise<void>;
    private getProjectMember;
    private getProjectMemberByProject;
}
//# sourceMappingURL=channel.service.d.ts.map