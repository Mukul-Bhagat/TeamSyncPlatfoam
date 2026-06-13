import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Layers, Filter, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

export function ProjectsPage() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const navigate = useNavigate();
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useProjects({ limit: 50, useContextDefaults: false });

  const projects = projectsData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Projects
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Project workspace
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create projects, add teammates, and jump straight into collaboration.
            </p>
          </div>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-glass-border bg-card/70 p-5 shadow-soft-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Projects</p>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-glass-border bg-card/70 p-5 shadow-soft-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Selected Workspace</p>
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">
              All accessible
            </p>
          </div>
          <div className="rounded-2xl border border-glass-border bg-card/70 p-5 shadow-soft-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Access model</p>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">Invite-only</p>
          </div>
          <div className="rounded-2xl border border-glass-border bg-card/70 p-5 shadow-soft-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">Live data</p>
          </div>
        </div>

        <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">All projects</h2>
              <p className="text-sm text-muted-foreground">
                Projects update immediately when created or edited.
              </p>
            </div>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-glass-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-xl border border-glass-border bg-background/40" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
                <p className="text-base font-medium text-foreground">Could not load projects</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'Please try again in a moment.'}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-glass-border px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FolderKanban className="h-6 w-6 text-primary" />
                </div>
                <p className="text-base font-medium text-foreground">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a project to start inviting teammates and tracking work.
                </p>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={cn(
                      'rounded-xl border border-glass-border bg-background/40 p-4 text-left',
                      'transition-all duration-fast hover:border-primary/40 hover:bg-primary/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        >
                          {project.icon || 'P'}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Private · {project.status}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Open
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                      {project.description || 'No description provided yet.'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(project) => navigate(`/projects/${project.id}`)}
      />
    </DashboardLayout>
  );
}
