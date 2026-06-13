import { ProjectMeeting, MeetingParticipant, CreateMeetingDto, UpdateMeetingDto, PaginationParams, PaginatedResponse } from '../types';
export declare class MeetingService {
    private supabase;
    constructor();
    getProjectMeetings(projectId: string, _userId: string, params?: PaginationParams & {
        status?: string;
        upcoming?: boolean;
    }): Promise<PaginatedResponse<ProjectMeeting>>;
    getMeetingById(meetingId: string, userId: string): Promise<ProjectMeeting>;
    createMeeting(projectId: string, _userId: string, dto: CreateMeetingDto): Promise<ProjectMeeting>;
    updateMeeting(meetingId: string, _userId: string, dto: UpdateMeetingDto): Promise<ProjectMeeting>;
    deleteMeeting(meetingId: string, _userId: string): Promise<void>;
    startMeeting(meetingId: string, _userId: string): Promise<ProjectMeeting>;
    endMeeting(meetingId: string, _userId: string): Promise<ProjectMeeting>;
    joinMeeting(meetingId: string, userId: string): Promise<{
        meeting_link: string;
    }>;
    getMeetingParticipants(meetingId: string, _userId: string): Promise<MeetingParticipant[]>;
    addMeetingParticipant(meetingId: string, _userId: string, targetUserId: string): Promise<MeetingParticipant>;
    removeMeetingParticipant(meetingId: string, participantId: string, _userId: string): Promise<void>;
    updateMeetingNotes(meetingId: string, _userId: string, notes: string): Promise<ProjectMeeting>;
    getUpcomingMeetings(projectId: string, limit?: number): Promise<any[]>;
    private generateMeetingLink;
    private generateGoogleMeetLink;
    private generateZoomLink;
    private generateTeamsLink;
    private generateJitsiLink;
}
//# sourceMappingURL=meeting.service.d.ts.map