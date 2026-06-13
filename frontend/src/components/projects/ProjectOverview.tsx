import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Calendar, FileText, CheckSquare, Clock, Plus, Trash2, ArrowRight } from 'lucide-react';

interface ProjectOverviewProps {
  projectId: string;
  onTabChange?: (tab: string) => void;
}

export function ProjectOverview({ projectId, onTabChange }: ProjectOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([
    { id: '1', title: 'Complete project collaboration roadmap', completed: true },
    { id: '2', title: 'Test Slack-like realtime chat integration', completed: false },
    { id: '3', title: 'Schedule kickoff call with team members', completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [timelineData, meetingsData, filesData] = await Promise.all([
          api.get<any[]>(`/projects/${projectId}/timeline`).catch(() => []),
          api.get<any[]>(`/projects/${projectId}/meetings`).catch(() => []),
          api.get<any[]>(`/projects/${projectId}/files`).catch(() => []),
        ]);

        setTimeline(timelineData || []);
        setMeetings(meetingsData || []);
        setFiles(filesData || []);
      } catch (err) {
        console.error('Failed to fetch project overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newTaskTitle.trim(), completed: false },
    ]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Tasks Completion</p>
          <p className="text-3xl font-bold mt-1 text-foreground">
            {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{completedTasksCount} of {tasks.length} tasks completed</p>
        </div>
        <div className="p-5 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Shared Files</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{files.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Images, PDFs and documents</p>
        </div>
        <div className="p-5 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Upcoming Meetings</p>
          <p className="text-3xl font-bold mt-1 text-foreground">
            {meetings.filter((m) => m.status === 'scheduled').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled calls</p>
        </div>
        <div className="p-5 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Events Registered</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{timeline.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Actions on this project</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Tasks and Meetings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open Tasks */}
          <div className="p-6 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" /> Open Tasks
              </h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {tasks.filter((t) => !t.completed).length} remaining
              </span>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new project task..."
                className="flex-1 bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all duration-fast"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-background/40 hover:bg-background/80 rounded-lg border border-glass-border/30 transition-colors duration-fast group"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-4 w-4 rounded border-glass-border bg-background text-primary focus:ring-ring cursor-pointer"
                      />
                      <span className={`text-sm text-foreground ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10 p-1.5 rounded transition-all duration-fast"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No tasks added yet.</p>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="p-6 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Upcoming Meetings
              </h3>
              {onTabChange && (
                <button
                  onClick={() => onTabChange('meetings')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  Schedule Meeting <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {meetings.filter((m) => m.status === 'scheduled').length > 0 ? (
                meetings
                  .filter((m) => m.status === 'scheduled')
                  .slice(0, 3)
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-4 bg-background/40 border border-glass-border/40 rounded-lg flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground text-sm">{meeting.title}</h4>
                        <p className="text-xs text-muted-foreground">{meeting.description || 'No description'}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(meeting.scheduled_start).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-medium uppercase">
                        {meeting.meeting_provider}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 bg-background/20 rounded-lg border border-dashed border-glass-border">
                  <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activity Feed & Recent Files */}
        <div className="space-y-6">
          {/* Recent Files */}
          <div className="p-6 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Recent Files
              </h3>
              {onTabChange && (
                <button
                  onClick={() => onTabChange('files')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  View Files <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {files.length > 0 ? (
                files.slice(0, 4).map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2.5 bg-background/30 hover:bg-background/80 border border-glass-border/20 rounded-lg transition-all duration-fast cursor-pointer"
                  >
                    <div className="h-9 w-9 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {file.file_type.split('/')[1]?.substring(0, 3) || 'doc'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No files uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 bg-card/60 backdrop-blur-sm border border-glass-border rounded-xl space-y-4">
            <h3 className="font-heading font-semibold text-lg text-foreground border-b border-glass-border pb-3">
              Project Timeline
            </h3>

            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex gap-3 text-xs">
                    <div className="relative flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      <div className="w-0.5 flex-1 bg-glass-border/50 my-1" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-muted-foreground text-[10px]">
                        {event.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
