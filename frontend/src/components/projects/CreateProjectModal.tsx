import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderKanban, Hash, Mail, Plus, Trash2, X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateProject } from '@/hooks/useProjects';
import { useToast } from '@/components/common/Toast';
import {
  PROJECT_ROLE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_VISIBILITY_OPTIONS,
  ProjectRole,
  ProjectStatus,
  ProjectVisibility,
} from '@/features/projects/types/project.types';
import type { Project } from '@/types';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';

const visibilityValues = [
  ProjectVisibility.PRIVATE,
  ProjectVisibility.INTERNAL,
  ProjectVisibility.PUBLIC,
] as const;

const statusValues = [
  ProjectStatus.PLANNING,
  ProjectStatus.ACTIVE,
  ProjectStatus.ON_HOLD,
  ProjectStatus.COMPLETED,
  ProjectStatus.ARCHIVED,
] as const;

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  visibility: z.enum(visibilityValues),
  status: z.enum(statusValues),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be a valid hex value'),
  icon: z.string().max(4, 'Icon must be short').optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface PendingMemberDraft {
  id: string;
  email: string;
  role: ProjectRole;
}

interface CreateProjectModalProps {
  workspaceId?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

const ICON_OPTIONS = ['🚀', '✨', '📦', '🧠', '🎯', '⚡', '💬', '📣', '🛠️', '🧪'];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateDraftId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CreateProjectModal({ workspaceId, isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const { toast } = useToast();
  const createProject = useCreateProject();
  const { workspaceId: selectedWorkspaceId } = useWorkspaceContextStore();
  const [selectedIcon, setSelectedIcon] = useState('🚀');
  const [pendingMembers, setPendingMembers] = useState<PendingMemberDraft[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);

  const resolvedWorkspaceId = workspaceId || selectedWorkspaceId || '';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.PLANNING,
      color: '#6366f1',
      icon: '🚀',
    },
  });

  const projectName = watch('name');
  const selectedVisibility = watch('visibility');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedIcon('🚀');
      setPendingMembers([]);
      setInviteEmail('');
      setInviteRole(ProjectRole.DEVELOPER);
    }
  }, [isOpen, reset]);

  const addPendingMember = () => {
    const normalizedEmail = normalizeEmail(inviteEmail);

    if (!normalizedEmail) {
      toast.error('Enter an email address to invite');
      return;
    }

    const emailValidation = z.string().email().safeParse(normalizedEmail);
    if (!emailValidation.success) {
      toast.error('Enter a valid email address');
      return;
    }

    if (pendingMembers.some((member) => normalizeEmail(member.email) === normalizedEmail)) {
      toast.error('That email is already in the invite list');
      return;
    }

    setPendingMembers((current) => [
      ...current,
      {
        id: generateDraftId(),
        email: normalizedEmail,
        role: inviteRole,
      },
    ]);
    setInviteEmail('');
  };

  const removePendingMember = (id: string) => {
    setPendingMembers((current) => current.filter((member) => member.id !== id));
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    if (!resolvedWorkspaceId) {
      toast.error('Select a workspace before creating a project');
      return;
    }

    const response = await createProject.mutateAsync({
      ...data,
      workspace_id: resolvedWorkspaceId,
      icon: selectedIcon,
      members: pendingMembers.map(({ email, role }) => ({ email, role })),
    });

    if (response.data) {
      onCreated?.(response.data);
      reset();
      setPendingMembers([]);
      setInviteEmail('');
      setSelectedIcon('🚀');
      onClose();
    }
  };

  const memberCountLabel = useMemo(() => {
    return `${pendingMembers.length} pending invite${pendingMembers.length === 1 ? '' : 's'}`;
  }, [pendingMembers.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-elevation-lg backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-glass-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create Project</h2>
              <p className="text-sm text-muted-foreground">
                Create the project and invite teammates in one step
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-72px)] grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[1.25fr_0.95fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Name</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register('name')}
                  placeholder="Launch campaign"
                  className={cn(
                    'w-full rounded-lg border border-glass-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground',
                    'placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.name && 'border-danger'
                  )}
                />
              </div>
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="What is this project for?"
                className={cn(
                  'w-full resize-none rounded-lg border border-glass-border bg-background/50 px-4 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.description && 'border-danger'
                )}
              />
              {errors.description && (
                <p className="text-xs text-danger">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Visibility</label>
                <div className="grid gap-2">
                  {PROJECT_VISIBILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('visibility', option.value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left transition-all duration-fast',
                        selectedVisibility === option.value
                          ? 'border-primary bg-primary/15 text-foreground'
                          : 'border-glass-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs opacity-70">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="grid gap-2">
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('status', option.value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left transition-all duration-fast',
                        selectedStatus === option.value
                          ? 'border-primary bg-primary/15 text-foreground'
                          : 'border-glass-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    {...register('color')}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-glass-border bg-background/50 p-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    The project accent color
                  </span>
                </div>
                {errors.color && <p className="text-xs text-danger">{errors.color.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(icon);
                        setValue('icon', icon);
                      }}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all duration-fast',
                        selectedIcon === icon
                          ? 'border-primary bg-primary/15'
                          : 'border-glass-border bg-background/40 hover:border-primary/40'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-glass-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !resolvedWorkspaceId}
                className={cn(
                  'flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>

          <aside className="border-t border-glass-border bg-background/25 px-6 py-5 lg:border-l lg:border-t-0">
            <div className="space-y-6">
              <div className="rounded-xl border border-glass-border bg-background/50 p-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Invite teammates</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add emails now so members appear immediately after creation.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addPendingMember();
                          }
                        }}
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-glass-border bg-background/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Role
                    </label>
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

                  <button
                    type="button"
                    onClick={addPendingMember}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-glass-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Add email
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-glass-border bg-background/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Invite Preview</h3>
                  <span className="text-xs text-muted-foreground">{memberCountLabel}</span>
                </div>

                {pendingMembers.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {pendingMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-glass-border bg-background/40 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingMember(member.id)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Remove ${member.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-glass-border px-3 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No pending invites yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add teammates to prefill invitations.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-glass-border bg-primary/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Preview
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {projectName || 'Untitled project'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {PROJECT_VISIBILITY_OPTIONS.find((option) => option.value === selectedVisibility)?.label || 'Private'} ·{' '}
                  {PROJECT_STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'Planning'}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: watch('color') || '#6366f1' }}
                  >
                    {selectedIcon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Workspace project</p>
                    <p className="text-xs text-muted-foreground">
                      {resolvedWorkspaceId ? 'Will save to the selected workspace' : 'Select a workspace to continue'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
