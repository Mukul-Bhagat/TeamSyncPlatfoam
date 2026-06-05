import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  FolderKanban,
  Loader2,
  Mail,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { WorkspaceLayout } from '@/components/layouts/WorkspaceLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { ContextCard } from '@/components/panels/ContextCard';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { useToast } from '@/components/common/Toast';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/features/organization/hooks/useOrganizations';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspaces';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import {
  useDeleteProject,
  useInviteProjectMembers,
  useProject,
  useProjectAuditLogs,
  useProjectInvitations,
  useProjectMembers,
  useReactivateProjectMember,
  useRemoveProjectMember,
  useSuspendProjectMember,
  useTransferProjectOwnership,
  useUpdateProject,
  useUpdateProjectMemberRole,
} from '@/hooks/useProjects';
import {
  PROJECT_ROLE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_VISIBILITY_OPTIONS,
  ProjectMemberStatus,
  ProjectRole,
} from '@/features/projects/types/project.types';

type ProjectDraft = {
  name: string;
  description: string;
  visibility: 'private' | 'internal' | 'public';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  icon: string;
  color: string;
};

const defaultDraft: ProjectDraft = {
  name: '',
  description: '',
  visibility: 'private',
  status: 'planning',
  icon: '🚀',
  color: '#6366f1',
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateDraftId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setOrganizationId, setWorkspaceId, setProjectId } = useWorkspaceContextStore();

  const { data: project, isLoading: projectLoading, error } = useProject(projectId || '');
  const projectWorkspaceId = project?.workspace_id;
  const { data: workspace } = useWorkspace(project?.workspace_id || '');
  const { data: organization } = useOrganization(workspace?.organization_id || '');
  const currentOrganizationId = workspace?.organization_id;
  const currentWorkspaceId = workspace?.id || projectWorkspaceId;

  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId || '');
  const { data: invitations, isLoading: invitationsLoading } = useProjectInvitations(projectId || '');
  const { data: auditLogs, isLoading: auditLogsLoading } = useProjectAuditLogs(projectId || '');

  const updateProject = useUpdateProject();
  const inviteMembers = useInviteProjectMembers(projectId || '');
  const updateMemberRole = useUpdateProjectMemberRole(projectId || '');
  const suspendMember = useSuspendProjectMember(projectId || '');
  const reactivateMember = useReactivateProjectMember(projectId || '');
  const removeMember = useRemoveProjectMember(projectId || '');
  const transferOwnership = useTransferProjectOwnership(projectId || '');
  const deleteProject = useDeleteProject();

  const [draft, setDraft] = useState<ProjectDraft>(defaultDraft);
  const [projectError, setProjectError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; email: string; role: ProjectRole }>>([]);

  useEffect(() => {
    if (project) {
      setDraft({
        name: project.name,
        description: project.description || '',
        visibility: project.visibility || 'private',
        status: project.status,
        icon: project.icon || '🚀',
        color: project.color || '#6366f1',
      });
    }
  }, [project]);

  useEffect(() => {
    if (project?.workspace_id) {
      setWorkspaceId(project.workspace_id);
    }
    if (project?.id) {
      setProjectId(project.id);
    }
  }, [project, setProjectId, setWorkspaceId]);

  useEffect(() => {
    if (workspace?.organization_id) {
      setOrganizationId(workspace.organization_id);
    }
  }, [setOrganizationId, workspace]);

  const projectMembers = members || [];
  const projectInvitations = invitations || [];
  const projectAuditLogs = auditLogs || [];
  const memberCount = projectMembers.length;
  const activeCount = projectMembers.filter((member) => member.status === ProjectMemberStatus.ACTIVE).length;

  const addInviteDraft = () => {
    const email = normalizeEmail(inviteEmail);
    if (!email) {
      toast.error('Enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    if (pendingInvites.some((invite) => invite.email === email)) {
      toast.error('That email is already added');
      return;
    }

    setPendingInvites((current) => [
      ...current,
      { id: generateDraftId(), email, role: inviteRole },
    ]);
    setInviteEmail('');
  };

  const removeInviteDraft = (id: string) => {
    setPendingInvites((current) => current.filter((invite) => invite.id !== id));
  };

  const saveProject = async () => {
    if (!projectId) return;
    setProjectError('');

    if (!draft.name.trim()) {
      setProjectError('Project name is required');
      return;
    }

    await updateProject.mutateAsync({
      id: projectId,
      data: {
        name: draft.name.trim(),
        description: draft.description.trim(),
        visibility: draft.visibility,
        status: draft.status,
        icon: draft.icon.trim(),
        color: draft.color,
      },
    });
  };

  const sendInvites = async () => {
    if (!projectId || pendingInvites.length === 0) return;
    await inviteMembers.mutateAsync(
      pendingInvites.map((invite) => ({ email: invite.email, role: invite.role }))
    );
    setPendingInvites([]);
    setInviteEmail('');
  };

  const archiveProject = async () => {
    if (!projectId) return;
    await updateProject.mutateAsync({ id: projectId, data: { status: 'archived' } });
  };

  const deleteCurrentProject = async () => {
    if (!projectId) return;
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    await deleteProject.mutateAsync(projectId);
    navigate('/projects');
  };

  const rightPanelContent = (
    <div className="space-y-4">
      <ContextCard title="Project Context" icon={<FolderKanban />}>
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
            <p className="text-sm text-foreground">{workspace?.name || 'Loading workspace...'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Organization</p>
            <p className="text-sm text-foreground">{organization?.name || 'Loading organization...'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Members</p>
            <p className="text-sm text-foreground">{memberCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Invitations</p>
            <p className="text-sm text-foreground">{projectInvitations.length}</p>
          </div>
        </div>
      </ContextCard>

      <ContextCard title="Recent Activity" icon={<Zap />}>
        <ActivityFeed workspaceId={projectWorkspaceId} organizationId={workspace?.organization_id} limit={5} />
      </ContextCard>
    </div>
  );

  if (projectLoading) {
    return (
      <WorkspaceLayout
        currentOrganizationId={currentOrganizationId}
        currentWorkspaceId={currentWorkspaceId}
        rightPanelContent={rightPanelContent}
        rightPanelTitle="Context"
      >
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </WorkspaceLayout>
    );
  }

  if (error || !project) {
    return (
      <WorkspaceLayout
        currentOrganizationId={currentOrganizationId}
        currentWorkspaceId={currentWorkspaceId}
        rightPanelContent={rightPanelContent}
        rightPanelTitle="Context"
      >
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Project not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The project may have been removed or you may not have access.
            </p>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout
      currentOrganizationId={currentOrganizationId}
      currentWorkspaceId={currentWorkspaceId}
      rightPanelContent={rightPanelContent}
      rightPanelTitle="Context"
    >
      <Topbar
        title={project.name}
        breadcrumbs={[
          { label: organization?.name || 'Organization' },
          { label: workspace?.name || 'Workspace' },
          { label: project.name },
        ]}
      />

      <div className="space-y-6 p-6">
        <section className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-semibold text-white"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                >
                  {project.icon || '🚀'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {project.description || 'No project description yet.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  {project.visibility || 'private'}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {project.status}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {memberCount} members
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {activeCount} active
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={archiveProject}
                className="inline-flex items-center gap-2 rounded-lg border border-glass-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
              <button
                onClick={deleteCurrentProject}
                className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Project settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Update metadata, branding, and lifecycle status.
                  </p>
                </div>
                <button
                  onClick={saveProject}
                  disabled={updateProject.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    className={cn(
                      'w-full rounded-lg border border-glass-border bg-background/50 px-4 py-2.5 text-sm text-foreground',
                      'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                      projectError && 'border-danger'
                    )}
                  />
                  {projectError && <p className="text-xs text-danger">{projectError}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    className="w-full rounded-lg border border-glass-border bg-background/50 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Visibility</label>
                  <select
                    value={draft.visibility}
                    onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value as ProjectDraft['visibility'] }))}
                    className="w-full rounded-lg border border-glass-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PROJECT_VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={draft.status}
                    onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ProjectDraft['status'] }))}
                    className="w-full rounded-lg border border-glass-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Color</label>
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
                    className="h-11 w-20 cursor-pointer rounded-lg border border-glass-border bg-background/50 p-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Icon</label>
                  <input
                    value={draft.icon}
                    onChange={(event) => setDraft((current) => ({ ...current, icon: event.target.value }))}
                    className="w-full rounded-lg border border-glass-border bg-background/50 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Invite members</h2>
                  <p className="text-sm text-muted-foreground">
                    Add teammates by email and assign roles before sending invites.
                  </p>
                </div>
                <button
                  onClick={sendInvites}
                  disabled={pendingInvites.length === 0 || inviteMembers.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Send invites
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_auto]">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addInviteDraft();
                        }
                      }}
                      placeholder="name@company.com"
                      className="w-full rounded-lg border border-glass-border bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as ProjectRole)}
                    className="w-full rounded-lg border border-glass-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PROJECT_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addInviteDraft}
                    className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-glass-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {pendingInvites.length > 0 ? (
                  pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-glass-border bg-background/40 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{invite.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{invite.role}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInviteDraft(invite.id)}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-glass-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No pending invitations</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
              <div className="mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Members</h2>
              </div>

              <div className="space-y-3">
                {membersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : projectMembers.length > 0 ? (
                  projectMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border border-glass-border bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.profiles?.full_name || member.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              {member.status}
                            </span>
                            {member.role === ProjectRole.OWNER && (
                              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <select
                            value={member.role}
                            disabled={member.role === ProjectRole.OWNER}
                            onChange={(event) =>
                              updateMemberRole.mutate({
                                memberId: member.id,
                                role: event.target.value as ProjectRole,
                              })
                            }
                            className="rounded-lg border border-glass-border bg-background/50 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                          >
                            {PROJECT_ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {member.role !== ProjectRole.OWNER && (
                            <div className="flex flex-wrap justify-end gap-2">
                              {member.status === ProjectMemberStatus.SUSPENDED ? (
                                <button
                                  onClick={() => reactivateMember.mutate(member.id)}
                                  className="rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => suspendMember.mutate(member.id)}
                                  className="rounded-lg border border-glass-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Suspend
                                </button>
                              )}
                              <button
                                onClick={() => removeMember.mutate(member.id)}
                                className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          {member.role !== ProjectRole.OWNER && member.status === ProjectMemberStatus.ACTIVE && (
                            <button
                              onClick={() => transferOwnership.mutate({ memberId: member.id })}
                              className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              Transfer ownership
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-glass-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No project members yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
              <div className="mb-5 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Invitations</h2>
              </div>

              <div className="space-y-3">
                {invitationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : projectInvitations.length > 0 ? (
                  projectInvitations.map((invitation) => (
                    <div key={invitation.id} className="rounded-xl border border-glass-border bg-background/40 p-4">
                      <p className="text-sm font-medium text-foreground">{invitation.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {invitation.status}
                        </span>
                        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                          {invitation.role}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-glass-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No invitations yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-glass-border bg-card/70 p-6 shadow-soft-md">
              <div className="mb-5 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Audit log</h2>
              </div>

              <div className="space-y-3">
                {auditLogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : projectAuditLogs.length > 0 ? (
                  projectAuditLogs.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-glass-border bg-background/40 p-4">
                      <p className="text-sm font-medium text-foreground">{entry.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.actor_profile?.full_name || entry.actor_profile?.email || 'System'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-glass-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No audit events yet</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
