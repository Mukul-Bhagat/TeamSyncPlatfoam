import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import { CreateProjectModal } from './CreateProjectModal';

interface ProjectSidebarProps {
  workspaceId?: string;
  currentProjectId?: string;
}

export function ProjectSidebar({ workspaceId, currentProjectId }: ProjectSidebarProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const navigate = useNavigate();
  const {
    workspaceId: selectedWorkspaceId,
    setWorkspaceId,
    setProjectId,
  } = useWorkspaceContextStore();

  const resolvedWorkspaceId = workspaceId || selectedWorkspaceId || undefined;
  const { data: projectResponse, isLoading } = useProjects({
    workspaceId: resolvedWorkspaceId,
    limit: 50,
  });

  const projects = projectResponse?.data || [];

  const handleProjectSelect = (projectId: string, projectWorkspaceId?: string) => {
    if (projectWorkspaceId) {
      setWorkspaceId(projectWorkspaceId);
    }
    setProjectId(projectId);
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Projects
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">{projects.length}</span>
      </div>

      <button
        onClick={() => setIsCreateProjectOpen(true)}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-3 py-2',
          'bg-glass border border-glass-border rounded-lg',
          'text-sm font-medium text-muted-foreground',
          'hover:text-foreground hover:border-primary/50',
          'transition-all duration-fast'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Create Project</span>
      </button>

      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-11 rounded-lg bg-glass border border-glass-border animate-pulse" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          projects.map((project) => {
            const isActive = currentProjectId === project.id;

            return (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id, project.workspace_id || resolvedWorkspaceId)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                  'border transition-all duration-fast',
                  isActive
                    ? 'bg-primary/20 border-primary/30 text-foreground'
                    : 'bg-glass border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                >
                  {project.icon || <FolderKanban className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{project.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs truncate text-muted-foreground">
                    {project.description || 'No description'}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-glass-border px-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create the first project for this workspace
            </p>
          </div>
        )}
      </div>

      <CreateProjectModal
        workspaceId={resolvedWorkspaceId}
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(project) => handleProjectSelect(project.id, project.workspace_id || resolvedWorkspaceId)}
      />
    </div>
  );
}
