// Meeting Service
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  ProjectMeeting,
  MeetingParticipant,
  CreateMeetingDto,
  UpdateMeetingDto,
  PaginationParams,
  PaginatedResponse,
  MeetingProvider
} from '../types'

export class MeetingService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async getProjectMeetings(
    projectId: string,
    _userId: string,
    params?: PaginationParams & {
      status?: string
      upcoming?: boolean
    }
  ): Promise<PaginatedResponse<ProjectMeeting>> {
    const { page = 1, limit = 50, status, upcoming } = params || {}
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('project_meetings')
      .select('*, organizer:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('project_id', projectId)

    if (status) {
      query = query.eq('status', status)
    }

    if (upcoming) {
      query = query.gte('scheduled_start', new Date().toISOString())
    }

    const { data, error, count } = await query
      .order('scheduled_start', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch meetings: ${error.message}`)
    }

    // Add participant count
    const meetingsWithCounts = await Promise.all(
      (data || []).map(async (meeting) => {
        const { count: participantCount } = await this.supabase
          .from('project_meeting_participants')
          .select('*', { count: 'exact', head: true })
          .eq('meeting_id', meeting.id)

        return {
          ...meeting,
          participant_count: participantCount || 0
        }
      })
    )

    return {
      data: meetingsWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getMeetingById(meetingId: string, userId: string): Promise<ProjectMeeting> {
    const { data, error } = await this.supabase
      .from('project_meetings')
      .select('*, organizer:profiles(full_name, avatar_url)')
      .eq('id', meetingId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch meeting: ${error.message}`)
    }

    return data
  }

  async createMeeting(
    projectId: string,
    _userId: string,
    dto: CreateMeetingDto
  ): Promise<ProjectMeeting> {
    // Generate meeting link based on provider
    const provider = dto.meeting_provider || MeetingProvider.GOOGLE_MEET
    const meetingLink = await this.generateMeetingLink(provider)

    const { data, error } = await this.supabase
      .from('project_meetings')
      .insert({
        project_id: projectId,
        title: dto.title,
        description: dto.description,
        meeting_link: meetingLink.url,
        meeting_provider: dto.meeting_provider || MeetingProvider.GOOGLE_MEET,
        provider_meeting_id: meetingLink.id,
        status: 'scheduled',
        scheduled_start: dto.scheduled_start,
        scheduled_end: dto.scheduled_end,
        organizer_id: _userId,
        agenda: dto.agenda
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create meeting: ${error.message}`)
    }

    // Add organizer as participant
    await this.supabase.from('project_meeting_participants').insert({
      meeting_id: data.id,
      user_id: userId,
      status: 'accepted'
    })

    return data
  }

  async updateMeeting(
    meetingId: string,
    _userId: string,
    dto: UpdateMeetingDto
  ): Promise<ProjectMeeting> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_meetings')
      .update(dto)
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update meeting: ${error.message}`)
    }

    return data
  }

  async deleteMeeting(meetingId: string, _userId: string): Promise<void> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { error } = await this.supabase
      .from('project_meetings')
      .delete()
      .eq('id', meetingId)

    if (error) {
      throw new Error(`Failed to delete meeting: ${error.message}`)
    }
  }

  async startMeeting(meetingId: string, _userId: string): Promise<ProjectMeeting> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_meetings')
      .update({
        status: 'live',
        actual_start: new Date().toISOString()
      })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to start meeting: ${error.message}`)
    }

    return data
  }

  async endMeeting(meetingId: string, _userId: string): Promise<ProjectMeeting> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_meetings')
      .update({
        status: 'ended',
        actual_end: new Date().toISOString()
      })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to end meeting: ${error.message}`)
    }

    return data
  }

  async joinMeeting(meetingId: string, userId: string): Promise<{ meeting_link: string }> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    // Update participant status
    await this.supabase
      .from('project_meeting_participants')
      .update({
        status: 'joined',
        joined_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)

    return {
      meeting_link: meeting.meeting_link || ''
    }
  }

  async getMeetingParticipants(
    meetingId: string,
    _userId: string
  ): Promise<MeetingParticipant[]> {
    const { data, error } = await this.supabase
      .from('project_meeting_participants')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('meeting_id', meetingId)

    if (error) {
      throw new Error(`Failed to fetch participants: ${error.message}`)
    }

    return data || []
  }

  async addMeetingParticipant(
    meetingId: string,
    _userId: string,
    targetUserId: string
  ): Promise<MeetingParticipant> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_meeting_participants')
      .insert({
        meeting_id: meetingId,
        user_id: targetUserId,
        status: 'invited'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add participant: ${error.message}`)
    }

    return data
  }

  async removeMeetingParticipant(
    meetingId: string,
    participantId: string,
    _userId: string
  ): Promise<void> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { error } = await this.supabase
      .from('project_meeting_participants')
      .delete()
      .eq('id', participantId)

    if (error) {
      throw new Error(`Failed to remove participant: ${error.message}`)
    }
  }

  async updateMeetingNotes(
    meetingId: string,
    _userId: string,
    notes: string
  ): Promise<ProjectMeeting> {
    const meeting = await this.getMeetingById(meetingId, _userId)

    if (meeting.organizer_id !== userId) {
      throw new Error('Access denied')
    }

    const { data, error } = await this.supabase
      .from('project_meetings')
      .update({ notes })
      .eq('id', meetingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update meeting notes: ${error.message}`)
    }

    return data
  }

  async getUpcomingMeetings(projectId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('get_upcoming_meetings', {
      p_project_id: projectId,
      p_limit: limit
    })

    if (error) {
      throw new Error(`Failed to fetch upcoming meetings: ${error.message}`)
    }

    return data || []
  }

  private async generateMeetingLink(provider: MeetingProvider): Promise<{ url: string; id: string }> {
    switch (provider) {
      case MeetingProvider.GOOGLE_MEET:
        return this.generateGoogleMeetLink()
      case MeetingProvider.ZOOM:
        return this.generateZoomLink()
      case MeetingProvider.MICROSOFT_TEAMS:
        return this.generateTeamsLink()
      case MeetingProvider.JITSI:
        return this.generateJitsiLink()
      default:
        return this.generateGoogleMeetLink()
    }
  }

  private async generateGoogleMeetLink(): Promise<{ url: string; id: string }> {
    // Generate a unique meeting ID
    const meetingId = Math.random().toString(36).substring(2, 15)
    const url = `https://meet.google.com/${meetingId}`

    return { url, id: meetingId }
  }

  private async generateZoomLink(): Promise<{ url: string; id: string }> {
    // This would integrate with Zoom API
    // For now, return a placeholder
    const meetingId = Math.random().toString(36).substring(2, 15)
    const url = `https://zoom.us/j/${meetingId}`

    return { url, id: meetingId }
  }

  private async generateTeamsLink(): Promise<{ url: string; id: string }> {
    // This would integrate with Microsoft Teams API
    // For now, return a placeholder
    const meetingId = Math.random().toString(36).substring(2, 15)
    const url = `https://teams.microsoft.com/l/meetup-join/${meetingId}`

    return { url, id: meetingId }
  }

  private async generateJitsiLink(): Promise<{ url: string; id: string }> {
    const meetingId = Math.random().toString(36).substring(2, 15)
    const url = `https://meet.jit.si/${meetingId}`

    return { url, id: meetingId }
  }
}
