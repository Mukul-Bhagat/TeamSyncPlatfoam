import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Calendar, Video, Clock, Link as LinkIcon, Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface ProjectMeetingsProps {
  projectId: string;
}

export function ProjectMeetings({ projectId }: ProjectMeetingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingProvider, setMeetingProvider] = useState('google_meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [agenda, setAgenda] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>(`/projects/${projectId}/meetings`);
      setMeetings(data || []);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [projectId]);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledStart) return;

    try {
      setScheduling(true);
      
      // Calculate end time
      const start = new Date(scheduledStart);
      const end = new Date(start.getTime() + parseInt(durationMinutes, 10) * 60 * 1000);

      // Generate mock link if custom not supplied and Zoom/Meet selected
      let link = meetingLink.trim();
      if (!link) {
        if (meetingProvider === 'google_meet') link = 'https://meet.google.com/abc-defg-hij';
        else if (meetingProvider === 'zoom') link = 'https://zoom.us/j/1234567890';
        else link = 'https://teamsync.chat/meet/room';
      }

      await api.post(`/projects/${projectId}/meetings`, {
        title: title.trim(),
        description: description.trim() || null,
        meeting_provider: meetingProvider,
        meeting_link: link,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        agenda: agenda.trim() || null,
      });

      toast.success('Meeting scheduled successfully!');
      setTitle('');
      setDescription('');
      setMeetingLink('');
      setScheduledStart('');
      setAgenda('');
      setShowScheduleModal(false);
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule meeting');
    } finally {
      setScheduling(false);
    }
  };

  const handleJoinMeeting = async (meetingId: string, link: string) => {
    try {
      await api.post(`/meetings/${meetingId}/join`, {});
      window.open(link, '_blank');
      fetchMeetings();
    } catch (err) {
      console.error('Failed to register join event:', err);
      window.open(link, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">Project Meetings</h2>
          <p className="text-sm text-muted-foreground">Schedule Zoom, Google Meet, or custom conference rooms.</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-fast"
        >
          <Plus className="h-4 w-4" /> Schedule Call
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => {
            const isLive = meeting.status === 'live';
            const isScheduled = meeting.status === 'scheduled';
            return (
              <div
                key={meeting.id}
                className={`p-6 bg-card/60 backdrop-blur-sm border rounded-xl flex flex-col justify-between gap-4 transition-all duration-fast ${
                  isLive ? 'border-primary shadow-soft-lg shadow-primary/5' : 'border-glass-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading font-semibold text-base text-foreground leading-tight">{meeting.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isLive ? 'bg-primary text-primary-foreground animate-pulse' :
                        isScheduled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{meeting.description || 'No description provided.'}</p>
                  
                  {meeting.agenda && (
                    <div className="text-xs mt-2 bg-background/30 p-2.5 rounded border border-glass-border/30">
                      <span className="font-semibold text-foreground flex items-center gap-1 mb-1">
                        <BookOpen className="h-3 w-3" /> Agenda
                      </span>
                      <p className="text-muted-foreground">{meeting.agenda}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(meeting.scheduled_start).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="capitalize">{meeting.meeting_provider.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  {meeting.meeting_link && (
                    <button
                      onClick={() => handleJoinMeeting(meeting.id, meeting.meeting_link)}
                      className={`flex-1 inline-flex justify-center items-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-fast ${
                        isLive || isScheduled ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                      disabled={!isLive && !isScheduled}
                    >
                      <Video className="h-4 w-4" /> Join Room
                    </button>
                  )}
                  {meeting.meeting_link && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meeting.meeting_link);
                        toast.success('Link copied to clipboard!');
                      }}
                      className="p-2.5 border border-glass-border rounded-lg bg-background hover:bg-muted text-muted-foreground transition-colors duration-fast"
                      title="Copy Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-glass-border rounded-xl">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Schedule your team calls and conference links here.</p>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleMeeting}
            className="bg-card border border-glass-border p-6 rounded-2xl max-w-md w-full space-y-4 shadow-elevation-xl animate-fade-in"
          >
            <h3 className="font-heading font-bold text-lg text-foreground">Schedule Meeting</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meeting Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kickoff, Retro, Review, etc."
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this call about?"
                rows={2}
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full bg-background/50 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-background/50 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Provider</label>
                <select
                  value={meetingProvider}
                  onChange={(e) => setMeetingProvider(e.target.value)}
                  className="w-full bg-background/50 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="custom">Custom Link</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custom link (Optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agenda</label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="1. Topic A, 2. Topic B, 3. Q&A"
                rows={2}
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-glass-border rounded-lg hover:bg-muted transition-colors duration-fast"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduling}
                className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-fast"
              >
                {scheduling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
